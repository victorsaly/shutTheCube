<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStatsStore } from '@/stores/stats'
import { MODE_LIST, modeFor } from '@/stores/modes'
import { createTiles, shuffle } from '@/services/gameServices'
import {
  dailySeed,
  dayNumber,
  mulberry32,
  secondsUntilTomorrow,
  shiftStamp,
  todayStamp
} from '@/services/random'

const props = defineProps({
  /** The mode to show first: the one last played, so the habit is one tap. */
  initialMode: { type: String, default: 'medium' }
})
const emit = defineEmits(['start', 'scores'])

const stats = useStatsStore()
const today = todayStamp()
const mode = ref(modeFor(props.initialMode).key)

const dateLabel = new Date().toLocaleDateString('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
})

const untilTomorrow = ref(secondsUntilTomorrow())
let countdown = null
onMounted(() => {
  // Roughly right is enough, so it ticks once a minute, not once a second.
  countdown = setInterval(() => (untilTomorrow.value = secondsUntilTomorrow()), 60_000)
})
onUnmounted(() => clearInterval(countdown))
const countdownLabel = computed(() => {
  const h = Math.floor(untilTomorrow.value / 3600)
  const m = Math.floor((untilTomorrow.value % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
})

/*
 * Today's board, exactly as the first roll will lay it out: the same two
 * seeded streams the game store uses, one for the faces and one for the
 * opening shuffle. A preview that showed a different board would be a lie.
 */
const preview = computed(() => {
  const seed = dailySeed(mode.value, today)
  const board = createTiles(9, modeFor(mode.value).rows, mulberry32(seed))
  const play = mulberry32((seed ^ 0x9e3779b9) >>> 0)
  return board.map((row) => shuffle(row, play)).flat()
})

const result = computed(() => stats.dailyResult(mode.value, today))
const rowsLabel = computed(() => (modeFor(mode.value).rows === 1 ? 'one row' : 'nine rows'))

/* Monday to Sunday of this week, and whether anything was played each day. */
const week = computed(() => {
  const played = new Set()
  for (const record of Object.values(stats.byMode)) {
    for (const day of record?.days ?? []) played.add(day)
  }
  const offset = (new Date().getDay() + 6) % 7
  const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return names.map((name, i) => {
    const stamp = shiftStamp(today, i - offset)
    const state = played.has(stamp)
      ? 'played'
      : i === offset
        ? 'today'
        : i > offset
          ? 'ahead'
          : 'missed'
    const said = { played: 'played', today: 'today, not played yet', ahead: 'to come', missed: 'not played' }
    return { letter: name[0], state, label: `${name}, ${said[state]}` }
  })
})
const streak = computed(() => stats.dayStreak())
</script>

<template>
  <div class="today">
    <header class="head">
      <div>
        <p class="eyebrow">{{ dateLabel }}</p>
        <h1 class="display">Today’s cube</h1>
      </div>
      <p class="next">New in {{ countdownLabel }}</p>
    </header>

    <section class="daily card-surface" aria-label="Today's board">
      <div class="seg" role="group" aria-label="Which board">
        <button
          v-for="m in MODE_LIST"
          :key="m.key"
          type="button"
          :aria-pressed="mode === m.key"
          @click="mode = m.key"
        >
          {{ m.label }}
        </button>
      </div>

      <div
        class="preview"
        :class="{ 'one-row': modeFor(mode).rows === 1 }"
        role="img"
        :aria-label="`A preview of today's ${modeFor(mode).label} board`"
      >
        <span v-for="t in preview" :key="t.id" :class="t.cssClass" />
      </div>

      <div class="daily-copy">
        <h2 class="display">Daily #{{ dayNumber(today) }} · {{ rowsLabel }}</h2>
        <p v-if="result" class="played">
          Played today: <b class="num">{{ result.score }}</b> points<template v-if="result.won">, box shut</template>.
          A second go is practice.
        </p>
        <p v-else>One board, the same for everyone. Your first try is the one that counts.</p>
      </div>

      <button type="button" class="btn-primary" @click="emit('start', mode, { daily: true })">
        {{ result ? 'Play it again' : 'Play today’s board' }}
      </button>
      <button v-if="result" type="button" class="btn-quiet" @click="emit('scores')">
        Today’s scores
      </button>
    </section>

    <section class="week" aria-labelledby="week-h">
      <div class="row-head">
        <h2 id="week-h">This week</h2>
        <p>
          {{
            streak > 1
              ? `${streak} days in a row`
              : streak === 1
                ? '1 day so far'
                : 'Play today to start a run'
          }}
        </p>
      </div>
      <ul class="days">
        <li v-for="(d, i) in week" :key="i" :class="d.state">
          <span aria-hidden="true">{{ d.letter }}</span>
          <span class="visually-hidden">{{ d.label }}</span>
        </li>
      </ul>
    </section>

    <section aria-labelledby="free-h">
      <div class="row-head">
        <h2 id="free-h">Free play</h2>
        <p>A random board, any time</p>
      </div>
      <div class="free">
        <button
          v-for="m in MODE_LIST"
          :key="m.key"
          type="button"
          class="free-mode"
          @click="emit('start', m.key)"
        >
          <b>{{ m.label }}</b>
          <span>{{ m.rows === 1 ? 'One row' : m.turnSeconds ? 'On the clock' : 'Nine rows' }}</span>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.today {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.375rem 0.75rem;
}
.head h1 {
  white-space: nowrap;
}
h1 {
  margin: 0.125rem 0 0;
  font-weight: 700;
  font-size: 2.125rem;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.next {
  flex: none;
  margin: 0 0 0.25rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--line);
  font-size: 0.8125rem;
  font-weight: 600;
}

.daily {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  border-radius: 1.5rem;
}
.preview {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 3px;
}
.preview span {
  height: 1.125rem;
  border-radius: 4px;
}
.preview.one-row span {
  height: 3rem;
  border-radius: 7px;
}
.daily-copy h2 {
  margin: 0 0 0.25rem;
  font-weight: 600;
  font-size: 1.25rem;
}
.daily-copy p {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--muted);
}
.played b {
  color: var(--ink);
}

.row-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}
.row-head h2 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
}
.row-head p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--muted);
}

.days {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
}
.days li {
  height: 2.75rem;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  border: 1px solid var(--line);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--muted);
}
.days .played {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--on-accent);
}
.days .today {
  border: 2px solid var(--accent);
  background: var(--surface);
  color: var(--accent);
}
.days .ahead {
  border-style: dashed;
  border-color: #b9c3bb;
}

.free {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}
.free-mode {
  min-height: 4rem;
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.125rem;
  text-align: left;
  border-radius: 1rem;
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--ink);
  font: inherit;
  cursor: pointer;
}
.free-mode:hover {
  border-color: var(--line-strong);
}
.free-mode b {
  font-size: 0.9375rem;
  font-weight: 600;
}
.free-mode span {
  font-size: 0.75rem;
  color: var(--muted);
}
</style>
