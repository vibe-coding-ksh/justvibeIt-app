#!/bin/bash

echo "🚀 [JustVibeIt] 프로젝트 초기화를 시작합니다..."

# 1. Node.js 버전 확인
NODE_VERSION=$(node -v)
echo "ℹ️  현재 Node 버전: $NODE_VERSION"

# 2. 기본 패키지 설치
echo "📦 1. 기본 패키지 설치 중..."
npm install

# 3. Supabase 클라이언트 설치
echo "📦 2. Supabase 클라이언트 설치 중..."
npm install @supabase/supabase-js

# 4. UI 라이브러리 설치 (shadcn/ui 의존성)
echo "🎨 3. UI 라이브러리(Tailwind, shadcn/ui 의존성) 설치 중..."
npm install clsx tailwind-merge class-variance-authority lucide-react
npm install -D tailwindcss @tailwindcss/vite

# 5. TDD 테스트 환경 설치
echo "🧪 4. TDD 환경(Vitest, Testing Library) 설치 중..."
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @types/node

# 6. .env 파일 생성 (없으면)
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "📄 .env 파일을 생성했어요."
  echo "   ⚠️  Supabase 설정이 필요합니다!"
  echo "   1. https://supabase.com 에서 무료 프로젝트 생성"
  echo "   2. Settings → API 에서 URL과 anon key 복사"
  echo "   3. .env 파일에 붙여넣기"
fi

echo "------------------------------------------------"
echo "🎉 초기화가 완료되었습니다!"
echo ""
echo "📋 다음 단계:"
echo "   1. .env 파일에 Supabase URL과 Key를 설정하세요"
echo "   2. Supabase에서 테이블을 만드세요 (README 참고)"
echo "   3. 'npm run dev'로 개발 시작!"
echo ""
echo "💡 shadcn/ui 컴포넌트 설치:"
echo "   npx shadcn@latest add button"
echo "   npx shadcn@latest add card"
echo "   npx shadcn@latest add dialog"
echo "------------------------------------------------"
