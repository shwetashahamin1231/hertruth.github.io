# HerTruth

A free, private check for heavy periods and bleeding disorders, in 16 languages. Founded by Nilakshya Rajora, Dev Amin and Vaibhav Appalaneni,
in partnership with The Factor Foundation. Congressional App Challenge 2026.

The check is the published Philipp screening tool (not AI). The clinic tool is a logistic regression trained on CDC NHANES
2017 to March 2020. Answers never leave the device. "Find help" contacts OpenStreetMap only when someone searches.
HerTruth is not a medical device and does not diagnose anything.

## What is in this folder

| Folder | What it is | How to use it |
|---|---|---|
| `web/` | The website: one file, everything built in | Drag the `web` folder onto your site's Deploys page in Netlify |
| `ios/` | The iPhone app (Swift, SwiftUI and WKWebView) showing the same page | Open `ios/HerTruth.xcodeproj` in Xcode, pick a phone, press Run. Steps in `docs/IPHONE_GUIDE.md` |
| `source/` | What the page is built from: `src/` (page, styles, scripts, 16 languages), `assets/` (photos), `data/` (model results and clinic cases shown on the page), `orig/bleedcheck.html` (the quiz rules and iron model, never edited), `vendor/` (Leaflet) | See "Changing the site" |
| `model/` | The iron model: the executed Colab notebook, the trained model (`.pkl` and the `.json` the page uses), the model card, and the scripts that produce the numbers on the page | Record of how the model was made |
| `docs/` | Congressional App Challenge guide and the iPhone guide | Read |

## Changing the site

Edit files in `source/src/`, then:

```bash
cd source && python3 build.py
```

`build.py` needs only Python 3 (no packages). It writes the page to `web/index.html` and `ios/HerTruth/hertruth.html`,
so the website and the app always ship the same page.

## Third-party code

- Find help: Leaflet 1.9.4 (BSD-2, bundled into the page from `source/vendor/leaflet`), map tiles from
  tile.openstreetmap.org, places from OpenStreetMap's Nominatim search (data © OpenStreetMap contributors, ODbL).
  The map loads when someone opens Find help, places only when they search. No API key.
