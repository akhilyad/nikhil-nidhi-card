/* ═══════════════════════ EDIT ME ═══════════════════════ */
/* Which page is this? Set per page by data-side on <html>: "groom" or "bride" */
const SIDE = document.documentElement.dataset.side === 'bride' ? 'bride' : 'groom';
/* data-variant="muhurtam": the 10 December Muhurtham only. No 9th, no 15th, no RSVP. */
const MUHURTAM = document.documentElement.dataset.variant === 'muhurtam';

const CONFIG = {
  /* Google Apps Script web-app URL (ends in /exec). RSVPs are saved to the Google Sheet through it. */
  sheetUrl: "https://script.google.com/macros/s/AKfycbxmXzE0JZOAgvmwmuf1WXQr3qhHnvqifIFcy5EojUfwBjXreb-v3nZ7-98rF-NW5Cyz/exec",

  /* Shown on the RSVP card only when filled in. rsvpBy e.g. "15 November 2026"; contact: who guests can call or WhatsApp. */
  rsvpBy: "15 November 2026",
  contact: { name: "", phone: "" },

  /* Parents' names: fill these in. The page names the family of the side it is on first. */
  bride: { name: "Nidhi",  role: "daughter", parents: "Shri. Ravi Kulkarni & Smt. Ruchi Kulkarni" },
  groom: { name: "Nikhil", role: "son",      parents: "Shri. Satyanarayan Yadav & Smt. Jayashree Yadav",
           /* grandparents shown on the groom's link only: father's parents on the left, mother's parents on the right */
           grand: { left: [["Shri. Ramau Yadav", true], ["Smt. Barki Yadav", false]], right: [["Shri. Jawaharlal Yadav", true], ["Smt. Kamala Yadav", true]] } },

  /* Venues. mapsUrl opens Google Maps and is also what the QR code contains. */
  venues: [
    { city: "Bangalore", dates: "9 & 10 December 2026", for: "The festivities",
      name: "Fiestaa Resort n Events Venue",
      address: ["Bagalur, Bengaluru", "Karnataka"],
      mapsUrl: "https://www.google.com/maps?cid=12798184235780506858",
      embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.0363794978944!2d77.67787641052621!3d13.160105310664196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1c73badc4e39%3A0xb19c48c137b384ea!2sFiestaa%20Resort%20n%20Events%20Venue!5e0!3m2!1sen!2sde!4v1792859748342!5m2!1sen!2sde",
      slots: [ { d: 0, start: "2026-12-09T15:00", end: "2026-12-09T21:30" }, { d: 1, start: "2026-12-10T08:00", end: "2026-12-10T14:00" } ] },
    { city: "Lucknow", dates: "15 December 2026", for: "The reception",
      name: "Holiday Inn Lucknow Airport by IHG",
      address: ["Lucknow", "Uttar Pradesh"],
      mapsUrl: "https://www.google.com/maps?cid=13710636333168957859",
      embed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3562.002957279641!2d80.8786242108341!3d26.776175665848097!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bf97b25c750d7%3A0xbe45f71a5b1999a3!2sHoliday%20Inn%20Lucknow%20Airport%20by%20IHG!5e0!3m2!1sen!2sde!4v1792859641949!5m2!1sen!2sde",
      slots: [ { d: 2, start: "2026-12-15T18:00", end: "2026-12-15T22:00" } ] }
  ]
};

/* Events: one list feeds the timeline, the celebration cards and the RSVP tick-boxes (key:1 events only). Timings from the family itinerary. time:null shows a [time] placeholder. */
const DAYS = [
  { n: "Day One", date: "9 December", dow: "Wednesday", city: "Bangalore", events: [
    { time: "3:00 PM",          title: "Haldi Ceremony",                  line: "The turmeric ceremony with family", key: 1 },
    { time: "5:00 PM",          title: "Var Pooja, Tilak & Engagement",   line: "Blessings, rituals and the exchange of rings", key: 1 },
    { time: "6:00 PM",          title: "Baraat",                          line: "The procession arrives with music and dance", key: 1 },
    { time: "6:30 PM",          title: "Sangeet",                         line: "An evening of music, dance and joy", key: 1 },
    { time: "7:30 – 9:00 PM",   title: "Dinner",                          line: "Dinner for all our guests", key: 1 }
  ]},
  { n: "Day Two", date: "10 December", dow: "Thursday", city: "Bangalore", events: [
    { time: "8:45 AM",          title: "Muhurtham",                       line: "Sacred vows and traditional ceremonies until 11:00 AM", key: 1 },
    { time: "11:00 AM",         title: "Reception & Lunch",               line: "Meet the bride and groom; lunch is served alongside", key: 1 }
  ]},
  { n: "Day Three", date: "15 December", dow: "Tuesday", city: "Lucknow", events: [
    { time: "6:00 PM onwards", title: "Reception", line: "Join us in Lucknow to celebrate with the couple", key: 1 }
  ]}
];
if (MUHURTAM){
  DAYS.splice(2, 1); DAYS.splice(0, 1);   /* keep Day Two only */
  DAYS[0].n = 'Wedding Day';
  CONFIG.venues = CONFIG.venues.filter(v => v.city === 'Bangalore');
  Object.assign(CONFIG.venues[0], { dates: '10 December 2026', for: 'The Muhurtham', slots: [ { d: 0, start: '2026-12-10T08:00', end: '2026-12-10T14:00' } ] });
}
/* ═══════════════════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const FIRST = CONFIG[SIDE], SECOND = CONFIG[SIDE === 'groom' ? 'bride' : 'groom'];
const NAMES = FIRST.name + ' & ' + SECOND.name;
const PH = '<span class="ph">[time]</span>';
const slot = e => [e.when, e.time].filter(Boolean).join(' · ');   /* e.g. "Afternoon · 4:00 PM" */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
history.scrollRestoration = 'manual'; window.scrollTo(0, 0);
document.documentElement.classList.add('locked');

