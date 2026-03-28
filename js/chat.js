/* =========================================
   운세ON — js/chat.js
   AI 채팅 상담 기능
   ========================================= */

// ===== 카테고리별 설정 =====
const CAT_CONFIG = {
  '종합운세상담':      { icon: '🔮', cost: 300, persona: '종합 사주 분석가' },
  '연애운':            { icon: '💕', cost: 200, persona: '연애운 전문 상담사' },
  '궁합상담':          { icon: '💞', cost: 200, persona: '궁합 전문 분석가' },
  '썸재회':            { icon: '💌', cost: 200, persona: '재회·썸 전문 상담사' },
  '결혼운':            { icon: '💍', cost: 200, persona: '결혼운 분석가' },
  '배우자복':          { icon: '👫', cost: 200, persona: '인연·배우자 전문가' },
  '인간관계갈등':      { icon: '🤝', cost: 200, persona: '인간관계 상담사' },
  '가족운자녀운':      { icon: '👨‍👩‍👧', cost: 200, persona: '가족운 전문가' },
  '소개팅흐름':        { icon: '💑', cost: 200, persona: '만남·소개팅 전문가' },
  '직업상담':          { icon: '💼', cost: 200, persona: '직업운 전문 상담사' },
  '취업운':            { icon: '📋', cost: 200, persona: '취업운 전문가' },
  '이직운':            { icon: '🔄', cost: 200, persona: '이직운 분석가' },
  '승진운':            { icon: '⬆️', cost: 200, persona: '승진·조직운 전문가' },
  '직무적성':          { icon: '🎯', cost: 200, persona: '적성 전문 분석가' },
  '시험운합격운':      { icon: '📚', cost: 200, persona: '시험·합격운 전문가' },
  '프리랜서운':        { icon: '💻', cost: 200, persona: '독립·프리랜서 전문가' },
  '사업운재물운':      { icon: '📈', cost: 300, persona: '사업·재물운 전문 분석가' },
  '재물운':            { icon: '💰', cost: 300, persona: '재물운 전문 분석가' },
  '개업시기':          { icon: '🏪', cost: 300, persona: '개업 날짜 전문가' },
  '개업상담':          { icon: '🏪', cost: 300, persona: '개업 전문 상담사' },
  '동업궁합':          { icon: '🤝', cost: 300, persona: '동업 궁합 전문가' },
  '상호명상담':        { icon: '🏷️', cost: 300, persona: '상호·네이밍 전문가' },
  '상호브랜드네이밍':  { icon: '🏷️', cost: 300, persona: '브랜드 네이밍 전문가' },
  '업종추천':          { icon: '🔎', cost: 300, persona: '업종 적성 분석가' },
  '아이이름짓기':      { icon: '👶', cost: 300, persona: '이름 전문 작명가' },
  '개명상담':          { icon: '🔤', cost: 300, persona: '개명 전문 작명가' },
  '사주보완이름':      { icon: '✨', cost: 300, persona: '사주 보완형 작명가' },
  '브랜드네이밍':      { icon: '🏷️', cost: 300, persona: '브랜드 네이밍 전문가' },
  '이사운':            { icon: '🏠', cost: 200, persona: '이사운 전문가' },
  '집터운':            { icon: '🏡', cost: 200, persona: '집터·풍수 전문가' },
  '계약시기':          { icon: '📝', cost: 200, persona: '계약 시기 전문가' },
  '여행운':            { icon: '✈️', cost: 100, persona: '여행운 전문가' },
  '조심할달':          { icon: '⚠️', cost: 200, persona: '월별 운세 전문가' },
  '기회가오는달':      { icon: '🌟', cost: 200, persona: '기회 흐름 전문가' },
  '타로상담':          { icon: '🃏', cost: 100, persona: '타로 전문 리더' },
  '점성술상담':        { icon: '🌙', cost: 200, persona: '점성술 전문가' },
  '2026병오년운세':    { icon: '🔥', cost: 200, persona: '2026 병오년 전문가' },
};

const DEFAULT_CAT = '종합운세상담';

// ===== AI 응답 (Gemini 연동) =====
// 하위 호환성을 위해 남겨둔 유틸리티 함수들

const LUCKY_COLORS = ['초록', '파랑', '골드', '흰색', '빨강', '보라'];
const LUCKY_DIRS   = ['동쪽', '남쪽', '서쪽', '북쪽', '동남쪽', '서북쪽'];
const LUCKY_NUMS   = [1,3,6,7,8,9];
const MONTHS_GOOD  = [['3월','4월','5월'],['9월','10월'],['1월','2월'],['6월','7월'],['10월','11월'],['2월','3월']];
const MONTHS_CARE  = [['7월','8월'],['12월','1월'],['5월','6월'],['9월','10월'],['3월','4월'],['7월','8월']];

function getRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function getLuckyInfo() {
  return {
    color: getRand(LUCKY_COLORS),
    dir:   getRand(LUCKY_DIRS),
    num:   getRand(LUCKY_NUMS),
    good:  getRand(MONTHS_GOOD).join('·'),
    care:  getRand(MONTHS_CARE).join('·'),
  };
}

// AI_RESPONSES 템플릿 제거 — 모든 응답은 Gemini API 통해 생성됨
// (sendMessage → callGeminiStream → gemini.js)

