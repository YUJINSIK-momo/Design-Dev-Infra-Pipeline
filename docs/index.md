---
layout: home

hero:
  name: Design · Dev · Infra Pipeline
  text: 디자인에서 운영까지, AI 가 일하는 길
  tagline: 기획자의 화면 요청이 코드 · 테스트 · 배포를 거쳐 승인 버튼으로 끝나고, 개발자의 릴리스가 GPT 리뷰 · Slack 결정 · 태그 배포로 이어지는 하네스를 새 프로젝트에 다시 쓰기 위한 설명서입니다.
  actions:
    - theme: brand
      text: 하네스 한눈에 보기
      link: /guide/overview
    - theme: alt
      text: 새 프로젝트에 적용하기
      link: /guide/new-project
    - theme: alt
      text: 템플릿
      link: /templates/

features:
  - title: 모델은 판단만
    details: 에이전트는 「무엇을 만들지」만 고르고 멈춘다. 가지 · 커밋 · PR · CI · 머지 · 배포 확인 · 보고는 결정론적 스크립트가 한다.
  - title: 사람이 결정하는 자리
    details: 승인 · 반려 · 개선, 머지 방식, 운영 배포 태그처럼 되돌리기 어려운 일은 Slack 버튼과 GitHub 릴리스로 사람이 누른다.
  - title: 권한이 곧 브랜치 보호
    details: 무료 플랜 비공개 저장소라 브랜치 보호가 없다. 저장소에 함께 두는 allow · ask · deny 규칙과 산출물 경계 검사가 그 자리를 대신한다.
  - title: yuyu 디자인 시스템
    details: --yuyu-* 토큰과 @yuyu/ui 부품, 에이전트가 읽는 docs/system 문서. 문서와 코드가 어긋나면 drift 검사가 표시한다.
  - title: 배포 경로에 장기 키 없음
    details: GitHub OIDC 임시 자격 증명, 최소 권한 배포 역할, Secrets Manager 주입, 마이그레이션 up/down/up 검사로 AWS 에 올린다.
  - title: 측정하고 바꾼다
    details: Figma 연동을 만들었다가 A/B 측정 뒤 뺐고, 실패 9번의 위치를 보고 모델과 스크립트의 역할을 뒤집었다. 결정은 근거와 함께 남긴다.
---
