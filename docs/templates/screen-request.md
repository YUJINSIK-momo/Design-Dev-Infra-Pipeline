# 화면 요청서 템플릿

요청서의 원본은 GitHub issue 본문입니다. Slack 폼은 이 양식을 채워 issue 를 여는 입력 창구입니다. 러너가 본문을 파싱하므로 **제목 줄(`### …`)은 바꾸지 않습니다.**

## GitHub issue 양식 (`.github/ISSUE_TEMPLATE/screen-request.yml`)

```yaml
name: 화면 요청
description: 새 화면이나 화면 수정을 요청합니다
title: "화면 요청: "
labels: ["screen-request"]
body:
  - type: dropdown
    id: kind
    attributes:
      label: 종류
      options: ["새 화면", "화면 수정"]
    validations: { required: true }
  - type: input
    id: project
    attributes:
      label: 프로젝트
      description: 화면이 속할 묶음 (예: admin, store-app)
    validations: { required: true }
  - type: input
    id: target
    attributes:
      label: 고칠 화면 주소
      description: 「화면 수정」일 때만. 샌드박스 주소를 그대로 붙여 넣기
  - type: textarea
    id: request
    attributes:
      label: 요청
      description: 누가, 어떤 상황에서, 무엇을 하려는 화면인지. 꼭 있어야 할 것과 없어도 되는 것
    validations: { required: true }
  - type: textarea
    id: states
    attributes:
      label: 상태와 예외
      description: 비어 있을 때, 불러오는 중, 실패했을 때, 권한이 없을 때
  - type: dropdown
    id: device
    attributes:
      label: 주 기기
      options: ["데스크톱", "모바일", "둘 다"]
```

## 잘 쓴 요청의 예

```text
종류: 새 화면
프로젝트: admin
요청:
  가맹점 관리자가 고객 문의(VOC)를 하루에 몇십 건씩 처리한다.
  왼쪽에 필터(기간 · 상태 · 유형), 가운데 목록, 오른쪽에 선택한 문의 상세.
  상세에서 담당자 지정과 상태 변경(접수 → 처리 중 → 완료)을 할 수 있어야 한다.
  답변 작성은 이번에 필요 없다.
상태와 예외:
  검색 결과가 없으면 「조건에 맞는 문의가 없습니다」.
  목록 불러오기 실패 시 다시 시도 버튼.
주 기기: 데스크톱
```

::: tip 「없어도 되는 것」을 꼭 쓴다
「답변 작성은 이번에 필요 없다」처럼 범위 밖을 적으면, 에이전트가 그럴듯한 기능을 지어내지 않습니다. 뜻이 갈리는 부분은 에이전트가 하나를 골라 만들고 결과 카드 첫 줄에 「결정 필요」로 남깁니다.
:::
