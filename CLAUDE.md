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
- Read-aloud (expo-speech, `de-DE`) is on by default for pre-readers. The timed quiz does not read automatically (too fast), but its 🔊 button still works.
- No failing: wrong answers show the right one ("Fast! Richtig ist: …") and the game moves on, and every finished round earns at least 1 star.
- Highscores and settings are stored on the device only (AsyncStorage). No accounts, ads, analytics or network access. Keep it that way: it is meant for the stores' Kids / Families categories.
- Navigation is plain state in `App.tsx` (no router), and the Android back button returns to the menu.

## Licence and repository

- Proprietary, all rights reserved (`LICENSE`, `"license": "UNLICENSED"` in package.json). Do not add open-source licence files.
- The GitHub repository is planned as **private**. GitHub's README, .gitignore and licence options are left empty because they already exist here.
- App ID: `com.shafeeque.kennzeichenabenteuer`.

## Checking changes

- `npm test` runs the logic tests (Node test runner), and `npm run typecheck` runs the typecheck.
- To check the UI, build for web (`npx expo export -p web`) and drive it with Playwright at 390×844. This has been verified on the web only, not yet in an iOS or Android simulator.
