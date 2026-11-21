import { isNative } from './native'

/**
 * A nudge you can feel, alongside the sound and independent of it: muting
 * the marimba should not numb the tiles, so vibration has a switch of its own.
 *
 * In the installed app this goes through the phone's own haptic engine, which
 * is the only way an iPhone will vibrate at all (Safari offers a web page no
 * vibration). In a browser it falls back to the Vibration API where there is
 * one, and is a no-op everywhere else.
 */
const KEY = 'shutTheCube.haptics'

let on = (() => {
  try {
    return localStorage.getItem(KEY) !== '0'
  } catch {
    return true
  }
})()

export const hapticsAvailable =
  isNative || (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function')
export const hapticsOn = () => on
export const setHapticsOn = (value) => {
  on = Boolean(value)
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    // Not persisting the preference is not worth an error.
  }
}

/* What each moment feels like in a browser, in milliseconds. */
const WEB = { tap: 8, roll: 15, shut: 22, over: 80, win: [30, 60, 30, 60, 120] }

/**
 * tap   a tile picked
 * roll  the dice thrown
 * shut  a roll matched and its tiles shut
 * over  no move left
 * win   the box shut
 */
export const buzz = async (kind) => {
  if (!on) return
  try {
    if (!isNative) {
      navigator.vibrate?.(WEB[kind] ?? 10)
      return
    }
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics')
    if (kind === 'win') await Haptics.notification({ type: NotificationType.Success })
    else if (kind === 'over') await Haptics.notification({ type: NotificationType.Warning })
    else if (kind === 'shut') await Haptics.impact({ style: ImpactStyle.Heavy })
    else if (kind === 'roll') await Haptics.impact({ style: ImpactStyle.Medium })
    else await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // Not every device offers it; never let it break a move.
  }
}