const AI_RESPONSES_REMOVED = {  '연애운': [
    (q) => { const L = getLuckyInfo(); return `<h4>💕 연애운 분석 결과</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>현재 당신의 사주에는 <span class="highlight">도화살(桃花煞)의 기운이 활성화</span>되어 있습니다. 이는 이성을 끌어당기는 매력적인 에너지가 강하게 작용하고 있다는 신호입니다.</p>
<ul>
<li>💫 <strong>현재 인연의 흐름</strong>: 상대방도 당신을 의식하고 있을 가능성이 높습니다. 먼저 연락해도 좋은 시기입니다</li>
<li>📅 <strong>접근 최적 시기</strong>: ${L.good}이 가장 유리합니다. 이 시기에 고백하거나 만남을 제안해보세요</li>
<li>⚠️ <strong>주의 시기</strong>: ${L.care}은 감정 소모가 클 수 있으니 중요한 대화는 피하세요</li>
<li>🎨 <strong>행운의 색</strong>: ${L.color}색 옷이나 소품이 매력을 높여줍니다</li>
<li>🧭 <strong>만남의 방향</strong>: ${L.dir} 방향에서 좋은 인연이 옵니다</li>
</ul>
<p>상대방의 생년월일을 함께 알려주시면 더 정확한 궁합 분석이 가능합니다. 궁합 상담으로 연결하시겠어요? 💕</p>`; }
  ],

  '궁합상담': [
    (q) => { const L = getLuckyInfo(); return `<h4>💞 궁합 분석 결과</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>두 사람의 기운을 분석하면 <span class="highlight">오행의 상생(相生) 관계</span>가 중요합니다. 서로 부족한 기운을 채워주는 인연일 때 최고의 궁합이 됩니다.</p>
<ul>
<li>🌟 <strong>궁합 포인트</strong>: 상대방이 당신에게 편안함과 안정감을 주는 타입이라면 좋은 궁합입니다</li>
<li>💬 <strong>소통 방식</strong>: 솔직한 감정 표현이 이 관계에서 가장 중요합니다</li>
<li>📅 <strong>결혼 최적 시기</strong>: ${L.good}에 입적하거나 약혼하면 길합니다</li>
<li>⚠️ <strong>주의할 점</strong>: ${L.care}은 작은 오해가 크게 번질 수 있으니 대화를 더 신중하게 하세요</li>
<li>🎯 <strong>관계 발전 조언</strong>: 함께 목표를 세우고 나아가는 것이 이 커플의 최대 강점입니다</li>
</ul>
<p>두 분의 정확한 생년월일시를 알려주시면 사주 궁합 점수와 결혼 시기를 더 정밀하게 분석해드릴 수 있습니다. 💞</p>`; }
  ],

  '썸재회': [
    (q) => { const L = getLuckyInfo(); return `<h4>💌 썸·재회 운세 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>재회를 원하시는군요. 사주의 흐름에서 <span class="highlight">끊어진 인연도 때가 되면 다시 이어지는 경우</span>가 있습니다. 지금 그 기운을 살펴보겠습니다.</p>
<ul>
<li>🔄 <strong>재회 가능성</strong>: 현재 기운상 상대방도 당신을 떠올리고 있을 가능성이 있습니다</li>
<li>📞 <strong>연락 최적 타이밍</strong>: ${L.good}에 가볍게 안부 연락을 해보세요. 거부감이 낮아지는 시기입니다</li>
<li>💡 <strong>접근 방법</strong>: 직접적인 감정 표현보다는 자연스러운 만남을 먼저 만드는 것이 효과적입니다</li>
<li>⚠️ <strong>조급함 주의</strong>: ${L.care}에 너무 서두르면 오히려 역효과가 날 수 있습니다</li>
<li>✨ <strong>행운의 숫자</strong>: ${L.num} — 이 숫자와 관련된 날짜나 시간에 연락해보세요</li>
</ul>
<p>헤어진 이유와 상대방 정보를 더 알려주시면 재회 전략을 더 구체적으로 잡아드릴 수 있습니다. 💌</p>`; }
  ],

  '결혼운': [
    (q) => { const L = getLuckyInfo(); return `<h4>💍 결혼운 분석 결과</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>결혼운은 사주 여덟 글자 중 특히 <span class="highlight">관성(官星)과 재성(財星)의 흐름</span>에서 읽힙니다. 현재의 흐름을 살펴보겠습니다.</p>
<ul>
<li>💫 <strong>결혼 적기</strong>: ${L.good}이 결혼 에너지가 가장 강한 시기입니다</li>
<li>👫 <strong>배우자 인연</strong>: 지금 주변에 있는 인연 중 오래된 지인에게서 배우자 복이 올 가능성이 있습니다</li>
<li>🏠 <strong>혼인 준비</strong>: 결혼 준비는 ${L.care} 이전에 마무리하는 것이 좋습니다</li>
<li>🎨 <strong>혼례 색상</strong>: ${L.color}을 포인트로 활용하면 길합니다</li>
<li>🧭 <strong>신혼집 방향</strong>: ${L.dir} 방향에 신혼집을 구하면 가정운이 좋습니다</li>
</ul>
<p>현재 교제 중이신지, 아직 미혼이신지 알려주시면 더 맞춤형 결혼운 분석이 가능합니다. 💍</p>`; }
  ],

  '직업상담': [
    (q) => { const L = getLuckyInfo(); return `<h4>💼 직업운 분석 결과</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>현재 당신의 사주 흐름은 <span class="highlight">새로운 도약을 준비하는 전환점</span>으로 읽힙니다. 지금의 불안감은 성장 직전의 자연스러운 신호입니다.</p>
<ul>
<li>🚀 <strong>이직·전직 최적 시기</strong>: ${L.good}이 변화의 기운이 가장 강합니다. 이 시기에 움직이면 좋습니다</li>
<li>🎯 <strong>직무 적성</strong>: 창의성과 커뮤니케이션이 요구되는 분야에서 강점을 발휘합니다</li>
<li>📚 <strong>자격증·시험</strong>: 상반기 준비가 하반기보다 합격 가능성이 높습니다</li>
<li>⚠️ <strong>주의 시기</strong>: ${L.care}에는 충동적인 사직이나 계약은 보류하는 것이 좋습니다</li>
<li>🌟 <strong>행운의 방향</strong>: ${L.dir} 방향에 위치한 회사나 직장이 길합니다</li>
</ul>
<p>현재 직장 상황이나 희망 분야를 알려주시면 더 구체적인 커리어 분석을 해드릴 수 있습니다. 💼</p>`; }
  ],

  '이직운': [
    (q) => { const L = getLuckyInfo(); return `<h4>🔄 이직운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>이직을 고민하고 계시는군요. 사주에서 <span class="highlight">역마살(驛馬煞)이 활성화</span>되는 시기에 이직 에너지가 강해집니다.</p>
<ul>
<li>✅ <strong>이직 추천 시기</strong>: ${L.good} — 이 시기에 이직하면 새 직장에서 빠르게 적응하고 성과를 낼 수 있습니다</li>
<li>⛔ <strong>이직 비추천 시기</strong>: ${L.care} — 이 시기 이직은 후회할 가능성이 높습니다</li>
<li>💡 <strong>협상 포인트</strong>: 연봉 협상은 자신감 있게 임하세요. 지금 당신의 가치는 충분합니다</li>
<li>🎯 <strong>업종 방향</strong>: 현재 분야와 연관성 있는 쪽으로 이직하는 것이 빠른 성과를 냅니다</li>
<li>🔢 <strong>행운의 숫자</strong>: ${L.num} — 면접 날짜에 이 숫자가 포함되면 길합니다</li>
</ul>
<p>현재 직장 상황과 희망 업종을 알려주시면 이직 타이밍을 더 정확히 잡아드립니다. 🔄</p>`; }
  ],

  '승진운': [
    (q) => { const L = getLuckyInfo(); return `<h4>⬆️ 승진운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>승진운은 사주에서 <span class="highlight">관인상생(官印相生)의 기운</span>이 얼마나 강한지에 따라 결정됩니다.</p>
<ul>
<li>🌟 <strong>승진 가능성</strong>: 현재 기운은 상사의 눈에 띄기 좋은 시기입니다. 적극적으로 어필하세요</li>
<li>📅 <strong>승진 발표 길한 시기</strong>: ${L.good}에 좋은 소식이 올 가능성이 높습니다</li>
<li>💡 <strong>어필 전략</strong>: 눈에 보이는 성과물을 만들어 보고하는 것이 효과적입니다</li>
<li>🤝 <strong>인간관계</strong>: 상사와의 관계를 더 돈독히 하는 것이 승진의 열쇠입니다</li>
<li>🎨 <strong>행운의 색</strong>: 중요한 미팅에 ${L.color}색 계통을 활용하세요</li>
</ul>
<p>현재 직급과 회사 분위기를 더 알려주시면 구체적인 승진 전략을 제안해드립니다. ⬆️</p>`; }
  ],

  '취업운': [
    (q) => { const L = getLuckyInfo(); return `<h4>📋 취업운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>취업운은 사주에서 <span class="highlight">관성(官星)의 흐름과 대운(大運)의 기운</span>을 함께 봐야 합니다.</p>
<ul>
<li>✅ <strong>합격 가능성 높은 시기</strong>: ${L.good}에 원서를 내거나 면접을 보면 좋습니다</li>
<li>🎯 <strong>적합한 직종</strong>: 안정성보다 성장 가능성을 보는 분야가 당신에게 더 맞습니다</li>
<li>📝 <strong>서류 전략</strong>: 경험과 강점을 구체적 숫자로 표현하면 합격률이 높아집니다</li>
<li>💬 <strong>면접 TIP</strong>: 솔직하고 자신감 있는 답변이 좋습니다. 과도한 겸손은 금물입니다</li>
<li>🔢 <strong>행운의 숫자</strong>: ${L.num}이 포함된 날 면접을 잡으면 길합니다</li>
</ul>
<p>희망 직종과 현재 준비 상황을 알려주시면 더 구체적인 취업 운세를 봐드릴게요! 📋</p>`; }
  ],

  '사업운재물운': [
    (q) => { const L = getLuckyInfo(); return `<h4>📈 사업운 · 재물운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>2026년 병오년은 <span class="highlight">변화와 도전의 에너지가 강한 해</span>입니다. 불의 기운이 강해 새로운 시작이나 확장에 좋은 흐름입니다.</p>
<ul>
<li>💰 <strong>재물 흐름 최고점</strong>: ${L.good}에 돈의 흐름이 가장 좋습니다. 이 시기에 적극적으로 움직이세요</li>
<li>⚠️ <strong>주의 시기</strong>: ${L.care}은 큰 투자나 계약은 잠시 보류하는 것이 좋습니다</li>
<li>🏪 <strong>개업 추천 시기</strong>: ${L.good} 중 ${L.num}일이 들어가는 날이 가장 길합니다</li>
<li>🤝 <strong>동업 주의</strong>: 동업 파트너의 사주를 함께 보는 것을 강력히 권장합니다</li>
<li>🧭 <strong>사업 확장 방향</strong>: ${L.dir}쪽으로 영역을 넓히는 것이 유리합니다</li>
</ul>
<p>사업 분야와 생년월일을 알려주시면 더 정밀한 사업운 분석이 가능합니다. 📈</p>`; }
  ],

  '재물운': [
    (q) => { const L = getLuckyInfo(); return `<h4>💰 재물운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>재물운은 사주에서 <span class="highlight">식신(食神)과 재성(財星)의 흐름</span>으로 판단합니다. 지금 당신의 재물 기운을 살펴보겠습니다.</p>
<ul>
<li>📈 <strong>재물 상승 시기</strong>: ${L.good}에 수입이 늘어나거나 예상치 못한 돈이 들어올 수 있습니다</li>
<li>💸 <strong>지출 주의 시기</strong>: ${L.care}에는 충동구매나 큰 지출을 자제하세요</li>
<li>🎰 <strong>투자 조언</strong>: 지금은 안정적인 투자가 유리합니다. 고위험 투자는 시기가 아닙니다</li>
<li>🍀 <strong>행운의 숫자</strong>: ${L.num} — 이 숫자와 관련된 날에 중요한 재정 결정을 내리세요</li>
<li>🎨 <strong>재물 운 상승 색</strong>: ${L.color}색 지갑이나 소품을 사용하면 재물운이 올라갑니다</li>
</ul>
<p>현재 재정 상황과 고민을 더 알려주시면 맞춤형 재물운 조언을 드릴 수 있습니다. 💰</p>`; }
  ],

  '배우자복': [
    (q) => { const L = getLuckyInfo(); return `<h4>👫 배우자복 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>배우자복은 사주에서 <span class="highlight">정관(正官)·정재(正財)의 위치와 강도</span>로 판단합니다. 타고난 인연의 그릇을 살펴보겠습니다.</p>
<ul>
<li>💑 <strong>배우자 유형</strong>: 당신 사주에는 차분하고 책임감 강한 파트너가 잘 맞습니다</li>
<li>📅 <strong>인연이 오는 시기</strong>: ${L.good}에 중요한 인연을 만날 가능성이 높습니다</li>
<li>🏠 <strong>만남의 장소</strong>: ${L.dir} 방향에서 인연이 연결될 확률이 높습니다</li>
<li>💫 <strong>배우자와의 관계</strong>: 처음부터 강렬한 끌림보다는 자연스럽게 깊어지는 인연이 오래갑니다</li>
<li>⚠️ <strong>주의할 것</strong>: ${L.care}에는 감정에 치우친 만남보다 천천히 알아가는 것이 중요합니다</li>
</ul>
<p>생년월일시를 알려주시면 배우자의 사주 특성과 인연 시기를 더 정밀하게 분석해드립니다. 👫</p>`; }
  ],

  '소개팅흐름': [
    (q) => { const L = getLuckyInfo(); return `<h4>💑 소개팅 흐름 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>소개팅의 흐름은 사주에서 <span class="highlight">도화살(桃花煞)의 활성도와 대인운</span>에 달려있습니다. 지금의 기운을 살펴보겠습니다.</p>
<ul>
<li>😊 <strong>첫인상 포인트</strong>: 자신의 강점인 ${L.color}계열 옷을 입으면 더 매력적으로 보입니다</li>
<li>📅 <strong>만남의 최적 시기</strong>: ${L.good}에 잡는 소개팅이 가장 인연으로 발전할 확률이 높습니다</li>
<li>💬 <strong>대화 스타일</strong>: 경청하면서 자신의 이야기를 자연스럽게 풀어놓는 방식이 좋습니다</li>
<li>🌟 <strong>분위기 UP 팁</strong>: ${L.dir} 방향에 위치한 장소에서 만남을 가져보세요</li>
<li>🔢 <strong>연락 타이밍</strong>: 소개팅 후 ${L.num}일 안에 연락하면 관계가 이어집니다</li>
</ul>
<p>상대방에 대한 정보나 현재 소개팅 상황을 알려주시면 더 구체적인 조언을 드릴 수 있습니다. 💑</p>`; }
  ],

  '인간관계갈등': [
    (q) => { const L = getLuckyInfo(); return `<h4>🤝 인간관계 갈등 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>인간관계의 갈등은 사주에서 <span class="highlight">비겁(比劫)과 관살(官殺)의 충돌</span>에서 비롯되는 경우가 많습니다. 지금의 상황을 분석해드리겠습니다.</p>
<ul>
<li>🔍 <strong>갈등의 근본 원인</strong>: 서로 다른 오행 기질이 충돌하는 시기입니다. 일시적인 현상으로 이해하세요</li>
<li>💬 <strong>해결 방법</strong>: 직접 대화보다 제3자를 통한 중재가 효과적일 수 있습니다</li>
<li>📅 <strong>관계 개선 시기</strong>: ${L.good}에 화해나 화합의 자리를 만들면 좋습니다</li>
<li>⚠️ <strong>주의 시기</strong>: ${L.care}에는 감정적 충돌을 피하고 거리를 두는 것이 좋습니다</li>
<li>🌟 <strong>관계 회복 키워드</strong>: 진심 어린 경청과 상대방의 입장 공감이 핵심입니다</li>
</ul>
<p>갈등 상대와의 관계와 상황을 더 알려주시면 맞춤 조언을 드릴 수 있습니다. 🤝</p>`; }
  ],

  '가족운자녀운': [
    (q) => { const L = getLuckyInfo(); return `<h4>👨‍👩‍👧 가족운 · 자녀운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>가족운은 사주에서 <span class="highlight">인성(印星)과 식신(食神)의 흐름</span>으로 파악합니다. 가정의 화목과 자녀와의 관계를 살펴보겠습니다.</p>
<ul>
<li>🏠 <strong>가정 화목 시기</strong>: ${L.good}에 가족과의 유대를 강화하는 것이 좋습니다</li>
<li>👶 <strong>자녀 인연</strong>: 식신 기운이 강한 시기에 자녀와의 교감이 더 깊어집니다</li>
<li>💫 <strong>부모 관계</strong>: 인성의 흐름이 좋아 부모님의 도움이나 지지를 받을 수 있는 시기입니다</li>
<li>⚠️ <strong>주의 시기</strong>: ${L.care}에는 가족 간 오해가 생길 수 있으니 대화를 더 자주 나누세요</li>
<li>🌟 <strong>가정 운 강화 방법</strong>: ${L.dir}쪽에 가족 사진이나 행복한 기억 소품을 두면 좋습니다</li>
</ul>
<p>가족 구성원이나 자녀에 대한 구체적인 고민을 알려주시면 더 정확한 분석이 가능합니다. 👨‍👩‍👧</p>`; }
  ],

  '직무적성': [
    (q) => { const L = getLuckyInfo(); return `<h4>🎯 직무 적성 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>직무 적성은 사주의 <span class="highlight">일간(日干)의 특성과 용신(用神)</span>을 기반으로 판단합니다. 당신만의 강점 분야를 찾아드리겠습니다.</p>
<ul>
<li>✨ <strong>타고난 강점</strong>: 분석력과 창의성이 조화를 이루는 능력이 있습니다</li>
<li>🎯 <strong>최적 직무 분야</strong>: 기획·전략·컨텐츠·컨설팅 분야에서 두각을 나타낼 수 있습니다</li>
<li>📈 <strong>성장 가능성</strong>: ${L.good}에 자신의 강점을 드러낼 기회가 찾아옵니다</li>
<li>⚠️ <strong>맞지 않는 환경</strong>: 지나치게 반복적이거나 창의성이 억압된 환경은 맞지 않습니다</li>
<li>🌟 <strong>행운의 업무 방향</strong>: ${L.dir} 방향에 앉아 업무를 보면 집중력과 성과가 올라갑니다</li>
</ul>
<p>현재 하고 계신 일이나 고민 중인 분야를 알려주시면 더 맞춤화된 적성 분석을 해드립니다. 🎯</p>`; }
  ],

  '프리랜서운': [
    (q) => { const L = getLuckyInfo(); return `<h4>💻 프리랜서 운세 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>독립·프리랜서의 성공은 사주에서 <span class="highlight">편재(偏財)와 식신(食神)의 조화</span>에 달려 있습니다. 당신의 독립 기운을 살펴보겠습니다.</p>
<ul>
<li>🚀 <strong>독립 최적 시기</strong>: ${L.good}이 독립 에너지가 가장 강한 시기입니다</li>
<li>💰 <strong>수입 안정화</strong>: 처음 3~6개월이 가장 어렵습니다. 이 시기를 넘기면 안정됩니다</li>
<li>🤝 <strong>클라이언트 인연</strong>: ${L.dir} 방향에서 좋은 클라이언트 연결이 기대됩니다</li>
<li>⚠️ <strong>주의 시기</strong>: ${L.care}에는 큰 계약보다 소규모 프로젝트를 안전하게 진행하세요</li>
<li>🔢 <strong>수익 UP 숫자</strong>: ${L.num} — 이 숫자와 관련된 날 제안서를 보내면 성사율이 높습니다</li>
</ul>
<p>현재 업종과 독립 계획을 알려주시면 더 구체적인 프리랜서 운세 분석이 가능합니다. 💻</p>`; }
  ],

  '개업상담': [
    (q) => { const L = getLuckyInfo(); return `<h4>🏪 개업 종합 상담</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>개업 성공의 3요소는 <span class="highlight">타이밍, 위치, 업종</span>입니다. 사주에서 이 세 가지가 모두 맞아야 성공 확률이 높아집니다.</p>
<ul>
<li>📅 <strong>개업 길일</strong>: ${L.good}이 재물 기운과 활동 에너지가 가장 좋습니다</li>
<li>🧭 <strong>점포 입지</strong>: ${L.dir} 방향의 위치가 당신 사주에 길합니다</li>
<li>🎨 <strong>인테리어</strong>: ${L.color}을 포인트 색으로 활용하면 고객 유입이 활발해집니다</li>
<li>💰 <strong>초기 자금 운용</strong>: 오버투자보다 단계적 확장 전략이 더 안전합니다</li>
<li>⚠️ <strong>피해야 할 실수</strong>: ${L.care}에 무리한 확장이나 동업 계약은 신중하게 하세요</li>
</ul>
<p>개업 예정 업종과 지역을 알려주시면 더 세밀한 날짜와 방위 분석이 가능합니다. 🏪</p>`; }
  ],

  '동업궁합': [
    (q) => { const L = getLuckyInfo(); return `<h4>🤝 동업 궁합 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>동업 성패는 두 사람의 <span class="highlight">오행의 상생(相生)과 상극(相克)</span>에서 결정됩니다. 역할 분담이 잘 될수록 동업은 성공합니다.</p>
<ul>
<li>🔍 <strong>동업 궁합 포인트</strong>: 서로의 강점이 보완되는 관계인지 확인하는 것이 핵심입니다</li>
<li>📜 <strong>계약 체결</strong>: ${L.good}에 계약서를 작성하면 동업이 안정적으로 시작됩니다</li>
<li>⚠️ <strong>주의 시기</strong>: ${L.care}에는 중요한 사업 결정을 함께 내리는 것을 피하세요</li>
<li>💬 <strong>갈등 예방</strong>: 역할과 수익 분배를 처음부터 명확히 문서화하는 것이 필수입니다</li>
<li>🌟 <strong>좋은 동업자 유형</strong>: 당신을 보완해주는 실행력 강한 파트너가 이상적입니다</li>
</ul>
<p>동업 파트너의 생년월일을 알려주시면 두 분의 사주 궁합을 정밀 분석해드립니다. 🤝</p>`; }
  ],

  '상호명상담': [
    (q) => { const L = getLuckyInfo(); return `<h4>🏷️ 상호명 상담 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>상호명은 사업의 얼굴이자 기운입니다. <span class="highlight">발음의 에너지와 획수의 길흉</span>이 사업운에 영향을 미칩니다.</p>
<ul>
<li>🔤 <strong>좋은 상호명 조건</strong>: 발음이 밝고 기억하기 쉬우며, 오행 기운이 균형 잡혀야 합니다</li>
<li>✅ <strong>길한 획수</strong>: 사업 번창을 상징하는 획수 조합이 있습니다. 이름 후보를 주시면 분석해드립니다</li>
<li>🎨 <strong>색상과 연계</strong>: 상호명과 ${L.color}계열 CI를 사용하면 사업 기운이 상승합니다</li>
<li>📅 <strong>상호 등록 시기</strong>: ${L.good}에 사업자 등록을 하면 초기 기운이 좋습니다</li>
<li>⚠️ <strong>피해야 할 이름</strong>: 어두운 발음이나 '끊어지는' 느낌의 이름은 피하는 것이 좋습니다</li>
</ul>
<p>후보 상호명 2~3개를 알려주시면 사주와 획수를 함께 분석해드립니다. 🏷️</p>`; }
  ],

  '상호브랜드네이밍': [
    (q) => { const L = getLuckyInfo(); return `<h4>🏷️ 상호·브랜드 네이밍 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>브랜드명은 단순한 이름이 아닌 <span class="highlight">사업 에너지의 출발점</span>입니다. 좋은 브랜드명은 고객을 끌어당기는 기운이 있습니다.</p>
<ul>
<li>🎯 <strong>네이밍 방향</strong>: 직관적이고 기억에 남으며 긍정적 오행 기운을 담은 이름이 좋습니다</li>
<li>🔤 <strong>발음 에너지</strong>: 밝고 힘찬 자음으로 시작하는 이름이 재물운을 높입니다</li>
<li>✅ <strong>획수 분석</strong>: 브랜드명 후보를 알려주시면 획수와 오행 조화를 분석해드립니다</li>
<li>🎨 <strong>브랜드 컬러 추천</strong>: ${L.color}이 당신 사주와 가장 잘 맞는 브랜드 컬러입니다</li>
<li>📅 <strong>론칭 시기</strong>: ${L.good}에 브랜드를 런칭하면 초기 인지도 확산이 빠릅니다</li>
</ul>
<p>업종과 타깃 고객을 알려주시면 최적화된 브랜드 네이밍 방향을 제시해드립니다. 🏷️</p>`; }
  ],

  '업종추천': [
    (q) => { const L = getLuckyInfo(); return `<h4>🔎 업종 적성 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>어떤 업종이 성공할지는 사주의 <span class="highlight">용신(用神)과 희신(喜神)</span>에 따라 달라집니다. 당신 사주에 맞는 업종을 찾아드리겠습니다.</p>
<ul>
<li>💼 <strong>적합한 업종 유형</strong>: 사람을 만나고 소통하는 서비스업이 당신 사주에 맞습니다</li>
<li>🏪 <strong>구체적 추천 분야</strong>: 교육·상담·컨텐츠·뷰티·요식업이 재물운과 잘 맞습니다</li>
<li>💰 <strong>수익화 시기</strong>: ${L.good}에 본격적인 매출이 발생하는 구조를 만드세요</li>
<li>⚠️ <strong>피해야 할 업종</strong>: 혼자 반복 작업하는 제조업이나 물리적 노동 중심 업종은 맞지 않습니다</li>
<li>🌟 <strong>성공 키워드</strong>: 차별화된 전문성을 강조할 수 있는 업종에서 두각을 나타낼 수 있습니다</li>
</ul>
<p>본인의 경력, 자본금, 관심 분야를 알려주시면 더 구체적인 업종 추천이 가능합니다. 🔎</p>`; }
  ],

  '사주보완이름': [
    (q) => { const L = getLuckyInfo(); return `<h4>✨ 사주 보완 이름 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>사주 보완 이름은 <span class="highlight">사주의 약한 오행을 이름으로 채워주는</span> 전략적 작명법입니다. 운의 균형을 이름으로 맞출 수 있습니다.</p>
<ul>
<li>🔍 <strong>현재 이름 진단</strong>: 생년월일과 이름을 함께 분석하면 보완이 필요한 오행이 보입니다</li>
<li>✨ <strong>보완 방향</strong>: 부족한 기운을 가진 한자나 소리를 이름에 담으면 운의 흐름이 좋아집니다</li>
<li>📝 <strong>이름 변경 방법</strong>: 법적 개명 외에 호(號)나 예명을 활용하는 방법도 있습니다</li>
<li>⏰ <strong>이름 변경 적기</strong>: ${L.good}에 새 이름을 사용하기 시작하면 기운 변화가 빠릅니다</li>
<li>🎯 <strong>효과</strong>: 새 이름 사용 후 보통 3개월~1년 이내에 흐름의 변화가 나타납니다</li>
</ul>
<p>생년월일시와 현재 이름을 알려주시면 맞춤 사주 보완 이름을 분석해드립니다. ✨</p>`; }
  ],

  '브랜드네이밍': [
    (q) => { const L = getLuckyInfo(); return `<h4>🏷️ 브랜드 네이밍 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>브랜드 이름 하나가 사업의 성패를 가를 수 있습니다. <span class="highlight">좋은 브랜드명은 고객을 끌어당기는 에너지</span>가 있습니다.</p>
<ul>
<li>🎯 <strong>이름의 발음 에너지</strong>: 힘차고 밝은 소리의 이름이 브랜드 파워를 높입니다</li>
<li>🔢 <strong>획수의 힘</strong>: 사업 번창을 상징하는 획수 조합이 있습니다. 후보 이름을 알려주세요</li>
<li>🎨 <strong>브랜드 컬러</strong>: ${L.color}이 지금 사주 흐름과 가장 시너지가 큰 색상입니다</li>
<li>📅 <strong>런칭 타이밍</strong>: ${L.good}에 브랜드를 공개하면 초반 입소문이 빠르게 퍼집니다</li>
<li>✅ <strong>검증 방법</strong>: 후보 브랜드명 2~3개를 비교 분석해드릴 수 있습니다</li>
</ul>
<p>업종, 타깃층, 브랜드명 후보를 알려주시면 사주 관점의 브랜드 분석을 해드립니다. 🏷️</p>`; }
  ],

  '집터운': [
    (q) => { const L = getLuckyInfo(); return `<h4>🏡 집터운 · 풍수 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>집터의 기운은 거주자의 운에 직접적인 영향을 미칩니다. <span class="highlight">좋은 집터는 가정의 화목과 재물운을 높여줍니다.</span></p>
<ul>
<li>🏠 <strong>이상적인 집터</strong>: 배산임수(背山臨水)의 지형이 가장 좋은 집터입니다</li>
<li>🧭 <strong>방향 분석</strong>: ${L.dir} 방향에 개방된 전망이 있는 집이 당신 사주에 길합니다</li>
<li>🪟 <strong>채광과 환기</strong>: 햇빛이 잘 들고 바람이 잘 통하는 집이 기운을 살립니다</li>
<li>📅 <strong>입주 길한 날</strong>: ${L.good}에 입주하면 새 보금자리의 기운이 좋게 시작됩니다</li>
<li>⚠️ <strong>피해야 할 집터</strong>: T자형 도로 끝, 큰 나무 앞, 병원·묘지 인근은 피하는 것이 좋습니다</li>
</ul>
<p>보고 계신 집의 주소나 위치를 알려주시면 더 구체적인 집터운 분석이 가능합니다. 🏡</p>`; }
  ],

  '계약시기': [
    (q) => { const L = getLuckyInfo(); return `<h4>📝 계약 시기 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>계약 타이밍이 맞지 않으면 나중에 분쟁이 생기거나 손해를 볼 수 있습니다. <span class="highlight">사주에서 계약·약속에 길한 날</span>을 찾아드리겠습니다.</p>
<ul>
<li>✅ <strong>계약 길일</strong>: ${L.good}이 계약 에너지가 가장 안정적인 시기입니다</li>
<li>❌ <strong>계약 비추천 시기</strong>: ${L.care}에 서명한 계약은 나중에 문제가 생길 수 있습니다</li>
<li>🔢 <strong>길일 숫자</strong>: ${L.num}이 포함된 날짜에 계약을 체결하면 좋습니다</li>
<li>📋 <strong>계약서 작성 팁</strong>: 반드시 조건을 꼼꼼히 확인하고 유리한 조항을 먼저 협의하세요</li>
<li>🤝 <strong>상대방 신뢰도</strong>: 계약 전 상대방의 평판을 충분히 검토하는 것이 중요합니다</li>
</ul>
<p>계약 종류(부동산·사업·고용 등)와 예정 날짜를 알려주시면 더 정확한 길일을 잡아드립니다. 📝</p>`; }
  ],

  '여행운': [
    (q) => { const L = getLuckyInfo(); return `<h4>✈️ 여행운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>여행운은 사주의 <span class="highlight">역마살(驛馬煞)과 화개살(華蓋煞)의 흐름</span>으로 판단합니다. 지금이 여행하기 좋은 시기인지 살펴보겠습니다.</p>
<ul>
<li>✈️ <strong>여행 최적 시기</strong>: ${L.good}에 떠나는 여행은 좋은 추억과 기운을 가져다줍니다</li>
<li>❌ <strong>여행 피해야 할 시기</strong>: ${L.care}에는 장거리 여행보다 가까운 곳을 추천합니다</li>
<li>🧭 <strong>행운의 여행 방향</strong>: ${L.dir} 방향의 목적지가 좋은 기운을 줍니다</li>
<li>🎨 <strong>여행 아이템</strong>: ${L.color}색 여행 가방이나 소품이 행운을 불러옵니다</li>
<li>🔢 <strong>출발 길일</strong>: ${L.num}이 들어가는 날에 출발하면 여행 내내 좋은 기운이 따릅니다</li>
</ul>
<p>여행 목적지와 예정 날짜를 알려주시면 더 정확한 여행운 분석이 가능합니다. ✈️</p>`; }
  ],

  '조심할달': [
    (q) => { const L = getLuckyInfo(); return `<h4>⚠️ 조심해야 할 달 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>사주에서 <span class="highlight">형충파해(刑冲破害)가 겹치는 달</span>은 각별히 조심해야 합니다. 미리 알고 대비하면 피해를 최소화할 수 있습니다.</p>
<ul>
<li>⚠️ <strong>특히 조심할 달</strong>: ${L.care}은 예상치 못한 변수가 가장 많이 생기는 시기입니다</li>
<li>💰 <strong>재물 주의</strong>: 이 시기에는 큰 투자나 보증은 피하고 현금을 보유하는 것이 안전합니다</li>
<li>🏥 <strong>건강 주의</strong>: 과로와 스트레스에 특히 주의하고 규칙적인 생활을 유지하세요</li>
<li>🤝 <strong>인간관계</strong>: 새로운 사람보다 검증된 주변 사람을 더 의지하는 것이 좋습니다</li>
<li>✅ <strong>좋은 달</strong>: ${L.good}은 반대로 기운이 상승하는 시기이니 중요한 일은 이때 하세요</li>
</ul>
<p>생년월일을 알려주시면 올해 월별로 조심할 달과 좋은 달을 모두 분석해드립니다. ⚠️</p>`; }
  ],

  '기회가오는달': [
    (q) => { const L = getLuckyInfo(); return `<h4>🌟 기회가 오는 달 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>사주에서 <span class="highlight">생기(生氣)와 천덕(天德)이 활성화되는 달</span>에 기회가 찾아옵니다. 이 시기를 놓치지 않는 것이 중요합니다.</p>
<ul>
<li>🌟 <strong>기회의 달</strong>: ${L.good}은 당신에게 가장 좋은 기운이 오는 달입니다</li>
<li>💼 <strong>커리어 기회</strong>: 이 시기에 적극적으로 지원하거나 제안하면 성사율이 높습니다</li>
<li>💰 <strong>재물 기회</strong>: 예상치 못한 수입이나 좋은 거래 제안이 들어올 수 있습니다</li>
<li>💕 <strong>인연 기회</strong>: 새로운 사람을 만나거나 기존 관계가 발전할 수 있는 시기입니다</li>
<li>🚀 <strong>행동 지침</strong>: 기회의 달에는 소극적으로 기다리지 말고 먼저 행동하세요</li>
</ul>
<p>생년월일을 알려주시면 올해 가장 좋은 달 3개월과 조심할 달을 함께 분석해드립니다. 🌟</p>`; }
  ],

  '점성술상담': [
    (q) => { const L = getLuckyInfo(); return `<h4>🌙 점성술 운세 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>점성술은 행성의 위치와 별자리 기운으로 운명을 읽는 학문입니다. <span class="highlight">태양 별자리와 상승 별자리의 조합</span>이 당신의 핵심 기운을 보여줍니다.</p>
<div style="text-align:center;padding:12px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:12px;margin:12px 0;color:white">
  <div style="font-size:2rem">🌙</div>
  <div style="font-weight:700;font-size:1rem;margin:8px 0">2026년 목성의 기운</div>
  <div style="font-size:0.85rem;opacity:0.85">확장 · 성장 · 행운 · 새로운 시작</div>
</div>
<ul>
<li>⭐ <strong>현재 행성 기운</strong>: 목성의 확장 에너지가 당신에게 긍정적으로 작용하고 있습니다</li>
<li>📅 <strong>행운의 시기</strong>: ${L.good}에 목성 에너지가 가장 강하게 들어옵니다</li>
<li>🌟 <strong>올해 테마</strong>: 확장과 도전 — 새로운 영역에 발을 딛는 것이 올해의 과제입니다</li>
<li>⚠️ <strong>조심할 때</strong>: ${L.care}에는 토성의 제약 에너지가 강해집니다. 무리하지 마세요</li>
<li>🎨 <strong>행운의 색</strong>: ${L.color}색이 목성 에너지를 증폭시켜줍니다</li>
</ul>
<p>생년월일과 출생 시각, 출생지를 알려주시면 정밀 출생 차트 기반의 점성술 분석이 가능합니다. 🌙</p>`; }
  ],

  '개업시기': [
    (q) => { const L = getLuckyInfo(); return `<h4>🏪 개업 시기 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>개업은 타이밍이 절반입니다. 사주에서 <span class="highlight">재성(財星)과 식신(食神)이 활성화</span>되는 시기에 개업해야 성공 확률이 높습니다.</p>
<ul>
<li>✅ <strong>개업 길일</strong>: ${L.good}에 개업하면 초기 고객 유입이 좋고 사업이 빠르게 안정됩니다</li>
<li>❌ <strong>피해야 할 시기</strong>: ${L.care}은 자금 부족이나 예상치 못한 변수가 생길 수 있습니다</li>
<li>🧭 <strong>점포 위치</strong>: ${L.dir} 방향의 입지가 당신 사주에 길합니다</li>
<li>🔢 <strong>행운의 번지</strong>: ${L.num}이 포함된 주소나 호실이 좋습니다</li>
<li>🎨 <strong>인테리어 색상</strong>: ${L.color}을 포인트 색으로 쓰면 고객 유입에 도움이 됩니다</li>
</ul>
<p>업종과 준비 중인 위치를 알려주시면 더 정확한 개업 날짜를 잡아드릴 수 있습니다. 🏪</p>`; }
  ],

  '아이이름짓기': [
    (q) => { const L = getLuckyInfo(); return `<h4>👶 아이 이름 짓기 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>좋은 이름은 단순히 예쁜 것을 넘어 <span class="highlight">사주의 부족한 오행을 채워주는 역할</span>을 합니다. 이름이 운명을 보완하는 힘이 있습니다.</p>
<ul>
<li>🔍 <strong>이름 선택 기준</strong>: 오행 균형, 발음의 흐름, 획수 조화를 종합적으로 검토합니다</li>
<li>✨ <strong>보완이 필요한 오행</strong>: 아이 생년월일시를 알려주시면 부족한 오행을 파악해드립니다</li>
<li>📝 <strong>추천 이름 스타일</strong>: 부드러우면서도 강한 의지가 담긴 이름이 현재 시대에 잘 맞습니다</li>
<li>⚠️ <strong>피해야 할 글자</strong>: 사주에 특정 오행이 과다하면 그 기운을 더하는 한자는 피합니다</li>
<li>🎯 <strong>획수 조화</strong>: 성과 이름의 획수 합이 길수(吉數)에 맞도록 조정합니다</li>
</ul>
<p>아이의 생년월일시(태어난 시간 포함)와 성씨를 알려주시면 구체적인 이름 후보 3~5개를 분석해드리겠습니다. 👶</p>`; }
  ],

  '개명상담': [
    (q) => { const L = getLuckyInfo(); return `<h4>🔤 개명 상담 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>이름은 평생 불리는 에너지입니다. <span class="highlight">현재 이름이 사주와 맞지 않으면 운의 흐름을 막는 역할</span>을 할 수 있습니다.</p>
<ul>
<li>🔍 <strong>현재 이름 진단</strong>: 이름과 생년월일을 함께 분석하면 이름이 운에 미치는 영향을 파악할 수 있습니다</li>
<li>✅ <strong>개명이 도움되는 경우</strong>: 직업·금전·건강·대인관계 중 2가지 이상이 지속적으로 어렵다면 검토 가치가 있습니다</li>
<li>📝 <strong>개명 방향</strong>: 부족한 오행을 보완하고 발음이 강하고 기억에 남는 이름이 좋습니다</li>
<li>⏰ <strong>개명 적기</strong>: ${L.good}에 개명 신청을 하면 새로운 기운과 함께 시작할 수 있습니다</li>
<li>🎯 <strong>개명 후 효과</strong>: 보통 개명 후 3~6개월 이내에 변화가 나타납니다</li>
</ul>
<p>현재 이름과 생년월일시를 알려주시면 개명 필요성과 추천 이름을 분석해드립니다. 🔤</p>`; }
  ],

  '타로상담': [
    (q) => { const L = getLuckyInfo(); return `<h4>🃏 타로 카드 리딩</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>카드를 뽑아드리겠습니다. 마음속으로 질문에 집중하시고... 지금 나온 카드를 해석해드리겠습니다.</p>
<div style="text-align:center;padding:16px;background:linear-gradient(135deg,#2c3e50,#3498db);border-radius:12px;margin:12px 0;color:white">
  <div style="font-size:2rem">🃏</div>
  <div style="font-weight:700;font-size:1.1rem;margin:8px 0">THE STAR — 별</div>
  <div style="font-size:0.85rem;opacity:0.9">희망 · 재생 · 영감 · 평온</div>
</div>
<ul>
<li>⭐ <strong>카드 의미</strong>: 별 카드는 어두운 밤 이후 빛나는 별처럼 희망과 재생을 상징합니다</li>
<li>💫 <strong>현재 상황</strong>: 지금의 어려움은 곧 지나가고 밝은 시기가 올 것을 예고합니다</li>
<li>📅 <strong>변화 시기</strong>: ${L.good}에 긍정적인 변화가 찾아올 것입니다</li>
<li>💡 <strong>조언</strong>: 희망을 잃지 마세요. 지금이 바로 준비하고 씨를 뿌리는 시기입니다</li>
<li>🎨 <strong>행운의 색</strong>: ${L.color}색이 지금 당신에게 좋은 에너지를 줍니다</li>
</ul>
<p>더 구체적인 질문이 있으시면 말씀해주세요. 원하시는 주제로 다시 카드를 뽑아드릴게요. 🃏</p>`; }
  ],

  '이사운': [
    (q) => { const L = getLuckyInfo(); return `<h4>🏠 이사운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>이사는 생활 터전을 바꾸는 중요한 일입니다. <span class="highlight">사주에서 이사 방향과 시기를 잘 잡으면 운이 크게 달라집니다.</span></p>
<ul>
<li>✅ <strong>이사 길한 시기</strong>: ${L.good}에 이사하면 새 거처에서 좋은 기운이 시작됩니다</li>
<li>❌ <strong>피해야 할 시기</strong>: ${L.care}은 이사 후 크고 작은 문제가 생길 수 있습니다</li>
<li>🧭 <strong>길한 방향</strong>: 현재 거주지에서 ${L.dir} 방향으로 이사하는 것이 좋습니다</li>
<li>🏡 <strong>집 선택 기준</strong>: 채광이 좋고 ${L.dir}쪽에 창이 있는 집이 좋습니다</li>
<li>📅 <strong>이사 날짜</strong>: ${L.num}일이 포함된 날이 길일(吉日)입니다</li>
</ul>
<p>현재 주소와 이사 예정 지역을 알려주시면 더 정확한 방위 분석을 해드릴 수 있습니다. 🏠</p>`; }
  ],

  '2026병오년운세': [
    (q) => { const L = getLuckyInfo(); return `<h4>🔥 2026년 병오년 운세</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>2026년 병오년(丙午年)은 <span class="highlight">불(火)의 기운이 강한 변화와 도전의 해</span>입니다. 불말(火馬)의 에너지는 빠르고 강렬합니다.</p>
<ul>
<li>🔥 <strong>올해 전체 흐름</strong>: 변화와 새로운 시작에 좋은 에너지입니다. 주저하지 말고 도전하세요</li>
<li>💰 <strong>재물운</strong>: ${L.good}에 재물 흐름이 좋습니다. 이 시기에 적극적으로 활동하세요</li>
<li>💕 <strong>연애운</strong>: 올해 새로운 인연이 찾아올 가능성이 높습니다. 만남에 적극적으로 임하세요</li>
<li>💼 <strong>직업운</strong>: 승진, 이직, 창업 중 하나를 결정해야 하는 시기입니다</li>
<li>🏥 <strong>건강</strong>: 화(火)의 기운이 강한 해이므로 심장과 혈압에 주의하세요</li>
<li>⚠️ <strong>주의 시기</strong>: ${L.care}에는 충동적인 결정을 조심하세요</li>
</ul>
<p>생년월일을 알려주시면 2026년 월별 운세를 더 상세하게 분석해드릴 수 있습니다. 🔥</p>`; }
  ],

  '종합운세상담': [
    (q) => { const L = getLuckyInfo(); return `<h4>🔮 종합 사주 운세 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>사주 명리(四柱命理)로 현재의 전반적인 운세 흐름을 살펴드리겠습니다. 지금 이 시기는 <span class="highlight">중요한 전환점에 서 있는 시기</span>입니다.</p>
<ul>
<li>🌟 <strong>전반적인 운의 흐름</strong>: 상승 기운이 감지되며 긍정적인 변화가 예상됩니다</li>
<li>💕 <strong>연애·인간관계</strong>: 주변 사람들과의 관계가 더 깊어지는 시기입니다</li>
<li>💰 <strong>재물·사업</strong>: ${L.good}에 재물 기운이 가장 강합니다</li>
<li>💼 <strong>직업·커리어</strong>: 준비해온 것들이 빛을 발하는 시기가 다가오고 있습니다</li>
<li>🏥 <strong>건강</strong>: 과로에 주의하고 충분한 휴식을 취하세요</li>
<li>⚠️ <strong>조심할 것</strong>: ${L.care}에는 중요한 결정을 잠시 보류하는 것이 좋습니다</li>
<li>🍀 <strong>행운 아이템</strong>: ${L.color}색 / ${L.dir} 방향 / 숫자 ${L.num}</li>
</ul>
<p>생년월일시를 알려주시면 8글자 사주를 완전히 분석하여 더 정확한 운세를 봐드릴 수 있습니다. 🔮</p>`; }
  ],

  '시험운합격운': [
    (q) => { const L = getLuckyInfo(); return `<h4>📚 시험운 · 합격운 분석</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>시험운은 사주에서 <span class="highlight">인성(印星)과 관성(官星)의 기운</span>이 합쳐질 때 가장 강하게 발동합니다.</p>
<ul>
<li>✅ <strong>합격 가능성 높은 시험 시기</strong>: ${L.good}에 보는 시험이 가장 유리합니다</li>
<li>📖 <strong>공부 집중 시간대</strong>: 오전보다 오후~저녁 시간대 집중력이 더 높습니다</li>
<li>🧭 <strong>공부 방향</strong>: 책상을 ${L.dir} 방향으로 놓고 공부하면 집중이 잘 됩니다</li>
<li>🎨 <strong>시험장 아이템</strong>: ${L.color}색 펜이나 문구를 사용하면 좋은 기운이 옵니다</li>
<li>🔢 <strong>행운의 자리</strong>: 시험장에서 ${L.num}번과 관련된 자리가 길합니다</li>
</ul>
<p>준비 중인 시험 종류와 시험 날짜를 알려주시면 더 구체적인 합격운을 분석해드립니다. 📚</p>`; }
  ],

  'default': [
    (q) => { const L = getLuckyInfo(); return `<h4>🔮 운세 분석 결과</h4>
<p>${buildPersonalizedIntro(q)}</p>
<p>현재의 흐름은 <span class="highlight">새로운 변화를 앞두고 있는 전환점</span>으로 읽힙니다. 지금 느끼는 설렘과 긴장은 모두 자연스러운 신호입니다.</p>
<ul>
<li>🌟 <strong>현재 운의 흐름</strong>: 상승 기운이 감지되며 긍정적인 변화가 예상됩니다</li>
<li>📅 <strong>행운의 시기</strong>: ${L.good}이 가장 좋은 시기입니다. 중요한 일은 이 시기에 하세요</li>
<li>⚠️ <strong>주의할 점</strong>: ${L.care}에는 중요한 결정을 신중하게 내리세요</li>
<li>🍀 <strong>행운의 색</strong>: ${L.color}색이 지금 당신에게 좋은 에너지를 줍니다</li>
<li>🧭 <strong>행운의 방향</strong>: ${L.dir} 방향에서 좋은 기운이 옵니다</li>
<li>🔢 <strong>행운의 숫자</strong>: ${L.num}</li>
<li>🔥 <strong>2026 병오년 조언</strong>: 변화를 두려워하지 말고 적극적으로 도전하세요</li>
</ul>
<p>더 정확한 분석을 원하시면 <strong>생년월일시</strong>를 알려주시거나 더 구체적인 질문을 해주세요. 🌟</p>`; }
  ]
};

