"""Build the HerTruth single file (formerly BleedCheck) from the tested app + new layout.
Quiz rules, iron model and scoring are copied unchanged from orig/bleedcheck.html."""
import base64, json, re, sys, pathlib
sys.path.insert(0, "src")
from strings import NEW, H1, ABOUT, HELP, ADD_EN
I18N = {p.stem: json.load(open(p)) for p in sorted((pathlib.Path(__file__).parent / 'src/i18n').glob('*.json'))}

R = pathlib.Path(__file__).parent
orig = (R / "orig/bleedcheck.html").read_text()
body = (R / "src/body.html").read_text()
css = (R / "src/style.css").read_text()
extra_css = (R / "src/extra.css").read_text()
theme_css = (R / "src/theme.css").read_text()
# Leaflet (map library, BSD-2) is built into the page so nothing loads from a CDN. It draws the "Find help" map only after
# someone searches; map tiles then come from CARTO (OpenStreetMap data) and places from OpenStreetMap's Nominatim.
LEAF = R / "vendor/leaflet"   # leaflet@1.9.4 (BSD-2, see vendor/leaflet/LICENSE)
leaflet_css = (LEAF / "leaflet.css").read_text()
leaflet_js = (LEAF / "leaflet.js").read_text()
# v4: no embedded or downloaded fonts. The page uses each device's own system fonts (SF Pro on iPhone,
# Roboto on Android, Segoe UI on Windows), which also cover every script we ship, so nothing is fetched.
MARK_SVG = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='19' fill='%23FFFBFC'/>"
  "<circle cx='20' cy='20' r='17.5' fill='none' stroke='%23C8376B' stroke-width='2.2' stroke-dasharray='2.6 3.1' stroke-linecap='round' opacity='.5'/>"
  "<path d='M20 7.5c-4.9 6.6-8.4 11-8.4 15.6a8.4 8.4 0 0 0 16.8 0c0-4.6-3.5-9-8.4-15.6Z' fill='%23C8376B'/>"
  "<path d='m16.3 23.2 2.7 2.7 5.1-5.6' fill='none' stroke='white' stroke-width='2.3' stroke-linecap='round' stroke-linejoin='round'/></svg>")

def uri(name):
    p = next((R / "assets").glob(name + ".*"))
    mime = "image/png" if p.suffix == ".png" else "image/jpeg"
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()

body = re.sub(r"\{\{IMG:(\w+)\}\}", lambda m: uri(m.group(1)), body)
body = body.replace("{{LANG_BUTTONS}}", "".join(f'<button type="button" data-lang="{c}" lang="{c}"' + (' dir="rtl"' if d else '') + f'>{n}</button>' for c, n, _, d in HELP))

# ---- script: take original, patch strings ----
NEW["en"].update(ADD_EN)
for c in ("es", "hi"): NEW[c].update(I18N[c])
FULL = {c: v for c, v in I18N.items() if c not in ("es", "hi")}
js = orig.split("<script>", 1)[1].rsplit("</script>", 1)[0]
for lang in ("en", "es", "hi"):
    add = "".join(f" {k}:{json.dumps(v, ensure_ascii=False)}," for k, v in NEW[lang].items())
    js, n = re.subn(rf"^{lang}:\{{\n", f"{lang}:{{\n{add}\n", js, count=1, flags=re.M)
    assert n == 1, lang
    block_re = rf"(^{lang}:\{{[\s\S]*?)(^ h1:\")(.*?)(\",)"
    js, n = re.subn(block_re, lambda m: m.group(1) + m.group(2) + H1[lang].replace('"', '\\"') + m.group(4), js, count=1, flags=re.M)
    assert n == 1, "h1 " + lang
    block_re = rf"(^{lang}:\{{[\s\S]*?)(^ about:\")(.*?)(\",)"
    js, n = re.subn(block_re, lambda m: m.group(1) + m.group(2) + ABOUT[lang].replace('"', '\\"') + m.group(4), js, count=1, flags=re.M)
    assert n == 1, "about " + lang

js = js.replace("\n}};\n\n/* ============ IRON MODEL", "\n},\n" + "".join(f"{c}:" + json.dumps(v, ensure_ascii=False) + ",\n" for c, v in FULL.items()) + "};\n\n/* ============ IRON MODEL", 1)
assert all(f"\n{c}:{{" in js for c in FULL), "language injection failed"

def swap(old, new, count=1):
    global js
    assert js.count(old) >= 1, "missing: " + old[:70]
    js = js.replace(old, new, count)

