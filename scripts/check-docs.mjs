// 문서 검사 — 공개 저장소라 세 가지를 막는다.
// 1) 예전 이름(ooee · oe-)이 남는 것  2) 계정 · 네트워크 · 채널 식별자  3) 없는 문서로 가는 링크
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const docsDir = join(root, "docs")

const rules = [
  { name: "예전 이름 ooee", pattern: /ooee/i },
  { name: "예전 토큰 접두사 oe-", pattern: /(?<![a-z0-9])-{0,2}oe-[a-z]/ },
  { name: "AWS 계정 ID(12자리 숫자)", pattern: /(?<![\d.])\d{12}(?![\d.])/ },
  { name: "VPC · 서브넷 · 보안그룹 ID", pattern: /\b(?:vpc|subnet|sg|igw)-[0-9a-f]{8,}\b/ },
  { name: "Slack 채널 · 워크스페이스 · 앱 ID", pattern: /\b[CTAUG]0[0-9A-Z]{8,}\b/ },
  { name: "Tailscale 사설망 주소", pattern: /\.ts\.net\b/ },
  { name: "액세스 키 모양", pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
]

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (name === "node_modules" || name === "dist" || name === "cache" || name.startsWith(".git")) return []
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

// 메일 주소는 예시 도메인만 허용한다
const emailPattern = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g
const isAllowedEmail = (email) => /@example\.(?:com|org|net)$/.test(email) || email === "noreply@anthropic.com"

const files = [...walk(docsDir), join(root, "README.md")].filter((f) => /\.(md|mts|ts|css|json)$/.test(f))
const problems = []

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n")
  lines.forEach((line, i) => {
    for (const rule of rules) {
      if (rule.pattern.test(line)) problems.push(`${relative(root, file)}:${i + 1} ${rule.name}`)
    }
    for (const [email] of line.matchAll(emailPattern)) {
      if (!isAllowedEmail(email)) problems.push(`${relative(root, file)}:${i + 1} 예시가 아닌 메일 주소`)
    }
  })

  // 마크다운 안의 상대 링크가 실제 문서를 가리키는지
  if (file.endsWith(".md")) {
    const text = lines.join("\n")
    for (const [, target] of text.matchAll(/\]\((\/[^)#\s]*|\.{1,2}\/[^)#\s]*)(?:#[^)]*)?\)/g)) {
      if (!target || /^https?:/.test(target)) continue
      const base = target.startsWith("/") ? join(docsDir, target) : resolve(dirname(file), target)
      const candidates = [base, `${base}.md`, join(base, "index.md")]
      if (target.startsWith("/") && file.endsWith("README.md")) continue
      if (!candidates.some((c) => existsSync(c))) problems.push(`${relative(root, file)} 깨진 링크 → ${target}`)
    }
  }
}

if (problems.length) {
  console.error(`문서 검사 실패 ${problems.length}건\n` + problems.map((p) => `  - ${p}`).join("\n"))
  process.exit(1)
}
console.log(`문서 검사 통과 — 파일 ${files.length}개`)
