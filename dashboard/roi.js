(() => {
const { S } = window.D, M = window.ROIM, R = M.RATE;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = n => Math.round(n).toLocaleString('en-US');
const fmtK = n => n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e4 ? (n / 1e3).toFixed(1) + 'K' : fmt(n);
const money = n => (n < 0 ? '−' : '') + '$' + fmt(Math.abs(n));
const xr = r => (1 + r).toFixed(2) + 'x';
const band = e => e >= 80 ? ['Strong', 'b-s'] : e >= 65 ? ['Solid', 'b-o'] : e >= 50 ? ['Watch', 'b-w'] : ['Underperforming', 'b-u'];
const q = new URLSearchParams(location.search);
const st = { s: q.get('s') || 'T-Mobile', mode: q.get('mode') === 'sim' ? 'sim' : 'real', all: q.get('all') === '1' };
const N = M.rows.length;
const avg = k => M.rows.reduce((a, r) => a + r[k], 0) / N;
const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

function gauge(v, sim) {
  const L = 2 * Math.PI * 46, off = sim ? L * (1 - v / 100) : L;
  return `<svg viewBox="0 0 110 110" class="gauge"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#E84C9A"/><stop offset="1" stop-color="#F07A2A"/></linearGradient></defs>
    <circle cx="55" cy="55" r="46" fill="none" stroke="#ece9f6" stroke-width="10"/>
    <circle cx="55" cy="55" r="46" fill="none" stroke="url(#gg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${off}" transform="rotate(-90 55 55)"/>
    <text x="55" y="58" text-anchor="middle" class="g-n">${sim ? v : '—'}</text><text x="55" y="76" text-anchor="middle" class="g-l">EOS</text></svg>`;
}
function scatter(sel, sim) {
  const W = 340, H = 130, P = { l: 30, r: 8, t: 6, b: 24 };
  const xs = M.rows.map(r => r.eos), ys = M.rows.map(r => 1 + r.roi);
  const x0 = Math.floor(Math.min(...xs) / 10) * 10, x1 = Math.ceil(Math.max(...xs) / 10) * 10, y1 = Math.ceil(Math.max(...ys));
  const X = v => P.l + (v - x0) / (x1 - x0) * (W - P.l - P.r), Y = v => H - P.b - v / y1 * (H - P.t - P.b);
  let g = '';
  for (let v = x0; v <= x1; v += 10) g += `<line x1="${X(v)}" x2="${X(v)}" y1="${P.t}" y2="${H - P.b}" class="gl"/><text x="${X(v)}" y="${H - 10}" text-anchor="middle" class="ax">${v}</text>`;
  for (let v = 0; v <= y1; v++) g += `<line x1="${P.l}" x2="${W - P.r}" y1="${Y(v)}" y2="${Y(v)}" class="gl"/><text x="${P.l - 5}" y="${Y(v) + 3}" text-anchor="end" class="ax">${v}x</text>`;
  if (!sim) return `<svg viewBox="0 0 ${W} ${H}" class="sc">${g}<text x="${(W + P.l) / 2}" y="${H / 2}" text-anchor="middle" class="ph">Plotted once championship-week data exists</text></svg>`;
  const fit = `<line x1="${X(x0)}" y1="${Y(1 + M.icpt + M.slope * x0)}" x2="${X(x1)}" y2="${Y(1 + M.icpt + M.slope * x1)}" class="fit"/>`;
  const dots = M.rows.map(r => r.s.n === sel.s.n ? '' : `<circle cx="${X(r.eos)}" cy="${Y(1 + r.roi)}" r="3.2" class="dot"/>`).join('');
  const me = `<circle cx="${X(sel.eos)}" cy="${Y(1 + sel.roi)}" r="6.5" class="me"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="sc">${g}${fit}${dots}${me}<text x="${(W + P.l) / 2}" y="${H - 0}" text-anchor="middle" class="ax">Event Outcome Score</text></svg>`;
}
function page(r) {
  const sim = st.mode === 'sim', s = r.s, [bl, bc] = band(r.eos), v = x => sim ? x : '—';
  const srcA = S[s.s] ? `<a href="${S[s.s][1]}">${esc(S[s.s][0])}</a> · ${esc(S[s.s][1])}` : '';
  const comp = [['Exposure', 'Impressions', r.exp, r.c.exp, .30, '#4FD1E8'], ['Behavior', 'Visits, dwell, taps', r.beh, r.c.beh, .25, '#8B5CF6'], ['Sentiment', 'Net score / 100', r.sent, r.c.sent, .15, '#22C08A'], ['Redemptions', 'Offers claimed', r.red, r.c.red, .30, '#E84C9A']];
  const val = [['Activation investment', r.inv, 'Illustrative championship-week activation spend (not the rights fee)'], ['Media value', r.media, `Impressions × $${R.cpm} CPM`], ['Engagement value', r.eng, `Behaviors × $${R.beh.toFixed(2)}`], ['Redemption margin', r.rev, `Redemptions × $${R.aov} order × ${R.margin * 100}%`]];
  return `<section class="pg ${sim ? 'is-sim' : 'is-real'}">
  <header class="ph-h"><div class="brand"><span class="logo"><i></i></span><div><b>EVENTPULSE<em>.AI</em></b><small>Sponsor ROI Summary · Event Outcome Ledger</small></div></div>
    <div class="evt">109th PGA Championship<br><span>Fields Ranch East · PGA Frisco · May 17–23, 2027</span></div></header>
  <div class="flag ${sim ? 'sim' : 'real'}">${sim ? 'Simulated preview · not real data · every performance figure on this page is generated to show the report format' : 'Real data only · performance figures are measured during championship week and are blank until then'}</div>
  <div class="who"><div><h1>${esc(s.n)}</h1><p>${esc(s.tier)} · ${esc(s.cat)}</p></div><div class="rank">${sim ? `<b>#${r.rank}</b><span>of ${N} partners</span>` : `<b>${N}</b><span>partners on the ledger</span>`}</div></div>
  <div class="act"><span class="k">Activation <em class="tag-real">Real · cited</em></span><p>${esc(s.act)}</p><p class="src">Source: ${srcA}</p></div>
  <div class="hero">
    ${gauge(r.eos, sim)}
    <div class="hx"><span class="k">ROI multiple · value ÷ investment</span><b class="big">${v(xr(r.roi))}</b>
      ${sim ? `<span class="band ${bc}">${bl}</span>` : '<span class="band b-n">Not measured yet</span>'}
      <p>${sim ? `Every $1 invested returned <b>$${(1 + r.roi).toFixed(2)}</b> in attributed value. Net ROI <b>${r.roi >= 0 ? '+' : ''}${Math.round(r.roi * 100)}%</b>, a net ${r.val >= r.inv ? 'gain' : 'loss'} of <b>${money(r.val - r.inv)}</b>.` : 'The score and ROI fill in from the ledger once fans use the guide during championship week.'}</p></div>
    <div class="kp">
      <div><span>Investment</span><b>${v(money(r.inv))}</b></div>
      <div><span>Attributed value</span><b>${v(money(r.val))}</b></div>
      <div><span>Field avg EOS</span><b>${v(Math.round(avg('eos')))}</b></div>
      <div><span>Field avg ROI</span><b>${v(xr(avg('roi')))}</b></div>
    </div>
  </div>
  <div class="two">
    <div><h2>Value breakdown</h2><table class="t"><tbody>
      ${val.map(([l, n, how], i) => `<tr${i === 0 ? ' class="inv"' : ''}><td>${l}<small>${how}</small></td><td class="n">${v(money(n))}</td></tr>`).join('')}
      <tr class="tot"><td>Attributed value</td><td class="n">${v(money(r.val))}</td></tr>
      <tr class="net"><td>Net return</td><td class="n">${v(money(r.val - r.inv))}</td></tr></tbody></table></div>
    <div><h2>Event Outcome Score · how it adds up</h2><table class="t sc-t"><thead><tr><th>Measure</th><th class="n">Result</th><th class="n">Score</th><th class="n">Weight</th><th class="n">Points</th></tr></thead><tbody>
      ${comp.map(([l, d, raw, scv, w, c]) => `<tr><td><i style="background:${c}"></i>${l}<small>${d}</small></td><td class="n">${sim ? (l === 'Sentiment' ? Math.round(raw) : fmtK(raw)) : '—'}</td><td class="n">${v(Math.round(scv))}</td><td class="n">${w * 100}%</td><td class="n">${v((scv * w).toFixed(1))}</td></tr>`).join('')}
      <tr class="tot"><td>Event Outcome Score</td><td></td><td></td><td class="n">100%</td><td class="n">${v(r.eos)}</td></tr></tbody></table>
      <p class="fine">Exposure, behavior and redemptions are scored per dollar invested and scaled from 30 (weakest in the field) to 100 (strongest). Bands: 80+ Strong · 65–79 Solid · 50–64 Watch · below 50 Underperforming.</p></div>
  </div>
  <div class="two b">
    <div><h2>Score vs ROI · position in the field</h2>${scatter(r, sim)}<p class="fine">${sim ? `Simulated. Highlighted dot is ${esc(s.n)}; dashed line is the fit across all ${N} partners (r = ${M.corr.toFixed(2)}). The real correlation will be reported from championship-week data.` : 'Each partner\'s score plotted against its ROI, with the correlation between them.'}</p></div>
    <div><h2>Method & assumptions</h2><ul class="m">
      <li><b>ROI</b> = (Attributed value − Investment) ÷ Investment.</li>
      <li><b>Attributed value</b> = media value + engagement value + redemption margin, counted only where the EventPulse ledger ties a fan action to the sponsor.</li>
      <li><b>Rates</b> ($${R.cpm} CPM, $${R.beh.toFixed(2)} per behavior, $${R.aov} order at ${R.margin * 100}% margin) are EventPulse working assumptions to be agreed with each sponsor before championship week.</li>
      <li><b>Investment</b> is the activation spend the sponsor reports to the ledger. Rights fees are not public and are not used.</li>
    </ul></div>
  </div>
  <footer class="pf"><span>A FuzeBox EventPulse demonstration. Not affiliated with or endorsed by the PGA of America, the PGA Championship, PGA Frisco or ${esc(s.n)}. Partner names: ${esc(S.cf[0])}, ${esc(S.cf[1])}</span><span>${today}</span></footer>
</section>`;
}
function render() {
  const rows = st.all ? M.rows : [M.rows.find(r => r.s.n === st.s) || M.rows[0]];
  $('#pages').innerHTML = rows.map(page).join('');
  $$('#mode button').forEach(b => b.classList.toggle('on', b.dataset.m === st.mode));
  $('#pick').value = st.s; $('#pick').disabled = st.all; $('#all').checked = st.all;
  document.title = `${st.all ? 'All sponsors' : st.s} · Sponsor ROI Summary · EventPulse`;
  const u = new URLSearchParams({ s: st.s, mode: st.mode }); if (st.all) u.set('all', '1'); history.replaceState(null, '', '?' + u);
}
function $$(s) { return [...document.querySelectorAll(s)]; }
$('#pick').innerHTML = M.rows.slice().sort((a, b) => a.s.n.localeCompare(b.s.n)).map(r => `<option>${esc(r.s.n)}</option>`).join('');
$('#pick').onchange = e => { st.s = e.target.value; render(); };
$$('#mode button').forEach(b => b.onclick = () => { st.mode = b.dataset.m; render(); });
$('#all').onchange = e => { st.all = e.target.checked; render(); };
$('#print').onclick = () => window.print();
render();
if (q.get('print') === '1') setTimeout(() => window.print(), 600);
})();
