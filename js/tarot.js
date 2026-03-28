/* =========================================================
   운세ON — js/tarot.js
   타로카드 완전 구현 (78장 메이저/마이너 아르카나)
   - 78장 카드 데이터 (정방향/역방향 의미)
   - 스프레드: 1장/3장(과거-현재-미래)/켈틱크로스 10장
   - 질문 유형별 자동 스프레드 선택
   - 셔플 알고리즘 (Fisher-Yates)
   ========================================================= */

/* =====================================================
   1. 메이저 아르카나 22장
   ===================================================== */
const MAJOR_ARCANA = [
  {
    id: 0, name: 'The Fool', kr: '바보', emoji: '🌟',
    upright:  { theme: '새로운 시작, 순수함, 자유로운 영혼, 모험', advice: '두려움 없이 새로운 여정을 시작하세요. 무한한 가능성이 펼쳐져 있습니다.' },
    reversed: { theme: '무모함, 경솔함, 준비 부족, 방황', advice: '충동적인 결정을 자제하고 먼저 충분히 준비하세요.' }
  },
  {
    id: 1, name: 'The Magician', kr: '마법사', emoji: '✨',
    upright:  { theme: '의지력, 창조, 기술, 능력 발휘', advice: '당신에게는 목표를 이룰 모든 도구가 있습니다. 집중력을 발휘하세요.' },
    reversed: { theme: '기만, 잠재력 낭비, 조종, 집중력 부족', advice: '자신의 능력을 과신하거나 다른 사람을 속이지 마세요.' }
  },
  {
    id: 2, name: 'The High Priestess', kr: '여사제', emoji: '🌙',
    upright:  { theme: '직관, 내면의 지혜, 신비, 잠재의식', advice: '내면의 목소리에 귀 기울이세요. 직관이 정답을 알고 있습니다.' },
    reversed: { theme: '억압된 직관, 비밀, 혼란, 표면적 판단', advice: '감추어진 정보가 있을 수 있으니 섣불리 판단하지 마세요.' }
  },
  {
    id: 3, name: 'The Empress', kr: '여황제', emoji: '🌸',
    upright:  { theme: '풍요, 모성, 자연, 창조성, 번영', advice: '풍요로운 시기입니다. 창조적 에너지를 마음껏 발휘하세요.' },
    reversed: { theme: '의존성, 창조적 막힘, 과보호, 결핍감', advice: '타인에게 의존하기보다 자신의 내면 풍요를 먼저 채우세요.' }
  },
  {
    id: 4, name: 'The Emperor', kr: '황제', emoji: '👑',
    upright:  { theme: '권위, 구조, 안정, 리더십, 통제', advice: '체계적이고 논리적으로 접근하세요. 강한 의지로 목표를 이루세요.' },
    reversed: { theme: '독재, 경직성, 과도한 통제, 아버지 문제', advice: '너무 완고하게 고집하지 말고 유연성을 발휘하세요.' }
  },
  {
    id: 5, name: 'The Hierophant', kr: '교황', emoji: '⛪',
    upright:  { theme: '전통, 규범, 종교, 멘토, 인습', advice: '전통적인 방법이나 신뢰할 수 있는 조언자의 도움을 받으세요.' },
    reversed: { theme: '반항, 새로운 접근법, 관습 타파, 개인주의', advice: '기존의 틀에 얽매이지 말고 자신만의 길을 찾아보세요.' }
  },
  {
    id: 6, name: 'The Lovers', kr: '연인', emoji: '💕',
    upright:  { theme: '사랑, 조화, 선택, 가치관의 일치', advice: '진심에서 우러난 선택을 하세요. 가치관이 맞는 관계가 이어집니다.' },
    reversed: { theme: '불일치, 잘못된 선택, 가치관 충돌, 이별', advice: '관계에서 솔직한 대화가 필요합니다. 회피하지 마세요.' }
  },
  {
    id: 7, name: 'The Chariot', kr: '전차', emoji: '🏆',
    upright:  { theme: '승리, 의지, 결단력, 통제, 성공', advice: '강한 의지로 밀어붙이세요. 승리는 당신 것입니다.' },
    reversed: { theme: '방향 상실, 의지력 부족, 충동, 패배', advice: '목표를 명확히 하고 에너지를 한 방향으로 모으세요.' }
  },
  {
    id: 8, name: 'Strength', kr: '힘', emoji: '🦁',
    upright:  { theme: '용기, 인내, 내면의 힘, 자기 통제', advice: '부드러운 힘으로 상황을 이끄세요. 무력보다 설득이 효과적입니다.' },
    reversed: { theme: '자기 의심, 나약함, 두려움, 억압', advice: '자신을 믿으세요. 두려움이 당신을 가로막고 있습니다.' }
  },
  {
    id: 9, name: 'The Hermit', kr: '은둔자', emoji: '🕯️',
    upright:  { theme: '내면 탐구, 고독, 지혜, 성찰', advice: '잠시 혼자만의 시간을 가지며 내면을 들여다보세요.' },
    reversed: { theme: '고립, 외로움, 지나친 은둔, 거부', advice: '너무 혼자만의 세계에 갇히지 말고 세상과 연결되세요.' }
  },
  {
    id: 10, name: 'Wheel of Fortune', kr: '운명의 수레바퀴', emoji: '🎡',
    upright:  { theme: '행운, 변화의 순환, 전환점, 운명', advice: '지금이 변화의 전환점입니다. 흐름에 몸을 맡기세요.' },
    reversed: { theme: '불운, 저항, 나쁜 타이밍, 변화 거부', advice: '변화를 거부하지 마세요. 저항할수록 더 힘들어집니다.' }
  },
  {
    id: 11, name: 'Justice', kr: '정의', emoji: '⚖️',
    upright:  { theme: '공정, 진실, 인과응보, 균형', advice: '공정하고 정직하게 행동하세요. 결과는 노력에 비례합니다.' },
    reversed: { theme: '불공정, 부정직, 편견, 책임 회피', advice: '자신의 행동에 책임을 지고 공정한 시각으로 바라보세요.' }
  },
  {
    id: 12, name: 'The Hanged Man', kr: '매달린 사람', emoji: '🙃',
    upright:  { theme: '희생, 새로운 관점, 기다림, 내려놓기', advice: '지금은 행동보다 기다림의 시간입니다. 다른 각도로 바라보세요.' },
    reversed: { theme: '지연, 저항, 쓸모없는 희생, 집착', advice: '무의미한 희생을 그만두고 새로운 방향으로 나아가세요.' }
  },
  {
    id: 13, name: 'Death', kr: '죽음', emoji: '🦋',
    upright:  { theme: '변환, 끝과 시작, 변화, 해방', advice: '두려워하지 마세요. 이 끝은 새로운 시작의 문입니다.' },
    reversed: { theme: '변화 거부, 정체, 집착, 과거에 갇힘', advice: '과거의 것을 붙잡고 있으면 새것이 들어올 수 없습니다.' }
  },
  {
    id: 14, name: 'Temperance', kr: '절제', emoji: '🌊',
    upright:  { theme: '균형, 조화, 인내, 절제, 치유', advice: '극단을 피하고 균형을 유지하세요. 천천히 꾸준히 가는 것이 최선입니다.' },
    reversed: { theme: '불균형, 과잉, 조급함, 부조화', advice: '한쪽으로 치우치지 말고 중용을 찾으세요.' }
  },
  {
    id: 15, name: 'The Devil', kr: '악마', emoji: '⛓️',
    upright:  { theme: '속박, 집착, 물질주의, 중독', advice: '무엇이 당신을 붙잡고 있는지 직시하세요. 해방될 힘이 당신 안에 있습니다.' },
    reversed: { theme: '해방, 집착에서 벗어남, 자유, 각성', advice: '사슬이 풀리기 시작했습니다. 자유를 향해 나아가세요.' }
  },
  {
    id: 16, name: 'The Tower', kr: '탑', emoji: '⚡',
    upright:  { theme: '갑작스러운 변화, 혼란, 충격, 계시', advice: '예상치 못한 변화가 옵니다. 무너지는 것은 더 나은 것을 위한 공간입니다.' },
    reversed: { theme: '변화 회피, 재앙 예방, 혼란 지속', advice: '변화를 더 이상 미룰 수 없습니다. 직면할 준비를 하세요.' }
  },
  {
    id: 17, name: 'The Star', kr: '별', emoji: '⭐',
    upright:  { theme: '희망, 영감, 재생, 평온, 치유', advice: '어두운 시간이 지나고 빛이 들어옵니다. 희망을 잃지 마세요.' },
    reversed: { theme: '절망, 믿음 상실, 낙담, 차단', advice: '믿음을 잃지 마세요. 희망의 빛은 아직 꺼지지 않았습니다.' }
  },
  {
    id: 18, name: 'The Moon', kr: '달', emoji: '🌕',
    upright:  { theme: '환상, 불안, 무의식, 혼란, 잠재된 두려움', advice: '보이는 것이 전부가 아닙니다. 직관을 믿되 명확해질 때까지 기다리세요.' },
    reversed: { theme: '혼란 해소, 진실 드러남, 두려움 극복', advice: '안개가 걷히기 시작합니다. 진실이 서서히 모습을 드러냅니다.' }
  },
  {
    id: 19, name: 'The Sun', kr: '태양', emoji: '☀️',
    upright:  { theme: '성공, 기쁨, 활력, 명확함, 자신감', advice: '밝고 긍정적인 에너지가 넘칩니다. 자신 있게 앞으로 나아가세요.' },
    reversed: { theme: '과도한 낙관, 자만, 일시적 우울', advice: '기쁨을 찾을 수 있습니다. 작은 것에서 행복을 발견하세요.' }
  },
  {
    id: 20, name: 'Judgement', kr: '심판', emoji: '🔔',
    upright:  { theme: '반성, 재탄생, 내면의 부름, 각성', advice: '과거를 정리하고 새롭게 태어날 준비를 하세요. 큰 결정의 시간입니다.' },
    reversed: { theme: '자기 의심, 판단 회피, 과거 집착', advice: '스스로를 너무 가혹하게 심판하지 마세요. 용서가 필요합니다.' }
  },
  {
    id: 21, name: 'The World', kr: '세계', emoji: '🌍',
    upright:  { theme: '완성, 성취, 통합, 여행, 새로운 단계', advice: '하나의 사이클이 완성되었습니다. 충분히 기뻐하고 다음 여정을 준비하세요.' },
    reversed: { theme: '미완성, 지연, 완성 저항, 단기적 사고', advice: '마지막 한 걸음이 남아있습니다. 포기하지 마세요.' }
  }
];