// getAIResponse 제거 — Gemini API 직접 호출로 대체됨

// ===== 상태 =====
let currentCat = DEFAULT_CAT;
let currentCatConfig = CAT_CONFIG[DEFAULT_CAT];
let isTyping = false;

// ===== 초기화 =====
function chatInit() {
  // 헤더 포인트
  updateHeaderPoints();

  // 카테고리 파라미터 처리
  const fromSession = sessionStorage.getItem('sajuon_category');
  const fromHeroQ   = sessionStorage.getItem('sajuon_hero_q');
  if (fromSession) {
    const key = fromSession.replace(/[\s·]/g, '');
    if (CAT_CONFIG[key]) {
      currentCat = key;
      currentCatConfig = CAT_CONFIG[key];
    } else {
      // 부분 매칭
      const found = Object.keys(CAT_CONFIG).find(k => k.includes(fromSession.replace(/\s/g, '').slice(0, 4)));
      if (found) { currentCat = found; currentCatConfig = CAT_CONFIG[found]; }
    }
    sessionStorage.removeItem('sajuon_category');
  }

  // 사이드바 렌더링
  renderSidebar();

  // 상단바 업데이트
  updateTopbar();

  // 포인트 정보 업데이트
  updatePointInfo();

  // 환영 메시지
  renderWelcome();

  // 히어로 질문 자동 입력
  if (fromHeroQ) {
    const ta = document.getElementById('chatInput');
    if (ta) ta.value = fromHeroQ;
    sessionStorage.removeItem('sajuon_hero_q');
  }

  // 이벤트
  initChatEvents();

  // Gemini API 키 상태 확인
  checkGeminiStatus();
}

