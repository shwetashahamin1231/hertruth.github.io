# HerTruth data and citation validation report

Checked October 24, 2026. Every number on the site was traced to a file, and every file was traced to its source.
Every citation was checked against the paper or web page itself. Problems found are listed with the fix that was made.

## Verdict

- **The data is real, not made up.** The four NHANES files the model was trained on are byte-for-byte identical to
  the files downloaded from cdc.gov today. Every model number on the site reproduces from them by running the
  project's own code.
- **The model in the app is the model the notebook produced.** All five copies of the model file, and the copy
  inside the app, match the coefficients printed in the executed notebook.
- **The citations were mostly right.** Two needed fixing and one needed a limit added:
  1. Five heavy-period signs were credited to the CDC, but they are Mayo Clinic's list. **Fixed** in all 16 languages.
  2. One sentence overstated Perez Botero 2024. **Fixed** in all 16 languages.
  3. NHANES only records pregnancy for ages 20 to 44. **Added** to Limits.
- **The PBAC cutoff now matches Higham 1990.** Higham defines heavy bleeding as a chart score of 100 *or more*; the
  tested app counted only scores *above* 100. At the team's request this was changed (in build.py, with
  orig/bleedcheck.html kept as the baseline), the wording updated in all 16 languages, and tests added for 100 and 80.

## 1. How the site works, and where each piece of data comes from

```
cdc.gov NHANES 2017-Mar 2020 (P_DEMO, P_CBC, P_FERTIN, P_HSCRP .xpt)
   |  identical copies in sample_data/ and site_v3/source/data/
   |
   +--> notebook (BleedCheck_Iron_NHANES_v2) --> logistic regression --> bleedcheck_iron_model.json
   |                                                                          |
   |                                              copied unchanged into orig/bleedcheck.html (IRON_MODEL)
   |                                                                          |
   |                                              build.py --> hertruth.html: the clinic tool scores on your device
   |
   +--> export_site_data.py --> site_data.json (counts only, no participant rows)
   |        --> home "221 of 461", 91-dot grid, cutoff explorer, ROC, typical-values table
   |
   +--> supplementary_analysis.py --> 95% CIs, CBC-only model, hs-CRP-blank results (quoted in page text)

Published Philipp screening rule + PBAC chart (Higham 1990) --> quiz logic in orig/bleedcheck.html --> runs on device
Translations: AI first drafts in src/i18n, checked by check_i18n.py, flagged on every non-English page
```

Nothing typed into the site is sent anywhere. The test suite records zero network requests while switching
through all 16 languages.

## 2. Data checks

| Check | How | Result |
|---|---|---|
| NHANES files are genuine | Downloaded P_DEMO, P_CBC, P_FERTIN and P_HSCRP from wwwn.cdc.gov; compared SHA-256 hashes with sample_data/ | **All 4 identical** |
| Variables exist with the right units | CDC codebook pages (2017-March 2020 pre-pandemic) | RIAGENDR, RIDAGEYR, RIDEXPRG, LBXHGB g/dL, LBXMCVSI fL, LBXRDW %, LBXRBCSI million/µL, LBXPLTSI 1000/µL, LBXFER ng/mL, LBXHSCRP mg/L: **all present**. LBXMC1SI does not exist, as the notes said |
| Site counts and test results | export_site_data.py on the project files | cohort 2,656; 461 iron deficient; 221 with Hgb ≥ 12; test AUC 0.889; TP 74 / FN 17 / FP 109 / TN 323; Hgb < 12: 48 / 43 / 38 / 394; overlap 47 / 27 / 1 / 16: **reproduced; the script asserts them** |
| Cross-validation, random forest, leak check | Executed notebook outputs | LR CV AUC 0.905 ± 0.018; RF test AUC 0.882; shuffled-label AUC 0.492; cutoff 0.392; sensitivity 0.813, specificity 0.748: **match the site** |
| CIs, CBC-only, hs-CRP blank | Reran supplementary_analysis.py in a scratch folder **on the files downloaded from CDC** | LR AUC 95% CI 0.852 to 0.923; hs-CRP blank AUC 0.871, sensitivity 0.857, specificity 0.688; CBC-only AUC 0.873; PPV 0.404, NPV 0.950: **output identical to the saved file, line for line** |
| hs-CRP median 1.57 mg/L | Model file impute_medians | **matches** |
| Model in the app = notebook model | Compared coefficients, intercept, scaler, medians, cutoff | **All 5 model files and the app's IRON_MODEL match** |
| App math = Python math | app_test.js scores 6 held-out participants in the browser | **Difference at most 5.6e-17** |
| The 6 "real held-out cases" | export_site_data.py locates each one in the test split | **All 6 are test-set participants** (5 not iron deficient, 1 iron deficient) |

