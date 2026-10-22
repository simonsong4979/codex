// Source: family itinerary PDF. Times are plans, never confirmed reservations.
export const trip = {
  name: '도쿄, 우리 함께', start: '2027-01-04', end: '2027-01-07', people: 3,
  hotel: '토부 호텔 레반트 도쿄', hotelQuery: 'Tobu Hotel Levant Tokyo',
  days: [
    {
      date: '2027-01-04', weekday: '월', title: '아사쿠사 · 스카이트리',
      subtitle: '인천 → 나리타 → 호텔 → 아사쿠사 → 스카이트리',
      area: '나리타 · 아사쿠사 · 스카이트리', icon: 'sunrise',
      events: [
        { id:'d1-1', time:'06:30', end:'07:30', title:'집 → 인천국제공항', kind:'move', mode:'택시', note:'06:30 집에서 출발. 여권과 짐을 한 번 더 확인해요.', query:'Incheon International Airport' },
        { id:'d1-2', time:'07:30', end:'10:25', title:'인천공항 체크인', kind:'flight', mode:'공항 내 도보', note:'항공편·터미널과 체크인 마감 시각은 예약 내역으로 확인해요.', query:'Incheon International Airport' },
        { id:'d1-3', time:'10:25', end:'12:50', title:'인천 → 나리타', kind:'flight', mode:'비행기', note:'항공편 출도착 예정 시각. 한국과 일본은 시차가 없어요.' },
        { id:'d1-4', time:'12:50', end:'14:30', title:'나리타공항 → 토부 호텔 레반트 도쿄', kind:'move', mode:'지하철 및 도보', note:'입국 심사·수하물 수령·열차 대기 시간을 포함해 다시 확인해요.', query:'Tobu Hotel Levant Tokyo', origin:'Narita International Airport', caution:true },
        { id:'d1-5', time:'14:30', end:'15:30', title:'토부 호텔 레반트 도쿄 · 체크인', kind:'stay', mode:'호텔', note:'체크인 후 짐 정리·휴식. 실제 체크인 가능 시각은 호텔 예약 내역을 확인해요.', query:'Tobu Hotel Levant Tokyo' },
        { id:'d1-6', time:'15:30', end:'16:00', title:'호텔 → 이치란 아사쿠사점', kind:'move', mode:'지하철 또는 버스', query:'Ichiran Asakusa', origin:'Tobu Hotel Levant Tokyo' },
        { id:'d1-7', time:'16:00', end:'17:00', title:'이치란 아사쿠사점', kind:'food', mode:'식사', place:'이치란 아사쿠사점', note:'현장 대기 시간에 따라 다음 일정을 여유 있게 조절해요.', query:'Ichiran Asakusa' },
        { id:'d1-8', time:'17:00', end:'18:00', title:'센소지 · 아사쿠사', kind:'visit', mode:'도보', place:'아사쿠사 실크푸딩 본점 · 주변 먹거리', note:'센소지·주변 먹거리·실크푸딩 방문. 각 점포의 영업시간을 확인해요.', query:'Senso-ji Tokyo', extraMap:{label:'실크푸딩', query:'Asakusa Silk Pudding main store'} },
        { id:'d1-9', time:'18:00', end:'18:10', title:'아사쿠사 → 스카이트리', kind:'move', mode:'지하철 또는 버스', note:'원본의 이동 계획은 10분. 역 이동·대기까지 포함한 실제 경로를 확인해요.', query:'Tokyo Skytree', origin:'Asakusa Silk Pudding main store' },
        { id:'d1-10', time:'18:10', end:'19:30', title:'도쿄 스카이트리', kind:'visit', mode:'관람', place:'도쿄 스카이트리', note:'입장권과 선택한 시간대를 확인해요.', query:'Tokyo Skytree', booking:'입장권 확인' },
        { id:'d1-11', time:'19:30', title:'자유시간 · 호텔 복귀 선택', kind:'rest', mode:'자유시간', note:'가족 컨디션에 맞춰 저녁을 먹거나 호텔로 돌아가요.', query:'Tobu Hotel Levant Tokyo' }
      ]
    },
    {
      date:'2027-01-05', weekday:'화', title:'도쿄타워 · 시부야 · 팀랩',
      subtitle:'시바공원 → 시부야 → 도요스 → 아키하바라',
      area:'시바 · 시부야 · 도요스 · 아키하바라', icon:'city',
      warning:'저녁 식당 지점 확인이 필요해요. 원본 이동 경로는 아키하바라점, 식사 항목은 아사쿠사점으로 서로 다릅니다.',
      events:[
        { id:'d2-1', time:'09:00', end:'10:00', title:'호텔 → 도쿄타워', kind:'move', mode:'지하철 및 도보', note:'09:00 호텔 출발.', query:'Tokyo Tower', origin:'Tobu Hotel Levant Tokyo' },
        { id:'d2-2', time:'10:00', end:'11:00', title:'도쿄타워 · 시바공원', kind:'visit', mode:'도보', place:'도쿄타워 · 시바공원', query:'Tokyo Tower', booking:'입장권 확인', extraMap:{label:'시바공원',query:'Shiba Park Tokyo'} },
        { id:'d2-3', time:'11:00', end:'12:00', title:'스타벅스 시바 다이몬점', kind:'food', mode:'카페', place:'스타벅스 시바 다이몬점', query:'Starbucks Shiba Daimon Tokyo' },
        { id:'d2-4', time:'12:00', end:'12:30', title:'시바 다이몬 → 시부야', kind:'move', mode:'지하철 및 도보', query:'Shibuya Scramble Crossing', origin:'Starbucks Shiba Daimon Tokyo' },
        { id:'d2-5', time:'12:30', end:'14:00', title:'시부야 스크램블 교차로 · 시부야 스카이', kind:'visit', mode:'도보', place:'시부야역 일대', note:'시부야 스카이에 입장한다면 예약 시간과 운영 여부를 확인해요.', query:'Shibuya Sky', extraMap:{label:'교차로',query:'Shibuya Scramble Crossing'}, booking:'예약 여부 확인' },
        { id:'d2-6', time:'14:00', end:'15:00', title:'모헤지 시부야 스크램블 스퀘어점', kind:'food', mode:'식사', place:'모헤지 시부야 스크램블 스퀘어점', query:'Moheji Shibuya Scramble Square' },
        { id:'d2-7', time:'15:00', end:'15:10', title:'모헤지 → 시부야 센터가이', kind:'move', mode:'도보', query:'Shibuya Center Gai', origin:'Moheji Shibuya Scramble Square' },
        { id:'d2-8', time:'15:10', end:'16:30', title:'시부야 센터가이 · 쇼핑', kind:'visit', mode:'도보', place:'시부야 센터가이', note:'스트릿 브랜드 매장·센터가이 일대 쇼핑.', query:'Shibuya Center Gai' },
        { id:'d2-9', time:'16:30', end:'17:30', title:'시부야 → 팀랩 플래닛', kind:'move', mode:'지하철 및 도보', query:'teamLab Planets TOKYO', origin:'Shibuya Center Gai' },
        { id:'d2-10', time:'17:30', end:'18:30', title:'팀랩 플래닛 TOKYO', kind:'visit', mode:'체험', place:'팀랩 플래닛 TOKYO · 도요스', note:'원본의 계획 시간이에요. 실제 예매 시간과 관람 소요 시간을 확인해요.', query:'teamLab Planets TOKYO', booking:'예약 시간 확인' },
        { id:'d2-11', time:'18:30', end:'19:30', title:'팀랩 → 저녁 식당', kind:'move', mode:'지하철 및 도보', note:'원본 이동 행에는 토리키조쿠 아키하바라점으로 기재되어 있어요. 지점 확정 후 길찾기를 이용해요.', caution:true },
        { id:'d2-12', time:'19:30', end:'20:30', title:'토리키조쿠 · 저녁 식사', kind:'food', mode:'식사', place:'토리키조쿠 · 지점 미확정', note:'원본 식사 행은 아사쿠사점, 이동 행은 아키하바라점입니다. 다음 아키하바라 일정까지 고려해 지점을 먼저 정해요.', caution:true },
        { id:'d2-13', time:'20:30', end:'21:00', title:'아키하바라', kind:'visit', mode:'도보', place:'아키하바라', query:'Akihabara Tokyo' },
        { id:'d2-14', time:'21:00', end:'21:20', title:'아키하바라 → 호텔 복귀', kind:'move', mode:'지하철 및 도보', note:'원본의 자유시간·귀가 계획. 실제 출발지에 따라 이동 시간은 달라져요.', query:'Tobu Hotel Levant Tokyo', origin:'Akihabara Tokyo' }
      ]
    },
    {
      date:'2027-01-06', weekday:'수', title:'도쿄 디즈니랜드',
      subtitle:'마이하마 이동 · 디즈니랜드 종일 일정',
      area:'마이하마 · 도쿄 디즈니랜드', icon:'sparkles',
      warning:'07:30은 원본의 도착 목표입니다. 디즈니랜드의 확정 개장 시각이 아니며, 운영시간과 입장권은 공식 사이트에서 확인해요.',
      events:[
        { id:'d3-1', time:'06:30', end:'07:30', title:'호텔 → 도쿄 디즈니랜드', kind:'move', mode:'지하철 및 도보', place:'호텔 → 도쿄 디즈니랜드', note:'06:30 호텔 출발. 간단한 아침과 따뜻한 옷을 챙겨요.', query:'Tokyo Disneyland', origin:'Tobu Hotel Levant Tokyo' },
        { id:'d3-2', time:'07:30', title:'도쿄 디즈니랜드', kind:'visit', mode:'종일 자유 일정', place:'도쿄 디즈니랜드', note:'도착 목표 07:30. 실제 개장 후 입장하며, 식사·휴식·귀가 시각은 현장에서 가족 컨디션에 맞춰 정해요.', query:'Tokyo Disneyland', booking:'날짜 지정 입장권 확인' }
      ]
    },
    {
      date:'2027-01-07', weekday:'목', title:'나리타공항 · 인천 귀국',
      subtitle:'호텔 체크아웃 → 나리타공항 → 인천공항',
      area:'호텔 · 나리타 · 인천', icon:'plane',
      warning:'호텔 → 나리타공항 1시간은 검증 전의 계획입니다. 실제 교통편·터미널·체크인 마감을 확인하고 필요하면 더 일찍 출발해요.',
      events:[
        { id:'d4-1', time:'09:00', end:'10:00', title:'호텔 체크아웃 → 나리타공항', kind:'move', mode:'지하철 및 도보', note:'09:00 호텔 출발 계획. 체크아웃·수하물·교통편을 미리 확인해요.', query:'Narita International Airport', origin:'Tobu Hotel Levant Tokyo', caution:true },
        { id:'d4-2', time:'10:00', end:'13:15', title:'나리타국제공항 · 체크인', kind:'flight', mode:'공항 내 도보', place:'나리타국제공항', note:'항공편의 터미널과 수하물 규정을 확인해요.', query:'Narita International Airport' },
        { id:'d4-3', time:'13:15', end:'16:15', title:'나리타 → 인천', kind:'flight', mode:'비행기', note:'귀국편 예정 시각. 항공사 예약 내역과 운항 변경을 확인해요.' }
      ]
    }
  ]
};

