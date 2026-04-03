/* =========================================================
   운세ON — js/astrology.js  v4.0
   서양 점성술 완전 강화판

   [포함 기능]
   - 12 태양궁(별자리) 정밀 계산 (VSOP87 간소화)
   - 달 별자리, 어센던트(상승궁), 미드헤븐 계산
   - 행성 위치 (태양·달·수성·금성·화성·목성·토성·천왕성·해왕성)
   - 12 하우스 의미 및 배치 분석
   - 주요 어스펙트(각도 관계) 계산
   - 별자리 궁합 매트릭스 (12×12)
   - 출생 차트 완전 생성
   - 월별/주별 운세 예측 데이터
   - Gemini AI 프롬프트 최적화 변환
   - 오늘의 별자리 운세 (날짜 기반)
   ========================================================= */

/* =====================================================
   0. 별자리 비주얼 테마
   ===================================================== */
const ZODIAC_THEMES = {
  0:  { bg: '#e74c3c', accent: '#ff6b6b', glow: 'rgba(231,76,60,0.4)'   }, // 양자리
  1:  { bg: '#27ae60', accent: '#2ecc71', glow: 'rgba(39,174,96,0.4)'   }, // 황소자리
  2:  { bg: '#f39c12', accent: '#f1c40f', glow: 'rgba(243,156,18,0.4)'  }, // 쌍둥이자리
  3:  { bg: '#2980b9', accent: '#3498db', glow: 'rgba(41,128,185,0.4)'  }, // 게자리
  4:  { bg: '#d35400', accent: '#e67e22', glow: 'rgba(211,84,0,0.4)'    }, // 사자자리
  5:  { bg: '#8e44ad', accent: '#9b59b6', glow: 'rgba(142,68,173,0.4)'  }, // 처녀자리
  6:  { bg: '#16a085', accent: '#1abc9c', glow: 'rgba(22,160,133,0.4)'  }, // 천칭자리
  7:  { bg: '#c0392b', accent: '#e74c3c', glow: 'rgba(192,57,43,0.4)'   }, // 전갈자리
  8:  { bg: '#7f8c8d', accent: '#95a5a6', glow: 'rgba(127,140,141,0.4)' }, // 사수자리
  9:  { bg: '#2c3e50', accent: '#34495e', glow: 'rgba(44,62,80,0.4)'    }, // 염소자리
  10: { bg: '#1565c0', accent: '#1976d2', glow: 'rgba(21,101,192,0.4)'  }, // 물병자리
  11: { bg: '#0277bd', accent: '#0288d1', glow: 'rgba(2,119,189,0.4)'   }, // 물고기자리
};

/* =====================================================
   1. 황도 12궁 (완전 강화판)
   ===================================================== */
