/* PGA Championship 2027 EventPulse — FuzeBox demo. Static, no backend. */
(() => {
const P = window.PGA, C = P.course, S = P.src;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icons = () => window.lucide && lucide.createIcons();
const ext = (u, l) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(l)}</a>`;
const TZ = 'America/Chicago';
const R = 6371000, rad = x => x * Math.PI / 180;
const dist = (a, b) => { const dl = rad(b.lat - a.lat), dg = rad(b.lng - a.lng); const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dg / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
const fmtDist = m => m < 1000 ? `${Math.round(m * 3.281 / 10) * 10} ft` : `${(m / 1609).toFixed(m < 16000 ? 1 : 0)} mi`;
const gmaps = (lat, lng, mode = 'walking') => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
const BASE = location.origin + location.pathname.replace(/index\.html$/, '');
const MEM = {}; // in-session state (no backend in this demo)
const store = {
  get(k, d) { return k in MEM ? JSON.parse(MEM[k]) : d; },
  set(k, v) { MEM[k] = JSON.stringify(v); }
};
let toastT; function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }
const now = () => new Date();
const START = new Date('2027-05-17T07:00:00-05:00');
const poiById = id => P.pois.find(p => p.id === id);
const COURSE_C = { lat: 33.2069, lng: -96.85 };
const holeGreen = n => { const l = C.holes[n - 1].line, g = l[l.length - 1]; return { lng: g[0], lat: g[1] }; };
const holeTee = n => { const g = C.holes[n - 1].line[0]; return { lng: g[0], lat: g[1] }; };
const CATS = { hosp: ['Hospitality', '#c9a43a'], view: ['Viewing spots', '#3e9b5f'], fan: ['PGA District & campus', '#5aa9e6'], stay: ['Resort', '#b48ce0'] };
const driveMin = m => Math.max(5, Math.round(m * 1.3 / 1000 / 55 * 60));

/* ---------- ticket products (official names) ---------- */
const TIX = {
  practice: { name: 'Practice Round Championship+ Grounds', days: ['mon', 'tue', 'wed'], hosp: null, note: 'Practice rounds, Mon–Wed. Cameras allowed these days.' },
  champ: { name: 'Championship+ Grounds', days: ['thu', 'fri', 'sat', 'sun'], hosp: null, note: 'Thu–Sun are sold out; verified resale is live on SeatGeek.' },
  deck8: { name: 'Championship+ With 8 Green Viewing', days: ['thu', 'fri', 'sat', 'sun'], hosp: 'deck8', note: 'Partially shaded, semi-private deck on the 8th green with inclusive beer and wine.' },
  wanamaker: { name: 'Wanamaker Club', days: ['thu', 'fri', 'sat', 'sun'], hosp: 'wanamaker', note: 'Climate-controlled hospitality with a viewing area on the 11th green.' },
  choctaw: { name: 'Choctaw Icehouse', days: ['thu', 'fri', 'sat', 'sun'], hosp: 'choctaw', note: 'All-inclusive ranch-style venue in the PGA District, viewing the 9th green.' },
};
const ARR = { omni: 'Staying at the Omni PGA Frisco — walk over', drive: 'Driving and parking', ride: 'Rideshare', shuttle: 'Hotel or group shuttle' };

/* ---------- personalization state ---------- */
const prefs = Object.assign({ tix: 'champ', prac: true, arrive: 'drive', kids: 0, military: false, first: true, mobility: false, fav: 8, eve: 'square' }, store.get('prefs', {}));
const savePrefs = () => store.set('prefs', prefs);
let going = new Set(store.get('days', ['wed', 'sat', 'sun']));
const saveDays = () => store.set('days', [...going]);
let checkins = store.get('checkins', []);
const dayById = id => P.days.find(d => d.id === id);
const isPractice = id => ['mon', 'tue', 'wed'].includes(id);
const ticketFor = id => isPractice(id) ? TIX.practice : TIX[prefs.tix === 'practice' ? 'champ' : prefs.tix];
const at = (day, hm) => { const [h, m] = hm.split(':'); return new Date(`${day.d}T${h.padStart(2, '0')}:${m}:00-05:00`); };
const fT = d => new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' }).format(d);

/* ---------- itinerary engine ---------- */
function planFor(id) {
  const d = dayById(id), T = ticketFor(id), prac = isPractice(id), L = [];
  const add = (hm, b, s, extra = {}) => L.push({ t: at(d, hm), b, s, ...extra });
  add('05:45', 'Ticket check', `Open the PGA Championships App or SeatGeek and confirm your <b>${esc(T.name)}</b> ticket for ${esc(d.label)}. The barcode refreshes every few seconds, so screenshots won’t scan. ${ext(S.faq, 'FAQ')}`);
  if (prefs.arrive === 'omni') add('06:45', 'Walk over from the Omni PGA Frisco', 'You’re on campus — no parking needed. Leave about 15 minutes for the walk to the entrance.', { poi: 'omni', mine: true });
  else {
    const how = { drive: 'Drive in via the Dallas North Tollway, Sam Rayburn Tollway (SH 121) or US-380.', ride: 'Book your rideshare.', shuttle: 'Board your hotel or group shuttle.' }[prefs.arrive];
    add('06:15', ARR[prefs.arrive], `${how} <span class="tag sim" style="margin-left:4px">Lot / drop-off TBA</span> The official parking and transportation plan hasn’t been published yet (${ext(S.faq, '“more information to be provided at a later date”')}). EventPulse will route you to the assigned lot and shuttle automatically once it’s released.`, { mine: true });
  }
  add('06:55', 'Bag check', `No backpacks, coolers or bags larger than 10"×10"×10". Chairs out of their bags. No drones, selfie sticks, signs or noisemakers. ${prac ? 'Cameras are allowed today (practice round).' : 'No cameras today — phones only.'} ${ext(S.terms, 'Terms')}`);
  add('07:00', 'Scan in at the Main Spectator Entrance', `Each ticket scans once — no same-day re-entry. ${prefs.kids ? `Pick up ${prefs.kids} free junior ticket${prefs.kids > 1 ? 's' : ''} at the Ticket Office first (15 and under, up to 2 per adult, day-of only).` : ''} ${prefs.military ? 'Military tickets claimed through GovX appear in your SeatGeek account that morning; arrive together on one phone.' : ''} <span class="tag sim">Gate time & location TBA</span>`, { qr: 'entrance', mine: true });
  if (prefs.first) add('07:20', 'First major? Get your bearings', 'Fields Ranch East is a Gil Hanse design: par 72, 7,863 yards. The PGA District (dining, retail, The Swing, The Dance Floor) sits beside the 9th green.', { poi: 'district' });
  if (prac) {
    add('07:30', 'Watch early practice at the 1st tee', 'Practice rounds are the most relaxed days to walk the course, take photos and see players up close.', { poi: 't1' });
    add('09:30', `Walk out to the ${prefs.fav}th green`, C.holes[prefs.fav - 1].note || `Par ${C.holes[prefs.fav - 1].par}, ${C.holes[prefs.fav - 1].yds} yards.`, { hole: prefs.fav, mine: true });
    add('12:00', 'Lunch on your Championship+ ticket', 'Championship+ includes 1 entrée, 1 snack and 1 non-alcoholic drink per concession visit, with unlimited visits.');
    add('13:30', 'The PGA Shops presented by Chase', 'Merchandise early in the week, before the championship-round crowds. Location on the official map (TBA).', { qr: 'shops' });
    add('15:00', 'Photos at the 17th green', 'The par 3 over wetlands to a bluff-top green — the signature photo spot. Cameras OK Mon–Wed.', { poi: 'g17' });
  } else {
    if (T.hosp) add('07:30', `Check in at ${poiById(T.hosp).name}`, esc(poiById(T.hosp).desc), { poi: T.hosp, qr: T.hosp, mine: true });
    add('08:00', 'Morning wave off the 1st tee', 'Opening par 4 (484 yards), an elevated tee shot over Panther Creek. Tee times are published by the PGA of America the day before each round.', { poi: 't1' });
    add('10:30', `Camp at the ${prefs.fav}th green`, (C.holes[prefs.fav - 1].note || `Par ${C.holes[prefs.fav - 1].par}, ${C.holes[prefs.fav - 1].yds} yards.`) + ' EventPulse alerts you when your featured group is two holes away.', { hole: prefs.fav, mine: true });
    add('12:30', T.hosp ? `Lunch back at ${poiById(T.hosp).name}` : 'Lunch on your Championship+ ticket', T.hosp ? 'Hospitality food and drink as included with your ticket.' : 'Entrée, snack and non-alcoholic drink per concession visit, unlimited visits.', T.hosp ? { poi: T.hosp } : {});
    add('14:30', 'The bluff-top 17th', '179-yard par 3 over a wetland, where the closing stretch turns.', { poi: 'g17', qr: 'g17' });
    add(id === 'sun' ? '16:30' : '16:00', id === 'sun' ? 'Final groups at the 18th green' : 'Late wave finishes at 18', '477-yard par-4 finishing hole beside the PGA District.' + (id === 'sun' ? ' Trophy ceremony follows the final putt.' : ''), { poi: 'g18', qr: 'g18', mine: id === 'sun' });
  }
  if (prefs.mobility) add('11:00', 'Rest stop', 'Accessibility plan: shaded seating and the shortest walking route between your spots. Official ADA details are TBA.', {});
  const e = P.frisco.find(f => f.id === prefs.eve) || P.frisco[3];
  const dm = driveMin(dist(COURSE_C, e));
  add(prac ? '18:00' : '19:00', `Evening: ${e.name}`, `${esc(e.kind)}${e.addr ? ' · ' + esc(e.addr) : ''}. About ${dm} min by car from PGA Frisco (estimate).`, { ll: [e.lat, e.lng], mine: true });
  return L.sort((a, b) => a.t - b.t);
}