function checkGeminiStatus() {
  const alert = document.getElementById('geminiKeyAlert');
  if (!alert) return;
  if (!hasGeminiKey()) {
    alert.style.display = 'block';
  } else {
    alert.style.display = 'none';
  }
}

function renderSidebar() {
  const inner = document.getElementById('sidebarInner');
  if (!inner) return;

  const groups = [
    { label: '인기 상담', keys: ['연애운', '궁합상담', '사업운재물운', '직업상담'] },
    { label: '연애·인간관계', keys: ['연애운', '궁합상담', '썸재회', '결혼운', '배우자복', '소개팅흐름', '인간관계갈등', '가족운자녀운'] },
    { label: '직업·취업', keys: ['직업상담', '취업운', '이직운', '승진운', '직무적성', '시험운합격운', '프리랜서운'] },
    { label: '사업·재물', keys: ['사업운재물운', '재물운', '개업시기', '동업궁합', '상호명상담', '업종추천'] },
    { label: '이름·작명', keys: ['아이이름짓기', '개명상담', '사주보완이름', '브랜드네이밍'] },
    { label: '라이프', keys: ['이사운', '집터운', '계약시기', '여행운', '조심할달', '기회가오는달'] },
    { label: '운세·타로', keys: ['타로상담', '점성술상담', '2026병오년운세', '종합운세상담'] },
  ];

  inner.innerHTML = groups.map(g => {
    const items = g.keys.map(k => {
      const c = CAT_CONFIG[k];
      if (!c) return '';
      return `<div class="sidebar-item${currentCat === k ? ' active' : ''}" onclick="selectCategory('${k}')">
        <span class="sidebar-item-icon">${c.icon}</span>
        <span class="sidebar-item-name">${k.replace(/([A-Z])/g, ' $1').trim()}</span>
        <span class="sidebar-item-pt">${c.cost}P</span>
      </div>`;
    }).join('');
    return `<div class="sidebar-group-title">${g.label}</div>${items}`;
  }).join('');

  // 사이드바 이름 표시 수정 (한글명 사용)
  const CAT_KR = {
    '연애운':'연애운','궁합상담':'궁합 상담','사업운재물운':'사업운·재물운','직업상담':'직업 상담',
    '썸재회':'썸·재회','결혼운':'결혼운','배우자복':'배우자복','소개팅흐름':'소개팅 흐름',
    '인간관계갈등':'인간관계 갈등','가족운자녀운':'가족운·자녀운','취업운':'취업운',
    '이직운':'이직운','승진운':'승진운','직무적성':'직무 적성','시험운합격운':'시험운·합격운',
    '프리랜서운':'프리랜서 운','재물운':'재물운','개업시기':'개업 시기','개업상담':'개업 상담',
    '동업궁합':'동업 궁합','상호명상담':'상호명 상담','상호브랜드네이밍':'상호·브랜드 네이밍',
    '업종추천':'업종 추천','아이이름짓기':'아이 이름짓기','개명상담':'개명 상담',
    '사주보완이름':'사주 보완 이름','브랜드네이밍':'브랜드 네이밍','이사운':'이사운',
    '집터운':'집터운','계약시기':'계약 시기','여행운':'여행운','조심할달':'조심할 달',
    '기회가오는달':'기회가 오는 달','타로상담':'타로 상담','점성술상담':'점성술 상담',
    '2026병오년운세':'2026 병오년 운세','종합운세상담':'종합 운세 상담',
  };

  // 사이드바 아이템 이름 재적용
  inner.querySelectorAll('.sidebar-item').forEach(el => {
    const key = el.getAttribute('onclick').replace(/selectCategory\('(.+)'\)/, '$1');
    const nameEl = el.querySelector('.sidebar-item-name');
    if (nameEl && CAT_KR[key]) nameEl.textContent = CAT_KR[key];
  });
}

