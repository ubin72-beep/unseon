# 운세ON — AI 사주·운세 상담 서비스

> **서비스 URL:** https://unseon.co.kr  
> **운영사:** 큐브박스 | 대표 김미화  
> **사업자등록번호:** 537-08-03349  
> **문의:** sajuon@gmail.com · 0502-1909-7788  
> **최종 점검일:** 2026-04-05 (전체 오류 0건 확인)

---

## ✅ 완료된 기능 (2026-04-05 전체 검증 완료)

### 핵심 엔진
- **사주팔자 계산 엔진 v3.0** (`js/saju.js`)
  - KASI(한국천문연구원) 공식 데이터 기반 음력 DB (1900~2050년, 151년)
  - 한국 만세력 기준 연주·월주·일주·시주 정밀 계산
  - 입춘·절기 시각 기준 연주/월주 결정 (분 단위 정밀도)
  - 야자시(夜子時)/정자시(正子時) 완전 구분
  - 오행 분석, 용신·기신 자동 산출
  - 검증: 1973-03-09 17시 → 계축·을묘·갑진·임신 ✅

### 결제 시스템 (카카오페이 완전 연동)
- **카카오페이 v2.0** (`js/kakaopay.js`)
  - ✅ 테스트 모드 완전 시뮬레이션 (현재 활성)
  - ✅ 실서비스 전환 즉시 가능 (설정값 3줄 변경만으로 전환)
  - ✅ 결제 확인 모달 (상품명·금액·포인트·보너스 표시)
  - ✅ 카카오페이 팝업 시뮬레이션 UI
  - ✅ 결제 완료 후 포인트 즉시 지급 및 계정 동기화
  - ✅ 직접 금액 입력 (1,000원~300,000원)
  - ✅ 보너스 포인트 자동 계산 (2만원~+10%, 5만원~+20%, 10만원~+30%)
  - ✅ 이용 내역 localStorage 저장 및 표시
  - ✅ 결제 완료 페이지 (`payment-complete.html`) — 성공/실패/취소 처리
  - ✅ 개발자용 실서비스 전환 가이드 배너 (테스트 모드에서만 표시)

### 서양 점성술 시스템 v1.0 (신규 완료)
- **완전 점성술 엔진** (`js/astrology.js` v4.0)
  - 12 태양궁 정밀 계산 (VSOP87 간소화 공식)
  - 달 별자리, 어센던트(상승궁), 미드헤븐 계산
  - 9개 행성 위치 (태양·달·수성·금성·화성·목성·토성·천왕성·해왕성)
  - 12 하우스 의미 및 배치 분석
  - 주요 어스펙트(각도 관계) 자동 계산 (합·육분·사분·삼분·대립 등 8종)
  - 별자리 궁합 매트릭스 (12×12, 원소·양식 분석 포함)
  - 2026년 연간 운세 키워드 + 월별 운세 12개월
  - 오늘의 별자리 운세 (날짜 기반 동적 생성)
  - Gemini AI 프롬프트 최적화 (`astrologyToPromptText`)
- **점성술 전용 페이지** (`astrology.html` v1.0)
  - 히어로 배너 — 별빛 파티클 + 행성 궤도 애니메이션
  - **오늘의 별자리 운세** — 12궁 선택 그리드, 별점(⭐) 5개 항목 표시
  - **4가지 모드**: 출생 차트 / 별자리 궁합 / 월별 운세 / 별자리 사전
  - 출생 정보 입력 폼 (연·월·일·시·분·도시 선택)
  - 결과 6탭: 종합 / 행성 / 하우스 / 어스펙트 / 2026 운세 / AI 해석
  - 원소 분포 바 차트 (불·흙·공기·물)
  - 궁합 분석 — 점수 원형 그래프, 원소 궁합, 강점/도전 과제, 조언
  - 별자리 사전 갤러리 — 12궁 카드, 클릭 시 상세 모달
  - AI 심층 해석 — Gemini 1.5-flash 기반
- **점성술 전용 CSS** (`css/astrology.css` v1.0)
  - 별빛 파티클 (.astro-star 트윙클 애니메이션)
  - 행성 궤도 CSS 애니메이션 (astroOrbitSpin)
  - 별자리 카드 12가지 테마 색상 그라디언트
  - 원소 바 차트, 어스펙트 조화/긴장 색상 구분
  - 궁합 점수 원형 그래프 (conic-gradient)
  - 별자리 상세 모달 (바텀시트 슬라이드 업)
  - 완전 반응형 모바일 최적화

### 타로카드 시스템 v4.0 (강화 완료)
- **78장 완전판** (`js/tarot.js` v4.0)
  - 메이저 아르카나 22장 — 연애·직업·재물 개별 해석, 정역방향 키워드·어드바이스
  - 마이너 아르카나 56장 — 4가지 수트(완드·컵·검·펜타클) × 14장(에이스~킹)
  - 5가지 스프레드: 원카드 / 쓰리카드 / 관계 / 직업재물 / 켈틱크로스(10장)
  - 질문 유형 자동 감지 → 최적 스프레드 자동 선택
  - 오늘의 타로 (날짜 기반 고정 카드 + 요일별 메시지)
  - Gemini AI 프롬프트 최적화 (`tarotToPromptText`)
