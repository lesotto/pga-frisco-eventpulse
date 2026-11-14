(() => {
const { S, sponsors, tixDays, att, mentions, promos, odds, lb26 } = window.D;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const fmt = n => Math.round(n).toLocaleString('en-US');
const fmtK = n => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : fmt(n);
const money = n => n >= 1e6 ? '$' + (n / 1e6).toFixed(2) + 'M' : '$' + fmt(n);
const src = k => S[k] ? `<a class="src" href="${S[k][1]}" target="_blank" rel="noopener">${S[k][0]} ↗</a>` : '';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const jitter = (a = .06) => 1 + (Math.random() * 2 - 1) * a;

/* ---------- state ---------- */
const st = { mode: 'real', simMin: 11 * 60, sel: 'T-Mobile', cat: 'All', sent: 'all', checkins: 0 };
const DAY0 = 6.5 * 60, DAY1 = 19.5 * 60;
const prog = () => Math.max(0, Math.min(1, (st.simMin - DAY0) / (DAY1 - DAY0)));
const attTot = att.reduce((a, b) => a + b, 0);
const SAT = 5;
const weekFrac = () => st.mode === 'sim' ? (att.slice(0, SAT).reduce((a, b) => a + b, 0) + att[SAT] * arrivedFrac(st.simMin)) / attTot : 1;
function onGrounds(m) { const h = m / 60; const inn = 1 / (1 + Math.exp(-(h - 9.6) * 1.5)); const out = 1 / (1 + Math.exp((h - 17.4) * 1.3)); return att[SAT] * .86 * inn * out; }
function arrivedFrac(m) { const h = m / 60; return 1 / (1 + Math.exp(-(h - 9.6) * 1.5)); }
const hourCurve = (fn) => { const r = []; for (let h = 7; h <= 19; h++) r.push(fn(h)); return r; };

/* ---------- chart defaults ---------- */
Chart.defaults.color = '#a7a3c9'; Chart.defaults.font.family = 'Inter, system-ui, sans-serif'; Chart.defaults.font.size = 11.5;
Chart.defaults.borderColor = 'rgba(160,150,255,.12)'; Chart.defaults.plugins.legend.labels.boxWidth = 10; Chart.defaults.plugins.legend.labels.boxHeight = 10;
Chart.defaults.plugins.tooltip.backgroundColor = '#1a1640'; Chart.defaults.plugins.tooltip.borderColor = 'rgba(232,76,154,.5)'; Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.maintainAspectRatio = false; Chart.defaults.animation.duration = 700;
const C = { pink: '#E84C9A', orange: '#F07A2A', cyan: '#4FD1E8', purple: '#8B5CF6', green: '#22C08A', amber: '#F5B83D', red: '#F25C6A' };
const grad = (ctx, a, b) => { const g = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
const vgrad = (ctx, a) => { const g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 260); g.addColorStop(0, a + 'aa'); g.addColorStop(1, a + '05'); return g; };
const charts = {};

/* ---------- sponsor model (forecast) ---------- */
sponsors.forEach((s, i) => { seed = 101 + i * 37; s.r = .85 + rnd() * .3; s.sentBase = Math.round(58 + s.w * 18 + rnd() * 8); });
function sp(s) {
  const f = weekFrac();
  const exp = s.w * s.r * 2.4e6 * f;
  const beh = exp * (.028 + s.w * .012);
  const red = beh * (.14 + s.w * .05);
  const sent = Math.min(96, s.sentBase + (st.mode === 'sim' ? Math.sin(st.simMin / 37 + s.w * 3) * 3 : 0));
  return { exp, beh, red, sent };
}

/* ---------- header / hero ---------- */
const R1 = new Date('2027-05-20T07:00:00-05:00');
function tickClock() {
  const now = new Date();
  if (st.mode === 'real') {
    $('#clock').textContent = now.toLocaleTimeString('en-US', { timeZone: 'America/Chicago', hour: 'numeric', minute: '2-digit', second: '2-digit' });
    $('#clockSub').textContent = 'Frisco, TX (CT) · now';
    let d = Math.max(0, R1 - now); const D = Math.floor(d / 864e5); d -= D * 864e5; const H = Math.floor(d / 36e5); d -= H * 36e5; const M = Math.floor(d / 6e4); const Sx = Math.floor((d - M * 6e4) / 1e3);
    $('#countdown').innerHTML = `<span class="eyebrow">Countdown to Round 1 · est. first tee</span>
      <div class="cd"><div><b>${D}</b><small>Days</small></div><div><b>${String(H).padStart(2, '0')}</b><small>Hrs</small></div><div><b>${String(M).padStart(2, '0')}</b><small>Min</small></div><div><b>${String(Sx).padStart(2, '0')}</b><small>Sec</small></div></div>
      <div class="row"><span>Thursday, May 20, 2027 · Fields Ranch East</span><span>${src('sched')}</span></div>
      <div class="row"><span>First men's major in DFW since 1963</span><span>${src('sbj')}</span></div>`;
  } else {
    const h = Math.floor(st.simMin / 60), m = Math.floor(st.simMin % 60);
    const t = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
    $('#clock').textContent = t; $('#clockSub').textContent = 'Sat May 22, 2027 · simulated';
    $('#countdown').innerHTML = `<span class="eyebrow" style="color:var(--amber)">Simulated · Saturday · Round 3</span>
      <div class="big">${t} <small style="font-size:14px;color:var(--dim)">CT</small></div>
      <div class="bar" style="height:6px;border-radius:6px;background:rgba(255,255,255,.07);margin-top:12px;overflow:hidden"><span style="display:block;height:100%;width:${(prog() * 100).toFixed(1)}%;background:linear-gradient(90deg,var(--amber),var(--pink))"></span></div>
      <div class="row"><span>Gates 6:30 AM → close 7:30 PM (illustrative)</span><span>${Math.round(prog() * 100)}% of day</span></div>
      <div class="row"><span>Each second ≈ 1 minute of championship day</span><span class="t-sim">sim clock</span></div>`;
  }
}
function heroLede() {
  $('#heroLede').innerHTML = st.mode === 'real'
    ? `The championship has the demand: a gross revenue record set ten months early ${src('sbj')}, all championship-round passes sold, and 155,000+ ticket registrations ${src('ig')}. This dashboard turns that demand into proof for each sponsor, using live fan, location and sentiment data on one ledger.`
    : `Championship-week simulation. Every number below is generated in your browser to show how sponsors, operations and the city would see the event live. Partner names, venues and baselines stay real. The flows are simulated.`;
}

/* ---------- KPIs ---------- */
function kpis() {
  let k;
  if (st.mode === 'real') k = [
    ['real', 'Ticket registrations', '155,000+', `record · ${src('ig')}`, C.cyan],
    ['real', 'Expected attendance', '200,000', `upward of · ${src('sbj')}`, C.pink],
    ['real', 'Broadcast reach', '~500M', `households · 170+ countries ${src('vf')}`, C.purple],
    ['real', 'Hospitality build', '500K+ ft²', `largest ever · ${src('sbj')}`, C.orange],
    ['real', 'Economic impact', '$100M+', `local · ${src('dmn')}`, C.green],
    ['real', 'Revenue vs 2026 record', '+10–20%', `expected · ${src('sbj')}`, C.amber],
  ];
  else {
    const og = onGrounds(st.simMin), ci = st.checkins, imp = sponsors.reduce((a, s) => a + sp(s).exp, 0);
    const day = arrivedFrac(st.simMin);
    k = [
      ['sim', 'On grounds now', fmt(og), 'fans · Saturday R3', C.pink],
      ['sim', 'QR check-ins today', fmt(ci), 'across 10 locations', C.cyan],
      ['sim', 'Sponsor impressions', fmtK(imp), 'week to date · ledger', C.purple],
      ['sim', 'Concession units', fmtK(att[SAT] * day * 5.5), 'served today', C.orange],
      ['sim', 'Sentiment index', (62 + Math.sin(st.simMin / 23) * 6).toFixed(1), 'net, 0–100', C.green],
      ['sim', 'Guide sessions live', fmt(og * .31), 'EventPulse itineraries', C.amber],
    ];
  }
  const el = $('#kpis'), prev = el.dataset.mode;
  el.innerHTML = k.map(([kind, l, v, s, acc]) => `<div class="kpi ${kind}${prev === st.mode && kind === 'sim' ? ' flash' : ''}" style="--acc:${acc}"><i class="k-tag"></i><span>${l}</span><b>${v}</b><em>${s}${kind === 'sim' ? ' · <span class="t-sim">simulated</span>' : ''}</em></div>`).join('');
  el.dataset.mode = st.mode;
}

/* ---------- ticker ---------- */
const realTick = [
  ['RECORD', 'Gross revenue record set 10 months before first tee', 'SBJ'], ['SOLD OUT', 'All championship-round passes and all hospitality inventory sold', 'SBJ'],
  ['PARTNER', 'Choctaw named first official casino resort in the championship\'s 111-year history', 'Choctaw'], ['DEMAND', 'Corporate hospitality sold out faster than at any previous PGA Championship', 'FOS'],
  ['LOCAL', '1,300+ temporary jobs; VendorMatch connects local businesses', 'Community Impact'], ['TRAVEL', '400+ private jets expected into DFW', 'Dallas Morning News'],
  ['MARKET', 'Scheffler +450 favorite; defending champion Aaron Rai', "Boyd's Bets"], ['COURSE', 'Front and back nines swapped for 2027 so more fans can see the finishing holes', 'Dallas Morning News'], ['SENTIMENT', 'Course critique persists from the 2025 Women\'s PGA', 'Golfweek'],
];
function simTickItems() {
  const s = sponsors[Math.floor(Math.random() * sponsors.length)];
  return [['SIM', `${s.n} moment triggered for ${fmt(800 + Math.random() * 3000)} fans near the 18th green`], ['SIM', `Gate C scans ${fmt(400 + Math.random() * 500)}/min · shuttle loop 11 min`], ['SIM', `Concessions: 3 stands above 6-min wait, guide rerouting fans`], ['SIM', `Choctaw Ice House at ${Math.round(86 + Math.random() * 12)}% capacity`], ['SIM', `Roar at 17: sentiment +4 in 5 min`]];
}
function ticker() {
  const items = st.mode === 'real' ? realTick.map(([a, b, c]) => `<span><i>${a}</i><b>${b}</b> · ${c}</span>`) : simTickItems().concat(simTickItems()).map(([a, b]) => `<span><i style="color:var(--amber)">${a}</i><b>${b}</b></span>`);
  $('#ticker').innerHTML = items.join('') + items.join('');
}

/* ---------- sponsors ---------- */
const cats = ['All', ...new Set(sponsors.map(s => s.cat))];
function spFilters() { $('#spFilters').innerHTML = cats.map(c => `<button class="${c === st.cat ? 'on' : ''}" data-c="${c}">${c}</button>`).join(''); $$('#spFilters button').forEach(b => b.onclick = () => { st.cat = b.dataset.c; spFilters(); spGrid(); }); }
function spGrid() {
  const list = sponsors.filter(s => st.cat === 'All' || s.cat === st.cat);
  const sim = st.mode === 'sim', max = Math.max(...sponsors.map(s => sp(s).exp));
  $('#spGrid').innerHTML = list.map(s => { const m = sp(s);
    const body = sim
      ? `<div class="mx"><span>${fmtK(m.exp)} exp</span><span>${fmtK(m.red)} red</span><span>${Math.round(m.sent)} sent</span></div><div class="bar"><span style="width:${(m.exp / max * 100).toFixed(1)}%;background:linear-gradient(90deg,${s.c},#F5B83D)"></span></div><div class="simchip">Simulated</div>`
      : `<div class="mx real"><span>Source · ${esc(S[s.s] ? S[s.s][0] : 'Commercial Family')}</span></div>`;
    return `<button class="sp ${s.n === st.sel ? 'on' : ''}${sim ? ' is-sim' : ''}" data-n="${esc(s.n)}"><div class="nm"><i style="background:${s.c}"></i>${esc(s.n)}</div><div class="tr">${esc(s.tier)} · ${s.cat}</div>${body}</button>`; }).join('');
  $$('#spGrid .sp').forEach(b => b.onclick = () => { st.sel = b.dataset.n; spGrid(); spDetail(); });
}
function spDetail() {
  const s = sponsors.find(x => x.n === st.sel), m = sp(s);
  if (charts.sp) { charts.sp.destroy(); charts.sp = null; }
  if (st.mode !== 'sim') {
    $('#spDetail').classList.remove('is-sim');
    $('#spDetail').innerHTML = `<div class="card-h"><span class="eyebrow">Sponsor ledger</span><span class="tag real">Real · cited</span></div>
      <h3>${esc(s.n)}</h3><div class="tr">${esc(s.tier)} · ${esc(s.cat)}</div>
      <p>${esc(s.act)} ${src(s.s)}</p>
      <div class="simph on"><span class="tag sim">Not measured yet</span><p>Exposure, behavior, sentiment and redemptions for ${esc(s.n)} start counting when fans use the guide during championship week. No real figures exist yet, so none are shown here.</p><button class="btn-sim" data-go-sim>See the simulated preview</button></div>`;
    $$('#spDetail [data-go-sim]').forEach(b => b.onclick = () => setMode('sim'));
    return;
  }
  $('#spDetail').classList.add('is-sim');
  $('#spDetail').innerHTML = `<div class="card-h"><span class="eyebrow">Sponsor ledger</span><span class="tag sim">Simulated · not real data</span></div>
    <div class="simban">Simulated · generated in your browser · not real data</div>
    <h3>${esc(s.n)}</h3><div class="tr">${esc(s.tier)}</div>
    <p>${esc(s.act)} ${src(s.s)}</p>
    <div class="ledger"><div><span>Exposure</span><b>${fmtK(m.exp)}</b></div><div><span>Behavior</span><b>${fmtK(m.beh)}</b></div><div><span>Sentiment</span><b>${Math.round(m.sent)}/100</b></div><div><span>Redemptions</span><b>${fmtK(m.red)}</b></div></div>
    <div class="chart xs"><canvas id="chSp"></canvas></div>
    <p class="note">Simulated. Exposure means impressions across the guide, on-site moments and digital. Behavior means visits, dwell time and taps. Redemptions are offers claimed. The numbers scale with activation size and a simulated attendance curve. They are not measurements.</p>`;
  const ctx = $('#chSp').getContext('2d');
  const hrs = hourCurve(h => Math.max(0, onGrounds(h * 60) / att[SAT]) * s.w * s.r * 100 * jitter(.08));
  charts.sp = new Chart(ctx, { type: 'line', data: { labels: hourCurve(h => (h > 12 ? h - 12 : h) + (h >= 12 ? 'p' : 'a')), datasets: [{ data: hrs, borderColor: s.c, backgroundColor: vgrad(ctx, s.c), fill: true, tension: .4, pointRadius: 0, borderWidth: 2 }] }, options: { plugins: { legend: { display: false }, title: { display: true, text: 'Engagement by hour · ' + (st.mode === 'sim' ? 'simulated Saturday' : 'simulated Saturday'), color: '#7a76a0', font: { size: 11 } } }, scales: { y: { display: false }, x: { grid: { display: false } } } } });
}
function spCharts() {
  if (!charts.cat) { const byCat = {}; sponsors.forEach(s => byCat[s.cat] = (byCat[s.cat] || 0) + 1); const e = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const ctx = $('#chCat').getContext('2d'); charts.cat = new Chart(ctx, { type: 'bar', data: { labels: e.map(x => x[0]), datasets: [{ data: e.map(x => x[1]), backgroundColor: grad(ctx, C.cyan, C.purple), borderRadius: 6 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw + (c.raw === 1 ? ' partner' : ' partners') } } }, scales: { x: { ticks: { stepSize: 1, precision: 0 } }, y: { grid: { display: false } } } } }); }
  const t = sponsors.reduce((a, s) => { const m = sp(s); a.e += m.exp; a.b += m.beh; a.r += m.red; a.s += m.sent * s.w; a.w += s.w; return a; }, { e: 0, b: 0, r: 0, s: 0, w: 0 });
  const rows = [['Exposure · impressions', t.e, 100], ['Behavior · visits & dwell', t.b, t.b / t.e * 100 * 12], ['Sentiment · weighted net', t.s / t.w, t.s / t.w * .45], ['Redemptions · offers claimed', t.r, t.r / t.e * 100 * 40]];
  $('#funnel').innerHTML = rows.map(([l, v, w], i) => `<div class="f"><span style="width:${Math.min(100, w).toFixed(1)}%"></span><p>${l}<b>${i === 2 ? v.toFixed(1) + '/100' : fmtK(v)}</b></p></div>`).join('');
}

/* ---------- ticketing ---------- */
function tickets() {
  const ctx = $('#chTix').getContext('2d');
  charts.tix = new Chart(ctx, { type: 'bar', data: { labels: tixDays.map(d => d[0] + ' · ' + d[1]), datasets: [{ label: 'Lowest resale ($)', data: tixDays.map(d => d[2]), backgroundColor: tixDays.map((d, i) => i < 3 ? 'rgba(79,209,232,.7)' : 'rgba(232,76,154,.85)'), borderRadius: 8 }] }, options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '$' + c.raw + ' lowest listed' } } }, scales: { y: { ticks: { callback: v => '$' + v } }, x: { grid: { display: false } } } } });
  $('#tixStatus').innerHTML = [
    ['Championship rounds, Thu–Sun', '<span class="pill out">Sold out</span>', 'sbj'], ['Practice rounds, Mon–Wed', '<span class="pill ltd">Few left</span>', 'sbj'],
    ['Weekly & daily hospitality', '<span class="pill out">Sold out</span>', 'sbj'], ['Choctaw Ice House daily VIP', '<span class="pill out">Sold in 3 wks</span>', 'choc'],
    ['Ticket registrations', '<b>155,000+</b>', 'ig'], ['Volunteer slots (Oct 2026)', '<span class="pill ltd">Limited</span>', 'nbcDemand'],
  ].map(([a, b, s]) => `<li><span>${a}<small>${src(s)}</small></span><b>${b}</b></li>`).join('');
  $('#tixProducts').innerHTML = `<tr><th>Product</th><th style="text-align:right">Price</th></tr>` + [['Championship+ weekly, all 7 days', 1383], ['Choctaw Ice House, 4-day', 2734], ['Wanamaker Club, 4-day', 4428]].map(([a, b]) => `<tr><td>${a}</td><td class="n">$${fmt(b)}</td></tr>`).join('') + `<tr><td colspan="2" class="note" style="border:0">${src('dmnTix')} · ${src('tix')}</td></tr>`;
  $('#amen').innerHTML = [
    `<b>Free food and non-alcoholic drinks</b> at concession stands with every ticket (Championship+) ${src('dmnReg')}`,
    `<b>Climate-controlled hospitality</b> with all-inclusive food and drink, plus parking ${src('hosp')}`,
    `<b>Parking and shuttles</b>: Toyota Stadium lots, shuttles from several sites and talks with Uber and Lyft. The final plan is TBA ${src('dmn')}`,
    `<b>Frisco ISD ends the school year a week early</b> to free up logistics and parking ${src('sbj')}`,
    `<b>Omni PGA Frisco</b>: 500 rooms, also used for some VIP experiences ${src('fos')}`,
  ].map(x => `<li>${x}</li>`).join('');
  const gctx = $('#chGate').getContext('2d');
  charts.gate = new Chart(gctx, { type: 'bar', data: { labels: hourCurve(h => (h > 12 ? h - 12 : h) + (h >= 12 ? 'p' : 'a')), datasets: [{ data: gateData(), backgroundColor: hourCurve(h => 'rgba(245,184,61,.75)'), borderRadius: 4 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => fmtK(v) } }, x: { grid: { display: false } } } } });
}
function gateData() { return hourCurve(h => { const v = (arrivedFrac((h + 1) * 60) - arrivedFrac(h * 60)) * att[SAT] * 1.02; return st.mode === 'sim' && h * 60 > st.simMin ? 0 : v; }); }
function gateUpd() {
  charts.gate.data.datasets[0].data = gateData();
  charts.gate.data.datasets[0].backgroundColor = hourCurve(h => st.mode === 'sim' && Math.floor(st.simMin / 60) === h ? C.pink : 'rgba(245,184,61,.75)');
  charts.gate.update('none');
  $('#gateNote').textContent = st.mode === 'sim' ? `Scanned today: ${fmt(att[SAT] * arrivedFrac(st.simMin))} of a simulated ${fmt(att[SAT])} Saturday crowd.` : `Simulated Saturday arrival curve for ${fmt(att[SAT])} fans. Switch to championship week to watch it fill in.`;
}

