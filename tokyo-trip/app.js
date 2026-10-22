import { trip, checklist, officialLinks } from './itinerary.js';

const paths = {
  sun:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-6v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
  moon:'M20 15.3A9 9 0 0 1 8.7 4a9 9 0 1 0 11.3 11.3Z',
  calendar:'M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z',
  users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.9M14 3.1a4 4 0 0 1 0 7.8M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  plane:'m22 2-7 20-4-9-9-4 20-7ZM11 13 22 2',
  bed:'M3 18v3m18-3v3M3 10V5h18v13H3v-8Zm0 3h18M7 9h3m4 0h3',
  sparkles:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7-1v4m-2-2h4',
  'map-pin':'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  share:'M12 16V3m-5 5 5-5 5 5M5 12v8h14v-8',
  'check-circle':'M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3',
  check:'m5 12 4 4L19 6',
  clock:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-10-6v6l4 2',
  alert:'m12 3 10 18H2L12 3Zm0 6v5m0 3v.1',
  external:'M15 3h6v6m0-6L10 14M9 3H3v18h18v-6',
  'arrow-up-right':'M7 17 17 7M7 7h10v10',
  'arrow-right':'M5 12h14m-6-6 6 6-6 6',
  leaf:'M20 4c-1 7 1 14-7 15a8 8 0 0 1-8-8C6 3 13 5 20 4ZM4 21l11-11',
  info:'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-10-1v6m0-10v.1',
  download:'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
  print:'M6 9V3h12v6M6 18H3v-8h18v8h-3M6 15h12v7H6v-7Zm12-3v.1',
  lock:'M6 10h12v11H6V10Zm2 0V6a4 4 0 0 1 8 0v4m-4 5v2',
  phone:'M7 3H3c0 10 8 18 18 18v-4l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5Z',
  refresh:'M3 10a9 9 0 0 1 15-6l3 3M21 2v5h-5m5 7a9 9 0 0 1-15 6l-3-3m0 5v-5h5',
  train:'M6 3h12v14H6V3Zm0 7h12M8 21l2-4m4 0 2 4M9 14v.1m6-.1v.1',
  food:'M4 3v6a3 3 0 0 0 6 0V3M7 3v18M20 3c-5 3-5 9 0 9V3Zm0 9v9',
  coffee:'M3 7h13v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V7Zm13 0h2a3 3 0 0 1 0 6h-2M6 2v2m5-2v2',
  sunrise:'M3 18h18M5 14a7 7 0 0 1 14 0M12 2v3M3 6l2 2m14 0 2-2M2 12h2m16 0h2M4 22h16',
  city:'M3 21V9h7v12M10 21V3h10v18M1 21h22M6 12v1m0 3v1m8-10h2m-2 4h2m-2 4h2',
  heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
};
const $ = (selector) => document.querySelector(selector);
const portableMode = document.documentElement.dataset.mode === 'portable';
const escape = (value) => String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.info}"/></svg>`;
const fillIcons = () => document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
const storageKey = 'tokyo-family-2027-v1';
let storageAvailable = true;
let saved = {};
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { storageAvailable = false; }
if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
const checked = new Set(Array.isArray(saved.checked) ? saved.checked.filter((item) => typeof item === 'string') : []);
const completed = new Set(Array.isArray(saved.completed) ? saved.completed.filter((item) => typeof item === 'string') : []);
let selectedDay = 0;
let activeView = 'schedule';
let filter = 'all';
let offlineReady = false;
let registration;
let toastTimer;
let focusDayAfterNavigation = null;

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4200);
}

function persist() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({checked:[...checked], completed:[...completed]}));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
    toast('이 브라우저에는 저장할 수 없어 현재 화면에서만 유지돼요.');
  }
  updateStorageNote();
}

function updateStorageNote() {
  if (!storageAvailable) $('#storage-note').textContent = '브라우저 저장을 사용할 수 없어요. 체크는 현재 화면에서만 유지됩니다.';
}

function japanNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone:'Asia/Tokyo', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'
  }).formatToParts(new Date()).filter((p) => p.type !== 'literal').map((p) => [p.type,p.value]));
  return {date:`${parts.year}-${parts.month}-${parts.day}`, time:`${parts.hour}:${parts.minute}`};
}