const ZODIAC_SIGNS = [
  {
    id: 0, name: '양자리', en: 'Aries', symbol: '♈', emoji: '🐏',
    element: '불', quality: '활동궁', ruler: '화성', rulerEmoji: '♂️',
    dates: { start: { m: 3, d: 21 }, end: { m: 4, d: 19 } },
    traits: '열정적, 개척정신, 충동적, 리더십, 용감함',
    strength: '결단력, 추진력, 용기, 독립심, 새로운 것에 대한 도전',
    weakness: '충동성, 인내심 부족, 이기심, 경솔한 행동',
    love: '독립적이지만 열정적인 연애를 즐깁니다. 상대에게 적극적으로 다가가며, 연애에서도 리더가 되고 싶어합니다. 권태를 싫어하므로 항상 새로운 자극이 필요합니다.',
    career: '리더십이 필요한 분야, 군인, 운동선수, 기업가, 소방관, 외과의사에 적합합니다. 경쟁을 즐기며 빠른 의사결정이 강점입니다.',
    money: '충동적으로 돈을 쓰는 경향이 있습니다. 저축보다는 새로운 사업이나 투자에 투자하는 것을 좋아합니다.',
    health: '두통, 열, 과로, 부상에 주의하세요. 신체 활동으로 에너지를 해소하는 것이 중요합니다.',
    spirit: '화성의 에너지를 받아 항상 앞으로 나아갑니다. 의식적으로 인내심을 키우고, 타인의 속도를 존중하는 연습이 필요합니다.',
    lucky: { color: '빨강', number: 1, day: '화요일', stone: '루비', flower: '데이지' },
    compatibility: {
      best: ['사자자리', '사수자리', '쌍둥이자리', '물병자리'],
      good: ['양자리', '전갈자리'],
      challenging: ['게자리', '염소자리']
    },
    famous: ['레이디 가가', '엘튼 존', '찰리 채플린'],
    bodyPart: '머리, 뇌, 얼굴',
    houseMeaning: '자아와 외모, 첫인상, 새로운 시작'
  },
  {
    id: 1, name: '황소자리', en: 'Taurus', symbol: '♉', emoji: '🐂',
    element: '흙', quality: '고정궁', ruler: '금성', rulerEmoji: '♀️',
    dates: { start: { m: 4, d: 20 }, end: { m: 5, d: 20 } },
    traits: '안정적, 인내심, 물질적, 감각적, 완고함',
    strength: '신뢰성, 인내, 실용성, 감각적 즐거움 추구, 충성심',
    weakness: '고집, 변화 저항, 물질주의, 게으름, 질투심',
    love: '안정적이고 헌신적인 관계를 원합니다. 천천히 신뢰를 쌓아가며, 일단 연애를 시작하면 매우 충성스럽습니다. 감각적인 즐거움을 공유하는 것을 좋아합니다.',
    career: '금융, 예술, 요리, 부동산, 농업, 은행업, 인테리어 디자인에 적합합니다. 꾸준함과 신뢰성이 큰 자산입니다.',
    money: '돈을 안정적으로 모으는 것을 좋아합니다. 실물 자산(부동산, 금)에 투자하는 경향이 있으며 재정적으로 안정적입니다.',
    health: '목, 갑상선, 목 부위에 주의하세요. 과식 경향이 있으니 규칙적인 운동이 중요합니다.',
    spirit: '금성의 아름다움과 안정을 추구합니다. 물질적 풍요 너머의 내면 가치를 탐구하는 것이 영적 성장의 열쇠입니다.',
    lucky: { color: '초록', number: 6, day: '금요일', stone: '에메랄드', flower: '장미' },
    compatibility: {
      best: ['처녀자리', '염소자리', '게자리', '물고기자리'],
      good: ['황소자리', '천칭자리'],
      challenging: ['사자자리', '물병자리']
    },
    famous: ['셰익스피어', '아델', '데이비드 베컴'],
    bodyPart: '목, 갑상선, 목소리',
    houseMeaning: '재물과 소유, 가치관, 감각적 즐거움'
  },
  {
    id: 2, name: '쌍둥이자리', en: 'Gemini', symbol: '♊', emoji: '👯',
    element: '공기', quality: '변동궁', ruler: '수성', rulerEmoji: '☿',
    dates: { start: { m: 5, d: 21 }, end: { m: 6, d: 20 } },
    traits: '호기심, 적응력, 소통 능력, 이중성, 변덕',
    strength: '지적 호기심, 의사소통, 유연성, 다재다능, 유머 감각',
    weakness: '일관성 부족, 피상적, 불안정, 우유부단, 산만함',
    love: '지적인 교류와 대화를 중요시합니다. 다양한 경험을 원하며, 친구 같은 파트너를 좋아합니다. 권태를 빨리 느끼므로 지속적인 자극이 필요합니다.',
    career: '저널리즘, 교육, 판매, 통신, IT, 마케팅, 번역가에 적합합니다. 다양한 업무를 동시에 처리하는 능력이 뛰어납니다.',
    money: '여러 수입원을 만드는 것을 좋아합니다. 충동적인 소비가 있을 수 있으므로 재정 계획이 중요합니다.',
    health: '폐, 손, 팔, 신경계에 주의하세요. 정신적 과부하와 불안을 조심하세요.',
    spirit: '수성의 빠른 사고와 소통 능력을 활용하세요. 깊이 있는 집중과 명상이 내면의 평화를 가져옵니다.',
    lucky: { color: '노랑', number: 5, day: '수요일', stone: '진주', flower: '라벤더' },
    compatibility: {
      best: ['천칭자리', '물병자리', '양자리', '사자자리'],
      good: ['쌍둥이자리', '처녀자리'],
      challenging: ['처녀자리', '물고기자리']
    },
    famous: ['안젤리나 졸리', '조니 뎁', '나탈리 포트만'],
    bodyPart: '폐, 손, 팔, 어깨',
    houseMeaning: '소통과 이동, 형제자매, 단거리 여행'
  },
  {
    id: 3, name: '게자리', en: 'Cancer', symbol: '♋', emoji: '🦀',
    element: '물', quality: '활동궁', ruler: '달', rulerEmoji: '🌙',
    dates: { start: { m: 6, d: 21 }, end: { m: 7, d: 22 } },
    traits: '감수성, 모성애, 직관, 가정적, 집착',
    strength: '공감 능력, 보호 본능, 충성심, 직관력, 기억력',
    weakness: '감정 기복, 집착, 예민함, 과거 집착, 방어적',
    love: '깊은 감정적 유대를 원합니다. 가정과 안정을 중요시하며, 파트너를 온 마음으로 돌봅니다. 상처받는 것을 두려워하여 처음에는 방어적일 수 있습니다.',
    career: '간호, 교육, 요리사, 심리 상담사, 부동산, 역사학자에 적합합니다. 타인의 감정을 잘 읽는 능력이 서비스 분야에서 빛납니다.',
    money: '안전한 저축을 선호합니다. 가족을 위한 지출에 아끼지 않으며, 부동산 투자에 관심이 많습니다.',
    health: '위장, 가슴, 감정적 스트레스에 주의하세요. 감정 건강이 신체 건강과 직결됩니다.',
    spirit: '달의 감수성을 통해 깊은 공감과 직관을 발전시키세요. 과거에 대한 집착을 놓아야 영적으로 성장할 수 있습니다.',
    lucky: { color: '은색', number: 2, day: '월요일', stone: '문스톤', flower: '흰 장미' },
    compatibility: {
      best: ['전갈자리', '물고기자리', '황소자리', '처녀자리'],
      good: ['게자리', '염소자리'],
      challenging: ['양자리', '천칭자리']
    },
    famous: ['프리다 칼로', '에마 왓슨', '톰 행크스'],
    bodyPart: '가슴, 위장, 자궁',
    houseMeaning: '가정과 가족, 뿌리, 감정적 기반'
  },
  {
    id: 4, name: '사자자리', en: 'Leo', symbol: '♌', emoji: '🦁',
    element: '불', quality: '고정궁', ruler: '태양', rulerEmoji: '☀️',
    dates: { start: { m: 7, d: 23 }, end: { m: 8, d: 22 } },
    traits: '카리스마, 자신감, 창조성, 관대함, 자만심',
    strength: '리더십, 창의성, 열정, 너그러움, 용기',
    weakness: '자만심, 오만함, 고집, 주목 욕구, 드라마틱한 반응',
    love: '로맨틱하고 열정적입니다. 상대방을 왕/왕비처럼 대우하지만, 자신도 그에 걸맞은 대접을 기대합니다. 충성스럽고 보호적인 연애를 합니다.',
    career: '연예, 예술, 경영, 정치, 교육, 공연 예술에 적합합니다. 무대 중심에 서는 것을 즐기며 자연스러운 리더입니다.',
    money: '호화로운 것을 좋아하고 아낌없이 씁니다. 관대함이 미덕이지만 저축에도 신경 써야 합니다.',
    health: '심장, 등, 과로에 주의하세요. 스트레스가 심장 건강에 영향을 줍니다.',
    spirit: '태양의 빛처럼 주변을 밝히는 존재입니다. 진정한 리더십은 섬기는 것에서 나온다는 것을 배울 때 영적으로 완성됩니다.',
    lucky: { color: '금색', number: 1, day: '일요일', stone: '루비', flower: '해바라기' },
    compatibility: {
      best: ['양자리', '사수자리', '쌍둥이자리', '천칭자리'],
      good: ['사자자리', '전갈자리'],
      challenging: ['황소자리', '전갈자리']
    },
    famous: ['코코 샤넬', '오바마', '마돈나'],
    bodyPart: '심장, 등, 척추',
    houseMeaning: '창조성과 자기표현, 사랑, 오락과 자녀'
  },
  {
    id: 5, name: '처녀자리', en: 'Virgo', symbol: '♍', emoji: '👧',
    element: '흙', quality: '변동궁', ruler: '수성', rulerEmoji: '☿',
    dates: { start: { m: 8, d: 23 }, end: { m: 9, d: 22 } },
    traits: '분석적, 완벽주의, 실용적, 섬세함, 비판적',
    strength: '꼼꼼함, 분석력, 건강 의식, 헌신, 문제 해결 능력',
    weakness: '완벽주의, 과도한 비판, 걱정, 소심함, 지나친 자기 비판',
    love: '신중하고 헌신적입니다. 실질적인 방법으로 사랑을 표현하며, 파트너의 삶을 실질적으로 개선해 주려 합니다. 처음에는 내성적이지만 신뢰가 쌓이면 헌신적입니다.',
    career: '의료, 영양사, 편집자, 데이터 분석, 회계, 연구원에 적합합니다. 세부 사항에 대한 주의력이 뛰어납니다.',
    money: '신중하고 실용적인 재정 관리자입니다. 충동 구매를 잘 하지 않으며 꼼꼼히 예산을 관리합니다.',
    health: '소화기, 복부, 영양에 주의하세요. 걱정과 불안이 소화기 건강에 영향을 줍니다.',
    spirit: '봉사와 완벽함을 통해 신성을 찾습니다. 자기 자신을 있는 그대로 받아들이는 것이 영적 성장의 시작입니다.',
    lucky: { color: '갈색', number: 6, day: '수요일', stone: '사파이어', flower: '국화' },
    compatibility: {
      best: ['황소자리', '염소자리', '게자리', '전갈자리'],
      good: ['처녀자리', '쌍둥이자리'],
      challenging: ['쌍둥이자리', '사수자리']
    },
    famous: ['비욘세', '마이클 잭슨', '킬리 미노그'],
    bodyPart: '소화기, 소장, 비장',
    houseMeaning: '건강과 일상, 봉사, 직업 환경'
  },
  {
    id: 6, name: '천칭자리', en: 'Libra', symbol: '♎', emoji: '⚖️',
    element: '공기', quality: '활동궁', ruler: '금성', rulerEmoji: '♀️',
    dates: { start: { m: 9, d: 23 }, end: { m: 10, d: 22 } },
    traits: '균형, 공정함, 심미적, 사교적, 우유부단',
    strength: '외교력, 공정함, 아름다움 감각, 협력, 매력',
    weakness: '우유부단, 의존성, 갈등 회피, 피상적, 자기 주장 부족',
    love: '파트너십과 조화를 중요시합니다. 로맨틱하고 세련된 연애를 즐기며, 관계에서 평등을 추구합니다. 갈등을 피하려다 자신의 욕구를 억압할 수 있습니다.',
    career: '법률, 외교, 예술, 패션, 심리 상담, 중재자에 적합합니다. 사람들 사이의 균형을 잡는 능력이 뛰어납니다.',
    money: '아름다운 것에 돈을 쓰는 경향이 있습니다. 파트너와의 공동 재정 관리에 능숙합니다.',
    health: '신장, 허리, 피부에 주의하세요. 결정을 못 내리는 스트레스가 건강에 영향을 줍니다.',
    spirit: '조화와 아름다움을 통해 신성을 경험합니다. 타인을 위한 균형 뿐 아니라 자신을 위한 경계를 세우는 것이 영적 과제입니다.',
    lucky: { color: '분홍', number: 7, day: '금요일', stone: '다이아몬드', flower: '장미' },
    compatibility: {
      best: ['쌍둥이자리', '물병자리', '사자자리', '사수자리'],
      good: ['천칭자리', '황소자리'],
      challenging: ['게자리', '염소자리']
    },
    famous: ['간디', '오스카 와일드', '김고은'],
    bodyPart: '신장, 허리, 피부',
    houseMeaning: '파트너십과 결혼, 계약, 공개적 관계'
  },
  {
    id: 7, name: '전갈자리', en: 'Scorpio', symbol: '♏', emoji: '🦂',
    element: '물', quality: '고정궁', ruler: '명왕성', rulerEmoji: '♇',
    dates: { start: { m: 10, d: 23 }, end: { m: 11, d: 21 } },
    traits: '강렬함, 통찰력, 신비로움, 변혁, 집착',
    strength: '직관력, 결단력, 깊이, 연구력, 변혁 능력',
    weakness: '집착, 질투, 복수심, 비밀주의, 극단적 성향',
    love: '강렬하고 깊은 감정적 유대를 원합니다. 독점욕이 강하고 파트너에게 완전한 헌신을 요구합니다. 한번 상처받으면 용서하기 어려울 수 있습니다.',
    career: '심리학, 탐정, 외과의, 연구원, 금융, 비밀 정보 분야에 적합합니다. 숨겨진 진실을 밝혀내는 능력이 뛰어납니다.',
    money: '투자 본능이 뛰어납니다. 공동 재정이나 유산, 보험에 관심이 많습니다.',
    health: '생식기, 배설기, 스트레스에 주의하세요. 감정을 억누르면 신체 건강에 악영향을 줍니다.',
    spirit: '죽음과 재생의 사이클을 이해하는 존재입니다. 진정한 변혁은 자신의 그림자를 마주하는 데서 시작됩니다.',
    lucky: { color: '검정', number: 9, day: '화요일', stone: '오닉스', flower: '제라늄' },
    compatibility: {
      best: ['게자리', '물고기자리', '처녀자리', '염소자리'],
      good: ['전갈자리', '사자자리'],
      challenging: ['사자자리', '물병자리']
    },
    famous: ['피카소', '줄리아 로버츠', '라이언 고슬링'],
    bodyPart: '생식기, 항문, 배설기관',
    houseMeaning: '변혁과 재생, 공동 자원, 죽음과 신비'
  },
  {
    id: 8, name: '사수자리', en: 'Sagittarius', symbol: '♐', emoji: '🏹',
    element: '불', quality: '변동궁', ruler: '목성', rulerEmoji: '♃',
    dates: { start: { m: 11, d: 22 }, end: { m: 12, d: 21 } },
    traits: '낙관주의, 모험, 철학적, 자유로움, 무책임',
    strength: '낙관주의, 열린 마음, 유머, 여행 본능, 철학적 사고',
    weakness: '무책임, 과장, 인내심 부족, 직설적, 약속 불이행',
    love: '자유와 모험을 원합니다. 속박을 싫어하고 친구 같은 연애를 즐깁니다. 지적 자극과 함께하는 파트너를 선호합니다.',
    career: '여행사, 철학자, 교육자, 법조인, 스포츠, 출판업에 적합합니다. 큰 그림을 보는 능력이 탁월합니다.',
    money: '돈보다 경험을 중요시합니다. 여행과 교육에 투자하는 경향이 있습니다.',
    health: '엉덩이, 허벅지, 간에 주의하세요. 과음과 과식에 주의가 필요합니다.',
    spirit: '목성의 확장 에너지를 통해 철학과 지혜를 탐구합니다. 자유를 추구하되 책임감을 함께 키우는 것이 영적 과제입니다.',
    lucky: { color: '보라', number: 3, day: '목요일', stone: '터키석', flower: '카네이션' },
    compatibility: {
      best: ['양자리', '사자자리', '천칭자리', '물병자리'],
      good: ['사수자리', '처녀자리'],
      challenging: ['처녀자리', '쌍둥이자리']
    },
    famous: ['스티븐 스필버그', '브래드 피트', '테일러 스위프트'],
    bodyPart: '엉덩이, 허벅지, 간',
    houseMeaning: '철학과 고등 교육, 장거리 여행, 신념'
  },
  {
    id: 9, name: '염소자리', en: 'Capricorn', symbol: '♑', emoji: '🐐',
    element: '흙', quality: '활동궁', ruler: '토성', rulerEmoji: '♄',
    dates: { start: { m: 12, d: 22 }, end: { m: 1, d: 19 } },
    traits: '야망, 인내, 책임감, 현실적, 냉정함',
    strength: '목표 지향, 인내, 책임감, 조직력, 실용성',
    weakness: '냉담함, 비관주의, 지나친 일 중심, 고집, 유연성 부족',
    love: '신중하고 오래가는 관계를 선호합니다. 책임감 있는 파트너를 원하며, 감정 표현이 서툴 수 있지만 실질적인 헌신으로 사랑을 보여줍니다.',
    career: '경영, 정치, 건축, 금융, 행정, 의학에 적합합니다. 꾸준한 노력으로 정상에 오르는 것을 즐깁니다.',
    money: '재정적으로 가장 보수적이고 실용적입니다. 장기 투자와 안정적인 저축을 선호합니다.',
    health: '무릎, 뼈, 피부, 치아에 주의하세요. 과도한 스트레스와 걱정이 건강을 해칩니다.',
    spirit: '토성의 규율과 인내를 통해 성숙해집니다. 성공의 정상에서도 겸손함을 잃지 않는 것이 영적 과제입니다.',
    lucky: { color: '회색', number: 10, day: '토요일', stone: '오닉스', flower: '팬지' },
    compatibility: {
      best: ['황소자리', '처녀자리', '전갈자리', '물고기자리'],
      good: ['염소자리', '게자리'],
      challenging: ['양자리', '천칭자리']
    },
    famous: ['스티브 잡스', '케이트 미들턴', '제이미 폭스'],
    bodyPart: '무릎, 뼈, 피부, 치아',
    houseMeaning: '커리어와 사회적 지위, 공적 이미지'
  },
  {
    id: 10, name: '물병자리', en: 'Aquarius', symbol: '♒', emoji: '🏺',
    element: '공기', quality: '고정궁', ruler: '천왕성', rulerEmoji: '⛢',
    dates: { start: { m: 1, d: 20 }, end: { m: 2, d: 18 } },
    traits: '독창적, 인도주의적, 반항적, 지적, 고집',
    strength: '창의성, 진보성, 사회 의식, 독립심, 혁신 능력',
    weakness: '냉담함, 고집, 예측 불가, 반사회성, 감정 표현 어려움',
    love: '우정에서 시작되는 연애를 즐깁니다. 지적이고 독립적인 파트너를 원하며, 각자의 공간을 존중합니다. 전통적인 연애 방식에 얽매이지 않습니다.',
    career: 'IT, 과학, 사회활동가, 발명가, 미래학자, 항공 우주에 적합합니다. 혁신적인 아이디어로 세상을 바꾸는 것에 매력을 느낍니다.',
    money: '혁신적인 방법으로 돈을 버는 것을 좋아합니다. 암호화폐나 기술 관련 투자에 관심이 많습니다.',
    health: '발목, 순환계, 신경에 주의하세요. 정신적 과부하를 조심해야 합니다.',
    spirit: '천왕성의 혁명적 에너지로 세상을 변화시킵니다. 개인의 자유와 공동체의 조화를 동시에 추구하는 것이 영적 과제입니다.',
    lucky: { color: '파랑', number: 4, day: '토요일', stone: '자수정', flower: '난초' },
    compatibility: {
      best: ['쌍둥이자리', '천칭자리', '양자리', '사수자리'],
      good: ['물병자리', '사자자리'],
      challenging: ['황소자리', '전갈자리']
    },
    famous: ['오프라 윈프리', '아브라함 링컨', '에디슨'],
    bodyPart: '발목, 정강이, 순환계',
    houseMeaning: '우정과 소망, 집단과 조직, 미래 계획'
  },
  {
    id: 11, name: '물고기자리', en: 'Pisces', symbol: '♓', emoji: '🐟',
    element: '물', quality: '변동궁', ruler: '해왕성', rulerEmoji: '♆',
    dates: { start: { m: 2, d: 19 }, end: { m: 3, d: 20 } },
    traits: '공감 능력, 직관, 예술적, 이상주의, 현실 도피',
    strength: '공감력, 창의성, 직관력, 영적 감수성, 무한한 상상력',
    weakness: '현실 도피, 우유부단, 희생 과잉, 피해 의식, 중독 경향',
    love: '깊은 감정적 연결과 영적 교감을 원합니다. 로맨틱하고 헌신적이지만, 지나치게 희생하거나 이상화하는 경향이 있습니다.',
    career: '예술, 음악, 의료, 영적 지도자, 심리 치료, 자선 단체에 적합합니다. 타인의 고통에 공감하는 능력이 탁월합니다.',
    money: '돈보다 이상과 감정을 중요시합니다. 재정적으로 혼란스러울 수 있으므로 실용적인 조언이 필요합니다.',
    health: '발, 면역계, 중독에 주의하세요. 감정적 경계가 없으면 타인의 에너지에 지칩니다.',
    spirit: '해왕성의 신비로운 에너지로 우주와 연결됩니다. 모든 것과의 하나됨을 경험하는 것이 최고의 영적 성취입니다.',
    lucky: { color: '바다색', number: 7, day: '목요일', stone: '아쿠아마린', flower: '수선화' },
    compatibility: {
      best: ['게자리', '전갈자리', '황소자리', '염소자리'],
      good: ['물고기자리', '처녀자리'],
      challenging: ['쌍둥이자리', '사수자리']
    },
    famous: ['아인슈타인', '리한나', '저스틴 비버'],
    bodyPart: '발, 발바닥, 면역계',
    houseMeaning: '영성과 무의식, 비밀, 자기 희생'
  }
];

