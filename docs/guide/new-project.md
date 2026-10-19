# 새 프로젝트에 적용하기

한 번에 전부 붙이지 않습니다. 세 단계 중 필요한 데까지만 가고, 각 단계마다 「됐다」를 확인할 기준을 둡니다.

| 단계 | 얻는 것 | 필요한 것 | 걸리는 시간(경험치) |
|---|---|---|---|
| **A. 디자인 시스템** | `@yuyu/*` 부품 · 토큰, 에이전트가 읽는 문서 | React 19 · Tailwind v4 앱 | 반나절 |
| **B. 플러그인** | 요구사항 → 화면 · 테스트 · 등록 파일을 만드는 명령 | A + Claude Code | 반나절 |
| **C. 러너** | Slack 요청 → 자동 처리 → 배포 → 승인 버튼 | B + Slack 앱 · 상시 켜 둔 Mac · 정적 배포처 | 하루 |

::: tip 어디까지 갈까
기획자가 직접 화면을 요청하는 팀이면 C 까지, 개발자만 쓰면 B 에서 멈춰도 충분합니다. 제품 쪽 리뷰 · 배포 자동화는 따로 [릴리스 하네스](./release-harness)를 봅니다.
:::

## A. 디자인 시스템 들이기

### 1. 패키지 가져오기

하네스 저장소의 `packages/yuyu-{ui,tokens,fonts}` 를 제품 저장소 `vendor/yuyu/` 로 복사하고, 복사한 커밋과 파일별 sha256 을 lock 파일에 남깁니다.

```bash
pnpm yuyu:sync <하네스 커밋 또는 브랜치>   # vendor/yuyu/* 갱신 + yuyu.lock.json 기록
pnpm yuyu:check                          # vendor 안을 손으로 고쳤으면 실패
```

레지스트리 대신 복사(vendoring)를 고른 이유는 셋입니다.

- 패키지가 빌드 산출물이 아니라 **TypeScript 원본을 그대로 export** 합니다.
- 하네스 저장소가 비공개라 git 의존성이나 사설 레지스트리는 배포 환경에 인증을 하나 더 요구합니다.
- 인프라가 정해지기 전에도 바로 쓸 수 있습니다. 레지스트리는 나중에 옮겨도 됩니다.

