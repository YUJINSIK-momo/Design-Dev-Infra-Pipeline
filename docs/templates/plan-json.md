# plan.json 템플릿

모델(`/make-screens`)과 러너 스크립트 사이의 **유일한 약속**입니다. 모델은 이 파일을 쓰고 멈추고, 러너는 이 파일만 읽고 나머지를 합니다. 러너는 형식을 검사해 어긋나면 진행하지 않습니다. 아래는 새 프로젝트에서 출발점으로 쓰는 **예시 스키마**입니다.

```json
{
  "issue": 128,
  "mode": "처리",
  "summary": "VOC 관리 화면 1장 — 필터 · 목록 · 상세 3단",
  "screens": [
    {
      "key": "admin/voc",
      "title": "VOC 관리",
      "files": [
        "apps/sandbox/src/app/admin/voc/page.tsx",
        "apps/sandbox/src/app/admin/voc/page.test.tsx"
      ],
      "components": ["Select", "Table", "Badge", "Tabs", "Button", "PageHeader"],
      "checks": {
        "rules": { "violations": 0 },
        "tests": { "passed": 12, "failed": 0 },
        "visual": { "widths": [1440, 1024, 390], "h1": true, "horizontalOverflow": false }
      }
    }
  ],
  "registry": "apps/sandbox/src/screens.ts",
  "needsDecision": [
    "상태 변경을 즉시 반영(Select)으로 만들었다. 「저장」 버튼 방식이 맞으면 개선으로 알려 주세요."
  ],
  "notDone": []
}
```

| 필드 | 뜻 | 러너가 하는 검사 |
|---|---|---|
| `issue` · `mode` | 어떤 요청의 어떤 단계(처리 · 개선)인지 | 지금 처리 중인 issue 와 같은가 |
| `screens[].files` | 만든 파일 | 모두 화면 자리 안인가, 실제로 바뀌었나 |
| `screens[].checks` | 모델이 잰 결과 | PR 의 CI 가 같은 검사를 다시 돌린다 |
| `registry` | 화면 등록 파일 | 새 화면이 등록됐나 |
| `needsDecision` | 버린 갈래 · 사람이 정할 것 | 결과 카드 첫 줄에 그대로 |
| `notDone` | 하지 않은 것 | 비어 있지 않으면 카드에 표시 |

::: warning 모델의 보고를 믿지 않는다
`checks` 는 모델이 스스로 잰 값입니다. 러너는 PR 을 올린 뒤 CI 가 같은 검사를 다시 통과해야 머지하고, 배포된 화면 주소가 200 이어야 결과 카드를 올립니다. 검증 단계에서는 「보고와 실측이 같다」를 통과 조건으로 봤습니다.
:::