/* ---------- hospitality ---------- */
function hospitality() {
  const ctx = $('#chHosp').getContext('2d');
  charts.hosp = new Chart(ctx, { type: 'bar', data: { labels: ['2026 record (Aronimink)', '2027 low case', '2027 high case'], datasets: [{ data: [100, 110, 120], backgroundColor: ['rgba(79,209,232,.6)', 'rgba(232,76,154,.75)', 'rgba(240,122,42,.85)'], borderRadius: 8 }] }, options: { plugins: { legend: { display: false }, title: { display: true, text: 'Gross revenue index (2026 record = 100)', color: '#7a76a0' } }, scales: { y: { min: 80, max: 125 }, x: { grid: { display: false } } } } });
  $('#hospNote').innerHTML = `Frisco is expected to beat the 2026 record by 10% to 20% ${src('sbj')}. Charlotte 2025 did $23M+ in hospitality, and 2026 beat that. "We are a mile ahead of that" ${src('fos')}. The PGA reported $121M in tournament revenue for FY2024–25 ${src('sbj')}.`;
  $('#venues').innerHTML = [
    ['Choctaw Ice House', 'PGA District · views of the 9th green', '<span class="pill out">Sold out</span>', 'choc'],
    ['Wanamaker Club', '4-day package, $4,428', '<span class="pill out">Sold out</span>', 'dmnTix'],
    ['Corporate chalets & suites', 'All weekly and daily inventory', '<span class="pill out">Sold out</span>', 'sbj'],
    ['Total build', '500,000+ ft², the largest in championship history, not counting the Omni', '<b>Record</b>', 'sbj'],
    ['Omni PGA Frisco Resort', '$500M resort · 500 rooms · VIP use', '<span class="pill tba">Players & VIP</span>', 'fos'],
    ['On Location packages', 'Official premium travel', '<span class="pill tba">Partner</span>', 'cf'],
  ].map(([a, d, b, s]) => `<li><span><b style="color:var(--ink)">${a}</b><small>${d} · ${src(s)}</small></span><b>${b}</b></li>`).join('');
}
const venuesOcc = [['Choctaw Ice House', 1.0], ['Wanamaker Club', .95], ['Corporate chalets', .9], ['PGA District', 1.15], ['Omni PGA Frisco outlets', .7]];
function occUpd() {
  const base = st.mode === 'sim' ? onGrounds(st.simMin) / (att[SAT] * .86) : .82;
  $('#occ').innerHTML = venuesOcc.map(([n, w]) => { const v = Math.min(99, base * w * 92 * jitter(.03)); return `<div class="o"><span>${n}</span><b>${v.toFixed(0)}%</b><div><i style="width:${v}%"></i></div></div>`; }).join('') + `<p class="note">${st.mode === 'sim' ? 'Simulated live occupancy.' : 'Simulated peak occupancy preview. Switch modes to watch it move.'}</p>`;
}