복사 스크립트 뼈대는 [기존 프로젝트에 붙이기](./existing-project#복사-스크립트)에 있습니다.

### 2. CSS 를 이 순서로

```css
/* app/globals.css */
@import "@yuyu/fonts/styles.css";
@import "tailwindcss";
@import "@yuyu/tokens/styles.css";
@import "@yuyu/ui/styles.css";
```

- `@yuyu/ui/styles.css` 의 `@source inline(...)` 줄을 지우지 마세요. Badge · Button 의 색 클래스가 거기서 만들어집니다.
- 다크 모드는 `<html class="dark">` 클래스 방식입니다.
- Next.js 는 원본 TS 를 받으므로 `transpilePackages: ["@yuyu/ui", "@yuyu/tokens", "@yuyu/fonts"]` 를 켭니다. Vite 는 그대로 됩니다.

### 3. 브랜드 색 주입 — 가장 자주 빠뜨리는 단계

토큰 CSS 에는 브랜드 색 **값이 들어 있지 않습니다**. `@yuyu/tokens` 의 `brandVariables(seed)` 가 seed 색 하나에서 `--brand-*` · `--brand-alpha-*` · `--brand-source` 와 모드별 `--yuyu-brand-light-*` · `--yuyu-brand-dark-*` 를 만들고, 앱이 그 값을 문서 루트에 얹습니다.

```tsx
import { useEffect } from "react"
import { brandVariables } from "@yuyu/tokens"

// 앱 최상단 컴포넌트에서 한 번. seed 를 비우면 DEFAULT_BRAND_SEED
useEffect(() => {
  const root = document.documentElement
  Object.entries(brandVariables()).forEach(([name, value]) => root.style.setProperty(name, value))
}, [])
```

그다음 **앱이** 아래 여덟 이름을 `:root` · `.dark` 에 정의해 모드별 주입값과 잇습니다. 토큰 패키지는 이 여덟에 Tailwind 색 별칭만 갖고 값은 갖지 않습니다. 주입 전 첫 화면과 주입 실패에 대비해 `--color-blue-*` 대체값을 붙입니다.

```css
:root {
  --yuyu-brand-foreground-primary: var(--yuyu-brand-light-foreground-primary, var(--color-blue-700));
  --yuyu-brand-foreground-secondary: var(--yuyu-brand-light-foreground-secondary, var(--color-blue-600));
  --yuyu-brand-background-primary: var(--yuyu-brand-light-background-primary, var(--color-blue-50));
  --yuyu-brand-background-secondary: var(--yuyu-brand-light-background-secondary, var(--color-blue-100));
  --yuyu-brand-background-bold-primary: var(--yuyu-brand-light-background-bold-primary, var(--color-blue-600));
  --yuyu-brand-border-primary: var(--yuyu-brand-light-border-primary, var(--color-blue-600));
  --yuyu-brand-border-secondary: var(--yuyu-brand-light-border-secondary, var(--color-blue-200));
  --yuyu-focus-ring: var(--yuyu-brand-light-focus-ring, var(--color-blue-500));
}
.dark {
  /* 같은 여덟 이름을 --yuyu-brand-dark-* 와 어두운 대체값으로 */
}
```

대체값의 단계 번호는 예시입니다. 토큰 패키지 테스트가 「값 없이 앱에 넘기는 이름은 brand 여덟뿐」인지 확인하므로, 새 이름이 생기면 테스트가 먼저 알려 줍니다.

::: warning 빌드는 초록인데 색만 빈다
브랜드 변수를 빠뜨려도 타입 · 빌드 · 테스트는 모두 통과합니다. 화면에서 버튼 배경과 Focus ring 이 투명하게 나올 뿐입니다. **A 단계의 완료 기준은 「눈으로 확인」** 입니다.
:::

### A 완료 기준

- [ ] Button(solid · brand) 배경이 브랜드 색으로 칠해진다
- [ ] Tab 키로 이동하면 Focus ring 이 보인다
- [ ] `.dark` 를 붙이면 바탕 · 글자 · 선이 모두 바뀐다
- [ ] `pnpm yuyu:check` 가 통과한다

## B. 플러그인 들이기

### 1. 설치

```text
/plugin marketplace add <하네스 저장소 경로 또는 URL>
/plugin install yuyu-harness@yuyu
```

플러그인 명령은 늘 이름공간이 붙습니다: `/yuyu-harness:generate-code`, `/yuyu-harness:review-design`.

### 2. 설정 세 값

| 키 | 뜻 | 기본값 |
|---|---|---|
| `screens_dir` | 생성 화면이 들어갈 폴더 | `apps/sandbox/src/app` |
| `docs_root` | 에이전트가 읽을 디자인 시스템 문서 | `docs/system` |
| `check_command` | 생성 후 돌릴 검사 | `pnpm --filter <화면 앱> build && pnpm --filter <화면 앱> test && pnpm check` |

### 3. 권한 조각 붙여 넣기

플러그인은 권한 규칙을 실어 나르지 못합니다. 제품 저장소의 `.claude/settings.json` 에 직접 넣어야 합니다 → [권한 규칙 템플릿](/templates/permissions).

### 4. 전제 조건

- `docs_root` 에 문서가 있을 것: 컴포넌트 표가 있는 `README.md`, `tokens.md`, `vocabulary.md`, `interaction.md`, `quality.md`, `ux-writing.md`, `components/*.md`
- `@yuyu/ui` 와 `typescript` 가 설치돼 있을 것(화면 규칙 검사기가 저장소의 typescript 로 AST 를 읽습니다)
- Node 22 이상, 빌드 산출물이 `.gitignore` 에 있을 것
- 작업 트리에 커밋하지 않은 변경이 없을 것 — 있으면 시작하지 않습니다

### 5. 첫 실행

```text
/yuyu-harness:generate-code 관리자 로그인 화면. 이메일 · 비밀번호 입력, 「로그인 상태 유지」 체크, 실패하면 입력 아래 오류 문구.
```

### B 완료 기준

- [ ] 마지막 줄이 「pull request 준비 완료」다
- [ ] 바뀐 파일이 정확히 세 개다: `page.tsx`, `page.test.tsx`, 화면 등록 파일
- [ ] `check_command` 와 화면 규칙 검사가 통과한다
- [ ] 보고서의 숫자(테스트 수 · 위반 수)가 직접 다시 잰 값과 같다

::: tip 모델을 고정하는 이유
세 스킬 모두 머리말에서 모델과 effort 를 고정합니다. 같은 요청이 같은 품질로 나와야 실패를 「요청 문제」와 「하네스 문제」로 나눌 수 있습니다.
:::

## C. 러너 들이기

러너는 정해진 신호에 맞춰 돌고, 모델에게는 화면 만들기 하나만 맡깁니다. 자세한 흐름은 [화면 요청 흐름](./screen-flow)을 봅니다.

### 1. Slack 앱

- Socket Mode 와 Interactivity 를 켭니다(공개 URL 이 필요 없음).
- 봇 토큰 · 앱 토큰은 저장소가 아니라 `~/.yuyu-harness/slack.env`(권한 0600)에 둡니다.
- Workflow Builder 로 「새 화면 / 화면 수정」 폼을 만들고, GitHub 커넥터로 issue 를 엽니다 → [화면 요청서 템플릿](/templates/screen-request).

### 2. 신뢰 사본

```bash
git clone <하네스 저장소> ~/.yuyu-harness/harness
cd ~/.yuyu-harness/harness && claude   # 신뢰 창을 한 번 수락해야 allow 규칙이 적용된다
```

러너는 사람이 일하는 clone 이 아니라 이 사본에서만 돕니다. 매 주기 `origin/dev` 로 맞추고, 도는 동안에는 손대지 않습니다. macOS 에서는 launchd 가 `~/Desktop` 같은 보호 폴더를 읽지 못하는 것도 이유입니다.

### 3. launchd 셋

| 라벨 | 하는 일 |
|---|---|
| `com.yuyu.harness.decisions` | 60초마다 새 요청 · 결정을 확인하고 러너를 부른다 |
| `com.yuyu.harness.slack` | Slack 다리 상주(KeepAlive) — 버튼 · 반응 · 스레드 사유를 GitHub 댓글로 옮긴다 |
| `com.yuyu.harness.caffeinate` | 처리 중 잠자기 방지 |

plist 에는 절대경로 대신 `__HOME__` 을 쓰고 설치할 때 바꿉니다.

### 4. 정적 배포와 자격 증명

- 화면 앱은 dev push 마다 정적 배포합니다(예: Cloudflare Pages). 토큰은 **Pages 편집 권한만** 준 저장소 secret 으로.
- 러너의 gh · git 은 그 Mac 의 로그인을 씁니다. `GITHUB_TOKEN` 으로 만든 머지는 다른 워크플로(검사 · 배포)를 깨우지 않기 때문입니다.

### C 완료 기준

- [ ] 폼 제출 → 1분 안에 issue 에 「받았습니다」 표시
- [ ] 15분 안에 Slack 결과 카드(머리 4줄 + 버튼)
- [ ] 👍 → dev → main 머지 · issue 닫힘, 👎 → 그 화면만 지우는 PR, 😕 + 사유 → 다시 만들기
- [ ] 다른 계정이 `승인합니다` 처럼 닮은 댓글을 달아도 따르지 않는다

## 체크리스트 한 장

| 순서 | 할 일 | 확인 |
|---|---|---|
| 1 | `vendor/yuyu` 복사 + lock | `pnpm yuyu:check` |
| 2 | CSS 순서 · 브랜드 주입 · 기본값 | 버튼 색 · Focus ring 눈으로 |
| 3 | `docs/system` 일곱 종류 | 컴포넌트 표가 실제 export 와 일치 (`pnpm docs:drift`) |
| 4 | 플러그인 설치 · 설정 · 권한 조각 | 첫 화면 「pull request 준비 완료」 |
| 5 | Slack 앱 · 폼 · 신뢰 사본 · launchd | 첫 요청 15분 안에 카드 |
| 6 | 정적 배포 · 토큰 범위 | 화면 주소 200 |
