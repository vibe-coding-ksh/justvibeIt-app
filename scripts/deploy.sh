#!/bin/bash

echo "🚀 배포를 시작합니다..."
echo ""

# === 1단계: 소스 코드 저장 (main 브랜치) ===
echo "📦 1단계: 소스 코드 저장 중..."

if [ -n "$(git status --porcelain)" ]; then
  git add -A
  COMMIT_MSG="$1"
  [ -z "$COMMIT_MSG" ] && COMMIT_MSG="배포: $(date '+%Y-%m-%d %H:%M')"
  git commit -m "$COMMIT_MSG"
  echo "✅ 변경사항을 저장했어요."
else
  echo "ℹ️  변경사항이 없어요. (이미 저장됨)"
fi

CURRENT_BRANCH=$(git branch --show-current)
echo "📤 GitHub에 소스 코드 올리는 중... ($CURRENT_BRANCH 브랜치)"
git push origin "$CURRENT_BRANCH"

if [ $? -ne 0 ]; then
  echo "❌ GitHub에 소스 코드를 올리지 못했어요."
  echo "   → Git 인증을 확인해주세요: gh auth status"
  exit 1
fi
echo "✅ 소스 코드 저장 완료!"
echo ""

# === 2단계: 빌드 ===
echo "🔨 2단계: 웹사이트 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 빌드에 실패했어요. 에러를 확인해주세요."
  exit 1
fi
echo "✅ 빌드 완료!"
echo ""

# === 3단계: GitHub Pages 배포 (gh-pages 브랜치) ===
echo "🌐 3단계: 웹사이트 배포 중..."
npx gh-pages -d dist

if [ $? -ne 0 ]; then
  echo "❌ 배포에 실패했어요."
  exit 1
fi

# 배포 URL 계산
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
REPO_NAME=$(basename "$REMOTE_URL" .git)

# GitHub Enterprise Pages 또는 일반 GitHub Pages 감지
if echo "$REMOTE_URL" | grep -q "oss.navercorp.com"; then
  ORG_NAME=$(echo "$REMOTE_URL" | sed -n 's|.*[:/]\([^/]*\)/[^/]*\.git$|\1|p')
  DEPLOY_URL="https://pages.oss.navercorp.com/${ORG_NAME}/${REPO_NAME}/"
else
  OWNER=$(echo "$REMOTE_URL" | sed -n 's|.*[:/]\([^/]*\)/[^/]*\.git$|\1|p')
  DEPLOY_URL="https://${OWNER}.github.io/${REPO_NAME}/"
fi

echo ""
echo "============================================"
echo "✅ 배포 완료!"
echo ""
echo "잠시 후 아래 주소에서 확인할 수 있어요:"
echo "$DEPLOY_URL"
echo "============================================"
