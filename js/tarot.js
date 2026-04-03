/* =========================================================
   운세ON — js/tarot.js  v3.0
   타로카드 완전 강화판
   - 78장 메이저/마이너 아르카나 (상세 의미 강화)
   - 카드별 고유 비주얼 심볼 & 컬러 테마
   - 스프레드 5종: 원카드 / 쓰리카드 / 관계 / 직업/재물 / 켈틱크로스
   - 질문 유형 자동 감지 → 최적 스프레드 자동 선택
   - 오늘의 타로 메시지 기능
   - 퍼스널 포커스 메시지 (연애/직업/재물/건강 유형별)
   - Gemini AI 프롬프트 최적화 변환
   ========================================================= */

/* =====================================================
   0. 카드 비주얼 테마 (색상 + 심볼)
   ===================================================== */
const CARD_THEMES = {
  major: {
    0:  { bg: '#667eea', accent: '#764ba2', symbol: '🌟', aura: 'rainbow' },
    1:  { bg: '#f093fb', accent: '#f5576c', symbol: '✨', aura: 'gold'    },
    2:  { bg: '#4facfe', accent: '#00f2fe', symbol: '🌙', aura: 'silver'  },
    3:  { bg: '#43e97b', accent: '#38f9d7', symbol: '🌸', aura: 'green'   },
    4:  { bg: '#fa709a', accent: '#fee140', symbol: '👑', aura: 'red'     },
    5:  { bg: '#a18cd1', accent: '#fbc2eb', symbol: '⛪', aura: 'purple'  },
    6:  { bg: '#ff9a9e', accent: '#fad0c4', symbol: '💕', aura: 'pink'    },
    7:  { bg: '#fccb90', accent: '#d57eeb', symbol: '🏆', aura: 'gold'    },
    8:  { bg: '#f6d365', accent: '#fda085', symbol: '🦁', aura: 'orange'  },
    9:  { bg: '#96fbc4', accent: '#f9f586', symbol: '🕯️', aura: 'teal'   },
    10: { bg: '#fda085', accent: '#f6d365', symbol: '🎡', aura: 'rainbow' },
    11: { bg: '#84fab0', accent: '#8fd3f4', symbol: '⚖️', aura: 'blue'   },
    12: { bg: '#a1c4fd', accent: '#c2e9fb', symbol: '🙃', aura: 'blue'   },
    13: { bg: '#2c3e50', accent: '#bdc3c7', symbol: '🦋', aura: 'dark'   },
    14: { bg: '#89f7fe', accent: '#66a6ff', symbol: '🌊', aura: 'cyan'   },
    15: { bg: '#1a1a2e', accent: '#e94560', symbol: '⛓️', aura: 'dark'   },
    16: { bg: '#f5af19', accent: '#f12711', symbol: '⚡', aura: 'red'    },
    17: { bg: '#0f0c29', accent: '#a8edea', symbol: '⭐', aura: 'star'   },
    18: { bg: '#243b55', accent: '#141e30', symbol: '🌕', aura: 'dark'   },
    19: { bg: '#f9d423', accent: '#ff4e50', symbol: '☀️', aura: 'gold'   },
    20: { bg: '#ee9ca7', accent: '#ffdde1', symbol: '🔔', aura: 'pink'   },
    21: { bg: '#56ccf2', accent: '#2f80ed', symbol: '🌍', aura: 'green'  },
  },
  wands:     { bg: '#ff6b35', accent: '#f7c59f', symbol: '🔥' },
  cups:      { bg: '#4a90d9', accent: '#b8d4f0', symbol: '💧' },
  swords:    { bg: '#6c757d', accent: '#adb5bd', symbol: '⚔️' },
  pentacles: { bg: '#28a745', accent: '#a8d5b5', symbol: '⭐' },
};

/* =====================================================
   1. 메이저 아르카나 22장 (강화 버전)
   ===================================================== */
