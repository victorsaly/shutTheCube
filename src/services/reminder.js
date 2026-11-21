import { ref } from 'vue'
import { isNative } from './native'
import { dayNumber, shiftStamp, todayStamp } from './random'

/**
 * The daily reminder: one notification at about six in the evening, only on a day
 * whose board has not been played yet. Installed app only, and off until the
 * player turns it on, which is also the first moment the phone is asked for
 * permission to notify.
 *
 * A repeating notification cannot know whether today's board was played, so
 * instead the next two weeks are scheduled one day at a time, each under an
 * id that is that day's number. Finishing a daily cancels that day's; opening
 * the app tops the fortnight back up. Someone who stops opening the app is
 * reminded for two weeks and then left alone.
 */
const KEY = 'shutTheCube.reminder'
const HOUR = 18
const DAYS_AHEAD = 14

const stored = () => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
const store = (value) => {
  try {
    localStorage.setItem(KEY, value ? '1' : '0')
  } catch {
    // The schedule itself lives with the phone; the switch can be set again.
  }
}

export const reminderAvailable = isNative
export const reminderOn = ref(isNative && stored())
/** Set when the phone refused permission, so the switch can say why it is off. */
export const reminderBlocked = ref(false)
/* "Around", because the phone may deliver it up to an hour after six. */
export const REMINDER_TIME = 'Around 6pm'

/*
 * Wrapped in an object on purpose. A Capacitor plugin is a proxy that answers
 * to any property name, `then` included, so returning it bare from an async
 * function makes the runtime treat it as a promise and call a method that
 * does not exist.
 */
const plugin = async () => ({
  notifications: (await import('@capacitor/local-notifications')).LocalNotifications
})

const atSix = (stamp) => {
  const [y, m, d] = stamp.split('-').map(Number)
  return new Date(y, m - 1, d, HOUR, 0, 0)
}

/**
 * Bring the phone's schedule in line with the switch. `playedToday` drops
 * today's reminder; call it after a daily is finished and when the app opens.
 */
export const syncReminder = async ({ playedToday = false } = {}) => {
  if (!isNative) return
  try {
    const { notifications } = await plugin()
    const pending = (await notifications.getPending()).notifications ?? []
    if (pending.length) await notifications.cancel({ notifications: pending.map((n) => ({ id: n.id })) })
    if (!reminderOn.value) return

    const today = todayStamp()
    const now = Date.now()
    const upcoming = []
    for (let i = 0; i < DAYS_AHEAD; i += 1) {
      const stamp = shiftStamp(today, i)
      const at = atSix(stamp)
      if (at.getTime() <= now || (i === 0 && playedToday)) continue
      upcoming.push({
        id: dayNumber(stamp),
        title: 'Today’s cube is waiting',
        body: 'One board, the same for everyone. Your first try is the one that counts.',
        // Not an exact alarm. The plugin's default is exact, and on Android
        // that sends the player to a system "Alarms & reminders" page to
        // grant it. A reminder that lands a few minutes after six is still
        // a reminder.
        isExactNotification: false,
        schedule: { at }
      })
    }
    if (upcoming.length) await notifications.schedule({ notifications: upcoming })
  } catch {
    // A reminder that could not be set is not worth interrupting a game.
  }
}

/** Turn the reminder on or off. Turning it on is what asks for permission. */
export const setReminder = async (value, { playedToday = false } = {}) => {
  if (!isNative) return false
  reminderBlocked.value = false
  if (value) {
    try {
      const { notifications } = await plugin()
      const { display } = await notifications.requestPermissions()
      if (display !== 'granted') {
        reminderBlocked.value = true
        reminderOn.value = false
        store(false)
        return false
      }
    } catch {
      reminderOn.value = false
      return false
    }
  }
  reminderOn.value = Boolean(value)
  store(reminderOn.value)
  await syncReminder({ playedToday })
  return reminderOn.value
}
