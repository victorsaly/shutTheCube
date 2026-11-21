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

- Sign-in inside the app. Google refuses sign-in from a web view, so the app hides it until native
  sign-in (Sign in with Apple, and Google's native flow) is built. Needs `arcade-api`.
- Whether `arcade-api` accepts requests from the app's origin has not been checked.
- Not yet on a real phone. Seen in the iPhone SE simulator and a Pixel 5 emulator only.
- Signing, TestFlight and Play testing wait on the seller decision.

Building Android needs Java 21: `JAVA_HOME=$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home`.

## Next

Sign-in (step 7): Sign in with Apple and Google's native flow, in `arcade-api` and the app.
