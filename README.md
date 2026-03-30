# 운세ON (unseon.co.kr)

> 운세야, 와라ON! — AI 기반 대화형 운세 상담 플랫폼

---

## 📌 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 서비스명 | 운세ON |
| 운영사 | 큐브박스 |
| 대표자 | 김미화 |
| 사업자번호 | 537-08-03349 |
| 연락처 | 0502-1909-7788 / sajuon@gmail.com |
| AI 엔진 | Google Gemini 2.5 Flash (SSE 스트리밍) |
| 결제 | KakaoPay |

---

## ✅ 완료된 기능

### 🏠 메인 페이지 (index.html)
- 히어로 섹션: 질문 입력창 + 빠른 질문 칩 8개 (업종추천·이사운 포함)
- 인기 상담 Top4 카드 (연애운·궁합·사업운·직업)
- 2026 병오년 배너
- 전문 심화 상담 카드 (이름·타로·개업·점성술·업종추천·이사운·동업궁합)
- 전체 카테고리 탭 (5개 탭, 38개 카테고리 — main.js SAJU_DATA)
- 요금제 미리보기 (베이직/스탠다드/프리미엄)
- 실제 상담 후기 (localStorage or 기본 데이터 6건)
- FAQ 아코디언
- CTA 배너 + 사업자 정보 푸터

### 💬 AI 채팅 페이지 (chat.html)
**38개 상담 카테고리 — 전체 Gemini 연동 완료:**

#### 연애·인간관계 (8개)
| 카테고리 | 비용 | 전용 프롬프트 | 배너 | 예시질문 |
|----------|------|--------------|------|----------|
| 연애운 | 200P | ✅ 기본 | ✅ | ✅ |
| 궁합상담 | 200P | ✅ 기본 | ✅ | ✅ |
| 썸·재회 | 200P | ✅ 기본 | ✅ | ✅ |
| 결혼운 | 200P | ✅ 기본 | ✅ | ✅ |
| 배우자복 | 200P | ✅ 기본 | ✅ | ✅ |
| 인간관계갈등 | 200P | ✅ 기본 | ✅ | ✅ |
| 가족운자녀운 | 200P | ✅ 기본 | ✅ | ✅ |
| 소개팅흐름 | 200P | ✅ 기본 | ✅ | ✅ |

#### 직업·취업 (7개)
| 카테고리 | 비용 | 전용 프롬프트 | 배너 | 예시질문 |
|----------|------|--------------|------|----------|
| 직업상담 | 200P | ✅ 전용 | ✅ | ✅ |
| 취업운 | 200P | ✅ 전용 | ✅ | ✅ |
| 이직운 | 200P | ✅ 전용 | ✅ | ✅ |
| 승진운 | 200P | ✅ 전용 | ✅ | ✅ |
| 직무적성 | 200P | ✅ 전용 | ✅ | ✅ |
| 시험운합격운 | 200P | ✅ 전용 | ✅ | ✅ |
| 프리랜서운 | 200P | ✅ 전용 | ✅ | ✅ |

#### 사업·재물 (8개)
| 카테고리 | 비용 | 전용 프롬프트 | 배너 | 예시질문 |
|----------|------|--------------|------|----------|
| 사업운재물운 | 300P | ✅ 기본 | ✅ | ✅ |
| 재물운 | 300P | ✅ 기본 | ✅ | ✅ |
| 개업시기 | 300P | ✅ 전용 | ✅ | ✅ |
| 개업상담 | 300P | ✅ 전용 | ✅ | ✅ |
| 동업궁합 | 300P | ✅ 전용 | ✅ | ✅ |
| 상호명상담 | 300P | ✅ 전용 | ✅ | ✅ |
| 상호브랜드네이밍 | 300P | ✅ 전용 | ✅ | ✅ |
| 업종추천 | 300P | ✅ 전용 | ✅ | ✅ |