/* ---------- concessions ---------- */
const CA = { food: 2.4, na: 3.1, alcShare: .45, alcPer: 1.8, alcPrice: 15 };
function concessions() {
  const food = att.map(a => a * CA.food), na = att.map(a => a * CA.na), alc = att.map(a => a * CA.alcShare * CA.alcPer);
  const ctx = $('#chConc').getContext('2d');
  charts.conc = new Chart(ctx, { type: 'bar', data: { labels: tixDays.map(d => d[0]), datasets: [
    { label: 'Free food', data: food, backgroundColor: 'rgba(240,122,42,.85)', borderRadius: 4, stack: 's' },
    { label: 'Free non-alcoholic drinks', data: na, backgroundColor: 'rgba(79,209,232,.75)', borderRadius: 4, stack: 's' },
    { label: 'Paid alcoholic drinks', data: alc, backgroundColor: 'rgba(232,76,154,.85)', borderRadius: 4, stack: 's' }] },
    options: { plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: c => c.dataset.label + ': ' + fmtK(c.raw) } } }, scales: { y: { stacked: true, ticks: { callback: v => fmtK(v) } }, x: { stacked: true, grid: { display: false } } } } });
  const A = attTot, alcN = A * CA.alcShare * CA.alcPer;
  $('#concCalc').innerHTML = [
    ['Week attendance (simulated daily split)', fmt(A), ''], ['Free food items per fan', CA.food, ''], ['Free NA drinks per fan (May normal high 83.6°F)', CA.na, ''],
    ['Fans buying alcohol', (CA.alcShare * 100) + '%', ''], ['Drinks per buyer', CA.alcPer, ''], ['Average drink price', '$' + CA.alcPrice, ''],
    ['Free units served', fmtK(A * (CA.food + CA.na)), 'tot'], ['Paid drinks', fmtK(alcN), 'tot'], ['Paid-beverage gross', money(alcN * CA.alcPrice), 'tot'],
  ].map(([a, b, c]) => `<tr class="${c}"><td>${a}</td><td class="n">${b}</td></tr>`).join('') + `<tr><td colspan="2" class="note" style="border:0">Attendance: "upward of 200,000" ${src('sbj')}. Weather ${src('nws')}. The 2026 caterer was Delaware North's Patina Group ${src('dnp')}. Frisco's caterer has not been confirmed.</td></tr>`;
  $('#bevList').innerHTML = sponsors.filter(x => x.cat === 'Beverage').map(x => `<li><span>${esc(x.n)}<small>${esc(x.tier)} · ${src(x.s)}</small></span></li>`).join('') + `<li><span>Caterer<small>2026: Delaware North's Patina Group ${src('dnp')}</small></span><b><span class="pill tba">Frisco TBA</span></b></li>`;
}
const stands = ['18th green pavilion', 'PGA District', 'Main entrance', '17 green', '8 green deck', '1st tee', 'The PGA Shops'];
function concLive() {
  const load = st.mode === 'sim' ? onGrounds(st.simMin) / (att[SAT] * .86) : .9;
  $('#waits').innerHTML = stands.map((n, i) => { const w = Math.max(.5, load * (3 + (i % 3) * 1.6) * jitter(.18)); return `<div class="b ${w > 6 ? 'hot' : ''}"><span>${n}</span><div><i style="width:${Math.min(100, w / 10 * 100)}%"></i></div><b>${w.toFixed(1)}m</b></div>`; }).join('');
  const day = st.mode === 'sim' ? arrivedFrac(st.simMin) * Math.min(1, prog() * 1.3) : 1, a = att[SAT];
  $('#concLive').innerHTML = [['Food served', fmtK(a * CA.food * day)], ['NA drinks', fmtK(a * CA.na * day)], ['Paid drinks', fmtK(a * CA.alcShare * CA.alcPer * day)], ['Paid gross', money(a * CA.alcShare * CA.alcPer * CA.alcPrice * day)]].map(([l, v]) => `<div><span>${l}</span><b>${v}</b></div>`).join('') + `<p class="note" style="grid-column:1/-1;margin:0">${st.mode === 'sim' ? 'Saturday so far · simulated.' : 'Simulated full Saturday.'}</p>`;
}

