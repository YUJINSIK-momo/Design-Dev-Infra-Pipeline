# Design · Dev · Infra Pipeline

**문서 사이트: https://yujinsik-momo.github.io/Design-Dev-Infra-Pipeline/**

기획자의 화면 요청이 코드 · 테스트 · 배포를 거쳐 승인 버튼으로 끝나고, 개발자의 릴리스가 GPT 리뷰 · Slack 결정 · 태그 배포로 이어지는 **AI 하네스**를 새 프로젝트에 다시 쓰기 위한 설명서입니다. 사내에서 운영 중인 하네스를 일반화해 새로 정리했고, 디자인 시스템 이름은 모두 `yuyu`(`@yuyu/ui`, `--yuyu-*`)로 씁니다.

## 무엇이 있나

| 문서 | 내용 |
|---|---|
| [하네스 한눈에 보기](docs/guide/overview.md) | 두 하네스, 네 원칙, 여섯 부품, 저장소 지도 |
| [새 프로젝트에 적용하기](docs/guide/new-project.md) | A 디자인 시스템 → B 플러그인 → C 러너, 단계별 완료 기준 |
| [기존 프로젝트에 붙이기](docs/guide/existing-project.md) | vendoring · `/port-screen` · 제품 쪽 스킬 |
| [yuyu 디자인 시스템](docs/guide/design-system.md) | 토큰 이름 규칙, 에이전트가 읽는 문서 틀, 새 컴포넌트 다섯 자리 |
| [화면 요청 흐름](docs/guide/screen-flow.md) | Slack 폼 → issue → `/make-screens` → `plan.json` → 스크립트 → 승인 |
| [권한과 안전장치](docs/guide/security.md) | 브랜치 보호 없이 막는 법, 실제로 막힌 구멍들 |
| [릴리스 하네스](docs/guide/release-harness.md) | Codex 리뷰 · Slack 결정 · 태그 배포 검사 |
| [AWS 인프라 기본형](docs/guide/aws.md) | Terraform 두 묶음, OIDC, 최소 권한, CI |
| [운영 교훈](docs/guide/operations.md) | 증상 → 원인 → 대처 |
| [템플릿](docs/templates/index.md) | AGENTS.md · 권한 규칙 · 화면 요청서 · plan.json · 결정 기록 |

## 로컬에서 보기

```bash
npm ci
npm run docs:dev     # http://localhost:5173/Design-Dev-Infra-Pipeline/
npm run check        # 이름 규칙 · 공개 금지 식별자 · 깨진 링크 검사 + 빌드
```

`main` 에 push 하면 GitHub Actions 가 검사를 통과한 경우에만 GitHub Pages 로 배포합니다.

## 관련

- 포트폴리오: https://yujinsik-momo.github.io/Backend-Developer-Portfolio/ — [디자인 시스템 하네스 사례](https://yujinsik-momo.github.io/Backend-Developer-Portfolio/work/design-harness) · [AI · AX](https://yujinsik-momo.github.io/Backend-Developer-Portfolio/ax)