function updateCountdown() {
  const { date } = japanNow();
  const remaining = Math.round((Date.parse(`${trip.start}T00:00:00+09:00`) - Date.parse(`${date}T00:00:00+09:00`))/86400000);
  if (remaining > 0) {
    $('#countdown').textContent = `출발까지 D−${remaining}`;
    $('#countdown-label').textContent = '출발일 2027.01.04';
  } else if (date <= trip.end) {
    $('#countdown').textContent = `지금은 도쿄 여행 중`;
    $('#countdown-label').textContent = '2027.01.04–01.07';
  } else {
    $('#countdown').textContent = '여행 종료';
    $('#countdown-label').textContent = '2027.01.04–01.07';
  }
}

function mapUrl(query, origin) {
  if (origin) return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(query)}&travelmode=transit`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function renderTabs() {
  const themes = ['아사쿠사','시부야·팀랩','디즈니랜드','귀국'];
  $('#day-tabs').innerHTML = trip.days.map((day,i) => `<button class="day-tab" id="tab-${i+1}" role="tab" type="button" aria-controls="day-panel" aria-selected="${i === selectedDay}" tabindex="${i === selectedDay ? '0' : '-1'}" data-day="${i}"><span class="tab-day">DAY 0${i+1}</span><span class="tab-date">01.${day.date.slice(-2)}</span><span class="tab-weekday">${day.weekday}</span><span class="tab-theme">${themes[i]}</span></button>`).join('');
  $('#day-panel').setAttribute('aria-labelledby',`tab-${selectedDay+1}`);
}

function eventHtml(event, current) {
  const kindIcons = {move:'train', flight:'plane', stay:'bed', food:event.mode === '카페' ? 'coffee' : 'food', visit:'map-pin', rest:'leaf'};
  const done = completed.has(event.id);
  const links = [];
  if (event.query) links.push(`<a href="${escape(mapUrl(event.query,event.origin))}" target="_blank" rel="noopener noreferrer">${icon(event.origin ? 'arrow-up-right' : 'map-pin')}${event.origin ? '대중교통 길찾기' : '지도 보기'}${icon('external')}</a>`);
  if (event.extraMap) links.push(`<a href="${escape(mapUrl(event.extraMap.query))}" target="_blank" rel="noopener noreferrer">${icon('map-pin')}${escape(event.extraMap.label)}${icon('external')}</a>`);
  return `<li class="event ${event.kind === 'move' ? 'is-move' : ''} ${done ? 'completed' : ''} ${current ? 'is-current' : ''}" data-event-id="${event.id}">
    <div class="event-time"><time datetime="${trip.days[selectedDay].date}T${event.time}:00+09:00">${event.time}</time><span class="end-time">${event.end ? `– ${event.end}` : '이후'}</span></div><span class="event-dot" aria-hidden="true"></span>
    <article class="event-card"><div class="event-card-inner"><div class="event-topline"><span class="kind-icon">${icon(kindIcons[event.kind])}</span><h4 class="event-title">${escape(event.title)}</h4><button class="event-check" type="button" data-complete="${event.id}" aria-pressed="${done}" aria-label="${escape(event.title)} 완료 표시">${icon('check')}</button></div>
    ${event.place && event.place !== event.title ? `<p class="event-place">${escape(event.place)}</p>` : ''}${event.note ? `<p class="event-description">${escape(event.note)}</p>` : ''}
    <div class="event-tags"><span class="tag">${escape(event.mode)}</span>${event.booking ? `<span class="tag booking">${icon('calendar')}${escape(event.booking)}</span>` : ''}${event.caution ? `<span class="tag caution">${icon('alert')}재확인 필요</span>` : ''}${current ? '<span class="tag now">지금의 계획</span>' : ''}</div></div>
    ${links.length ? `<div class="event-actions">${links.join('')}</div>` : ''}</article></li>`;
}

function renderDay() {
  const day = trip.days[selectedDay];
  const now = japanNow();
  // An open-ended final activity continues to the end of that local day.
  const current = now.date === day.date ? day.events.slice().reverse().find((event) => event.time <= now.time && (!event.end || event.end > now.time)) : undefined;
  const visible = day.events.filter((event) => filter === 'all' || (filter === 'move' ? event.kind === 'move' : event.kind !== 'move'));
  $('#day-panel').innerHTML = `<div class="day-intro"><span class="day-illustration">${icon(day.icon)}</span><div><h3>${escape(day.title)}</h3><p>${escape(day.subtitle)}</p><span class="day-meta">${icon('map-pin')}${escape(day.area)}</span></div></div>
    <p class="plan-note">${icon('info')}계획 일정이에요. 예약·교통시간은 확인 전이며, 가족 컨디션에 맞춰 조절해요.</p>
    ${day.warning ? `<p class="plan-note day-warning">${icon('alert')}${escape(day.warning)}</p>` : ''}
    <div class="filters"><div class="filter-group" role="group" aria-label="일정 종류"><button class="filter" type="button" data-filter="all" aria-pressed="${filter==='all'}">전체 일정</button><button class="filter" type="button" data-filter="places" aria-pressed="${filter==='places'}">방문·휴식</button><button class="filter" type="button" data-filter="move" aria-pressed="${filter==='move'}">이동만</button></div><span class="event-count">${visible.length}개의 일정</span></div>
    <ol class="timeline">${visible.map((event) => eventHtml(event,event.id === current?.id)).join('')}</ol>
    ${selectedDay < 3 ? `<a class="next-day" href="#day-${selectedDay+2}"><div><small>NEXT JOURNEY · DAY 0${selectedDay+2}</small><strong>${escape(trip.days[selectedDay+1].title)}</strong></div>${icon('arrow-right')}</a>` : '<a class="next-day" href="#prepare"><div><small>BEFORE WE GO</small><strong>빠뜨린 준비는 없는지 확인해요</strong></div>'+icon('check-circle')+'</a>'}`;
}

function renderChecklist() {
  $('#checklist').innerHTML = checklist.map((group) => `<fieldset class="check-group"><legend>${escape(group.title)}</legend>${group.items.map(([id,label]) => `<label class="check-item"><input type="checkbox" data-check="${id}" ${checked.has(id) ? 'checked' : ''}><span>${escape(label)}</span></label>`).join('')}</fieldset>`).join('');
  updateProgress();
}

function updateProgress() {
  const ids = checklist.flatMap((group) => group.items.map(([id]) => id));
  const count = ids.filter((id) => checked.has(id)).length;
  $('#checklist-count').textContent = `${count} / ${ids.length}`;
  $('#checklist-progress').max = ids.length;
  $('#checklist-progress').value = count;
  $('#checklist-progress').textContent = `${Math.round(count/ids.length*100)}%`;
  $('#checklist-progress').setAttribute('aria-label',`${ids.length}개 중 ${count}개 준비 완료`);
  $('#side-check-count').textContent = `${ids.length}개 중 ${count}개 준비 완료`;
}

function route({ scroll = false } = {}) {
  const hash = location.hash;
  activeView = hash === '#prepare' ? 'prepare' : hash === '#info' ? 'info' : 'schedule';
  if (/^#day-[1-4]$/.test(hash)) selectedDay = Number(hash.slice(-1)) - 1;
  else if (!hash) {
    const today = trip.days.findIndex((day) => day.date === japanNow().date);
    selectedDay = today >= 0 ? today : 0;
  }
  for (const view of ['schedule','prepare','info']) $(`#${view}-view`).hidden = view !== activeView;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const active = link.dataset.nav === activeView;
    link.classList.toggle('active',active);
    if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
    if (link.dataset.nav === 'schedule') link.href = `#day-${selectedDay+1}`;
  });
  renderTabs();
  renderDay();
  if (focusDayAfterNavigation !== null && activeView === 'schedule') {
    $(`#tab-${focusDayAfterNavigation+1}`)?.focus({preventScroll:true});
    focusDayAfterNavigation = null;
  }
  if (scroll) {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = activeView === 'schedule' ? $('#day-tabs') : $(`#${activeView}-view`);
    const top = target.getBoundingClientRect().top + window.scrollY - (activeView === 'schedule' ? 8 : 24);
    window.scrollTo({top:Math.max(0,top),behavior:reduce ? 'instant' : 'smooth'});
  }
}

