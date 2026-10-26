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
  const run = () => { clearInterval(timer); if (!paused) timer = setInterval(() => { if (!document.hidden) step(); }, 3000); };
  const btn = $("#helpPause");
  btn.onclick = () => { paused = !paused; btn.setAttribute("aria-pressed", paused ? "true" : "false"); btn.firstElementChild.dataset.t = paused ? "helpPlay" : "helpPause"; btn.firstElementChild.textContent = t(btn.firstElementChild.dataset.t); run(); };
  const band = $("#help");
  band.addEventListener("focusin", () => clearInterval(timer)); band.addEventListener("focusout", run);
  const start = () => { const k = HELP.findIndex(h => h[0] === L); idx = k < 0 ? 0 : k; turn = idx; paint(); run(); };
  start(); return {start};
})();

/* photos used in more than one place are embedded once and copied here, so the file does not grow */
document.querySelectorAll("img[data-src-from]").forEach(i => { const s = document.querySelector(`img[data-name="${i.dataset.srcFrom}"]`); if (s) i.src = s.src; });

/* ================= v4: tap a photo to see it full screen ================= */
{ const lb = $("#lightbox"), img = $("#lbImg"), cap = $("#lbCap"); let list = [], at = 0, back = null;
  const show = n => { at = (n + list.length) % list.length; const i = list[at], f = i.closest("figure"), c = f && f.querySelector("figcaption");
    img.src = i.src; img.alt = i.alt; cap.textContent = c ? c.textContent : i.alt;
    $("#lbPrev").hidden = $("#lbNext").hidden = list.length < 2; };
  const open = i => { const group = i.closest(".team-photos, .events"); list = group ? [...group.querySelectorAll("img")] : [i];
    back = i; show(list.indexOf(i)); lb.hidden = false; document.documentElement.classList.add("lb-open"); $("#lbX").focus(); };
  const shut = () => { lb.hidden = true; img.removeAttribute("src"); document.documentElement.classList.remove("lb-open"); if (back) back.focus(); };
  document.querySelectorAll(".team-photos img, .events img").forEach(i => {
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
    more.insertAdjacentHTML("beforeend", `<button type="button" class="btn btn--quiet res-find" id="resFindTop"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.9"/></svg><span>${t("fdH")}</span></button>`);
    $("#resCard").after(more);
    const next = document.createElement("div"); next.className = "res-next";
    next.innerHTML = `<h3>${t("resNextH")}</h3><p>${t("resNextP")}</p><button type="button" class="btn" id="resFind"><span>${t("fdH")}</span></button>`;
    $("#resCard").appendChild(next);
    $("#resFind").onclick = () => selectTab("t-find");
    $("#resFindTop").onclick = () => selectTab("t-find");
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

/* ================= v6: find help near you =================
   Nothing loads until someone searches or taps "Use my location". Then OpenStreetMap's Nominatim finds the place and
   nearby hospitals, clinics and doctors, and Leaflet draws them on OpenStreetMap's map tiles. Only the place
   (typed, or the phone's location if they allow it) is sent. Check answers are never part of it. */
{ const form = $("#fdForm");
  if (form){
    let at = null, list = [], kind = "hematologist";
    const say = (k, raw) => { $("#fdStatus").textContent = raw != null ? raw : (k ? t(k) : ""); };
    const esc = v => String(v).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[c]);
    const enc = encodeURIComponent;
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
    const kind_ = g => g.emergency === "yes" ? t("fdER") : /hospital/.test(g.amenity || g.healthcare || "") ? t("fdHosp") : /doctor/.test(g.amenity || g.healthcare || "") ? t("fdDoc") : t("fdClinic");
    const SPEC = /haemato|hemato|h(a)?emophilia|bleeding|blood disorder/i;
    /* places come from OpenStreetMap's Nominatim search, one term at a time inside a box around the person
       (Nominatim allows about one request per second, so the terms run in turn). */
    const TERMS = {
      "hematologist": ["hematology", "hematologist", "oncology", "hospital"],
      "gynecologist": ["gynecology", "obstetrics", "women's health", "hospital"],
      "pediatrician OR family doctor": ["pediatrician", "family medicine", "doctors", "clinic"],
      "urgent care": ["urgent care", "hospital", "clinic"],
    };
    const cache = {};
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const places = async (lat, lon, k) => {
      const key = `${lat.toFixed(3)},${lon.toFixed(3)},${k}`; if (cache[key]) return cache[key];
      const d = .22, box = [lon - d * 1.3, lat + d, lon + d * 1.3, lat - d].map(v => v.toFixed(4)).join(",");
      const seen = new Map(); let ok = false;
      for (const [n, term] of TERMS[k].entries()){
        if (n) await wait(1100);
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&extratags=1&limit=40&bounded=1&viewbox=${box}&q=${enc(term)}`, {headers: {"Accept-Language": L}});
          if (!r.ok) continue; ok = true;
          for (const x of await r.json()){
            if (!x.name || /^(hospital|clinic|doctors?|medical (center|centre)|urgent care)$/i.test(x.name.trim())) continue;
            const id = x.osm_type + x.osm_id; if (seen.has(id)) continue;
            const g = Object.assign({}, x.extratags || {}, {name: x.name});
            if (x.category === "amenity" || x.category === "healthcare") g[x.category] = x.type;
            seen.set(id, {g, lat: +x.lat, lon: +x.lon, term, fit: term !== "hospital" && term !== "clinic" && term !== "doctors"});
          }
        } catch(e){}
      }
      if (!ok) throw new Error("nominatim unavailable");
      return cache[key] = [...seen.values()];
    };
    /* what each "who to look for" chip matches in OpenStreetMap tags and names */
    const MATCH = {
      "hematologist": /h(a)?ematolog|oncolog|blood/i,
      "gynecologist": /gyn|obstet|ob\/gyn|women|maternity/i,
      "pediatrician OR family doctor": /p(a)?ediatric|children|family|general|primary|community health/i,
      "urgent care": /urgent|emergency|walk.?in|immediate/i,
    };
    const fits = p => MATCH[kind].test([p.g["healthcare:speciality"], p.g.name, p.g.description, p.g.healthcare, p.g.emergency === "yes" && kind === "urgent care" ? "emergency" : ""].join(" "));
    /* the map: Leaflet with OpenStreetMap tiles. Pins are numbered to match the list. */
    let map = null, layer = null, shownPins = [];
    const LF = window.L;   /* Leaflet. Inside the app, plain L is the current language code */
    const ensure = () => {
      const box = $("#fdMap"); const ph = $("#fdPh"); if (ph) ph.remove(); box.classList.add("on");
      if (map) return;
      map = LF.map(box, {scrollWheelZoom: false, zoomControl: true, attributionControl: true});
      /* OpenStreetMap's standard tiles: free, no key, attribution required (https://operations.osmfoundation.org/policies/tiles/) */
      LF.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {maxZoom: 19, referrerPolicy: "strict-origin-when-cross-origin",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map);
      layer = LF.layerGroup().addTo(map);
      addEventListener("resize", () => map.invalidateSize());
    };
    const icon = (n, fit) => LF.divIcon({className: "", html: `<b class="fd-pt${fit ? " fit" : ""}">${n}</b>`, iconSize: [28, 34], iconAnchor: [14, 34], popupAnchor: [0, -30]});
    const area = () => {
      ensure(); map.setView([at.lat, at.lon], 12); setTimeout(() => map.invalidateSize(), 60);
      layer.clearLayers();
      LF.circleMarker([at.lat, at.lon], {radius: 8, color: "#fff", weight: 3, fillColor: "#2F6FE4", fillOpacity: 1}).addTo(layer);
      const o = $("#fdOpenG"); o.hidden = false; o.href = `https://www.google.com/maps/search/${enc(kind)}/@${at.lat.toFixed(5)},${at.lon.toFixed(5)},12z`;
    };
    const pinAll = () => {
      if (!map) return; layer.clearLayers();
      LF.circleMarker([at.lat, at.lon], {radius: 8, color: "#fff", weight: 3, fillColor: "#2F6FE4", fillOpacity: 1}).addTo(layer);
      const pts = [[at.lat, at.lon]];
      shownPins.forEach((p, k) => {
        p.marker = LF.marker([p.lat, p.lon], {icon: icon(k + 1, p.fit), keyboard: false}).bindPopup(`<b>${esc(p.g.name)}</b><br>${esc(kind_(p.g))}`).addTo(layer)
          .on("click", () => { const li = $("#fdList").children[k]; if (li){ $("#fdList").querySelectorAll(".fd-item").forEach(x => x.classList.toggle("on", x === li)); li.scrollIntoView({block: "nearest", behavior: reduce ? "auto" : "smooth"}); } });
        if (k < 10) pts.push([p.lat, p.lon]);
      });
      map.fitBounds(pts, {padding: [28, 28], maxZoom: 15}); setTimeout(() => map.invalidateSize(), 60);
    };
    const pin = p => { if (!map) return; map.setView([p.lat, p.lon], 16); p.marker && p.marker.openPopup(); };
    const paint = () => {
      list.sort((a, b) => a.d - b.d);
      list.forEach(p => { p.fit = p.fit || fits(p); });
      const shown = [...list].sort((a, b) => (b.fit - a.fit) || (b.spec - a.spec) || (a.d - b.d)).slice(0, 25);
      shownPins = shown; pinAll();
      $("#fdList").innerHTML = shown.map((p, k) => {
        const st = p.open === true ? ["open", t("fdOpen")] : p.open === false ? ["closed", t("fdClosed")] : ["unk", t("fdHours")];
        const dist = `${nf(Math.round(p.d * 10) / 10)} km · ${nf(Math.round(p.d * 6.214) / 10)} mi`;
        const tel = p.g.phone || p.g["contact:phone"];
        return `<li class="fd-item${p.fit ? " fit" : ""}" data-k="${list.indexOf(p)}"><div class="fd-top"><b><span class="fd-n">${k + 1}</span>${esc(p.g.name)}</b><span class="fd-badge ${st[0]}">${st[1]}</span></div>
          <p class="fd-meta">${esc(kind_(p.g))} · ${dist}</p>
          <p class="fd-links"><button type="button" class="link fd-pin"><span>${t("fdShow")}</span></button>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}" target="_blank" rel="noopener noreferrer">${t("fdDir")} &#8599;</a>${tel ? ` <a href="tel:${esc(tel.split(/[;,]/)[0].replace(/[^\d+]/g, ""))}">${t("fdCall")}</a>` : ""}</p></li>`; }).join("");
      $("#fdList").querySelectorAll(".fd-pin").forEach(b => b.onclick = () => {
        const li = b.closest(".fd-item"); pin(list[+li.dataset.k]);
        $("#fdList").querySelectorAll(".fd-item").forEach(x => x.classList.toggle("on", x === li));
        $("#fdMap").scrollIntoView({block: "center", behavior: reduce ? "auto" : "smooth"}); });
      say(list.length ? null : "fdNone", list.length ? "" : null);
    };
    const go = async () => {
      if (!at) return; const {lat, lon} = at, k = kind;
      say("fdLoading"); $("#fdList").innerHTML = "";
      try {
        const got = await places(lat, lon, k); if (k !== kind) return;
        list = got.map(p => Object.assign(p, {d: km(lat, lon, p.lat, p.lon), open: openNow(p.g.opening_hours),
          spec: SPEC.test((p.g["healthcare:speciality"] || "") + " " + p.g.name)})).filter(p => p.d < 40);
        paint();
      } catch(err){ console.warn("find help:", err); list = []; say("fdErr"); }
    };
    const start = (lat, lon) => { at = {lat, lon}; area(); go(); };
    document.querySelectorAll(".fd-type").forEach(b => b.onclick = () => {
      kind = b.dataset.q;
      document.querySelectorAll(".fd-type").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      if (at){ area(); go(); } else $("#fdQ").focus();
    });
    form.addEventListener("submit", async e => { e.preventDefault(); const q = $("#fdQ").value.trim(); if (!q){ $("#fdQ").focus(); return; }
      try { say("fdLoading");
        const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=" + enc(q), {headers: {"Accept-Language": L}});
        const j = await r.json(); if (!j.length){ say("fdNone"); $("#fdList").innerHTML = ""; return; }
        start(+j[0].lat, +j[0].lon);
      } catch(err){ console.warn("find help:", err); say("fdErr");
        /* the map service is blocked or offline here: still offer the same search in Google Maps */
        const o = $("#fdOpenG"); o.hidden = false; o.href = "https://www.google.com/maps/search/" + enc(kind + " near " + q); } });
    $("#fdLoc").onclick = () => {
      if (!navigator.geolocation){ say("fdLocNo"); return; }
      say("fdLoading");
      navigator.geolocation.getCurrentPosition(pos => start(pos.coords.latitude, pos.coords.longitude), () => say("fdLocNo"), {timeout: 15000, maximumAge: 300000});
    };
  } }

/* ================= v7: pick a language before the check =================
   The first time someone starts the check in a visit, they choose the language first. Picking one switches the whole
   app and starts the check in it. Uses the native language names already in HELP and the translated "Language" label. */
{ let picked = false;
  const sheet = document.createElement("div");
  sheet.className = "lang-sheet noprint"; sheet.hidden = true;
  sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true"); sheet.setAttribute("aria-labelledby", "lsH");
  sheet.innerHTML = `<div class="ls-card"><button type="button" class="ls-x" aria-label="Close">&times;</button>
    <svg class="ls-mark" width="44" height="44" aria-hidden="true"><use href="#mark"/></svg>
    <h2 id="lsH"></h2><div class="ls-grid" role="group" aria-labelledby="lsH">${HELP.map(([c, n, , d]) => `<button type="button" data-ls="${c}" lang="${c}"${d ? ' dir="rtl"' : ""}>${n}</button>`).join("")}</div></div>`;
  document.body.appendChild(sheet);
  let go = null;
  const close = () => { sheet.classList.remove("in"); setTimeout(() => { sheet.hidden = true; }, reduce ? 0 : 260); document.documentElement.classList.remove("ls-open"); };
  const open = btn => {
    go = btn; $("#lsH").textContent = t("langLabel");
    sheet.querySelectorAll("[data-ls]").forEach(b => b.setAttribute("aria-pressed", b.dataset.ls === L ? "true" : "false"));
    sheet.hidden = false; document.documentElement.classList.add("ls-open");
    requestAnimationFrame(() => sheet.classList.add("in"));
    (sheet.querySelector('[aria-pressed="true"]') || sheet.querySelector("[data-ls]")).focus({preventScroll: true});
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("#start, .js-start, #sgGo"); if (!b || picked || b.closest(".lang-sheet")) return;
    e.preventDefault(); e.stopImmediatePropagation(); open(b);
  }, true);
  sheet.addEventListener("click", e => {
    if (e.target === sheet || e.target.closest(".ls-x")){ close(); return; }
    const b = e.target.closest("[data-ls]"); if (!b) return;
    picked = true;
    const real = document.querySelector(`.langs button[data-lang="${b.dataset.ls}"]`);
    if (real && b.dataset.ls !== L) real.click();
    close(); if (go) setTimeout(() => go.click(), reduce ? 0 : 120);
  });
  sheet.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
}

/* ================= v7: smooth language switching =================
   Changing the language cross-fades the whole page (View Transitions where supported, a short fade otherwise). */
document.addEventListener("click", e => {
  const b = e.target.closest(".langs button[data-lang]"); if (!b || b.__vt || reduce) return;
  e.stopImmediatePropagation();
  const run = () => { b.__vt = true; b.click(); b.__vt = false; };
  if (document.startViewTransition) document.startViewTransition(run);
  else { const m = document.querySelector("main"); m.classList.remove("lang-in"); run(); void m.offsetWidth; m.classList.add("lang-in"); }
}, true);

/* ================= v7: a soft glow that follows the mouse =================
   Mouse and trackpad only, off with reduced motion. A translucent rose light: it tints light surfaces and glows on dark
   ones (the blend mode follows the theme), and swells over anything you can press. Decorative only. */
{ if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce){
    const g = document.createElement("div"); g.className = "glow"; g.setAttribute("aria-hidden", "true"); document.body.appendChild(g);
    let x = -200, y = -200, cx = x, cy = y, raf = 0;
    const tick = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; g.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > .4 ? requestAnimationFrame(tick) : 0; };
    addEventListener("pointermove", e => { if (e.pointerType !== "mouse") return;
      if (!g.classList.contains("on")){ cx = x = e.clientX; cy = y = e.clientY; g.classList.add("on"); }
      x = e.clientX; y = e.clientY;
      g.classList.toggle("hot", !!(e.target.closest && e.target.closest("a, button, [role=tab], summary, input, label, .sign, .flip, img[role=button]")));
      if (!raf) raf = requestAnimationFrame(tick); }, {passive: true});
    addEventListener("pointerdown", () => { g.classList.remove("press"); void g.offsetWidth; g.classList.add("press"); }, {passive: true});
    document.documentElement.addEventListener("mouseleave", () => g.classList.remove("on"));
  } }