/* ── invitation text: this page's family first ── */
(function(){
  const g = CONFIG[SIDE].grand;
  if (g){
    /* grandparents: father's parents on the left, mother's parents on the right; rows line up */
    const cell = p => p ? `<p>${esc(p[0])}${p[1] ? ' <small>(Late)</small>' : ''}</p>` : '<p></p>';
    const n = Math.max(g.left.length, g.right.length);
    $('#grands').innerHTML = Array.from({ length: n }, (_, i) => cell(g.left[i]) + cell(g.right[i])).join('');
    $('#grands').hidden = false;
  }
  const known = s => s && !s.includes('[');   /* a name still in [brackets] is left out rather than shown as a placeholder */
  $('#inv').innerHTML =
    (known(FIRST.parents)
      ? `<p class="inv-parents">${esc(FIRST.parents)}</p>
         <p class="inv-small">request the pleasure of your company at the wedding of their ${FIRST.role}</p>`
      : `<p class="inv-small">You are warmly invited<br>to the wedding of</p>`) +
    `<p class="inv-name">${esc(FIRST.name)}</p>
     <p class="inv-small">with</p>
     <p class="inv-name">${esc(SECOND.name)}</p>` +
    (known(SECOND.parents) ? `<p class="inv-small">${SECOND.role} of</p><p class="inv-parents">${esc(SECOND.parents)}</p>` : '');
  document.querySelectorAll('#inv > p').forEach((p,i)=>{ p.classList.add('w'); p.style.transitionDelay = (i*140)+'ms'; });
})();

/* ── the river: stops ── */
let side = 0;
$('#stops').innerHTML = DAYS.map(d => `
  <li class="stop banner"><span class="dot"></span>
    <div class="banner-txt"><div class="n">${esc(d.n)}</div><div class="d">${esc(d.date)}</div><div class="c">${esc(d.dow)} · ${esc(d.city)}</div></div>
  </li>` + d.events.map(e => `
  <li class="stop ${side++ % 2 ? 'right' : 'left'} rise"><span class="dot"></span>
    <div class="ev-card${e.key ? ' key' : ''}"><span class="ev-time">${e.time ? esc(e.time) : PH}${e.time && e.when ? ' · ' + esc(e.when) : ''}</span><h3>${esc(e.title)}</h3>${e.line ? `<p>${esc(e.line)}</p>` : ''}</div>
  </li>`).join('')).join('');

$('#tbcNote').hidden = !DAYS.some(d => d.events.some(e => !e.time));

/* ── the river: path through every dot, drawn as you scroll ── */
const river = $('#river'), rsvg = $('#riverSvg');
const base = $('#riverBase'), flow = $('#riverFlow'), water = $('#riverWater'), bloom = $('#bloom');
let pts = [], dotEls = [], dotLen = [], total = 1, rH = 1;

