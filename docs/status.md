# Shut The Cube: status

Updated 21 November 2026.

## Where it is

Design B ("The Daily") is built in the web app on the branch `redesign-b`. Nothing is committed or deployed.
177 tests pass and the production build succeeds.

Built:

- Four tabs: Today, Play, Scores, You. The app opens on Today.
- Today: the day's board for each mode with a true preview, the week row, the run of days, free play.
- The board: new tiles and colours, the roll written as a sum, one score, Ninja's clock as a bar.
- The result: a share card with the final board as blocks, the final dice and why the game ended.
- Pass and play: a hand-over screen that hides Player 1's score.
- The static pages (how to play, about, privacy, the challenge landing pages) in the new look, with the
  rules rewritten to match the game, and a real 404 page.

Not done yet:

- The app icon, social images and README screenshots still show the old design.
- The You tab has sound only. Vibration and the daily reminder wait for the native shell; Sign in with
  Apple waits for `arcade-api`. Rename, sign out and delete-my-account are on the Scores tab.
- Not yet played on a real phone. Checked in Chrome at 390 pt and at desktop width only.

## Next

The rest of the small finish (app icon, social images, README screenshots), then a play-through on real
phones.