/* =====================================================
   2. 마이너 아르카나 56장 (핵심 키워드)
   ===================================================== */
const MINOR_SUITS = {
  wands: { kr: '완드', element: '불', theme: '열정·의지·창조·직업' },
  cups:  { kr: '컵',  element: '물', theme: '감정·관계·직관·사랑' },
  swords:{ kr: '검',  element: '바람', theme: '사고·갈등·진실·소통' },
  pentacles:{ kr: '펜타클', element: '흙', theme: '물질·재물·실용·건강' }
};

// 마이너 아르카나 숫자별 의미
const MINOR_NUMBER_MEANING = {
  1:  { name: '에이스', upright: '새로운 시작, 씨앗, 잠재력', reversed: '막힌 에너지, 지연된 시작' },
  2:  { name: '2',    upright: '균형, 선택, 기다림, 파트너십', reversed: '불균형, 우유부단, 과부하' },
  3:  { name: '3',    upright: '성장, 협력, 초기 성공, 창조', reversed: '실망, 오해, 재작업 필요' },
  4:  { name: '4',    upright: '안정, 기반, 휴식, 공고화', reversed: '정체, 지나친 안주, 변화 필요' },
  5:  { name: '5',    upright: '갈등, 도전, 손실, 변화', reversed: '화해, 교훈 수용, 회복' },
  6:  { name: '6',    upright: '조화, 나눔, 해결, 전진', reversed: '부채, 불평등, 망설임' },
  7:  { name: '7',    upright: '도전, 방어, 지략, 신뢰 점검', reversed: '포기, 과신, 미루기' },
  8:  { name: '8',    upright: '움직임, 빠른 변화, 집중, 기술', reversed: '지연, 방향 상실, 좌절' },
  9:  { name: '9',    upright: '완성 직전, 독립, 내면의 힘', reversed: '불안, 집착, 고립' },
  10: { name: '10',   upright: '완성, 과도한 짐, 끝, 유산', reversed: '짐 내려놓기, 실패 직전' },
  11: { name: '페이지', upright: '호기심, 메시지, 새로운 배움', reversed: '나쁜 소식, 지연, 미숙함' },
  12: { name: '나이트', upright: '행동, 용기, 변화, 추진력', reversed: '충동, 무모함, 방해' },
  13: { name: '퀸',   upright: '돌봄, 직관, 성숙함, 지지', reversed: '냉담, 의존, 불안정' },
  14: { name: '킹',   upright: '리더십, 권위, 숙달, 성취', reversed: '독재, 통제, 미성숙한 권력' }
};

