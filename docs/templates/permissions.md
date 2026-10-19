# 권한 규칙 템플릿

`.claude/settings.json` 에 두는 공유 권한입니다. 플러그인은 권한을 실어 나르지 못하므로 제품 저장소마다 직접 넣습니다. 규칙은 명령 **문자열**을 대조하므로, 꼴을 바꾼 우회는 [산출물 경계 검사](/guide/security#산출물-경계)로 한 번 더 막습니다.

::: tip
패턴 문법(`:*` 접두 일치, `*` 와일드카드)은 Claude Code 버전에 따라 다를 수 있습니다. 넣은 뒤 `/permissions` 로 실제 적용 결과를 꼭 확인하세요.
:::

## 하네스 저장소 (화면 생성)

```json
{
  "permissions": {
    "allow": [
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(git show:*)",
      "Bash(pnpm check:*)",
      "Bash(pnpm lint:*)",
      "Bash(pnpm typecheck:*)",
      "Bash(pnpm test:*)",
      "Bash(pnpm build:*)",
      "Bash(pnpm visual:*)",
      "Bash(pnpm --filter <화면 앱> build:*)",
      "Bash(pnpm --filter <화면 앱> test:*)",
      "Bash(gh pr view:*)",
      "Bash(gh pr checks:*)",
      "Bash(gh run list:*)",
      "Bash(gh issue view:*)",
      "Bash(gh issue list:*)",
      "Bash(node plugins/yuyu-harness/lib/check-screens.mjs:*)",
      "Bash(node scripts/harness/issue.mjs:*)",
      "Bash(node scripts/harness/decision.mjs:*)"
    ],
    "ask": [
      "Bash(git stash:*)",
      "Bash(git reset --hard:*)",
      "Bash(git clean:*)",
      "Bash(git checkout -- :*)",
      "Bash(git push --force:*)",
      "Bash(git push -f:*)",
      "Bash(rm -r:*)",
      "Bash(rm -rf:*)",
      "Bash(gh pr create:*)",
      "Bash(gh pr merge:*)",
      "Bash(gh issue comment:*)",
      "Bash(gh workflow run:*)",
      "Bash(gh run rerun:*)",
      "Bash(gh run cancel:*)",
      "Edit(<화면 앱>/package.json)",
      "Edit(<화면 앱>/src/app/layout.tsx)",
      "Edit(<화면 앱>/src/app/globals.css)",
      "Edit(plugins/yuyu-harness/lib/**)",
      "Edit(plugins/yuyu-harness/skills/**/SKILL.md)",
      "Edit(.claude/skills/**/SKILL.md)",
      "Edit(scripts/harness/**)",
      "Edit(.github/workflows/**)"
    ],
    "deny": [
      "Bash(git push origin main:*)",
      "Bash(git push --all:*)",
      "Bash(git push --mirror:*)",
      "Bash(git push * main)",
      "Bash(git push *:main)",
      "Bash(git push *:refs/heads/main*)",
      "Bash(gh api:*)",
      "Bash(gh issue edit:*)",
      "Bash(gh issue close:*)",
      "Bash(gh issue reopen:*)",
      "Bash(gh pr edit:*)",
      "Bash(gh pr close:*)",
      "Bash(gh pr reopen:*)",
      "Bash(gh label:*)",
      "Bash(node -e:*)",
      "Read(.env*)",
      "Read(**/*.pem)"
    ]
  }
}
```

왜 이렇게 했나:

- **`gh api` 전체 거부** — 반응 API 로 👍(승인)를 위조할 수 있었다.
- **`node -e` 거부** — `child_process` 로 모든 거부를 우회할 수 있다.
- **검사기 · 러너 · 스킬 편집은 ask** — 에이전트가 자기 판정을 고쳐 통과하지 못하게.
- **issue · PR 편집 거부** — 요청서와 결정의 원본을 바꾸지 못하게.

## 제품 저장소 (인프라 · 배포)

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm check:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Bash(terraform fmt:*)",
      "Bash(terraform validate:*)",
      "Bash(terraform test:*)",
      "Bash(aws * describe-*)",
      "Bash(aws * list-*)"
    ],
    "ask": [
      "Bash(terraform plan:*)",
      "Bash(gh pr create:*)",
      "Bash(gh pr merge --squash:*)",
      "Bash(git push:*)",
      "Bash(pnpm db:migrate:*)",
      "Edit(.github/workflows/**)",
      "Edit(.claude/**)"
    ],
    "deny": [
      "Bash(terraform apply:*)",
      "Bash(terraform destroy:*)",
      "Bash(terraform import:*)",
      "Bash(terraform state:*)",
      "Bash(terraform force-unlock:*)",
      "Bash(aws * create-*)",
      "Bash(aws * delete-*)",
      "Bash(aws * update-*)",
      "Bash(aws * put-*)",
      "Bash(aws * run-*)",
      "Bash(aws * start-*)",
      "Bash(aws * modify-*)",
      "Bash(aws * attach-*)",
      "Bash(aws * authorize-*)",
      "Bash(aws * invoke*)",
      "Bash(aws s3 cp:*)",
      "Bash(aws s3 mv:*)",
      "Bash(aws s3 rm:*)",
      "Bash(aws s3 sync:*)",
      "Bash(aws secretsmanager get-secret-value:*)",
      "Bash(aws ecr get-login-password:*)",
      "Bash(aws * --with-decryption*)",
      "Bash(aws configure export-credentials:*)",
      "Bash(git push origin main:*)",
      "Bash(git push origin develop:*)",
      "Bash(git push --force:*)",
      "Bash(gh pr merge --merge:*)",
      "Bash(gh pr merge --rebase:*)",
      "Bash(gh release create:*)",
      "Bash(gh release edit:*)",
      "Bash(gh secret:*)",
      "Edit(vendor/**)",
      "Read(.env*)",
      "Read(~/.aws/**)"
    ]
  }
}
```

왜 이렇게 했나:

- **릴리스 발행 거부** — 릴리스 발행이 곧 운영 배포다.
- **비밀을 꺼내는 「읽기」도 거부** — `get-secret-value` 는 읽기지만 비밀을 밖으로 낸다.
- **squash 만 허용** — 이력 규칙을 권한으로 강제한다.
- **vendor 편집 거부** — 디자인 시스템은 하네스 저장소에서만 고친다.
- 실제 운영본은 AWS 쓰기 동사를 약 40종까지 늘려 둡니다. 위는 자주 쓰는 것만 추린 뼈대입니다.