const MAJOR_ARCANA = [
  {
    id: 0, name: 'The Fool', kr: '바보', num: '0',
    upright: {
      theme: '새로운 시작, 순수함, 자유로운 영혼, 모험, 무한한 가능성',
      advice: '두려움 없이 새로운 여정을 시작하세요. 지금 이 순간 당신은 무한한 가능성 앞에 서 있습니다. 완벽하지 않아도 됩니다. 그냥 첫걸음을 내딛는 것이 중요합니다.',
      keyword: ['시작', '모험', '자유', '순수', '가능성'],
      love: '새로운 만남이나 관계의 시작을 암시합니다. 가벼운 마음으로 접근하세요.',
      work: '새로운 프로젝트나 직업에 대한 도전이 길합니다. 두려워하지 마세요.',
      money: '재정적 모험을 감수할 시기입니다. 단, 무모하지 않게 준비하세요.'
    },
    reversed: {
      theme: '무모함, 경솔함, 준비 부족, 방황, 위험한 도전',
      advice: '충동적인 결정을 자제하고 먼저 충분히 준비하세요. 지금은 뛰어들기보다 한 발 물러서서 상황을 파악할 때입니다.',
      keyword: ['무모함', '경솔', '미성숙', '방황', '위험'],
      love: '너무 가볍게 관계를 대하거나 준비 없이 뛰어드는 것을 경계하세요.',
      work: '섣부른 결정은 금물. 충분한 준비와 계획이 필요합니다.',
      money: '충동 구매나 무계획적인 투자를 피하세요.'
    }
  },
  {
    id: 1, name: 'The Magician', kr: '마법사', num: 'I',
    upright: {
      theme: '의지력, 창조, 기술, 능력 발휘, 집중, 자원 활용',
      advice: '당신에게는 목표를 이룰 모든 도구가 이미 갖춰져 있습니다. 집중력을 최대한 발휘하고 가진 능력을 총동원하세요. 지금이 바로 행동할 때입니다.',
      keyword: ['능력', '집중', '창조', '의지', '실현'],
      love: '적극적으로 매력을 어필하세요. 당신의 능력이 상대를 끌어당깁니다.',
      work: '역량을 마음껏 발휘할 기회입니다. 자신감을 갖고 임하세요.',
      money: '재정적 목표를 달성할 능력이 있습니다. 계획을 실행에 옮기세요.'
    },
    reversed: {
      theme: '기만, 잠재력 낭비, 조종, 집중력 부족, 트릭',
      advice: '자신의 능력을 과신하거나 다른 사람을 속이려 하지 마세요. 진정한 능력을 갈고닦는 것이 먼저입니다.',
      keyword: ['기만', '낭비', '조종', '집중력부족', '트릭'],
      love: '상대방이 나를 조종하거나 기만하는지 주의하세요.',
      work: '잠재력을 낭비하고 있지는 않은지 돌아보세요.',
      money: '사기나 속임수에 주의하세요. 너무 좋은 투자 제안은 의심하세요.'
    }
  },
  {
    id: 2, name: 'The High Priestess', kr: '여사제', num: 'II',
    upright: {
      theme: '직관, 내면의 지혜, 신비, 잠재의식, 고요함, 인내',
      advice: '외부의 소음을 잠시 끄고 내면의 목소리에 귀 기울이세요. 당신의 직관이 정답을 이미 알고 있습니다. 서두르지 마세요.',
      keyword: ['직관', '지혜', '신비', '내면', '인내'],
      love: '말보다 느낌으로 상대를 이해하세요. 내면의 감각을 믿으세요.',
      work: '지금은 행동보다 관찰과 준비의 시간입니다.',
      money: '충동보다 직관을 따르세요. 조용히 기회를 기다리세요.'
    },
    reversed: {
      theme: '억압된 직관, 비밀, 혼란, 표면적 판단, 거짓',
      advice: '감추어진 정보가 있을 수 있으니 섣불리 판단하지 마세요. 직관을 억누르고 있다면 다시 내면의 소리를 들으세요.',
      keyword: ['비밀', '혼란', '억압', '불신', '거짓'],
      love: '상대방이 무언가를 숨기고 있을 수 있습니다. 솔직한 대화가 필요합니다.',
      work: '정보가 충분하지 않습니다. 더 파악한 후 결정하세요.',
      money: '재정 관련 숨겨진 정보가 있을 수 있습니다. 세심하게 살피세요.'
    }
  },
  {
    id: 3, name: 'The Empress', kr: '여황제', num: 'III',
    upright: {
      theme: '풍요, 모성, 자연, 창조성, 번영, 감각적 즐거움, 출산',
      advice: '풍요로운 시기입니다. 창조적 에너지를 마음껏 발휘하고 자신을 돌보는 것도 잊지 마세요. 삶의 아름다움을 충분히 누리세요.',
      keyword: ['풍요', '창조', '모성', '번영', '자연'],
      love: '사랑이 풍성하게 꽃피는 시기입니다. 감정을 표현하세요.',
      work: '창의적인 프로젝트나 아이디어가 빛을 발합니다.',
      money: '재물운이 좋습니다. 투자한 것이 결실을 맺을 때입니다.'
    },
    reversed: {
      theme: '의존성, 창조적 막힘, 과보호, 결핍감, 불임',
      advice: '타인에게 의존하기보다 자신의 내면 풍요를 먼저 채우세요. 창조적 에너지가 막혀 있다면 자연과 접촉해 보세요.',
      keyword: ['의존', '막힘', '결핍', '과보호', '불안'],
      love: '집착이나 과도한 의존이 관계를 해칩니다. 각자의 공간이 필요합니다.',
      work: '창의력이 막힌 시기입니다. 잠시 쉬면서 재충전하세요.',
      money: '과소비나 낭비에 주의하세요. 실용적으로 관리하세요.'
    }
  },
  {
    id: 4, name: 'The Emperor', kr: '황제', num: 'IV',
    upright: {
      theme: '권위, 구조, 안정, 리더십, 통제, 아버지상, 체계',
      advice: '체계적이고 논리적으로 접근하세요. 강한 의지와 명확한 규칙으로 목표를 향해 나아가면 반드시 원하는 것을 이룰 수 있습니다.',
      keyword: ['권위', '안정', '리더십', '체계', '통제'],
      love: '안정적이고 책임감 있는 파트너를 만나거나, 관계에 명확한 기반을 세울 때입니다.',
      work: '리더십을 발휘할 기회입니다. 체계적인 계획이 성공을 가져옵니다.',
      money: '안정적인 재정 관리. 체계적인 저축과 투자 전략을 세우세요.'
    },
    reversed: {
      theme: '독재, 경직성, 과도한 통제, 아버지 문제, 미성숙한 권위',
      advice: '너무 완고하게 고집하지 말고 유연성을 발휘하세요. 통제에 집착하면 오히려 모든 것을 잃을 수 있습니다.',
      keyword: ['독재', '경직', '통제', '완고', '미성숙'],
      love: '지나친 통제나 지배가 관계를 망칩니다. 상대를 존중하세요.',
      work: '권위에 대한 저항이나 갈등이 생길 수 있습니다. 타협점을 찾으세요.',
      money: '재정 통제가 지나치거나 부족합니다. 균형을 찾으세요.'
    }
  },
  {
    id: 5, name: 'The Hierophant', kr: '교황', num: 'V',
    upright: {
      theme: '전통, 규범, 종교, 멘토, 인습, 결혼, 공식적 절차',
      advice: '전통적인 방법이나 신뢰할 수 있는 조언자의 도움을 받으세요. 기존의 제도와 관습 안에서 답을 찾을 수 있습니다.',
      keyword: ['전통', '규범', '멘토', '결혼', '공식'],
      love: '공식적인 관계로 발전(약혼, 결혼)할 조짐이 보입니다.',
      work: '기존 방식을 따르고 선배나 멘토의 조언을 구하세요.',
      money: '안정적이고 전통적인 방법으로 자산을 관리하세요.'
    },
    reversed: {
      theme: '반항, 새로운 접근법, 관습 타파, 개인주의, 이단',
      advice: '기존의 틀에 얽매이지 말고 자신만의 길을 찾아보세요. 형식보다 진정성이 중요합니다.',
      keyword: ['반항', '자유', '개인주의', '변화', '이단'],
      love: '기존 관계의 규칙이나 틀을 벗어나고 싶은 충동이 있습니다.',
      work: '틀에 박힌 방식을 깨고 새로운 접근법을 시도할 때입니다.',
      money: '전통적 방법 대신 새로운 재테크 방식을 탐색해 보세요.'
    }
  },
  {
    id: 6, name: 'The Lovers', kr: '연인', num: 'VI',
    upright: {
      theme: '사랑, 조화, 선택, 가치관의 일치, 깊은 유대, 결합',
      advice: '진심에서 우러난 선택을 하세요. 가치관이 맞는 파트너와의 관계는 더욱 깊어집니다. 지금은 마음의 소리를 따를 때입니다.',
      keyword: ['사랑', '선택', '조화', '가치관', '결합'],
      love: '깊고 의미 있는 사랑의 시기입니다. 진정한 연결이 이루어집니다.',
      work: '함께 일하는 파트너십이 좋은 결과를 냅니다.',
      money: '가치관에 맞는 재정 결정이 필요합니다. 파트너와의 논의도 중요합니다.'
    },
    reversed: {
      theme: '불일치, 잘못된 선택, 가치관 충돌, 이별, 유혹',
      advice: '관계에서 솔직한 대화가 필요합니다. 회피하거나 선택을 미루지 마세요. 진정으로 원하는 것이 무엇인지 돌아보세요.',
      keyword: ['불일치', '갈등', '이별', '선택실패', '유혹'],
      love: '가치관이 맞지 않거나 관계에 균열이 생기고 있습니다.',
      work: '동료나 파트너와의 갈등. 솔직한 대화로 해결하세요.',
      money: '재정 결정에서 감정적 판단을 주의하세요.'
    }
  },
  {
    id: 7, name: 'The Chariot', kr: '전차', num: 'VII',
    upright: {
      theme: '승리, 의지, 결단력, 통제, 성공, 자기 극복, 전진',
      advice: '강한 의지로 밀어붙이세요. 어떤 장애물도 당신의 앞길을 막을 수 없습니다. 목표에 집중하고 흔들리지 마세요.',
      keyword: ['승리', '의지', '결단', '성공', '전진'],
      love: '적극적으로 다가가면 원하는 관계를 쟁취할 수 있습니다.',
      work: '강한 추진력으로 목표를 달성합니다. 포기하지 마세요.',
      money: '재정적 목표를 향해 강하게 나아가면 성공합니다.'
    },
    reversed: {
      theme: '방향 상실, 의지력 부족, 충동, 패배, 통제 불능',
      advice: '목표를 명확히 하고 에너지를 한 방향으로 모으세요. 여러 방향으로 흩어진 힘을 집중시켜야 합니다.',
      keyword: ['방향상실', '충동', '패배', '혼란', '통제불능'],
      love: '관계에서 방향을 잃었거나 충동적 행동이 문제를 만듭니다.',
      work: '목표 없이 흩어진 에너지를 한 방향으로 모으세요.',
      money: '충동적 지출이 재정을 흔들고 있습니다. 계획을 세우세요.'
    }
  },
  {
    id: 8, name: 'Strength', kr: '힘', num: 'VIII',
    upright: {
      theme: '용기, 인내, 내면의 힘, 자기 통제, 온유한 강인함, 자신감',
      advice: '부드러운 힘으로 상황을 이끄세요. 무력보다 설득이, 강압보다 온화함이 더 강력한 힘입니다. 당신 안의 용기를 믿으세요.',
      keyword: ['용기', '인내', '내면의힘', '통제', '온유'],
      love: '상대를 배려하는 따뜻한 힘으로 관계를 이끄세요.',
      work: '어려운 상황도 침착하게 극복할 수 있습니다. 내면의 힘을 믿으세요.',
      money: '인내심을 갖고 꾸준히 노력하면 반드시 결실이 옵니다.'
    },
    reversed: {
      theme: '자기 의심, 나약함, 두려움, 억압, 자신감 상실',
      advice: '자신을 믿으세요. 두려움이 당신을 가로막고 있습니다. 작은 용기부터 시작하면 됩니다.',
      keyword: ['자기의심', '나약함', '두려움', '억압', '상실'],
      love: '자신감 부족이 관계를 어렵게 만들고 있습니다. 자신을 사랑하세요.',
      work: '능력에 대한 의심을 극복하세요. 당신은 충분히 잘 하고 있습니다.',
      money: '두려움이 좋은 기회를 놓치게 만들고 있습니다.'
    }
  },
  {
    id: 9, name: 'The Hermit', kr: '은둔자', num: 'IX',
    upright: {
      theme: '내면 탐구, 고독, 지혜, 성찰, 안내, 빛의 추구',
      advice: '잠시 혼자만의 시간을 가지며 내면을 들여다보세요. 외부의 소음에서 벗어나 자신의 진정한 목소리를 듣는 것이 필요합니다.',
      keyword: ['성찰', '고독', '지혜', '내면', '안내'],
      love: '혼자만의 시간이 필요한 시기입니다. 관계보다 자신을 먼저 탐구하세요.',
      work: '깊이 생각하고 연구하면 돌파구를 찾을 수 있습니다.',
      money: '재정적 결정을 서두르지 말고 충분히 숙고하세요.'
    },
    reversed: {
      theme: '고립, 외로움, 지나친 은둔, 사회적 거부, 방황',
      advice: '너무 혼자만의 세계에 갇히지 말고 세상과 연결되세요. 적절한 도움을 구하는 것도 지혜입니다.',
      keyword: ['고립', '외로움', '방황', '거부', '단절'],
      love: '지나친 고립이 관계를 어렵게 합니다. 마음을 열어보세요.',
      work: '혼자 모든 것을 해결하려 하지 말고 협력하세요.',
      money: '정보 부족으로 잘못된 결정을 내릴 수 있습니다. 조언을 구하세요.'
    }
  },
  {
    id: 10, name: 'Wheel of Fortune', kr: '운명의 수레바퀴', num: 'X',
    upright: {
      theme: '행운, 변화의 순환, 전환점, 운명, 기회, 인과응보',
      advice: '지금이 변화의 전환점입니다. 운명의 수레바퀴가 당신 편으로 돌고 있습니다. 흐름에 몸을 맡기고 기회를 잡으세요.',
      keyword: ['행운', '변화', '전환점', '운명', '순환'],
      love: '운명적인 만남이나 관계의 큰 변화가 올 수 있습니다.',
      work: '커리어에 중요한 전환점이 찾아옵니다. 기회를 놓치지 마세요.',
      money: '뜻밖의 행운이나 재물이 들어올 수 있습니다.'
    },
    reversed: {
      theme: '불운, 저항, 나쁜 타이밍, 변화 거부, 악순환',
      advice: '변화를 거부하지 마세요. 저항할수록 더 힘들어집니다. 흐름을 받아들이는 것이 현명합니다.',
      keyword: ['불운', '저항', '타이밍불량', '악순환', '거부'],
      love: '관계의 악순환이 반복되고 있습니다. 패턴을 깨는 것이 필요합니다.',
      work: '타이밍이 맞지 않습니다. 조금 더 기다리세요.',
      money: '재정 상황이 악화될 수 있습니다. 방어적으로 관리하세요.'
    }
  },
  {
    id: 11, name: 'Justice', kr: '정의', num: 'XI',
    upright: {
      theme: '공정, 진실, 인과응보, 균형, 법, 책임, 명확한 판단',
      advice: '공정하고 정직하게 행동하세요. 모든 결과는 당신의 행동에 비례합니다. 지금은 진실을 직면하고 책임을 받아들일 때입니다.',
      keyword: ['공정', '진실', '균형', '책임', '법'],
      love: '공정한 시각으로 관계를 보세요. 서로에 대한 책임이 중요합니다.',
      work: '공정한 평가와 보상이 이루어집니다. 정직하게 행동하세요.',
      money: '법적 문제나 계약에 주의하세요. 정확하고 공정하게 처리하세요.'
    },
    reversed: {
      theme: '불공정, 부정직, 편견, 책임 회피, 불균형',
      advice: '자신의 행동에 책임을 지고 공정한 시각으로 바라보세요. 편견이나 부정직함이 문제를 만들고 있습니다.',
      keyword: ['불공정', '부정직', '편견', '회피', '불균형'],
      love: '한쪽이 부당한 대우를 받고 있는 관계입니다. 균형을 맞추세요.',
      work: '부당한 평가나 불공정한 상황에 처할 수 있습니다.',
      money: '법적 문제나 사기에 주의하세요.'
    }
  },
  {
    id: 12, name: 'The Hanged Man', kr: '매달린 사람', num: 'XII',
    upright: {
      theme: '희생, 새로운 관점, 기다림, 내려놓기, 수동적 수용, 역전된 시각',
      advice: '지금은 행동보다 기다림의 시간입니다. 관점을 완전히 바꾸면 새로운 답이 보입니다. 집착을 내려놓는 것이 오히려 해결책입니다.',
      keyword: ['기다림', '희생', '관점전환', '내려놓기', '수용'],
      love: '서두르지 마세요. 인내하며 기다리는 것이 관계를 성숙시킵니다.',
      work: '지금은 멈추고 상황을 다른 각도에서 바라볼 때입니다.',
      money: '재정적 결정을 잠시 보류하고 더 넓은 시각을 가지세요.'
    },
    reversed: {
      theme: '지연, 저항, 쓸모없는 희생, 집착, 순교자 심리',
      advice: '무의미한 희생을 그만두고 새로운 방향으로 나아가세요. 기다림이 너무 길어졌습니다.',
      keyword: ['지연', '저항', '집착', '낭비', '순교자'],
      love: '더 이상 기다리는 것이 의미 없을 수도 있습니다. 결단이 필요합니다.',
      work: '지연되고 있는 일을 과감히 처리하거나 포기하세요.',
      money: '묶여 있는 돈이나 투자를 재검토하세요.'
    }
  },
  {
    id: 13, name: 'Death', kr: '죽음', num: 'XIII',
    upright: {
      theme: '변환, 끝과 시작, 변화, 해방, 전환, 재탄생',
      advice: '두려워하지 마세요. 이 끝은 새로운 시작의 문입니다. 낡은 것을 놓아야 새것이 들어올 수 있습니다. 변화를 받아들이세요.',
      keyword: ['변환', '끝', '시작', '해방', '재탄생'],
      love: '기존 관계의 형태가 크게 변합니다. 더 깊어지거나 끝날 수 있습니다.',
      work: '직업이나 커리어의 큰 변환점입니다. 용감하게 새로운 길을 선택하세요.',
      money: '재정적 구조의 큰 변화. 낡은 방식을 버리고 새로운 방식을 받아들이세요.'
    },
    reversed: {
      theme: '변화 거부, 정체, 집착, 과거에 갇힘, 저항',
      advice: '과거의 것을 붙잡고 있으면 새것이 들어올 수 없습니다. 두려움이 변화를 막고 있습니다. 용기를 내세요.',
      keyword: ['거부', '정체', '집착', '과거', '저항'],
      love: '끝내야 할 관계를 붙잡고 있거나 변화를 두려워하고 있습니다.',
      work: '현재 상황에 고착되어 앞으로 나아가지 못하고 있습니다.',
      money: '재정적 변화를 두려워하여 기회를 놓치고 있습니다.'
    }
  },
  {
    id: 14, name: 'Temperance', kr: '절제', num: 'XIV',
    upright: {
      theme: '균형, 조화, 인내, 절제, 치유, 중용, 통합',
      advice: '극단을 피하고 균형을 유지하세요. 천천히 꾸준히 가는 것이 최선입니다. 서로 다른 요소들을 조화롭게 통합하는 지혜를 발휘하세요.',
      keyword: ['균형', '조화', '인내', '절제', '치유'],
      love: '균형 잡힌 건강한 관계입니다. 서로를 이해하며 함께 성장하세요.',
      work: '워라밸을 유지하면서 꾸준히 나아가세요. 급하게 서두르지 마세요.',
      money: '균형 잡힌 재정 관리가 중요합니다. 극단적 투자를 피하세요.'
    },
    reversed: {
      theme: '불균형, 과잉, 조급함, 부조화, 방종',
      advice: '한쪽으로 치우치지 말고 중용을 찾으세요. 과도한 것은 무엇이든 독이 됩니다.',
      keyword: ['불균형', '과잉', '조급함', '부조화', '방종'],
      love: '관계에서 한쪽이 너무 많이 주거나 받고 있습니다. 균형을 맞추세요.',
      work: '일과 개인 생활의 균형이 무너졌습니다. 재조정이 필요합니다.',
      money: '과소비나 극단적인 절약 모두 문제입니다. 중간 지점을 찾으세요.'
    }
  },
  {
    id: 15, name: 'The Devil', kr: '악마', num: 'XV',
    upright: {
      theme: '속박, 집착, 물질주의, 중독, 욕망, 그림자 자아',
      advice: '무엇이 당신을 붙잡고 있는지 직시하세요. 속박처럼 보이지만 사실 그 사슬은 스스로 끊을 수 있습니다. 해방될 힘이 당신 안에 있습니다.',
      keyword: ['속박', '집착', '욕망', '중독', '그림자'],
      love: '집착이나 불건강한 의존이 관계를 지배하고 있습니다. 해방이 필요합니다.',
      work: '물질적 욕망이나 나쁜 상황에 묶여 있지는 않은지 확인하세요.',
      money: '돈에 대한 집착이나 탐욕이 문제를 만들고 있습니다.'
    },
    reversed: {
      theme: '해방, 집착에서 벗어남, 자유, 각성, 사슬 끊기',
      advice: '사슬이 풀리기 시작했습니다. 자유를 향해 나아가세요. 이제 당신을 묶었던 것에서 벗어날 힘이 생겼습니다.',
      keyword: ['해방', '자유', '각성', '극복', '회복'],
      love: '불건강한 관계나 집착에서 벗어나고 있습니다. 건강한 관계를 만들어가세요.',
      work: '억압적인 상황에서 벗어날 수 있습니다. 용기를 내세요.',
      money: '재정적 족쇄에서 벗어나기 시작합니다.'
    }
  },
  {
    id: 16, name: 'The Tower', kr: '탑', num: 'XVI',
    upright: {
      theme: '갑작스러운 변화, 혼란, 충격, 계시, 붕괴, 해방',
      advice: '예상치 못한 변화가 옵니다. 무너지는 것은 더 나은 것을 위한 공간을 만드는 과정입니다. 충격 속에서도 근본이 흔들리지 않도록 하세요.',
      keyword: ['충격', '변화', '붕괴', '계시', '해방'],
      love: '갑작스러운 충격이나 관계의 붕괴가 올 수 있습니다. 진실이 드러납니다.',
      work: '갑작스러운 직업 변화나 예상치 못한 사태가 발생할 수 있습니다.',
      money: '갑작스러운 재정적 손실에 주의하세요. 안전망을 마련하세요.'
    },
    reversed: {
      theme: '변화 회피, 재앙 예방, 혼란 지속, 작은 붕괴',
      advice: '변화를 더 이상 미룰 수 없습니다. 직면할 준비를 하세요. 피하려다 더 큰 재앙이 올 수 있습니다.',
      keyword: ['회피', '지연', '작은충격', '저항', '불안'],
      love: '관계의 문제를 피하고 있습니다. 직면하지 않으면 더 큰 문제가 됩니다.',
      work: '변화를 거부하면 더 큰 위기가 찾아옵니다.',
      money: '재정 문제를 외면하지 마세요. 지금 바로 직면하세요.'
    }
  },
  {
    id: 17, name: 'The Star', kr: '별', emoji: '⭐', num: 'XVII',
    upright: {
      theme: '희망, 영감, 재생, 평온, 치유, 축복, 믿음',
      advice: '어두운 시간이 지나고 빛이 들어옵니다. 희망을 잃지 마세요. 우주가 당신을 치유하고 있습니다. 꿈을 향해 조용히 나아가세요.',
      keyword: ['희망', '치유', '영감', '평온', '축복'],
      love: '마음의 상처가 치유되고 있습니다. 진정한 사랑이 다가오고 있습니다.',
      work: '영감이 넘치는 시기입니다. 꿈꾸던 일에 도전하세요.',
      money: '재정적으로 안정되고 희망적인 시기입니다.'
    },
    reversed: {
      theme: '절망, 믿음 상실, 낙담, 차단, 꿈 포기',
      advice: '믿음을 잃지 마세요. 희망의 빛은 아직 꺼지지 않았습니다. 지금은 힘들어도 반드시 나아질 것입니다.',
      keyword: ['절망', '불신', '낙담', '포기', '차단'],
      love: '희망을 잃지 마세요. 사랑은 예상치 못한 순간에 찾아옵니다.',
      work: '꿈을 포기하지 마세요. 아직 기회가 있습니다.',
      money: '재정적 어려움이 있지만 포기하지 마세요.'
    }
  },
  {
    id: 18, name: 'The Moon', kr: '달', num: 'XVIII',
    upright: {
      theme: '환상, 불안, 무의식, 혼란, 잠재된 두려움, 착각',
      advice: '보이는 것이 전부가 아닙니다. 지금은 착각이나 두려움이 판단을 흐리게 할 수 있습니다. 직관을 믿되 명확해질 때까지 중요한 결정은 미루세요.',
      keyword: ['환상', '불안', '무의식', '두려움', '착각'],
      love: '상대방의 진심이 불분명합니다. 착각이나 환상에 빠지지 마세요.',
      work: '정보가 불분명하거나 숨겨진 것이 있습니다. 서두르지 마세요.',
      money: '재정적 결정을 흐리게 하는 착각이나 잘못된 정보에 주의하세요.'
    },
    reversed: {
      theme: '혼란 해소, 진실 드러남, 두려움 극복, 명확성 회복',
      advice: '안개가 걷히기 시작합니다. 진실이 서서히 모습을 드러내고 있습니다. 두려움이 사라지고 명확성이 찾아옵니다.',
      keyword: ['명확성', '진실', '극복', '해소', '회복'],
      love: '관계의 진실이 드러납니다. 착각에서 벗어나 현실을 보세요.',
      work: '불분명했던 상황이 명확해집니다.',
      money: '재정적 불확실성이 해소되기 시작합니다.'
    }
  },
  {
    id: 19, name: 'The Sun', kr: '태양', num: 'XIX',
    upright: {
      theme: '성공, 기쁨, 활력, 명확함, 자신감, 긍정, 행복',
      advice: '밝고 긍정적인 에너지가 넘칩니다. 자신 있게 앞으로 나아가세요. 지금은 모든 것이 빛나는 황금기입니다. 기쁨을 충분히 누리세요.',
      keyword: ['성공', '기쁨', '행복', '자신감', '긍정'],
      love: '행복하고 밝은 연애입니다. 기쁨이 넘치는 관계입니다.',
      work: '성공과 인정의 시기입니다. 당신의 능력이 빛납니다.',
      money: '재정적으로 밝은 시기입니다. 좋은 성과가 있을 것입니다.'
    },
    reversed: {
      theme: '과도한 낙관, 자만, 일시적 우울, 에너지 저하',
      advice: '기쁨을 찾을 수 있습니다. 작은 것에서 행복을 발견하세요. 지나친 낙관이나 자만을 주의하세요.',
      keyword: ['자만', '낙관과잉', '우울', '에너지저하', '실망'],
      love: '지나친 낙관이 현실을 왜곡할 수 있습니다. 균형을 찾으세요.',
      work: '자만하지 마세요. 겸손함이 더 큰 성공을 가져옵니다.',
      money: '지나치게 낙관적인 재정 계획을 점검하세요.'
    }
  },
  {
    id: 20, name: 'Judgement', kr: '심판', num: 'XX',
    upright: {
      theme: '반성, 재탄생, 내면의 부름, 각성, 새로운 소명, 부활',
      advice: '과거를 정리하고 새롭게 태어날 준비를 하세요. 내면 깊은 곳에서 들려오는 소명의 소리에 귀 기울이세요. 큰 결정의 시간입니다.',
      keyword: ['재탄생', '각성', '소명', '반성', '부활'],
      love: '관계에서 새로운 단계로 나아갈 각성의 순간입니다.',
      work: '새로운 소명이나 천직을 발견하는 시기입니다.',
      money: '재정적 결산과 새로운 시작의 시기입니다.'
    },
    reversed: {
      theme: '자기 의심, 판단 회피, 과거 집착, 자기 비난',
      advice: '스스로를 너무 가혹하게 심판하지 마세요. 용서와 자기 수용이 필요합니다. 과거에 집착하지 말고 앞을 보세요.',
      keyword: ['자기의심', '회피', '집착', '비난', '정체'],
      love: '과거의 상처에서 벗어나지 못하고 있습니다. 자신을 용서하세요.',
      work: '자기 비판이 성장을 막고 있습니다. 실수에서 배우고 나아가세요.',
      money: '과거의 재정적 실수에 집착하지 마세요.'
    }
  },
  {
    id: 21, name: 'The World', kr: '세계', num: 'XXI',
    upright: {
      theme: '완성, 성취, 통합, 여행, 새로운 단계, 전체성, 승리',
      advice: '하나의 사이클이 완성되었습니다. 이 성취를 충분히 기뻐하고 감사하세요. 이제 더 크고 새로운 여정이 기다리고 있습니다.',
      keyword: ['완성', '성취', '통합', '승리', '전체성'],
      love: '완성된 아름다운 관계입니다. 진정한 결합이 이루어집니다.',
      work: '큰 목표를 달성했습니다. 성공의 열매를 맛보세요.',
      money: '재정적 목표가 달성됩니다. 풍요로운 완성의 시기입니다.'
    },
    reversed: {
      theme: '미완성, 지연, 완성 저항, 단기적 사고, 마무리 부족',
      advice: '마지막 한 걸음이 남아있습니다. 포기하지 마세요. 완성에 거의 다 왔습니다.',
      keyword: ['미완성', '지연', '저항', '마무리부족', '단기적'],
      love: '관계가 완전히 완성되지 않은 느낌입니다. 마지막 노력을 기울이세요.',
      work: '프로젝트나 목표가 완성 직전에 멈춰 있습니다. 마무리하세요.',
      money: '재정 목표 달성이 지연되고 있습니다. 조금만 더 인내하세요.'
    }
  }
];