/* =====================================================
   3. 타로 셔플 & 카드 뽑기
   ===================================================== */

// 52비트 의사난수 시드 기반 셔플 (질문 + 시각 기반)
function shuffleDeck(question) {
  // 전체 78장 인덱스 배열 생성
  const deck = [];
  for (let i = 0; i < 78; i++) deck.push({ idx: i, reversed: false });

  // 시드: 질문 텍스트 + 현재 시각(밀리초)
  const seed = (question || '').split('').reduce(function(a, c) { return a + c.charCodeAt(0); }, 0) + Date.now();
  let s = seed;
  function rand() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  }

  // Fisher-Yates 셔플
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
    // 역방향 50% 확률
    deck[i].reversed = rand() > 0.5;
  }
  deck[0].reversed = rand() > 0.5;

  return deck;
}

// 카드 정보 조회
function getCardInfo(deckEntry) {
  const idx = deckEntry.idx;
  const isReversed = deckEntry.reversed;

  if (idx < 22) {
    // 메이저 아르카나
    const card = MAJOR_ARCANA[idx];
    return {
      type: 'major',
      name: card.kr + ' (' + card.name + ')',
      emoji: card.emoji,
      direction: isReversed ? '역방향' : '정방향',
      theme: isReversed ? card.reversed.theme : card.upright.theme,
      advice: isReversed ? card.reversed.advice : card.upright.advice,
      isReversed: isReversed
    };
  } else {
    // 마이너 아르카나
    const suitIdx = Math.floor((idx - 22) / 14);
    const numIdx  = ((idx - 22) % 14) + 1;
    const suitKeys = ['wands', 'cups', 'swords', 'pentacles'];
    const suit = MINOR_SUITS[suitKeys[suitIdx]];
    const num  = MINOR_NUMBER_MEANING[numIdx];
    return {
      type: 'minor',
      name: suit.kr + ' ' + num.name,
      emoji: ['🔥', '💧', '⚔️', '⭐'][suitIdx],
      direction: isReversed ? '역방향' : '정방향',
      theme: suit.theme + ' | ' + (isReversed ? num.reversed : num.upright),
      advice: isReversed ? num.reversed : num.upright,
      suit: suit.kr,
      element: suit.element,
      isReversed: isReversed
    };
  }
}