function renderPrint() {
  $('#print-itinerary').innerHTML = `<h1>${escape(trip.name)}</h1><p>2027.01.04–01.07 · 3박 4일 · 3인 가족 · 숙소: ${escape(trip.hotel)}<br>모든 시각은 한국·일본 현지 시각(UTC+9). 예약·교통시간은 미확정이며 가족 컨디션에 따라 조절합니다.<br>둘째 날 오다이바는 원본 제목에만 있으며 별도 방문 일정은 없습니다.</p>`+trip.days.map((day,i) => `<section class="print-day"><h2>DAY ${i+1} · ${day.date} (${day.weekday}) · ${escape(day.title)}</h2>${day.warning ? `<p class="print-warning">확인: ${escape(day.warning)}</p>` : ''}<table><thead><tr><th>시간</th><th>장소 · 활동</th><th>이동 · 메모</th></tr></thead><tbody>${day.events.map((e) => `<tr><td>${e.time}${e.end ? `–${e.end}` : ' 이후'}</td><td>${escape(e.title)}${e.place ? `<br><small>${escape(e.place)}</small>` : ''}</td><td>${escape(e.mode)}${e.note ? `<br><small>${escape(e.note)}</small>` : ''}${e.booking ? `<br><small>${escape(e.booking)}</small>` : ''}</td></tr>`).join('')}</tbody></table></section>`).join('');
}