/* =====================================================
   2. 마이너 아르카나 56장
   ===================================================== */
const MINOR_SUITS = {
  wands:     { kr: '완드',   element: '불🔥',  theme: '열정·의지·창조·직업·행동',    color: '#ff6b35' },
  cups:      { kr: '컵',     element: '물💧',  theme: '감정·관계·직관·사랑·꿈',      color: '#4a90d9' },
  swords:    { kr: '검',     element: '바람⚔️', theme: '사고·갈등·진실·소통·지성',    color: '#6c757d' },
  pentacles: { kr: '펜타클', element: '흙⭐',  theme: '물질·재물·실용·건강·현실',    color: '#28a745' }
};

const MINOR_NUMBER_MEANING = {
  1:  { name: '에이스', upright: '새로운 시작, 씨앗, 순수한 에너지, 잠재력 폭발', reversed: '막힌 에너지, 지연된 시작, 억압된 잠재력' },
  2:  { name: '2',      upright: '균형, 선택의 기로, 파트너십, 기다림과 숙고',    reversed: '불균형, 우유부단, 과부하, 혼란' },
  3:  { name: '3',      upright: '성장, 협력, 초기 성공, 창조적 표현, 팀워크',    reversed: '실망, 오해, 재작업 필요, 갈등' },
  4:  { name: '4',      upright: '안정, 기반 다지기, 휴식, 공고화, 내실 다짐',    reversed: '정체, 지나친 안주, 변화 필요, 인색함' },
  5:  { name: '5',      upright: '갈등, 도전, 손실, 변화를 통한 성장, 시련',      reversed: '화해, 교훈 수용, 회복, 갈등 해소' },
  6:  { name: '6',      upright: '조화, 나눔, 해결, 전진, 성공적 균형',           reversed: '부채, 불평등, 망설임, 관대함 부족' },
  7:  { name: '7',      upright: '도전, 방어, 지략, 신뢰 점검, 용기 있는 선택',   reversed: '포기, 과신, 미루기, 무기력' },
  8:  { name: '8',      upright: '움직임, 빠른 변화, 집중, 기술 향상, 전진',       reversed: '지연, 방향 상실, 좌절, 과부하' },
  9:  { name: '9',      upright: '완성 직전, 독립, 내면의 힘, 자급자족',           reversed: '불안, 집착, 고립, 완성 직전 포기' },
  10: { name: '10',     upright: '완성, 유산, 절정, 끝과 새 시작의 문턱',          reversed: '짐 내려놓기, 실패 직전, 과부하' },
  11: { name: '페이지', upright: '호기심, 새로운 메시지, 배움, 신선한 시작',       reversed: '나쁜 소식, 지연, 미숙함, 충동적 행동' },
  12: { name: '나이트', upright: '행동, 용기, 변화, 추진력, 모험',                 reversed: '충동, 무모함, 방해, 에너지 낭비' },
  13: { name: '퀸',     upright: '돌봄, 직관, 성숙함, 지지, 감성적 지혜',          reversed: '냉담, 과도한 의존, 불안정, 감정 기복' },
  14: { name: '킹',     upright: '리더십, 권위, 숙달, 성취, 성숙한 지혜',          reversed: '독재, 통제욕, 미성숙한 권력, 조종' }
};

