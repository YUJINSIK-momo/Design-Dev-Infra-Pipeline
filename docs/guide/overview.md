# 하네스 한눈에 보기

**하네스(harness)** 는 AI 에이전트가 일하는 작업 환경입니다. 프롬프트 한 줄이 아니라 지시문 · 명령 · 스크립트 · 권한 · 검증 · 러너를 묶어서, 에이전트가 틀릴 수 없는 길을 깔고 사람이 결정해야 할 자리를 분명히 합니다.

이 문서는 실제로 운영 중인 두 하네스를 새 프로젝트에 다시 쓸 수 있게 일반화한 것입니다.

| 하네스 | 맡는 구간 | 시작 신호 | 끝 |
|---|---|---|---|
| **디자인 시스템 하네스** | 요청 → 화면 생성 → 승인 | 기획자가 Slack 폼으로 쓴 화면 요청(GitHub issue) | 기획자가 배포된 화면을 보고 승인 버튼 |
| **릴리스 하네스** | 리뷰 → 결정 → 배포 | 개발자가 연 develop → main pull request | 사람이 발행한 GitHub 릴리스 태그로 운영 배포 |

## 전체 흐름

```text
기획자 ── Slack 폼 ──▶ GitHub issue (요청서 원본)
                          │  60초마다 감시 (launchd · 신뢰 사본)
                          ▼
                 에이전트: /make-screens ──▶ plan.json  ← 모델은 여기서 멈춤
                          │
                 스크립트: 가지 · 커밋 · PR · CI · 머지 · 배포 확인 · 결과 카드
                          ▼
기획자 ◀── Slack 카드 [👍 승인] [👎 반려] [😕 개선]          ← 사람 결정
                          │ 승인
                          ▼
개발자 ── develop → main PR ──▶ Codex 리뷰(읽기 전용) ──▶ Slack [수정 후 머지] [그대로 머지]   ← 사람 결정
                          │
                          ▼
사람 ── GitHub 릴리스(태그) 발행 ──▶ 검사 ──▶ 마이그레이션 → api → web → 스모크   ← 사람 결정
```

## 네 가지 원칙

1. **모델은 판단만, 반복은 스크립트가.** 결과가 늘 같아야 하는 일(변환 · 검증 · 업로드 · 머지)을 모델이 운전하게 두지 않습니다. 실제로 처리 실패 9번이 모두 「모델이 운전하던 주변」에서 났고, 화면 생성 자체는 한 번도 실패하지 않았습니다.
2. **되돌리기 어려운 일은 사람이 누른다.** 인프라 반영 · 운영 배포 · 마이그레이션 · 권한 변경은 에이전트가 실행할 수 없게 막아 둡니다.
3. **권한은 좁게, 예외는 기록으로.** 배포는 임시 자격 증명으로, 읽기만 필요한 도구엔 읽기 전용 권한만. 피할 수 없는 장기 키는 예외로 적고 교체 주기를 정합니다.
4. **기록이 정본이 되게.** 규칙 · 결정 · 절차는 저장소 문서에 둡니다. 문서와 코드가 어긋나면 검사가 잡습니다.

## 여섯 부품

| 부품 | 하는 일 | 예 |
|---|---|---|
| 지시문 | 에이전트가 매번 처음 읽는 규칙 | `AGENTS.md`, `CLAUDE.md`, `docs/system/` |
| 명령 · 스킬 | 자주 하는 일을 이름 붙은 절차로 | `/make-screens`, `/yuyu-harness:generate-code` |
| 스크립트 | 늘 같아야 하는 변환 · 검증 · 업로드 | `scripts/harness/*.mjs`, `pnpm docs:drift` |
| 권한 | 막을 것 · 물을 것 · 허용할 것 | `.claude/settings.json` |
| 검증 | 사람보다 기계가 먼저 본다 | 화면 규칙 AST 검사, 마이그레이션 up/down/up |
| 러너 · 사람 결정 | 신호에 맞춰 돌고, 결정 순간에만 사람을 부른다 | launchd 감시자, Slack Socket Mode, GitHub 릴리스 |

## 저장소 지도

하네스를 담는 저장소(이하 **하네스 저장소**)와, 그것을 가져다 쓰는 **제품 저장소**를 나눕니다.

```text
하네스 저장소
├─ packages/
│  ├─ yuyu-ui/        @yuyu/ui      — 확정 컴포넌트 (Base UI + yuyu 토큰)
│  ├─ yuyu-tokens/    @yuyu/tokens  — --yuyu-* 의미 토큰, 브랜드 seed → 팔레트
│  └─ yuyu-fonts/     @yuyu/fonts   — 한 · 영 · 일 글꼴
├─ docs/system/       에이전트가 읽는 디자인 시스템 문서 (정본)
├─ apps/
│  ├─ studio/         컴포넌트 문서 · Playground · llms.txt (Storybook 대신)
│  └─ sandbox/        생성된 화면이 쌓이는 곳 (정적 배포)
├─ plugins/yuyu-harness/   Claude Code 플러그인 — generate-code · review-design · 화면 규칙 검사기
├─ .claude/skills/make-screens/   러너가 부르는 최상위 스킬
├─ scripts/
│  ├─ harness/        러너 · 결정 판독 · 배포 확인 · Slack 카드 · Slack 다리
│  ├─ docs/           문서 ↔ 코드 drift 측정
│  └─ visual/         폭별 캡처 · 측정 (Chrome DevTools Protocol)
└─ .claude/settings.json   공유 권한 규칙

제품 저장소
├─ vendor/yuyu/       하네스 저장소 packages 를 lock(sha256)과 함께 복사
├─ apps/{web,api,etl} · packages/db · infra/terraform/{foundation,service}
├─ .claude/skills/    /port-screen · /api-feature · /infra-change · /release · /etl-rerun
└─ scripts/release/   릴리스 러너 (Codex 리뷰 · Slack 결정)
```

## 어디서부터 읽나

- 새로 시작한다면 → [새 프로젝트에 적용하기](./new-project)
- 이미 코드가 있다면 → [기존 프로젝트에 붙이기](./existing-project)
- 권한 규칙부터 베끼고 싶다면 → [권한 규칙 템플릿](/templates/permissions)
