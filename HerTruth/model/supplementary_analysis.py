"""Supplementary analyses for the BleedCheck paper.
The notebook BleedCheck_Iron_NHANES_v2.ipynb is NOT modified. This script executes its first four code cells
verbatim (imports, cohort, features/split, model definitions) so the split and models are identical, then adds:
Table 1, bootstrap 95% CIs, a hemoglobin-only comparator, a CBC-only (no hs-CRP) model, and the app's
hs-CRP-blank behavior. Run from the folder that contains the notebook and sample_data/."""
import json, io, contextlib, numpy as np, pandas as pd, matplotlib; matplotlib.use("Agg")
from sklearn.metrics import roc_auc_score, confusion_matrix, roc_curve
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import cross_val_predict, cross_val_score

nb = json.load(open("BleedCheck_Iron_NHANES_v2.ipynb")); g = {}
cells = ["".join(c["source"]) for c in nb["cells"] if c["cell_type"] == "code"]
for src in cells[:3]:
    with contextlib.redirect_stdout(io.StringIO()): exec(src, g)
exec(cells[3].split("for name")[0], g)          # rf, lr, cv exactly as defined in the notebook
d, y, Xtr, Xte, ytr, yte, rf, lr, cv, FEATURES = [g[k] for k in "d y Xtr Xte ytr yte rf lr cv FEATURES".split()]
yv = np.asarray(yte)

cbc = pd.read_sas("sample_data/P_CBC.xpt", format="xport")
print("MCH-like columns in P_CBC:", [c for c in cbc.columns if c.startswith("LBXMC")], "| LBXMC1SI present:", "LBXMC1SI" in cbc.columns)
print("Modeling cohort n=%d, ID=%d (%.1f%%) | train %d (ID %d) | test %d (ID %d)" % (len(d), y.sum(), 100*y.mean(), len(Xtr), ytr.sum(), len(Xte), yte.sum()))

print("\nTABLE 1, median (IQR)")
grp = d.iron_deficient == 1
print("variable | iron deficient (n=%d) | not iron deficient (n=%d)" % (grp.sum(), (~grp).sum()))
for col, name in [("RIDAGEYR","Age, y"),("LBXHGB","Hemoglobin, g/dL"),("LBXMCVSI","MCV, fL"),("LBXRDW","RDW, %"),
                  ("LBXRBCSI","RBC, million/uL"),("LBXPLTSI","Platelets, 1000/uL"),("LBXHSCRP","hs-CRP, mg/L"),("LBXFER","Ferritin, ng/mL")]:
    f = lambda s: "%.1f (%.1f-%.1f)" % (s.median(), s.quantile(.25), s.quantile(.75))
    print(name, "|", f(d.loc[grp, col]), "|", f(d.loc[~grp, col]))
an = d.LBXHGB < 12
print("Hgb < 12: iron deficient %d/%d ; not iron deficient %d/%d" % (an[grp].sum(), grp.sum(), an[~grp].sum(), (~grp).sum()))
teen = d.RIDAGEYR <= 19
print("Age 12-19: n=%d, iron deficient %d" % (teen.sum(), d.loc[teen, "iron_deficient"].sum()))

rf.fit(Xtr, ytr); p = rf.predict_proba(Xte)[:, 1]
lr.fit(Xtr, ytr); pl = lr.predict_proba(Xte)[:, 1]
oof = cross_val_predict(lr, Xtr, ytr, cv=cv, method="predict_proba")[:, 1]
_, t_, th_ = roc_curve(ytr, oof); THR = float(th_[int(np.argmax(t_ >= 0.85))])
print("\nReproduced: RF test AUC %.3f | LR test AUC %.3f | cutoff %.3f" % (roc_auc_score(yv, p), roc_auc_score(yv, pl), THR))

def ss(pred):
    tn, fp, fn, tp = confusion_matrix(yv, pred, labels=[0, 1]).ravel(); return tp, fn, fp, tn
tp, fn, fp, tn = ss((pl >= THR).astype(int))
print("LR at cutoff: TP %d FN %d FP %d TN %d | sens %.3f spec %.3f PPV %.3f NPV %.3f" % (tp, fn, fp, tn, tp/(tp+fn), tn/(tn+fp), tp/(tp+fp), tn/(tn+fn)))
tp, fn, fp, tn = ss((Xte.LBXHGB < 12).astype(int))
print("Hemoglobin < 12 alone (test set): TP %d FN %d FP %d TN %d | sens %.3f spec %.3f" % (tp, fn, fp, tn, tp/(tp+fn), tn/(tn+fp)))

F2 = [f for f in FEATURES if f != "LBXHSCRP"]
lr2 = make_pipeline(StandardScaler(), LogisticRegression(class_weight="balanced", max_iter=2000))
cvs = cross_val_score(lr2, Xtr[F2], ytr, cv=cv, scoring="roc_auc"); lr2.fit(Xtr[F2], ytr); pl2 = lr2.predict_proba(Xte[F2])[:, 1]
oof2 = cross_val_predict(lr2, Xtr[F2], ytr, cv=cv, method="predict_proba")[:, 1]
_, t_, th_ = roc_curve(ytr, oof2); THR2 = float(th_[int(np.argmax(t_ >= 0.85))])
tp, fn, fp, tn = ss((pl2 >= THR2).astype(int))
print("CBC-only LR (no hs-CRP): CV AUC %.3f +/- %.3f | test AUC %.3f | cutoff %.3f | sens %.3f spec %.3f" % (cvs.mean(), cvs.std(), roc_auc_score(yv, pl2), THR2, tp/(tp+fn), tn/(tn+fp)))

M = json.load(open("bleedcheck_iron_model.json")); Xm = Xte.copy(); Xm["LBXHSCRP"] = M["impute_medians"]["LBXHSCRP"]
pm = lr.predict_proba(Xm)[:, 1]; tp, fn, fp, tn = ss((pm >= THR).astype(int))
print("App with hs-CRP left blank (median %.2f): test AUC %.3f | sens %.3f spec %.3f" % (M["impute_medians"]["LBXHSCRP"], roc_auc_score(yv, pm), tp/(tp+fn), tn/(tn+fp)))

rng = np.random.default_rng(42); B = 2000; A = {"rf": [], "lr": [], "cbc": [], "diff": [], "sens": [], "spec": []}
for _ in range(B):
    i = rng.integers(0, len(yv), len(yv))
    if yv[i].min() == yv[i].max(): continue
    A["rf"].append(roc_auc_score(yv[i], p[i])); A["lr"].append(roc_auc_score(yv[i], pl[i])); A["cbc"].append(roc_auc_score(yv[i], pl2[i]))
    A["diff"].append(A["lr"][-1] - A["cbc"][-1])
    tn, fp, fn, tp = confusion_matrix(yv[i], (pl[i] >= THR).astype(int), labels=[0, 1]).ravel(); A["sens"].append(tp/(tp+fn)); A["spec"].append(tn/(tn+fp))
print("\nBootstrap 95%% CIs (%d resamples of the test set, seed 42):" % len(A["rf"]))
for k, lab in [("rf","RF test AUC"),("lr","LR test AUC"),("sens","LR sensitivity at cutoff"),("spec","LR specificity at cutoff"),("cbc","CBC-only LR test AUC"),("diff","LR AUC minus CBC-only AUC")]:
    print("  %s: %.3f to %.3f" % (lab, *np.percentile(A[k], [2.5, 97.5])))
print("\nLR standardized coefficients:", {f: round(float(c), 3) for f, c in zip(FEATURES, lr.named_steps["logisticregression"].coef_[0])})
