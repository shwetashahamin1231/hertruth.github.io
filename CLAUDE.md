# HerTruth: project context for Claude Code

HerTruth (formerly BleedCheck) is a Congressional App Challenge 2026 entry (NJ-12), built by Nilakshya Rajora, Dev Amin and Vaibhav Appalaneni
in partnership with The Factor Foundation. Naveen is helping them. Deadline: Monday Oct 26, 2026, 12:00 pm EDT.

## Layout (since Oct 25, 2026)

- `HerTruth/`: **the release**. web/, ios/, model/, source/, docs/. Read `HerTruth/README.md` first.
  Edit `HerTruth/source/src/`, then `cd HerTruth/source && python3 build.py` (writes web/index.html and ios/HerTruth/hertruth.html).
- `_archive_dev_2026-10-25/` was moved to the macOS Trash on Oct 25, 2026 (recoverable until the Trash is emptied). It held: test suites (`site_v3/tests`, 34 + 41 + 21 checks),
  the old site_v3 working copy and its detailed CLAUDE.md, NHANES data (`sample_data/`), reference PDFs, original photos,
  the original app and notebooks (`Submission/`), one-off translation and citation patch scripts, the Expo node_modules.

## Rules (unchanged)

- Never change the quiz logic, scoring or IRON_MODEL in `source/orig/bleedcheck.html`. Two team-approved patches live in
  build.py: no auto-advance, and PBAC heavy = 100 or more (Higham 1990).
- Never invent or change numbers. Every figure traces to the notebook, model/export_site_data.py,
  model/supplementary_analysis.py, or a cited source. The old validation report is in git history (commit 4e14a32).
- The bleeding check is the published Philipp tool, not AI.
- Writing for publication: no em dashes, plain wording, honest limits.
- Test suites, the translation checker and the validation report were removed for release. They are in git history
  before the production cleanup commit, and the old test suites are in the macOS Trash archive.