/* =====================================================
   2. 행성 완전 데이터 (외행성 포함)
   ===================================================== */
const PLANETS_DATA = [
  {
    name: '태양', en: 'Sun', emoji: '☀️',
    meaning: '자아, 생명력, 의식, 정체성, 아버지상, 창조력',
    houseRole: '자아 표현의 중심, 인생의 주요 목표',
    cycle: '1년 (한 별자리에 약 30일)',
    keywords: ['자아', '활력', '창조', '리더십', '자존감']
  },
  {
    name: '달',   en: 'Moon', emoji: '🌙',
    meaning: '감정, 무의식, 본능, 어머니상, 습관, 과거',
    houseRole: '감정적 욕구와 본능적 반응',
    cycle: '28일 (한 별자리에 약 2.5일)',
    keywords: ['감정', '직관', '기억', '모성', '안전욕구']
  },
  {
    name: '수성', en: 'Mercury', emoji: '☿',
    meaning: '사고, 소통, 학습, 이동, 상업, 분석력',
    houseRole: '의사소통과 정보 처리 방식',
    cycle: '88일 (역행 주기 약 3회/년)',
    keywords: ['소통', '지성', '분석', '이동', '학습']
  },
  {
    name: '금성', en: 'Venus', emoji: '♀️',
    meaning: '사랑, 아름다움, 예술, 가치관, 여성성, 매력',
    houseRole: '사랑과 아름다움에 대한 태도',
    cycle: '225일',
    keywords: ['사랑', '아름다움', '예술', '조화', '매력']
  },
  {
    name: '화성', en: 'Mars', emoji: '♂️',
    meaning: '행동력, 욕망, 에너지, 용기, 경쟁, 분노',
    houseRole: '욕망과 행동을 촉발하는 방식',
    cycle: '687일 (약 2년)',
    keywords: ['행동', '욕망', '에너지', '용기', '갈등']
  },
  {
    name: '목성', en: 'Jupiter', emoji: '♃',
    meaning: '확장, 행운, 지혜, 철학, 풍요, 낙관',
    houseRole: '행운과 성장이 일어나는 영역',
    cycle: '12년 (한 별자리에 약 1년)',
    keywords: ['행운', '확장', '지혜', '낙관', '풍요']
  },
  {
    name: '토성', en: 'Saturn', emoji: '♄',
    meaning: '규율, 제한, 책임, 시간, 카르마, 인내',
    houseRole: '시련과 성숙이 일어나는 영역',
    cycle: '29.5년 (한 별자리에 약 2.5년)',
    keywords: ['규율', '인내', '책임', '한계', '성숙']
  },
  {
    name: '천왕성', en: 'Uranus', emoji: '⛢',
    meaning: '혁명, 독창성, 혼란, 자유, 기술 혁신',
    houseRole: '변혁과 혁신이 일어나는 영역',
    cycle: '84년 (한 별자리에 약 7년)',
    keywords: ['혁명', '자유', '혁신', '독창성', '변화']
  },
  {
    name: '해왕성', en: 'Neptune', emoji: '♆',
    meaning: '영성, 환상, 직관, 예술, 이상주의, 착각',
    houseRole: '영적 경험과 이상이 드러나는 영역',
    cycle: '165년 (한 별자리에 약 14년)',
    keywords: ['영성', '꿈', '직관', '환상', '이상']
  },
];

/* =====================================================
   3. 12 하우스 의미
   ===================================================== */
const HOUSES = [
  { num: 1,  name: '제1하우스', title: '자아와 외모',      emoji: '👤', desc: '첫인상, 외모, 자기표현, 신체, 새로운 시작' },
  { num: 2,  name: '제2하우스', title: '재물과 가치',      emoji: '💰', desc: '물질적 소유, 재정, 자기 가치관, 감각적 즐거움' },
  { num: 3,  name: '제3하우스', title: '소통과 이동',      emoji: '💬', desc: '의사소통, 형제자매, 단거리 여행, 학습' },
  { num: 4,  name: '제4하우스', title: '가정과 뿌리',      emoji: '🏠', desc: '가족, 고향, 감정적 기반, 어머니, 내면 세계' },
  { num: 5,  name: '제5하우스', title: '창조와 사랑',      emoji: '❤️', desc: '사랑, 창조성, 오락, 자녀, 자기표현의 즐거움' },
  { num: 6,  name: '제6하우스', title: '건강과 봉사',      emoji: '🌿', desc: '일상적 일, 건강, 봉사, 직장 환경, 루틴' },
  { num: 7,  name: '제7하우스', title: '파트너십',         emoji: '🤝', desc: '결혼, 사업 파트너, 공개적 관계, 계약' },
  { num: 8,  name: '제8하우스', title: '변혁과 신비',      emoji: '🔮', desc: '죽음과 재생, 공동 자원, 성, 오컬트, 상속' },
  { num: 9,  name: '제9하우스', title: '철학과 여행',      emoji: '✈️', desc: '고등 교육, 장거리 여행, 철학, 신념, 법' },
  { num: 10, name: '제10하우스', title: '커리어와 명성',   emoji: '🏆', desc: '직업, 사회적 지위, 공적 이미지, 야망' },
  { num: 11, name: '제11하우스', title: '우정과 소망',     emoji: '⭐', desc: '친구, 집단, 사회적 이상, 미래 희망, 공동체' },
  { num: 12, name: '제12하우스', title: '영성과 무의식',   emoji: '🌊', desc: '숨겨진 것, 자기희생, 영성, 카르마, 내면 세계' },
];

