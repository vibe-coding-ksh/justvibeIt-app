#!/bin/bash

echo "🚀 [JustVibeIt] Initializing project..."

NODE_VERSION=$(node -v)
echo "ℹ️  Node version: $NODE_VERSION"

echo "📦 1. Installing base packages..."
npm install

echo "📦 2. Installing Appwrite SDK..."
npm install appwrite

echo "🎨 3. Installing UI libraries (Tailwind, shadcn/ui dependencies)..."
npm install clsx tailwind-merge class-variance-authority lucide-react
npm install -D tailwindcss @tailwindcss/vite

echo "🧪 4. Setting up test environment (Vitest, Testing Library)..."
npm install -D vitest jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom @types/node

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo ""
    echo "📄 Created .env file from .env.example"
    echo "   ⚠️  You need to configure Appwrite!"
    echo "   1. Set up Appwrite (cloud.appwrite.io or self-hosted)"
    echo "   2. Create a project and get the Project ID"
    echo "   3. Update .env with your Appwrite endpoint and project ID"
  fi
fi

echo "------------------------------------------------"
echo "🎉 Initialization complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Configure .env with your Appwrite endpoint and project ID"
echo "   2. Set up Google OAuth in Appwrite Console"
echo "   3. Create database collections (see README)"
echo "   4. Run 'npm run dev' to start developing!"
echo ""
echo "💡 Install shadcn/ui components:"
echo "   npx shadcn@latest add button"
echo "   npx shadcn@latest add card"
echo "   npx shadcn@latest add dialog"
echo "------------------------------------------------"