## 3. Citation checks

Local copies of five papers are in `References/`. The web checks were run today.

| Claim on the site | Source checked | Verdict |
|---|---|---|
| 217 US women with heavy periods; tool sensitivity 89% for hemostatic abnormalities, 95% with PBAC > 185 | Philipp 2011 (References/PMC4598044) | **Supported**, quoted from the abstract |
| 71% (154 of 217) had a hemostatic abnormality; 120 of 217 had platelet function defects | Philipp 2011, Results and Table 3 | **Supported** |
| The four screen criteria; "bleed through a tampon or napkin in 2 hours or less" | CDC screening tool PDF (References/MenorrhagiaforTesting-508) | **Supported** |
| "Philipp and colleagues, 2008 and 2011" | CDC tool lists both papers | **Supported** |
| 248 adolescents; 95% sensitivity; flags most without a problem | Zia 2018 (References/PMC6261667): sensitivity 95%, specificity 14% | **Supported** |
| VWD is the most common inherited bleeding disorder; 1 in 100 to 1 in 10,000; women come to care because of gynecologic and obstetric bleeding | James 2021 guideline (References/PMC7805340) | **Supported**, near-verbatim |
| Delays of 15 years or more to diagnosis | James 2021: "delays of 15 years or more from the onset of bleeding symptoms" | **Supported** |
| Stress, illness, pregnancy and estrogen can raise VWF | Perez Botero 2024 (References/PMC11665653); James 2021 calls VWF an acute-phase reactant | **Supported** |
| "Heavy periods from the very first cycles can be the first sign of VWD" | Perez Botero 2024 scores heavy bleeding "since menarche" in a bleeding score, but does not say it is the first sign | **Overstated, fixed** (below) |
| PBAC score of 100 or more = heavy bleeding | Higham 1990, Br J Obstet Gynaecol 97(8):734-739: a score of 100 or more, over 80% sensitivity and specificity | **Supported** (the app said "above 100"; changed to match) |
| Ferritin below 15 = iron deficiency | WHO 2020 ferritin guideline, table: < 15 µg/L for apparently healthy adolescents and adults | **Supported** |
| The five signs: more than 7 days, soaking every hour for several hours in a row, two pads at once, changing at night, clots as big as a quarter ("The CDC lists...") | CDC's current page lists more than 7 days, flooding, clots "bigger than a grape", and soaking "every hour or more often on the heaviest day(s)"; no double protection or night changes. **Mayo Clinic** (updated Aug 29, 2026) lists all five | **Wrong source, fixed** |
| Treatment center links | cdc.gov HTC page (links to the HTC directory) and NBDF resources page | **Both load** and are the right pages |

## 4. Fixes made

1. **Signs credit, CDC to Mayo Clinic** in `d1p`, `sgZero`, `mf1a` and `fq2a`, in all 16 languages
   (`source/fix_citations.py`). The content did not change.
2. **fq7a reworded** in all 16 languages. It now reads: "Heavy periods since the very first period are one of the
   signs doctors count when checking for a bleeding disorder such as von Willebrand disease (Perez Botero, 2024)."
3. **Full citations** with journal, volume, pages and DOI in the site footer's "Sources and research notice".
   The list now includes Mayo Clinic, WHO and the NHANES files.
4. **New limit** on How it works: NHANES releases pregnancy status only for ages 20 to 44, so pregnant girls and women
   outside that range could not be removed from the training data.
5. **PBAC heavy cutoff changed from "above 100" to "100 or more"** (Higham 1990): three comparisons patched in
   `build.py`, the wording updated in all 16 languages (`source/fix_pbac.py`), and How it works updated. The Philipp
   rule stays "above 185", as in that study. New tests: a score of exactly 100 is heavy, 80 is not.
6. All 15 translations still pass `check_i18n.py` after the fixes.

## 5. Still open

- **Translations** are AI first drafts. The site says so on every non-English page.
- **The 89% / 95% figures** are for hemostatic abnormalities, mostly platelet function defects, as the site already
  says. They are not figures for von Willebrand disease alone.

## 6. How to repeat these checks

```bash
cd ~/Desktop/BleedCheck/site_v3/source && python3 export_site_data.py
```

```bash
cd ~/Desktop/BleedCheck/site_v3 && node tests/app_test.js && node tests/all_langs_test.js && node tests/v4_test.js
```

To repeat the CDC file check, download the four .xpt files from
https://wwwn.cdc.gov/Nchs/Data/Nhanes/Public/2017/DataFiles/ (for example P_CBC.xpt) and compare them with
`shasum -a 256`.