/* =====================================================
   4. 주요 어스펙트 (각도 관계)
   ===================================================== */
const ASPECTS = [
  { name: '합(Conjunction)',   angle: 0,   orb: 8,  type: 'major', energy: '중립',  emoji: '⚡', desc: '두 행성이 같은 위치 — 에너지 결합, 강렬한 영향' },
  { name: '육분(Sextile)',     angle: 60,  orb: 6,  type: 'major', energy: '조화',  emoji: '✨', desc: '60도 — 기회와 재능, 자연스러운 협력' },
  { name: '사분(Square)',      angle: 90,  orb: 8,  type: 'major', energy: '긴장',  emoji: '⚔️', desc: '90도 — 마찰과 도전, 성장의 원동력' },
  { name: '삼분(Trine)',       angle: 120, orb: 8,  type: 'major', energy: '조화',  emoji: '🌟', desc: '120도 — 조화롭고 재능 있는 흐름' },
  { name: '대립(Opposition)', angle: 180, orb: 8,  type: 'major', energy: '긴장',  emoji: '⚖️', desc: '180도 — 양극성과 균형, 타인을 통한 자기 인식' },
  { name: '반사분(Semi-Square)',angle: 45, orb: 2,  type: 'minor', energy: '마찰',  emoji: '🔥', desc: '45도 — 미묘한 긴장, 조정이 필요한 에너지' },
  { name: '삼사분(Sesquiquadrate)', angle: 135, orb: 2, type: 'minor', energy: '마찰', emoji: '🌀', desc: '135도 — 내면의 마찰, 적응 필요' },
  { name: '오분(Quintile)',    angle: 72,  orb: 1.5,type: 'minor', energy: '재능',  emoji: '💫', desc: '72도 — 창조적 재능과 특별한 능력' },
];

/* =====================================================
   5. 별자리 궁합 매트릭스 (12×12)
   ===================================================== */
const COMPATIBILITY_MATRIX = {
  '양자리':    { '양자리': 75, '황소자리': 45, '쌍둥이자리': 85, '게자리': 40, '사자자리': 95, '처녀자리': 50, '천칭자리': 70, '전갈자리': 55, '사수자리': 90, '염소자리': 45, '물병자리': 85, '물고기자리': 60 },
  '황소자리':  { '양자리': 45, '황소자리': 80, '쌍둥이자리': 55, '게자리': 90, '사자자리': 50, '처녀자리': 88, '천칭자리': 70, '전갈자리': 60, '사수자리': 45, '염소자리': 92, '물병자리': 40, '물고기자리': 85 },
  '쌍둥이자리':{ '양자리': 85, '황소자리': 55, '쌍둥이자리': 78, '게자리': 58, '사자자리': 80, '처녀자리': 60, '천칭자리': 92, '전갈자리': 45, '사수자리': 80, '염소자리': 50, '물병자리': 90, '물고기자리': 52 },
  '게자리':    { '양자리': 40, '황소자리': 90, '쌍둥이자리': 58, '게자리': 75, '사자자리': 55, '처녀자리': 82, '천칭자리': 45, '전갈자리': 95, '사수자리': 48, '염소자리': 70, '물병자리': 42, '물고기자리': 90 },
  '사자자리':  { '양자리': 95, '황소자리': 50, '쌍둥이자리': 80, '게자리': 55, '사자자리': 78, '처녀자리': 55, '천칭자리': 85, '전갈자리': 50, '사수자리': 92, '염소자리': 48, '물병자리': 65, '물고기자리': 55 },
  '처녀자리':  { '양자리': 50, '황소자리': 88, '쌍둥이자리': 60, '게자리': 82, '사자자리': 55, '처녀자리': 80, '천칭자리': 58, '전갈자리': 85, '사수자리': 45, '염소자리': 90, '물병자리': 55, '물고기자리': 65 },
  '천칭자리':  { '양자리': 70, '황소자리': 70, '쌍둥이자리': 92, '게자리': 45, '사자자리': 85, '처녀자리': 58, '천칭자리': 78, '전갈자리': 48, '사수자리': 82, '염소자리': 48, '물병자리': 90, '물고기자리': 55 },
  '전갈자리':  { '양자리': 55, '황소자리': 60, '쌍둥이자리': 45, '게자리': 95, '사자자리': 50, '처녀자리': 85, '천칭자리': 48, '전갈자리': 80, '사수자리': 52, '염소자리': 85, '물병자리': 42, '물고기자리': 92 },
  '사수자리':  { '양자리': 90, '황소자리': 45, '쌍둥이자리': 80, '게자리': 48, '사자자리': 92, '처녀자리': 45, '천칭자리': 82, '전갈자리': 52, '사수자리': 78, '염소자리': 50, '물병자리': 85, '물고기자리': 55 },
  '염소자리':  { '양자리': 45, '황소자리': 92, '쌍둥이자리': 50, '게자리': 70, '사자자리': 48, '처녀자리': 90, '천칭자리': 48, '전갈자리': 85, '사수자리': 50, '염소자리': 82, '물병자리': 55, '물고기자리': 80 },
  '물병자리':  { '양자리': 85, '황소자리': 40, '쌍둥이자리': 90, '게자리': 42, '사자자리': 65, '처녀자리': 55, '천칭자리': 90, '전갈자리': 42, '사수자리': 85, '염소자리': 55, '물병자리': 80, '물고기자리': 52 },
  '물고기자리':{ '양자리': 60, '황소자리': 85, '쌍둥이자리': 52, '게자리': 90, '사자자리': 55, '처녀자리': 65, '천칭자리': 55, '전갈자리': 92, '사수자리': 55, '염소자리': 80, '물병자리': 52, '물고기자리': 78 },
};

/* =====================================================
   6. 2026년 월별 운세 데이터
   ===================================================== */
