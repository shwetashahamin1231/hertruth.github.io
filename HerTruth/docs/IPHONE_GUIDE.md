# HerTruth on iPhone

There are two iPhone versions. Both show the exact same HerTruth page as the website, bundled inside the app, so the
check, the scoring and the iron model are identical everywhere. Nothing typed or photographed leaves the phone.

| Folder | What it is | Needs |
|---|---|---|
| `ios/` | A native Xcode app (SwiftUI + WKWebView). Installs on your own iPhone like a real app. | Xcode, a free Apple Account, a USB cable |
| `expo/` | The same app built with Expo (React Native). Runs in the Expo Go app or the iOS Simulator. | Node.js, the free Expo Go app |

After any change to the site, run these from `source/` so both apps get the new page:

```bash
python3 build.py && python3 sync_apps.py
```

---

## Part 1. Install Xcode (one time, about 1 to 2 hours, mostly download)

Xcode was not on this Mac when I checked. If the App Store download is already running, skip to step 4.

1. Open the **App Store** app on the Mac.
2. Search **Xcode** (by Apple). Click **Get**, then **Install**. Sign in with your Apple Account if asked.
3. Wait. It is several GB. You can keep using the Mac.
4. Open **Xcode** from Launchpad or the Applications folder. Agree to the license if asked.
5. When Xcode asks which platforms to install, check **iOS** and click **Download & Install**. This adds the iPhone Simulator.
   If it does not ask: Xcode menu > **Settings** > **Components**, then click **Get** next to iOS.
6. Optional, lets command-line tools (and Claude) build the app. In Terminal, enter your Mac password when asked:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## Part 2. Run the Xcode app in the iPhone Simulator

1. In Finder, open `~/Desktop/BleedCheck/HerTruth/ios/` and double-click **HerTruth.xcodeproj**.
2. At the top of the Xcode window, click the device menu next to "HerTruth" and pick a simulator, for example **iPhone 17**.
3. Press the **Run** button (the triangle), or Command-R. The Simulator opens with HerTruth in it.
4. If Xcode asks to "Update to recommended settings", click **Perform Changes**. It is safe.

## Part 3. Run the Xcode app on your own iPhone (free, no paid developer account)

1. **Add your Apple Account to Xcode:** Xcode menu > **Settings** > **Accounts** > **+** > **Apple Account**, then sign in.
2. **Pick the team:** in Xcode's left sidebar click the blue **HerTruth** project, select the **HerTruth** target,
   open **Signing & Capabilities**, and set **Team** to *Your Name (Personal Team)*. Leave "Automatically manage signing" on.
   - If Xcode says the bundle identifier is unavailable, change **Bundle Identifier** to something unique,
     for example `org.thefactorfoundation.hertruth.nr`.
3. **Connect the iPhone** to the Mac with a cable. Unlock it and tap **Trust** when the phone asks.
4. **Turn on Developer Mode** on the iPhone: **Settings > Privacy & Security > Developer Mode** > on. The phone restarts;
   unlock it and tap **Turn On**. (The switch only appears after the phone has been connected to Xcode once.)
5. In Xcode's device menu, pick **your iPhone** (it is listed above the simulators). Press **Run**.
6. The first time, the phone may say "Untrusted Developer". Go to **Settings > General > VPN & Device Management**,
   tap your Apple Account under Developer App, then **Trust**. Open HerTruth from the Home Screen.

With a free Apple Account the app keeps working for 7 days. To renew, connect the phone and press Run again.

## Part 4. The Expo version

1. **Install Node.js once:** go to https://nodejs.org, download the **LTS** installer for macOS, and run it.
2. In Terminal:

```bash
cd ~/Desktop/BleedCheck/HerTruth/expo
```

```bash
npx expo start
```

3. **On your iPhone:** install **Expo Go** from the App Store. Put the iPhone on the same Wi-Fi as the Mac.
   Open the iPhone **Camera**, point it at the QR code in Terminal, and tap the banner. HerTruth opens in Expo Go.
   Allow "Local Network" if Expo Go asks.
4. **In the iPhone Simulator** (needs Xcode from Part 1): in the same Terminal window, press `i`.
5. If the phone cannot connect (some school or public Wi-Fi blocks it), stop with Control-C and run `npx expo start --tunnel`.
6. If Expo Go says the project's SDK is not supported, update Expo Go from the App Store. The project uses Expo SDK 58.

## Part 5. What to check on the phone before the demo video

- The check runs start to finish in English, Spanish and Hindi, and the result appears.
- On the result, **Take or add a photo** asks for camera permission the first time, then shows the photo. Remove works.
- In **For clinics**, **Photo of the lab report** shows the photo above the form while you type. Tap a case to see a score.
- **Print or save as PDF** opens the iPhone print sheet. Pinch out on the preview to save a PDF.
- Links such as **Find a treatment center** open in Safari.
- Turn on **Airplane Mode** and reopen the app: everything still works, because nothing is downloaded.
- Arabic and Urdu read right to left.

## What has been verified, and what has not

- The Xcode app **builds** with Xcode 27.1 for the iPhone Simulator, with no Swift warnings. The built app contains the
  current page, the camera permission text, the HerTruth name and the icon.
- It has **not run yet**: no iPhone Simulator was installed (see Part 1, step 5), and running on your phone needs your
  Apple Account (Part 3).
- The Expo app's code bundle compiles (`expo export`, `expo-doctor` 20/20), but it has not been opened on a phone yet.
