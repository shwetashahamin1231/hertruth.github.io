"""After python3 build.py, copy the build to every place the app ships from:
    web/index.html               the website (drag the web/ folder onto Netlify)
    ios/HerTruth/hertruth.html   the Xcode iPhone app bundles this file
Both show this exact page, so the check, scoring and iron model are identical everywhere."""
import pathlib, shutil

R = pathlib.Path(__file__).parent
page = R / "build/hertruth.html"; top = R.parent
shutil.copyfile(page, top / "web/index.html"); print("web: ", top / "web/index.html")
shutil.copyfile(page, top / "ios/HerTruth/hertruth.html"); print("iOS: ", top / "ios/HerTruth/hertruth.html")