function buildRiver(){
  const wr = river.getBoundingClientRect(), W = river.offsetWidth; rH = river.offsetHeight;
  dotEls = [...river.querySelectorAll('.dot')];
  const raw = dotEls.map(d => { const r = d.getBoundingClientRect(); return { x: r.left - wr.left + r.width/2, y: r.top - wr.top + r.height/2 }; });
  pts = [{ x: raw[0].x, y: 0 }, ...raw, { x: raw[raw.length-1].x, y: rH }];
  const A = W < 720 ? 14 : Math.min(54, W * .06);
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++){
    const p = pts[i], q = pts[i+1], dir = i % 2 ? 1 : -1, dy = q.y - p.y;
    d += ` C${p.x + dir*A} ${p.y + dy*.35} ${q.x + dir*A} ${q.y - dy*.35} ${q.x} ${q.y}`;
  }
  rsvg.setAttribute('viewBox', `0 0 ${W} ${rH}`); rsvg.style.height = rH + 'px';
  $('#rg').setAttribute('y2', rH);
  [base, flow, water].forEach(p => p.setAttribute('d', d));
  total = base.getTotalLength();
  flow.style.strokeDasharray = total;
  dotLen = raw.map(r => { let lo = 0, hi = total; for (let k = 0; k < 18; k++){ const m = (lo+hi)/2; base.getPointAtLength(m).y < r.y ? lo = m : hi = m; } return lo; });
  updateRiver();
}
function updateRiver(){
  const r = river.getBoundingClientRect(), vh = innerHeight;
  let p = reduce ? 1 : Math.min(1, Math.max(0, (vh * .6 - r.top) / r.height));
  const L = total * p;
  flow.style.strokeDashoffset = total - L;
  const pt = base.getPointAtLength(L);
  bloom.setAttribute('transform', `translate(${pt.x},${pt.y}) rotate(${p*220})`);
  bloom.style.opacity = p > 0 ? 1 : 0;
  dotEls.forEach((d,i) => d.classList.toggle('lit', L >= dotLen[i]));
}