const CAT_KR_MAP = {
  '연애운':'연애운','궁합상담':'궁합 상담','사업운재물운':'사업운·재물운','직업상담':'직업 상담',
  '썸재회':'썸·재회','결혼운':'결혼운','배우자복':'배우자복','소개팅흐름':'소개팅 흐름',
  '인관계갈등':'인간관계 갈등','가족운자녀운':'가족운·자녀운','취업운':'취업운',
  '이직운':'이직운','승진운':'승진운','직무적성':'직무 적성','시험운합격운':'시험운·합격운',
  '프리랜서운':'프리랜서 운','재물운':'재물운','개업시기':'개업 시기','개업상담':'개업 상담',
  '동업궁합':'동업 궁합','상호명상담':'상호명 상담','상호브랜드네이밍':'상호·브랜드 네이밍',
  '업종추천':'업종 추천','아이이름짓기':'아이 이름짓기','개명상담':'개명 상담',
  '사주보완이름':'사주 보완 이름','브랜드네이밍':'브랜드 네이밍','이사운':'이사운',
  '집터운':'집터운','계약시기':'계약 시기','여행운':'여행운','조심할달':'조심할 달',
  '기회가오는달':'기회가 오는 달','타로상담':'타로 상담','점성술상담':'점성술 상담',
  '2026병오년운세':'2026 병오년 운세','종합운세상담':'종합 운세 상담',
  '인간관계갈등':'인간관계 갈등',
};