/* ================= v8: after the check, go straight to Find help =================
   When a result is ready the app opens Find help, with the result headline on top and a button back to the full
   summary. A flag preselects hematologists, other results gynecologists. Scoring is untouched. */
{ let sent = false;
  const res = $("#result");
  const esc = v => String(v).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[c]);
  const banner = () => {
    const v = $("#resCard .verdict"), top = $("#p-find .pt-text"); if (!v || !top) return;
    let b = $("#fdRes");
    if (!b){ b = document.createElement("div"); b.id = "fdRes"; b.className = "fd-res noprint"; top.prepend(b); }
    const cls = ["flag", "warn", "ok"].find(c => v.classList.contains(c)) || "ok";
    b.className = "fd-res noprint " + cls;
    b.innerHTML = `<b>${esc(v.querySelector("h2") ? v.querySelector("h2").textContent : "")}</b>
      <button type="button" class="btn btn--quiet" id="fdBack"><span>${esc(t("resMore"))}</span></button>`;
    $("#fdBack").onclick = () => { selectTab("t-check"); const m = $("#resMore"); if (m && $("#result").classList.contains("brief")) m.click(); };
  };
  if (res) new MutationObserver(() => { if (res.hidden){ sent = false; const b = $("#fdRes"); if (b) b.remove(); } })
    .observe(res, {attributes: true, attributeFilter: ["hidden"]});
  const base = window.__bcResBrief;
  window.__bcResBrief = () => {
    if (base) base();
    if (!res || res.hidden || !$("#resCard .verdict")) return;
    banner();
    if (sent) return; sent = true;
    const v = $("#resCard .verdict");
    selectTab("t-find");
    const chip = document.querySelector(`.fd-type[data-q="${v.classList.contains("flag") ? "hematologist" : "gynecologist"}"]`);
    if (chip) chip.click();
  };
}

/* remove the opening splash once it has faded */
{ const sp = document.getElementById("splash"); if (sp) setTimeout(() => sp.remove(), 1800); }

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