function connectionStatus() {
  if (portableMode) {
    $('#connection-status').textContent = '파일에 전체 일정 포함';
    return;
  }
  const online = navigator.onLine;
  const text = online ? (offlineReady ? '오프라인 저장 완료' : '온라인 · 저장 준비 중') : (offlineReady ? '오프라인 · 저장된 일정' : '오프라인 · 저장 상태 확인 필요');
  $('#connection-status').innerHTML = `<span class="status-dot ${online ? '' : 'offline'}"></span>${text}`;
}

async function checkOfflineCache() {
  try {
    if (!('caches' in window)) return;
    const files = ['index.html','styles.css','theme.css','theme.js','app.js','itinerary.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','itinerary.txt'];
    const found = await Promise.all(files.map((file) => caches.match(new URL(file,location.href.split('#')[0]))));
    offlineReady = found.every(Boolean);
    if (offlineReady) $('#offline-details').textContent = '일정과 준비 목록을 이 기기에 저장했어요. 연결이 끊겨도 일정을 열 수 있어요. 출발 전에 비행기 모드에서 한 번 확인해 주세요.';
    connectionStatus();
  } catch { /* The online site still works when browser cache access is blocked. */ }
}

async function setupOffline() {
  if (portableMode) {
    $('#offline-details').textContent = '이 HTML 파일에 전체 일정과 화면이 포함되어 있어 인터넷 없이도 열 수 있어요. 지도·공식 사이트는 인터넷 연결이 필요합니다.';
    $('#refresh-button').hidden = true;
    connectionStatus();
    return;
  }
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    $('#offline-details').textContent = '현재 접속 환경에서는 오프라인 저장을 지원하지 않아요. HTTPS 주소의 일반 브라우저에서 열어 주세요.';
    $('#connection-status').textContent = navigator.onLine ? '온라인 · 오프라인 저장 미지원' : '오프라인';
    return;
  }
  try {
    registration = await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
    await checkOfflineCache();
  } catch {
    $('#offline-details').textContent = '오프라인 저장에 실패했어요. 온라인에서 업데이트 확인을 누르거나 브라우저 저장 공간을 확인해 주세요.';
    $('#connection-status').textContent = '온라인 · 오프라인 저장 실패';
  }
}