function updateTopbar() {
  const iconEl = document.getElementById('catIconSm');
  const nameEl = document.getElementById('catNameLabel');
  if (iconEl) iconEl.textContent = currentCatConfig?.icon || '🔮';
  if (nameEl) nameEl.textContent = CAT_KR_MAP[currentCat] || currentCat;

  // 사이드바 active 업데이트
  document.querySelectorAll('.sidebar-item').forEach(el => {
    const key = el.getAttribute('onclick').replace(/selectCategory\('(.+)'\)/, '$1');
    el.classList.toggle('active', key === currentCat);
  });
}

function updatePointInfo() {
  const pts = getPoints();
  const costEl = document.getElementById('chatCostVal');
  const ptEl   = document.getElementById('chatPointVal');
  if (costEl) costEl.textContent = currentCatConfig?.cost || 200;
  if (ptEl)   ptEl.textContent   = pts.toLocaleString();
  updateHeaderPoints();
}

function renderWelcome() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const catName = CAT_KR_MAP[currentCat] || currentCat;
  const examples = getExamples(currentCat);

  // 카테고리별 특별 안내 메시지
  let specialNotice = '';
  if (currentCat === '타로상담') {
    specialNotice = `
      <div style="background:linear-gradient(135deg,#2c3e50,#3498db);border-radius:12px;padding:14px 16px;margin:12px 0;color:white;font-size:0.88rem;line-height:1.6">
        <div style="font-size:1.4rem;margin-bottom:6px">🃏</div>
        <strong>타로 리딩 안내</strong><br/>
        질문을 입력하면 <strong>78장 덱에서 카드를 자동으로 뽑아</strong> 해석해드립니다.<br/>
        연애·직장·결정 고민 등 구체적인 질문일수록 정확한 리딩이 가능합니다.<br/>
        <span style="opacity:0.8;font-size:0.82rem">과거-현재-미래 / 관계 스프레드 / 켈틱 크로스 자동 선택</span>
      </div>`;
  } else if (currentCat === '점성술상담') {
    specialNotice = `
      <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:12px;padding:14px 16px;margin:12px 0;color:white;font-size:0.88rem;line-height:1.6">
        <div style="font-size:1.4rem;margin-bottom:6px">🌙</div>
        <strong>점성술 출생 차트 분석</strong><br/>
        생년월일을 입력하면 <strong>태양궁·달 별자리·행성 위치를 정밀 계산</strong>해드립니다.<br/>
        출생 시간까지 알려주시면 <strong>어센던트(상승궁)</strong>도 함께 분석됩니다.<br/>
        <span style="opacity:0.8;font-size:0.82rem">예: 1990년 3월 15일 오전 9시생</span>
      </div>`;
  }

  msgs.innerHTML = `
    <div class="chat-welcome">
      <div class="welcome-icon">${currentCatConfig?.icon || '🔮'}</div>
      <h2 class="welcome-title">운세ON ${catName} 상담</h2>
      <p class="welcome-sub">
        궁금한 것을 자유롭게 질문해주세요.<br/>
        생년월일시를 함께 알려주시면 더 정확한 분석이 가능합니다.<br/>
        <strong>상담 1건 ${currentCatConfig?.cost || 200}P 차감</strong>
      </p>
      ${specialNotice}
      <div class="welcome-examples">
        <div class="welcome-examples-label">💡 예시 질문 클릭해서 바로 시작</div>
        ${examples.map(ex => `<button class="welcome-example-btn" onclick="setExample('${ex.replace(/'/g,'&#39;')}')">${ex}</button>`).join('')}
      </div>
    </div>
  `;
}