/* =====================================================
   4. 스프레드 (배치 방식)
   ===================================================== */

// 1장 스프레드 — 간단한 yes/no, 오늘의 운세
function drawOneCard(question) {
  const deck = shuffleDeck(question);
  const card = getCardInfo(deck[0]);
  return {
    spread: '원 카드',
    cards: [{ position: '오늘의 메시지', ...card }]
  };
}

// 3장 스프레드 — 과거/현재/미래
function drawThreeCards(question) {
  const deck = shuffleDeck(question);
  const positions = ['과거 (원인)', '현재 (상황)', '미래 (결과)'];
  return {
    spread: '쓰리 카드',
    cards: positions.map(function(pos, i) {
      return { position: pos, ...getCardInfo(deck[i]) };
    })
  };
}

// 5장 스프레드 — 관계/연애 집중
function drawRelationshipCards(question) {
  const deck = shuffleDeck(question);
  const positions = ['나의 현재 감정', '상대방의 마음', '우리 관계의 현재', '장애물', '앞으로의 방향'];
  return {
    spread: '관계 스프레드',
    cards: positions.map(function(pos, i) {
      return { position: pos, ...getCardInfo(deck[i]) };
    })
  };
}

// 켈틱 크로스 10장 — 심층 분석
function drawCelticCross(question) {
  const deck = shuffleDeck(question);
  const positions = [
    '현재 상황', '장애물/도움', '먼 과거 (근본)', '가까운 과거',
    '가능한 결과', '가까운 미래', '내면의 자아', '외부 환경',
    '희망과 두려움', '최종 결과'
  ];
  return {
    spread: '켈틱 크로스 (10장)',
    cards: positions.map(function(pos, i) {
      return { position: pos, ...getCardInfo(deck[i]) };
    })
  };
}