/* ---------- router ---------- */
let mapObj = null, liveT = null, grpT = null;
function cleanup() { if (mapObj) { mapObj.remove(); mapObj = null; } clearInterval(grpT); document.body.classList.remove('fullmap'); }
function route() {
  const v = (location.hash.replace('#', '').split('?')[0]) || 'home';
  cleanup();
  $$('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
  const fn = { home: vHome, week: vWeek, course: vCourse, frisco: vFrisco, checkin: vCheckin, console: vConsole }[v] || vHome;
  fn(); icons(); window.scrollTo(0, 0);
}

/* ---------- HOME ---------- */
function vHome() {
  const firstDay = [...P.days].find(d => going.has(d.id)) || P.days[0];
  $('#view').innerHTML = `
  <section class="hero">
    <img class="bg" src="img/hero.jpg" alt="" aria-hidden="true">
    <span class="ai-badge">AI concept image</span>
    <div class="wrap">
      <span class="eyebrow">EventPulse · 2027 PGA Championship · Frisco, Texas</span>
      <h1>Every round.<br>Every fan.<br>One plan.</h1>
      <p class="lede">A personal companion for championship week at Fields Ranch East, PGA Frisco: a day-by-day itinerary built from your ticket, a live course map, QR check-in across the grounds, local Frisco context, and a two-way line between fans and the championship team.</p>
      <div class="row">
        <a class="btn" href="#week"><i data-lucide="calendar-check"></i>Build my week</a>
        <a class="btn ghost" href="#course"><i data-lucide="flag"></i>Explore the course</a>
        <a class="btn ghost" href="./dashboard/"><i data-lucide="chart-no-axes-combined"></i>Sponsor Dashboard</a>
        <a class="btn ghost" href="#checkin"><i data-lucide="qr-code"></i>Try QR check-in</a>
      </div>
    </div>
  </section>
  <div class="wrap">
    <div class="next">
      <div class="card">
        <span class="eyebrow">109th PGA Championship · May 17–23, 2027</span>
        <div class="match" style="margin-top:10px"><h3>Fields Ranch East at PGA Frisco</h3><span class="tag red">Practice Mon–Wed · Rounds Thu–Sun</span></div>
        <p class="mute" style="margin:8px 0 0">The first PGA Championship at PGA Frisco, 100 years after Walter Hagen won the 1927 PGA Championship in Dallas.</p>
        <div class="cd" id="cd" style="margin-top:14px"></div>
        <p class="src" style="margin-top:12px">Sources: ${ext('https://www.pgachampionship.com/2027', 'PGA Championship 2027')} · ${ext(S.pgafrisco, 'PGA Frisco')}</p>
      </div>
      <div class="card">
        <span class="eyebrow">Your first day · ${esc(firstDay.label)}</span>
        <ul class="tl" style="margin-top:6px">${planFor(firstDay.id).filter(x => x.mine).slice(0, 4).map(x => `<li class="mine"><time>${fT(x.t)}</time><div><b>${esc(x.b)}</b></div></li>`).join('')}</ul>
        <a class="btn sm" href="#week?d=${firstDay.id}" style="margin-top:8px">Open full itinerary</a>
      </div>
    </div>
    <section class="section">
      <span class="eyebrow">What it does</span>
      <h2 style="margin:8px 0 22px">Hyper-personal, in real time, both directions</h2>
      <div class="grid g4">
        ${[
          ['calendar-range', 'Personal week itinerary', 'All seven days. Each plan is built from your ticket type, hospitality venue, arrival, family and favorite holes — and updates as tee times and transport plans are published.'],
          ['navigation', 'Two-way Google Maps', 'Routes hand off to Google Maps and come back with arrival confirmed by QR, so the plan knows where you are and what’s next.'],
          ['ticket', 'Ticket-aware local context', 'Your ticket sets your days, hospitality and concessions; your hotel and evening picks set drive times across Frisco and DFW.'],
          ['qr-code', 'QR check-in on the grounds', 'Entrance, hospitality venues, key greens, The PGA Shops and the PGA District. Every scan is a verified first-party fan signal.'],
          ['flag', 'Live course companion', 'All 18 holes mapped. Follow a featured group and get told when to walk to your green before they arrive.'],
          ['message-square', 'Constant communication', 'Two-way messages all week — weather, tee-time changes, transport updates. Fans reply; staff act.'],
          ['gift', 'Gifts & member outreach', 'Check-ins unlock gifts and give the championship, partners and PGA Frisco a consented way to stay in touch after Sunday.'],
          ['activity', 'Real-time signal console', 'Who is where on a 660-acre campus, right now — for crowd flow, hospitality and partner activation.'],
        ].map(([i, h, p]) => `<div class="card feat"><div class="ic"><i data-lucide="${i}"></i></div><div><h3>${h}</h3><p>${p}</p></div></div>`).join('')}
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="grid g4">
        <div class="card stat"><b>200,000+</b><span>Fans expected over the week</span></div>
        <div class="card stat"><b>7,863</b><span>Yards · par 72 · Gil Hanse design</span></div>
        <div class="card stat"><b>660</b><span>Acre PGA Frisco campus</span></div>
        <div class="card stat"><b>${ckPoints().length}</b><span>QR check-in points in this demo</span></div>
      </div>
      <p class="src" style="margin-top:10px">Sources: ${ext(S.sbj, 'Sports Business Journal')} · ${ext(S.card, 'Fields Ranch East scorecard')} · ${ext(S.faqs, 'PGA Frisco FAQs')}</p>
    </section>
  </div>`;
  const cd = $('#cd');
  const tick = () => { if (!cd.isConnected) return clearInterval(t); let ms = Math.max(0, START - now()); const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60; cd.innerHTML = [[d, 'Days'], [h, 'Hrs'], [m, 'Min'], [s, 'Sec']].map(([n, l]) => `<div><b>${String(n).padStart(2, '0')}</b><small>${l}</small></div>`).join(''); };
  tick(); const t = setInterval(tick, 1000);
}

/* ---------- MY WEEK ---------- */
function vWeek() {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  let sel = q.get('d') || [...P.days].find(d => going.has(d.id))?.id || 'thu';
  $('#view').innerHTML = `<div class="wrap section">
    <div class="season-head"><div><span class="eyebrow">My Week · May 17–23, 2027</span><h2 style="margin-top:8px">Your championship, day by day</h2>
    <p class="mute" style="margin:8px 0 0;max-width:680px">Tap a day to see your itinerary. Mark the days you’re attending and export them to your calendar. Times are planning estimates until gates and tee times are published.</p></div></div>
    <div class="days" id="days"></div>
    <div class="plan" id="plan"></div>
    <p class="src" style="margin-top:16px">Tickets & policies: ${ext(S.tix, 'Ticket options')} · ${ext(S.faq, 'FAQ')} · ${ext(S.terms, 'Terms & prohibited items')}. Resale prices change constantly; check SeatGeek.</p>
  </div>`;
  const drawDays = () => {
    $('#days').innerHTML = P.days.map(d => `<button class="day ${d.id === sel ? 'sel' : ''}" data-id="${d.id}">${going.has(d.id) ? '<span class="saved-dot" title="Attending"></span>' : ''}<span class="k ${isPractice(d.id) ? 'p' : ''}">${esc(d.kind)}</span><b>${esc(d.label)}</b><small>${esc(d.status)}</small></button>`).join('');
    $$('#days .day').forEach(b => b.onclick = () => { sel = b.dataset.id; drawDays(); drawPlan(); });
  };
  const drawPlan = () => {
    const d = dayById(sel), L = planFor(sel), T = ticketFor(sel);
    $('#plan').innerHTML = `<div class="card">
      <div class="season-head" style="margin-bottom:6px"><div><span class="eyebrow">${esc(d.kind)} · ${esc(T.name)}</span><h2 style="margin-top:6px;font-size:34px">${esc(d.label)}</h2></div>
      <div class="filters"><button class="btn sm" id="goD"><i data-lucide="${going.has(sel) ? 'check' : 'plus'}"></i>${going.has(sel) ? 'Attending' : 'I’m attending'}</button><button class="btn sm ghost" id="ics"><i data-lucide="calendar-plus"></i>Calendar (.ics)</button></div></div>
      <ul class="tl">${L.map(x => `<li class="${x.mine ? 'mine' : ''}"><time>${fT(x.t)}<br><small class="dim" style="font:500 11px var(--f-b)">est.</small></time><div><b>${esc(x.b)} ${x.qr ? '<span class="tag red" style="margin-left:6px"><i data-lucide="qr-code" style="width:12px;height:12px"></i>QR</span>' : ''}</b><span>${x.s}</span>
        ${x.poi ? `<div style="margin-top:6px"><a class="btn sm ghost" href="#course?p=${x.poi}"><i data-lucide="map-pin"></i>Show on map</a> <a class="btn sm ghost" target="_blank" rel="noopener" href="${gmaps(poiById(x.poi).lat, poiById(x.poi).lng)}"><i data-lucide="navigation"></i>Google Maps</a></div>` : ''}
        ${x.hole ? `<div style="margin-top:6px"><a class="btn sm ghost" href="#course?h=${x.hole}"><i data-lucide="flag"></i>Hole ${x.hole} on map</a></div>` : ''}
        ${x.ll ? `<div style="margin-top:6px"><a class="btn sm ghost" target="_blank" rel="noopener" href="${gmaps(x.ll[0], x.ll[1], 'driving')}"><i data-lucide="navigation"></i>Google Maps</a></div>` : ''}
      </div></li>`).join('')}</ul></div>
      <div class="card prefs">
        <span class="eyebrow">Personalize · from your ticket</span>
        <p class="mute" style="font-size:13px;margin:6px 0 10px">In production these come from the SeatGeek ticket account. Change them and the plan rebuilds.</p>
        <label style="display:block">Championship-round ticket (Thu–Sun)<select id="pTix" style="margin-top:6px">${Object.entries(TIX).filter(([k]) => k !== 'practice').map(([k, t]) => `<option value="${k}">${esc(t.name)}</option>`).join('')}</select></label>
        <label style="display:block">How you arrive<select id="pArr" style="margin-top:6px">${Object.entries(ARR).map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></label>
        <label style="display:block">Evening plans<select id="pEve" style="margin-top:6px">${P.frisco.filter(f => f.kind !== 'Airport').map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join('')}</select></label>
        <label style="display:block">Juniors with you (15 and under, free)<select id="pKids" style="margin-top:6px"><option value="0">None</option><option value="1">1</option><option value="2">2 (max per adult)</option></select></label>
        <div style="padding:9px 0;border-bottom:1px solid var(--line);font-size:14px">Favorite hole to camp on<div class="holes" id="pFav">${C.holes.map(h => `<button class="${h.n === prefs.fav ? 'on' : ''}" data-h="${h.n}">${h.n}</button>`).join('')}</div></div>
        <label><input type="checkbox" id="pMil" ${prefs.military ? 'checked' : ''}>Military (free grounds access via GovX)</label>
        <label><input type="checkbox" id="pFirst" ${prefs.first ? 'checked' : ''}>My first major championship</label>
        <label><input type="checkbox" id="pMob" ${prefs.mobility ? 'checked' : ''}>Plan for limited walking</label>
        <div class="detail" style="margin-top:12px;font-size:13px"><b>${esc(T.name)}</b><br><span class="mute">${esc(T.note)}</span></div>
        <div class="tba" style="margin-top:10px"><b>Not yet published:</b> parking lots, shuttles, rideshare zone, gate times and the entrance location. ${ext(S.faq, 'Official FAQ')}</div>
      </div>`;
    $('#pTix').value = prefs.tix === 'practice' ? 'champ' : prefs.tix; $('#pArr').value = prefs.arrive; $('#pEve').value = prefs.eve; $('#pKids').value = String(prefs.kids);
    const upd = () => { prefs.tix = $('#pTix').value; prefs.arrive = $('#pArr').value; prefs.eve = $('#pEve').value; prefs.kids = +$('#pKids').value; prefs.military = $('#pMil').checked; prefs.first = $('#pFirst').checked; prefs.mobility = $('#pMob').checked; savePrefs(); drawPlan(); toast('Itinerary rebuilt'); };
    ['#pTix', '#pArr', '#pEve', '#pKids', '#pMil', '#pFirst', '#pMob'].forEach(s => $(s).onchange = upd);
    $$('#pFav button').forEach(b => b.onclick = () => { prefs.fav = +b.dataset.h; savePrefs(); drawPlan(); toast(`Favorite hole set to ${prefs.fav}`); });
    $('#goD').onclick = () => { going.has(sel) ? going.delete(sel) : going.add(sel); saveDays(); drawDays(); drawPlan(); };
    $('#ics').onclick = () => downloadICS(going.size ? P.days.filter(x => going.has(x.id)).map(x => x.id) : [sel]);
    icons();
  };
  drawDays(); drawPlan();
}
function downloadICS(ids) {
  const z = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ev = [];
  ids.forEach(id => planFor(id).filter(x => x.mine).forEach((x, i) => ev.push(['BEGIN:VEVENT', `UID:${id}-${i}-2027@eventpulse-pga`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(x.t)}`, `DTEND:${z(new Date(x.t.getTime() + 3600e3))}`, `SUMMARY:PGA Championship · ${x.b}`, 'LOCATION:Fields Ranch East at PGA Frisco\\, Frisco\\, TX', `DESCRIPTION:EventPulse itinerary (estimated time). ${BASE}#week?d=${id}`, 'END:VEVENT'].join('\r\n'))));
  const blob = new Blob([['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//FuzeBox//EventPulse PGA 2027//EN', ...ev, 'END:VCALENDAR'].join('\r\n')], { type: 'text/calendar' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'pga-championship-2027.ics'; document.body.appendChild(a); a.click(); a.remove();
  toast(`${ids.length} day${ids.length > 1 ? 's' : ''} exported to calendar`);
}

/* ---------- COURSE MAP ---------- */
function satStyle() { return { version: 8, sources: { sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 19, attribution: 'Imagery © Esri · Course data © OpenStreetMap contributors' } }, layers: [{ id: 'sat', type: 'raster', source: 'sat' }] }; }
function darkStyle() { return { version: 8, sources: { d: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, maxzoom: 16, attribution: 'Basemap © Esri, HERE, Garmin, © OpenStreetMap contributors' } }, layers: [{ id: 'd', type: 'raster', source: 'd' }] }; }
const qrSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/></svg>';
function vCourse() {
  document.body.classList.add('fullmap');
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  let selP = q.get('p'), selH = q.get('h') ? +q.get('h') : (selP ? null : prefs.fav);
  let you = { lat: 33.2129, lng: -96.8495, label: 'the Omni PGA Frisco (demo start)' };
  const mob = innerWidth < 700;
  $('#view').innerHTML = `<div class="map-shell">
    <div class="side">
      <div><span class="eyebrow">Fields Ranch East · PGA Frisco</span><h2 style="font-size:30px;margin-top:6px">Walk the course</h2></div>
      <div class="detail" id="det"></div>
      <div class="detail" id="grp"><span class="tag sim">Simulated live round</span><h3 style="margin-top:8px;font-size:20px">Follow a featured group</h3><p class="mute" style="margin:0;font-size:13px">A demo group moves around the course about 14 minutes per hole. EventPulse tells you when to walk to your hole so you arrive before they do.</p><div id="grpS" style="margin-top:8px;font-size:13px"></div><div class="acts"><button class="btn sm" id="grpGo"><i data-lucide="play"></i>Start demo round</button></div></div>
      <div><b style="font-size:14px">Holes</b><div class="holes" id="hl">${C.holes.map(h => `<button data-h="${h.n}">${h.n}</button>`).join('')}</div></div>
      <div class="ydt"><div class="ydt-h"><b style="font-size:14px">2027 yardage · hole by hole</b><span class="tag">Championship tees</span></div>
      <table class="ydtab"><thead><tr><th>Hole</th><th>Par</th><th>Yards</th><th>Daily</th><th>Notes</th></tr></thead><tbody>${(() => { const sum = a => a.reduce((t, h) => t + h.yds, 0), par = a => a.reduce((t, h) => t + h.par, 0), F = C.holes.slice(0, 9), B = C.holes.slice(9), hs = { 8: '8 Green deck', 9: 'Choctaw Icehouse', 11: 'Wanamaker Club', 17: 'Signature par 3', 18: 'Finishing hole', 1: 'Opening tee' }; const row = h => `<tr data-h="${h.n}"><td><b>${h.n}</b></td><td>${h.par}</td><td class="num">${h.yds}</td><td class="dim">${h.daily || ''}</td><td class="dim">${hs[h.n] || ''}</td></tr>`, tot = (l, a) => `<tr class="tot"><td>${l}</td><td>${par(a)}</td><td class="num">${sum(a).toLocaleString()}</td><td></td><td></td></tr>`; return F.map(row).join('') + tot('Out', F) + B.map(row).join('') + tot('In', B) + tot('Total', C.holes); })()}</tbody></table>
      <p class="src" style="margin-top:6px">"Daily" is the hole's everyday number before the 2027 nine swap. Tap a row to see the hole on the map.</p></div>
      <div id="list"></div>
      <p class="src">2027 championship routing: the front and back nines are swapped from daily play (${ext(S.swap, 'Dallas Morning News')}, ${ext(S.gca, 'Golf Club Atlas')}), so hole numbers here follow the championship order. Hole geometry and course boundary: ${ext(S.osm, 'OpenStreetMap')}. Yardages: ${ext(S.card, 'championship tees')} (championship-week setup may differ). Hospitality pins are placed from official venue descriptions and are approximate. The entrance, parking and shuttle locations aren’t published yet, so they’re not on the map.</p>
    </div>
    <div class="map-wrap"><div class="map-ctrl" id="cats">${Object.entries(CATS).map(([k, [l, c]]) => `<button class="chip on" data-c="${k}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c};margin-right:6px"></span>${l}</button>`).join('')}<button class="chip" id="me"><i data-lucide="locate" style="width:14px;height:14px"></i> Use my location</button></div><div id="mapEl"></div></div>
  </div>`;
  mapObj = new maplibregl.Map({ container: 'mapEl', style: satStyle(), bounds: C.poly.reduce((b, p) => b.extend(p), new maplibregl.LngLatBounds(C.poly[0], C.poly[0])), fitBoundsOptions: { padding: mob ? 20 : 50 }, pitch: 0, bearing: 0, attributionControl: { compact: true } });
  mapObj.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
  const markers = {};
  P.pois.forEach(p => {
    const el = document.createElement('div'); el.className = 'mk' + (p.qr ? ' qr' : ''); el.style.background = CATS[p.cat][1]; el.title = p.name; if (p.qr) el.innerHTML = qrSvg;
    el.onclick = e => { e.stopPropagation(); pickP(p.id); };
    markers[p.id] = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(mapObj);
  });
  C.holes.forEach(h => { const el = document.createElement('div'); el.className = 'hnum'; el.textContent = h.n; el.onclick = e => { e.stopPropagation(); pickH(h.n); }; new maplibregl.Marker({ element: el }).setLngLat(h.line[0]).addTo(mapObj); });
  const ye = document.createElement('div'); ye.className = 'mk you'; ye.title = 'You';
  markers.you = new maplibregl.Marker({ element: ye }).setLngLat([you.lng, you.lat]).addTo(mapObj);
  const ge = document.createElement('div'); ge.className = 'mk grp'; ge.title = 'Featured group (simulated)'; ge.style.display = 'none';
  const grpMk = new maplibregl.Marker({ element: ge }).setLngLat(C.holes[0].line[0]).addTo(mapObj);
  mapObj.on('load', () => {
    mapObj.addSource('course', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [C.poly] } } });
    mapObj.addLayer({ id: 'c-line', type: 'line', source: 'course', paint: { 'line-color': '#c9a43a', 'line-width': 2, 'line-opacity': .7, 'line-dasharray': [2, 1] } });
    mapObj.addSource('holes', { type: 'geojson', data: { type: 'FeatureCollection', features: C.holes.map(h => ({ type: 'Feature', properties: { n: h.n }, geometry: { type: 'LineString', coordinates: h.line } })) } });
    mapObj.addLayer({ id: 'h-line', type: 'line', source: 'holes', paint: { 'line-color': '#ffffff', 'line-width': 2.5, 'line-opacity': .85 } });
    mapObj.addLayer({ id: 'h-sel', type: 'line', source: 'holes', filter: ['==', ['get', 'n'], -1], paint: { 'line-color': '#e0bd55', 'line-width': 6 } });
    mapObj.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    mapObj.addLayer({ id: 'route', type: 'line', source: 'route', paint: { 'line-color': '#5aa9e6', 'line-width': 3, 'line-dasharray': [1, 1.5] } });
    selP ? pickP(selP, true) : pickH(selH, true);
  });
  const drawList = () => {
    $('#list').innerHTML = P.pois.filter(p => on.has(p.cat)).map(p => `<button class="poi ${p.id === selP ? 'sel' : ''}" data-id="${p.id}"><span class="dot" style="background:${CATS[p.cat][1]}"></span><div><b>${esc(p.name)}${p.qr ? ' · QR' : ''}</b><span>${fmtDist(dist(you, p))} from you${p.approx ? ' · approx.' : ''}</span></div></button>`).join('');
    $$('#list .poi').forEach(b => b.onclick = () => pickP(b.dataset.id));
    $$('#hl button').forEach(b => b.classList.toggle('on', +b.dataset.h === selH));
    $$('.ydtab tr[data-h]').forEach(r => r.classList.toggle('on', +r.dataset.h === selH));
  };
  const on = new Set(Object.keys(CATS));
  const routeTo = (p, quiet, z) => { if (mapObj && mapObj.getSource('route')) { mapObj.getSource('route').setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[you.lng, you.lat], [p.lng, p.lat]] } }); if (!quiet) mapObj.flyTo({ center: [p.lng, p.lat], zoom: z || 16.5, speed: .9 }); } };
  function pickH(n, quiet) {
    selH = n; selP = null; const h = C.holes[n - 1], g = holeGreen(n), m = dist(you, g);
    $('#det').innerHTML = `<span class="tag ok">Hole ${n}</span> <span class="tag">Par ${h.par} · ${h.yds} yds</span>${h.daily ? ` <span class="tag">Daily-play No. ${h.daily}</span>` : ''}<h3 style="margin-top:8px">The ${n}${['st', 'nd', 'rd'][n - 1] || 'th'} green</h3><p class="mute" style="margin:0;font-size:14px">${esc(h.note || 'Fields Ranch East, championship tees.')}</p>
      <p style="margin:8px 0 0;font-size:13px"><b>${fmtDist(m)}</b> from ${esc(you.label)} · about ${Math.max(1, Math.round(m * 1.35 / 75))} min walk</p>
      <div class="acts"><a class="btn sm" target="_blank" rel="noopener" href="${gmaps(g.lat, g.lng)}"><i data-lucide="navigation"></i>Go in Google Maps</a><button class="btn sm ghost" id="favH"><i data-lucide="star"></i>${prefs.fav === n ? 'Your favorite hole' : 'Make my hole'}</button></div>`;
    $('#favH').onclick = () => { prefs.fav = n; savePrefs(); pickH(n, true); toast(`Hole ${n} added to your itinerary`); };
    if (mapObj && mapObj.getLayer('h-sel')) { mapObj.setFilter('h-sel', ['==', ['get', 'n'], n]); routeTo(g, quiet, 16.3); }
    drawList(); icons(); grpStatus();
  }
  function pickP(id, quiet) {
    selP = id; selH = null; const p = poiById(id); if (!p) return;
    const m = dist(you, p);
    $('#det').innerHTML = `<span class="tag" style="color:${CATS[p.cat][1]}">${CATS[p.cat][0]}</span>${p.qr ? ' <span class="tag red">QR check-in</span>' : ''}${p.approx ? ' <span class="tag sim">Approx. pin</span>' : ''}
      <h3 style="margin-top:8px">${esc(p.name)}</h3><p class="mute" style="margin:0;font-size:14px">${esc(p.desc)}</p>
      <p style="margin:8px 0 0;font-size:13px"><b>${fmtDist(m)}</b> from ${esc(you.label)} · about ${Math.max(1, Math.round(m * 1.35 / 75))} min walk</p>
      <div class="acts"><a class="btn sm" target="_blank" rel="noopener" href="${gmaps(p.lat, p.lng)}"><i data-lucide="navigation"></i>Go in Google Maps</a>${p.qr ? `<a class="btn sm ghost" href="#checkin?at=${p.id}"><i data-lucide="qr-code"></i>Check in here</a>` : ''}</div>
      <p class="src" style="margin-top:8px">Two-way handoff: Google Maps takes you there; the QR on arrival confirms it and advances your itinerary. ${ext(p.src, 'Source')}</p>`;
    if (mapObj && mapObj.getLayer('h-sel')) mapObj.setFilter('h-sel', ['==', ['get', 'n'], -1]);
    routeTo(p, quiet); drawList(); icons(); grpStatus();
  }
  /* simulated featured group */
  let gPos = null; // fractional hole index 0..18
  function grpStatus() {
    const target = selH || prefs.fav;
    if (gPos === null) { $('#grpS').innerHTML = `<span class="mute">Target hole: <b style="color:var(--ink)">${target}</b>. Press start to simulate.</span>`; return; }
    const cur = Math.floor(gPos) + 1;
    const holesAway = target - cur, eta = Math.round((target - 1 - gPos + 0.85) * 14);
    const walk = Math.max(1, Math.round(dist(you, holeGreen(target)) * 1.35 / 75));
    let msg;
    if (cur > 18) msg = 'Featured group has finished the round.';
    else if (holesAway < 0) msg = `Group is past hole ${target}. Pick a hole ahead of them.`;
    else msg = `Group on <b>hole ${cur}</b> · reaches the ${target} green in ~${Math.max(0, eta)} min. Your walk: ~${walk} min. ${eta - walk <= 10 ? '<b style="color:var(--scarlet2)">Head over now.</b>' : `Leave in ~${eta - walk - 5} min.`}`;
    $('#grpS').innerHTML = msg;
  }
  const along = (line, f) => { const a = line[0], b = line[line.length - 1]; if (line.length < 3) return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; const seg = f * (line.length - 1), i = Math.min(line.length - 2, Math.floor(seg)), t = seg - i; return [line[i][0] + (line[i + 1][0] - line[i][0]) * t, line[i][1] + (line[i + 1][1] - line[i][1]) * t]; };
  $('#grpGo').onclick = () => {
    gPos = Math.max(0, (selH || prefs.fav) - 4); if (gPos < 0) gPos = 0; ge.style.display = '';
    clearInterval(grpT);
    grpT = setInterval(() => { if (!$('#grpS')) return clearInterval(grpT); gPos += 0.02; if (gPos >= 18) { gPos = 18; clearInterval(grpT); } const hi = Math.min(17, Math.floor(gPos)); grpMk.setLngLat(along(C.holes[hi].line, gPos - hi)); grpStatus(); }, 250);
    toast('Simulated featured group started 3 holes before your target');
  };
  $$('#hl button').forEach(b => b.onclick = () => pickH(+b.dataset.h));
  $$('.ydtab tr[data-h]').forEach(r => r.onclick = () => pickH(+r.dataset.h));
  $$('#cats .chip[data-c]').forEach(c => c.onclick = () => { const k = c.dataset.c; on.has(k) ? on.delete(k) : on.add(k); c.classList.toggle('on'); Object.entries(markers).forEach(([id, mk]) => { const p = poiById(id); if (p) mk.getElement().style.display = on.has(p.cat) ? '' : 'none'; }); drawList(); });
  $('#me').onclick = () => {
    if (!navigator.geolocation) return toast('Location not available in this browser');
    navigator.geolocation.getCurrentPosition(pos => { you = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'your location' }; markers.you.setLngLat([you.lng, you.lat]); selP ? pickP(selP) : pickH(selH); toast('Using your location'); }, () => toast('Location permission denied — starting from the Omni'));
  };
  drawList(); selP ? pickP(selP, true) : pickH(selH, true);
}

