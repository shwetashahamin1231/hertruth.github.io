"""Validate a translation file: python3 check_i18n.py <code> [delta]"""
import json, re, sys, pathlib
R = pathlib.Path(__file__).parent
code = sys.argv[1]; delta = len(sys.argv) > 2
src = json.load(open(R / "build" / ("en_eshi_delta.json" if delta else "en_source.json")))
tr = json.load(open(R / "src" / "i18n" / f"{code}.json"))
errs = []
missing = set(src) - set(tr); extra = set(tr) - set(src)
if missing: errs.append(f"missing keys: {sorted(missing)}")
if extra: errs.append(f"extra keys: {sorted(extra)}")
for k, v in src.items():
    if k not in tr: continue
    t = tr[k]
    if not isinstance(t, str) or not t.strip(): errs.append(f"{k}: empty"); continue
    for ph in re.findall(r"\{\w+\}", v):
        if ph not in t: errs.append(f"{k}: placeholder {ph} missing")
    for tag in re.findall(r"</?\w+>", v):
        if t.count(tag) != v.count(tag): errs.append(f"{k}: tag {tag} count differs")
    if re.search(r"</?(?!em\b)\w+>", t): errs.append(f"{k}: unexpected HTML tag")
    if "—" in t: errs.append(f"{k}: contains an em dash, rephrase")
    if t.strip() == v.strip() and len(v) > 25 and k not in ("tk5",): errs.append(f"{k}: identical to English (untranslated?)")
print("OK" if not errs else "\n".join(errs[:60]))
