# yuyu 디자인 시스템

에이전트가 화면을 만들 때 쓸 수 있는 것은 **`@yuyu/ui` 의 확정 컴포넌트와 `--yuyu-*` 토큰뿐**입니다. 그래서 디자인 시스템의 품질이 곧 생성 화면의 품질입니다.

## 패키지

| 패키지 | 내용 |
|---|---|
| `@yuyu/ui` | 확정 컴포넌트(버튼 · 입력 · 선택 · 표 · 탭 · 내비게이션 · 차트 · 메시지 등). Base UI 위에 yuyu 토큰을 입혔다 |
| `@yuyu/tokens` | 의미 토큰(9개 family), 컨트롤 높이 · 아이콘 크기 · 여백 · 반경, 브랜드 seed → 팔레트 생성 함수 |
| `@yuyu/fonts` | 한국어 · 영어 · 일본어 글꼴 묶음 |

의존성: `@base-ui/react`, `class-variance-authority`, `clsx`, `tailwind-merge`, 아이콘 라이브러리 하나, 차트에만 `recharts`, 달력에만 `react-day-picker` + `date-fns`. React 19 이상, Tailwind v4(설정 파일 없는 CSS 방식).

## 토큰 이름 규칙

```text
--yuyu-<family>-<역할>[-<단계>]       예) --yuyu-foreground-primary, --yuyu-border-secondary
--color-yuyu-*                        @theme inline 이 Tailwind 색으로 잇는 별칭 → text-yuyu-*, bg-yuyu-*
--radius-yuyu-control                 컨트롤 반경
--spacing-yuyu-control-<크기>          컨트롤 높이 → h-yuyu-control-md
--text-yuyu-label                     라벨 글자 크기
.yuyu-hover-layer                     눌림 · 올림 상태를 겹 하나로 그리는 유틸리티
```

- 화면 코드는 **hex 나 Tailwind 기본 팔레트 색(`blue-500`)을 직접 쓰지 않습니다.** 화면 규칙 검사기가 막습니다.
- 브랜드만 예외로 런타임에 주입합니다 → [새 프로젝트 A 단계 3번](./new-project#a-디자인-시스템-들이기).
- 다크 모드는 `.dark` 클래스, 테마는 light · dark 두 가지입니다.
- 범주 색(`--yuyu-categorical-1…`)은 뜻이 없는 유일한 family 입니다. 「서로 다르다」만 말하고 「중요하다」는 말하지 않습니다.

## 에이전트가 읽는 문서 — `docs/system/`

이 폴더의 1차 독자는 사람이 아니라 **Sonnet 급 에이전트**입니다. 그래서 모든 문서를 같은 틀로 씁니다.

| 문서 | 내용 |
|---|---|
| `README.md` | 이 문서의 독자, **컴포넌트 표(정본)** — 표에 없는 컴포넌트는 없는 것이다 |
| `tokens.md` | 토큰 family 와 앱에 들이는 법 |
| `vocabulary.md` | 화면에서 쓰는 낱말(「삭제」 vs 「지우기」 같은 선택) |
| `interaction.md` | 클릭 · 포커스 · 키보드 · 즉시 반영 여부 |
| `quality.md` | 품질 기준과 import 경계 |
| `ux-writing.md` | 문구 규칙 |
| `components/<이름>.md` | 컴포넌트마다 한 장 |

컴포넌트 문서 한 장의 틀:

1. **역할과 경계** — 언제 쓰고 언제 쓰지 않는지(예: Switch 는 즉시 반영될 때만, 제출이 필요하면 Checkbox)
2. **Anatomy** — 부분 이름(`data-slot="<컴포넌트>-<부분>"`)
3. **Properties** — 코드의 prop 이름과 값을 **문자열 그대로**
4. **State** — 기본 · 올림 · 눌림 · 포커스 · 비활성 · 오류
5. **Guidelines** — 하지 말 것 포함
6. **현재 정의하지 않은 항목** — 에이전트가 지어내지 않도록 「없다」를 적는다

::: tip 문서가 거짓말하지 않게
`pnpm docs:drift` 가 문서와 코드를 짝지어(컴포넌트 표 ↔ export, Properties ↔ 실제 prop, 토큰 목록 ↔ CSS 등) 비교해 `=` 일치 · `⚠` 어긋남 · `?` 판단 불가로 보고합니다. 평소엔 막지 않고 표시만 하며, `--strict` 를 주면 CI 를 막습니다.
:::

## 새 컴포넌트 만들기

1. **shadcn/ui 에서 출발**합니다(MIT, 고지 유지). 바닥부터 짓지 않습니다.
2. Radix 대신 **Base UI** 로, 색 · 크기 · 반경을 **yuyu 토큰**으로 바꿉니다(정규화).
3. 다섯 자리를 채워야 「확정」입니다.

| 자리 | 파일 |
|---|---|
| 코드 | `packages/yuyu-ui/src/<이름>.tsx` + `index.ts` export |
| 테스트 | `<이름>.test.tsx` |
| 문서 | `docs/system/components/<이름>.md` + README 컴포넌트 표 |
| 견본 | Studio 문서 · Playground |
| 생성 화면 카탈로그 | 화면 규칙 검사기가 아는 부품 목록 |

4. 확정 전 후보는 「초안 컴포넌트」로 두고, 화면 규칙 검사기가 생성 화면에서 쓰지 못하게 막습니다.

## Storybook 대신 Studio + llms.txt

처음엔 Storybook 과 Storybook MCP 를 계획했지만 뺐습니다. Studio 가 이미 Playground 와 문서를 갖고 있었고, 에이전트에게 필요한 것은 실행 중인 서버가 아니라 **한 장짜리 색인**이었습니다. Studio 빌드가 `llms.txt` 와 공개 허용 목록에 든 문서 원본을 함께 배포합니다.