/* ── venues: tap-through maps, embedded map, QR, calendar ── */
function qrSvg(text){
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount();
  let s = `<svg viewBox="0 0 ${n} ${n}" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" role="img" aria-label="QR code that opens the venue in Google Maps">`;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r,c)) s += `<rect x="${c}" y="${r}" width="1.02" height="1.02" rx=".16"/>`;
  return s + '</svg>';
}
const lampHTML = cls => `<div class="lamp ${cls}" aria-hidden="true"><div class="chain"></div><div class="body"><img src="../assets/lantern_sm.webp" alt="" loading="lazy"></div></div>`;
const venueDays = v => DAYS.filter(d => d.city === v.city);
const utc = s => new Date(s + ':00+05:30').toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');   /* times are India time */
const slotTitle = (v, sl) => `${NAMES} - ${DAYS[sl.d].date} (${v.city})`;
function slotDetails(v, sl){
  const d = DAYS[sl.d];
  const lines = d.events.filter(e => e.time).map(e => `${e.time}  ${e.title}`);
  return `${slotTitle(v, sl)}\n${d.dow} ${d.date}\n\n${lines.join('\n')}\n\nVenue: ${v.name}\nMap: ${v.mapsUrl}\n\nWith the blessings of our families.`;
}
function gcalUrl(v, sl){
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent(slotTitle(v, sl))
    + `&dates=${utc(sl.start)}/${utc(sl.end)}`
    + '&details=' + encodeURIComponent(slotDetails(v, sl))
    + '&location=' + encodeURIComponent(`${v.name}, ${v.address.join(', ')}`);
}
function icsText(t){ return String(t).replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n'); }
function icsFold(l){ const o = []; while (l.length > 73){ o.push(l.slice(0,73)); l = ' ' + l.slice(73); } o.push(l); return o.join('\r\n'); }
function buildICS(v, i){
  const stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
  const ev = v.slots.flatMap((sl, k) => [
    'BEGIN:VEVENT',
    `UID:wedding-2026-${i}-${k}@wedding-invite`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${utc(sl.start)}`,
    `DTEND:${utc(sl.end)}`,
    `SUMMARY:${icsText(slotTitle(v, sl))}`,
    `LOCATION:${icsText(`${v.name}, ${v.address.join(', ')}`)}`,
    `DESCRIPTION:${icsText(slotDetails(v, sl))}`,
    `URL:${v.mapsUrl}`,
    'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:Wedding celebrations tomorrow','END:VALARM',
    'END:VEVENT'
  ]);
  return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wedding Invite//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH', ...ev, 'END:VCALENDAR'].map(icsFold).join('\r\n') + '\r\n';
}
function downloadICS(i){
  const v = CONFIG.venues[i];
  const blob = new Blob([buildICS(v, i)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${NAMES.replace(/\s*&\s*/g,'-')}-${v.city}.ics`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
$('#venues').innerHTML = CONFIG.venues.map((v,i) => `
  <div class="venue-card rise" style="--i:${i}">
    ${lampHTML('a')}${lampHTML('b')}
    <div class="v-city">${esc(v.city)}</div>
    <div class="v-dates">${esc(v.dates)}</div>
    <div class="v-for">${esc(v.for)}</div>
    <h3 class="v-name"><a href="${v.mapsUrl}" target="_blank" rel="noopener">${esc(v.name)}</a></h3>
    <p class="v-addr"><a href="${v.mapsUrl}" target="_blank" rel="noopener">${v.address.map(esc).join('<br>')}</a></p>
    <div class="v-map"><button type="button" class="map-veil" aria-label="Tap to explore the map"><span>Tap to explore the map</span></button><iframe src="${v.embed}" title="Map of ${esc(v.name)}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    <a class="qr-wrap" href="${v.mapsUrl}" target="_blank" rel="noopener" aria-label="Open ${esc(v.name)} in Google Maps">${qrSvg(v.mapsUrl)}</a>
    <p class="qr-cap">Scan or tap to navigate</p>
    <div class="v-btns">
      <a class="btn" href="${v.mapsUrl}" target="_blank" rel="noopener">Open in Google Maps</a>
      <details class="cal">
        <summary class="btn">Add to calendar</summary>
        <div class="cal-opts">
          ${v.slots.map(sl => `<a class="btn sm" href="${gcalUrl(v, sl)}" target="_blank" rel="noopener">Google Calendar${v.slots.length > 1 ? ' · ' + esc(DAYS[sl.d].date) : ''}</a>`).join('')}
          <button type="button" class="btn sm" data-ics="${i}">Apple / Outlook (.ics)</button>
        </div>
      </details>
    </div>
  </div>`).join('');
$('#venues').addEventListener('click', e => {
  const mv = e.target.closest('.map-veil'); if (mv){ mv.remove(); return; }
  const b = e.target.closest('[data-ics]'); if (b) downloadICS(+b.dataset.ics);
});

/* ── 1. Door opening sequence ── */
const intro = $('#intro');
let opened = false;
function openInvite(){
  if (opened) return;
  opened = true;
  const frame = document.querySelector('.door-frame').getBoundingClientRect();
  intro.style.setProperty('--zoom', Math.max(1.3, innerHeight / frame.height * 1.02).toFixed(3));
  burstPetals();
  intro.classList.add('opening');
  setTimeout(() => document.body.classList.add('opened'), 900);
  setTimeout(() => {
    intro.style.display = 'none';
    document.body.classList.remove('locked');
    document.documentElement.classList.remove('locked');
    startPetals(); dockReady = true; updateDock();
    document.body.classList.add('cue-on');
  }, 2100);
}
$('#openBtn').addEventListener('click', e => { e.stopPropagation(); openInvite(); });
$('#doorStage').addEventListener('click', openInvite);
setTimeout(() => { if (!opened) $('#tapHint').classList.add('nudge'); }, 5000);

function burstPetals(){
  const rect = document.querySelector('.door-stack').getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height * .45;
  const colors = ['#dfa392','#e8b7ab','#e0932f','#caa76b','#e9a3b0'];
  for (let i = 0; i < 28; i++){
    const p = document.createElement('i');
    p.className = 'burst';
    const s = 7 + Math.random() * 10;
    p.style.cssText = `left:${cx}px;top:${cy}px;width:${s}px;height:${s}px;background:${colors[i % colors.length]}`;
    document.body.appendChild(p);
    const ang = Math.random() * Math.PI * 2, v = 90 + Math.random() * 190;
    const dx = Math.cos(ang) * v, dy = Math.sin(ang) * v - 70;
    p.animate([
      { transform:'translate(0,0) rotate(0deg)', opacity:1 },
      { transform:`translate(${dx}px,${dy + 220}px) rotate(${Math.random()*540}deg)`, opacity:0 }
    ], { duration: 1400 + Math.random() * 900, easing:'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => p.remove();
  }
}

/* ── 2. Continuous falling petals ── */
function makePetal(container){
  const p = document.createElement('div');
  p.className = 'petal';
  const s = 8 + Math.random() * 12;
  const colors = ['#dfa392','#eec3b8','#e0932f','#d8b788','#e9a3b0','#c97f6c'];
  p.style.left = Math.random() * 100 + 'vw';
  p.style.animationDuration = (3.4 + Math.random() * 3.2) + 's';
  p.style.animationDelay = -(Math.random() * 6) + 's';
  const i = document.createElement('i');
  i.style.width = s + 'px';
  i.style.height = s * .82 + 'px';
  i.style.background = colors[Math.floor(Math.random() * colors.length)];
  i.style.animationDuration = (7 + Math.random() * 7) + 's';
  i.style.animationDelay = p.style.animationDelay;
  p.appendChild(i);
  container.appendChild(p);
}
function startPetals(){
  if (reduce) return;
  const c = $('#petals');
  const n = innerWidth < 640 ? 6 : 10;
  for (let k = 0; k < n; k++) makePetal(c);
}

/* ── 4. Scroll reveals ── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.classList.contains('band')) e.target.classList.add('seen');
    io.unobserve(e.target);
  });
}, { threshold: .15 });
document.querySelectorAll('.reveal, .rise, .words, .band').forEach(el => io.observe(el));

/* ── 4b. Dock (jump links) + reading progress ── */
const dock = $('#dock'), progBar = $('#progBar'), dockLinks = [...dock.querySelectorAll('a')];
let dockReady = false, kbOpen = false, dockSeen = false, dockHold = false, lastY = 0, holdT = 0;
const dockIds = ['flow', 'venue', 'rsvp'].map(id => $('#' + id)).filter(Boolean);
function updateDock(){
  const max = document.documentElement.scrollHeight - innerHeight;
  progBar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  if (!dockReady) return;
  const rsEl = $('#rsvp'), rs = rsEl && rsEl.getBoundingClientRect();
  const inRsvp = !!rs && rs.top < innerHeight * .5 && rs.bottom > innerHeight * .25;
  const dy = scrollY - lastY; lastY = scrollY;
  if (dy > 8){ dockHold = true; clearTimeout(holdT); holdT = setTimeout(() => { dockHold = false; updateDock(); }, 800); }
  else if (dy < -8){ dockHold = false; }
  const show = scrollY > innerHeight * .5 && !inRsvp && !kbOpen && !dockHold;
  dock.classList.toggle('show', show);
  if (show && !dockSeen){ dockSeen = true; const go = dock.querySelector('.go'); if (go) go.classList.add('pulse'); }
  let cur = '';
  dockIds.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * .45) cur = s.id; });
  dockLinks.forEach(a => a.classList.toggle('on', a.dataset.s === cur && !a.classList.contains('go')));
}
addEventListener('focusin', e => { if (e.target.matches('input,textarea,select')){ kbOpen = true; updateDock(); } });
addEventListener('focusout', () => { kbOpen = false; setTimeout(updateDock, 120); });

/* ── 5. Scroll-linked bits: hero drift + river ── */
let ticking = false;
function onScroll(){
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY, art = $('#heroArt');
    if (!reduce && y < innerHeight * 1.2) art.style.translate = `0 ${y * .1}px`;
    updateRiver(); updateDock();
    ticking = false;
  });
}
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => buildRiver());
window.addEventListener('load', buildRiver);
document.fonts && document.fonts.ready.then(buildRiver);
buildRiver();

