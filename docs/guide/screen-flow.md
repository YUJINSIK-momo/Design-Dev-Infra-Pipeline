# 화면 요청 흐름

기획자가 폼을 낸 순간부터 승인 버튼을 누를 때까지 무슨 일이 어디서 일어나는지 순서대로 적습니다. 실측 기준 처리 11~15분, 승인 · 반려 반영 약 6분, 개선 약 12분입니다.

## 1. 요청 — 기획자

Slack 의 Workflow Builder 폼(「새 화면」 / 「화면 수정」)을 내면 GitHub 커넥터가 issue `화면 요청: <제목>` 을 엽니다. **요청서의 원본은 issue 본문**입니다. Slack 메시지는 알림일 뿐입니다. → [화면 요청서 템플릿](/templates/screen-request)

## 2. 감시 — launchd

60초마다 감시 스크립트가 돌아 새 요청과 새 결정을 찾습니다. 찾으면 신뢰 사본을 `origin/dev` 로 맞추고 러너를 부릅니다.

```text
launchd (60s) → watch-tick.sh → watch-decisions.mjs → local-run.mjs → runner.mjs 처리 <issue 번호>
```

## 3. 생성 — 에이전트

러너가 모델을 부르는 방식은 하나로 고정돼 있습니다.

```bash
claude -p "/make-screens <n> 러너" \
  --model <고정 모델> --effort high \
  --permission-mode acceptEdits \
  --plugin-dir plugins/yuyu-harness \
  --allowedTools <세 스킬 머리말 allowed-tools 의 합집합>
```

`/make-screens` 가 하는 일:

1. 요청을 화면 몇 장으로 나눕니다. 뜻이 갈리면 **묻지 않고 가장 그럴듯한 해석으로 만든 뒤**, 버린 갈래를 `needsDecision` 첫 줄에 남깁니다. 「묻기」는 사람을 기다리게 하지만 「만들어 보여 주기」는 바로 판단하게 합니다.
2. 화면마다 `/yuyu-harness:generate-code` — 문서 읽기 → 부품 매핑표 → 세 파일 → 화면 규칙 검사 → 15개 항목 자가 검수.
3. 화면 앱을 정적 빌드하고 1440 · 1024 · 390 폭에서 캡처해, 제목(`h1`) 유무와 가로 넘침을 재고 그림을 대조합니다.
4. `.harness-work/issue-<n>/plan.json` 을 쓰고 **멈춥니다.** → [plan.json 템플릿](/templates/plan-json)

## 4. 나머지 — 스크립트

| 순서 | 스크립트 | 하는 일 |
|---|---|---|
| 1 | `plan.mjs` | plan.json 형식 검사, PR 본문 생성 |
| 2 | `runner.mjs` | 바뀐 파일이 화면 자리 · 등록 파일뿐인지 확인(커밋 전) |
| 3 | `runner.mjs` | 가지 · 커밋 · push · `gh pr create --base dev` |
| 4 | `runner.mjs` | PR 파일 목록으로 경계 재확인 → Quality 대기 → squash 머지 |
| 5 | `deploy-check.mjs` | 배포 워크플로 완료 + 화면 주소 200 확인. 실패하면 승인을 묻지 않는다 |
| 6 | `post-result.mjs` | issue 에 결과 댓글 한 장 |
| 7 | `slack-card.mjs` | 결과 채널에 카드: 머리 4줄 + 👍 👎 😕 |

## 5. 결정 — 기획자

`slack-bridge.mjs` 가 Socket Mode 로 상주하며 버튼 · 반응 · 스레드에 적은 사유를 GitHub 댓글 `승인` · `반려: <사유>` · `개선: <사유>` 로 옮깁니다. 누른 사람과 Slack 링크가 함께 붙습니다. **결정의 원본은 GitHub 댓글**이고 Slack 은 입력 창구입니다.

다음 주기에 `decision.mjs` 가 판독하면:

| 결정 | 러너가 하는 일 | 모델 |
|---|---|---|
| <span class="human">승인</span> | dev → main PR 생성 · 머지 · issue 닫기 | 부르지 않음 |
| <span class="human">반려</span> | 그 화면 폴더와 등록 줄을 지우는 PR 을 dev 에 (git revert 아님) | 부르지 않음 |
| <span class="human">개선</span> | 사유를 붙여 `/make-screens <n> 개선` 다시 실행 (최대 3회) | 부름 |

판독 규칙:

- 꼴을 좁게 봅니다. 「승인합니다」 같은 닮은꼴이 유효한 신호보다 늦게 오면 따르지 않고 멈춥니다.
- 사유 없는 반려 · 개선은 시작하지 않습니다. 반려는 Slack 에서 한 번 더 확인합니다.
- 같은 결정은 한 번만 처리합니다 — 처리 **전에** 열쇠를 기록합니다.
- dev 에 승인 안 된 화면이 섞여 있으면 dev → main PR 을 만들지 않습니다. main 에는 승인된 요청만 들어갑니다.

## 화면 앱에서 보이는 것

생성 화면 위에는 공통 막대가 붙습니다.

- **보기 폭** — 데스크톱 · 태블릿 · 모바일 액자(iframe)
- **요청 보기** — 이 화면을 만든 요청서 원문
- **컴포넌트 보기** — 쓴 부품마다 테두리와 이름표, 「쓴 컴포넌트 N종 · M곳」, Studio 문서 링크

기획자는 이 막대로 「요청대로 됐나」와 「디자인 시스템 부품으로 됐나」를 같이 봅니다.