/* ---------- itineraries ---------- */
const stopsList = [['PGA District', 1], ['18th green', .86], ['Choctaw Ice House', .62], ['The PGA Shops', .74], ['17th green', .58], ['Omni PGA Frisco', .4], ['1st tee', .45], ['8 green deck', .33]];
const locs = ['Main entrance', 'PGA District', '18 green', '17 green', 'Choctaw Ice House', 'Wanamaker Club', 'The PGA Shops', '8 green deck', 'Omni PGA Frisco', '1st tee'];
const names = ['Alex M.', 'Priya S.', 'Jordan K.', 'Sam R.', 'Taylor D.', 'Chris P.', 'Morgan L.', 'Jamie V.', 'Dana W.', 'Riley T.', 'Casey N.', 'Avery B.'];
function itineraries() {
  const ctx = $('#chPlans').getContext('2d');
  charts.plans = new Chart(ctx, { type: 'bar', data: { labels: tixDays.map(d => d[0]), datasets: [{ data: att.map(a => a * .38), backgroundColor: grad(ctx, C.cyan, C.purple), borderRadius: 6 }] }, options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => fmt(c.raw) + ' plans (simulated)' } } }, scales: { y: { ticks: { callback: v => fmtK(v) } }, x: { grid: { display: false } } } } });
}
function stopsUpd() { const f = st.mode === 'sim' ? .6 + prog() * .4 : 1; $('#stops').innerHTML = stopsList.map(([n, w]) => `<div class="b"><span>${n}</span><div><i style="width:${w * 100 * f}%"></i></div><b>${fmtK(w * 41000 * f * jitter(.02))}</b></div>`).join(''); }
function addCheckin() {
  const li = document.createElement('li');
  const t = st.mode === 'sim' ? $('#clock').textContent : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  li.innerHTML = `<time>${t}</time><span><b>${names[Math.floor(Math.random() * names.length)]}</b> · ${locs[Math.floor(Math.random() * locs.length)]}</span>`;
  const s = $('#stream'); s.prepend(li); while (s.children.length > 9) s.lastChild.remove();
}

