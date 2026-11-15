(() => {
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const P = window.PGA || { src: {}, pois: [] }, D = window.D || { sponsors: [] };
const SRC = P.src || {};
const pick = a => a[Math.floor(Math.random() * a.length)];
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const SP = D.sponsors.length ? D.sponsors.map(s => s.n) : ['T-Mobile', 'Corebridge Financial', 'Rolex'];
const HOLE = () => ri(1, 18);
const HOSP = ['Wanamaker Club', 'Choctaw Icehouse', '8 Green viewing deck'];

const TEAMS = [['all', 'All'], ['fan', 'Fan Experience'], ['rev', 'Revenue'], ['spon', 'Sponsors'], ['ops', 'Operations']];
const AG = [
  { id: 'walter', n: 'Walter', r: 'Championship Concierge', t: 'fan', a: '#3A8DDE', b: '#3FB67A', e: 'p',
    m: 'Answers any fan question in seconds and builds a personal plan for the day.',
    w: ['2027 course routing and pin locations', 'Gate, shuttle and parking times', 'PGA Frisco and championship FAQs'],
    d: ['Answers in chat and text', 'Builds and updates My Week plans', 'Hands off to a human guest host'],
    g: 'Never sells, refunds or transfers tickets.', src: [['Championship FAQ', SRC.faq], ['PGA Frisco FAQs', SRC.faqs]], k: ['questions', 1],
    L: [() => `Answered "where do I watch the drive on ${HOLE()}?" with a walking route · 38 s`, () => `Rebuilt a My Week plan for a family of 4 around the Sunday tee times`, () => `Sent shuttle reminder to ${ri(80, 420)} fans leaving the PGA District`, () => `Handed a lost-ticket case to a guest host · ticket #${ri(1000, 9999)}`] },
  { id: 'path', n: 'Pathfinder', r: 'Crowd Flow & Wayfinding', t: 'fan', a: '#4FD1E8', b: '#5B7FE0', e: 'r',
    m: 'Reads crowd density by hole and quietly routes fans around the bottlenecks.',
    w: ['Gate scans and on-course density', 'Featured groups and leaderboard', 'Course map and crossing points'],
    d: ['Suggests quieter routes in the guide', 'Flags crossings to marshals', 'Moves wayfinding signage copy'],
    g: 'Asks before closing a crossing or rerouting a gallery.', src: [['Course yardage card', SRC.card]], k: ['reroutes', 1],
    L: [() => `Hole ${HOLE()} gallery at 86% · routed ${ri(200, 900)} fans to the ${pick(['8 green deck', '17 green', 'back of 12'])}`, () => `Featured group reached hole ${HOLE()} · pre-positioned 4 marshals`, () => `Restroom wait near hole ${HOLE()} up to ${ri(6, 12)} min · pointed fans to the next bank`],
    A: () => [`Close the hole ${ri(13, 16)} crossing for 10 minutes`, `Crowd density ${(3 + Math.random()).toFixed(1)} people/m² as the leaders arrive`] },
  { id: 'shuttle', n: 'Shuttle', r: 'Transport & Parking', t: 'fan', a: '#22C08A', b: '#4FD1E8', e: 'w',
    m: 'Balances lots, shuttles and rideshare so nobody waits long getting in or out.',
    w: ['Lot fill and shuttle GPS', 'DFW and Love Field arrivals', 'Weather and suspension alerts'],
    d: ['Rebalances shuttle loops', 'Sends leave-now nudges', 'Opens overflow lot messaging'],
    g: 'Asks before opening overflow lots or adding paid buses.', src: [['Championship FAQ', SRC.faq]], k: ['trips', 1],
    L: [() => `Lot ${pick(['A', 'B', 'C', 'D'])} at ${ri(78, 96)}% · moved 2 buses to the Omni loop`, () => `Exit wave forecast in 25 min · sent leave-now nudge to ${ri(600, 2400).toLocaleString()} fans`, () => `Rideshare pickup queue at ${ri(4, 11)} min · steady`],
    A: () => [`Add 3 buses to the PGA Pkwy loop · $${ri(9, 14) * 100}`, `Projected exit wait ${ri(28, 40)} min after the final putt`] },

  { id: 'margin', n: 'Margin', r: 'Concessions Forecaster', t: 'rev', a: '#3FB67A', b: '#F5B83D', e: 'r',
    m: 'Forecasts demand stand by stand and moves stock and staff before lines form.',
    w: ['Point-of-sale by stand, by minute', 'Weather and gallery position', 'Inventory and prep times'],
    d: ['Reorders and transfers stock', 'Shifts staff between stands', 'Prices bundles inside set limits'],
    g: 'Price changes stay inside a band the operator sets.', src: [], k: ['orders', 1],
    L: [() => `Heat index ${ri(92, 99)}°F · raised water and ice forecast ${ri(18, 34)}% at holes ${HOLE()}–${HOLE()}`, () => `Transferred ${ri(4, 12)} cases from stand ${ri(1, 9)} to stand ${ri(10, 18)} before the rush`, () => `Average line at ${ri(2, 6)} min across ${ri(18, 26)} stands`],
    A: () => [`Run a $2-off water + sunscreen bundle for 45 min`, `Projected +${ri(1, 3)}.${ri(0, 9)}K units at the back-nine stands`] },
  { id: 'gate', n: 'Gate', r: 'Ticketing & Upgrades', t: 'rev', a: '#5B7FE0', b: '#3A8DDE', e: 'p',
    m: 'Watches inventory and scans, then offers the right upgrade to the right fan.',
    w: ['Ticket inventory by day', 'Gate scans and no-shows', 'Fan preferences from My Week'],
    d: ['Targets upgrade offers', 'Releases held inventory', 'Flags fraud patterns'],
    g: 'Asks before releasing held tickets or changing a price.', src: [['2027 tickets', SRC.tix]], k: ['upgrades', 1],
    L: [() => `Offered ${ri(40, 160)} grounds holders a club upgrade · ${ri(6, 19)} accepted`, () => `Saturday scans at ${ri(68, 91)}% of sold · no-show forecast ${ri(4, 9)}%`, () => `Blocked ${ri(2, 7)} duplicate barcodes at gate ${ri(1, 4)}`],
    A: () => [`Release ${ri(80, 180)} held grounds tickets for Saturday`, `No-show forecast frees capacity · at face value`] },
  { id: 'suite', n: 'Suite', r: 'Hospitality & Itineraries', t: 'rev', a: '#3A8DDE', b: '#5B7FE0', e: 'w',
    m: 'Runs every hospitality guest itinerary, from car pickup to the 18th green.',
    w: ['Hospitality venue bookings', 'Guest itineraries and arrivals', 'Tee times and featured groups'],
    d: ['Builds and adjusts itineraries', 'Times cars and tables', 'Briefs hosts on VIP arrivals'],
    g: 'Asks before upgrades, comps or anything billed to a client.', src: [['Hospitality offerings', SRC.hosp]], k: ['itineraries', 1],
    L: [() => `Moved a ${ri(6, 14)}-guest group to the ${pick(HOSP)} for the leaders' approach`, () => `Car pickup for ${ri(3, 9)} guests at the Omni timed to the 1:40 tee time`, () => `Briefed ${pick(HOSP)} hosts on ${ri(2, 6)} arriving VIP clients`],
    A: () => [`Upgrade ${ri(3, 6)} guests to the ${pick(HOSP)} · $${ri(18, 42) * 100}`, `Client request from the sponsor host · billed to the account`] },

  { id: 'ledger', n: 'Ledger', r: 'Sponsor ROI Analyst', t: 'spon', a: '#22C08A', b: '#5B7FE0', e: 'p',
    m: 'Ties every fan action to a sponsor and keeps each partner\'s score and ROI current.',
    w: ['Event Outcome Ledger', 'Activation investment by partner', 'Exposure, behavior, sentiment, redemptions'],
    d: ['Updates Event Outcome Scores', 'Writes the one-page ROI summary', 'Flags partners slipping a band'],
    g: 'Never changes the method or rates without sign-off.', src: [['Commercial Family', 'https://www.pgachampionship.com/commercial-family']], k: ['ledger rows', 1],
    L: [() => `${pick(SP)} EOS updated · +${ri(1, 4)} pts on redemptions`, () => `Attributed ${ri(300, 2400).toLocaleString()} new fan actions across ${ri(6, 14)} partners`, () => `Refreshed the one-page ROI summary for ${pick(SP)}`, () => `${pick(SP)} slipped toward Watch · alerted the partner lead`] },
  { id: 'spark', n: 'Spark', r: 'Sponsor Activation Ops', t: 'spon', a: '#3FB67A', b: '#3A8DDE', e: 'r',
    m: 'Launches sponsor moments in the guide at the exact time and place they land best.',
    w: ['Sponsor activation plans', 'Fan location and dwell', 'Leaderboard moments'],
    d: ['Times in-guide offers', 'Caps frequency per fan', 'Reports lift to Ledger'],
    g: 'Asks before any push to more than 1,000 fans.', src: [], k: ['moments', 1],
    L: [() => `${pick(SP)} moment shown to ${ri(300, 1800).toLocaleString()} fans near hole ${HOLE()}`, () => `Frequency cap hit for ${ri(40, 220)} fans · paused offers for them`, () => `Hole-in-one watch on ${pick([4, 6, 13, 17])} · ${pick(SP)} creative staged`],
    A: () => [`Push a ${pick(SP)} offer to ${ri(1200, 3600).toLocaleString()} fans near the ${pick(['15th', '17th', '18th'])} green`, `Leaders arriving in about 12 minutes`] },
  { id: 'pulse', n: 'Pulse', r: 'Social Sentiment', t: 'spon', a: '#4FD1E8', b: '#22C08A', e: 'w',
    m: 'Listens across social, news and the guide and tells you what fans feel, live.',
    w: ['Public social posts and news', 'Guide feedback and chats', 'Sponsor mention streams'],
    d: ['Scores net sentiment', 'Spots issues early', 'Drafts replies for review'],
    g: 'Drafts only. A person posts every public reply.', src: [], k: ['mentions', 10],
    L: [() => `Net sentiment ${ri(58, 81)}/100 · mentions up ${ri(8, 31)}% in the last hour`, () => `Spike in "${pick(['shade', 'water lines', 'shuttle', 'parking'])}" posts near hole ${HOLE()} · flagged to ops`, () => `${pick(SP)} mentions +${ri(12, 60)}% after the on-course moment`],
    A: () => [`Post a reply to a trending complaint about ${pick(['parking', 'water lines', 'shuttle waits'])}`, `Draft ready · ${ri(2, 9)}K views on the original post`] },

  { id: 'forecast', n: 'Forecast', r: 'Weather & Play', t: 'ops', a: '#5B7FE0', b: '#4FD1E8', e: 'r',
    m: 'Tracks North Texas weather minute by minute and plans for suspensions before they happen.',
    w: ['Radar, lightning and heat index', 'Tee sheet and pace of play', 'Evacuation shelter plan'],
    d: ['Issues heat and storm advisories', 'Pre-stages shelter messaging', 'Re-times shuttles and hospitality'],
    g: 'Play decisions belong to the championship committee.', src: [], k: ['advisories', 1],
    L: [() => `Lightning ${ri(18, 40)} mi NW and moving away · no action`, () => `Heat index ${ri(94, 101)}°F at 2 pm · cooling-tent message staged`, () => `Wind gusts ${ri(18, 27)} mph forecast · grandstand check scheduled`],
    A: () => [`Send a shelter-ready alert to everyone on site`, `Storm cell ${ri(9, 14)} mi out · about 25 minutes`] },
  { id: 'sentinel', n: 'Sentinel', r: 'Safety & Incidents', t: 'ops', a: '#3A8DDE', b: '#4FD1E8', e: 'p',
    m: 'Spots incidents early and gets the right responder there with the right context.',
    w: ['Incident reports and medical calls', 'Crowd density alerts', 'Lost-child and lost-item reports'],
    d: ['Routes incidents to responders', 'Shares location and context', 'Keeps the incident timeline'],
    g: 'Dispatch stays with public safety. Sentinel informs, never commands.', src: [], k: ['incidents', 1],
    L: [() => `Medical call near hole ${HOLE()} · routed to cart ${ri(1, 8)} · 3 min ETA`, () => `Lost child reunited at the ${pick(['1st tee', 'PGA District', '18 green'])} welcome tent · 11 min`, () => `Cleared a crowd alert at hole ${HOLE()} · density back to normal`] },
  { id: 'frisco', n: 'Frisco', r: 'Local Impact Analyst', t: 'ops', a: '#22C08A', b: '#F5B83D', e: 'w',
    m: 'Connects the championship to Frisco: hotels, restaurants, traffic and local spend.',
    w: ['Hotel and restaurant demand', 'Traffic on the Dallas North Tollway and PGA Pkwy', 'Local partner offers'],
    d: ['Steers fans to local partners', 'Times traffic messaging', 'Reports economic impact'],
    g: 'Uses only aggregated, anonymous fan data.', src: [['Frisco PGA District', SRC.district]], k: ['referrals', 1],
    L: [() => `Steered ${ri(120, 640)} fans to ${pick(['Frisco Square', 'The Star', 'PGA District'])} dinner spots`, () => `PGA Pkwy at ${ri(22, 34)} mph · sent alternate route to ${ri(400, 1500).toLocaleString()} drivers`, () => `Hotel occupancy near the course at ${ri(88, 98)}%`] },
];
const BY = Object.fromEntries(AG.map(a => [a.id, a]));
const st = { team: 'all', live: new Set(), mode: Object.fromEntries(AG.map(a => [a.id, 'approve'])), done: Object.fromEntries(AG.map(a => [a.id, 0])), run: true, n: 0, tasks: 0, mins: 0, esc: 0, pend: [] };

const face = (a, cls = '') => `<span class="av ${cls} e-${a.e}" style="--a:${a.a};--b:${a.b}" data-av="${a.id}"><span class="gl"></span><span class="eyes"><i></i><i></i></span></span>`;
const teamName = t => TEAMS.find(x => x[0] === t)[1];

/* hero parade */
$('#parade').innerHTML = AG.map((a, i) => `<span class="pp" style="--i:${i}">${face(a, 'sleep')}</span>`).join('');

/* team filter */
$('#teams').innerHTML = TEAMS.map(([k, l]) => `<button role="tab" data-t="${k}" aria-selected="${k === 'all'}">${l}</button>`).join('');
$$('#teams button').forEach(b => b.onclick = () => { st.team = b.dataset.t; $$('#teams button').forEach(x => x.setAttribute('aria-selected', x === b)); grid(); });

function grid() {
  $('#grid').innerHTML = AG.filter(a => st.team === 'all' || a.t === st.team).map(a => {
    const on = st.live.has(a.id);
    return `<article class="card${on ? ' is-live' : ''}" data-id="${a.id}" tabindex="0" aria-label="${esc(a.n)}, ${esc(a.r)}">
      ${face(a, on ? 'live' : 'sleep')}
      <div class="c-t"><h3>${esc(a.n)}</h3><p>${esc(a.r)}</p><span class="team">${teamName(a.t)}</span></div>
      <button class="get${on ? ' on' : ''}" data-dep="${a.id}" aria-label="${on ? 'Pause' : 'Deploy'} ${esc(a.n)}">${on ? '<i class="ld"></i>Live' : 'Deploy'}</button>
    </article>`; }).join('');
  $$('#grid .card').forEach(c => { c.onclick = e => { if (e.target.closest('[data-dep]')) return; openSheet(c.dataset.id); }; c.onkeydown = e => { if (e.key === 'Enter') openSheet(c.dataset.id); }; });
  $$('#grid [data-dep]').forEach(b => b.onclick = () => toggle(b.dataset.dep, b));
}

function setAv(id) { $$(`[data-av="${id}"]`).forEach(v => { if (v.closest('.dock') || v.closest('.feed')) return; v.classList.toggle('live', st.live.has(id)); v.classList.toggle('sleep', !st.live.has(id)); }); }

function toggle(id, btn, quiet) {
  const a = BY[id];
  if (st.live.has(id)) { st.live.delete(id); log(a, 'Paused by you', 'sys'); setAv(id); grid(); dock(); stats(); if (!quiet) toast(`${a.n} paused`); refreshSheet(id); return Promise.resolve(); }
  return new Promise(res => {
    const b = btn || $(`#grid [data-dep="${id}"]`);
    if (b) { b.classList.add('loading'); b.innerHTML = '<svg class="ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="pr" cx="18" cy="18" r="15"/></svg>'; }
    setTimeout(() => {
      st.live.add(id); fly(id); setAv(id); grid(); dock(); stats(); refreshSheet(id);
      log(a, `Deployed · autonomy set to ${st.mode[id] === 'auto' ? 'Auto' : st.mode[id] === 'suggest' ? 'Suggest' : 'Approve'}`, 'sys');
      if (!quiet) toast(`${a.n} is live`);
      res();
    }, quiet ? 520 : 900);
  });
}

function fly(id) {
  const from = $(`#grid .card[data-id="${id}"] .av`) || $(`.sheet .av`); if (!from || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = from.getBoundingClientRect(), d = $('#dock').getBoundingClientRect();
  const c = from.cloneNode(true); c.classList.add('flyer'); c.classList.remove('sleep'); c.classList.add('live');
  Object.assign(c.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  document.body.appendChild(c);
  requestAnimationFrame(() => { Object.assign(c.style, { left: (d.right - 40) + 'px', top: (d.top + 8) + 'px', width: '44px', height: '44px', opacity: .2 }); });
  setTimeout(() => c.remove(), 750);
}

function dock() {
  const live = AG.filter(a => st.live.has(a.id));
  $('#dock').innerHTML = live.length ? live.map(a => `<button class="dk" data-id="${a.id}" title="${esc(a.n)} · ${esc(a.r)}">${face(a, 'live')}<span class="dl">${esc(a.n)}</span></button>`).join('') + `<span class="dsep"></span><span class="dcount"><b>${live.length}</b>/12 live</span>` : '<span class="dock-empty">Deployed agents appear here</span>';
  $$('#dock .dk').forEach(b => b.onclick = () => openSheet(b.dataset.id));
}

function stats() {
  const hrs = st.mins / 60;
  $('#stats').innerHTML = [['Agents live', `${st.live.size}<small>/12</small>`], ['Tasks completed', st.tasks.toLocaleString()], ['Staff hours saved', hrs.toFixed(1)], ['Waiting on you', st.pend.length], ['Handed to a human', st.esc]]
    .map(([l, v], i) => `<div class="stat${i === 3 && st.pend.length ? ' hot' : ''}"><span>${l}</span><b>${v}</b></div>`).join('');
  $('#apprN').textContent = st.pend.length; $('#apprN').classList.toggle('hot', !!st.pend.length);
  $('#navDeploy').textContent = st.live.size === 12 ? 'All live' : 'Deploy all';
}

const tm = () => { const d = new Date(); return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', timeZone: 'America/Chicago' }); };
const hex = () => Math.random().toString(16).slice(2, 6).toUpperCase();
function log(a, text, kind = '') {
  st.n++;
  const li = document.createElement('li'); li.className = 'fi ' + kind;
  li.innerHTML = `${face(a, 'live mini')}<div><p><b>${esc(a.n)}</b> ${esc(text)}</p><span class="mono">${tm()} CT · LX-${hex()} · ${kind === 'sys' ? 'control' : kind === 'ok' ? 'approved by you' : kind === 'no' ? 'declined by you' : kind === 'auto' ? 'auto · within limit' : kind === 'esc' ? 'handed to a human' : st.mode[a.id] === 'suggest' ? 'suggested' : 'within rule'}</span></div>`;
  const f = $('#feed'); f.prepend(li); while (f.children.length > 40) f.lastChild.remove();
  $('#feedCount').textContent = `${st.n.toLocaleString()} entries`;
  const sl = $(`.sheet .mini-log`); if (sl && sl.dataset.id === a.id) { sl.prepend(Object.assign(document.createElement('li'), { innerHTML: `<span class="mono">${tm()}</span> ${esc(text)}` })); while (sl.children.length > 5) sl.lastChild.remove(); }
}

function approval(a) {
  const [title, why] = a.A(); const id = 'ap' + hex();
  if (st.mode[a.id] === 'auto') { log(a, title, 'auto'); work(a, 6); return; }
  if (st.pend.length >= 4) return;
  st.pend.unshift({ id, a: a.id, title, why });
  renderAppr(); stats(); toast(`${a.n} needs your approval`, true);
}
function renderAppr() {
  $('#appr').innerHTML = st.pend.length ? st.pend.map(p => { const a = BY[p.a]; return `<div class="ap" data-id="${p.id}">${face(a, 'live mini')}<div class="ap-t"><b>${esc(a.n)} wants to</b><p>${esc(p.title)}</p><span>${esc(p.why)}</span></div><div class="ap-b"><button class="no" data-k="no">Decline</button><button class="ok" data-k="ok">Approve</button></div></div>`; }).join('') : '<p class="empty">Nothing waiting. Agents running on Approve will ask here before they act.</p>';
  $$('#appr .ap button').forEach(b => b.onclick = () => { const el = b.closest('.ap'), p = st.pend.find(x => x.id === el.dataset.id); st.pend = st.pend.filter(x => x !== p); const a = BY[p.a];
    if (b.dataset.k === 'ok') { log(a, p.title, 'ok'); work(a, 8); } else log(a, `Did not ${p.title.charAt(0).toLowerCase() + p.title.slice(1)}`, 'no');
    el.classList.add('gone'); setTimeout(renderAppr, 260); stats(); });
}
function work(a, mins) { st.tasks++; st.done[a.id]++; st.mins += mins; const v = $(`#dock .dk[data-id="${a.id}"] .av`); if (v) { v.classList.remove('busy'); void v.offsetWidth; v.classList.add('busy'); } }

function tick() {
  if (!st.run || !st.live.size || document.hidden) return;
  const ids = [...st.live], a = BY[pick(ids)];
  const roll = Math.random();
  if (a.A && roll < .16 && st.mode[a.id] !== 'suggest') approval(a);
  else if (roll > .955) { st.esc++; log(a, pick(['Handed an out-of-scope request to a guest host', 'Escalated a judgment call to the duty manager', 'Passed a refund request to the ticket office']), 'esc'); }
  else { log(a, pick(a.L)()); work(a, ri(2, 9)); }
  stats();
}
setInterval(tick, 1500);

/* sheet */
let sheetId = null;
function openSheet(id) {
  sheetId = id; const a = BY[id], on = st.live.has(id);
  $('#sheet').innerHTML = `<button class="x" aria-label="Close">×</button>
    <div class="sh-top">${face(a, (on ? 'live' : 'sleep') + ' big')}<div><span class="team">${teamName(a.t)}</span><h2 id="shName">${esc(a.n)}</h2><p>${esc(a.r)}</p></div>
      <button class="get big${on ? ' on' : ''}" data-dep="${a.id}">${on ? '<i class="ld"></i>Live · Pause' : 'Deploy'}</button></div>
    <p class="sh-m">${esc(a.m)}</p>
    <div class="sh-auto"><span>Autonomy</span><div class="seg sm" id="auto">${[['suggest', 'Suggest'], ['approve', 'Approve'], ['auto', 'Auto']].map(([k, l]) => `<button data-k="${k}" aria-selected="${st.mode[id] === k}">${l}</button>`).join('')}</div>
      <em>${{ suggest: 'Recommends only. A person takes every action.', approve: 'Acts on routine work. Asks you before anything in its boundary.', auto: 'Acts inside its limits and logs everything. You can pause it any time.' }[st.mode[id]]}</em></div>
    <div class="sh-cols">
      <div><h4>Watches</h4><ul>${a.w.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h4>Can do</h4><ul>${a.d.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <div class="sh-g"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3z"/></svg><div><b>Boundary</b><p>${esc(a.g)}</p></div></div>
    ${a.src.filter(s => s[1]).length ? `<p class="sh-src">Reads public event facts from ${a.src.filter(s => s[1]).map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(l)}</a>`).join(' and ')}.</p>` : ''}
    <div class="sh-live"><div class="p-h"><h4>Recent activity</h4><span class="simtag sm"><i></i>Simulated</span></div>
      <div class="sh-k"><div><span>Tasks done</span><b>${st.done[id]}</b></div><div><span>Status</span><b>${on ? 'Live' : 'Ready'}</b></div></div>
      <ol class="mini-log" data-id="${id}">${on ? '' : '<li class="empty">Deploy to start the activity log.</li>'}</ol></div>`;
  $('#sheet').hidden = false; $('#sheetBg').hidden = false; requestAnimationFrame(() => { $('#sheet').classList.add('open'); $('#sheetBg').classList.add('open'); });
  document.body.style.overflow = 'hidden';
  $('#sheet .x').onclick = closeSheet; $('#sheet .x').focus({ preventScroll: true });
  $('#sheet [data-dep]').onclick = e => toggle(id, null);
  $$('#auto button').forEach(b => b.onclick = () => { st.mode[id] = b.dataset.k; if (st.live.has(id)) log(a, `Autonomy changed to ${b.textContent}`, 'sys'); openSheet(id); });
}
function refreshSheet(id) { if (sheetId === id && !$('#sheet').hidden) openSheet(id); }
function closeSheet() { $('#sheet').classList.remove('open'); $('#sheetBg').classList.remove('open'); document.body.style.overflow = ''; sheetId = null; setTimeout(() => { $('#sheet').hidden = true; $('#sheetBg').hidden = true; }, 280); }
$('#sheetBg').onclick = closeSheet; document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetId) closeSheet(); });

/* toast */
let tt; function toast(m, hot) { const t = $('#toast'); t.textContent = m; t.className = 'toast show' + (hot ? ' hot' : ''); clearTimeout(tt); tt = setTimeout(() => t.className = 'toast', 2200); }

/* deploy all + kill switch */
async function deployAll() { if (!st.run) setRun(true); for (const a of AG) if (!st.live.has(a.id)) { toggle(a.id, null, true); await new Promise(r => setTimeout(r, 140)); } toast('Full workforce deploying'); document.getElementById('live').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
$('#deployAll').onclick = deployAll; $('#navDeploy').onclick = deployAll;
function setRun(on) { st.run = on; const k = $('#kill'); k.classList.toggle('on', on); k.setAttribute('aria-checked', on); k.setAttribute('aria-label', on ? 'Workforce running' : 'Workforce paused'); document.body.classList.toggle('paused', !on); $('#killT').textContent = on ? 'Workforce running' : 'Workforce paused'; $('#killS').textContent = on ? 'Switch off to stop every agent and freeze the ledger.' : 'Every agent is stopped. Switch on to resume.'; log(BY.ledger, on ? 'Workforce resumed by you' : 'Workforce paused by you · ledger frozen', 'sys'); toast(on ? 'Workforce resumed' : 'Everything paused'); }
$('#kill').onclick = () => setRun(!st.run);

/* start with three agents live so the page breathes */
grid(); dock(); stats();
const q = new URLSearchParams(location.search);
const boot = q.get('deploy') === 'all' ? AG.map(a => a.id) : ['walter', 'ledger', 'pulse'];
boot.forEach((id, i) => setTimeout(() => toggle(id, null, true), 500 + i * 220));
})();
