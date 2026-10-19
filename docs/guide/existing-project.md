# 기존 프로젝트에 붙이기

이미 코드와 배포가 있는 제품 저장소에 하네스를 붙일 때는 **디자인 시스템 복사 → 화면 이식 명령 → 제품 쪽 스킬 → 릴리스 하네스** 순으로 하나씩 올립니다. 한 번에 하나만 바꾸고, 바꿀 때마다 기존 검사가 그대로 초록인지 확인합니다.

## 1. 디자인 시스템 복사

### 복사 스크립트

하네스 저장소의 패키지를 `vendor/yuyu/*` 로 복사하고, 어디서 언제 가져왔는지와 파일별 해시를 남깁니다. 테스트 파일은 빼고 가져옵니다.

```js
// scripts/sync-yuyu.mjs — 뼈대
// 사용: pnpm yuyu:sync [ref]   검사: pnpm yuyu:check
import { createHash } from "node:crypto"
import { cpSync, readFileSync, writeFileSync } from "node:fs"
import { execFileSync } from "node:child_process"

const ref = process.argv[2] ?? "origin/dev"
const packages = ["ui", "tokens", "fonts"]

// 1) 하네스 저장소를 임시 폴더에 ref 로 꺼낸다 (git archive 또는 worktree)
// 2) packages/yuyu-<name> → vendor/yuyu/<name> 로 복사, *.test.* 는 제외
// 3) vendor/yuyu/yuyu.lock.json 에 { ref, commit, files: { 경로: sha256 } } 기록
// --check 모드: lock 의 sha256 과 지금 파일을 비교해 하나라도 다르면 exit 1
```

- `vendor/yuyu` 는 **고치지 않는다**가 규칙입니다. 필요한 수정은 하네스 저장소에서 하고 다시 복사합니다. 에이전트 권한에서도 이 폴더 편집을 거부해 둡니다.
- 복사 후에는 [새 프로젝트 A 단계](./new-project#a-디자인-시스템-들이기)의 CSS 순서 · 브랜드 주입을 똑같이 합니다.

## 2. 화면 이식 — `/port-screen`

하네스의 샌드박스에서 승인된 화면을 제품으로 옮기는 스킬입니다.

1. 배포된 샌드박스 주소를 받으면, 화면 HTML 을 긁지 않고 **원본 소스**를 찾아 읽습니다(샌드박스는 iframe 액자 안에서 화면을 그려 HTML 이 껍데기뿐입니다).
2. 주소 경로를 `apps/sandbox/src/app/**/<경로>/page.tsx` 로 매핑합니다. 중간에 `(그룹)` 폴더가 끼어 있을 수 있습니다.
3. 하네스 패키지가 lock 이후 바뀌었으면 먼저 `pnpm yuyu:sync` 를 합니다.
4. 제품의 데이터 · 라우팅 · 권한에 맞게 옮기되, 화면 모양과 상호작용은 바꾸지 않습니다.

## 3. 제품 쪽 스킬

제품 저장소에는 「영역별로 끝까지 가는 절차」를 스킬로 둡니다. 핵심은 **에이전트가 어디서 멈추는지**를 스킬마다 정하는 것입니다.

| 스킬 | 에이전트가 하는 일 | 멈추는 곳 |
|---|---|---|
| `/api-feature` | DB 엔터티 · 마이그레이션 → API → 테스트 → PR | PR 생성 |
| `/infra-change` | Terraform 수정 → plan 요약 → 변경 기록 초안 | **apply 는 사람이 터미널에서** |
| `/release` | 태그 배포 진행을 지켜보고 보고 | 관찰만 |
| `/etl-rerun` | 다시 돌릴 명령을 만들어 보여 줌 | 실행은 사람 |
| `/port-screen` | 샌드박스 화면을 제품으로 이식 | PR 생성 |

## 4. 제품 저장소의 지시문

`CLAUDE.md`(또는 `AGENTS.md`)에 최소한 이것들을 둡니다 → [AGENTS.md 템플릿](/templates/agents).

- 브랜치와 PR 흐름(작업 → develop squash → main), 누가 무엇을 머지하는지
- 영역별 검증 명령표(web · api · etl · db · infra)
- 안전 경계: 「에이전트는 AWS 에 쓰지 않는다」, 「비밀값을 읽지 않는다」, 「릴리스를 발행하지 않는다」
- AWS 변경 전 기록 양식(무엇을 · 왜 · 화면 캡처 · 결과 · 승인자)

## 5. 릴리스 하네스

마지막으로 [릴리스 하네스](./release-harness)를 붙입니다. 이 단계부터는 운영 배포가 바뀌므로, 먼저 「태그를 발행해야만 배포된다」는 것을 팀 전체가 알고 있어야 합니다.

::: warning 겪은 일
릴리스 흐름을 바꾸기 전에는 main 머지가 곧바로 배포였습니다. 팀원 한 명은 그동안 「태그가 배포를 일으킨다」고 믿고 있었습니다. 흐름을 바꿀 때는 지금 무엇이 배포를 일으키는지부터 문서에 적고 시작합니다.
:::