#### 이름·작명 (4개)
| 카테고리 | 비용 | 전용 프롬프트 | 배너 | 예시질문 |
|----------|------|--------------|------|----------|
| 아이이름짓기 | 300P | ✅ 전용 | ✅ | ✅ |
| 개명상담 | 300P | ✅ 전용 | ✅ | ✅ |
| 사주보완이름 | 300P | ✅ 전용 | ✅ | ✅ |
| 브랜드네이밍 | 300P | ✅ 전용 | ✅ | ✅ |

#### 라이프 이벤트 (6개)
| 카테고리 | 비용 | 전용 프롬프트 | 배너 | 예시질문 |
|----------|------|--------------|------|----------|
| 이사운 | 200P | ✅ 전용 | ✅ | ✅ |
| 집터운 | 200P | ✅ 전용 | ✅ | ✅ |
| 계약시기 | 200P | ✅ 전용 | ✅ | ✅ |
| 여행운 | 100P | ✅ 전용 | ✅ | ✅ |
| 조심할달 | 200P | ✅ 전용 | ✅ | ✅ |
| 기회가오는달 | 200P | ✅ 전용 | ✅ | ✅ |

#### 운세·타로·점성술 (4개)
| 카테고리 | 비용 | 전용 프롬프트 | 배너 | 예시질문 |
|----------|------|--------------|------|----------|
| 타로상담 | 100P | ✅ 전용 | ✅ | ✅ |
| 점성술상담 | 200P | ✅ 전용 | ✅ | ✅ |
| 2026병오년운세 | 200P | ✅ 전용 | ✅ | ✅ |
| 종합운세상담 | 300P | ✅ 전용 | ✅ | ✅ |

### 🔐 회원 인증 & 포인트 시스템

#### 인증 흐름
| 페이지 | 비로그인 시 처리 |
|--------|----------------|
| pricing.html | 상단에 로그인 안내 배너 표시 |
| pricing.html → 결제 버튼 클릭 | 로그인 필요 모달 팝업 (회원가입/로그인 버튼) |
| chat.html → 메시지 전송 | 채팅창 내 로그인 안내 카드 표시 |
| auth.html (로그인 완료) | `sessionStorage.sajuon_auth_redirect` 경로로 복귀 |

#### 포인트 동기화 흐름
```
[회원가입]  → sajuon_users[].points = 500, sajuon_points = 500
[로그인]    → sajuon_points = sajuon_users[id].points  (계정 기준 복원)
[AI 상담]   → sajuon_points -= cost, sajuon_users[id].points 동기화
[포인트 충전] → sajuon_points += plan.point, sajuon_users[id].points 동기화
[로그아웃]  → sajuon_points, sajuon_initialized 제거 (계정에 저장됨)
[재로그인]  → chatInit()에서 max(account.points, localStorage) 동기화
```

### 🤖 AI 엔진 (js/gemini.js)
- Google Gemini 2.5 Flash SSE 스트리밍
- 모델/버전 localStorage 동적 로드 (admin.js testGeminiKey)
- 날짜 동적 계산 (하드코딩 제거, 매월 자동 업데이트)
- MAX_TOKENS 감지 → 자동 이어쓰기
- 스트리밍 실패 → generateContent 폴백
- 400 오류(모델 불가) → 폴백 모델 자동 재시도
- 대화 히스토리 20턴 유지
- 다중 인물 분석 감지 → 3500 토큰 할당

### 📊 컨텍스트 자동 계산 파이프라인

사용자 메시지 입력 시 자동 실행:

```
parseBirthInfo → calcSaju (사주팔자+오행+용신)
    ↓
[카테고리별 분기]
├── 타로상담:                selectSpread → tarotToPromptText
├── 점성술상담:              parseAstrologyInput → calcAstrologyChart → astrologyToPromptText
├── 이사/집터/여행:          parseLifestyleInput → lifestyleToPromptText
├── 직업/적성/취업/이직/승진:
│   시험운합격운/프리랜서운: parseCareerInput → careerToPromptText  ← (신규 연결)
├── 작명/개명:               parseNamingInput → namingToPromptText
├── 개업/상호/업종/동업궁합:  parseBusinessInput → businessToPromptText  ← (동업궁합 신규 연결)
└── 계약시기/조심할달/기회가오는달: sajuContext + sajuOnlyGuide 자동 삽입  ← (신규 연결)
    ↓
buildSystemPrompt + [컨텍스트들] → Gemini API
```