if (!MUHURTAM){
/* ═══════════ 6. RSVP: one entry per phone number ═══════════ */
const LS_KEY = 'wedding-rsvp-v1';
const lsGet = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch(e){ return null; } };
const lsSet = o => { try { localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch(e){} };

/* same rules as the Google script, so both sides agree on "the same phone number" */
function normPhone(s){
  let d = String(s).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 11 && d[0] === '0') d = '91' + d.slice(1);
  if (d.length === 10) d = '91' + d;
  return d;
}
const validPhone = d => d.length >= 11 && d.length <= 15;
const shortDate = d => d.date.replace(' December', ' Dec');

/* events tick-box grid, grouped by day */
$('#evGrid').innerHTML = DAYS.map((d,i) => `
  <div class="ev-day">
    <div class="ev-head"><span><b>${esc(d.date)}</b><small>${esc(d.dow)} · ${esc(d.city)}</small></span>
      <button type="button" class="ev-all" data-day="${i}">Select day</button></div>
    <div class="ev-opts">${d.events.filter(e => e.key).map(e => `
      <label class="ev-opt"><input type="checkbox" name="ev" data-day="${i}" data-t="${esc(e.time || '')}" value="${esc(shortDate(d) + ': ' + e.title)}">
        <span class="box"></span><span class="t">${esc(e.title)}${slot(e) ? `<small>${e.time ? `<b>${esc(e.time)}</b>${e.when ? ' · ' + esc(e.when) : ''}` : esc(e.when)}</small>` : ''}</span></label>`).join('')}
    </div>
  </div>`).join('');

