# 🧊 냉장고를 부탁해

> 스마트 냉장고 관리 & AI 레시피 추천 웹앱

**[👉 라이브 데모](https://naengjanggo.vercel.app)**

## 💡 이런 문제를 해결해요

- 냉장고에 뭐가 있는지 일일이 열어봐야 하는 번거로움
- 유통기한 임박한 재료로 뭘 만들지 떠오르지 않는 문제
- 요리에 필요한 재료 중 뭘 사야 하는지 파악하기 어려운 문제

## ✨ 주요 기능

### 🥬 냉장고 관리
- 냉장실/냉동실 분리 관리
- 재료 추가/수정/삭제
- 유통기한 D-day 표시 (임박 시 컬러 알림)
- **바코드 스캔** — 카메라로 바코드 찍으면 제품 자동 인식
- **영수증 OCR** — 마트 영수증 사진으로 여러 재료 한번에 등록

### 🍳 AI 레시피 추천
- 보유 재료 기반 레시피 추천
- **테마 선택** — 한식, 중식, 일식, 양식, 고기러버, 비건, 15분 요리, 다이어트, 야식
- **필수 재료 지정** — 특정 재료가 반드시 포함된 레시피만 추천
- 식약처 공공 레시피 DB 연동 (검증된 레시피 기반)
- 보유/미보유 재료 표시 + 부족 재료 장보기 자동 추가

### 🗓️ 식단 플래너
- 주간 캘린더 뷰
- 아침/점심/저녁/간식 슬롯
- AI 하루 식단 추천 (보유 재료 기반)
- 식단 재료 → 장보기 리스트 연동

### 🛒 장보기 리스트
- 체크리스트 형식
- 레시피에서 부족 재료 자동 추가
- 구매 완료 시 냉장고 자동 등록 제안

### 🔐 간편 인증
- 회원가입 없이 **비밀문구**만으로 접속
- 같은 문구 = 같은 냉장고 (어디서든 접근 가능)

## 🛠️ 기술 스택

| 영역 | 기술 |
|---|---|
| 프론트엔드 | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| 백엔드 | Supabase (PostgreSQL, Auth, RLS) |
| AI | Google Gemini 2.0 Flash (레시피 추천, 영수증 OCR) |
| 레시피 DB | 식약처 COOKRCP01 공공 API |
| 바코드 | BarcodeDetector API + quagga2 + Open Food Facts |
| 배포 | Vercel |

## 🚀 로컬 개발

```bash
# 클론
git clone https://github.com/regrow1123/naengjanggo.git
cd naengjanggo

# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local에 Supabase URL/Key, Gemini API Key 입력

# 개발 서버
npm run dev
```

### 환경변수

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

### Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. SQL Editor에서 `supabase/meal_plans.sql` 실행
4. Authentication → Providers → Email → "Confirm email" OFF

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 홈 대시보드
│   ├── fridge/               # 냉장고 관리
│   ├── recipes/              # AI 레시피 추천
│   ├── planner/              # 식단 플래너
│   ├── shopping/             # 장보기 리스트
│   ├── login/                # Passphrase 로그인
│   └── api/
│       ├── recipes/recommend # AI 레시피 API
│       ├── planner/suggest   # AI 식단 추천 API
│       ├── receipt/scan      # 영수증 OCR API
│       └── shopping/add      # 장보기 추가 API
├── components/               # UI 컴포넌트
├── hooks/                    # 데이터 훅
└── lib/                      # 유틸리티, 타입, API 클라이언트
```

## 📄 라이선스

MIT
