import { defineConfig } from "vitepress"

const repo = "https://github.com/YUJINSIK-momo/Design-Dev-Infra-Pipeline"

// 기본 슬러그는 NFKD 로 분해해 한글 제목 id 가 자모로 쪼개진다. 손으로 건 #앵커와 맞도록 NFC 를 유지한다.
function slugify(text: string) {
  return text
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~「」]/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default defineConfig({
  lang: "ko-KR",
  title: "Design · Dev · Infra Pipeline",
  description: "디자인 → 개발 → 리뷰 → 배포를 잇는 AI 하네스 사용 설명서",
  base: "/Design-Dev-Infra-Pipeline/",
  cleanUrls: true,
  markdown: { anchor: { slugify } },
  lastUpdated: true,
  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/Design-Dev-Infra-Pipeline/favicon.svg" }],
    ["link", { rel: "stylesheet", href: "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" }],
    ["meta", { name: "theme-color", content: "#2e6cf0" }],
  ],
  themeConfig: {
    logo: "/favicon.svg",
    nav: [
      { text: "시작하기", link: "/guide/overview" },
      { text: "새 프로젝트", link: "/guide/new-project" },
      { text: "레퍼런스", link: "/reference/commands" },
      { text: "템플릿", link: "/templates/" },
      { text: "포트폴리오", link: "https://yujinsik-momo.github.io/Backend-Developer-Portfolio/ax" },
    ],
    sidebar: [
      {
        text: "시작하기",
        items: [
          { text: "하네스 한눈에 보기", link: "/guide/overview" },
          { text: "새 프로젝트에 적용하기", link: "/guide/new-project" },
          { text: "기존 프로젝트에 붙이기", link: "/guide/existing-project" },
        ],
      },
      {
        text: "디자인 → 개발",
        items: [
          { text: "yuyu 디자인 시스템", link: "/guide/design-system" },
          { text: "화면 요청 흐름", link: "/guide/screen-flow" },
          { text: "권한과 안전장치", link: "/guide/security" },
        ],
      },
      {
        text: "리뷰 → 배포 → 운영",
        items: [
          { text: "릴리스 하네스", link: "/guide/release-harness" },
          { text: "AWS 인프라 기본형", link: "/guide/aws" },
          { text: "운영 교훈 · 문제 해결", link: "/guide/operations" },
        ],
      },
      {
        text: "레퍼런스",
        items: [
          { text: "명령 · 스크립트", link: "/reference/commands" },
          { text: "결정 기록", link: "/reference/decisions" },
        ],
      },
      {
        text: "템플릿",
        items: [
          { text: "템플릿 모음", link: "/templates/" },
          { text: "AGENTS.md", link: "/templates/agents" },
          { text: "권한 규칙", link: "/templates/permissions" },
          { text: "화면 요청서", link: "/templates/screen-request" },
          { text: "plan.json", link: "/templates/plan-json" },
          { text: "결정 기록", link: "/templates/decision-record" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: repo }],
    editLink: { pattern: `${repo}/edit/main/docs/:path`, text: "이 페이지 고치기" },
    outline: { level: [2, 3], label: "이 페이지" },
    docFooter: { prev: "이전", next: "다음" },
    lastUpdated: { text: "마지막 수정" },
    search: { provider: "local" },
    footer: {
      message: "사내에서 운영 중인 하네스를 새 프로젝트에 다시 쓰기 위해 일반화해 정리한 문서입니다.",
      copyright: "© 유진식 (yuyu)",
    },
  },
})