### 📁 전문 로직 파일

| 파일 | 크기 | 내용 |
|------|------|------|
| js/saju.js | - | 사주팔자 계산, 음력/양력 변환, 오행 분석 |
| js/tarot.js | - | 78장 타로 덱, 4가지 스프레드 |
| js/astrology.js | - | 서양 점성술, 행성 위치, 어센던트 계산 |
| js/naming.js | - | 한국어 작명, 수리 81수, 발음오행, 700자 한자 DB |
| js/business.js | - | 200+ 오행별 업종 DB, 2026 트렌드, 개업길일, 상호명 분석 |
| js/lifestyle.js | - | 풍수 8방위 DB, 이사길일, 역마살, 여행 추천지 |
| js/career.js | - | 300+ 오행별 직종 DB, 채용 달력, 적성 유형 분석 |

---

## 🗂️ URL 구조

| 경로 | 기능 |
|------|------|
| `index.html` | 메인 랜딩 페이지 |
| `chat.html` | AI 채팅 상담 (38개 카테고리) |
| `chat.html?cat=[키]` | 특정 카테고리로 바로 진입 |
| `pricing.html` | 포인트 충전 / 이용 내역 |
| `admin.html` | 관리자 대시보드 (Gemini API키·모델 설정) |
| `auth.html` | 로그인 / 회원가입 |
| `terms.html` | 이용약관 |
| `privacy.html` | 개인정보처리방침 |
| `refund.html` | 환불정책 |

---

## 💾 데이터 모델

### localStorage 키
| 키 | 내용 |
|----|------|
| `sajuon_points` | 사용자 포인트 잔액 |
| `sajuon_initialized` | 최초 500P 지급 여부 |
| `sajuon_history` | 이용 내역 (최근 100건) |
| `sajuon_gemini_key` | Gemini API 키 |
| `sajuon_gemini_model` | 현재 사용 Gemini 모델 |
| `sajuon_gemini_ver` | Gemini API 버전 (v1beta 등) |
| `sajuon_reviews` | 후기 (관리자 편집) |
| `sajuon_faqs` | FAQ (관리자 편집) |
| `sajuon_banner` | 히어로 배너 문구 (관리자 편집) |

---

## 🚀 다음 개발 추천 사항

1. **회원 시스템 고도화**: 현재 localStorage 기반 → 실제 DB 연동 (Table API 활용)
2. **상담 내역 저장**: 채팅 기록을 Table API로 영구 보관
3. **SEO 메타태그**: 카테고리별 Open Graph 태그 추가
4. **푸시 알림**: 기회의 달·조심할 달 알림 기능
5. **공유 기능**: 상담 결과 이미지로 저장·공유
6. **다국어**: 영어·일본어 지원
7. **어드민 강화**: 카테고리별 매출 통계, API 사용량 모니터링
8. **A/B 테스트**: 카테고리별 CTA 버튼 문구 최적화
9. **네이버/구글 인증코드 자동 반영**: seo-guide.html에서 입력 → index.html 자동 업데이트 파이프라인

---

## 🔍 검색엔진 SEO 현황

| 항목 | 파일 | 상태 |
|------|------|------|
| 구글 서치콘솔 인증 메타태그 | index.html | ⚠️ 실제 코드 입력 필요 |
| 네이버 웹마스터 인증 메타태그 | index.html | ⚠️ 실제 코드 입력 필요 |
| 사이트맵 | sitemap.xml | ✅ 생성 완료 |
| robots.txt | robots.txt | ✅ 생성 완료 |
| OG 이미지 | images/og-image.png | ✅ 생성 완료 |
| JSON-LD 구조화 데이터 | index.html | ✅ WebSite+LocalBusiness+FAQPage+Service |
| SEO 가이드 페이지 | seo-guide.html | ✅ 관리자 가이드 완성 |
| 다음 검색 등록 | 수동 신청 필요 | ⚠️ register.search.daum.net |

