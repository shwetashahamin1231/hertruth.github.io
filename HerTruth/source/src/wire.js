/* ---- tabs, navigation and home widgets (layout only; no scoring here) ---- */
TABS.forEach((b, n) => {
  b.addEventListener("click", () => selectTab(b.id));
  b.addEventListener("keydown", e => {
    const k = e.key; let j = null;
    if (k === "ArrowRight") j = (n + 1) % TABS.length; else if (k === "ArrowLeft") j = (n - 1 + TABS.length) % TABS.length;
    else if (k === "Home") j = 0; else if (k === "End") j = TABS.length - 1;
    if (j !== null){ e.preventDefault(); selectTab(TABS[j].id, {focus:true}); }
  });
});
document.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => {
  selectTab(b.dataset.goto);
  if (b.dataset.focus){ const el = document.getElementById(b.dataset.focus); if (el) setTimeout(() => el.scrollIntoView({block:"start"}), 30); }
}));
{ const h = (location.hash || "").slice(1); const tb = TABS.find(b => b.dataset.hash === h); if (tb && tb.id !== "t-home") selectTab(tb.id, {keepScroll:true}); }
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS = "http://www.w3.org/2000/svg";
const el = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* PBAC points table on How it works, built from the same PB list the quiz scores with */
{ const tb = document.querySelector("#pbacTable tbody");
  if (tb) PB.forEach(([g, items]) => items.forEach(([k, lab, svg, w]) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="pb-ico">${svg}</td><td>${T.en[g]}: ${T.en[lab]}</td><td class="num">${w}</td>`;
    tb.appendChild(tr);
  })); }

/* ---- 28-day cycle ring (hero) ---- */
const ring = (() => {
  const svg = $("#ring"); if (!svg) return null;
  const C = 150, R = 118, dots = [];
  svg.appendChild(el("circle", {cx:C, cy:C, r:R, class:"ring-track"}));
  for (let d = 1; d <= 28; d++){
    const a = (d - 1) / 28 * Math.PI * 2 - Math.PI / 2, x = C + R * Math.cos(a), y = C + R * Math.sin(a);
    const c = el("circle", {cx:x.toFixed(2), cy:y.toFixed(2), r:7.5, class:"ring-dot"}); svg.appendChild(c); dots.push(c);
    if ([1, 14, 21, 28].includes(d)){
      const lx = C + (R + 22) * Math.cos(a), ly = C + (R + 22) * Math.sin(a);
      const tx = el("text", {x:lx.toFixed(1), y:(ly + 3.5).toFixed(1), "text-anchor":"middle", class:"ring-lab"}); tx.textContent = d; svg.appendChild(tx);
    }
  }
  const a7 = 6.5 / 28 * Math.PI * 2 - Math.PI / 2;
  svg.appendChild(el("line", {x1:(C + (R - 16) * Math.cos(a7)).toFixed(1), y1:(C + (R - 16) * Math.sin(a7)).toFixed(1), x2:(C + (R + 16) * Math.cos(a7)).toFixed(1), y2:(C + (R + 16) * Math.sin(a7)).toFixed(1), class:"ring-seven"}));
  const t7 = el("text", {x:(C + (R + 28) * Math.cos(a7)).toFixed(1), y:(C + (R + 28) * Math.sin(a7) + 4).toFixed(1), "text-anchor":"middle", class:"ring-seven-lab"}); t7.textContent = "7"; svg.appendChild(t7);
  const range = $("#ringRange"), fig = svg.closest(".cycle");
  let n = +range.value;
  const draw = () => {
    dots.forEach((c, j) => { const d = j + 1; c.classList.toggle("on", d <= n && d <= 7); c.classList.toggle("over", d <= n && d > 7); c.setAttribute("r", d <= n ? 9 : 7.5); });
    $("#ringN").textContent = n; $("#ringUnit").textContent = t(n === 1 ? "ringDay" : "ringDays");
    fig.classList.toggle("is-long", n >= 7);
    $("#ringCap").textContent = t(n >= 7 ? "ringOver" : "ringUnder");
    range.value = n; range.setAttribute("aria-valuetext", n + " " + t("ringDays"));
  };
  const set = v => { n = Math.max(+range.min, Math.min(+range.max, v)); draw(); };
  range.addEventListener("input", () => set(+range.value));
  $("#ringMinus").onclick = () => set(n - 1); $("#ringPlus").onclick = () => set(n + 1);
  draw(); return {draw};
})();

/* ---- progress ring on the check page ---- */
const prog = (() => {
  const svg = $("#progRing"); if (!svg) return null;
  const segs = [], N = Q.length, C = 60, R = 48, gap = 0.12;
  for (let k = 0; k < N; k++){
    const a0 = k / N * Math.PI * 2 - Math.PI / 2 + gap / 2, a1 = (k + 1) / N * Math.PI * 2 - Math.PI / 2 - gap / 2;
    const p = el("path", {d:`M${(C + R * Math.cos(a0)).toFixed(2)} ${(C + R * Math.sin(a0)).toFixed(2)} A${R} ${R} 0 0 1 ${(C + R * Math.cos(a1)).toFixed(2)} ${(C + R * Math.sin(a1)).toFixed(2)}`, class:"prog-seg"});
    svg.appendChild(p); segs.push(p);
  }
  return k => { segs.forEach((s, j) => s.classList.toggle("on", j < k)); $("#progNum").textContent = k + "/" + N; };
})();
window.__bcProg = k => { if (prog) prog(k); };

/* ---- "It's okay to ask for help", circling through languages ---- */
const help = (() => {
  const say = $("#helpSay"), orbit = $("#orbitRing"); if (!say) return null;
  const N = HELP.length, dots = [];
  HELP.forEach((h, k) => { const i = document.createElement("i"); const a = k / N * 360; i.style.transform = `rotate(${a}deg) translateY(calc(-1 * var(--orb, 90px))) rotate(${-a}deg)`; orbit.appendChild(i); dots.push(i); });
  let idx = 0, turn = 0, timer = null, paused = false;
  const paint = () => {
    const [code, name, text, dir] = HELP[idx];
    say.textContent = text; say.lang = code; if (dir) say.dir = dir; else say.removeAttribute("dir");
    $("#helpLangName").textContent = name; $("#helpCount").textContent = (idx + 1) + " / " + N;
    dots.forEach((d, j) => d.classList.toggle("on", j === idx));
    orbit.style.transform = `rotate(${-turn / N * 360}deg)`;
  };
  const step = () => {
    idx = (idx + 1) % N; turn++;
    if (reduce){ paint(); return; }
    say.classList.add("out");
    setTimeout(() => { paint(); say.classList.remove("out"); say.classList.add("pre"); void say.offsetWidth; say.classList.remove("pre"); }, 450);
  };
  const run = () => { clearInterval(timer); if (!paused) timer = setInterval(() => { if (!document.hidden) step(); }, reduce ? 4200 : 2900); };
  const btn = $("#helpPause");
  btn.onclick = () => { paused = !paused; btn.setAttribute("aria-pressed", paused ? "true" : "false"); btn.firstElementChild.dataset.t = paused ? "helpPlay" : "helpPause"; btn.firstElementChild.textContent = t(btn.firstElementChild.dataset.t); run(); };
  const band = $("#help");
  band.addEventListener("pointerenter", () => clearInterval(timer)); band.addEventListener("pointerleave", run);
  band.addEventListener("focusin", () => clearInterval(timer)); band.addEventListener("focusout", run);
  const start = () => { const k = HELP.findIndex(h => h[0] === L); idx = k < 0 ? 0 : k; turn = idx; paint(); run(); };
  start(); return {start};
})();

/* photos used in more than one place are embedded once and copied here, so the file does not grow */
document.querySelectorAll("img[data-src-from]").forEach(i => { const s = document.querySelector(`img[data-name="${i.dataset.srcFrom}"]`); if (s) i.src = s.src; });

/* ================= v4: guided start (once per visit) =================
   1. a question about the issue, switching languages  2. pick your language
   3. the problem and how HerTruth helps, in that language  4. start the check, or read more first */
{ const g = $("#guide");
  let seen = false; try { seen = sessionStorage.getItem("htGuide") === "1"; } catch(e){}
  if (g && seen) g.remove();
  else if (g){
    const root = document.documentElement, ask = $("#guideAsk"), askLang = $("#guideAskLang"), pick = $("#guidePickLab");
    const ASK = HELP.filter(h => T[h[0]] && T[h[0]].ringQ);
    let k = 0, timer = null;
    const rotate = () => { const [code, name, , dir] = ASK[k++ % ASK.length];
      ask.textContent = T[code].ringQ; ask.lang = code; ask.dir = dir || "ltr"; askLang.textContent = name;
      pick.textContent = T[code].langLabel || T.en.langLabel; pick.lang = code;
      if (!reduce){ ask.classList.remove("in"); void ask.offsetWidth; ask.classList.add("in"); } };
    const run = () => { clearInterval(timer); rotate(); timer = setInterval(rotate, reduce ? 3500 : 1900); };
    const box = $("#guideLangs");
    box.innerHTML = HELP.map(([c, n, , d]) => `<button type="button" data-guide-lang="${c}" lang="${c}"${d ? ' dir="rtl"' : ""}>${n}</button>`).join("");
    const step = n => { $("#guide1").hidden = n !== 1; $("#guide2").hidden = n !== 2; g.scrollTop = 0;
      if (n === 1){ run(); const on = box.querySelector(`[data-guide-lang="${L}"]`) || box.firstElementChild; on.focus({preventScroll: true}); }
      else { clearInterval(timer); $("#guideStart").focus({preventScroll: true}); } };
    const close = () => { clearInterval(timer); try { sessionStorage.setItem("htGuide", "1"); } catch(e){}
      g.classList.add("out"); root.classList.remove("guide-open"); setTimeout(() => g.remove(), 420); };
    box.addEventListener("click", e => { const b = e.target.closest("[data-guide-lang]"); if (!b) return;
      const real = document.querySelector(`.langs button[data-lang="${b.dataset.guideLang}"]`); if (real) real.click();
      step(2); });
    $("#guideStart").onclick = () => { close(); $("#start").click(); };
    $("#guideMore").onclick = () => { close(); selectTab("t-home"); setTimeout(() => { const w = document.querySelector(".why"); if (w) w.scrollIntoView({block: "start"}); }, 60); };
    $("#guideBack").onclick = () => step(1);
    $("#guideX").onclick = close;
    g.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
    g.hidden = false; root.classList.add("guide-open"); step(1);
  } }

/* ================= v4: tap a photo to see it full screen ================= */
{ const lb = $("#lightbox"), img = $("#lbImg"), cap = $("#lbCap"); let list = [], at = 0, back = null;
  const show = n => { at = (n + list.length) % list.length; const i = list[at], f = i.closest("figure"), c = f && f.querySelector("figcaption");
    img.src = i.src; img.alt = i.alt; cap.textContent = c ? c.textContent : i.alt;
    $("#lbPrev").hidden = $("#lbNext").hidden = list.length < 2; };
  const open = i => { const group = i.closest(".strip, .gallery6"); list = group ? [...group.querySelectorAll("img")] : [i];
    back = i; show(list.indexOf(i)); lb.hidden = false; document.documentElement.classList.add("lb-open"); $("#lbX").focus(); };
  const shut = () => { lb.hidden = true; img.removeAttribute("src"); document.documentElement.classList.remove("lb-open"); if (back) back.focus(); };
  document.querySelectorAll(".strip img, .gallery6 img, .pt-photo img, .photo-band img").forEach(i => {
    i.tabIndex = 0; i.setAttribute("role", "button");
    i.addEventListener("click", () => open(i));
    i.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); open(i); } });
  });
  $("#lbX").onclick = shut; $("#lbPrev").onclick = () => show(at - 1); $("#lbNext").onclick = () => show(at + 1);
  lb.addEventListener("click", e => { if (e.target === lb) shut(); });
  document.addEventListener("keydown", e => { if (lb.hidden) return;
    if (e.key === "Escape") shut(); else if (e.key === "ArrowRight") show(at + 1); else if (e.key === "ArrowLeft") show(at - 1); });
}

/* ================= v4: app shell ================= */
/* the check is full screen; the X is the only way out */
$("#checkX").onclick = () => selectTab("t-home");

/* light or dark, the viewer's choice, remembered on this device. A blood drop falls from the button and grows to fill
   the screen in the new color, then the colors switch underneath it. */
{ const btn = $("#themeBtn"), root = document.documentElement, meta = document.querySelector('meta[name="theme-color"]');
  const PAPER = {light: "#FFFBFC", dark: "#17121A"};
  const set = m => { root.dataset.theme = m; if (meta) meta.content = PAPER[m];
    btn.setAttribute("aria-pressed", m === "dark" ? "true" : "false"); btn.setAttribute("aria-label", m === "dark" ? "Switch to light mode" : "Switch to dark mode");
    try { localStorage.setItem("htTheme", m); } catch(e){} };
  let saved = null; try { saved = localStorage.getItem("htTheme"); } catch(e){}
  set(saved === "dark" ? "dark" : "light");
  btn.onclick = () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (reduce){ set(next); return; }
    const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const d = document.createElement("div"); d.className = "theme-drop";
    d.style.cssText = `left:${x}px;top:${y}px;--to:${PAPER[next]};--s:${(far / 9).toFixed(1)}`;
    document.body.appendChild(d);
    let fin = false;
    const finish = () => { if (fin) return; fin = true; set(next); d.classList.add("done"); setTimeout(() => d.remove(), 320); };
    d.addEventListener("animationend", finish, {once: true});
    setTimeout(finish, 1100);   // never leave the drop over the screen, even if the animation event is skipped
  };
}

/* ================= v5: "where people get missed", a path you tap through =================
   Every number is sourced: 1 in 100 and 1 in 1,000 and 15+ years (ASH ISTH NHF WFH 2021 guideline), 33.1% (US Census
   QuickFacts, New Jersey, 2020-2024), and the iron counts from the held-out NHANES test set in site_data.json. */
const impact = (() => {
  const box = $("#impact"); if (!box) return null;
  const o = SITE.overlap, model = o.both + o.model_only, hgb = o.both + o.hgb_only, all = model + o.hgb_only + o.neither;
  const pct = v => { try { return new Intl.NumberFormat(L, {style: "percent", minimumFractionDigits: 1, numberingSystem: "latn"}).format(v); } catch(e){ return (v * 100).toFixed(1) + "%"; } };
  const STEPS = {
    usual: [() => [t("f1v"), t("f1l")], () => [t("impCareV"), t("impCareL")], () => [pct(.331), t("impLangL")], () => [t("f2v"), t("f2l")]],
    with:  [() => [nf(16), t("helpLangs")], () => [nf(10), t("ctaSub")], () => [nf(1), t("lede")], () => [t("isS3v", {n: nf(model), t: nf(all)}), t("impIronL", {h: nf(hgb)})]],
  };
  let mode = "usual", at = 0;
  const path = $("#impPath");
  const draw = (anim) => {
    const [big, text] = STEPS[mode][at]();
    $("#impBig").textContent = big; $("#impText").textContent = text;
    box.dataset.mode = mode;
    path.innerHTML = STEPS[mode].map((_, k) => `<button type="button" class="imp-node${k === at ? " on" : ""}${k < at ? " past" : ""}" aria-label="${k + 1} / ${STEPS[mode].length}" aria-pressed="${k === at}"><i></i></button>`).join("");
    path.querySelectorAll(".imp-node").forEach((b, k) => b.onclick = () => { at = k; draw(true); });
    box.querySelectorAll(".imp-mode").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === mode ? "true" : "false"));
    if (anim && !reduce){ const st = $("#impStage"); st.classList.remove("in"); void st.offsetWidth; st.classList.add("in"); }
  };
  box.querySelectorAll(".imp-mode").forEach(b => b.onclick = () => { mode = b.dataset.mode; at = 0; draw(true); });
  $("#impNext").onclick = () => { if (at < 3) at++; else { mode = mode === "usual" ? "with" : "usual"; at = 0; } draw(true); };
  let x0 = null; const st = $("#impStage");
  st.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, {passive: true});
  st.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40){ at = Math.max(0, Math.min(3, at + (dx < 0 ? 1 : -1))); draw(true); } }, {passive: true});
  draw(false); return () => draw(false);
})();

/* ================= v5: after the check, "Take me to the details and what to do" =================
   The result first shows just the verdict. The button sends a blood drop across the screen, then opens the full
   summary (reasons, tests to ask for, what to say, photos) and brings back the rest of the app. */
let resOpen = false;
const resBrief = () => {
  const r = $("#result"); if (!r || !$("#resCard")) return;
  r.classList.toggle("brief", !resOpen); document.body.classList.toggle("res-open", resOpen);
  if (!$("#resMore")){
    const more = document.createElement("div"); more.className = "res-more noprint";
    more.innerHTML = `<button type="button" class="btn btn--big" id="resMore"><span class="btn-main"><span>${t("resMore")}</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M13 6.5 18.5 12 13 17.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>`;
    $("#resCard").after(more);
    const next = document.createElement("div"); next.className = "res-next";
    next.innerHTML = `<h3>${t("resNextH")}</h3><p>${t("resNextP")}</p><button type="button" class="btn" id="resFind"><span>${t("fdH")}</span></button>`;
    $("#resCard").appendChild(next);
    $("#resFind").onclick = () => selectTab("t-find");
    $("#resMore").onclick = e => {
      const open = () => { resOpen = true; resBrief(); toPanel(); };
      if (reduce){ open(); return; }
      const r0 = e.currentTarget.getBoundingClientRect(), x = r0.left + r0.width / 2, y = r0.top + r0.height / 2;
      const far = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      const d = document.createElement("div"); d.className = "theme-drop res-drop";
      d.style.cssText = `left:${x}px;top:${y}px;--to:#C8376B;--s:${(far / 9).toFixed(1)}`;
      document.body.appendChild(d);
      let fin = false; const finish = () => { if (fin) return; fin = true; open(); d.classList.add("done"); setTimeout(() => d.remove(), 320); };
      d.addEventListener("animationend", finish, {once: true}); setTimeout(finish, 1100);
    };
  }
};
window.__bcResBrief = resBrief;   /* called after every result render, see the camera block */
/* a new check, or leaving the check, starts with the short result again */
document.addEventListener("click", e => { if (e.target.closest("#restart, .js-start, #start, #checkX")){ resOpen = false; document.body.classList.remove("res-open"); } }, true);