export const checklist = [
  {title:'예약 & 교통', items:[
    ['flight','항공편·터미널·수하물 확인'], ['hotel','호텔 예약·체크인/아웃 확인'],
    ['airport','공항 ↔ 호텔 교통편·시간 확인'], ['skytree','스카이트리 입장권 확인'],
    ['tower','도쿄타워 입장권 확인'], ['sky','시부야 스카이 예약 여부 확인'],
    ['teamlab','팀랩 플래닛 예약 시간 확인'], ['disney','디즈니랜드 입장권·운영시간 확인'],
    ['dinner','둘째 날 토리키조쿠 지점 확정']
  ]},
  {title:'출발 전 챙기기', items:[
    ['passport','여권·항공권·예약 확인서'], ['insurance','여행자보험·긴급 연락처'],
    ['internet','로밍/eSIM·오프라인 지도'], ['money','결제 카드·엔화·교통카드'],
    ['power','일본용 플러그·충전기·보조배터리'], ['warm','따뜻한 옷·편한 신발·상비약'],
    ['offline','이 사이트 오프라인 저장 확인']
  ]}
];

export const officialLinks = [
  ['도쿄 스카이트리','https://www.tokyo-skytree.jp/en/'],
  ['도쿄타워','https://www.tokyotower.co.jp/en/'],
  ['시부야 스카이','https://www.shibuya-scramble-square.com/sky/'],
  ['팀랩 플래닛','https://www.teamlab.art/e/planets/'],
  ['도쿄 디즈니리조트','https://www.tokyodisneyresort.jp/en/'],
  ['호텔 레반트 도쿄','https://www.tobuhotel.co.jp/levant/en/'],
  ['나리타공항','https://www.narita-airport.jp/en/']
];
