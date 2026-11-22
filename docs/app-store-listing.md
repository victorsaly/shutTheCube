# App Store listing: Shut The Cube

Prepared 22 November 2026. Nothing here is entered in App Store Connect until Victor approves it.
Everything is written in British English, to match the app's primary language.

## Text

| Field | Limit | Text |
| --- | --- | --- |
| Name | 30 | Shut The Cube |
| Subtitle | 30 | Dice, tiles and a daily board |
| Promotional text | 170 | One board a day, the same for everyone. Roll the dice, pick the tiles that add up, and see how close you can get to shutting the lot. |
| Keywords | 100 | `shut the box,dice,daily,puzzle,numbers,sums,tiles,pub game,pass and play,offline,maths,brain` |
| Copyright | | 2026 Victor Saly |
| Category | | Games: Puzzle first, Board second |
| Price | | Free |

### Description

```
Shut The Cube is Shut the Box, the pub dice game, with a twist: a board nine rows deep where a matching column collapses in one move.

HOW IT PLAYS
Roll two dice. Pick open tiles that add up to exactly what you rolled, and they shut. Roll again. When no tiles can make the roll, the game ends. Shut every tile and the box is yours.

THREE MODES
• Beginner: one row, tiles 1 to 9. The classic game.
• Medium: nine rows. Play a tile and it takes the same number above and below it, for a bonus.
• Ninja: nine rows against the clock, 30 seconds a turn.

ONE BOARD A DAY
Every day there is one shared board for each mode: the same tiles and the same dice for everyone. Your first try is the one that counts. Sign in if you want your name on the day's leaderboard, or just play.

PASS AND PLAY
Two players take turns on one phone with the identical board. The first score stays hidden until both have played.

MADE TO BE PLAYED
• Free, with no ads and nothing to buy.
• No account needed. Signing in is optional and only puts a name on the leaderboard.
• Works with no signal.
• Each tile plays its own note, so a good turn sounds like one.
• An optional reminder at about 6pm, only on days you have not played.

Your games, bests and averages stay on your phone.
```

### What's New (version 1.0)

```
The first release.
```

## Addresses

| Field | Address |
| --- | --- |
| Marketing URL | https://shutthecube.com/ |
| Support URL | https://shutthecube.com/about.html (now has a Support section with a contact address) |
| Privacy policy URL | https://shutthecube.com/privacy.html |

## Screenshots

Five at 1206 x 2622 (the 6.3-inch iPhone size App Store Connect asks for), in `docs/store/ios/`. Regenerate with
`node scripts/gen-store-shots.mjs` while the game is running. Each is a real screen of the game.

1. `01-today.png`: One board a day. The same for everyone.
2. `02-pick.png`: Roll. Pick the tiles that add up.
3. `03-columns.png`: Match a column. Take the lot.
4. `04-ninja.png`: Or race the clock: thirty seconds a turn.
5. `05-result.png`: See how close you got. Then share it.

iPad screenshots are not needed: the app is iPhone only.

## Age rating answers (entered 22 November 2026)

Every question is "No" or "None" except one.

- **Contests: Infrequent.** Apple defines this as events where users compete for rankings, and
  gives skill-based competitions as an example. The daily leaderboard fits. "Infrequent" because
  the ranking is optional and reached only by signing in; most play never touches it. With
  "Frequent" Apple calculates 13+ instead of 4+. This is Victor's call to confirm.
- **User-generated content: No.** Apple's wording is "the broad distribution of content created by
  users as a component of the app's intended user experience". A display name beside a score is
  not that. Names are still screened, and the Scores tab has a "Report a name" link.
- **Unrestricted web access, messaging, advertising, gambling, loot boxes:** No.
- **Result:** 4+ in 172 countries. Apple shows separate ratings for Brazil, Korea and Vietnam, and
  says the app will not be sold in Afghanistan or Morocco under local law.

## App privacy answers

Data is collected only if the player signs in. Nothing is used for tracking, and there are no
third-party analytics or ads in the app.

| Data type | Collected | Linked to the player | Purpose |
| --- | --- | --- | --- |
| User ID (Identifiers) | Yes, the opaque id from Apple or Google | Yes | App functionality |
| Name (Contact info) | Yes, a display name | Yes | App functionality |
| Gameplay content (User content) | Yes, scores and the moves behind them | Yes | App functionality |
| Email, location, contacts, usage data, diagnostics | No | | |

## Notes for the reviewer

```
Shut The Cube is a dice game that plays fully without an account and without a network connection.

Signing in is optional and does one thing: it puts a display name beside a score on the daily
leaderboard. Sign in with Apple is offered on the Scores tab, above Sign in with Google. No demo
account is needed to review the game.

Players see each other only as a display name on the leaderboard. Names are screened by the
service, and the Scores tab has a "Report a name" link.

To delete an account: Scores tab, "Delete my data". This erases the player and every score at once,
and revokes the Sign in with Apple authorisation.

The daily reminder is off until the player turns it on (You tab), which is when notification
permission is requested.
```

## Entered in App Store Connect on 22 November 2026

Saved as drafts; nothing is submitted or public.

- Version page: promotional text, description, keywords, support and marketing addresses,
  copyright, five screenshots, reviewer notes, "sign-in required" off, manual release.
- App information: subtitle, Games with Puzzle and Board, no third-party content, age rating.
- App privacy: the policy address and the three data types, each for app functionality, linked to
  the player, not used for tracking.
- Pricing: free in all 175 countries and regions.

## Also done on 22 November 2026

- Age rating: Victor confirmed "Contests: Infrequent", 4+.
- Build 1 attached to version 1.0, which gives the listing its icon.
- Privacy answers published.
- Availability: 42 countries where English or Spanish is the main language, no China, and not
  automatically added to new App Store countries. UK, Ireland, US, Canada, Australia, New Zealand,
  Spain, Mexico, Argentina, Bolivia, Chile, Colombia, Costa Rica, Dominican Republic, Ecuador,
  El Salvador, Guatemala, Honduras, Nicaragua, Panama, Paraguay, Peru, Uruguay, Venezuela, and the
  English-speaking Caribbean: Anguilla, Antigua and Barbuda, Bahamas, Barbados, Belize, Bermuda,
  British Virgin Islands, Cayman Islands, Dominica, Grenada, Guyana, Jamaica, Montserrat,
  St Kitts and Nevis, St Lucia, St Vincent and the Grenadines, Trinidad and Tobago, Turks and Caicos.
- Reviewer contact details entered from the developer account.

## Left for Victor

- Test on the phone with the TestFlight build: delete account, post a score from a daily, Google
  sign-in. Then submit (Add for Review, then Submit).
- Release is manual: approval does not put the app on sale until Release is pressed.
- On release day, swap the "Coming soon" text in `index.html` for the App Store link beside it.