/* ---------- social ---------- */
function social() {
  const n = { pos: 0, mix: 0, neg: 0 }; mentions.forEach(m => n[m.st]++);
  const ctx = $('#chSent').getContext('2d');
  charts.sent = new Chart(ctx, { type: 'doughnut', data: { labels: ['Positive', 'Mixed', 'Negative'], datasets: [{ data: [n.pos, n.mix, n.neg], backgroundColor: [C.green, C.amber, C.red], borderColor: '#141236', borderWidth: 3 }] }, options: { cutout: '68%', plugins: { legend: { display: false } } } });
  $('#sentSplit').innerHTML = `<div><b style="color:#5fe0b0">${n.pos}</b>positive</div><div><b style="color:var(--amber)">${n.mix}</b>mixed</div><div><b style="color:#ff8e99">${n.neg}</b>negative</div><div><b>${mentions.length}</b>items</div>`;
  const grp = t => mentions.filter(m => t.includes(m.topic)), score = arr => Math.round(arr.reduce((a, m) => a + (m.st === 'pos' ? 1 : m.st === 'neg' ? -1 : 0), 0) / arr.length * 100);
  const biz = grp(['Demand', 'Community']), crs = grp(['Course', 'Venue']);
  $('#themes').innerHTML = `<div class="theme pos"><h4>Demand & community</h4><div class="score" style="color:#5fe0b0">${score(biz) > 0 ? '+' : ''}${score(biz)}</div><p>${biz.length} items on records, sellouts, jobs and the region's first men's major in 64 years. This is the sponsor-safe story to amplify.</p></div>
    <div class="theme neg"><h4>Course & venue</h4><div class="score" style="color:#ff8e99">${score(crs)}</div><p>${crs.length} items: player critique from the 2025 Women's PGA, McIlroy's quip and venue maturity. This is the risk narrative. Pace-of-play and setup news during the week will move it.</p></div>`;
  const lctx = $('#chSentLine').getContext('2d');
  charts.sentLine = new Chart(lctx, { type: 'line', data: { labels: hourCurve(h => (h > 12 ? h - 12 : h) + (h >= 12 ? 'p' : 'a')), datasets: [{ label: 'Net sentiment index (simulated)', data: sentData(), borderColor: C.pink, backgroundColor: vgrad(lctx, C.pink), fill: true, tension: .4, pointRadius: 0, borderWidth: 2 }] }, options: { plugins: { legend: { display: true, labels: { color: '#F5B83D' } } }, scales: { y: { min: 40, max: 80 }, x: { grid: { display: false } } } } });
  sentFilters(); mentionsList();
}
function sentData() { seed = 999; return hourCurve(h => st.mode === 'sim' && h * 60 > st.simMin ? null : 58 + Math.sin(h / 1.7) * 5 + (h > 14 ? 4 : 0) + rnd() * 3); }
function sentFilters() { $('#sentFilters').innerHTML = [['all', 'All'], ['pos', 'Positive'], ['mix', 'Mixed'], ['neg', 'Negative']].map(([k, l]) => `<button class="${st.sent === k ? 'on' : ''}" data-k="${k}">${l}</button>`).join(''); $$('#sentFilters button').forEach(b => b.onclick = () => { st.sent = b.dataset.k; sentFilters(); mentionsList(); }); }
function mentionsList() { $('#mentions').innerHTML = mentions.filter(m => st.sent === 'all' || m.st === st.sent).map(m => `<div class="m"><div class="mh"><a href="${S[m.src][1]}" target="_blank" rel="noopener">${S[m.src][0]} ↗</a><span class="st ${m.st}">${{ pos: 'Positive', mix: 'Mixed', neg: 'Negative' }[m.st]}</span></div><q>${esc(m.q)}</q><span class="tp">Topic: ${m.topic}</span></div>`).join(''); }

