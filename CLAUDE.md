# Kennzeichen Abenteuer

Kids' quiz game (ages 5–10) for learning German licence-plate area codes. Expo / React Native + TypeScript for iOS, Android and web. The UI is in German, the code and docs in English. Overview and structure: see README.md.

## Origin

This game was built inside the **Kennzeichen Finder** app (`~/Projects/GermanVehicleRegistrationDetails`, a plate lookup PWA + app) and was then moved into its own repository.

- `src/data/plates.json` is a copy of that app's data. It is generated there from `tools/raw.txt` by `tools/build.py`. If the codes change, copy the file over again.
- Expo, React Native and React versions were kept the same as in Kennzeichen Finder.

## Design

- The design mock-up has: a title sign + two kids + a car with a `WOB` plate at the top; a wooden board holding three glossy mode buttons (blue "Stadt raten", purple "Bundesland raten", orange "Zeit-Quiz"), each with a sticker icon and a round yellow play button; and three pastel tiles on grass (Highscore, Wissen, Einstellungen).
- `assets/images/*` were cut out of that 941×1672 mock-up. They are placeholders that look soft on tablets; the app icon is just a square crop. Replace them with full-resolution artwork before release.
- Buttons, board and tiles are built in code (`ChunkyButton`, `WoodBoard`, `PlayIcon`) and the colours in `src/theme.ts` were sampled from the mock-up. The font is Fredoka.
- Plate letters use a plain bold system font, not Fredoka: Fredoka's rounded "B" was hard to read on a plate.

## Decisions for the age group

- Difficulty: **Leicht** = 40 hand-picked big cities with child-friendly short names (`EASY` in `src/game/questions.ts`) and 3 answers. **Mittel** = about 250 towns, **Schwer** = all 767 district codes; both have 4 answers. Official codes (BD, THW, Y, …) and the one code that spans two states are never asked.
- Read-aloud (expo-speech, `de-DE`) is on by default for pre-readers. The timed quiz does not read automatically (too fast), but its 🔊 button still works. The voice uses a raised pitch and the best installed German voice (`src/feedback.ts`) so it sounds younger.
- Answer sounds (expo-audio): applause when right, a soft "oh-oh" when wrong, applause at the end of a round. They can be switched on and off in Einstellungen and with the 🔔 button in the quiz header (same `sounds` setting). `assets/sounds/*.wav` are synthesised by `tools/make_sounds.py`; replace them with recorded sounds if you like. expo-audio is configured without microphone, Android recording or background playback, so the app requests no extra permissions.
- No failing: wrong answers show the right one ("Fast! Richtig ist: …") and the game moves on, and every finished round earns at least 1 star.
- Highscores and settings are stored on the device only (AsyncStorage). No accounts, ads, analytics or network access. Keep it that way: it is meant for the stores' Kids / Families categories.
- Navigation is plain state in `App.tsx` (no router), and the Android back button returns to the menu.

## Licence and repository

- Proprietary, all rights reserved (`LICENSE`, `"license": "UNLICENSED"` in package.json). Do not add open-source licence files.
- The GitHub repository is planned as **private**. GitHub's README, .gitignore and licence options are left empty because they already exist here.
- App ID: `com.shafeeque.kennzeichenabenteuer`.

## Checking changes

- `npm test` runs the logic tests (Node test runner), and `npm run typecheck` runs the typecheck.
- To check the UI, build for web (`npx expo export -p web`) and drive it with Playwright at 390×844. It also runs on a physical iPhone 15 (iOS 27); Android is not yet tested.

## iOS builds

- iOS bundle ID is `com.shafeeque.kennzeichenabenteuer.game` (Android still `com.shafeeque.kennzeichenabenteuer`); Apple team `LM69NV5F9M` is set in `app.json`.
- iOS 27 kills apps at launch (SIGTRAP in `_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`) unless they adopt the UIScene life cycle, and the SDK 57 prebuild template doesn't. `plugins/withSceneLifecycle.js` fixes this by adding a scene manifest that uses Expo's `ExpoAppSceneDelegate` and by stopping `AppDelegate` from creating the window. Keep it until the Expo template does this itself. Kennzeichen Finder needs the same fix.
- `ios/` is generated (`npx expo prebuild -p ios --clean`) and git-ignored; don't edit it by hand.
- Install on a connected iPhone: `npx expo run:ios --device --configuration Release`.