const MONTHLY_FORECAST_2026 = {
  '양자리':    ['1월: 새해 시작과 함께 강한 에너지가 솟아납니다. 새로운 계획을 세우기 좋은 시기입니다.','2월: 인간관계에서 예상치 못한 기회가 찾아옵니다.','3월: 생일 시즌! 최고의 에너지로 무엇이든 도전하세요.','4월: 재정적인 기회가 옵니다. 신중하게 판단하세요.','5월: 사랑과 창조성이 넘치는 달입니다.','6월: 잠시 속도를 늦추고 내면을 돌아보세요.','7월: 가족과 가정에 집중하는 시기입니다.','8월: 커리어에서 빛나는 성과를 이룹니다.','9월: 건강에 특별히 주의를 기울이세요.','10월: 파트너십과 협력에서 좋은 결과가 나타납니다.','11월: 변혁과 깊은 성찰의 시간입니다.','12월: 한 해를 마무리하며 내년을 준비하세요.'],
  '황소자리':  ['1월: 안정을 추구하는 달입니다. 기반을 다지세요.','2월: 재정 계획을 재검토하기 좋은 시기입니다.','3월: 창의적 에너지가 넘칩니다. 예술 활동에 도전하세요.','4월: 가족 관계가 돈독해지는 달입니다.','5월: 생일 시즌! 자신에게 특별한 선물을 해주세요.','6월: 사랑에서 진지한 진전이 있습니다.','7월: 소통이 원활해지는 달입니다.','8월: 여행이나 공부에 좋은 시기입니다.','9월: 커리어에서 중요한 결정을 내릴 수 있습니다.','10월: 건강 관리에 신경 쓰세요.','11월: 파트너십에서 좋은 소식이 있습니다.','12월: 연말 축제를 즐기며 내년을 설계하세요.'],
  '쌍둥이자리':['1월: 다양한 아이디어가 솟아나는 달입니다.','2월: 소통과 네트워킹이 활발해집니다.','3월: 재정적 기회를 잘 살펴보세요.','4월: 가정과 가족에 더 많은 시간을 투자하세요.','5월: 로맨스가 꽃피는 달입니다.','6월: 생일 시즌! 활기차고 즐거운 시간입니다.','7월: 건강 관리에 주의를 기울이세요.','8월: 파트너십에서 중요한 순간이 옵니다.','9월: 변화와 재생의 에너지를 느낍니다.','10월: 여행과 학습으로 시야를 넓히세요.','11월: 커리어에서 인정받는 달입니다.','12월: 사회적 관계가 활발해지는 마무리 달입니다.'],
  '게자리':    ['1월: 내면의 평화를 찾는 달입니다.','2월: 직관을 믿고 중요한 결정을 내리세요.','3월: 소통에서 오해가 생길 수 있습니다. 명확하게 표현하세요.','4월: 가정에서 따뜻한 에너지가 넘칩니다.','5월: 사랑이 더욱 깊어지는 달입니다.','6월: 건강에 특별히 신경 쓰세요.','7월: 생일 시즌! 감정이 풍부해지는 시기입니다.','8월: 파트너십에서 중요한 변화가 있습니다.','9월: 재정적으로 좋은 흐름입니다.','10월: 여행이나 공부로 성장하세요.','11월: 커리어에서 새로운 기회가 찾아옵니다.','12월: 가족과 함께하는 따뜻한 연말입니다.'],
  '사자자리':  ['1월: 목표를 세우고 강하게 시작하세요.','2월: 사랑과 창조성이 넘치는 달입니다.','3월: 재정적 기회가 옵니다.','4월: 가정에서 리더십을 발휘하세요.','5월: 자기표현에 집중하는 달입니다.','6월: 건강과 일상 루틴을 정비하세요.','7월: 파트너십에서 빛나는 달입니다.','8월: 생일 시즌! 모든 것이 잘 됩니다.','9월: 깊은 변화와 통찰의 달입니다.','10월: 여행과 모험을 즐기세요.','11월: 사회적으로 인정받는 달입니다.','12월: 우정과 소망에 집중하세요.'],
  '처녀자리':  ['1월: 새해 계획을 꼼꼼하게 세우세요.','2월: 재정적으로 좋은 흐름입니다.','3월: 소통에서 중요한 정보를 얻습니다.','4월: 가정의 변화가 예상됩니다.','5월: 창조적 프로젝트에 집중하세요.','6월: 건강과 루틴을 점검하는 달입니다.','7월: 파트너십에서 진지한 이야기를 나누세요.','8월: 재정 변화가 있는 달입니다.','9월: 생일 시즌! 분석력이 빛납니다.','10월: 여행으로 시야를 넓히세요.','11월: 커리어에서 중요한 전환점입니다.','12월: 우정을 다지는 마무리 달입니다.'],
  '천칭자리':  ['1월: 균형을 찾으며 새해를 시작하세요.','2월: 소통이 원활해지는 달입니다.','3월: 재정적 결정을 내릴 시기입니다.','4월: 가정과 사회 사이의 균형을 맞추세요.','5월: 로맨스에서 아름다운 발전이 있습니다.','6월: 건강을 위한 루틴을 만드세요.','7월: 파트너십에서 중요한 진전이 있습니다.','8월: 깊은 변화를 경험하는 달입니다.','9월: 학습과 여행으로 성장하세요.','10월: 생일 시즌! 조화로운 에너지가 넘칩니다.','11월: 커리어에서 인정을 받습니다.','12월: 사회적 관계가 풍성해지는 연말입니다.'],
  '전갈자리':  ['1월: 내면의 변화를 받아들이는 달입니다.','2월: 재정적 통찰력이 높아집니다.','3월: 소통에서 진실이 드러납니다.','4월: 가정에서 깊은 유대를 쌓으세요.','5월: 사랑에서 강렬한 경험이 있습니다.','6월: 건강에 주의를 기울이세요.','7월: 파트너십에서 균형을 찾으세요.','8월: 공동 자원에서 좋은 흐름입니다.','9월: 철학적 사고가 깊어지는 달입니다.','10월: 커리어에서 권위가 높아집니다.','11월: 생일 시즌! 변혁의 에너지가 강합니다.','12월: 영적인 성찰로 한 해를 마무리하세요.'],
  '사수자리':  ['1월: 목표를 높이 세우고 도전하세요.','2월: 소통에서 좋은 기회가 옵니다.','3월: 재정 흐름이 좋아지는 달입니다.','4월: 가정에서 넓은 시야를 가져오세요.','5월: 로맨스에서 자유로운 에너지를 즐기세요.','6월: 건강과 일상 균형을 잡으세요.','7월: 파트너십에서 모험을 즐기세요.','8월: 깊은 지혜를 얻는 달입니다.','9월: 여행이나 공부로 성장하세요.','10월: 커리어에서 새로운 도약이 있습니다.','11월: 사회적 영향력이 높아집니다.','12월: 생일 시즌! 낙관적인 에너지로 마무리하세요.'],
  '염소자리':  ['1월: 생일 시즌! 강한 의지로 새해를 시작하세요.','2월: 재정 목표를 위해 착실히 나아가세요.','3월: 소통에서 중요한 인연을 만납니다.','4월: 가정 기반을 더욱 튼튼히 하세요.','5월: 창조성이 빛나는 달입니다.','6월: 건강 관리에 집중하세요.','7월: 파트너십에서 진지한 전진이 있습니다.','8월: 공동 투자에서 좋은 결과가 나옵니다.','9월: 학습과 여행이 커리어에 도움이 됩니다.','10월: 사회적 지위가 높아지는 달입니다.','11월: 사회적 관계가 확장됩니다.','12월: 영적 성찰로 한 해를 마무리하세요.'],
  '물병자리':  ['1월: 생일 시즌! 혁신적인 아이디어로 새해를 시작하세요.','2월: 재정에서 예상치 못한 기회가 옵니다.','3월: 소통과 네트워킹이 활발해집니다.','4월: 가정에서 새로운 변화가 생깁니다.','5월: 창의적 프로젝트가 빛나는 달입니다.','6월: 건강 루틴을 점검하세요.','7월: 파트너십에서 독특한 연결이 생깁니다.','8월: 심층적인 변화를 경험합니다.','9월: 세계관을 넓히는 달입니다.','10월: 커리어에서 혁신적인 성과가 나옵니다.','11월: 친구들과 특별한 시간을 보내세요.','12월: 영적 성찰과 함께 연말을 마무리하세요.'],
  '물고기자리':['1월: 영적 감수성이 높아지는 달입니다.','2월: 생일 시즌! 직관을 믿고 나아가세요.','3월: 소통에서 오해를 주의하세요.','4월: 가정에서 따뜻한 에너지가 넘칩니다.','5월: 사랑에서 깊은 교감이 이루어집니다.','6월: 건강에 특히 주의하세요.','7월: 파트너십에서 균형을 찾으세요.','8월: 공동 자원에서 행운이 찾아옵니다.','9월: 지식과 여행으로 성장하세요.','10월: 커리어에서 영적 소명을 발견합니다.','11월: 사회적 이상을 실현하는 달입니다.','12월: 내면의 평화로 한 해를 마무리하세요.'],
};

/* =====================================================
   7. 오늘의 별자리 운세 (날짜 기반)
   ===================================================== */
function getTodayHoroscope(signName) {
  const today = new Date();
  const seed  = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const sign  = ZODIAC_SIGNS.find(s => s.name === signName);
  if (!sign) return null;

  const themes = [
    { emoji: '❤️', area: '연애', msgs: [`${sign.element}의 에너지로 관계에 온기를 불어넣을 수 있는 날입니다.`, `솔직한 감정 표현이 관계를 더 깊게 만들어줍니다.`, `혼자만의 시간도 사랑의 일부임을 기억하세요.`, `파트너와의 소통을 통해 오해를 해소하세요.`] },
    { emoji: '💼', area: '직업', msgs: [`${sign.ruler}의 도움으로 업무에서 탁월한 성과를 낼 수 있습니다.`, `새로운 협력 관계가 커리어에 도움이 됩니다.`, `꼼꼼한 준비가 오늘의 열쇠입니다.`, `창의적 아이디어를 실행에 옮길 최적의 날입니다.`] },
    { emoji: '💰', area: '재물', msgs: [`재정적 직관이 높아지는 날입니다. 신중히 판단하세요.`, `예상치 못한 수입이 생길 수 있습니다.`, `지출보다 저축에 초점을 맞추세요.`, `투자 결정은 충분히 고민한 후에 하세요.`] },
    { emoji: '🌿', area: '건강', msgs: [`${sign.bodyPart || '전체 건강'}에 특히 주의하는 날입니다.`, `가벼운 운동으로 에너지를 순환시키세요.`, `정신적 휴식이 신체 건강에도 도움이 됩니다.`, `규칙적인 생활 습관이 중요한 날입니다.`] },
    { emoji: '🔮', area: '전반', msgs: [`${sign.symbol} ${sign.name}의 에너지가 가장 빛나는 날입니다.`, `내면의 직관을 믿고 결정하세요.`, `긍정적인 마음가짐이 모든 것을 바꿉니다.`, `작은 친절이 큰 행운을 불러옵니다.`] },
  ];

  const randInt = (max, offset = 0) => ((seed * (offset + 1) * 1664525 + 1013904223) & 0x7fffffff) % max;
  const lucky = sign.lucky;

  return {
    sign,
    date: today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
    overall:   ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][randInt(5, 0)],
    love:      ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][randInt(5, 1)],
    career:    ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][randInt(5, 2)],
    money:     ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][randInt(5, 3)],
    health:    ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'][randInt(5, 4)],
    messages:  themes.map((t, i) => ({ ...t, msg: t.msgs[randInt(t.msgs.length, i + 5)] })),
    luckyColor:  lucky.color,
    luckyNumber: lucky.number,
    luckyDay:    lucky.day,
    luckyStone:  lucky.stone,
    advice: `오늘의 ${sign.name} 조언: ${sign.traits.split(',')[0].trim()}의 에너지를 활용하세요. ${lucky.stone}을 지니면 행운이 따릅니다.`
  };
}

/* =====================================================
   8. 별자리 궁합 분석
   ===================================================== */
function getCompatibility(sign1Name, sign2Name) {
  const s1 = ZODIAC_SIGNS.find(s => s.name === sign1Name);
  const s2 = ZODIAC_SIGNS.find(s => s.name === sign2Name);
  if (!s1 || !s2) return null;

  const score = COMPATIBILITY_MATRIX[sign1Name]?.[sign2Name] || 50;

  let level, emoji, summary;
  if (score >= 88)      { level = '최상의 궁합'; emoji = '💕💕💕'; }
  else if (score >= 75) { level = '좋은 궁합';   emoji = '💕💕';   }
  else if (score >= 60) { level = '무난한 궁합'; emoji = '💕';     }
  else if (score >= 45) { level = '노력 필요';   emoji = '⚡';     }
  else                  { level = '도전적 관계'; emoji = '🌪️';    }

  // 원소 조합 분석
  const elemCompat = getElementCompatibility(s1.element, s2.element);

  // 양식 조합 분석
  const qualCompat = getQualityCompatibility(s1.quality, s2.quality);

  return {
    sign1: s1, sign2: s2, score, level, emoji,
    elementCompat: elemCompat,
    qualityCompat: qualCompat,
    strengths: getCompatibilityStrengths(s1, s2, score),
    challenges: getCompatibilityChallenges(s1, s2),
    advice: getCompatibilityAdvice(s1, s2, score),
  };
}

