# AWS 인프라 기본형

작은 공개 웹 서비스(web + api + 주기 수집)를 AWS 에 올릴 때 쓴 기본형입니다. 월 추정 약 $59(공유 DB 제외)로 운영합니다.

## 구조

```text
Route 53 → ALB (80→443, TLS 1.3) ─ /       → web  (ECS Fargate, 0.25 vCPU / 0.5 GB)
                                  └ /api/*  → api  (ECS Fargate) → 3306 → RDS (MariaDB)
                                                └ /api/chat/socket.io (WebSocket 전용)
EventBridge Scheduler → etl (Fargate 단발) → 외부 API → S3 원본 → DB upsert → CloudWatch 지표
```

## Terraform 을 두 묶음으로

| 묶음 | 내용 | 바뀌는 빈도 |
|---|---|---|
| `foundation` | ECR, GitHub OIDC provider, 배포 역할 | 거의 안 바뀜 — `prevent_destroy` |
| `service` | 네트워크 규칙, ALB, ECS, 비밀, S3, 알람, 스케줄, 메일, 예산 | 자주 |

- 상태는 S3 backend + DynamoDB 잠금, 묶음마다 따로.
- `terraform test`(mock provider)를 CI 에서 돌립니다. **실패해야 통과하는 시험**도 둡니다(예: OIDC provider 를 지우는 계획은 실패해야 한다).
- 보안그룹은 인라인 규칙을 쓰지 않고, 그룹마다 규칙 리소스 종류를 하나로 통일합니다.

## 쓴 서비스

| 서비스 | 하는 일 |
|---|---|
| ECS Fargate | web · api 상시(최소 100% · 최대 200% 무중단, 서킷 브레이커 롤백), etl · 마이그레이션 단발 |
| ECR | 저장소 3개, 불변 태그, push 시 스캔, 30개 보존 |
| ALB · ACM · Route 53 | 경로 규칙, TLS 1.3 정책, 잘못된 헤더 버림, 삭제 방지, 인증서 만료 알람 |
| S3 | 수집 원본 · 배포 기록, 사용자 보관함 — 퍼블릭 차단, 암호화, TLS 아닌 요청 거부 |
| Secrets Manager | 앱 비밀 하나에서 키별로 컨테이너에 주입. 값은 사람이 넣는다 |
| CloudWatch | 로그 30일, 오류 지표 필터, 알람 12개, 수집 성공 지표 |
| EventBridge · SNS · Amazon Q Developer in chat | 알람 → 한국어 요약 카드 → Slack |
| EventBridge Scheduler · SQS | 스케줄 4개, 실패 DLQ |
| SES | 인증 메일(DKIM · SPF · DMARC, 억제 목록) |
| Budgets | 태그 기준 월 예산 |
| IAM · OIDC | provider + 역할 6종(배포 · 작업 · 실행 · 스케줄러 · 알림 등) |

쓰지 않은 것: NAT(월 약 $44 절감), VPC 엔드포인트, CloudFront, KMS 고객 관리 키, WAF(아직).

## 보안 설계

### 배포 경로에 장기 키 없음

```hcl
# 신뢰 정책 — 요지
condition {
  test     = "StringEquals"
  variable = "token.actions.githubusercontent.com:aud"
  values   = ["sts.amazonaws.com"]
}
condition {
  test     = "StringEquals"            # StringLike 와일드카드 금지
  variable = "token.actions.githubusercontent.com:sub"
  values   = ["<불변 subject 형식>:ref:refs/heads/main"]
}
```

- GitHub secrets 에 AWS 키가 없습니다.
- `id-token: write` 는 deploy job 하나에만 두고, 워크플로 검사(actionlint 와 별도 스크립트)가 그 위치를 확인합니다.
- 세션 2시간 > job 상한 110분.

### 최소 권한

- **배포 역할**: 이미지 저장소 3개만, 이 서비스 family 의 task 정의만, 서비스 2개만, RunTask 는 api family · 이 클러스터만, PassRole 은 `iam:PassedToService` 조건, S3 는 배포 기록 경로만.
- **작업 · 실행 역할**: 신뢰 정책에 `aws:SourceAccount` · `aws:SourceArn`(혼동된 대리인 방지). 실행 역할은 비밀 하나만 읽고, etl 은 원본 경로와 자기 지표 네임스페이스만, api 는 보관함 경로와 `ses:FromAddress` 조건만.

### 네트워크 · 컨테이너

- 기본 egress 를 지우고 ALB 만 공개. 나가는 길은 443 과 DB 보안그룹 참조 3306 뿐, SSH 없음.
- 컨테이너는 root 가 아닌 사용자, 서드파티 Action 은 모두 커밋 SHA 로 고정.

### 앱 상한과 로그 위생

- 생성형 AI · 소켓 연결 · 메시지 · 검색 · 로그인마다 IP 별 · 전체 상한. IP 는 ALB 가 `X-Forwarded-For` 끝에 붙인 값만 믿습니다.
- 인증 없는 4xx(413 · 415 · 400)는 warn 으로만 남겨 **아무나 알람을 울리지 못하게** 합니다. 알림 카드에는 오류 내용을 싣지 않습니다.

## CI

| job | 하는 일 |
|---|---|
| check | 린트 · 타입 · 테스트 · 빌드 |
| infra | `terraform test` (+ 실패해야 통과하는 시험) |
| images | linux/amd64 이미지 빌드 |
| migrations | 운영과 같은 MariaDB 버전(다이제스트 고정) · 같은 앱 계정 권한으로 **실행 → 하나씩 끝까지 되돌리기 → 다시 실행** |
| workflows | actionlint · shellcheck, `id-token` 위치 검사 |

Actions 무료 분량이 바닥났을 때는 모든 job 의 `runs-on` 을 <span v-pre>`${{ vars.CI_RUNNER || 'ubuntu-24.04' }}`</span> 로 바꿔, 변수 하나로 사내 EKS 의 ARC 러너(ephemeral, 스팟)로 옮길 수 있게 했습니다. 변경 감지로 주 1,515분 → 600분으로 줄였습니다.

## 운영

- 무중단 확인: 새 대상 등록 → 옛 대상 해제 사이 약 1분 겹침, 정상 대상 0개 구간 없음.
- 배포 중 옛 web + 새 api 가 약 3분 함께 돕니다. 그래서 API 는 **「확장 → 축소」** 규칙을 따릅니다: 새 필드를 먼저 더하고, 옛 클라이언트가 사라진 뒤 지웁니다.
- AWS 에 무언가 만들기 **전에** 화면 캡처와 함께 변경 기록을 남기고, 결과 · 승인까지 채웁니다.
- 읽기 전용 관제 도구가 장기 키를 써야 한다면 예외로 기록하고 90일마다 바꿉니다.

## 남은 위험을 적어 두기

공유 DB 의 백업 · 암호화 설정처럼 이 서비스가 바꿀 수 없는 위험은 결정 기록에 「위험 `R<번호>`」으로 남기고, 누가 결정할지까지 적습니다. 하네스 문서는 「잘 된 것」만큼 「아직 없는 것」(WAF · CSP 등)을 분명히 씁니다.