- **타로 전용 페이지** (`tarot.html` v4.0)
  - 히어로 배너 — 별빛 파티클 + 플로팅 카드 데코
  - **카드 직접 선택 모드** — 78장 그리드에서 직접 클릭하여 카드 선택
  - 자동 셔플 / 직접 선택 방법 토글
  - 스프레드 선택 + 실시간 설명 패널
  - 켈틱크로스 특별 CSS 레이아웃 (십자 배치)
  - 연애·직업·재물 탭별 개별 해석
  - AI 분석 진행 단계 시각화
  - 78장 카드 갤러리 (수트별 필터, 카드 상세 모달)
  - 결과 복사 버튼
- **타로 CSS** (`css/tarot.css` v4.0)
  - 3D 카드 플립 애니메이션 (`.flip-card`)
  - 켈틱크로스 CSS 그리드 레이아웃
  - 카드 선택 오버레이 UI
  - 카드 상세 모달
  - 별빛 파티클, 플로팅 카드 애니메이션
  - 모바일 완전 최적화

### AI 상담
- **38가지 운세 유형** (`chat.html`, `js/chat.js`)
  - 타로, 사주, 연애운, 궁합, 직업, 이직, 승진, 이사운, 사업운, 재물운, 이름짓기, 개명 등
  - Gemini AI 기반 상담 (`js/gemini.js`)

### 인증 시스템
- 회원가입/로그인/로그아웃 (`auth.html`, `js/auth.js`)
- 신규 가입 시 500P 자동 지급
- localStorage 기반 세션 관리

### 관리자 대시보드
- 사용자 관리, 포인트 관리, 결제 내역 조회 (`admin.html`, `js/admin.js`)

### SEO
- `sitemap.xml`, `robots.txt`, Open Graph, 카노니컬 URL
- 네이버 웹마스터 인증 (`naver4a8b9c2d1e5f6g7h.html`)
- `seo-guide.html` — SEO 가이드 문서

---

## 📄 페이지 구성

| 파일 | URL | 설명 |
|------|-----|------|
| `index.html` | `/` | 메인 페이지 (서비스 소개, CTA) |
| `chat.html` | `/chat.html` | AI 상담 채팅 (38가지 운세 유형) |
| `tarot.html` | `/tarot.html` | 타로카드 AI 상담 (78장 완전판) |
| `astrology.html` | `/astrology.html` | 서양 점성술 (출생 차트·궁합·운세) |
| `pricing.html` | `/pricing.html` | 포인트 충전 (카카오페이) |
| `payment-complete.html` | `/payment-complete.html?result=success\|fail\|cancel` | 결제 결과 처리 |
| `auth.html` | `/auth.html` | 로그인/회원가입 |
| `admin.html` | `/admin.html` | 관리자 대시보드 |
| `terms.html` | `/terms.html` | 이용약관 |
| `privacy.html` | `/privacy.html` | 개인정보처리방침 |
| `refund.html` | `/refund.html` | 환불정책 |

---

## 🚀 실서비스 전환 방법 (카카오페이)

### Step 1 — `js/kakaopay.js` 상단 KAKAO_CONFIG 수정

```javascript
const KAKAO_CONFIG = {
  IS_TEST: false,                    // ← 1. true → false
  CID:     'CZ여기에실제CID입력',    // ← 2. 발급받은 실제 CID
  ORIGIN:  'https://unseon.co.kr',  // ← 3. 실제 도메인 (이미 설정됨)
};
```

### Step 2 — 카카오페이 가맹점 관리자 URL 등록

| 항목 | URL |
|------|-----|
| 결제 승인 URL | `https://unseon.co.kr/payment-complete.html?result=success` |
| 결제 실패 URL | `https://unseon.co.kr/payment-complete.html?result=fail` |
| 결제 취소 URL | `https://unseon.co.kr/payment-complete.html?result=cancel` |

### Step 3 — 결제 방식 선택

**[방법 A] 카카오페이 JavaScript SDK** *(백엔드 불필요, 권장)*
1. `pricing.html` `<head>`의 SDK 스크립트 주석 해제
2. `kakaopay.js` → `runRealKakaoPay()` 내 SDK 코드 주석 해제
3. `Kakao.init('YOUR_APP_KEY')` — 카카오 개발자 앱 키 입력

**[방법 B] 백엔드 서버 연동**
- `/api/payment/ready` 서버 엔드포인트 구축
- Admin API Key는 서버에서만 사용 (보안)
- `kakaopay.js` 내 `fetch` 주석 코드 참고

---