function getElementCompatibility(e1, e2) {
  const combos = {
    '불+불':   { score: 85, desc: '열정과 에너지가 폭발적으로 시너지를 냅니다. 함께라면 무엇이든 가능하지만, 가끔 불이 너무 강하게 타오를 수 있습니다.' },
    '불+공기': { score: 90, desc: '공기가 불을 더욱 크게 키워줍니다. 서로에게 영감을 주고받으며 빛나는 관계입니다.' },
    '불+흙':   { score: 50, desc: '불이 흙을 뜨겁게 달굴 수 있습니다. 차이를 극복하면 안정 속에서 열정을 찾을 수 있습니다.' },
    '불+물':   { score: 45, desc: '물이 불을 끌 수 있습니다. 서로의 차이를 이해하면 균형을 찾을 수 있습니다.' },
    '흙+흙':   { score: 85, desc: '현실적이고 안정적인 관계입니다. 함께 단단한 기반을 쌓아나갑니다.' },
    '흙+공기': { score: 55, desc: '흙은 공기의 자유로움을 이해하기 어렵습니다. 서로의 필요를 존중하는 것이 핵심입니다.' },
    '흙+물':   { score: 88, desc: '물이 흙에 생명을 줍니다. 서로를 성장시키는 이상적인 조합입니다.' },
    '공기+공기':{ score: 80, desc: '지적인 교류가 끊이지 않습니다. 자유와 소통이 넘치는 관계입니다.' },
    '공기+물': { score: 60, desc: '사고와 감정이 만나는 관계입니다. 서로의 방식을 이해하면 균형 잡힌 관계가 됩니다.' },
    '물+물':   { score: 85, desc: '깊은 감정적 유대를 형성합니다. 서로를 직관적으로 이해하는 관계입니다.' },
  };

  const key1 = `${e1}+${e2}`;
  const key2 = `${e2}+${e1}`;
  return combos[key1] || combos[key2] || { score: 60, desc: '독특한 조합입니다. 서로의 차이에서 배울 것이 많습니다.' };
}

function getQualityCompatibility(q1, q2) {
  if (q1 === q2) {
    const msgs = {
      '활동궁': '두 사람 모두 행동력이 넘칩니다. 방향을 맞추면 놀라운 시너지를 낼 수 있습니다.',
      '고정궁': '두 사람 모두 안정을 추구합니다. 함께 변화를 받아들이는 연습이 필요합니다.',
      '변동궁': '두 사람 모두 유연하지만 중심이 필요합니다. 서로에게 안정감을 줄 수 있어야 합니다.',
    };
    return msgs[q1] || '';
  }
  const combos = {
    '활동궁+고정궁': '활동궁이 시작하면 고정궁이 지속시킵니다. 서로의 강점을 보완하는 관계입니다.',
    '활동궁+변동궁': '함께 변화를 만들어내는 역동적인 관계입니다.',
    '고정궁+변동궁': '고정궁의 안정과 변동궁의 유연성이 균형을 이룰 수 있습니다.',
  };
  const key1 = `${q1}+${q2}`;
  const key2 = `${q2}+${q1}`;
  return combos[key1] || combos[key2] || '';
}

function getCompatibilityStrengths(s1, s2, score) {
  const strengths = [];
  if (s1.element === s2.element) strengths.push(`같은 ${s1.element} 원소로 서로를 직관적으로 이해합니다`);
  if (score >= 85) strengths.push('천생연분에 가까운 강한 끌림이 있습니다');
  if (score >= 75) strengths.push('서로의 장점이 빛나는 시너지를 만듭니다');
  if (s1.compatibility?.best?.includes(s2.name)) strengths.push(`${s2.name}은 ${s1.name}에게 최고의 궁합 중 하나입니다`);
  strengths.push(`${s1.name}의 ${s1.strength.split(',')[0]}와 ${s2.name}의 ${s2.strength.split(',')[0]}가 잘 어울립니다`);
  return strengths.slice(0, 3);
}

function getCompatibilityChallenges(s1, s2) {
  const challenges = [];
  if (s1.element !== s2.element) challenges.push(`${s1.element}과 ${s2.element}의 다른 에너지 방식을 이해해야 합니다`);
  if (s1.quality !== s2.quality) challenges.push(`${s1.quality}과 ${s2.quality}의 다른 접근 방식을 조율해야 합니다`);
  challenges.push(`${s1.name}의 ${s1.weakness.split(',')[0]}와 ${s2.name}의 ${s2.weakness.split(',')[0]}이 충돌할 수 있습니다`);
  return challenges.slice(0, 2);
}

function getCompatibilityAdvice(s1, s2, score) {
  if (score >= 88) return `${s1.name}과 ${s2.name}은 우주가 함께하도록 설계한 듯한 관계입니다. 서로에게 솔직하고 진정성 있게 대하면 이 관계는 평생 빛날 것입니다.`;
  if (score >= 75) return `${s1.name}과 ${s2.name}은 훌륭한 궁합을 가지고 있습니다. 서로의 차이를 존중하면 더욱 아름다운 관계로 발전할 수 있습니다.`;
  if (score >= 60) return `${s1.name}과 ${s2.name}은 서로를 이해하려는 노력이 필요합니다. 소통을 늘리고 상대의 관점에서 생각해 보세요.`;
  return `${s1.name}과 ${s2.name}은 도전적인 관계이지만, 서로의 차이에서 배울 것이 많습니다. 인내와 존중으로 관계를 발전시켜 나가세요.`;
}

/* =====================================================
   9. 율리우스일 & 천체 계산 (기존 + 강화)
   ===================================================== */
function toJulianDay(year, month, day) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) +
         Math.floor(30.6001 * (month + 1)) +
         day + B - 1524.5;
}

function getSunLongitude(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  let L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  L0 = ((L0 % 360) + 360) % 360;
  let M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  M = ((M % 360) + 360) % 360;
  const Mr = M * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
          + 0.000289 * Math.sin(3 * Mr);
  let sunLon = L0 + C;
  return ((sunLon % 360) + 360) % 360;
}

function lonToSignIndex(lon) {
  return Math.floor(((lon % 360) + 360) % 360 / 30) % 12;
}

function getSunSign(year, month, day) {
  const jd  = toJulianDay(year, month, day);
  const lon = getSunLongitude(jd);
  const idx = lonToSignIndex(lon);
  return { ...ZODIAC_SIGNS[idx], longitude: lon.toFixed(2) };
}

function getMoonSign(year, month, day) {
  const jd = toJulianDay(year, month, day);
  const T  = (jd - 2451545.0) / 36525.0;
  let L = 218.316 + 481267.881 * T;
  L = ((L % 360) + 360) % 360;
  let M = 134.963 + 477198.868 * T;
  M = ((M % 360) + 360) % 360;
  let F = 93.272 + 483202.018 * T;
  F = ((F % 360) + 360) % 360;
  const Mr = M * Math.PI / 180;
  let moonLon = L
    + 6.289 * Math.sin(Mr)
    - 1.274 * Math.sin(2 * (L - F) * Math.PI / 180)
    + 0.658 * Math.sin(2 * F * Math.PI / 180)
    - 0.186 * Math.sin(2 * M * Math.PI / 180)
    - 0.059 * Math.sin(2 * (F - M) * Math.PI / 180);
  moonLon = ((moonLon % 360) + 360) % 360;
  const idx = lonToSignIndex(moonLon);
  return { ...ZODIAC_SIGNS[idx], longitude: moonLon.toFixed(2), planet: '달' };
}

const ORBITAL_ELEMENTS = {
  mercury: { L: [252.250324, 149472.674986], e: 0.205635, omega: 29.125 },
  venus:   { L: [181.979801, 58517.815676],  e: 0.006773, omega: 54.884 },
  mars:    { L: [355.433,    19140.299],      e: 0.093405, omega: 286.502 },
  jupiter: { L: [34.351519,  3034.905675],   e: 0.048498, omega: 14.753 },
  saturn:  { L: [50.077444,  1222.113795],   e: 0.055546, omega: 92.432 },
  uranus:  { L: [314.055005, 428.4669983],   e: 0.046381, omega: 170.005 },
  neptune: { L: [304.348665, 218.4862002],   e: 0.009456, omega: 44.496 },
};

function getPlanetLongitude(planetKey, jd) {
  const el = ORBITAL_ELEMENTS[planetKey];
  if (!el) return 0;
  const T = (jd - 2451545.0) / 36525.0;
  let L = el.L[0] + el.L[1] * T / 36525;
  L = ((L % 360) + 360) % 360;
  const M  = ((L - el.omega + 360) % 360);
  const Mr = M * Math.PI / 180;
  const e  = el.e;
  const Ec = M + (180 / Math.PI) * e * Math.sin(Mr) * (1 + e * Math.cos(Mr));
  const Ecr = Ec * Math.PI / 180;
  const v  = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(Ecr / 2));
  let lon  = ((v * 180 / Math.PI + el.omega) % 360 + 360) % 360;
  return lon;
}

function getAllPlanetPositions(year, month, day) {
  const jd = toJulianDay(year, month, day);
  const sunLon   = getSunLongitude(jd);
  const moonData = getMoonSign(year, month, day);
  const positions = [
    { planet: '태양',   emoji: '☀️', longitude: sunLon, sign: ZODIAC_SIGNS[lonToSignIndex(sunLon)].name, signEmoji: ZODIAC_SIGNS[lonToSignIndex(sunLon)].emoji },
    { planet: '달',     emoji: '🌙', longitude: parseFloat(moonData.longitude), sign: moonData.name, signEmoji: moonData.emoji },
  ];
  const planetMap = {
    mercury: { name: '수성', emoji: '☿'  },
    venus:   { name: '금성', emoji: '♀'  },
    mars:    { name: '화성', emoji: '♂'  },
    jupiter: { name: '목성', emoji: '♃'  },
    saturn:  { name: '토성', emoji: '♄'  },
    uranus:  { name: '천왕성', emoji: '⛢' },
    neptune: { name: '해왕성', emoji: '♆' },
  };
  Object.entries(planetMap).forEach(([key, info]) => {
    const lon  = getPlanetLongitude(key, jd);
    const sign = ZODIAC_SIGNS[lonToSignIndex(lon)];
    positions.push({ planet: info.name, emoji: info.emoji, longitude: lon, sign: sign.name, signEmoji: sign.emoji });
  });
  return positions;
}

/* =====================================================
   10. 어스펙트 계산
   ===================================================== */
