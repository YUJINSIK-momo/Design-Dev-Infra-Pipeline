# 명령 · 스크립트

## 슬래시 명령

### 하네스 저장소

| 명령 | 누가 · 언제 | 하는 일 | 멈추는 곳 |
|---|---|---|---|
| `/make-screens <n> [개선] [러너]` | 러너가 issue 마다 | 요청을 화면으로 나누고 화면마다 generate-code, 캡처 검수, `plan.json` | `plan.json` (git · gh 쓰기 없음) |
| `/yuyu-harness:generate-code` | 개발자 직접 또는 make-screens 안에서 | 요구사항 → `page.tsx` · `page.test.tsx` · 등록 파일 | 「pull request 준비 완료」 |
| `/yuyu-harness:review-design` | 생성 후 | 15개 항목 위반 목록 | 보고만 (고치지 않음) |

세 명령 모두 머리말에서 모델 · effort 를 고정하고, 러너가 같은 값을 넘기는지 테스트가 확인합니다.

### 제품 저장소

| 명령 | 하는 일 | 멈추는 곳 |
|---|---|---|
| `/port-screen <샌드박스 주소>` | 샌드박스 원본 소스를 찾아 제품으로 이식 | PR |
| `/api-feature` | 엔터티 · 마이그레이션 → API → 테스트 | PR |
| `/infra-change` | Terraform 수정 → plan 요약 → 변경 기록 초안 | apply 전 (사람) |
| `/release` | 태그 배포 진행 관찰 · 보고 | 관찰만 |
| `/etl-rerun` | 재수집 명령 생성 | 실행 전 (사람) |

## pnpm 스크립트

| 명령 | 하는 일 |
|---|---|
| `pnpm check` | lint → typecheck → test → build (모든 앱 · 패키지) |
| `pnpm docs:drift [--strict]` | 디자인 시스템 문서 ↔ 코드 대조(`=` · `⚠` · `?`) |
| `pnpm visual <url> [--serve]` | 1440 · 1024 · 390 폭 캡처, 제목 · 가로 넘침 측정, 클릭 · 테마 전환 |
| `pnpm yuyu:sync [ref]` | (제품) 하네스 패키지 복사 + lock 기록 |
| `pnpm yuyu:check` | (제품) vendor 손 편집 감지 |

## 러너 스크립트 (`scripts/harness/`)

| 파일 | 역할 |
|---|---|
| `watch-tick.sh` · `watch-decisions.mjs` | launchd 가 60초마다 부르는 감시 |
| `local-run.mjs` | 신뢰 사본을 `origin/dev` 로 맞추고 러너 실행 |
| `runner.mjs` | 처리 · 결정 · 결과의 운전대 |
| `issue.mjs` | issue 본문 파싱, 화면 주소 → 키 |
| `plan.mjs` | plan 검증, PR 본문, 반려 시 화면 제거 |
| `decision.mjs` · `decide.mjs` | 결정 판독(GET 만) · 승인/반려 규칙 |
| `deploy-check.mjs` | 배포 완료 + 화면 주소 200 |
| `post-result.mjs` · `result-comment.mjs` | issue 결과 댓글 |
| `slack-card.mjs` · `slack-bridge.mjs` | 결과 카드 · Socket Mode 다리 |
| `estimate.mjs` · `slow-notice.mjs` | 예상 시간 · 지연 알림 |
| `fixtures/` | 실제 issue 꼴을 본뜬 테스트 입력 |

## 화면 규칙 검사기 (`plugins/yuyu-harness/lib/`)

설치한 저장소의 typescript 로 AST 를 읽어 판정합니다.

| 규칙 | 막는 것 |
|---|---|
| primitive 색 | hex · Tailwind 기본 팔레트 직접 사용 |
| 토큰 꼴 | 다른 디자인 시스템의 토큰 이름 |
| 부품 재사용 | `@yuyu/ui` 에 있는 것을 다시 만드는 것 |
| Focus | 포커스 표시 제거 |
| 글자 크기 | 정해진 단계 밖 크기 |
| import 경계 | 다른 화면 · 내부 경로 import |
| 아이콘 | 정해진 아이콘 라이브러리 밖 |
| 초안 컴포넌트 | 확정 전 후보 사용 |
| 머리말 · 테스트 이름 | 형식 위반 |