const f = {
  form: $('#rsvpForm'), body: $('#rsvpFormBody'), done: $('#rsvpDone'),
  name: $('#f-name'), phone: $('#f-phone'), guests: $('#f-guests'), gnames: $('#f-gnames'), msg: $('#f-msg'),
  yes: $('#yesOnly'), gwrap: $('#guestNamesWrap'), btn: $('#rsvpBtn'), err: $('#rsvpErr'), pnote: $('#phoneNote'),
  chips: document.querySelectorAll('.attend-chip'), trap: $('#f-site'),
  gOut: $('#gOut'), gMinus: $('#gMinus'), gPlus: $('#gPlus'), nmsg: $('#nameMsg'), every: $('#evEvery')
};
const setOpen = (el, on) => { el.classList.toggle('open', on); el.inert = !on; };
const nudge = el => { el.classList.remove('nudge'); void el.offsetWidth; el.classList.add('nudge'); };
const guestsN = () => +f.guests.value;
function setGuests(n, quiet){
  n = Math.max(1, Math.min(8, n));
  f.guests.value = String(n); f.gOut.textContent = n;
  f.gMinus.disabled = n <= 1; f.gPlus.disabled = n >= 8;
  setOpen(f.gwrap, n >= 2);
  if (!quiet){ f.gOut.classList.remove('bump'); void f.gOut.offsetWidth; f.gOut.classList.add('bump'); }
  updateSum();
}
function updateSum(){}   /* the running summary line was removed on request; kept as a no-op for the callers */
const evBoxes = () => [...document.querySelectorAll('#evGrid input[name=ev]')];
const attending = () => document.querySelector('.attend-chip.on').dataset.v === 'Joyfully accepts';
let editing = false;

f.chips.forEach(c => c.addEventListener('click', () => {
  f.chips.forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed','false'); });
  c.classList.add('on'); c.setAttribute('aria-pressed','true');
  setOpen(f.yes, attending()); $('#stepLast').textContent = attending() ? '4' : '3'; f.err.hidden = true; updateSum();
}));
f.gMinus.addEventListener('click', () => setGuests(guestsN() - 1));
f.gPlus.addEventListener('click', () => setGuests(guestsN() + 1));
f.every.addEventListener('click', () => {
  const all = evBoxes().every(x => x.checked);
  evBoxes().forEach(x => x.checked = !all);
  syncEvButtons(); f.err.hidden = true;
});
function syncEvButtons(){
  document.querySelectorAll('.ev-all').forEach(b => {
    const boxes = evBoxes().filter(y => y.dataset.day === b.dataset.day);
    b.textContent = boxes.every(y => y.checked) ? 'Clear day' : 'Select day';
  });
  const all = evBoxes().every(x => x.checked);
  f.every.classList.toggle('on', all); f.every.textContent = all ? 'Clear all' : 'Join every celebration';
  updateSum();
}
document.querySelectorAll('.ev-all').forEach(b => b.addEventListener('click', () => {
  const boxes = evBoxes().filter(x => x.dataset.day === b.dataset.day);
  const all = boxes.every(x => x.checked);
  boxes.forEach(x => x.checked = !all);
  syncEvButtons(); f.err.hidden = true;
}));
document.querySelectorAll('#evGrid input').forEach(x => x.addEventListener('change', () => { syncEvButtons(); f.err.hidden = true; }));
syncEvButtons();

