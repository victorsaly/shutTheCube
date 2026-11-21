# Shut The Cube: status

Updated 21 November 2026.

## Where it is

Design B ("The Daily") is live at shutthecube.com. The native shell is on the branch `native-shell`:
Capacitor 8 with an iOS and an Android project, both building and running in a simulator.

Built on the web (live):

- Four tabs, the new board, tiles, result and hand-over, the static pages, a 404, icons, social images.

Built in the native shell (branch only):

- Bundle ID `com.victorsaly.shutthecube`, app icon and splash, portrait lock, safe areas.
- Android's back button. No service worker inside the app.
- A compact layout for short screens, which also fixes the live site on an iPhone SE.
- The native reasons (branch `native-reasons`): vibration through the phone's haptic engine with its
  own switch, a daily reminder at about 6pm that is off until asked for and skips days already played,
  and the phone's own share sheet for a result.

Not done yet:

- Sign-in. Built but not switched on (branch `native-sign-in` here, `app-sign-in` in `arcade-api`):
  - Android: Google sign-in opens the phone's browser and returns to the app's own address.
    It works only once the `arcade-api` branch is deployed.
  - iPhone: still hidden. Apple requires Sign in with Apple beside Google; the service can
    check Apple's tokens, but the app side needs the Apple Developer account.
  - The leaderboard does not load inside either app until `arcade-api` is deployed, because
    the live service does not yet accept requests from the apps.
  - Before submission: Apple also expects its tokens to be revoked when an account is deleted.
- Not yet on a real phone. Seen in the iPhone SE simulator and a Pixel 5 emulator only.
- Apple account (set up 21 Nov 2026): the membership already existed (Individual, Team `Z452L5C5VZ`),
  so the seller is Victor's own name. Now registered: the App ID `com.victorsaly.shutthecube` with
  Sign in with Apple, the App Store Connect record "Shut The Cube" (SKU `shutthecube`), and a Sign in
  with Apple key, "Arcade Sign in with Apple", Key ID `Q6U7WLLM9C`. The key file itself is Victor's to
  download and keep; it is never to be committed.
- Still to do for the iPhone: the Sign in with Apple button in the app, token revocation on account
  deletion in `arcade-api` (needs the key as a Worker secret), then TestFlight.
- Play testing needs a Google Play developer account.

Building Android needs Java 21: `JAVA_HOME=$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home`.

## Next

Deploy the `arcade-api` branch (Victor's call), then finish Sign in with Apple once the developer
account exists.