fillIcons();
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  $('#theme-toggle').setAttribute('aria-checked',String(dark));
  $('#theme-toggle').title = dark ? '라이트 모드로 전환' : '다크 모드로 전환';
  $('#theme-icon').innerHTML = icon(dark ? 'moon' : 'sun');
  $('#theme-label').textContent = dark ? '다크' : '라이트';
}
updateThemeButton();
$('#theme-toggle').addEventListener('click',() => window.tripTheme?.toggle());
window.addEventListener('tripthemechange',updateThemeButton);
updateCountdown();
renderChecklist();
renderPrint();
updateStorageNote();
$('#official-links').innerHTML = officialLinks.map(([label,url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${escape(label)}${icon('external')}</a>`).join('');
route();
connectionStatus();
setupOffline();

function selectDay(day) {
  const next = `#day-${day+1}`;
  if (location.hash === next) {
    $(`#tab-${day+1}`)?.focus({preventScroll:true});
  } else {
    focusDayAfterNavigation = day;
    location.hash = next;
  }
}

document.addEventListener('click', (event) => {
  const routeLink = event.target.closest('a[href^="#"]');
  if (routeLink && /^#(?:day-[1-4]|prepare|info)$/.test(routeLink.getAttribute('href'))) {
    // In srcdoc previews, native fragment links can resolve against the parent
    // page URL and replace the iframe. Change this document's fragment directly.
    event.preventDefault();
    location.hash = routeLink.getAttribute('href');
    return;
  }
  const tab = event.target.closest('[data-day]');
  if (tab) {
    const day = Number(tab.dataset.day);
    selectDay(day);
  }
  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) {
    filter = filterButton.dataset.filter;
    renderDay();
    $(`[data-filter="${filter}"]`).focus({preventScroll:true});
  }
  const completeButton = event.target.closest('[data-complete]');
  if (completeButton) {
    const id = completeButton.dataset.complete;
    if (completed.has(id)) completed.delete(id); else completed.add(id);
    completeButton.setAttribute('aria-pressed', String(completed.has(id)));
    completeButton.closest('.event').classList.toggle('completed',completed.has(id));
    persist();
  }
});

$('#day-tabs').addEventListener('keydown',(event) => {
  if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
  event.preventDefault();
  const day = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (selectedDay+(event.key === 'ArrowRight' ? 1 : 3))%4;
  selectDay(day);
});

$('#checklist').addEventListener('change', (event) => {
  const id = event.target.dataset.check;
  if (!id) return;
  if (event.target.checked) checked.add(id); else checked.delete(id);
  persist();
  updateProgress();
});

window.addEventListener('hashchange',() => route({scroll:true}));
window.addEventListener('online',connectionStatus);
window.addEventListener('offline',connectionStatus);
// Sandboxed previews can expose a serviceWorker property whose getter throws.
// Offline support must never prevent the remaining page controls from starting.
if (!portableMode) {
  try {
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data?.type === 'OFFLINE_READY') checkOfflineCache();
    });
  } catch { /* Embedded browsers may prohibit service workers. */ }
}

$('#share-button').addEventListener('click',async () => {
  if (portableMode) {
    toast('이 HTML 파일을 가족에게 전달하거나, 공개 배포 후 사이트 주소를 공유해 주세요.');
    return;
  }
  const url = location.href;
  if (['localhost','127.0.0.1','0.0.0.0'].includes(location.hostname) || location.protocol === 'file:') {
    toast('지금은 미리보기예요. 공개 배포 후 이 버튼으로 가족에게 주소를 공유해요.');
    return;
  }
  try {
    if (navigator.share) await navigator.share({title:trip.name,text:'우리 가족의 도쿄 여행 일정이에요.',url});
    else if (navigator.clipboard) { await navigator.clipboard.writeText(url); toast('주소를 복사했어요. 가족에게 보내 주세요.'); }
    else window.prompt('이 주소를 복사해 가족에게 공유해 주세요.',url);
  } catch (error) {
    if (error.name !== 'AbortError') window.prompt('이 주소를 복사해 가족에게 공유해 주세요.',url);
  }
});

$('#print-button').addEventListener('click',() => window.print());
$('#refresh-button').addEventListener('click',async (event) => {
  event.currentTarget.disabled = true;
  try {
    if (!navigator.onLine) { toast('온라인으로 연결한 뒤 업데이트를 확인해 주세요.'); return; }
    if (!registration) await setupOffline();
    if (!registration) { toast('이 브라우저에서는 오프라인 저장을 사용할 수 없어요.'); return; }
    await registration.update();
    await checkOfflineCache();
    toast(offlineReady ? '저장된 일정을 확인했어요. 새 버전은 다음에 열 때 적용돼요.' : '오프라인 저장 중이에요. 잠시 후 다시 확인해 주세요.');
  } catch { toast('업데이트를 확인하지 못했어요. 연결 상태를 확인해 주세요.'); }
  finally { $('#refresh-button').disabled = false; }
});

// Cross-tab checklist changes on the same device; no cloud synchronization.
window.addEventListener('storage',(event) => {
  if (event.key !== storageKey) return;
  try {
    const data = JSON.parse(event.newValue || '{}');
    checked.clear(); completed.clear();
    for (const id of Array.isArray(data.checked) ? data.checked : []) checked.add(id);
    for (const id of Array.isArray(data.completed) ? data.completed : []) completed.add(id);
    renderChecklist(); renderDay();
  } catch { /* Ignore damaged external storage data. */ }
});

// Clock labels update without rerendering focused controls.
setInterval(updateCountdown,60000);