/* ================= v5: find care near you =================
   Nothing here runs until someone searches. Then the search text (or the phone's location, if they allow it) goes to
   OpenStreetMap: Nominatim turns it into a point, Overpass lists hospitals and clinics around it, and the map tiles
   come from tile.openstreetmap.org. Check answers are never part of it. */
{ const form = $("#fdForm");
  if (form){
    let map = null, layer = null;
    const LF = window.L;   /* Leaflet. Inside the app, plain L is the current language code */
    const say = (k, raw) => { $("#fdStatus").textContent = raw != null ? raw : (k ? t(k) : ""); };
    const esc = v => String(v).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[c]);
    /* opening_hours: handles the common forms ("24/7", "Mo-Fr 08:00-17:00; Sa 09:00-12:00; Su off"); anything else is "not listed" */
    const DAY = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const openNow = (spec, now = new Date()) => {
      if (!spec) return null; spec = spec.trim(); if (spec === "24/7") return true;
      const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes(); let res = null, any = false;
      for (let rule of spec.split(";")){
        rule = rule.trim(); if (!rule || /^PH\b/.test(rule)) continue;
        const mm = rule.match(/^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?,?)+)?\s*(.*)$/); if (!mm) return null;
        let days = [0, 1, 2, 3, 4, 5, 6];
        if (mm[1]){ days = []; for (const part of mm[1].split(",").filter(Boolean)){ const [a, b] = part.split("-").map(x => DAY.indexOf(x));
          if (b === undefined) days.push(a); else for (let k = a; ; k = (k + 1) % 7){ days.push(k); if (k === b) break; } } }
        const times = mm[2].trim(); any = true;
        if (!days.includes(d)) continue;
        if (/^(off|closed)$/i.test(times)){ res = false; continue; }
        const ranges = times.split(",").map(r => r.trim().match(/^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/)); if (ranges.some(r => !r)) return null;
        res = ranges.some(r => { const a = +r[1] * 60 + +r[2], b = +r[3] * 60 + +r[4]; return b > a ? m >= a && m < b : m >= a || m < b; });
      }
      return any ? (res === null ? false : res) : null;
    };
    const km = (a, b, c, e) => { const R = 6371, rad = x => x * Math.PI / 180, dl = rad(c - a), dn = rad(e - b);
      const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
    const kind = g => g.emergency === "yes" ? t("fdER") : /hospital/.test(g.amenity || g.healthcare || "") ? t("fdHosp") : /doctor/.test(g.amenity || g.healthcare || "") ? t("fdDoc") : t("fdClinic");
    const SPEC = /haemato|hemato|h(a)?emophilia|bleeding|blood disorder/i;
    const places = async (lat, lon, radius) => {
      const q = `[out:json][timeout:25];(nwr["amenity"~"^(hospital|clinic|doctors)$"](around:${radius},${lat},${lon});nwr["healthcare"~"^(hospital|clinic|centre|doctor)$"](around:${radius},${lat},${lon}););out center tags 120;`;
      /* public Overpass servers can be slow: 20 seconds each, then a second mirror */
      let r = null;
      for (const host of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]){
        const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 20000);
        try { r = await fetch(host, {method: "POST", signal: ctl.signal, headers: {"Content-Type": "application/x-www-form-urlencoded"}, body: "data=" + encodeURIComponent(q)}); }
        catch(e){ r = null; } finally { clearTimeout(timer); }
        if (r && r.ok) break;
      }
      if (!r || !r.ok) throw new Error("overpass unavailable");
      const seen = new Set();
      return (await r.json()).elements.map(el => ({g: el.tags || {}, lat: el.lat ?? (el.center && el.center.lat), lon: el.lon ?? (el.center && el.center.lon)}))
        .filter(p => p.g.name && p.lat != null && !seen.has(p.g.name + Math.round(p.lat * 500)) && seen.add(p.g.name + Math.round(p.lat * 500)));
    };
    const show = async (lat, lon) => {
      say("fdLoading");
      let list = await places(lat, lon, 15000); if (list.length < 5) list = await places(lat, lon, 40000);
      list.forEach(p => { p.d = km(lat, lon, p.lat, p.lon); p.open = openNow(p.g.opening_hours); p.spec = SPEC.test((p.g["healthcare:speciality"] || "") + " " + p.g.name); });
      list.sort((a, b) => (b.spec - a.spec) || (a.d - b.d)); list = list.slice(0, 40);
      const mapEl = $("#fdMap"); mapEl.hidden = false;
      if (!map){ map = LF.map(mapEl, {scrollWheelZoom: false});
        LF.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map); }
      if (layer) layer.remove(); layer = LF.layerGroup().addTo(map);
      LF.circleMarker([lat, lon], {radius: 7, color: "#5B4BB7", fillColor: "#5B4BB7", fillOpacity: 1, weight: 2}).addTo(layer);
      const pts = [[lat, lon]];
      list.forEach((p, k) => { pts.push([p.lat, p.lon]);
        const col = p.open === true ? "#1F7A45" : p.open === false ? "#B4232C" : "#C8376B";
        LF.circleMarker([p.lat, p.lon], {radius: 8, color: "#fff", weight: 2, fillColor: col, fillOpacity: 1}).bindPopup(`<b>${esc(p.g.name)}</b><br>${esc(kind(p.g))}`).addTo(layer)
          .on("click", () => { const li = document.getElementById("fd" + k); if (li) li.scrollIntoView({block: "nearest", behavior: "smooth"}); }); });
      map.fitBounds(pts, {padding: [24, 24], maxZoom: 14}); setTimeout(() => map.invalidateSize(), 50);
      $("#fdList").innerHTML = list.map((p, k) => {
        const st = p.open === true ? ["open", t("fdOpen")] : p.open === false ? ["closed", t("fdClosed")] : ["unk", t("fdHours")];
        const dist = `${nf(Math.round(p.d * 10) / 10)} km · ${nf(Math.round(p.d * 6.214) / 10)} mi`;
        const tel = p.g.phone || p.g["contact:phone"];
        return `<li class="fd-item" id="fd${k}"><div class="fd-top"><b>${esc(p.g.name)}</b><span class="fd-badge ${st[0]}">${st[1]}</span></div>
          <p class="fd-meta">${p.spec ? `<span class="fd-specb">${esc(t("fdSpec"))}</span> ` : ""}${esc(kind(p.g))} · ${dist}</p>
          ${p.g.opening_hours ? `<p class="fd-hours" lang="en">${esc(p.g.opening_hours)}</p>` : ""}
          <p class="fd-links"><a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}" target="_blank" rel="noopener noreferrer">${t("fdDir")} &#8599;</a>${tel ? ` <a href="tel:${esc(tel.split(/[;,]/)[0].replace(/[^\d+]/g, ""))}">${t("fdCall")}</a>` : ""}</p></li>`; }).join("");
      say(list.length ? null : "fdNone", list.length ? "" : null);
    };
    form.addEventListener("submit", async e => { e.preventDefault(); const q = $("#fdQ").value.trim(); if (!q) return;
      try { say("fdLoading");
        const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" + encodeURIComponent(q), {headers: {"Accept-Language": L}});
        const j = await r.json(); if (!j.length){ say("fdNone"); $("#fdList").innerHTML = ""; return; }
        await show(+j[0].lat, +j[0].lon);
      } catch(err){ console.warn("find care:", err); say("fdErr"); } });
    $("#fdLoc").onclick = () => { if (!navigator.geolocation){ say("fdErr"); return; } say("fdLoading");
      navigator.geolocation.getCurrentPosition(pos => show(pos.coords.latitude, pos.coords.longitude).catch(() => say("fdErr")), () => say("fdErr"), {timeout: 15000}); };
  } }