# rendering helpers: tabs, rich h1, English-only notes
swap('''function applyStatic(){
  document.documentElement.lang = L;
  document.querySelectorAll("[data-t]").forEach(el => el.textContent = t(el.dataset.t));''',
'''function applyStatic(){
  document.documentElement.lang = L;
  document.querySelectorAll("[data-t]").forEach(el => el.textContent = t(el.dataset.t));
  document.querySelectorAll("[data-th]").forEach(el => el.innerHTML = t(el.dataset.th));
  document.querySelectorAll("[data-enonly]").forEach(el => el.hidden = !t("enOnly"));
  if (window.__bcStatic) window.__bcStatic();''')

swap('''const show = id => ["intro","quiz","urgent","result","clinic"].forEach(s => $("#"+s).hidden = s !== id);''',
'''/* ---- tabs (HemoLife pattern) ---- */
const TABS = [...document.querySelectorAll('.tabs [role="tab"]')];
function selectTab(id, opts={}){
  const tab = document.getElementById(id); if (!tab) return;
  TABS.forEach(b => { const on = b === tab; b.setAttribute("aria-selected", on?"true":"false"); b.tabIndex = on?0:-1;
    document.getElementById(b.getAttribute("aria-controls")).hidden = !on; });
  document.body.dataset.tab = tab.dataset.hash;
  if (id === "t-clinic" && !$("#clinicFields").children.length) openClinic(true);
  try { history.replaceState(null, "", "#" + tab.dataset.hash); } catch(e){}
  if (opts.focus) tab.focus();
  if (!opts.keepScroll) window.scrollTo(0,0);
}
const toPanel = () => { const p = $("#checkPanel"); if (p) p.scrollIntoView({block:"start"}); };
const show = id => {
  if (id === "clinic"){ selectTab("t-clinic"); return; }
  ["intro","quiz","urgent","result"].forEach(s => $("#"+s).hidden = s !== id);
  if ($("#p-check").hidden) selectTab("t-check", {keepScroll:true});
};''')

# No auto-advance: picking an answer only selects it, and the person moves on with Next (team request, Oct 24, 2026).
swap('''A[q.id]=val; render(); if (q.id!=="urgent" || val==="no") setTimeout(go,160);''', '''A[q.id]=val; render();''')
swap('''$("#bar").style.width = (i / Q.length * 100) + "%";''', '''$("#bar").style.width = (i / Q.length * 100) + "%"; if (window.__bcProg) window.__bcProg(i);''')
swap("if (i < Q.length-1){ i++; render(); window.scrollTo(0,0); } else result();",
     "if (i < Q.length-1){ i++; render(); toPanel(); } else result();")

# result card: same logic and wording, HemoLife card styling, plus copy
swap('''  $("#result").innerHTML = `
  <div class="card">
    <p class="fine">${t("summary")}, ${new Date().toLocaleDateString(L)}</p>
    <div class="verdict ${cls}"><h2>${t(T1)}</h2><p>${t(B1)}</p></div>''',
'''  $("#result").innerHTML = `
  <div class="res-body" id="resCard">
    <p class="fine">${t("summary")}, ${new Date().toLocaleDateString(L)}</p>
    <div class="verdict ${cls}"><span class="tier">${t("tier_"+cls)}</span><h2>${t(T1)}</h2><p>${t(B1)}</p></div>''')
swap('''<h3>${t("hSay")}</h3><p>${t("say")}</p>`''', '''<h3>${t("hSay")}</h3><p class="say">${t("say")}</p>`''')
swap('''<div class="share"><h3 style="margin-top:0">${t("hShare")}</h3><p style="margin-bottom:0">${t("shareTxt")}</p></div>''',
     '''<div class="share"><h3>${t("hShare")}</h3><p>${t("shareTxt")}</p></div>''')
swap('''<div class="actions noprint"><button class="btn" id="print">${t("print")}</button><button class="btn quiet" id="restart">${t("restart")}</button></div>`;
  $("#bar").style.width="100%"; show("result"); window.scrollTo(0,0);''',
'''<div class="docphotos" id="docPhotos"></div>
  <div class="actions noprint"><button class="btn" id="print">${t("print")}</button><button class="btn btn--quiet" id="copy">${t("copy")}</button><button class="btn btn--quiet" id="restart">${t("restart")}</button></div>`;
  $("#bar").style.width="100%"; show("result"); toPanel(); if (window.__bcProg) window.__bcProg(Q.length);
  $("#copy").onclick = async () => { const b = $("#copy"), txt = $("#resCard").innerText;
    try { await navigator.clipboard.writeText(txt); b.textContent = t("copied"); }
    catch(e){ const r = document.createRange(); r.selectNodeContents($("#resCard")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = t("copyFail"); }
    setTimeout(() => { if (document.body.contains(b)) b.textContent = t("copy"); }, 2400); };
  if (window.__bcPhotos) window.__bcPhotos();''')