/* =====================================================
   5. 질문 유형 분석 → 스프레드 자동 선택
   ===================================================== */
function selectSpread(question) {
  if (!question) return drawOneCard(question);

  const q = question;
  // 연애/관계 질문
  if (/연애|사랑|좋아|남자친구|여자친구|짝사랑|썸|이별|재회|결혼|배우자|궁합/.test(q)) {
    return drawRelationshipCards(q);
  }
  // 심층/종합 분석
  if (/심층|종합|전반|인생|운명|켈틱|상세|자세/.test(q)) {
    return drawCelticCross(q);
  }
  // 과거/현재/미래
  if (/앞으로|미래|결과|될까|어떻게|취업|사업|진로|직장|이직/.test(q)) {
    return drawThreeCards(q);
  }
  // 기본: 1장
  return drawOneCard(q);
}

/* =====================================================
   6. 타로 결과 → Gemini 프롬프트 텍스트 변환
   ===================================================== */
function tarotToPromptText(reading) {
  if (!reading) return '';

  let text = '\n\n【사전 뽑힌 타로 카드 (이 카드를 그대로 해석할 것)】\n';
  text += '스프레드: ' + reading.spread + '\n\n';

  reading.cards.forEach(function(card, i) {
    text += (i + 1) + '. [' + card.position + '] ';
    text += card.emoji + ' ' + card.name + ' (' + card.direction + ')\n';
    text += '   핵심 의미: ' + card.theme + '\n';
    text += '   조언: ' + card.advice + '\n\n';
  });

  text += '위 카드들을 기반으로 사용자의 질문에 맞는 깊이 있는 타로 해석을 해주세요.\n';
  text += '각 카드의 위치별 의미와 전체적인 흐름을 연결하여 통합적으로 해석하세요.\n';

  return text;
}

// 전역 노출
window.selectSpread    = selectSpread;
window.drawOneCard     = drawOneCard;
window.drawThreeCards  = drawThreeCards;
window.drawRelationshipCards = drawRelationshipCards;
window.drawCelticCross = drawCelticCross;
window.tarotToPromptText = tarotToPromptText;