/* ---------- AROUND FRISCO ---------- */
function vFrisco() {
  document.body.classList.add('fullmap');
  const list = P.frisco.map(f => ({ ...f, m: dist(COURSE_C, f) })).sort((a, b) => a.m - b.m);
  const icon = k => ({ Airport: 'plane', Stadium: 'trophy', Ballpark: 'trophy', 'Evening golf': 'flag' }[k] || 'utensils');
  $('#view').innerHTML = `<div class="wp-shell">
    <div class="side">
      <div><span class="eyebrow">Local context · Frisco & DFW</span><h2 style="font-size:30px;margin-top:6px">Around Frisco</h2>
      <p class="mute" style="font-size:14px;margin:8px 0 0">The plan connects your ticket to the city: airports, evening plans and drive times from PGA Frisco, about 35–45 minutes north of downtown Dallas.</p></div>
      <div class="tba"><b>Getting there:</b> Dallas North Tollway, Sam Rayburn Tollway (SH 121) and US-380 serve PGA Frisco. Official championship parking, shuttles and rideshare zones are <b>TBA</b> — ${ext(S.faq, 'see the FAQ')}.</div>
      <div class="detail"><div class="place"><div class="ic"><i data-lucide="map"></i></div><div><b>PGA District</b><br><span class="mute" style="font-size:13px">On campus and open to the public: dining, retail, The Swing (lighted 10-hole short course) and The Dance Floor (2-acre putting course). ${ext(S.district, 'City of Frisco')}</span></div></div></div>
      <div id="fl" style="display:flex;flex-direction:column;gap:8px">${list.map(f => `<button class="wp" data-id="${f.id}"><div class="place"><div class="ic"><i data-lucide="${icon(f.kind)}"></i></div><div><b>${esc(f.name)}</b><div class="meta">${esc(f.kind)}${f.addr ? ' · ' + esc(f.addr) : ''}</div><div class="meta">${fmtDist(f.m)} · ~${driveMin(f.m)} min drive (est.)</div></div></div></button>`).join('')}</div>
      <p class="src">Drive times are straight-line estimates; Google Maps gives live traffic. Locations geocoded with Esri; map data © OpenStreetMap contributors.</p>
    </div>
    <div class="map-wrap"><div id="mapEl"></div></div>
  </div>`;
  mapObj = new maplibregl.Map({ container: 'mapEl', style: darkStyle(), center: [-96.9, 33.05], zoom: innerWidth < 700 ? 9 : 10, attributionControl: { compact: true } });
  mapObj.addControl(new maplibregl.NavigationControl(), 'bottom-right');
  const pga = document.createElement('div'); pga.className = 'mk qr'; pga.innerHTML = qrSvg; pga.title = 'PGA Frisco';
  new maplibregl.Marker({ element: pga }).setLngLat([COURSE_C.lng, COURSE_C.lat]).setPopup(new maplibregl.Popup({ offset: 14 }).setHTML('<b>PGA Frisco</b><br>Fields Ranch East')).addTo(mapObj);
  const mks = {};
  list.forEach(f => { const el = document.createElement('div'); el.className = 'mk'; el.style.background = f.kind === 'Airport' ? '#5aa9e6' : '#3e9b5f'; mks[f.id] = new maplibregl.Marker({ element: el }).setLngLat([f.lng, f.lat]).setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(`<b>${esc(f.name)}</b><br>~${driveMin(f.m)} min drive · <a href="${gmaps(f.lat, f.lng, 'driving')}" target="_blank" rel="noopener" style="color:#f0d27a">Google Maps</a>`)).addTo(mapObj); });
  $$('#fl .wp').forEach(b => b.onclick = () => { const f = list.find(x => x.id === b.dataset.id); $$('#fl .wp').forEach(x => x.classList.toggle('sel', x === b)); mapObj.flyTo({ center: [f.lng, f.lat], zoom: 12 }); mks[f.id].togglePopup(); if (f.kind !== 'Airport') { prefs.eve = f.id; savePrefs(); toast(`${f.name} set as your evening plan`); } });
}

