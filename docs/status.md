# Shut The Cube: status

Updated 22 November 2026.

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

- Sign-in works in the apps. Sign in with Apple was run end to end on Victor's iPhone on
  22 Nov 2026; the service holds the player and the token that revokes the sign-in on deletion.
  Android signs in with Google through the phone's browser. Still to try on a phone: deleting
  the account, posting a score, and Google sign-in on the iPhone.
- App builds (`npm run native`) always use the live service. A local `.env.local` pointing the
  game at a test service once put "localhost" into a phone build, where nothing could answer.
- On a real iPhone since 22 Nov 2026 (signed, development build). Android has only been on an emulator.
- Apple account (set up 21 Nov 2026): the membership already existed (Individual, Team `Z452L5C5VZ`),
  so the seller is Victor's own name. Now registered: the App ID `com.victorsaly.shutthecube` with
  Sign in with Apple, the App Store Connect record "Shut The Cube" (SKU `shutthecube`), and a Sign in
  with Apple key, "Arcade Sign in with Apple", Key ID `Q6U7WLLM9C`. The key file itself is Victor's to
  download and keep; it is never to be committed.
- TestFlight: version 1.0, build 1 was uploaded to App Store Connect on 22 Nov 2026. iPhone only for
  now, because iPad support can be added later but never removed once released. To upload another:
  `npm run native`, then from `ios/App` archive the Release scheme and export it with
  `ios/ExportOptions.plist` (both with `-allowProvisioningUpdates`). Xcode raises the build number.
- From April 2027 Apple will only accept builds made with Xcode 27.
- Play testing needs a Google Play developer account.

Building Android needs Java 21: `JAVA_HOME=$(brew --prefix openjdk@21)/libexec/openjdk.jdk/Contents/Home`.

## Next

Add testers in TestFlight, then a week of real play. Android needs a Google Play developer account.