function showDone(d, msg, scroll){
  f.body.hidden = true; f.done.hidden = false;
  const first = (d.name || '').trim().split(/\s+/)[0] || 'friend';
  const yes = d.attendance === 'Joyfully accepts';
  $('#doneMsg').textContent = msg || (yes
    ? `Thank you, ${first}. Your RSVP has been received and we cannot wait to celebrate with you.`
    : `Thank you for letting us know, ${first}. We will miss you.`);
  const ph = d.phone ? (/^91\d{10}$/.test(d.phone) ? `+91 ${d.phone.slice(2,7)} ${d.phone.slice(7)}` : '+' + d.phone) : '';
  const rows = [['Name', d.name], ['Phone', ph], ['Reply', d.attendance]];
  if (yes){ rows.push(['Guests', String(d.guests)]); const evs = d.events || [];
    if (evs.length) rows.push(['Celebrations', evs.join('\n')]); }
  $('#doneSum').innerHTML = rows.filter(r => r[1]).map(r => `<li><span>${r[0]}</span>${esc(r[1]).replace(/\n/g, '<br>')}</li>`).join('');
  if (scroll) f.done.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
}
function showForm(prefill){
  f.done.hidden = true; f.body.hidden = false;
  f.form.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  if (prefill){
    editing = true;
    f.name.value = prefill.name || '';
    f.phone.value = prefill.phone ? '+' + prefill.phone : '';
    f.phone.readOnly = true;
    setNote('Your number identifies your RSVP, so it stays fixed. Changes update your entry.', 'ok');
    f.chips.forEach(c => { const on = c.dataset.v === prefill.attendance; c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
    setOpen(f.yes, attending()); $('#stepLast').textContent = attending() ? '4' : '3';
    setGuests(+prefill.guests || 1, true);
    f.gnames.value = prefill.guestNames || '';
    f.msg.value = prefill.note || '';
    evBoxes().forEach(x => x.checked = (prefill.events || []).some(s => s === x.value || s.startsWith(x.value + ' (')));
    syncEvButtons();
    f.btn.textContent = 'Update RSVP';
  }
}
$('#editBtn').addEventListener('click', () => showForm(lsGet()));
/* another person replying from this same phone (family, friends): a clean form with an editable number */
$('#otherBtn').addEventListener('click', () => {
  editing = false; f.phone.readOnly = false;
  f.name.value = ''; f.phone.value = ''; f.gnames.value = ''; f.msg.value = ''; f.trap.value = '';
  [f.name, f.phone].forEach(x => x.classList.remove('good', 'bad'));
  f.chips.forEach((c, i) => { c.classList.toggle('on', i === 0); c.setAttribute('aria-pressed', String(i === 0)); });
  setOpen(f.yes, true); $('#stepLast').textContent = '4';
  evBoxes().forEach(x => x.checked = false);
  setGuests(1, true); syncEvButtons(); setNote('');
  f.err.hidden = true; f.btn.textContent = 'Send RSVP';
  f.done.hidden = true; f.body.hidden = false;
  f.form.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  setTimeout(() => f.name.focus({ preventScroll: true }), 500);
});

/* the note keeps a reserved 2-line slot so it never shifts the form under a tap */
const PHONE_HINT = 'One reply per household. Add everyone joining you below. Indian numbers need no country code.';
function setNote(t, kind){ f.pnote.textContent = t || PHONE_HINT; f.pnote.classList.toggle('ok', kind === 'ok'); f.pnote.classList.toggle('bad', kind === 'bad'); }
/* if this phone already has an RSVP (for example after clearing the browser), say so before they submit */
async function checkPhone(){
  if (editing || !CONFIG.sheetUrl) return;
  const k = normPhone(f.phone.value);
  if (!validPhone(k)){ setNote(''); return; }
  try {
    const r = await fetch(`${CONFIG.sheetUrl}?action=check&phone=${k}`);
    const j = await r.json();
    if (j && j.exists){
      setNote('This number already has an RSVP. Sending again updates it, no duplicate.', 'ok');
    } else setNote('');
  } catch(e){ /* the check is a courtesy; the server de-duplicates anyway */ }
}
f.phone.addEventListener('change', checkPhone);

/* gentle inline checks: tick/untick as people move through the form */
f.name.addEventListener('blur', () => {
  const ok = f.name.value.trim().length >= 2;
  f.name.classList.toggle('good', ok); f.name.classList.toggle('bad', !!f.name.value.trim() && !ok);
  f.nmsg.textContent = f.name.value.trim() && !ok ? 'Please enter your full name.' : '';
});
f.name.addEventListener('input', () => { f.name.classList.remove('bad'); f.nmsg.textContent = ''; f.err.hidden = true; });
f.phone.addEventListener('input', () => { f.phone.classList.remove('bad','good'); f.err.hidden = true; if (!editing) setNote(''); });
f.phone.addEventListener('blur', () => {
  if (f.phone.readOnly) return;
  const raw = f.phone.value.trim(), k = normPhone(raw);
  if (/^\d{10}$/.test(raw.replace(/\D/g, '')) && !raw.startsWith('+') && raw.replace(/\D/g,'').length === 10){ const d = raw.replace(/\D/g, ''); f.phone.value = `+91 ${d.slice(0,5)} ${d.slice(5)}`; }
  const ok = validPhone(k);
  f.phone.classList.toggle('good', ok); f.phone.classList.toggle('bad', !!raw && !ok);
  if (!editing && !f.pnote.classList.contains('ok')) setNote(raw && !ok ? 'That number looks too short. Add the country code if it is not an Indian number.' : '', raw && !ok ? 'bad' : '');
});

async function sendToSheet(payload){
  const body = new URLSearchParams(payload);
  try {
    const r = await fetch(CONFIG.sheetUrl, { method: 'POST', body });
    const txt = await r.text();
    try { return JSON.parse(txt); }
    catch(e){ return r.ok ? { ok: true, status: 'sent' } : { ok: false, error: 'server' }; }   /* the server answered, so never send twice */
  } catch(e){
    /* browser could not read the reply: send once more without reading it. The script de-duplicates by phone, so repeats are safe. */
    try { await fetch(CONFIG.sheetUrl, { method: 'POST', body, mode: 'no-cors' }); return { ok: true, status: 'sent' }; }
    catch(e2){ return { ok: false, error: 'network' }; }
  }
}
function fail(m, el){
  f.err.textContent = m; f.err.hidden = false; f.btn.disabled = false; f.btn.textContent = editing ? 'Update RSVP' : 'Send RSVP';
  if (el){
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    nudge(el); if (el.matches('input,textarea')) setTimeout(() => el.focus({ preventScroll: true }), 350);
  }
}

f.form.addEventListener('submit', async e => {
  e.preventDefault();
  f.err.hidden = true; const sb = document.getElementById('savedBanner'); if (sb) sb.remove();
  if (f.trap.value) { showDone({ name: f.name.value, attendance: 'Joyfully accepts', guests: 1 }, null, true); return; } /* bots fill the hidden field */
  const name = f.name.value.trim(), key = normPhone(f.phone.value), yes = attending();
  const events = yes ? evBoxes().filter(x => x.checked).map(x => x.value + (x.dataset.t ? ` (${x.dataset.t})` : '')) : [];
  if (!name){ f.name.classList.add('bad'); return fail('Please enter your name.', f.name); }
  if (!validPhone(key)){ f.phone.classList.add('bad'); return fail('Please enter a valid phone number. Add the country code if it is not an Indian number.', f.phone); }
  if (yes && !events.length) return fail('Please tick at least one celebration you will join.', $('#evGrid'));
  const data = {
    name, phone: key, attendance: document.querySelector('.attend-chip.on').dataset.v,
    guests: yes ? guestsN() : 0, events,
    guestNames: yes && guestsN() > 1 ? f.gnames.value.trim() : '',
    note: f.msg.value.trim()
  };
  f.btn.disabled = true; f.btn.textContent = 'Sending…';
  const res = await sendToSheet({ ...data, events: data.events.join('; '), side: SIDE, website: '' });
  if (!res || !res.ok) return fail('Sorry, that did not go through. Please check your connection and try again.');
  lsSet({ ...data, ts: Date.now() });
  const msg = res.status === 'updated' ? `Thank you, ${name.split(/\s+/)[0]}. We already had an RSVP for this number, so we updated it instead of adding a new one.` : null;
  editing = false; f.phone.readOnly = false; f.btn.disabled = false; f.btn.textContent = 'Send RSVP';
  showDone(data, msg, true);
});

setGuests(+f.guests.value || 1, true);   /* a refresh can make some browsers restore stale field values; resync the display */
/* already replied on this device: show the static "You're all set" screen */
/* a refresh always gives a clean form; a reply saved on this device is offered as a small link instead of filling the page */
f.form.reset(); setGuests(1, true); f.name.value = ''; f.phone.value = '';
(function(){
  const saved = lsGet(); if (!saved || !saved.phone) return;
  const b = document.createElement('p'); b.className = 'saved-banner'; b.id = 'savedBanner';
  const first = (saved.name || '').trim().split(/\s+/)[0] || 'you';
  b.innerHTML = 'Already replied on this device as <b>' + esc(first) + '</b>. <button type="button" class="link-btn" id="seeReply">See or change my reply</button>';
  f.body.prepend(b);
  $('#seeReply').addEventListener('click', () => { b.remove(); showDone(saved); });
})();

}   /* end RSVP (skipped on the Muhurtham page) */

/* scroll cue: shown after the door opens, gone as soon as the guest scrolls */
(function(){
  const hide = () => { if (scrollY > 40) document.body.classList.remove('cue-on'), removeEventListener('scroll', hide); };
  addEventListener('scroll', hide, { passive: true });
  document.getElementById('scrollCue').addEventListener('click', () => document.getElementById('flow').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));
})();

/* optional RSVP deadline and contact line: shown only once filled in CONFIG */
(function(){
  if (MUHURTAM) return;
  if (CONFIG.rsvpBy){ const l = document.querySelector('.form-lead'); if (l) l.textContent = 'Kindly reply by ' + CONFIG.rsvpBy + '. It takes under a minute.'; }
  const c = CONFIG.contact || {};
  if (c.phone){
    const digits = c.phone.replace(/\D/g, '');
    const p = document.createElement('p'); p.className = 'contact-line';
    p.innerHTML = 'Questions? Call or WhatsApp ' + (c.name ? esc(c.name) + ' on ' : '') + '<a href="tel:+' + digits + '">' + esc(c.phone) + '</a>';
    $('#rsvpNote').after(p);
  }
})();

/* offline: save the page for use with no signal, and say so politely when the signal drops */
(function(){
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
  const bar = document.createElement('div');
  bar.className = 'offline-bar'; bar.setAttribute('role', 'status'); bar.textContent = 'No signal. Showing the saved invitation.';
  document.body.appendChild(bar);
  const sync = () => bar.classList.toggle('show', !navigator.onLine);
  addEventListener('online', sync); addEventListener('offline', sync); sync();
})();