/* ---------- CHECK-IN ---------- */
const ckPoints = () => [{ id: 'entrance', name: 'Main Spectator Entrance', where: 'Location TBA' }, ...P.pois.filter(p => p.qr).map(p => ({ id: p.id, name: p.name, where: 'PGA Frisco' })), { id: 'shops', name: 'The PGA Shops presented by Chase', where: 'PGA Frisco' }];
const ckById = id => ckPoints().find(x => x.id === id);
const giftFor = id => ({
  entrance: ['Centennial welcome', 'A digital keepsake marking 100 years since Walter Hagen’s 1927 PGA Championship win in Dallas.'],
  deck8: ['8 Green perk', 'Reserved rail spot for the next group through the 8th — show this to the host.'],
  wanamaker: ['Club welcome', 'Your personal tee-time sheet for today, sent to your phone.'],
  choctaw: ['Icehouse welcome', 'Front-of-line pass for the 9th-green viewing area.'],
  shops: ['Shop perk', 'Free shipping on today’s PGA Shops order so you don’t carry it around.'],
  district: ['District perk', 'Priority time on The Dance Floor putting course (subject to availability).'],
  omni: ['Resort perk', 'Late checkout request flagged for Sunday’s final round.'],
}[id] || ['Green-side check-in', 'You’re on the hole-by-hole fan map — and entered in today’s sample giveaway.']);
function doCheckin(id, real) {
  const p = ckById(id); if (!p) return null;
  const rec = { id, name: p.name, where: p.where, t: Date.now(), real: !!real };
  checkins.unshift(rec); checkins = checkins.slice(0, 30); store.set('checkins', checkins);
  return rec;
}
function vCheckin() {
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  let atId = q.get('at') || 'entrance';
  const scanned = q.get('scanned');
  $('#view').innerHTML = `<div class="wrap section">
    <span class="eyebrow">QR check-in</span><h2 style="margin:8px 0 6px">Scan in. Get recognized. Stay connected.</h2>
    <p class="mute" style="max-width:720px;margin:0 0 22px">The entrance, each hospitality venue, key greens, The PGA Shops and the PGA District carry an EventPulse QR. Point a phone camera at the code below — it opens this site and checks you in for real. Or press “Simulate scan.” This is separate from the SeatGeek admission ticket.</p>
    <div class="ck">
      <div class="card">
        <label style="display:block;font-size:14px;font-weight:600">Check-in point<select id="ckSel" style="margin-top:6px">${ckPoints().map(p => `<option value="${p.id}">${esc(p.name)} — ${esc(p.where)}</option>`).join('')}</select></label>
        <div class="qrbox" id="qr" style="margin-top:16px"></div>
        <p class="src" style="text-align:center;margin-top:8px;word-break:break-all" id="qrUrl"></p>
        <div style="display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap"><button class="btn" id="sim"><i data-lucide="scan-line"></i>Simulate scan</button><a class="btn ghost" href="#console"><i data-lucide="activity"></i>See it in the console</a></div>
        <ol class="flow" id="flow" style="margin-top:18px">
          <li>Scan confirms the location and the fan</li>
          <li>Itinerary advances to the next step</li>
          <li>Gift unlocks on the fan’s phone</li>
          <li>Championship and partner teams see it live</li>
          <li>Two-way thread opens for follow-up</li>
        </ol>
        <img src="img/qr.jpg" alt="AI concept image of a fan scanning an EventPulse QR kiosk at a golf championship" style="border-radius:12px;margin-top:16px;width:100%;aspect-ratio:16/9;object-fit:cover"><p class="src" style="margin-top:4px">AI concept image.</p>
      </div>
      <div class="phone" id="phone"><div class="notch"></div><div id="pscreen"><p class="mute" style="text-align:center;margin-top:120px">Waiting for scan…</p></div></div>
    </div>
  </div>`;
  const drawQR = () => { const url = `${BASE}?checkin=${atId}`; const qr = qrcode(0, 'M'); qr.addData(url); qr.make(); $('#qr').innerHTML = qr.createSvgTag({ cellSize: 6, margin: 2, scalable: true }); $('#qrUrl').textContent = url; };
  const show = rec => {
    const p = ckById(rec.id), [gt, gd] = giftFor(rec.id);
    const hospIds = ['deck8', 'wanamaker', 'choctaw', 'g17', 'g18'], dId = [...P.days].find(d => going.has(d.id) && (!hospIds.includes(rec.id) || !isPractice(d.id)))?.id || 'sat', L = planFor(dId), idx = L.findIndex(x => x.qr === rec.id || x.poi === rec.id), nx = L[idx >= 0 ? Math.min(idx + 1, L.length - 1) : 3];
    $('#pscreen').innerHTML = `<div class="ok-badge"><i data-lucide="check"></i></div>
      <h3 style="text-align:center;text-transform:uppercase">Checked in</h3>
      <p style="text-align:center;margin:0;font-size:14px"><b>${esc(p.name)}</b><br><span class="mute">${esc(p.where)} · ${new Date(rec.t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span></p>
      <div class="gift"><small style="letter-spacing:.12em;text-transform:uppercase;font-size:11px;opacity:.85">Gift unlocked · sample</small><b>${gt}</b><span style="font-size:13px">${gd}</span></div>
      <div class="detail" style="padding:10px"><small class="dim" style="text-transform:uppercase;letter-spacing:.1em;font-size:10px">Next on your itinerary</small><br><b style="font-size:14px">${esc(nx.b)}</b><br><span class="mute" style="font-size:12px">${esc(dayById(dId).label)} · ${fT(nx.t)} CT (est.)</span></div>
      <div class="detail" style="padding:10px;font-size:13px"><i data-lucide="message-circle" style="width:14px;height:14px;vertical-align:-2px"></i> <b>Championship team:</b> “Welcome to PGA Frisco. Want a text when the featured group reaches the ${prefs.fav}th?”<div style="display:flex;gap:6px;margin-top:8px"><button class="btn sm" data-r="Yes — text me">Yes</button><button class="btn sm ghost" data-r="Not this time">Not now</button></div></div>`;
    $$('#pscreen [data-r]').forEach(b => b.onclick = () => { const r = b.dataset.r; const out = store.get('replies', []); out.unshift({ t: Date.now(), r, at: p.name }); store.set('replies', out.slice(0, 20)); b.parentElement.innerHTML = `<div class="reply">You replied: “${esc(r)}” — sent to the championship team</div>`; toast('Reply sent — visible in the console'); });
    $$('#flow li').forEach((li, i) => setTimeout(() => li.classList.add('done'), 250 * (i + 1)));
    icons();
  };
  $('#ckSel').value = atId; $('#ckSel').onchange = e => { atId = e.target.value; drawQR(); $$('#flow li').forEach(li => li.classList.remove('done')); $('#pscreen').innerHTML = '<p class="mute" style="text-align:center;margin-top:120px">Waiting for scan…</p>'; };
  $('#sim').onclick = () => { const r = doCheckin(atId, false); show(r); toast('Check-in recorded'); };
  drawQR();
  if (scanned) { const r = checkins.find(c => c.id === scanned) || doCheckin(scanned, true); if (r) { $('#ckSel').value = scanned; atId = scanned; drawQR(); show(r); } }
}