/* =====================================================
   3. 타로 셔플 & 카드 뽑기
   ===================================================== */
function shuffleDeck(question) {
  const deck = [];
  for (let i = 0; i < 78; i++) deck.push({ idx: i, reversed: false });

  const seed = (question || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Date.now();
  let s = seed;
  function rand() {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
    deck[i].reversed = rand() > 0.5;
  }
  deck[0].reversed = rand() > 0.5;
  return deck;
}

function getCardInfo(deckEntry) {
  const idx = deckEntry.idx;
  const isReversed = deckEntry.reversed;

  if (idx < 22) {
    const card = MAJOR_ARCANA[idx];
    const side = isReversed ? card.reversed : card.upright;
    const theme = CARD_THEMES.major[idx] || {};
    return {
      type: 'major',
      name: card.kr + ' (' + card.name + ')',
      kr: card.kr, num: card.num,
      emoji: theme.symbol || '🃏',
      bg: theme.bg || '#667eea',
      accent: theme.accent || '#764ba2',
      direction: isReversed ? '역방향 🔄' : '정방향 ↑',
      theme: side.theme,
      advice: side.advice,
      keyword: side.keyword || [],
      love: side.love || '',
      work: side.work || '',
      money: side.money || '',
      isReversed
    };
  } else {
    const suitIdx = Math.floor((idx - 22) / 14);
    const numIdx  = ((idx - 22) % 14) + 1;
    const suitKeys = ['wands', 'cups', 'swords', 'pentacles'];
    const suitKey = suitKeys[suitIdx];
    const suit = MINOR_SUITS[suitKey];
    const num  = MINOR_NUMBER_MEANING[numIdx];
    const theme = CARD_THEMES[suitKey] || {};
    return {
      type: 'minor',
      name: suit.kr + ' ' + num.name,
      kr: suit.kr + ' ' + num.name,
      emoji: theme.symbol || '🃏',
      bg: theme.bg || '#888',
      accent: theme.accent || '#aaa',
      direction: isReversed ? '역방향 🔄' : '정방향 ↑',
      theme: suit.theme + ' — ' + (isReversed ? num.reversed : num.upright),
      advice: isReversed ? num.reversed : num.upright,
      keyword: (isReversed ? num.reversed : num.upright).split(', ').slice(0, 4),
      suit: suit.kr, element: suit.element,
      love: '', work: '', money: '',
      isReversed
    };
  }
}

/* =====================================================
   4. 스프레드 5종
   ===================================================== */

/* 원카드 — 빠른 답변 */
function drawOneCard(question) {
  const deck = shuffleDeck(question);
  return {
    spread: '원 카드',
    spreadIcon: '🎴',
    desc: '오늘의 핵심 에너지와 메시지',
    cards: [{ position: '✨ 오늘의 메시지', positionDesc: '현재 당신에게 가장 필요한 메시지', ...getCardInfo(deck[0]) }]
  };
}

/* 쓰리카드 — 과거/현재/미래 */
function drawThreeCards(question) {
  const deck = shuffleDeck(question);
  return {
    spread: '쓰리 카드',
    spreadIcon: '🃏',
    desc: '과거의 원인 → 현재 상황 → 미래 결과',
    cards: [
      { position: '⏪ 과거 (원인)',  positionDesc: '현재 상황을 만든 과거의 에너지', ...getCardInfo(deck[0]) },
      { position: '⚡ 현재 (상황)',  positionDesc: '지금 이 순간의 핵심 에너지',      ...getCardInfo(deck[1]) },
      { position: '🔮 미래 (결과)',  positionDesc: '현재 흐름이 이어진다면 나타날 결과', ...getCardInfo(deck[2]) }
    ]
  };
}

/* 관계 스프레드 — 연애/인간관계 */
function drawRelationshipCards(question) {
  const deck = shuffleDeck(question);
  return {
    spread: '관계 스프레드',
    spreadIcon: '💕',
    desc: '두 사람의 에너지와 관계의 흐름',
    cards: [
      { position: '💭 나의 감정',    positionDesc: '현재 내가 느끼는 감정과 에너지',     ...getCardInfo(deck[0]) },
      { position: '💫 상대의 마음',  positionDesc: '상대방의 내면과 숨겨진 감정',        ...getCardInfo(deck[1]) },
      { position: '🔗 우리의 연결',  positionDesc: '두 사람 사이의 실제 에너지',         ...getCardInfo(deck[2]) },
      { position: '🚧 장애물',       positionDesc: '관계를 가로막는 요소',               ...getCardInfo(deck[3]) },
      { position: '🌟 앞으로의 방향', positionDesc: '이 관계가 향하는 방향',             ...getCardInfo(deck[4]) }
    ]
  };
}

/* 직업/재물 스프레드 */
function drawCareerCards(question) {
  const deck = shuffleDeck(question);
  return {
    spread: '직업·재물 스프레드',
    spreadIcon: '💼',
    desc: '현실적 목표와 성공으로 가는 길',
    cards: [
      { position: '📍 현재 상황',   positionDesc: '지금 직업/재정 상황의 핵심',         ...getCardInfo(deck[0]) },
      { position: '💪 강점/기회',   positionDesc: '활용할 수 있는 나의 강점',            ...getCardInfo(deck[1]) },
      { position: '⚠️ 장애물',      positionDesc: '극복해야 할 도전',                   ...getCardInfo(deck[2]) },
      { position: '🎯 행동 지침',   positionDesc: '지금 당장 취해야 할 행동',            ...getCardInfo(deck[3]) },
      { position: '🏆 최종 결과',   positionDesc: '올바른 행동을 했을 때의 결과',        ...getCardInfo(deck[4]) }
    ]
  };
}

/* 켈틱 크로스 10장 — 심층 분석 */
function drawCelticCross(question) {
  const deck = shuffleDeck(question);
  return {
    spread: '켈틱 크로스',
    spreadIcon: '✝️',
    desc: '인생의 심층적 흐름과 내면의 메시지',
    cards: [
      { position: '⚡ 현재 상황',      positionDesc: '지금 이 순간의 핵심',               ...getCardInfo(deck[0]) },
      { position: '🔀 장애물/도움',    positionDesc: '현재를 가로막거나 돕는 힘',         ...getCardInfo(deck[1]) },
      { position: '🌱 먼 과거 (근본)', positionDesc: '이 상황의 근본적 원인',              ...getCardInfo(deck[2]) },
      { position: '⏮️ 가까운 과거',   positionDesc: '최근 일어난 영향',                  ...getCardInfo(deck[3]) },
      { position: '🔮 가능한 결과',    positionDesc: '현재 흐름의 잠재적 결과',            ...getCardInfo(deck[4]) },
      { position: '⏭️ 가까운 미래',   positionDesc: '곧 다가올 에너지',                  ...getCardInfo(deck[5]) },
      { position: '🧠 내면의 자아',    positionDesc: '자신에 대한 내면 인식',             ...getCardInfo(deck[6]) },
      { position: '🌍 외부 환경',      positionDesc: '주변 환경과 타인의 영향',           ...getCardInfo(deck[7]) },
      { position: '🌗 희망과 두려움',  positionDesc: '원하면서도 두려워하는 것',          ...getCardInfo(deck[8]) },
      { position: '🏁 최종 결과',      positionDesc: '모든 것이 통합된 최종 방향',        ...getCardInfo(deck[9]) }
    ]
  };
}

/* =====================================================
   5. 오늘의 타로 (날짜 기반 고정 카드)
   ===================================================== */
function getTodayTarot() {
  const today = new Date();
  const seed  = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const cardIdx     = seed % 78;
  const isReversed  = (seed % 7) > 3;
  const cardInfo    = getCardInfo({ idx: cardIdx, reversed: isReversed });

  const dailyMessages = [
    '오늘은 내면의 소리에 귀 기울여 보세요.',
    '작은 행동 하나가 큰 변화를 만듭니다.',
    '지금 이 순간에 집중하세요.',
    '당신의 직관을 믿으세요.',
    '균형이 모든 것의 답입니다.',
    '두려움 없이 앞으로 나아가세요.',
    '감사하는 마음이 풍요를 불러옵니다.'
  ];

  return {
    ...cardInfo,
    dailyMessage: dailyMessages[today.getDay()],
    date: today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
  };
}

/* =====================================================
   6. 질문 유형 자동 감지 → 최적 스프레드 선택
   ===================================================== */
function selectSpread(question) {
  if (!question || question.trim().length < 2) return drawOneCard(question);

  const q = question;

  // 켈틱 크로스 — 심층/인생 전반
  if (/심층|종합|전반|인생|운명|켈틱|상세|자세|전체적|모든|삶 전반|큰 그림/.test(q)) {
    return drawCelticCross(q);
  }
  // 연애/관계
  if (/연애|사랑|좋아|남자친구|여자친구|짝사랑|썸|이별|재회|결혼|배우자|궁합|남친|여친|남편|아내|소개팅|데이트|고백|관계|만남|헤어/.test(q)) {
    return drawRelationshipCards(q);
  }
  // 직업/재물
  if (/취업|직장|이직|사업|창업|직업|일|커리어|재물|돈|투자|재테크|수입|부자|성공|승진|계약|비즈니스|프리랜서/.test(q)) {
    return drawCareerCards(q);
  }
  // 쓰리카드 — 미래/결과
  if (/앞으로|미래|결과|될까|어떻게|진로|방향|가야할|선택|결정|고민/.test(q)) {
    return drawThreeCards(q);
  }

  // 기본: 원카드
  return drawOneCard(q);
}

/* =====================================================
   7. 타로 결과 → Gemini AI 프롬프트 최적화 변환
   ===================================================== */
function tarotToPromptText(reading) {
  if (!reading) return '';

  let text = '\n\n【🃏 타로 카드 리딩 결과 — 반드시 이 카드를 기반으로 해석할 것】\n';
  text += `📖 스프레드: ${reading.spread} ${reading.spreadIcon || ''}\n`;
  text += `📝 스프레드 의미: ${reading.desc || ''}\n\n`;

  reading.cards.forEach((card, i) => {
    text += `━━━ ${i + 1}번 카드 ━━━\n`;
    text += `📍 위치: ${card.position}\n`;
    if (card.positionDesc) text += `   (${card.positionDesc})\n`;
    text += `🃏 카드: ${card.emoji} ${card.name} [${card.direction}]\n`;
    text += `✨ 핵심 의미: ${card.theme}\n`;
    text += `💡 조언: ${card.advice}\n`;
    if (card.keyword && card.keyword.length > 0) {
      text += `🔑 키워드: ${card.keyword.join(' · ')}\n`;
    }
    if (card.love)  text += `❤️ 연애: ${card.love}\n`;
    if (card.work)  text += `💼 직업: ${card.work}\n`;
    if (card.money) text += `💰 재물: ${card.money}\n`;
    text += '\n';
  });

  text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  text += '【해석 가이드】\n';
  text += '1. 위 카드들을 반드시 그대로 사용하여 사용자 질문에 맞는 깊이 있는 타로 해석을 해주세요.\n';
  text += '2. 각 카드의 위치적 의미와 카드의 에너지를 연결하여 통합적으로 해석하세요.\n';
  text += '3. 구체적이고 실용적인 조언을 포함하세요. 막연한 말보다 행동 지침을 주세요.\n';
  text += '4. 카드의 흐름(시작→중간→결말)을 이야기처럼 풀어주세요.\n';
  text += '5. 부정적 카드도 성장의 기회로 긍정적으로 재해석해 주세요.\n';

  return text;
}

/* =====================================================
   8. 타로 카드 HTML 렌더링 (채팅 내 카드 시각화)
   ===================================================== */
function renderTarotCardHTML(card, index) {
  const delay = index * 0.15;
  return `
    <div class="tarot-card-visual" style="animation-delay:${delay}s">
      <div class="tarot-card-inner">
        <div class="tarot-card-front" style="background:linear-gradient(135deg,${card.bg},${card.accent})">
          <div class="tarot-card-num">${card.num || ''}</div>
          <div class="tarot-card-symbol">${card.emoji}</div>
          <div class="tarot-card-name">${card.kr || card.name}</div>
          ${card.isReversed ? '<div class="tarot-reversed-mark">🔄 역방향</div>' : '<div class="tarot-upright-mark">↑ 정방향</div>'}
        </div>
      </div>
      <div class="tarot-card-pos">${card.position}</div>
    </div>
  `;
}

function renderTarotReadingHTML(reading) {
  if (!reading || !reading.cards) return '';

  const cardsHTML = reading.cards.map((c, i) => renderTarotCardHTML(c, i)).join('');

  return `
    <div class="tarot-reading-wrap">
      <div class="tarot-spread-title">
        <span>${reading.spreadIcon || '🃏'}</span>
        <span>${reading.spread}</span>
        <span class="tarot-spread-desc">${reading.desc || ''}</span>
      </div>
      <div class="tarot-cards-row" data-count="${reading.cards.length}">
        ${cardsHTML}
      </div>
    </div>
  `;
}

/* =====================================================
   9. 전역 노출
   ===================================================== */
window.selectSpread            = selectSpread;
window.drawOneCard             = drawOneCard;
window.drawThreeCards          = drawThreeCards;
window.drawRelationshipCards   = drawRelationshipCards;
window.drawCareerCards         = drawCareerCards;
window.drawCelticCross         = drawCelticCross;
window.getTodayTarot           = getTodayTarot;
window.tarotToPromptText       = tarotToPromptText;
window.renderTarotReadingHTML  = renderTarotReadingHTML;
window.renderTarotCardHTML     = renderTarotCardHTML;
window.MAJOR_ARCANA            = MAJOR_ARCANA;
window.MINOR_SUITS             = MINOR_SUITS;
window.MINOR_NUMBER_MEANING    = MINOR_NUMBER_MEANING;
window.CARD_THEMES             = CARD_THEMES;
window.getCardInfo             = getCardInfo;
window.shuffleDeck             = shuffleDeck;
