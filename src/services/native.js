import { Capacitor } from '@capacitor/core'

/**
 * Whether this is the installed iOS or Android app rather than a browser tab.
 *
 * The app is the same code as the website, wrapped by Capacitor. A handful of
 * things differ inside the wrapper, and each one asks this:
 *
 *   - no service worker: the files already ship inside the app;
 *   - no Google sign-in: Google refuses to sign people in from an embedded
 *     web view, so that waits for the native sign-in step;
 *   - Android's back button has to be answered.
 */
export const isNative = Capacitor.isNativePlatform()
export const platform = Capacitor.getPlatform()

/**
 * Where a sign-in started in the app is sent back to: the app's own address.
 * The leaderboard service lists it, and the phone routes it to this app.
 */
export const APP_REDIRECT = 'com.victorsaly.shutthecube://auth'

/**
 * Whether signing in can be offered here.
 *
 * Everywhere but the iPhone app, for now. Apple requires Sign in with Apple
 * beside any other sign-in, and that needs the developer account the app does
 * not have yet; until it does, offering Google alone on iOS would get the app
 * rejected.
 */
export const canSignIn = !isNative || platform === 'android'
