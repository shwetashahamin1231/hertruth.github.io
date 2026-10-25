"""Rebuild the notebook's NHANES cohort and test split (same code, seed 42), then score the held-out
test set with the exact model the notebook exported (bleedcheck_iron_model.json).
Writes site_data.json: only aggregates (ROC curve, counts, medians). No participant rows."""
import json, numpy as np, pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, roc_curve

P = "data/"
rd = lambda f: pd.read_sas(P + f, format="xport")
demo, cbc, fer, crp = rd("P_DEMO.xpt"), rd("P_CBC.xpt"), rd("P_FERTIN.xpt"), rd("P_HSCRP.xpt")
d = demo[["SEQN", "RIAGENDR", "RIDAGEYR", "RIDEXPRG"]].merge(cbc, on="SEQN").merge(fer[["SEQN", "LBXFER"]], on="SEQN").merge(crp[["SEQN", "LBXHSCRP"]], on="SEQN", how="left")
d = d[(d.RIAGENDR == 2) & d.RIDAGEYR.between(12, 49) & (d.RIDEXPRG != 1)]
d = d.dropna(subset=["LBXFER", "LBXHGB", "LBXMCVSI", "LBXRDW"])
d["iron_deficient"] = (d.LBXFER < 15).astype(int)
cohort_n, cohort_id = len(d), int(d.iron_deficient.sum())
cohort_id_normal_hgb = int(((d.iron_deficient == 1) & (d.LBXHGB >= 12)).sum())
F = ["RIDAGEYR", "LBXHGB", "LBXMCVSI", "LBXRDW", "LBXRBCSI", "LBXPLTSI", "LBXHSCRP"]
d = d.dropna(subset=F)
X, y = d[F], d.iron_deficient.values
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

M = json.load(open("orig/results/bleedcheck_iron_model.json"))
assert M["features"] == F
z = M["intercept"] + sum(M["coef"][j] * (Xte[f].values - M["scaler_mean"][j]) / M["scaler_scale"][j] for j, f in enumerate(F))
p = 1 / (1 + np.exp(-z))
auc = roc_auc_score(yte, p)
thr = M["threshold"]
def cm(pred):
    tp = int(((pred == 1) & (yte == 1)).sum()); fn = int(((pred == 0) & (yte == 1)).sum())
    fp = int(((pred == 1) & (yte == 0)).sum()); tn = int(((pred == 0) & (yte == 0)).sum())
    return dict(tp=tp, fn=fn, fp=fp, tn=tn)
app = cm((p >= thr).astype(int)); hgb = cm((Xte.LBXHGB.values < 12).astype(int))
print(f"cohort {cohort_n} ID {cohort_id} ID&Hgb>=12 {cohort_id_normal_hgb} | modeling n {len(d)} | test {len(yte)} ID {int(yte.sum())}")
print(f"test AUC {auc:.3f} | app cutoff {thr:.3f}: {app} | Hgb<12: {hgb}")
assert round(auc, 3) == M["test_auc"] and app == dict(tp=74, fn=17, fp=109, tn=323) and hgb == dict(tp=48, fn=43, fp=38, tn=394)

# ROC over a grid of cutoffs (every 0.01) so the site slider can show real test-set tradeoffs
grid = []
for t in np.round(np.arange(0.05, 0.96, 0.01), 2):
    c = cm((p >= t).astype(int)); grid.append([float(t), c["tp"], c["fn"], c["fp"], c["tn"]])
fpr, tpr, _ = roc_curve(yte, p)
keep = np.unique(np.linspace(0, len(fpr) - 1, 60).astype(int))
roc = [[round(float(fpr[k]), 4), round(float(tpr[k]), 4)] for k in keep]

# per-person overlap among the iron-deficient test cases (counts only)
idm = yte == 1; mf = (p >= thr)[idm]; hf = (Xte.LBXHGB.values < 12)[idm]
overlap = dict(both=int((mf & hf).sum()), model_only=int((mf & ~hf).sum()), hgb_only=int((~mf & hf).sum()), neither=int((~mf & ~hf).sum()))
print("overlap among test ID:", overlap)
# where do the app's reference cases come from?
cases = json.load(open("orig/tests/app_test_cases.json"))
def where(x):
    for name, XX, yy in (("test", Xte, yte), ("train", Xtr, ytr)):
        m = np.ones(len(XX), bool)
        for f in F: m &= np.isclose(XX[f].values, x[f])
        if m.any(): return name, int(yy[np.argmax(m)])
    return None, None
case_src = [where(c["x"]) for c in cases]
print("reference cases:", case_src)
med = lambda s: [round(float(s.median()), 1), round(float(s.quantile(.25)), 1), round(float(s.quantile(.75)), 1)]
table1 = {f: {"id": med(d.loc[d.iron_deficient == 1, f]), "not": med(d.loc[d.iron_deficient == 0, f])} for f in F}
out = {"source": "CDC NHANES 2017-March 2020 (P_DEMO, P_CBC, P_FERTIN, P_HSCRP); cohort and split rebuilt with the notebook's code, seed 42; scored with the exported bleedcheck_iron_model.json",
       "cohort_n": cohort_n, "cohort_id": cohort_id, "cohort_id_normal_hgb": cohort_id_normal_hgb,
       "model_n": int(len(d)), "model_id": int(y.sum()), "train_n": int(len(ytr)), "test_n": int(len(yte)), "test_id": int(yte.sum()),
       "test_auc": round(float(auc), 3), "cutoff": round(thr, 3), "app": app, "hgb12": hgb, "grid": grid, "overlap": overlap, "case_src": case_src, "roc": roc, "table1": table1}
json.dump(out, open("build/site_data.json", "w"))
print("wrote build/site_data.json", len(json.dumps(out)), "bytes")
