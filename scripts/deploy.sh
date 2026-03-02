#!/bin/bash

echo "🚀 Starting deployment..."
echo ""

# === Step 1: Save source code (main branch) ===
echo "📦 Step 1: Saving source code..."

if [ -n "$(git status --porcelain)" ]; then
  git add -A
  COMMIT_MSG="$1"
  [ -z "$COMMIT_MSG" ] && COMMIT_MSG="deploy: $(date '+%Y-%m-%d %H:%M')"
  git commit -m "$COMMIT_MSG"
  echo "✅ Changes saved."
else
  echo "ℹ️  No changes to save."
fi

CURRENT_BRANCH=$(git branch --show-current)
echo "📤 Pushing to GitHub... ($CURRENT_BRANCH branch)"
git push origin "$CURRENT_BRANCH"

if [ $? -ne 0 ]; then
  echo "❌ Failed to push to GitHub."
  echo "   → Check your Git auth: gh auth status"
  exit 1
fi
echo "✅ Source code saved!"
echo ""

# === Step 2: Build ===
echo "🔨 Step 2: Building..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed. Check the errors above."
  exit 1
fi
echo "✅ Build complete!"
echo ""

# === Step 3: Deploy to GitHub Pages ===
echo "🌐 Step 3: Deploying..."
npx gh-pages -d dist

if [ $? -ne 0 ]; then
  echo "❌ Deployment failed."
  exit 1
fi

REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
REPO_NAME=$(basename "$REMOTE_URL" .git)
OWNER=$(echo "$REMOTE_URL" | sed -n 's|.*[:/]\([^/]*\)/[^/]*\.git$|\1|p')
DEPLOY_URL="https://${OWNER}.github.io/${REPO_NAME}/"

echo ""
echo "============================================"
echo "✅ Deployment complete!"
echo ""
echo "Your site will be available at:"
echo "$DEPLOY_URL"
echo "============================================"