/* ---------- broadcast ---------- */
function broadcast() {
  $('#bcast').innerHTML = [
    ['Networks', 'CBS · Golf Channel · ESPN App · SiriusXM', 'sched'], ['Global reach', '~500M households · 170+ countries', 'vf'],
    ['Live coverage', '250+ hours', 'playeasy'], ['FedExCup points', '750 to the winner', 'sched'],
    ['Range Show model (2026)', 'YouTube and app, on T-Mobile 5G, produced from PGA Studios in Frisco', 'tmo'], ['Social output (2026)', '1,000+ unique pieces across X, Facebook, Instagram, TikTok and YouTube', 'digital'],
  ].map(([a, b, s]) => `<li><span>${a}<small>${src(s)}</small></span><b>${b}</b></li>`).join('');
  $('#local').innerHTML = [
    ['WFAA · ABC 8', 'Rory McIlroy takes a swipe at PGA Frisco', 'wfaaRory'], ['WFAA · ABC 8', 'Ticket registration opens for the historic return', 'wfaaReg'],
    ['NBC 5 DFW', 'Record demand reported for the 2027 PGA Championship', 'nbcDemand'], ['NBC 5 DFW', "'A lot at stake': behind the scenes on Frisco's prep", 'nbcStake'],
    ['CBS News Texas', 'Karen Borta with championship director Jason Mengel: a 64-year absence ends', 'cbstx'], ['Dallas Morning News', 'Ticket prices and options, and the Chase window', 'dmnTix'],
    ['Dallas Morning News', 'Fields Ranch East preparation in full swing', 'dmnPrep'], ['Community Impact', 'Demand nears sellout; 1,300+ temporary jobs', 'ci'], ['D Magazine', 'National golf writer slams Fields Ranch East', 'dmag'],
  ].map(([c, t, s]) => `<li><span class="call">${c}</span><a href="${S[s][1]}" target="_blank" rel="noopener">${t} ↗</a></li>`).join('');
  const types = { 'Local TV': ['wfaaRory', 'wfaaReg', 'nbcDemand', 'nbcStake', 'cbstx'], 'Local print & digital': ['dmn', 'dmnTix', 'dmnReg', 'dmnSched', 'dmnPrep', 'dmnBundle', 'ci', 'dmag'], 'National & trade': ['sbj', 'fos', 'golfweek', 'golfcom', 'friedegg', 'gm', 'gd'], 'Social & community': ['r1', 'r2', 'r3', 'r4', 'li', 'quad', 'cv'] };
  const ctx = $('#chSov').getContext('2d');
  charts.sov = new Chart(ctx, { type: 'polarArea', data: { labels: Object.keys(types), datasets: [{ data: Object.values(types).map(a => a.length), backgroundColor: ['rgba(232,76,154,.7)', 'rgba(240,122,42,.7)', 'rgba(79,209,232,.7)', 'rgba(139,92,246,.7)'], borderColor: '#141236' }] }, options: { plugins: { legend: { position: 'right' } }, scales: { r: { ticks: { display: false }, grid: { color: 'rgba(160,150,255,.12)' } } } } });
}

/* ---------- promotions ---------- */
function promosRender() {
  const f = weekFrac();
  $('#promoGrid').innerHTML = promos.map(p => {
    let val, lab;
    if (p.k === 'closed') { val = p.base ? fmt(p.base) + '+' : 'Closed'; lab = p.base ? p.unit + ' · real' : 'window closed'; }
    else if (st.mode !== 'sim') { val = '—'; lab = 'measured during championship week'; }
    else if (!p.base) { val = fmt((p.unit === 'birdies' ? 612 : 140) * f); lab = p.unit + ' · simulated'; }
    else { val = fmtK(p.base * f); lab = p.unit + ' · simulated week to date'; }
    const pill = p.k === 'closed' ? '<span class="pill tba">Closed</span>' : p.k === 'tba' ? '<span class="pill ltd">Frisco TBA</span>' : '<span class="pill open">Active</span>';
    return `<div class="promo${st.mode === 'sim' && p.k !== 'closed' ? ' is-sim' : ''}"><div class="ph"><span class="who">${esc(p.who)}</span>${pill}</div><h4>${esc(p.n)}</h4><p>${esc(p.d)}</p><div class="pf"><div><b>${val}</b><small>${lab}</small></div><div style="text-align:right"><small>${esc(p.when)}</small>${src(p.s)}</div></div></div>`;
  }).join('');
}

