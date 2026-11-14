/* EventPulse ROI model (SIMULATED). Shared by the dashboard and the printable one-pagers. */
(() => {
const { sponsors } = window.D;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
sponsors.forEach((s, i) => { if (s.r === undefined) { seed = 101 + i * 37; s.r = .85 + rnd() * .3; s.sentBase = Math.round(58 + s.w * 18 + rnd() * 8); } });
const RATE = { cpm: 28, beh: 1.1, aov: 42, margin: .6 };
window.ROIM = (() => {
  const rows = sponsors.map((s, i) => { seed = 500 + i * 53;
    const inv = Math.round(s.w * 400000 * (.55 + rnd() * 1.05) / 5000) * 5000;
    const q = .6 + rnd() * .8;
    const exp = s.w * s.r * 2.4e6 * (.75 + rnd() * .5), beh = exp * (.024 + s.w * .01) * q, red = beh * (.12 + s.w * .04) * (.6 + rnd() * .8), sent = Math.min(94, Math.max(38, s.sentBase - 12 + rnd() * 26));
    const media = exp / 1000 * RATE.cpm, eng = beh * RATE.beh, rev = red * RATE.aov * RATE.margin, val = media + eng + rev;
    return { s, inv, exp, beh, red, sent, media, eng, rev, val, roi: (val - inv) / inv };
  });
  const per = k => rows.map(r => r[k] / r.inv), rng = a => [Math.min(...a), Math.max(...a)];
  const R = { exp: rng(per('exp')), beh: rng(per('beh')), red: rng(per('red')) };
  const sc = (v, [lo, hi]) => 30 + 70 * (v - lo) / (hi - lo);
  rows.forEach(r => { r.c = { exp: sc(r.exp / r.inv, R.exp), beh: sc(r.beh / r.inv, R.beh), sent: r.sent, red: sc(r.red / r.inv, R.red) };
    r.eos = Math.round(.30 * r.c.exp + .25 * r.c.beh + .15 * r.c.sent + .30 * r.c.red); });
  rows.sort((a, b) => b.eos - a.eos).forEach((r, i) => r.rank = i + 1);
  const n = rows.length, mxs = rows.reduce((a, r) => a + r.eos, 0) / n, my = rows.reduce((a, r) => a + r.roi, 0) / n;
  const cov = rows.reduce((a, r) => a + (r.eos - mxs) * (r.roi - my), 0), vx = rows.reduce((a, r) => a + (r.eos - mxs) ** 2, 0), vy = rows.reduce((a, r) => a + (r.roi - my) ** 2, 0);
  const slope = cov / vx, icpt = my - slope * mxs, corr = cov / Math.sqrt(vx * vy);
  return { rows, slope, icpt, corr, RATE };
})();
})();