/* per-language refresh for widgets */
window.__bcStatic = () => {
  document.querySelectorAll("[data-aria]").forEach(e => e.setAttribute("aria-label", t(e.dataset.aria)));
  if (ring) ring.draw();
  if (help) help.start();
};
window.__bcStatic();

/* copy helpers: share link and contact addresses */
async function copyText(txt, btn, done){
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(txt); btn.textContent = done; }
  catch(e){ btn.textContent = txt; }
  setTimeout(() => { btn.textContent = old; }, 2200);
}
{ const s = $("#shareLink"); if (s) s.onclick = () => copyText(location.href.split("#")[0], s.firstElementChild || s, t("shareDone")); }
document.querySelectorAll("[data-copy]").forEach(b => b.onclick = () => copyText(b.dataset.copy, b, "Copied"));

/* touch ripple on buttons */
document.addEventListener("pointerdown", e => {
  const b = e.target.closest(".btn"); if (!b || b.disabled || reduce) return;
  const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), s = document.createElement("span");
  s.className = "touch-ripple"; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d/2}px;top:${e.clientY - r.top - d/2}px`;
  b.appendChild(s); setTimeout(() => s.remove(), 600);
});

/* ================= v3: languages, RTL ================= */
/* v4: no font downloads. Every script we ship (Chinese, Korean, Arabic, Urdu, Gujarati, Punjabi, Bengali, Hindi,
   Vietnamese) is covered by the system fonts on iPhone, Android, Mac and Windows, so switching language fetches nothing. */
const RTL = ["ar", "ur"], LATIN = ["en", "es", "pt", "it", "fr", "ht", "tl"];
const nf = n => { try { return new Intl.NumberFormat(L, {numberingSystem:"latn"}).format(n); } catch(e){ return String(n); } };
const langName = c => (HELP.find(h => h[0] === c) || [c, c])[1];
function applyLangShell(){
  const h = document.documentElement;
  h.dir = RTL.includes(L) ? "rtl" : "ltr";
  h.dataset.script = LATIN.includes(L) ? "latin" : L === "hi" ? "hi" : "other";
  const cur = $("#langCur"); if (cur) cur.textContent = langName(L);
  const db = $("#draftBar"); if (db) db.hidden = L === "en";
}

/* language menu */
{ const btn = $("#langBtn"), menu = $("#langMenu");
  const close = (focus) => { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); if (focus) btn.focus(); };
  btn.addEventListener("click", () => { const open = menu.hidden; menu.hidden = !open; btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open){ const on = menu.querySelector('[aria-pressed="true"]') || menu.querySelector("button"); on && on.focus({preventScroll: true}); } });
  menu.addEventListener("click", e => { if (e.target.closest("button[data-lang]")) close(true); });
  document.addEventListener("click", e => { if (!menu.hidden && !e.target.closest("#langs")) close(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) close(true); });
  menu.addEventListener("keydown", e => {
    const items = [...menu.querySelectorAll("button")], k = items.indexOf(document.activeElement); if (k < 0) return;
    const cols = getComputedStyle(menu).gridTemplateColumns.split(" ").length || 1;
    const mv = {ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols}[e.key];
    if (mv){ e.preventDefault(); items[(k + mv + items.length) % items.length].focus(); }
  });
}

/* ================= v3: home interactions ================= */
/* CDC heavy-period signs */
const signs = (() => {
  const bs = [...document.querySelectorAll(".sign")]; if (!bs.length) return null;
  const upd = () => {
    const n = bs.filter(b => b.getAttribute("aria-pressed") === "true").length;
    document.querySelectorAll(".meter i").forEach((m, j) => m.classList.toggle("on", j < n));
    $("#sgCount").textContent = t("sgCount", {n});
    $("#sgMsg").textContent = t(n ? "sgAny" : "sgZero");
    $("#sgGo").classList.toggle("is-hot", n > 0);
  };
  bs.forEach(b => b.addEventListener("click", () => { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); upd(); }));
  upd(); return upd;
})();

/* real NHANES test set: who gets found */
const dots = (() => {
  const box = $("#rdDots"); if (!box) return null;
  $("#rdN1").textContent = nf(SITE.cohort_n); $("#rdN2").textContent = nf(SITE.cohort_id); $("#rdN3").textContent = nf(SITE.cohort_id_normal_hgb);
  const o = SITE.overlap, kinds = [...Array(o.both).fill("b"), ...Array(o.model_only).fill("m"), ...Array(o.hgb_only).fill("h"), ...Array(o.neither).fill("n")];
  kinds.forEach((k, j) => { const i = document.createElement("i"); i.dataset.k = k; i.style.setProperty("--i", j); box.appendChild(i); });
  let mode = "model";
  const draw = () => {
    const found = mode === "model" ? ["b", "m"] : ["b", "h"];
    let n = 0; box.querySelectorAll("i").forEach(i => { const f = found.includes(i.dataset.k); i.classList.toggle("f", f); if (f) n++; });
    $("#rdCount").textContent = t("rdFound", {n: nf(n), t: nf(kinds.length)});
    $("#rdModelBtn").setAttribute("aria-pressed", mode === "model" ? "true" : "false");
    $("#rdHgbBtn").setAttribute("aria-pressed", mode === "hgb" ? "true" : "false");
  };
  $("#rdModelBtn").onclick = () => { mode = "model"; draw(); };
  $("#rdHgbBtn").onclick = () => { mode = "hgb"; draw(); };
  draw(); return draw;
})();

/* myth or fact cards */
document.querySelectorAll(".flip").forEach(f => f.addEventListener("click", () => f.setAttribute("aria-pressed", f.getAttribute("aria-pressed") === "true" ? "false" : "true")));

/* keyboard answers in the check */
document.addEventListener("keydown", e => {
  if ($("#quiz").hidden || $("#p-check").hidden || e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest("input,textarea,select")) return;
  if (/^[1-9]$/.test(e.key)){
    const opts = document.querySelectorAll("#qbody .opts .opt"), o = opts[+e.key - 1];
    if (o){ e.preventDefault(); o.click(); }
  } else if (e.key === "Enter" && !e.target.closest("button,a,summary")){
    const nx = $("#next"); if (!nx.disabled){ e.preventDefault(); nx.click(); }
  }
});

/* ================= v3: clinic, real model on real held-out cases ================= */
const CF_LABEL = {RIDAGEYR:"Age", LBXHGB:"Hemoglobin", LBXMCVSI:"MCV", LBXRDW:"RDW", LBXRBCSI:"RBC count", LBXPLTSI:"Platelets", LBXHSCRP:"hs-CRP"};
let curCase = null;
{ const row = $("#caseRow");
  if (row) CASES.forEach((c, k) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "case-chip";
    b.innerHTML = `<b>Case ${String.fromCharCode(65 + k)}</b><span>Age ${c.x.RIDAGEYR} · Hgb ${c.x.LBXHGB}</span>`;
    b.onclick = () => {
      if (!$("#clinicFields").children.length) openClinic(true);
      Object.entries(c.x).forEach(([f, v]) => { const inp = $("#c_" + f); if (inp) inp.value = v; });
      curCase = k; row.querySelectorAll(".case-chip").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      $("#runIron").click();
    };
    b.setAttribute("aria-pressed", "false"); row.appendChild(b);
  });
  document.addEventListener("input", e => { if (e.target.closest("#clinicFields")){ curCase = null; row && row.querySelectorAll(".case-chip").forEach(x => x.setAttribute("aria-pressed", "false")); $("#ironTruth").innerHTML = ""; } });
}
window.__bcExplain = v => {
  const why = $("#ironWhy"), truth = $("#ironTruth"); if (!why) return;
  if (!IRON_MODEL){ why.innerHTML = ""; truth.innerHTML = ""; return; }
  const m = IRON_MODEL;
  const parts = m.features.map((f, j) => { const x = v[f] == null ? m.impute_medians[f] : v[f]; return {f, x, c: m.coef[j] * (x - m.scaler_mean[j]) / m.scaler_scale[j], imp: v[f] == null}; })
    .sort((a, b) => Math.abs(b.c) - Math.abs(a.c));
  const mx = Math.max(1, ...parts.map(p => Math.abs(p.c)));
  why.innerHTML = `<h3>What moved this score</h3><p class="fine">Each bar is that value's pull on the model, compared with an average girl or woman in the training data.</p>
    <div class="wb-axis"><span>Away from iron deficiency</span><span>Toward iron deficiency</span></div>` +
    parts.map(p => `<div class="wb"><span class="wb-l">${CF_LABEL[p.f]} <small class="mono">${p.x}${p.imp ? " (median)" : ""}</small></span>
      <span class="wb-track"><i class="${p.c >= 0 ? "up" : "down"}" style="--w:${(Math.abs(p.c) / mx * 50).toFixed(1)}%"></i></span></div>`).join("");
  if (curCase !== null){
    const c = CASES[curCase], hi = c.p >= m.threshold, right = hi === (c.y === 1);
    truth.innerHTML = `<div class="truth ${right ? "ok" : "miss"}"><b>Real outcome for Case ${String.fromCharCode(65 + curCase)}:</b> ${c.y ? "ferritin below 15, iron deficient" : "ferritin 15 or higher, not iron deficient"}. ${right ? "The model got this one right." : hi ? "The model flagged her, but she was not iron deficient (a false alarm)." : "The model missed her."}</div>`;
  } else truth.innerHTML = "";
};

/* cutoff explorer on the real test set */
{ const range = $("#cutRange");
  if (range){
    const g = SITE.grid.map(r => ({t: r[0], tp: r[1], fn: r[2], fp: r[3], tn: r[4]}));
    const app = Object.assign({t: SITE.cutoff, app: true}, SITE.app);
    g.push(app); g.sort((a, b) => a.t - b.t);
    const appIdx = g.indexOf(app); range.max = g.length - 1; range.value = appIdx;
    const svg = $("#rocSvg"), S = 260, P = 30, W = S - P - 10;
    const X = v => P + v * W, Y = v => S - P - v * W;
    const E = (tag, a) => { const n = el(tag, a); svg.appendChild(n); return n; };
    [0, .5, 1].forEach(v => { E("line", {x1:X(v), y1:Y(0), x2:X(v), y2:Y(1), class:"roc-grid"}); E("line", {x1:X(0), y1:Y(v), x2:X(1), y2:Y(v), class:"roc-grid"});
      const tx = E("text", {x:X(v), y:S - 12, "text-anchor":"middle", class:"roc-lab"}); tx.textContent = v;
      const ty = E("text", {x:P - 8, y:Y(v) + 3, "text-anchor":"end", class:"roc-lab"}); ty.textContent = v; });
    E("line", {x1:X(0), y1:Y(0), x2:X(1), y2:Y(1), class:"roc-diag"});
    E("path", {d: "M" + SITE.roc.map(([f, s]) => X(f).toFixed(1) + " " + Y(s).toFixed(1)).join(" L"), class:"roc-line"});
    const xl = E("text", {x:X(.5), y:S - 0.5, "text-anchor":"middle", class:"roc-lab"}); xl.textContent = "False alarm rate (1 − specificity)";
    const dot = E("circle", {r:6, class:"roc-dot"});
    $("#rocAuc").textContent = SITE.test_auc;
    const pct = x => (x * 100).toFixed(1) + "%";
    const draw = () => {
      const r = g[+range.value], sens = r.tp / (r.tp + r.fn), spec = r.tn / (r.tn + r.fp);
      const ppv = r.tp + r.fp ? r.tp / (r.tp + r.fp) : NaN, npv = r.tn + r.fn ? r.tn / (r.tn + r.fn) : NaN;
      $("#cutVal").textContent = r.t.toFixed(r.app ? 3 : 2) + (r.app ? " (app)" : "");
      $("#exSens").textContent = pct(sens); $("#exSpec").textContent = pct(spec);
      $("#exPpv").textContent = isNaN(ppv) ? "n/a" : pct(ppv); $("#exNpv").textContent = isNaN(npv) ? "n/a" : pct(npv);
      $("#cmTP").textContent = r.tp; $("#cmFN").textContent = r.fn; $("#cmFP").textContent = r.fp; $("#cmTN").textContent = r.tn;
      dot.setAttribute("cx", X(1 - spec).toFixed(1)); dot.setAttribute("cy", Y(sens).toFixed(1));
      range.setAttribute("aria-valuetext", `cutoff ${r.t}, sensitivity ${pct(sens)}, specificity ${pct(spec)}`);
    };
    range.addEventListener("input", draw); $("#cutReset").onclick = () => { range.value = appIdx; draw(); };
    draw();
  }
  const tb = document.querySelector("#t1Table tbody");
  if (tb){ const U = {RIDAGEYR:"years", LBXHGB:"g/dL", LBXMCVSI:"fL", LBXRDW:"%", LBXRBCSI:"million/µL", LBXPLTSI:"1000/µL", LBXHSCRP:"mg/L"};
    Object.entries(SITE.table1).forEach(([f, r]) => { const tr = document.createElement("tr");
      tr.innerHTML = `<td>${CF_LABEL[f]} <small class="mono">${U[f]}</small></td><td class="num">${r.id[0]} (${r.id[1]} to ${r.id[2]})</td><td class="num">${r.not[0]} (${r.not[1]} to ${r.not[2]})</td>`; tb.appendChild(tr); }); }
}

/* ================= v4: problem stats, photo strip, scroll reveal ================= */
/* real cohort counts from site_data.json: iron-deficient girls and women whose hemoglobin was still normal */
const issueStat = () => { const n3 = $("#isN3"); if (n3) n3.textContent = t("isS3v", {n: nf(SITE.cohort_id_normal_hgb), t: nf(SITE.cohort_id)}); };

/* event photos: swipe, or let it advance slowly while it is on screen */
{ const strip = $("#photoStrip");
  if (strip && !reduce){
    let onScreen = false, held = false, timer = null;
    const next = () => {
      if (!onScreen || held || document.hidden) return;
      const first = strip.firstElementChild, gap = parseFloat(getComputedStyle(strip).columnGap) || 12;
      const max = strip.scrollWidth - strip.clientWidth; if (max < 4) return;
      const left = strip.scrollLeft >= max - 4 ? 0 : Math.min(max, strip.scrollLeft + first.getBoundingClientRect().width + gap);
      strip.scrollTo({left, behavior: "smooth"});
    };
    const hold = () => { held = true; clearTimeout(timer); };
    const release = () => { clearTimeout(timer); timer = setTimeout(() => { held = false; }, 5000); };
    ["pointerenter", "pointerdown", "touchstart", "focusin"].forEach(ev => strip.addEventListener(ev, hold, {passive: true}));
    ["pointerleave", "touchend", "focusout"].forEach(ev => strip.addEventListener(ev, release, {passive: true}));
    if ("IntersectionObserver" in window) new IntersectionObserver(es => { onScreen = es[0].isIntersecting; }, {threshold: 0.6}).observe(strip);
    setInterval(next, 3800);
  } }

/* sections rise in as they scroll into view (the animation itself is in theme.css; the check and the clinic stay still) */
if (!reduce) document.querySelectorAll("#p-home .section .wrap > *, #p-how .section .wrap > *, #p-faq .section .wrap > *, #p-about .section .wrap > *, .helpband .help-copy")
  .forEach(n => n.classList.add("reveal"));

/* ================= v4: camera ================= */
/* Photos are kept only in this page's memory as blob: URLs. Nothing is uploaded, analyzed or saved, and they are gone
   when the page or app closes. The file input lets the phone offer its camera ("Take Photo") or the photo library. */
const CAM_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.3-2h5.2l1.3 2h1.6A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="12.5" r="3.4" stroke="currentColor" stroke-width="1.9"/></svg>';
const docPhotos = [];
function paintDocPhotos(){
  const box = $("#docPhotos"); if (!box) return;
  box.classList.toggle("is-empty", !docPhotos.length);
  box.innerHTML = `<h3>${t("phH")}</h3><p class="noprint">${t("phP")}</p>
    <div class="ph-grid">${docPhotos.map((u, k) => `<figure class="ph-item"><img src="${u}" alt="${t("phAlt", {n: k + 1})}"><button type="button" class="ph-rm noprint" data-k="${k}">${t("phRm")}</button></figure>`).join("")}</div>
    <input type="file" id="phInput" class="sr-only" accept="image/*" multiple>
    <label class="btn btn--quiet cam-btn noprint" for="phInput">${CAM_SVG}<span>${t("phBtn")}</span></label>`;
  box.querySelector("#phInput").onchange = e => {
    [...e.target.files].forEach(f => { if (!f.type || /^image\//.test(f.type)) docPhotos.push(URL.createObjectURL(f)); });
    paintDocPhotos();
  };
  box.querySelectorAll(".ph-rm").forEach(b => b.onclick = () => { URL.revokeObjectURL(docPhotos.splice(+b.dataset.k, 1)[0]); paintDocPhotos(); });
}
window.__bcPhotos = () => { paintDocPhotos(); if (window.__bcResBrief) window.__bcResBrief(); };
/* starting the check over also clears the photos, in case someone else uses this phone next */
document.addEventListener("click", e => { if (e.target.closest("#restart")){ docPhotos.splice(0).forEach(u => URL.revokeObjectURL(u)); } }, true);

/* clinic: a photo of the CBC printout to read from while typing */
{ const inp = $("#labInput");
  if (inp){
    const view = $("#labView"), img = $("#labImg"), zoom = $("#labZoom"); let url = null;
    const setBig = big => { view.classList.toggle("is-big", big); zoom.textContent = big ? "Smaller" : "Bigger"; zoom.setAttribute("aria-pressed", big ? "true" : "false"); };
    inp.onchange = () => { const f = inp.files[0]; if (!f) return; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(f); img.src = url; view.hidden = false; inp.value = ""; };
    zoom.onclick = () => setBig(!view.classList.contains("is-big"));
    $("#labRm").onclick = () => { if (url) URL.revokeObjectURL(url); url = null; img.removeAttribute("src"); view.hidden = true; setBig(false); };
  } }

/* refresh v3 widgets when the language changes */
{ const prev = window.__bcStatic;
  window.__bcStatic = () => { applyLangShell(); prev && prev(); signs && signs(); dots && dots(); issueStat(); impact && impact();
    document.querySelectorAll("[data-ph]").forEach(e => e.placeholder = t(e.dataset.ph)); };
  window.__bcStatic(); }