function calcAspects(planets) {
  const aspects = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = Math.abs(planets[i].longitude - planets[j].longitude);
      const angle = diff > 180 ? 360 - diff : diff;
      ASPECTS.forEach(asp => {
        if (Math.abs(angle - asp.angle) <= asp.orb) {
          aspects.push({
            planet1: planets[i].planet, emoji1: planets[i].emoji,
            planet2: planets[j].planet, emoji2: planets[j].emoji,
            aspectName: asp.name, aspectEmoji: asp.emoji,
            energy: asp.energy, desc: asp.desc,
            angle: angle.toFixed(1),
          });
        }
      });
    }
  }
  return aspects;
}

/* =====================================================
   11. 어센던트 & 미드헤븐 계산
   ===================================================== */
function getGMST(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  return ((GMST % 360) + 360) % 360;
}

function calcAscendant(year, month, day, hourUT, lat, lonObs) {
  const jd   = toJulianDay(year, month, day) + hourUT / 24;
  const GMST = getGMST(jd);
  const LST  = ((GMST + lonObs + 360) % 360);
  const T    = (jd - 2451545.0) / 36525.0;
  const eps  = (23.439291111 - 0.013004167 * T) * Math.PI / 180;
  const LSTR = LST * Math.PI / 180;
  const latR = lat * Math.PI / 180;
  let ascLon = Math.atan2(
    Math.cos(LSTR),
    -(Math.sin(LSTR) * Math.cos(eps) + Math.tan(latR) * Math.sin(eps))
  ) * 180 / Math.PI;
  ascLon = ((ascLon % 360) + 360) % 360;
  const idx = lonToSignIndex(ascLon);
  return { longitude: ascLon, sign: ZODIAC_SIGNS[idx], signName: ZODIAC_SIGNS[idx].name };
}

function calcMidheaven(year, month, day, hourUT, lonObs) {
  const jd   = toJulianDay(year, month, day) + hourUT / 24;
  const GMST = getGMST(jd);
  const LST  = ((GMST + lonObs + 360) % 360);
  const T    = (jd - 2451545.0) / 36525.0;
  const eps  = (23.439291111 - 0.013004167 * T) * Math.PI / 180;
  let mcLon  = Math.atan2(Math.tan(LST * Math.PI / 180), Math.cos(eps)) * 180 / Math.PI;
  mcLon = ((mcLon % 360) + 360) % 360;
  const idx  = lonToSignIndex(mcLon);
  return { longitude: mcLon, sign: ZODIAC_SIGNS[idx], signName: ZODIAC_SIGNS[idx].name };
}

/* =====================================================
   12. 사용자 입력 파싱
   ===================================================== */
function parseAstrologyInput(text) {
  const result = { found: false, year: null, month: null, day: null, hour: null, minute: 0, lat: 37.5, lonObs: 127.0 };
  const yearMatch  = text.match(/(\d{4})년/);
  if (yearMatch)  result.year  = parseInt(yearMatch[1]);
  const monthMatch = text.match(/(\d{1,2})월/);
  if (monthMatch) result.month = parseInt(monthMatch[1]);
  const dayMatch   = text.match(/(\d{1,2})일/);
  if (dayMatch)   result.day   = parseInt(dayMatch[1]);

  const ampmMatch = text.match(/(오전|오후|am|pm|AM|PM)/i);
  const hourMatch = text.match(/(\d{1,2})시/);
  if (hourMatch) {
    let h = parseInt(hourMatch[1]);
    if (ampmMatch) {
      if (/오후|pm/i.test(ampmMatch[1]) && h < 12) h += 12;
      if (/오전|am/i.test(ampmMatch[1]) && h === 12) h = 0;
    }
    result.hour = h;
  }

  const sijiMap = { '자시': 0, '축시': 2, '인시': 4, '묘시': 6, '진시': 8, '사시': 10, '오시': 12, '미시': 14, '신시': 16, '유시': 18, '술시': 20, '해시': 22 };
  for (const [siName, siHour] of Object.entries(sijiMap)) {
    if (text.includes(siName)) { result.hour = siHour; break; }
  }
  const minMatch = text.match(/(\d{1,2})분/);
  if (minMatch) result.minute = parseInt(minMatch[1]);

  const cityMap = {
    '부산': [35.1, 129.0], '대구': [35.9, 128.6], '인천': [37.5, 126.7],
    '대전': [36.4, 127.4], '광주': [35.2, 126.9], '제주': [33.5, 126.5],
    '수원': [37.3, 127.0], '울산': [35.5, 129.3], '청주': [36.6, 127.5],
  };
  for (const [city, coords] of Object.entries(cityMap)) {
    if (text.includes(city)) { [result.lat, result.lonObs] = coords; break; }
  }

  if (result.year && result.month && result.day) result.found = true;
  return result;
}

/* =====================================================
   13. 완전한 출생 차트 생성
   ===================================================== */
function calcAstrologyChart(input) {
  const { year, month, day, hour, minute, lat, lonObs } = input;
  if (!year || !month || !day) return { error: '생년월일이 필요합니다.' };

  const sunSign  = getSunSign(year, month, day);
  const moonSign = getMoonSign(year, month, day);
  const planets  = getAllPlanetPositions(year, month, day);

  let ascendant  = null;
  let midheaven  = null;
  if (hour !== null && hour !== undefined) {
    const hourUT = hour + (minute || 0) / 60 - 9;
    ascendant = calcAscendant(year, month, day, hourUT, lat || 37.5, lonObs || 127.0);
    midheaven = calcMidheaven(year, month, day, hourUT, lonObs || 127.0);
  }

  // 어스펙트 계산
  const aspects = calcAspects(planets.slice(0, 7)); // 태양~토성 기준

  // 원소/양식 분석
  const elementCount  = { '불': 0, '흙': 0, '공기': 0, '물': 0 };
  const qualityCount  = { '활동궁': 0, '고정궁': 0, '변동궁': 0 };
  [sunSign, moonSign, ascendant?.sign].forEach(s => {
    if (s?.element)  elementCount[s.element]++;
    if (s?.quality)  qualityCount[s.quality]++;
  });
  const dominantElement = Object.entries(elementCount).sort((a, b) => b[1] - a[1])[0][0];
  const dominantQuality = Object.entries(qualityCount).sort((a, b) => b[1] - a[1])[0][0];

  // 2026 행성 트랜짓
  const currentJupiter = '쌍둥이자리 → 게자리 (2026년 6월 전환)';
  const currentSaturn  = '물고기자리 → 양자리 (2026년 5월 전환)';
  const currentUranus  = '황소자리 (2026년 내내)';

  return {
    year, month, day, hour, minute,
    sunSign,
    moonSign: ZODIAC_SIGNS[lonToSignIndex(parseFloat(moonSign.longitude))],
    moonSignData: moonSign,
    ascendant, midheaven,
    planets, aspects,
    elementCount, qualityCount,
    dominantElement, dominantQuality,
    currentJupiter, currentSaturn, currentUranus,
    yearForecast2026: getYearForecast2026(sunSign.name),
    monthlyForecast: MONTHLY_FORECAST_2026[sunSign.name] || [],
    todayHoroscope: getTodayHoroscope(sunSign.name),
  };
}

/* =====================================================
   14. 2026년 별자리별 운세 키워드
   ===================================================== */
function getYearForecast2026(signName) {
  const forecasts = {
    '양자리':    { overall: '2026년은 새로운 도전과 성장의 해입니다. 화성의 강력한 에너지가 당신을 앞으로 밀어줍니다.', love: '새로운 만남의 기회가 많습니다. 적극적으로 다가가세요.', career: '리더십을 발휘할 기회가 많습니다. 도전하면 승진이 보입니다.', money: '투자보다는 안정적 저축에 집중하세요.', health: '과로와 두통에 주의하세요.', lucky: '3~5월', bestMonth: '3월', worstMonth: '9월' },
    '황소자리':  { overall: '2026년은 안정과 풍요의 해입니다. 꾸준한 노력이 결실을 맺습니다.', love: '안정적인 관계가 더욱 깊어집니다.', career: '재능을 인정받는 시기입니다.', money: '저축이 늘어납니다. 부동산 투자도 좋습니다.', health: '목 건강을 챙기세요.', lucky: '4~6월', bestMonth: '5월', worstMonth: '11월' },
    '쌍둥이자리':{ overall: '2026년은 소통과 다양한 기회의 해입니다. 네트워크를 넓히세요.', love: '소통을 통해 관계가 발전합니다.', career: '다양한 프로젝트 기회가 옵니다.', money: '예상치 못한 수입이 생깁니다.', health: '수면 부족에 주의하세요.', lucky: '5~7월', bestMonth: '6월', worstMonth: '12월' },
    '게자리':    { overall: '2026년은 가정과 감정의 해입니다. 사랑하는 사람들과 더 많은 시간을 보내세요.', love: '깊은 감정적 교류가 있습니다.', career: '가정과 일의 균형이 중요합니다.', money: '부동산 운이 좋습니다.', health: '위장 관리에 주의하세요.', lucky: '6~8월', bestMonth: '7월', worstMonth: '1월' },
    '사자자리':  { overall: '2026년은 빛나는 자기표현의 해입니다. 당신의 재능을 세상에 보여줄 때입니다.', love: '로맨틱하고 특별한 시간들이 기다립니다.', career: '리더십이 인정받는 해입니다.', money: '창의적인 방법으로 수입이 늘어납니다.', health: '심장 건강을 챙기세요.', lucky: '7~9월', bestMonth: '8월', worstMonth: '2월' },
    '처녀자리':  { overall: '2026년은 꼼꼼함과 전문성이 빛나는 해입니다. 세부 사항에 집중하면 성공이 따릅니다.', love: '섬세한 배려로 관계가 깊어집니다.', career: '전문성을 인정받는 황금기입니다.', money: '꼼꼼한 재정 관리로 자산이 늘어납니다.', health: '소화기 건강에 주의하세요.', lucky: '8~10월', bestMonth: '9월', worstMonth: '3월' },
    '천칭자리':  { overall: '2026년은 파트너십과 조화의 해입니다. 균형 잡힌 관계에서 성장합니다.', love: '조화로운 파트너십이 꽃핍니다.', career: '협업에서 최고의 성과가 나옵니다.', money: '균형 잡힌 재정이 안정을 줍니다.', health: '신장 건강에 주의하세요.', lucky: '9~11월', bestMonth: '10월', worstMonth: '4월' },
    '전갈자리':  { overall: '2026년은 변혁과 깊이의 해입니다. 내면의 변화를 통해 더 강해집니다.', love: '강렬한 감정의 해입니다. 진정성 있는 관계를 추구하세요.', career: '변혁과 새로운 시작이 기다립니다.', money: '투자에서 좋은 성과가 나옵니다.', health: '스트레스 관리가 핵심입니다.', lucky: '10~12월', bestMonth: '11월', worstMonth: '5월' },
    '사수자리':  { overall: '2026년은 자유와 확장의 해입니다. 새로운 지평을 향해 나아가세요.', love: '자유로운 연애 속에서도 깊이를 찾으세요.', career: '해외나 교육 관련 기회가 옵니다.', money: '교육 투자가 효과를 발휘합니다.', health: '허리 건강에 주의하세요.', lucky: '11~1월', bestMonth: '12월', worstMonth: '6월' },
    '염소자리':  { overall: '2026년은 경력의 정점에 도달하는 해입니다. 꾸준한 노력의 결실을 맺습니다.', love: '진지한 관계의 진전이 있습니다.', career: '경력 최고점에 도달합니다.', money: '장기 투자의 결실이 나타납니다.', health: '무릎 건강에 주의하세요.', lucky: '12~2월', bestMonth: '1월', worstMonth: '7월' },
    '물병자리':  { overall: '2026년은 혁신과 독창성의 해입니다. 당신만의 방식으로 세상을 바꿀 수 있습니다.', love: '독특하고 신선한 만남이 기다립니다.', career: 'IT와 혁신 분야에서 기회가 넘칩니다.', money: '예상치 못한 행운이 찾아옵니다.', health: '순환계에 주의하세요.', lucky: '1~3월', bestMonth: '2월', worstMonth: '8월' },
    '물고기자리':{ overall: '2026년은 영감과 창조성의 해입니다. 직관을 믿고 꿈을 향해 나아가세요.', love: '영적 교감이 깊어지는 해입니다.', career: '창조적 작업에서 성과가 빛납니다.', money: '직관을 믿는 투자가 효과를 발휘합니다.', health: '면역력 관리가 중요합니다.', lucky: '2~4월', bestMonth: '3월', worstMonth: '9월' },
  };
  return forecasts[signName] || {};
}

