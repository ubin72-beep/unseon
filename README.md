# 운세ON — AI 대화형 운세 상담 플랫폼 (v6 — Gemini AI 완전 연동)

> 슬로건: **"운세야, 와라ON!"**  
> 운영사: 큐브박스 | 대표: 김미화 | 사업자등록번호: 537-08-03349

---

## 📁 파일 구조

```
index.html          # 메인 랜딩 (매출형 카피 · 운세야 와라ON!)
chat.html           # AI 채팅 상담 (36개 카테고리)
pricing.html        # 포인트 충전 (카카오페이 UI 연동)
auth.html           # 로그인 / 회원가입
admin.html          # 관리자 대시보드
terms.html          # 이용약관 (14개 조항)
privacy.html        # 개인정보처리방침 (10개 조항)
refund.html         # 환불정책 (10개 조항)
payment-complete.html  # 결제 완료/실패/취소 처리

css/
  style.css         # 공통 컴포넌트 · 변수 · 푸터
  landing.css       # 메인 랜딩 전용
  chat.css          # 채팅 UI 전용
  pricing.css       # 충전 페이지 전용
  auth.css          # 인증 페이지 전용
  admin.css         # 관리자 대시보드 전용
  policy.css        # 약관 페이지 전용
  payment.css       # 카카오페이 결제 UI

js/
  auth.js           # 회원가입·로그인·헤더 인증 상태
  main.js           # 메인 랜딩 인터랙션·포인트 초기화
  chat.js           # AI 상담 채팅 (36개 카테고리 응답)
  pricing.js        # 포인트 충전·이용내역 조회
  admin.js          # 관리자 대시보드 (9개 섹션)
  kakaopay.js       # 카카오페이 결제 로직
  gemini.js         # Google Gemini AI 연동 엔진 (사주 명리 시스템 프롬프트)
```

---

## ✅ 완료된 기능

### 🏠 메인 랜딩 (index.html)
- 슬로건 "운세야, 와라ON!" 메인 히어로
- 매출형 카피 · 신뢰 지표 바 (상담 건수, 만족도, 분야 수, 가격)
- 4대 핵심 카드 (연애, 궁합, 사업, 커리어)
- 2026 병오년 배너
- 30+ 상담 카테고리 탭 (love/job/biz/name/life/all)
- 충전 요금 미리보기
- 리뷰 6개 (localStorage 연동)
- 푸터: 상세 사업자 정보 + 소셜 링크

### 💬 AI 채팅 (chat.html + chat.js + gemini.js)
- **Google Gemini 2.0 Flash 실시간 스트리밍 연동** ✨
- 사주팔자(四柱八字) 천간·지지 계산 및 오행 비율 분석
- 10턴 연속 대화 기억 (대화 컨텍스트 유지)
- 실시간 타이핑 커서 스트리밍 UI
- 생년월일 입력 시 사주팔자 4주 시각화 표시
- 오행(목화토금수) 비율 배지 표시
- **36개 카테고리 AI 응답** (모두 구현 완료):
  - 연애·인간관계: 연애운, 궁합, 썸재회, 결혼운, 배우자복, 소개팅흐름, 인간관계갈등, 가족운자녀운
  - 직업·취업: 직업상담, 취업운, 이직운, 승진운, 직무적성, 시험운합격운, 프리랜서운
  - 사업·재물: 사업운재물운, 재물운, 개업시기, 개업상담, 동업궁합, 상호명상담, 상호브랜드네이밍, 업종추천
  - 이름·작명: 아이이름짓기, 개명상담, 사주보완이름, 브랜드네이밍
  - 라이프: 이사운, 집터운, 계약시기, 여행운, 조심할달, 기회가오는달
  - 운세·타로: 타로상담, 점성술상담, 2026병오년운세, 종합운세상담
- 랜덤 행운 정보 (색, 방향, 숫자, 길한달, 주의달) 생성
- 포인트 차감 (100P~300P) · 이용내역 자동 저장
- 사이드바: 7개 그룹, 36개 카테고리 목록
- 모바일 사이드바 슬라이드 · 타이핑 인디케이터
- 포인트 부족 모달 · 자동 충전 안내
- 환영 메시지 애니메이션 + 예시 질문 버튼 (개선됨)

### 💳 포인트 충전 (pricing.html + kakaopay.js)
- 3단계 요금제 (Basic 1만, Standard 2만, Premium 3만)
- 카카오페이 결제 UI (테스트 모드)
- 충전 완료 후 포인트 자동 지급
- 이용 내역 테이블 (날짜, 유형, 금액)
- payment-complete.html 완료/실패/취소 처리

### 🔐 인증 (auth.html + auth.js)
- 이메일 로그인 / 회원가입
- 이메일 인증 (6자리 코드 · 60초 타이머)
- 비밀번호 강도 바 (5단계)
- 전체 약관 동의 (이용약관, 개인정보, 만14세, 환불, 마케팅)
- 소셜 로그인 버튼 UI (카카오, 네이버) — 실연동 준비 중
- 가입 완료 화면 (500P 무료 지급 안내)
- 로그인 상태 헤더 표시 · 로그아웃
- 이메일 기억하기 (localStorage)

### 🛠 관리자 대시보드 (admin.html + admin.js)
9개 섹션 모두 구현:

1. **대시보드**: 총 충전P, 총 차감P, 상담 건수, 잔여P, 최신 거래 10건
2. **배너·카피 관리**: 히어로 배지/제목/부제 수정 → 메인 랜딩 실시간 반영
3. **카테고리 관리**: 상담 카테고리 순서·표시 관리
4. **요금 정책 관리**: 충전 요금제 가격·보너스 설정
5. **후기 관리**: 리뷰 CRUD (최대 12개)
6. **FAQ 관리**: 자주 묻는 질문 CRUD
7. **이용 내역 조회**: 전체 포인트 거래 내역 테이블
8. **회원 관리** (신규 개선):
   - 회원 현황 통계 (전체/활성/오늘가입/마케팅동의)
   - **상담 현황 통계** (총 상담 건수, 총 포인트 사용, 오늘 상담, 회원당 평균)
   - **인기 상담 분야 TOP 5** (막대 차트)
   - 회원 목록 (이름/이메일/포인트/성별/마케팅/가입일/최근로그인/상태)
   - 회원 검색 · 상태 토글 · 삭제
   - **CSV 내보내기** (신규)
   - 테스트 회원 생성
9. **포인트 조작**: 관리자 포인트 수동 지급/차감

### 📄 정책 페이지
- terms.html: 이용약관 14개 조항
- privacy.html: 개인정보처리방침 10개 조항
- refund.html: 환불정책 10개 조항
- 모든 페이지 하단: 사업자 정보 + 정책 링크

---

## 🏢 사업자 정보

| 항목 | 내용 |
|------|------|
| 서비스명 | 운세ON |
| 운영사 | 큐브박스 |
| 대표 | 김미화 |
| 사업자등록번호 | 537-08-03349 |
| 주소 | 서울 송파구 송파대로14길 7-10 2층 201 |
| 전화 | 0502-1909-7788 |
| 이메일 | sajuon@gmail.com |
| 통신판매업 | 신고 준비 중 |

---

## 💾 데이터 구조 (localStorage)

| 키 | 타입 | 설명 |
|---|---|---|
| `sajuon_users` | JSON Array | 회원 목록 (name, email, pw, phone, birth, gender, marketing, points, joinDate, lastLogin, status) |
| `sajuon_current_user` | JSON Object | 현재 로그인 사용자 (pw 제외) |
| `sajuon_points` | String | 현재 보유 포인트 |
| `sajuon_history` | JSON Array | 포인트 거래 내역 (date, type, amount, note) |
| `sajuon_initialized` | String | 포인트 초기화 여부 |
| `sajuon_free_pt` | String | 무료 가입 포인트 (기본 500) |
| `sajuon_remember_email` | String | 이메일 기억하기 |
| `sajuon_reviews` | JSON Array | 리뷰 데이터 |
| `sajuon_banner` | JSON Object | 배너 카피 데이터 |
| `sajuon_categories` | JSON Array | 카테고리 데이터 |
| `sajuon_pricing` | JSON Object | 요금 정책 데이터 |
| `sajuon_faq` | JSON Array | FAQ 데이터 |

---

## 🗺 주요 URL (상대 경로)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 | `/index.html` | 랜딩 |
| AI 상담 | `/chat.html` | 상담 (카테고리 파라미터: sessionStorage) |
| 포인트 충전 | `/pricing.html` | 충전 |
| 로그인/가입 | `/auth.html?tab=login` or `?tab=register` | 인증 |
| 관리자 | `/admin.html#dash` | 대시보드 (해시로 섹션 이동) |
| 이용약관 | `/terms.html` | 정책 |
| 개인정보 | `/privacy.html` | 정책 |
| 환불정책 | `/refund.html` | 정책 |
| 결제 완료 | `/payment-complete.html` | 결제 후 리다이렉트 |

---

## 🚀 다음 개발 추천 단계

### 즉시 가능 (정적 사이트 범위)
1. **Gemini API 키 입력** — `admin.html#ai` → AI 설정 → API 키 입력 후 저장
2. **통신판매업 신고번호 추가** — 발급 후 푸터·정책 페이지에 입력
3. **카카오페이 실결제 전환** — `js/kakaopay.js`에서 `IS_TEST_MODE = false` + CID 입력
4. **SNS 링크 연결** — 인스타그램, 카카오채널, 블로그 URL 추가

### 백엔드 연동 후 가능
4. **실결제 검증 서버** — Netlify Functions or Node.js (결제 위변조 방지 필수)
5. **GPT-4 / Gemini API 연동** — 실제 AI 응답 생성 (현재는 시뮬레이션)
6. **카카오/네이버 OAuth** — 소셜 로그인 실연동
7. **이메일 발송** — 가입 인증 메일, 상담 영수증 자동 발송
8. **서버사이드 DB** — MySQL/Supabase로 회원 데이터 영구 보관

---

## 🌐 배포 방법

### GitHub Pages (무료)
1. GitHub 저장소 생성 (ubin72-beep/unseon)
2. 파일 전체 업로드 (css/, js/ 폴더 포함)
3. Settings → Pages → Deploy from main branch
4. 커스텀 도메인: `unseon.co.kr` (CNAME 파일 + 가비아 DNS 설정)

### 가비아 DNS 설정
```
A 레코드 4개 (GitHub Pages IP):
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153

CNAME: www → ubin72-beep.github.io
```

---

*최종 업데이트: 2026-03-27 | v5 — 전체 카테고리 AI 응답 완성, 관리자 상담 통계 추가, CSV 내보내기, 환영 메시지 UI 개선*