function getExamples(cat) {
  const map = {
    '연애운': ['그 사람이 저를 좋아하는 건지 궁금해요', '재회 가능성이 있을까요?', '언제쯤 새로운 인연이 생길까요?'],
    '궁합상담': ['저와 상대방의 궁합을 봐주세요', '결혼 상대로 잘 맞을까요?', '동업을 하려는데 이 분과 궁합이 어떤가요?'],
    '사업운재물운': ['올해 사업을 시작해도 좋을까요?', '지금 투자해도 괜찮을까요?', '올해 재물운이 어떤가요?'],
    '직업상담': ['이직을 고민 중인데 지금이 좋은 시기인가요?', '제 직무 적성이 궁금합니다', '승진 가능성이 있을까요?'],
    '아이이름짓기': [
      '2026년 3월 15일 오전 8시생 여자아이입니다. 김씨 성에 맞는 이름 추천해주세요',
      '2025년 12월 5일생 남자아이 이름 후보가 민준, 서준, 하준인데 어떤 이름이 좋나요?',
      '음력 2026년 1월 20일 오후 2시생 남자아이 사주에 맞는 이름을 지어주세요'
    ],
    '개명상담': [
      '현재 이름이 이지혜인데 사주와 잘 맞는지 분석해주세요. 1988년 5월 3일생입니다',
      '개명을 고려 중입니다. 1993년 8월 15일생 여자인데 추천 이름 알려주세요',
      '박씨 성에 사주 오행을 보완하는 개명 이름을 추천해주세요. 1990년 11월생입니다'
    ],
    '타로상담': [
      '1995년 8월생인데요, 지금 직장 고민 타로 봐주세요',
      '이 관계를 계속해야 할까요? 타로로 봐주세요',
      '2026년 전반적인 흐름을 타로 3장으로 읽어주세요'
    ],
    '점성술상담': [
      '1990년 3월 15일 오전 9시 서울 출생입니다. 출생 차트 분석해주세요',
      '저는 쌍둥이자리인데 2026년 연애운이 어떤가요?',
      '1985년 11월 5일생입니다. 태양궁과 달 별자리를 알려주세요'
    ],
    '사주보완이름': [
      '1987년 3월생 이씨 성인데 사주 오행을 보완하는 이름을 추천해주세요',
      '현재 이름 최성민인데 사주 오행과 잘 맞는지, 보완이 필요한지 분석해주세요',
      '1995년 7월생 여성입니다. 사주에서 부족한 오행을 채우는 이름으로 바꾸고 싶어요'
    ],
    '브랜드네이밍': [
      '카페 브랜드 이름으로 하나, 모도, 봄날 중 어떤 게 좋을까요?',
      '온라인 쇼핑몰 창업 예정입니다. 여성의류 브랜드명을 추천해주세요',
      '뷰티 브랜드 이름을 짓고 싶어요. 키워드는 자연, 순수, 빛입니다'
    ],
    '상호명상담': [
      '한식당 상호명으로 어울리는 이름을 추천해주세요. 1978년생 사장입니다',
      '미용실 상호명 후보가 헤어아트, 미인, 봄봄인데 어떤 게 좋을까요?',
      '인테리어 회사 상호명을 분석해주세요. 현재 이름은 모던하우스입니다'
    ],
    '상호브랜드네이밍': [
      'IT 스타트업 브랜드명을 추천해주세요. 키워드: 혁신, 연결, 미래',
      '교육 브랜드 이름으로 배움터, 지식나무, 새빛 중 추천해주세요',
      '반려동물용품 브랜드 네이밍 해주세요. 업종과 잘 맞는 오행 분석도 부탁드려요'
    ],
    '2026병오년운세': ['2026년 전체 운세가 궁금합니다', '올해 조심해야 할 달은 언제인가요?', '올해 가장 좋은 달은 언제인가요?'],
    'default': ['지금 상황에 대해 분석해주세요', '올해 운세가 궁금합니다', '제 생년월일로 사주를 봐주세요'],
  };
  return (map[cat] || map['default']);
}

function setExample(text) {
  const ta = document.getElementById('chatInput');
  if (ta) {
    ta.value = text;
    ta.focus();
    autoResizeTextarea(ta);
  }
}

function selectCategory(key) {
  currentCat = key;
  currentCatConfig = CAT_CONFIG[key] || CAT_CONFIG[DEFAULT_CAT];
  resetConversation(); // 카테고리 변경 시 대화 히스토리 초기화
  renderSidebar();
  updateTopbar();
  updatePointInfo();
  renderWelcome();

  // 모바일 사이드바 닫기
  document.getElementById('chatSidebar')?.classList.remove('open');
}

// ===== 메시지 전송 (Gemini AI 연동) =====
async function sendMessage() {
  if (isTyping) return;
  const ta = document.getElementById('chatInput');
  const text = ta?.value.trim();
  if (!text) return;

  const pts  = getPoints();
  const cost = currentCatConfig?.cost || 200;

  if (pts < cost) {
    showModal(pts, cost);
    return;
  }

  // Gemini API 키 확인
  if (!hasGeminiKey()) {
    showApiKeyBanner();
    return;
  }

  // 포인트 차감
  const newPts = pts - cost;
  localStorage.setItem('sajuon_points', String(newPts));
  updatePointInfo();

  // 이용 내역 저장
  saveHistory(CAT_KR_MAP[currentCat] || currentCat, cost, text);

  // 사용자 메시지 표시
  appendUserMsg(text);
  ta.value = '';
  autoResizeTextarea(ta);

  // 전송 버튼 비활성화
  isTyping = true;
  const btn = document.getElementById('chatSendBtn');
  if (btn) btn.disabled = true;

  // 타이핑 인디케이터
  const typingId = appendTyping();

  // AI 메시지 버블 미리 생성 (스트리밍용)
  let aiMsgEl = null;
  let bubbleEl = null;
  let started = false;

  await callGeminiStream(
    currentCat,
    text,

    // onChunk: 텍스트가 들어올 때마다 호출
    (partialText) => {
      if (!started) {
        started = true;
        removeTyping(typingId);
        // AI 메시지 버블 생성
        const result = appendAIMsgStreaming(cost);
        aiMsgEl  = result.el;
        bubbleEl = result.bubble;
      }
      if (bubbleEl) {
        bubbleEl.innerHTML = convertMarkdownToHtml(partialText);
        scrollToBottom();
      }
    },

    // onDone: 완료 시
    (fullText) => {
      if (bubbleEl) {
        // HTML 태그가 없으면 마크다운 변환 적용
        const hasHtml = /<[a-z][\s\S]*>/i.test(fullText);
        bubbleEl.innerHTML = hasHtml ? fullText : convertMarkdownToHtml(fullText);
        scrollToBottom();
      }
      isTyping = false;
      if (btn) btn.disabled = false;
      updatePointInfo();

      if (newPts < cost) {
        setTimeout(() => appendSystemMsg(
          `⚠️ 포인트가 ${newPts}P 남았습니다. <a href="pricing.html" style="color:var(--accent-dark);font-weight:700;">충전하러 가기</a>`
        ), 300);
      }
    },

    // onError: 오류 시
    (errMsg) => {
      removeTyping(typingId);
      // 포인트 환불
      localStorage.setItem('sajuon_points', String(pts));
      updatePointInfo();
      // 이용내역 환불
      refundLastHistory();

      isTyping = false;
      if (btn) btn.disabled = false;

      appendErrorMsg(errMsg);
    }
  );
}

function appendUserMsg(text) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg-row msg-row--user';
  div.innerHTML = `
    <div class="msg-avatar">나</div>
    <div class="msg-content">
      <div class="msg-meta">
        <span class="msg-name">나</span>
        <span>${getTimeStr()}</span>
      </div>
      <div class="msg-bubble">${escHtml(text)}</div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
}

function appendAIMsg(html, cost) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const catName = CAT_KR_MAP[currentCat] || currentCat;
  const div = document.createElement('div');
  div.className = 'msg-row msg-row--ai';
  div.innerHTML = `
    <div class="msg-avatar">🔮</div>
    <div class="msg-content">
      <div class="msg-meta">
        <span class="msg-name">운세ON · ${catName}</span>
        <span>${getTimeStr()}</span>
        <span class="msg-cost-badge">-${cost}P</span>
      </div>
      <div class="msg-bubble">${html}</div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
}

