# JustVibeIt

**코딩을 몰라도 AI와 대화하면서 나만의 웹사이트를 만들 수 있어요!**

Supabase(무료)를 사용해서 데이터베이스, 이미지 저장, 로그인까지 모두 지원합니다.

---

## 이런 분들을 위해 만들었어요

- 코딩은 모르지만 나만의 웹사이트를 갖고 싶은 분
- AI와 대화하면서 사이트를 만들고 싶은 분
- 무료로 DB + 이미지 저장 + 로그인까지 쓰고 싶은 분

---

## 시작하기

### 인스톨러로 시작 (권장)

**JustVibeIt Installer**를 다운로드하면 클릭 몇 번으로 모든 설정이 완료됩니다.

1. [Releases](https://github.com/your-org/justvibeIt-app/releases)에서 인스톨러 다운로드
2. 인스톨러 실행 → 환경 체크 → GitHub 로그인 → 프로젝트 생성
3. 설치 완료 후 **Cursor** 또는 **Antigravity**에서 바로 열기

> 인스톨러가 Git, Node.js, GitHub CLI 설치부터 프로젝트 생성까지 모두 안내해줍니다.

### Supabase 설정

1. [supabase.com](https://supabase.com)에서 무료 계정 만들기
2. 새 프로젝트 생성
3. Settings → API에서 **Project URL**과 **anon public key** 복사
4. `.env` 파일에 붙여넣기:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxx
```

### DB 테이블 만들기

Supabase 대시보드 → SQL Editor에서 아래 SQL을 실행하세요:

```sql
-- 사이트 설정
CREATE TABLE site_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT '내 프로젝트',
  description text DEFAULT '',
  theme text DEFAULT 'light',
  created_at timestamptz DEFAULT now()
);

-- 프로필
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  title text DEFAULT '',
  bio text DEFAULT '',
  avatar text DEFAULT '',
  links jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

-- 프로젝트
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  tags text[] DEFAULT '{}',
  link text DEFAULT '',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능
CREATE POLICY "누구나 site_config 읽기" ON site_config FOR SELECT USING (true);
CREATE POLICY "누구나 profiles 읽기" ON profiles FOR SELECT USING (true);
CREATE POLICY "누구나 projects 읽기" ON projects FOR SELECT USING (true);

-- 로그인한 사용자만 쓰기/수정/삭제
CREATE POLICY "본인 site_config 관리" ON site_config FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "본인 profiles 관리" ON profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "본인 projects 관리" ON projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 샘플 데이터 넣기
INSERT INTO site_config (site_name, description, theme)
VALUES ('내 프로젝트', 'JustVibeIt으로 만든 포트폴리오', 'light');

INSERT INTO profiles (name, title, bio, avatar, links)
VALUES (
  '홍길동',
  '기획자 / 디자이너',
  '안녕하세요! AI와 함께 아이디어를 현실로 만들어가고 있어요.',
  '',
  '[{"label": "GitHub", "url": "https://github.com"}, {"label": "LinkedIn", "url": "https://linkedin.com"}]'
);

INSERT INTO projects (title, description, image, tags, link, sort_order)
VALUES
  ('AI 챗봇 서비스', '고객 문의를 자동으로 처리하는 AI 챗봇', '', ARRAY['기획', 'AI', 'UX'], 'https://example.com', 1),
  ('모바일 앱 리디자인', '기존 앱의 사용성을 개선하는 리디자인 프로젝트', '', ARRAY['디자인', '모바일'], 'https://example.com', 2);
```

### Storage 설정

1. Supabase 대시보드 → Storage
2. "New bucket" 클릭
3. 이름: `images`, **Public bucket** 체크
4. 생성 완료!

### Google 로그인 설정 (선택)

1. [Google Cloud Console](https://console.cloud.google.com)에서 OAuth 2.0 클라이언트 생성
2. Supabase 대시보드 → Authentication → Providers → Google 활성화
3. Client ID와 Secret 입력
4. Redirect URL을 Google Console에 추가

### 개발 시작!

```bash
npm run dev
```

http://localhost:5157 에서 확인하세요!

---

## 지원 IDE

| IDE | 설명 |
|-----|------|
| [Cursor](https://cursor.sh) | AI 코딩 에디터 (추천) |
| [Antigravity](https://antigravity.ai) | AI 네이티브 IDE |

인스톨러 완료 후 원하는 IDE를 선택해서 바로 프로젝트를 열 수 있습니다.

---

## 배포하기

```bash
npm run deploy
```

배포 전에 `.env` 파일에서 `VITE_BASE_PATH`를 설정하세요:
```
VITE_BASE_PATH=/조직이름/레포이름/
```

---

## 명령어 모음

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 로컬에서 개발 시작 |
| `npm run init` | 처음 시작할 때 패키지 설치 |
| `npm run deploy` | 웹사이트 배포 |
| `npm run build` | 빌드만 하기 |
| `npm run test` | 테스트 실행 |

---

## 기술 스택

- **React 18** + TypeScript + Vite
- **Tailwind CSS** + shadcn/ui + MUI
- **Supabase** (Auth + Database + Storage)
- **GitHub Pages** 배포

---

## AI와 대화하면서 만들기

Cursor 또는 Antigravity에서 AI에게 이렇게 말해보세요:

- "내 이름을 '김철수'로 바꿔줘"
- "프로젝트를 하나 더 추가해줘"
- "배경색을 파란색으로 바꿔줘"
- "블로그 섹션을 추가해줘"
- "배포해줘"

AI가 코드를 수정하고, 데이터를 업데이트하고, 배포까지 해줄 거예요!