# clinic lives in its own tab now
swap('''function openClinic(){
  show("clinic");''', '''function openClinic(fromTab){
  if (!fromTab) selectTab("t-clinic");''')
swap('''`<div class="field"><label for="c_${k}">''', '''`<div class="cfield"><label for="c_${k}">''')
swap('''$("#start").onclick = () => { i=0; show("quiz"); render(); };''',
'''const startQuiz = () => { for (const k in A) delete A[k]; i=0; show("quiz"); render(); toPanel(); };
$("#start").onclick = startQuiz;
document.querySelectorAll(".js-start").forEach(b => b.onclick = startQuiz);''')
swap('''$("#openClinic").onclick = openClinic;''', '''$("#openClinic").onclick = () => openClinic();''')
swap('''$("#closeClinic").onclick = () => show("intro");''', '''$("#closeClinic").onclick = () => selectTab("t-home");''')

swap('''document.querySelectorAll(".langs button").forEach(b => b.setAttribute("aria-pressed"''', '''document.querySelectorAll(".langs button[data-lang]").forEach(b => b.setAttribute("aria-pressed"''')
swap('''document.querySelectorAll(".langs button").forEach(b => b.onclick''', '''document.querySelectorAll(".langs button[data-lang]").forEach(b => b.onclick''')
swap('''  $("#ironOut").innerHTML = html;''', '''  $("#ironOut").innerHTML = html; if (window.__bcExplain) window.__bcExplain(v);''')
# PBAC heavy-bleeding cutoff: Higham 1990 defines heavy bleeding as a score of 100 OR MORE. The tested app used "> 100",
# so a score of exactly 100 was not called heavy. Changed Oct 24, 2026 at the team's request (see DATA_VALIDATION_REPORT.md).
# The Philipp screen rule stays "> 185", as in the Philipp study.
swap('t("score",{s}) + (s > 100 ? t("scoreHeavy") : "")', 't("score",{s}) + (s >= 100 ? t("scoreHeavy") : "")')
swap('const heavy = (pb!==null && pb>100)', 'const heavy = (pb!==null && pb>=100)')
swap('pb + (pb>100 ? t("scoreHeavy") : "")', 'pb + (pb>=100 ? t("scoreHeavy") : "")')
swap('scoreHeavy:" (above 100 counts as heavy bleeding)"', 'scoreHeavy:" (100 or more counts as heavy bleeding)"')
swap('scoreHeavy:" (más de 100 se considera sangrado abundante)"', 'scoreHeavy:" (100 o más se considera sangrado abundante)"')
swap('scoreHeavy:" (100 से ज़्यादा को ज़्यादा खून बहना माना जाता है)"', 'scoreHeavy:" (100 या उससे ज़्यादा को ज़्यादा खून बहना माना जाता है)"')

wire = (R / "src/wire.js").read_text()
swap("applyStatic();\n})();", "const HELP = " + json.dumps(HELP, ensure_ascii=False) + ";\nconst SITE = " + (R / "build/site_data.json").read_text() + ";\nconst CASES = " + (R / "orig/tests/app_test_cases.json").read_text() + ";\n" + wire + "\napplyStatic();\n})();")

head = f'''<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>HerTruth</title>
<meta name="description" content="HerTruth, built in partnership with The Factor Foundation: a free, private check for heavy periods and bleeding disorders, in 16 languages.">
<meta name="theme-color" content="#FFFBFC">
<meta name="color-scheme" content="light">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="HerTruth">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,{MARK_SVG}">
<link rel="apple-touch-icon" href="{uri("touch")}">
<style>
/* No web fonts: system fonts only, so the app works offline and makes no third-party requests */
{css}
{extra_css}
{theme_css}
{leaflet_css}
</style>
</head>
<body data-tab="home">
'''
out = head + body + "\n<script>" + leaflet_js + "</script>\n<script>" + js + "</script>\n</body>\n</html>\n"
# Rebrand: the tested app's own strings (quiz, results, footer) still say BleedCheck; the product is now HerTruth.
out = out.replace("BleedCheck", "HerTruth")
(R / "build").mkdir(exist_ok=True)
(R / "build/hertruth.html").write_text(out)
print("ok", len(out) // 1024, "KB")