/* ---------- CONSOLE ---------- */
function vConsole() {
  const locs = [['Main Spectator Entrance', .27], ['PGA District', .14], ['18 green', .12], ['17 green', .09], ['8 Green viewing deck', .07], ['The PGA Shops', .1], ['Choctaw Icehouse · 9 green', .07], ['Wanamaker Club · 11 green', .06], ['Omni PGA Frisco', .04], ['1st tee', .04]];
  const counts = Object.fromEntries(locs.map(([l, w]) => [l, Math.round(w * 31800)]));
  let total = Object.values(counts).reduce((a, b) => a + b, 0), gifts = Math.round(total * 0.58), replies = Math.round(total * 0.31);
  const names = ['Alex M.', 'Priya S.', 'Jordan K.', 'Sam R.', 'Taylor D.', 'Chris P.', 'Morgan L.', 'Jamie V.', 'Dana W.', 'Riley T.', 'Casey N.', 'Avery B.'];
  const outreach = [
    { seg: 'Families with juniors · 2,140 fans', who: 'Championship · Fan Experience', msg: 'Thanks for bringing the next generation out. Here’s how juniors can try The Swing and The Dance Floor at the PGA District this summer.', ch: 'Push + email' },
    { seg: 'Military guests · 1,320 fans', who: 'Championship · Military program', msg: 'Thank you for your service. Your guest is welcome at the 18th-green salute this afternoon.', ch: 'In-app thread' },
    { seg: 'First major · 6,900 fans', who: 'PGA of America · Membership', msg: 'Your first major! Want to find a PGA Coach near home? Reply with your ZIP code.', ch: 'SMS' },
    { seg: 'Hospitality guests · 3 venues', who: 'Partner hospitality', msg: 'Thanks for joining us this week. Your host will follow up on future championship hospitality.', ch: 'Email' },
  ];
  $('#view').innerHTML = `<div class="wrap section">
    <div class="season-head"><div><span class="eyebrow">Championship & Partner Console</span><h2 style="margin-top:8px">Live fan signal · Saturday, Round 3</h2></div><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="tag sim"><i data-lucide="flask-conical" style="width:12px;height:12px"></i>Simulated stream + your real check-ins</span><a class="btn" href="./dashboard/"><i data-lucide="chart-no-axes-combined"></i>Open Sponsor Dashboard</a></div></div>
    <div class="kpis">
      <div class="kpi"><span>Verified check-ins</span><b id="kT">${total.toLocaleString()}</b><em>live · sample</em></div>
      <div class="kpi"><span>Locations reporting</span><b>${locs.length}</b><em>across the campus</em></div>
      <div class="kpi"><span>Gifts unlocked</span><b id="kG">${gifts.toLocaleString()}</b><em>58% of check-ins</em></div>
      <div class="kpi"><span>Two-way replies</span><b id="kR">${replies.toLocaleString()}</b><em>31% reply rate</em></div>
    </div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h3>Check-in stream</h3><p class="mute" style="font-size:13px;margin:4px 0 8px">Green rows are check-ins made in this session.</p><ul class="stream" id="stream"></ul></div>
      <div class="card"><h3>Where fans are right now</h3><div class="bars" id="bars" style="margin-top:10px"></div></div>
    </div>
    <div class="grid g2" style="margin-top:16px">
      <div class="card"><h3>Direct outreach queue</h3><p class="mute" style="font-size:13px;margin:4px 0 12px">Segments built from check-ins. Staff approve before anything is sent.</p><div id="outq"></div></div>
      <div class="card"><h3>Fan replies</h3><p class="mute" style="font-size:13px;margin:4px 0 12px">Two-way: replies come back here and route to the right team.</p><div id="replies"></div></div>
    </div>
  </div>`;
  const stream = $('#stream');
  const add = (who, where, real, t = Date.now()) => { const li = document.createElement('li'); if (real) li.className = 'real'; li.innerHTML = `<time>${new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</time><span><b>${esc(who)}</b> · ${esc(where)}</span><span class="tag ${real ? 'ok' : ''}">${real ? 'You' : 'QR'}</span>`; stream.prepend(li); while (stream.children.length > 40) stream.lastChild.remove(); };
  for (let i = 0; i < 10; i++) add(names[i % names.length], locs[Math.floor(Math.random() * locs.length)][0], false, Date.now() - (10 - i) * 7000);
  checkins.slice(0, 8).reverse().forEach(c => add('You', c.name, true, c.t));
  const drawBars = () => { const mx = Math.max(...Object.values(counts)); $('#bars').innerHTML = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([l, n]) => `<div class="b"><span title="${esc(l)}" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(l)}</span><div class="t"><i style="width:${(n / mx * 100).toFixed(1)}%"></i></div><span style="text-align:right;font-variant-numeric:tabular-nums">${n.toLocaleString()}</span></div>`).join(''); };
  drawBars();
  $('#outq').innerHTML = outreach.map((o, i) => `<div class="msg"><div class="h"><span><b style="color:var(--ink)">${esc(o.seg)}</b></span><span>${esc(o.who)} · ${esc(o.ch)}</span></div><p>“${esc(o.msg)}”</p><div class="acts"><button class="btn sm" data-o="${i}"><i data-lucide="send"></i>Approve & send</button><button class="btn sm ghost">Edit</button></div></div>`).join('');
  $$('#outq [data-o]').forEach(b => b.onclick = () => { b.outerHTML = '<span class="tag ok">Sent (demo) · delivery tracked</span>'; toast('Outreach approved (demo — nothing is actually sent)'); });
  const reps = [...store.get('replies', []).map(r => ({ who: 'You', r: r.r, at: r.at, real: true })), { who: 'Jordan K.', r: 'Yes — text me when the featured group gets to 17.', at: '17 green' }, { who: 'Priya S.', r: 'First major ever. Are there junior clinics at PGA Frisco this summer?', at: 'PGA District' }, { who: 'Casey N.', r: 'Where’s the closest shade near the 8th?', at: '8 Green viewing deck' }];
  $('#replies').innerHTML = reps.map(r => `<div class="msg"><div class="h"><span><b style="color:var(--ink)">${esc(r.who)}</b> · checked in at ${esc(r.at)}</span>${r.real ? '<span class="tag ok">Real reply from this browser</span>' : '<span class="tag sim">Sample</span>'}</div><p>“${esc(r.r)}”</p><div class="acts"><button class="btn sm ghost">Route to ${/junior|clinic|coach/i.test(r.r) ? 'PGA Frisco' : 'Fan Experience'}</button></div></div>`).join('');
  clearInterval(liveT);
  liveT = setInterval(() => {
    if (!$('#stream')) return clearInterval(liveT);
    const r = Math.random(); let acc = 0, pick = locs[0][0]; for (const [l, w] of locs) { acc += w; if (r < acc) { pick = l; break; } }
    counts[pick]++; total++; if (Math.random() < .58) gifts++; if (Math.random() < .31) replies++;
    add(names[Math.floor(Math.random() * names.length)], pick, false);
    $('#kT').textContent = total.toLocaleString(); $('#kG').textContent = gifts.toLocaleString(); $('#kR').textContent = replies.toLocaleString(); drawBars();
  }, 1800);
}