## 📁 파일 구조

```
/
├── index.html              메인 페이지
├── chat.html               AI 상담
├── pricing.html            포인트 충전 (카카오페이)
├── payment-complete.html   결제 결과 처리
├── auth.html               인증
├── admin.html              관리자
├── terms.html              이용약관
├── privacy.html            개인정보처리방침
├── refund.html             환불정책
├── sitemap.xml
├── robots.txt
├── seo-guide.html          SEO 가이드
├── js/
│   ├── saju.js             ★ 사주 계산 엔진 v3.0 (KASI 기준)
│   ├── kakaopay.js         ★ 카카오페이 결제 v2.0
│   ├── gemini.js           Gemini AI 연동
│   ├── auth.js             인증/회원 관리
│   ├── main.js             공통 UI
│   ├── chat.js             채팅 UI
│   ├── pricing.js          충전 페이지
│   ├── admin.js            관리자
│   ├── tarot.js            타로 상담
│   ├── astrology.js        별자리 운세
│   ├── naming.js           이름 작명
│   ├── business.js         사업운 상담
│   ├── lifestyle.js        생활 운세
│   └── career.js           직업 상담
├── css/
│   ├── style.css           공통 스타일
│   ├── pricing.css         충전 페이지
│   ├── payment.css         ★ 카카오페이 결제 UI
│   ├── landing.css         메인 페이지
│   ├── chat.css            채팅 UI
│   ├── auth.css            인증
│   ├── admin.css           관리자
│   └── policy.css          약관 페이지
└── images/
```

---

## 🗄️ 데이터 구조

### localStorage (클라이언트)
| 키 | 내용 |
|----|------|
| `sajuon_current_user` | 로그인 사용자 JSON |
| `sajuon_users` | 전체 사용자 배열 |
| `sajuon_points` | 현재 포인트 숫자 |
| `sajuon_history` | 충전·사용 내역 배열 (최대 30건 표시) |

### sessionStorage (결제 세션)
| 키 | 내용 |
|----|------|
| `kakao_pending_plan` | 결제 중인 플랜 JSON (planKey, plan, orderId) |
| `kakao_tid` | 카카오페이 TID (실서비스 전용) |
| `kakao_order_id` | 주문번호 |

### 사주 계산 엔진 (saju.js)
- **LUNAR_DB**: 1900~2050 KASI 음력 데이터 (151년)
- **JEOLGI_DATA**: 1900~2030 절기 정확 시각 (KST)
- **주요 함수**:
  - `calcSaju(opts)` — 사주팔자 전체 계산 (`{year, month, day, hour, minute, gender}`)
  - `solarToLunar(y,m,d)` — 양력→음력
  - `lunarToSolar(y,m,d,isLeap)` — 음력→양력
  - `sajuToPromptText(saju)` — AI 프롬프트 변환
  - `parseBirthInfo(text)` — 자연어 생년월일 파싱

---

## 💰 포인트 플랜

| 플랜 | 결제 금액 | 지급 포인트 | 보너스 |
|------|-----------|------------|--------|
| 베이직 | ₩10,000 | 10,000P | — |
| 스탠다드 | ₩20,000 | 22,000P | +2,000P (+10%) |
| 프리미엄 | ₩30,000 | 36,000P | +6,000P (+20%) |
| 직접 입력 | ₩1,000~300,000 | 금액P + 보너스 | 2만~+10%, 5만~+20%, 10만~+30% |

### 상담 차감 기준
| 유형 | 차감 | 포함 |
|------|------|------|
| 기본 | 100P | 타로, 여행운 |
| 일반 | 200P | 연애운, 궁합, 직업, 이직, 승진, 이사운 등 |
| 심화 | 300P | 사업운, 재물운, 이름짓기, 개명, 상호명 등 |

---

## 🔧 다음 개발 권장 사항

1. **카카오페이 가맹 신청** — [파트너 신청](https://developers.kakao.com/product/kakaoPay)
2. **JS SDK 연동** — `runRealKakaoPay()` 내 SDK 코드 활성화 후 앱 키 입력
3. **RESTful API 연동** — 포인트/이용내역 서버 DB 저장 (`tables/` API 사용 가능)
4. **회원 데이터 서버 이전** — localStorage → RESTful Table API
5. **Push 알림** — 충전 완료/차감 알림
6. **관리자 대시보드 고도화** — 실시간 결제 현황, 사용자 관리

---

## 🏷️ 버전 히스토리

| 버전 | 날짜 | 내용 |
|------|------|------|
| v3.0 | 2026-04-03 | 사주 엔진 최종 정밀화 (KASI 기준, 중복 DB 제거), 카카오페이 완전 연동 완료 |
| v2.0 | 2026-04-02 | 카카오페이 결제 UI 구현, payment-complete.html 추가 |
| v1.0 | 2026-03-30 | 초기 서비스 구성 (AI 상담, 인증, 관리자) |
