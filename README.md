# TBC Class Compass

A lightweight class recommendation tool for World of Warcraft Classic: The Burning Crusade.

Answer 10 quick questions about your goals, playstyle, and priorities — and get a ranked top 3 class matches with fit scores, farming breakdowns, strengths, and tradeoffs.

Live: <https://andx667.github.io/wow-class-picker/>

## What it does

- Scores your answers against real TBC class realities: raid slot demand, spec flexibility, gearing pressure, PvP viability, and rotation complexity
- Returns your top 3 matches with a percentage fit score and a farming efficiency score
- Explains why each class fits — and what the tradeoffs are
- Reminds you to play what you enjoy, not just what tops logs

## Why it's built this way

No frameworks, no build step, no dependencies. Just three files:

- `index.html` — structure and quiz
- `styles.css` — styling
- `data.js` — all class profiles, scoring weights, and farming bonuses
- `script.js` — quiz logic and rendering

The data is separated from the logic so class profiles can be updated without touching any of the scoring code.

Deployed via GitHub Pages with a single workflow file.

## License

[MIT](LICENSE)