/* ---------- CONCIERGE ---------- */
const KB = [
  [/camera|photo|picture/i, () => `Cameras are allowed Monday–Wednesday (practice rounds) only. Thursday–Sunday it’s phones only.`, ['deck8']],
  [/park|lot|shuttle|uber|lyft|rideshare|drive|get there/i, () => `The official parking and transportation plan isn’t published yet — the FAQ says “more information to be provided at a later date.” Main routes are the Dallas North Tollway, Sam Rayburn Tollway (SH 121) and US-380. I’ll update your plan the moment lots and shuttles are announced. ${ext(S.faq, 'FAQ')}`, []],
  [/bag|backpack|cooler|chair|bring|prohibit|selfie|drone/i, () => `No backpacks or coolers, and no bags larger than 10"×10"×10". Chairs are fine but must come out of their bags. No drones, signs, selfie sticks or noisemakers. ${ext(S.terms, 'Terms')}`, []],
  [/kid|junior|child|son|daughter|infant|baby/i, () => `Juniors 15 and under get in free with a ticketed adult — up to 2 per adult per day, picked up day-of at the Ticket Office at the Main Spectator Entrance. Under 2 needs no ticket. Hospitality venues need a hospitality ticket at any age.`, []],
  [/military|veteran|service|govx/i, () => `Active duty, retirees, reserve, veterans and National Guard plus one guest get free daily grounds access through GovX (military ID required). Registration opens in spring 2027; tickets appear in SeatGeek the morning of. You must arrive together on one phone.`, []],
  [/re-?entry|leave and come back|come and go/i, () => `No same-day re-entry. Once your ticket scans, it’s used for the day.`, []],
  [/ticket|resale|price|seatgeek|sold/i, () => `Practice rounds (Mon–Wed) are on sale. Thursday–Sunday are sold out, with verified resale on SeatGeek, the official ticketing provider. Tickets are digital only in the PGA Championships App or SeatGeek, visible from mid-April. ${ext(S.tix, 'Ticket options')}`, []],
  [/food|eat|drink|lunch|concession|beer/i, () => `Championship+ tickets include 1 entrée, 1 snack and 1 non-alcoholic drink per concession visit, with unlimited visits. Hospitality tickets include their own food and drink.`, []],
  [/hospitality|wanamaker|choctaw|icehouse|deck|8 green/i, () => `Three ways to upgrade Thu–Sun: Championship+ With 8 Green Viewing (shaded deck, beer and wine), the Wanamaker Club (11th green) and Choctaw Icehouse (all-inclusive, 9th green, in the PGA District).`, ['deck8', 'wanamaker', 'choctaw']],
  [/hole|course|yard|par|signature|8th|17|18/i, () => `Fields Ranch East is a Gil Hanse design, par 72 at 7,863 yards. For 2027 the front and back nines are swapped from daily play. Don’t miss the 17th — a par 3 over wetlands to a bluff-top green — and the 141-yard 8th. The par-4 18th finishes beside the PGA District.`, ['deck8', 'g17', 'g18']],
  [/hotel|stay|omni|resort/i, () => `The Omni PGA Frisco Resort is on campus (500 rooms) — you can walk to the course. Elsewhere, I’ll plan drive times from your hotel.`, ['omni']],
  [/airport|fly|dfw|love field/i, () => `DFW International is about ${driveMin(dist(COURSE_C, P.frisco[0]))} min and Dallas Love Field about ${driveMin(dist(COURSE_C, P.frisco[1]))} min by car (estimates; traffic varies).`, []],
  [/dinner|evening|night|restaurant|frisco|star|topgolf/i, () => `Good evening picks: Frisco Square downtown, The Star in Frisco, or Topgolf The Colony. On campus, the PGA District has dining plus The Swing and The Dance Floor. <a href="#frisco">Open Around Frisco</a>.`, ['district']],
  [/when|date|schedule|round|practice/i, () => `May 17–23, 2027. Practice rounds Mon–Wed (May 17–19); championship rounds Thu–Sun (May 20–23). Gate and tee times are published closer to the week.`, []],
  [/hagen|history|1927|centennial/i, () => `This is the 109th PGA Championship and the first at PGA Frisco — 100 years after Walter Hagen won the 1927 PGA Championship at Cedar Crest in Dallas. I’m named for him.`, []],
];
function cAsk(text) {
  const log = $('#cLog'); log.insertAdjacentHTML('beforeend', `<div class="bub me">${esc(text)}</div>`);
  const hit = KB.find(([re]) => re.test(text));
  const ans = hit ? hit[1]() : `I can help with tickets, bags, cameras, kids, military access, food, hospitality, the course, hotels, airports and evening plans. Try a chip below.`;
  const pois = hit ? hit[2] : [];
  setTimeout(() => { log.insertAdjacentHTML('beforeend', `<div class="bub bot">${ans}${pois.length ? `<div style="margin-top:6px">${pois.map(id => `<a href="#course?p=${id}">${esc(poiById(id).name)}</a>`).join(' · ')}</div>` : ''}<div class="trace">intent:${hit ? hit[0].source.split('|')[0].replace(/\W/g, '') : 'fallback'} · profile:${esc(prefs.tix)} · source: official championship pages</div></div>`); log.scrollTop = log.scrollHeight; }, 250);
}
function initConcierge() {
  const box = $('#concierge');
  $('#openConcierge').onclick = () => { box.hidden = !box.hidden; if (!box.hidden && !$('#cLog').children.length) $('#cLog').innerHTML = `<div class="bub bot">Hi, I’m Walter — named for Walter Hagen, who won the 1927 PGA Championship in Dallas. I know your ticket, your days and your favorite hole. What do you need?</div>`; $('#cInput').focus(); };
  $('#closeConcierge').onclick = () => box.hidden = true;
  $('#cChips').innerHTML = ['Where do I park?', 'Bag policy', 'Can I bring a camera?', 'Kids tickets', 'Military access', 'Best holes to watch'].map(c => `<button>${c}</button>`).join('');
  $$('#cChips button').forEach(b => b.onclick = () => cAsk(b.textContent));
  $('#cForm').onsubmit = e => { e.preventDefault(); const v = $('#cInput').value.trim(); if (v) { cAsk(v); $('#cInput').value = ''; } };
}

/* ---------- boot ---------- */
initConcierge();
const qs = new URLSearchParams(location.search);
if (qs.get('checkin') && ckById(qs.get('checkin'))) {
  const id = qs.get('checkin'); doCheckin(id, true);
  history.replaceState(null, '', location.pathname + `#checkin?at=${id}&scanned=${id}`);
}
window.addEventListener('hashchange', route);
route();
})();