/* ---------- tournament ---------- */
function tournament() {
  $('#tFacts').innerHTML = [
    ['Championship', '109th PGA Championship', 'sbj'], ['Rounds', 'May 20–23, 2027 (week May 17–23)', 'sched'], ['Field', '156 players', 'field'],
    ['Defending champion', 'Aaron Rai, −9 at Aronimink', 'rai'], ['2026 purse', '$20.5M · $3.69M winner (2027 TBA)', 'notes'],
    ['Course', 'Fields Ranch East · Gil Hanse · nines swapped for 2027', 'swap'], ['History', 'First Texas major since 1969; first in DFW since 1963', 'sbj'],
  ].map(([a, b, s]) => `<li><span>${a}<small>${src(s)}</small></span><b>${b}</b></li>`).join('');
  const ctx = $('#chOdds').getContext('2d');
  charts.odds = new Chart(ctx, { type: 'bar', data: { labels: odds.map(o => o[0] + '  ' + o[1]), datasets: [{ data: odds.map(o => o[2]), backgroundColor: grad(ctx, C.purple, C.pink), borderRadius: 5 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => c.raw + '% implied' } } }, scales: { x: { ticks: { callback: v => v + '%' } }, y: { grid: { display: false } } } } });
  $('#lb26').innerHTML = `<tr><th>Pos</th><th>Player</th><th>Rounds</th><th style="text-align:right">Total</th></tr>` + lb26.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td style="font-family:var(--mono);font-size:12px">${r[2]}</td><td class="n">${r[3]}</td></tr>`).join('');
  const H = window.PGA.course.holes, pc = { 3: C.cyan, 4: C.purple, 5: C.pink };
  const hctx = $('#chHoles').getContext('2d');
  charts.holes = new Chart(hctx, { type: 'bar', data: { labels: H.map(h => h.n), datasets: [{ label: 'Yards', data: H.map(h => h.yds), backgroundColor: H.map(h => pc[h.par] + 'cc'), borderRadius: 4 }] },
    options: { plugins: { legend: { display: false }, tooltip: { callbacks: { title: c => 'Hole ' + H[c[0].dataIndex].n + ' · par ' + H[c[0].dataIndex].par, label: c => c.raw + ' yards · daily-play No. ' + H[c.dataIndex].daily } } }, scales: { y: { min: 0, ticks: { callback: v => v + ' yd' } }, x: { grid: { display: false }, title: { display: true, text: 'Hole (2027 order) · cyan par 3 · purple par 4 · pink par 5', color: '#7a76a0' } } } } });
  const sctx = $('#chHolesSim').getContext('2d');
  charts.holesSim = new Chart(sctx, { type: 'bar', data: { labels: H.map(h => h.n), datasets: [{ label: 'Fans at hole (simulated)', data: holesData(), backgroundColor: H.map(h => [9, 17, 18].includes(h.n) ? 'rgba(245,184,61,.85)' : 'rgba(245,184,61,.45)'), borderRadius: 4 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: v => fmtK(v) } }, x: { grid: { display: false } } } } });
}
function holesData() { const og = st.mode === 'sim' ? onGrounds(st.simMin) : att[SAT] * .7; seed = 55; return Array.from({ length: 18 }, (_, i) => og * (.03 + rnd() * .03 + ([9, 17, 18].includes(i + 1) ? .05 : 0) + (i === 0 ? .02 : 0)) * (st.mode === 'sim' ? jitter(.05) : 1)); }

/* ---------- Frisco ---------- */
function frisco() {
  $('#fKpis').innerHTML = [
    ['Population', '249,779', 'city estimate', 'city', C.cyan], ['Households', '87,651', 'Jan 1, 2026', 'glance', C.pink], ['Median HH income', '$157,839', '2026 estimate', 'retail', C.orange],
    ['Hotels · restaurants', '29 · 400+', 'Frisco', 'vfp', C.purple], ['Temporary jobs', '1,300+', 'championship', 'ci', C.green], ['Private jets', '400+', 'into DFW', 'dmn', C.amber],
  ].map(([l, v, s, k, acc]) => `<div class="kpi real" style="--acc:${acc}"><i class="k-tag"></i><span>${l}</span><b>${v}</b><em>${s} · ${src(k)}</em></div>`).join('');
  const labels = []; for (let d = 10; d <= 30; d++) labels.push('May ' + d);
  const lift = d => d >= 17 && d <= 23 ? 1 : d >= 14 && d < 17 ? .35 : d > 23 && d <= 25 ? .25 : 0;
  seed = 3; const mk = (amp) => labels.map((_, i) => 100 + lift(10 + i) * amp * (.85 + rnd() * .3) + rnd() * 4);
  const ctx = $('#chLocal').getContext('2d');
  charts.local = new Chart(ctx, { type: 'line', data: { labels, datasets: [
    { label: 'Hotel demand', data: mk(120), borderColor: C.pink, tension: .35, pointRadius: 0, borderWidth: 2.5 },
    { label: 'Restaurant traffic', data: mk(65), borderColor: C.cyan, tension: .35, pointRadius: 0, borderWidth: 2.5 },
    { label: 'Rideshare trips', data: mk(170), borderColor: C.orange, tension: .35, pointRadius: 0, borderWidth: 2.5 },
    { label: 'Retail spend', data: mk(40), borderColor: C.purple, tension: .35, pointRadius: 0, borderWidth: 2.5 }] },
    options: { interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'bottom' }, title: { display: true, text: 'Index · normal May week = 100 · championship week May 17–23 (simulated lift)', color: '#7a76a0' } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } } } } });
  $('#wx').innerHTML = [['Normal May high', '83.6°F', 'nws'], ['Normal May rainfall', '4.78 in', 'nws'], ['May 2026: days at 90°F+', '9 (normal 6.9)', 'nwsMay'], ['May 2026 avg high', '84.7°F', 'nwsMay'], ['Wind', 'Golfers report 25–30 mph days', 'r1']].map(([a, b, s]) => `<li><span>${a}<small>${src(s)}</small></span><b>${b}</b></li>`).join('');
  $('#demo').innerHTML = [['Median age', '39.4', 'glance'], ['Owner-occupied homes', '63.7%', 'glance'], ['Asian · White · Black', '33.6% · 45.5% · 10.0%', 'glance'], ['Hispanic (any race)', '10.4%', 'glance'], ['Graduate degree', '28.2%', 'retail']].map(([a, b, s]) => `<li><span>${a}<small>${src(s)}</small></span><b>${b}</b></li>`).join('');
  corr();
}
function mob() {
  const q = st.mode === 'sim' ? Math.round(onGrounds(st.simMin) / 900 * jitter(.1)) : null;
  $('#mob').innerHTML = [['DFW & Love Field', '~25 minutes', 'vfp'], ['Parking', 'Toyota Stadium lots + shuttles · plan TBA', 'dmn'], ['Rideshare', 'In talks with Uber and Lyft', 'dmn']].map(([a, b, s]) => `<li><span>${a}<small>${src(s)}</small></span><b>${b}</b></li>`).join('') +
    (q === null ? '' : `<li class="simrow"><span>Rideshare queue now<small class="t-sim">Simulated · not real data</small></span><b>${q} min</b></li><li class="simrow"><span>Shuttle loop<small class="t-sim">Simulated · not real data</small></span><b>${Math.round(9 + q / 4)} min</b></li>`);
}
function corr() { $('#corr').innerHTML = [['May 2027', 'CJ Cup Byron Nelson (McKinney) → PGA Championship → Charles Schwab Challenge (Colonial)', 'dmnSched'], ['Footprint', 'Three tournaments in five weeks; Colonial about 50 miles southwest, the week after', 'dmnSched'], ['Return', 'PGA Championship back at Frisco in 2034', 'fos']].map(([a, b, s]) => `<li><span>${a}<small>${src(s)}</small></span><b style="max-width:62%">${b}</b></li>`).join(''); }

/* ---------- proof ---------- */
function proof() {
  $('#proofGrid').innerHTML = [
    ['Own the fan · AI guide', '+300%', 'Activations claimed for real-time, itinerary-driven moments. Measured live in the itinerary and promotions panels.', '#itineraries', 'Company-reported'],
    ['Engage · every fan, no download', '88%', 'of 93 beta visitors opened the map at The Concession (Senior PGA, April 2026), with about 3x longer sessions. The guide panels show the same behavior at championship scale.', '#itineraries', 'Company-reported'],
    ['Measure · proof, not reach', '87,860', 'Personalization surfaces served at SEAT 2026 in Charlotte (14,697 pageviews, 643 uniques). Each surface becomes a ledger row per sponsor.', '#sponsors', 'Company-reported'],
    ['Transact · lower acquisition cost', '$8.86', 'Cost per acquisition for the VIP Play sportsbook campaign, against a $350–900 baseline. Redemptions per promotion are tracked the same way.', '#promos', 'Company-reported'],
    ['Event Outcome Ledger', `${sponsors.length}`, 'Real partners, each with exposure, behavior, sentiment and redemptions on one ledger: the deck\'s "proof for every event and sponsor."', '#sponsors', 'Real partner list'],
    ['Local Knowledge Graph', '200K+', 'Attendees expected, with a before-and-after local data signal. The Frisco panel joins city, weather, mobility and hospitality baselines.', '#frisco', 'Real baseline'],
    ['Real-time marketing', '~500M', 'Households reached by the broadcast. Odds, sentiment and media signals join on-site behavior for sponsor timing.', '#broadcast', 'Real'],
    ['Win the sponsor', '10 mo.', 'Ahead of first tee, Frisco had set the gross revenue record. Demand is proven, so sponsors will ask for proof of outcomes. That is what this ledger is for.', '#tickets', 'Real'],
  ].map(([c, v, p, h, k]) => `<div class="pr"><span class="claim">${c}</span><b class="v">${v}</b><p>${p}</p><div style="display:flex;justify-content:space-between;align-items:center"><span class="tag ${k.startsWith('Company') ? 'co' : 'real'}">${k}</span><a class="go" href="${h}">See panel →</a></div></div>`).join('');
  const ctx = $('#chPrice').getContext('2d');
  charts.price = new Chart(ctx, { type: 'bar', data: { labels: ['Google', 'Foursquare', 'Mapbox'], datasets: [{ data: [[7, 40], [9, 36], [1, 3]], backgroundColor: [C.pink, C.orange, C.cyan], borderRadius: 6, borderSkipped: false }] }, options: { indexAxis: 'y', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => '$' + c.raw[0] + '–' + c.raw[1] + ' per 1,000 calls' } } }, scales: { x: { min: 0, max: 45, ticks: { callback: v => '$' + v } }, y: { grid: { display: false } } } } });
}

/* ---------- mode + loop ---------- */
function refreshLive() {
  kpis(); tickClock(); spGrid(); spCharts(); gateUpd(); occUpd(); concLive(); stopsUpd(); promosRender(); mob();
  charts.sentLine.data.datasets[0].data = sentData(); charts.sentLine.update('none');
  charts.holesSim.data.datasets[0].data = holesData(); charts.holesSim.update('none');
}
function setMode(m) {
  st.mode = m; document.body.classList.toggle('m-sim', m === 'sim'); document.body.classList.toggle('m-real', m !== 'sim');
  $$('.mode button').forEach(b => { const on = b.dataset.mode === m; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  if (m === 'sim') { st.simMin = 11 * 60; st.checkins = Math.round(att[SAT] * arrivedFrac(st.simMin) * .62); }
  heroLede(); ticker(); refreshLive(); spDetail();
}
$$('.mode button').forEach(b => b.onclick = () => setMode(b.dataset.mode));

// jump-nav highlight
const secs = $$('main section[id]');
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.jump a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
secs.forEach(s => io.observe(s));

// simulated-panel placeholders and banners
$$('.card[data-sim]').forEach(c => {
  const h = c.querySelector('.card-h');
  h.insertAdjacentHTML('afterend', `<div class="simban">Simulated · generated in your browser · not real data</div><div class="simph"><p>No real data yet. This panel will show ${c.dataset.what} once championship week starts.</p><button class="btn-sim" data-go-sim>See the simulated preview</button></div>`);
});
$$('[data-go-sim]').forEach(b => b.onclick = () => { setMode('sim'); });
document.body.classList.add('m-real');
// init
heroLede(); kpis(); ticker(); tickClock(); spFilters(); spGrid(); spDetail(); spCharts();
tickets(); gateUpd(); hospitality(); occUpd(); concessions(); concLive(); itineraries(); stopsUpd();
for (let i = 0; i < 8; i++) addCheckin();
social(); broadcast(); promosRender(); tournament(); frisco(); mob(); proof();

let n = 0;
setInterval(() => {
  n++;
  if (st.mode === 'sim') { st.simMin += 1; if (st.simMin > DAY1) st.simMin = DAY0 + 30; st.checkins += Math.round(onGrounds(st.simMin) / 900 * jitter(.3)); }
  tickClock();
  if (n % 2 === 0) { refreshLive(); if (st.mode === 'sim' && n % 6 === 0) spDetail(); }
  if (Math.random() < (st.mode === 'sim' ? .7 : .25)) addCheckin();
  if (st.mode === 'sim' && n % 20 === 0) ticker();
}, 1000);
})();