// 스트리밍용 AI 메시지 버블 생성 (내용은 나중에 채움)
function appendAIMsgStreaming(cost) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return { el: null, bubble: null };
  const catName = CAT_KR_MAP[currentCat] || currentCat;
  const div = document.createElement('div');
  div.className = 'msg-row msg-row--ai';
  div.innerHTML = `
    <div class="msg-avatar">🔮</div>
    <div class="msg-content">
      <div class="msg-meta">
        <span class="msg-name">운세ON · ${catName}</span>
        <span>${getTimeStr()}</span>
        <span class="msg-cost-badge">-${cost}P</span>
        <span class="streaming-badge">✨ AI 분석 중</span>
      </div>
      <div class="msg-bubble streaming-bubble"></div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
  const bubble = div.querySelector('.msg-bubble');
  // 스트리밍 완료 시 배지 제거
  const badge = div.querySelector('.streaming-badge');
  const observer = new MutationObserver(() => {
    if (bubble.textContent.length > 50 && badge) badge.remove();
  });
  observer.observe(bubble, { childList: true, subtree: true, characterData: true });
  return { el: div, bubble };
}

// 오류 메시지
function appendErrorMsg(msg) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.className = 'msg-row msg-row--error';
  div.innerHTML = `
    <div class="msg-avatar" style="background:#fee2e2">⚠️</div>
    <div class="msg-content">
      <div class="msg-meta">
        <span class="msg-name" style="color:#dc2626">오류 발생</span>
        <span>${getTimeStr()}</span>
      </div>
      <div class="msg-bubble" style="background:#fff5f5;border-color:#fecaca;color:#dc2626">
        <strong>⚠️ AI 응답 오류</strong><br/>
        ${escHtml(msg)}<br/>
        <small style="color:#9b2c2c;margin-top:6px;display:block">포인트는 자동 환불되었습니다.</small>
      </div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
}

// 마지막 이용내역 환불 (오류 시)
function refundLastHistory() {
  try {
    const hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
    if (hist.length && hist[0].amount < 0) hist.shift();
    localStorage.setItem('sajuon_history', JSON.stringify(hist));
  } catch(_) {}
}

// API 키 미설정 안내 배너 표시
function showApiKeyBanner() {
  const existing = document.getElementById('apiKeyBanner');
  if (existing) { existing.classList.add('shake'); setTimeout(()=>existing.classList.remove('shake'),500); return; }

  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.id = 'apiKeyBanner';
  div.className = 'api-key-banner';
  div.innerHTML = `
    <div class="api-key-banner-inner">
      <div class="api-key-banner-icon">🔑</div>
      <div class="api-key-banner-text">
        <strong>Gemini API 키를 설정해야 AI 상담이 시작됩니다</strong>
        <p>관리자 페이지 → AI 설정에서 Google Gemini API 키를 입력해주세요.</p>
      </div>
      <div class="api-key-banner-actions">
        <a href="admin.html#ai" class="btn btn-primary btn-sm">🔧 키 설정하러 가기</a>
        <button class="btn btn-outline btn-sm" onclick="showInlineKeyInput()">직접 입력</button>
      </div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
}

// 채팅창 내 API 키 직접 입력
function showInlineKeyInput() {
  const existing = document.getElementById('inlineKeyForm');
  if (existing) return;
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.id = 'inlineKeyForm';
  div.className = 'inline-key-form';
  div.innerHTML = `
    <div class="inline-key-inner">
      <label>🔑 Gemini API 키 입력</label>
      <div class="inline-key-row">
        <input type="password" id="inlineKeyInput" placeholder="AIzaSy..." class="chat-textarea" style="flex:1;height:auto;padding:10px 14px;font-size:0.88rem" />
        <button class="chat-send-btn" onclick="saveInlineKey()" style="background:var(--accent)"><i class="fas fa-check"></i></button>
      </div>
      <small>Google AI Studio (aistudio.google.com)에서 무료 발급 가능합니다</small>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
  document.getElementById('inlineKeyInput')?.focus();
}

function saveInlineKey() {
  const val = document.getElementById('inlineKeyInput')?.value?.trim();
  if (!val || !val.startsWith('AIza')) {
    appendSystemMsg('❌ 올바른 API 키 형식이 아닙니다. AIzaSy... 로 시작하는 키를 입력하세요.');
    return;
  }
  setGeminiKey(val);
  document.getElementById('apiKeyBanner')?.remove();
  document.getElementById('inlineKeyForm')?.remove();
  appendSystemMsg('✅ API 키가 저장되었습니다! 이제 AI 상담을 시작할 수 있습니다. 🔮');
}

function appendSystemMsg(html) {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const div = document.createElement('div');
  div.style.cssText = 'text-align:center;font-size:0.82rem;color:var(--text-muted);padding:4px 0';
  div.innerHTML = html;
  msgs.appendChild(div);
  scrollToBottom();
}

function appendTyping() {
  const msgs = document.getElementById('chatMessages');
  if (!msgs) return;
  const id = 'typing_' + Date.now();
  const div = document.createElement('div');
  div.className = 'msg-row msg-row--ai typing-indicator';
  div.id = id;
  div.innerHTML = `
    <div class="msg-avatar">🔮</div>
    <div class="msg-content">
      <div class="msg-bubble">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  msgs.appendChild(div);
  scrollToBottom();
  return id;
}

function removeTyping(id) {
  document.getElementById(id)?.remove();
}

function scrollToBottom() {
  const msgs = document.getElementById('chatMessages');
  if (msgs) msgs.scrollTop = msgs.scrollHeight;
}

function getTimeStr() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function autoResizeTextarea(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
}

// ===== 채팅 리셋 =====
function resetChat() {
  resetConversation(); // Gemini 대화 히스토리 초기화
  renderWelcome();
  appendSystemMsg('🔄 새 대화가 시작되었습니다. 이전 대화 내용은 초기화되었습니다.');
}

// ===== 모달 =====
function showModal(current, need) {
  document.getElementById('modalCurrentPt').textContent = current.toLocaleString();
  document.getElementById('modalNeedPt').textContent = need;
  document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}

// ===== 이벤트 초기화 =====
function initChatEvents() {
  // 텍스트에어리어
  const ta = document.getElementById('chatInput');
  if (ta) {
    ta.addEventListener('input', () => autoResizeTextarea(ta));
    ta.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // 모바일 사이드바
  const menuBtn = document.getElementById('chatMenuBtn');
  const sidebar = document.getElementById('chatSidebar');
  const sidebarClose = document.getElementById('sidebarClose');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
  if (sidebarClose && sidebar) {
    sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
  }

  // 모달 오버레이 클릭
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  // 모바일 메뉴
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('mainNav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => nav.classList.toggle('open'));
  }
}

// ===== 이용 내역 저장 =====
function saveHistory(cat, cost, question) {
  try {
    const hist = JSON.parse(localStorage.getItem('sajuon_history') || '[]');
    hist.unshift({
      date: new Date().toLocaleString('ko-KR'),
      type: `AI 상담 · ${cat}`,
      amount: -cost,
      note: question.slice(0, 30) + (question.length > 30 ? '...' : '')
    });
    if (hist.length > 100) hist.splice(100);
    localStorage.setItem('sajuon_history', JSON.stringify(hist));
  } catch(e) {}
}

// ===== 실행 =====
document.addEventListener('DOMContentLoaded', () => {
  initPoints();
  chatInit();
});

// ===== 사주 입력 패널 =====
function toggleSajuPanel() {
  const panel = document.getElementById('sajuInputPanel');
  if (!panel) return;
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  const btn = document.getElementById('sajuToggleBtn');
  if (btn) btn.style.background = isOpen ? '#f5f5f5' : '#e8f5e9';
}

function updateSajuCalType() {
  const isLunar = document.getElementById('calLunar')?.checked;
  const leapLabel = document.getElementById('leapLabel');
  if (leapLabel) leapLabel.style.display = isLunar ? 'flex' : 'none';
  updateSajuPreview();
}

function updateSajuPreview() {
  const preview = document.getElementById('sajuPreview');
  if (!preview) return;

  const year  = parseInt(document.getElementById('sajuYear')?.value);
  const month = parseInt(document.getElementById('sajuMonth')?.value);
  const day   = parseInt(document.getElementById('sajuDay')?.value);
  const hourVal = parseInt(document.getElementById('sajuHour')?.value);
  const isLunar = document.getElementById('calLunar')?.checked || false;
  const isLeap  = document.getElementById('calLeap')?.checked || false;

  if (!year || !month || !day) { preview.textContent = ''; return; }

  if (typeof calcSaju !== 'function') { preview.textContent = ''; return; }

  try {
    const saju = calcSaju({ year, month, day, hour: isNaN(hourVal) ? -1 : hourVal, isLunar, isLeap });
    if (saju.error) { preview.textContent = '⚠️ ' + saju.error; return; }
    const s = saju.summary;
    const calStr = isLunar ? '음력 ' : '양력 ';
    const solStr = '→ 양력 ' + saju.solar.year + '/' + saju.solar.month + '/' + saju.solar.day;
    preview.innerHTML =
      (isLunar ? solStr + ' | ' : '') +
      '연주: <b>' + s.yearPillar + '</b> 월주: <b>' + s.monthPillar + '</b> 일주: <b>' + s.dayPillar + '</b> 시주: <b>' + s.timePillar.split(' ')[0] + '</b>' +
      ' | 용신: <b>' + s.yongsinStr + '</b>';
  } catch(e) {
    preview.textContent = '';
  }
}

function applySajuInput() {
  const year  = document.getElementById('sajuYear')?.value;
  const month = document.getElementById('sajuMonth')?.value;
  const day   = document.getElementById('sajuDay')?.value;
  const hourSel = document.getElementById('sajuHour');
  const hourVal = hourSel?.value;
  const isLunar = document.getElementById('calLunar')?.checked || false;
  const isLeap  = document.getElementById('calLeap')?.checked || false;

  if (!year || !month || !day) {
    appendSystemMsg('⚠️ 년, 월, 일을 모두 입력해주세요.');
    return;
  }

  const calStr = isLunar ? '음력 ' : '';
  const leapStr = isLeap ? ' 윤달' : '';
  const hourLabel = hourSel?.options[hourSel.selectedIndex]?.text || '';
  const timeStr = (hourVal === '-1' || hourVal === undefined) ? '' : ' ' + hourLabel;

  const inputText = calStr + year + '년 ' + month + '월 ' + day + '일' + leapStr + timeStr;

  const ta = document.getElementById('chatInput');
  if (ta) {
    // 기존 내용이 있으면 앞에 추가, 없으면 대입
    if (ta.value.trim()) {
      ta.value = inputText + ' ' + ta.value.trim();
    } else {
      ta.value = inputText;
    }
    autoResizeTextarea(ta);
    ta.focus();
  }

  // 패널 닫기
  document.getElementById('sajuInputPanel').style.display = 'none';
  document.getElementById('sajuToggleBtn').style.background = '#f5f5f5';
}

// 사주 입력 필드 변경 시 미리보기 업데이트 (DOM 로드 후)
document.addEventListener('DOMContentLoaded', function() {
  ['sajuYear','sajuMonth','sajuDay','sajuHour'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateSajuPreview);
    if (el) el.addEventListener('change', updateSajuPreview);
  });
});
