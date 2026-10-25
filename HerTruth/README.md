# HerTruth

A free, private check for heavy periods and bleeding disorders, in 16 languages. Founded by Nilakshya Rajora and Dev Amin, with Vaibhav Appalaneni on the team,
in partnership with The Factor Foundation. Congressional App Challenge 2026.

The check is the published Philipp screening tool (not AI). The clinic tool is a logistic regression trained on CDC NHANES
2017 to March 2020. Answers never leave the device. "Find help" contacts OpenStreetMap only when someone searches.
HerTruth is not a medical device and does not diagnose anything.

## What is in this folder

| Folder | What it is | How to use it |
|---|---|---|
| `web/` | The website: one file, everything built in | Drag the `web` folder onto your site's Deploys page in Netlify |
| `ios/` | The iPhone app (SwiftUI + WKWebView) | Open `ios/HerTruth.xcodeproj` in Xcode, pick a phone, press Run. Steps in `docs/IPHONE_GUIDE.md` |
| `model/` | The final model: `bleedcheck_iron_model.pkl`, its JSON export used by the app, the model card, results chart, executed notebook, and the scripts that reproduce every number | Read-only record |
| `source/` | What the site is built from: page, styles, scripts, photos, 16 languages, the tested quiz and model | See "Changing the site" |
| `docs/` | Congressional App Challenge checklist, iPhone guide, data and citation validation report | Read |

## Changing the site

Edit files in `source/src/`, then:

```bash
cd source && python3 build.py && python3 sync_apps.py
```

`build.py` needs only Python 3 (no packages). `sync_apps.py` copies the new build into `web/` and `ios/`, so both
always ship the same page. Translations are checked with `python3 check_i18n.py fr` (or `es delta` and `hi delta`).

## Third-party code

- Find help: Leaflet 1.9.4 (BSD-2, bundled into the page from `source/vendor/leaflet`), map tiles from
  tile.openstreetmap.org, places from OpenStreetMap's Nominatim search (data © OpenStreetMap contributors, ODbL).
  Nothing loads until someone opens the map or searches. No API key.

## Verified on October 25, 2026

The release build is byte-for-byte the tested build. All 96 automated checks passed on it (34 app, 41 all-language,
21 feature). The Xcode app builds. The four NHANES files the model was trained on match
cdc.gov byte for byte. Details are in `docs/DATA_VALIDATION_REPORT.md`.