### 🔑 SEO 등록 순서 (우선순위)
1. 사이트 배포 (Publish 탭)
2. `seo-guide.html` 접속 → 구글 인증코드 입력 & 저장
3. 구글 서치콘솔에서 소유권 확인 → 사이트맵 제출
4. 네이버 서치어드바이저 인증코드 입력 & 사이트맵 제출
5. 다음 검색 register.search.daum.net 에서 사이트 등록

---

## 📝 업데이트 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-24 | 최초 구축 (연애·궁합·사업·직업 기본 카테고리) |
| 2026-03-25 | 결제 시스템(KakaoPay) + 요금제 페이지 |
| 2026-03-28 | Gemini 스트리밍 안정화 v3 |
| 2026-03-29 | business.js (업종추천·개업·상호명 전용 엔진) |
| 2026-03-29 | lifestyle.js (이사·집터·여행 전용 엔진) |
| 2026-03-29 | career.js (직업·적성·취업·이직·승진 전용 엔진) |
| 2026-03-29 | **전체 사이트 점검 — 8개 누락 카테고리 프롬프트·배너·예시질문 추가** |
| 2026-03-29 | gemini.js 날짜 동적 계산, chat.js 사이드바 개업상담 추가, CAT_KR_MAP 오타 수정 |
| 2026-03-29 | index.html quick-chips 8개로 확장, 전문 심화 카드 업종추천·이사운·동업궁합 추가 |
| 2026-03-29 | **로직 연결 점검 — 시험운합격운·프리랜서운 CAREER_CATEGORIES 연결, 동업궁합 BUSINESS_CATEGORIES 연결, 계약시기·조심할달·기회가오는달 sajuOnlyGuide 연결** |
| 2026-03-29 | **회원 인증 연동 — 결제·채팅 로그인 필수화, 계정 포인트 양방향 동기화 구현** |
| 2026-03-29 | career.js: 시험운합격운·프리랜서운 전용 careerToPromptText 분기 추가 (오행별 시험유형 DB, 프리랜서 적합도 분석) |
| 2026-03-29 | business.js: 동업궁합 전용 businessToPromptText 분기 추가 (오행 상생상극 테이블, 역할분담, 계약길일) |
| 2026-03-30 | **🚨 핵심 버그 수정 — auth.js DOMContentLoaded 리다이렉트가 chat.html·pricing.html에서도 실행되던 문제 해결** |
| 2026-03-30 | auth.js: `isAuthPage` 체크 추가로 DOMContentLoaded 리다이렉트를 auth.html 전용으로 제한 |
| 2026-03-30 | auth.js: 회원가입 성공 후 3초 카운트다운 → savedRedirect 또는 chat.html 자동 이동 |
| 2026-03-30 | chat.js: 비로그인 sendMessage 시 `sajuon_auth_redirect=chat.html` + `sajuon_category` 보존 후 안내 |
| 2026-03-30 | 전 페이지 auth.js/chat.js 캐시 버스팅 v=20260430 적용 |
| 2026-03-30 | **🔍 SEO 홍보 패키지 적용** |
| 2026-03-30 | index.html: title·description·keywords·OG태그·트위터카드·JSON-LD(WebSite+LocalBusiness+FAQPage) 완성 |
| 2026-03-30 | chat.html·pricing.html: SEO 메타태그·canonical·OG태그 추가 |
| 2026-03-30 | sitemap.xml 생성 (메인+카테고리 딥링크 15개+약관 포함, lastmod/priority 설정) |
| 2026-03-30 | robots.txt 생성 (구글봇/네이버봇Yeti/다음봇Daum/빙봇 허용, 악성봇 차단) |
| 2026-03-30 | naver4a8b9c2d1e5f6g7h.html 인증 파일 생성 |
| 2026-03-30 | seo-guide.html 생성 (구글·네이버·다음 단계별 가이드, 키워드 전략, 체크리스트) |
| 2026-03-30 | images/og-image.png 생성 (소셜 공유 썸네일 1200×630) |
| 2026-03-30 | admin.html 사이드바에 검색엔진 홍보 가이드 링크 추가 |
