# Kennzeichen Abenteuer

A quiz game for children aged 5–10 that teaches German licence-plate area codes. It's built with Expo / React Native + TypeScript and runs on iOS, Android and the web. The game screens are in German.

## Game modes

| Mode | What the child does |
|---|---|
| **Stadt raten** | Sees a plate (e.g. `WOB`) and picks the city: 10 questions per round, 1–3 stars. |
| **Bundesland raten** | Sees a plate plus its city and picks the federal state. |
| **Zeit-Quiz** | Answers a mix of both question types against the clock (30, 60 or 90 s). |

Other screens:

- **Highscore**: the best score for each mode and difficulty.
- **Wissen**: fun facts about plates that are read aloud when tapped, and all 16 federal states with their capital's code and more codes from that state.
- **Einstellungen**: difficulty, quiz length, read-aloud, vibration, and resetting the highscores.

Choices made for this age group:

- **Leicht** has 40 big cities and 3 answers. **Mittel** has about 250 towns and **Schwer** has every district code; both show 4 answers.
- Questions are read aloud (German text-to-speech) for children who can't read yet. The 🔊 button reads the question and the answers.
- A wrong answer never ends the game. The right answer is shown and the game moves on. Every finished round earns at least one star.
- Big touch targets, haptic feedback, and no accounts, ads or network access. Everything is stored on the device.

## Develop

```bash
npm install
npm start          # i = iOS simulator, a = Android, w = browser
npm test           # question-generation tests
npm run typecheck
```

## Structure

```
App.tsx                    font loading, screen switching, Android back button
src/game/questions.ts      pure game logic: difficulty pools, question + distractor generation, stars
src/GameContext.tsx        settings + highscores (AsyncStorage)
src/screens/               Home, Quiz (all three modes + result), Highscore, Knowledge, Settings
src/components/            ChunkyButton, Plate, WoodBoard, ScreenFrame, …
src/data/plates.json       copy of the area-code data from the Kennzeichen Finder app
assets/images/             artwork cut from the design mock-up (hero, mode and tile icons)
```

The artwork in `assets/images/` was cut from the design mock-up. For release, replace it with separately exported, full-resolution artwork (and a proper app icon) so it stays sharp on tablets.

## Build for the stores

The app ID is `com.shafeeque.kennzeichenabenteuer` (see `app.json`).

```bash
eas build --platform all --profile production
```

Apps for children have extra store rules: Apple's Kids category and Google Play's Families policy. The game collects no data, so you can answer "Data Not Collected" (Apple) and "No data collected" (Google).

## License

Copyright (c) 2026 Shafeeque. All rights reserved. This is proprietary software: it may not be copied, modified, distributed or used without written permission. See [LICENSE](LICENSE).