/* =====================================================
   15. 출생 차트 → Gemini 프롬프트 텍스트 변환 (강화)
   ===================================================== */
function astrologyToPromptText(chart) {
  if (!chart || chart.error) return '';

  let text = '\n\n【🌟 서양 점성술 출생 차트 (반드시 이 데이터를 기반으로 해석할 것)】\n';
  text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

  text += `☀️ 태양궁: ${chart.sunSign.name} (${chart.sunSign.en}) | ${chart.sunSign.longitude}°\n`;
  text += `   원소: ${chart.sunSign.element} | 양식: ${chart.sunSign.quality} | 지배행성: ${chart.sunSign.ruler}\n`;
  text += `   특성: ${chart.sunSign.traits}\n\n`;

  text += `🌙 달 별자리: ${chart.moonSign.name} | 황도 ${chart.moonSignData?.longitude || '?'}°\n`;
  text += `   감정/본능: ${chart.moonSign.traits}\n\n`;

  if (chart.ascendant) {
    text += `⬆️ 어센던트(상승궁): ${chart.ascendant.signName} | ${chart.ascendant.longitude.toFixed(1)}°\n`;
    text += `   외면적 성격, 타인에게 보이는 첫인상\n\n`;
  }
  if (chart.midheaven) {
    text += `🏆 미드헤븐(MC): ${chart.midheaven.signName}\n`;
    text += `   사회적 지위, 커리어 방향, 공적 이미지\n\n`;
  }

  text += '🪐 행성 위치 (출생 시):\n';
  chart.planets.forEach(p => {
    text += `   ${p.emoji} ${p.planet}: ${p.sign}${p.signEmoji} (${p.longitude.toFixed(1)}°)\n`;
  });

  text += `\n🔥 원소 분포: `;
  Object.entries(chart.elementCount).forEach(([el, cnt]) => { if (cnt > 0) text += `${el}(${cnt}) `; });
  text += `\n   지배 원소: ${chart.dominantElement} | 지배 양식: ${chart.dominantQuality}\n`;

  if (chart.aspects && chart.aspects.length > 0) {
    text += '\n⚡ 주요 어스펙트:\n';
    chart.aspects.slice(0, 5).forEach(asp => {
      text += `   ${asp.aspectEmoji} ${asp.planet1}${asp.emoji1} ${asp.aspectName} ${asp.planet2}${asp.emoji2} (${asp.angle}°) — ${asp.energy}\n`;
    });
  }

  text += `\n📅 2026년 주요 행성 트랜짓:\n`;
  text += `   목성(행운·확장): ${chart.currentJupiter}\n`;
  text += `   토성(시련·성숙): ${chart.currentSaturn}\n`;
  text += `   천왕성(혁신):   ${chart.currentUranus}\n`;

  if (chart.yearForecast2026 && Object.keys(chart.yearForecast2026).length > 0) {
    const f = chart.yearForecast2026;
    text += `\n🗓️ 2026년 ${chart.sunSign.name} 운세:\n`;
    text += `   📌 종합: ${f.overall || ''}\n`;
    text += `   💕 연애: ${f.love || ''}\n`;
    text += `   💼 직업: ${f.career || ''}\n`;
    text += `   💰 재물: ${f.money || ''}\n`;
    text += `   🏥 건강: ${f.health || ''}\n`;
    text += `   ✨ 행운 시기: ${f.lucky || ''}\n`;
  }

  text += '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  text += '【해석 가이드】\n';
  text += '1. 태양궁(의식), 달 별자리(감정), 어센던트(외면)의 3대 요소를 중심으로 해석하세요.\n';
  text += '2. 행성 위치와 어스펙트가 개인의 성격과 운명에 어떤 영향을 주는지 설명하세요.\n';
  text += '3. 2026년 트랜짓 행성이 출생 차트와 어떻게 상호작용하는지 분석하세요.\n';
  text += '4. 구체적이고 실용적인 조언을 포함하세요. 긍정적이지만 현실적으로 작성하세요.\n';
  text += '5. 마크다운(**, ##)을 사용하여 가독성 좋게 작성하세요.\n';

  return text;
}

/* =====================================================
   16. HTML 렌더링 헬퍼
   ===================================================== */
function renderZodiacCardHTML(sign, size = 'normal') {
  const theme = ZODIAC_THEMES[sign.id] || { bg: '#667eea', accent: '#764ba2' };
  const isSmall = size === 'small';
  return `
    <div class="zodiac-card ${isSmall ? 'zodiac-card-sm' : ''}"
         style="background:linear-gradient(135deg,${theme.bg},${theme.accent});box-shadow:0 8px 32px ${theme.glow}">
      <div class="zodiac-card-symbol">${sign.symbol}</div>
      <div class="zodiac-card-emoji">${sign.emoji}</div>
      <div class="zodiac-card-name">${sign.name}</div>
      <div class="zodiac-card-en">${sign.en}</div>
      ${!isSmall ? `
        <div class="zodiac-card-dates">${sign.dates.start.m}/${sign.dates.start.d} ~ ${sign.dates.end.m}/${sign.dates.end.d}</div>
        <div class="zodiac-card-element">${sign.element} · ${sign.quality}</div>
        <div class="zodiac-card-ruler">${sign.rulerEmoji} ${sign.ruler}</div>
      ` : ''}
    </div>
  `;
}

function renderPlanetPositionsHTML(planets) {
  return planets.map(p => `
    <div class="planet-item">
      <span class="planet-emoji">${p.emoji}</span>
      <span class="planet-name">${p.planet}</span>
      <span class="planet-sign">${p.signEmoji} ${p.sign}</span>
      <span class="planet-deg">${(+p.longitude).toFixed(1)}°</span>
    </div>
  `).join('');
}

function renderAspectsHTML(aspects) {
  if (!aspects || aspects.length === 0) return '<div style="color:rgba(255,255,255,0.4);font-size:0.8rem">어스펙트 데이터 없음</div>';
  return aspects.slice(0, 8).map(asp => `
    <div class="aspect-item ${asp.energy === '조화' ? 'aspect-harmony' : asp.energy === '긴장' ? 'aspect-tension' : ''}">
      <span class="aspect-emoji">${asp.aspectEmoji}</span>
      <span class="aspect-planets">${asp.planet1} ${asp.aspectName} ${asp.planet2}</span>
      <span class="aspect-energy">${asp.energy}</span>
    </div>
  `).join('');
}

/* =====================================================
   17. 전역 노출
   ===================================================== */
window.ZODIAC_SIGNS            = ZODIAC_SIGNS;
window.ZODIAC_THEMES           = ZODIAC_THEMES;
window.PLANETS_DATA            = PLANETS_DATA;
window.HOUSES                  = HOUSES;
window.ASPECTS                 = ASPECTS;
window.COMPATIBILITY_MATRIX    = COMPATIBILITY_MATRIX;
window.MONTHLY_FORECAST_2026   = MONTHLY_FORECAST_2026;

window.getSunSign              = getSunSign;
window.getMoonSign             = getMoonSign;
window.getAllPlanetPositions    = getAllPlanetPositions;
window.calcAscendant           = calcAscendant;
window.calcMidheaven           = calcMidheaven;
window.calcAspects             = calcAspects;
window.calcAstrologyChart      = calcAstrologyChart;
window.parseAstrologyInput     = parseAstrologyInput;
window.astrologyToPromptText   = astrologyToPromptText;
window.getYearForecast2026     = getYearForecast2026;
window.getCompatibility        = getCompatibility;
window.getTodayHoroscope       = getTodayHoroscope;
window.renderZodiacCardHTML    = renderZodiacCardHTML;
window.renderPlanetPositionsHTML = renderPlanetPositionsHTML;
window.renderAspectsHTML       = renderAspectsHTML;
