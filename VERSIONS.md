# 버전 기록

> 문제가 생기면 이전 버전으로 돌아갈 수 있어요.
> AI에게 "v001 버전으로 돌아가줘"라고 말하면 됩니다.

---

## v003 (2026-02-21)
- Electron installer 추가 (Supabase 버전)
- Supabase MCP 설정 (.cursor/mcp.json)
- deploy.sh 개인 GitHub Pages + Enterprise Pages 둘 다 지원
- Python 의존성 제거 (환경 체크에서 제외)

## v002 (2026-02-21)
- Appwrite → Supabase 전환
- Google OAuth 로그인 (Supabase Auth)
- Database: site_config, profiles, projects 테이블
- Storage: images 버킷 (이미지 업로드/미리보기)
- 프로젝트 CRUD (추가/삭제)

## v001 (2026-02-21)
- 프로젝트 초기 생성
- 샘플 포트폴리오 (프로필 + 프로젝트 4개)
- 정적 JSON 데이터 방식 (서버/DB 없음)
- GitHub Pages 배포 지원
