<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useArcadeStore } from '@/stores/arcade'
import { MODE_LIST } from '@/stores/modes'
import { dayNumber, todayStamp } from '@/services/random'
import AppIcon from '@/components/AppIcon.vue'

defineProps({ embedded: { type: Boolean, default: false } })
defineEmits(['close'])

const arcade = useArcadeStore()
const mode = ref('medium')
const today = todayStamp()
const day = dayNumber(today)

/* Renaming is deliberately a small, explicit act rather than a live-bound
   field: a name on a public board should take a decision to change. */
const editing = ref(false)
const draft = ref('')

const entries = computed(() => arcade.board?.entries ?? [])
const mine = computed(() => entries.value.find((e) => e.name === arcade.name) ?? null)

const load = () => arcade.loadBoard({ mode: mode.value, period: today })

onMounted(load)
watch(mode, load)

const startEditing = () => {
  draft.value = arcade.name
  editing.value = true
}

const saveName = async () => {
  if (await arcade.setName(draft.value)) {
    editing.value = false
    await load()
  }
}

const confirmDelete = async () => {
  if (!window.confirm('Delete your name and every score you have posted? This cannot be undone.')) {
    return
  }
  await arcade.deleteAccount()
  await load()
}

/* Only the top three get a mark; beyond that a number reads better. */
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
</script>

<template>
  <section class="board" :class="{ 'panel-glass': !embedded, bare: embedded }" aria-labelledby="board-title">
    <header class="board-head">
      <div>
        <p class="eyebrow micro">Daily <b class="num">#{{ day }}</b></p>
        <h2 v-if="!embedded" id="board-title" class="display">Leaderboard</h2>
        <span v-else id="board-title" class="visually-hidden">Daily leaderboard</span>
      </div>
      <button
        v-if="!embedded"
        type="button"
        class="close"
        aria-label="Close leaderboard"
        @click="$emit('close')"
      >
        <AppIcon name="close" />
      </button>
    </header>

    <div class="tabs" role="tablist" aria-label="Mode">
      <button
        v-for="m in MODE_LIST"
        :key="m.key"
        type="button"
        role="tab"
        class="tab"
        :aria-selected="mode === m.key"
        :data-mode="m.key"
        @click="mode = m.key"
      >
        {{ m.label }}
      </button>
    </div>

    <p v-if="arcade.loadingBoard" class="state micro">Loading…</p>

    <!-- A board that cannot be reached is a quiet absence, never an error the
         player has to deal with: the game itself is unaffected. -->
    <p v-else-if="!arcade.board" class="state micro">
      The leaderboard is unavailable right now. Your game is unaffected.
    </p>

    <p v-else-if="entries.length === 0" class="state micro">
      Nobody has posted a score on today’s board yet. Be first.
    </p>

    <ol v-else class="rows">
      <li
        v-for="entry in entries"
        :key="`${entry.rank}-${entry.name}`"
        class="row"
        :class="{ me: arcade.signedIn && entry.name === arcade.name, top: entry.rank <= 3 }"
      >
        <span class="rank num" aria-hidden="true">{{ MEDALS[entry.rank] ?? entry.rank }}</span>
        <span class="visually-hidden">Rank {{ entry.rank }}.</span>
        <span class="who">
          {{ entry.name }}
          <b v-if="entry.won" class="shut micro" title="Shut the box">SHUT</b>
        </span>
        <span class="rolls num micro">{{ entry.rolls }} rolls</span>
        <span class="score num">{{ entry.score }}</span>
      </li>
    </ol>

    <footer class="board-foot">
      <template v-if="arcade.signedIn">
        <div v-if="editing" class="rename">
          <label class="visually-hidden" for="board-name">Display name</label>
          <input
            id="board-name"
            v-model="draft"
            class="name-input"
            maxlength="24"
            autocomplete="off"
            @keydown.enter="saveName"
            @keydown.esc="editing = false"
          />
          <button type="button" class="pill small" :disabled="arcade.busy" @click="saveName">
            Save
          </button>
          <button type="button" class="pill small ghost" @click="editing = false">Cancel</button>
        </div>
        <div v-else class="signed-in">
          <p class="micro">
            Posting as <b>{{ arcade.name }}</b>
            <span v-if="mine" class="num"> · ranked {{ mine.rank }}</span>
          </p>
          <div class="acts">
            <button type="button" class="linkish micro" @click="startEditing">Change name</button>
            <button type="button" class="linkish micro" @click="arcade.signOut">Sign out</button>
            <button type="button" class="linkish micro danger" @click="confirmDelete">
              Delete my data
            </button>
          </div>
        </div>
        <p v-if="arcade.error" class="err micro" role="alert">{{ arcade.error }}</p>
      </template>

      <template v-else>
        <button type="button" class="signin" @click="arcade.startSignIn">
          Sign in with Google to post your score
        </button>
        <p class="micro fine">
          Your name and nothing else. No email, no tracking, and you can delete it in one click.
          The game works exactly the same signed out.
        </p>
      </template>
    </footer>
  </section>
</template>

<style scoped>
.board.bare {
  width: auto;
  padding: 0;
  gap: 12px;
}
.board {
  width: min(100%, 30rem);
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: clamp(16px, 3vw, 22px);
  border-radius: 16px;
}

.board-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.eyebrow {
  margin: 0 0 2px;
  color: var(--muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.eyebrow b {
  color: var(--accent);
}
.board-head h2 {
  margin: 0;
  font-size: 1.5rem;
  line-height: 1.1;
}
.close {
  background: none;
  border: 0;
  color: var(--muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
}
.close:hover {
  color: var(--bone);
}

.tabs {
  display: flex;
  gap: 6px;
}
.tab {
  flex: 1;
  padding: 7px 4px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: transparent;
  color: var(--muted);
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}
.tab[aria-selected='true'] {
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  border-color: var(--accent);
  color: var(--bone);
  font-weight: 600;
}

.state {
  margin: 6px 0;
  text-transform: none;
  letter-spacing: 0;
  color: var(--muted);
  text-align: center;
  line-height: 1.5;
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: 46vh;
  overflow-y: auto;
}
.row {
  display: grid;
  grid-template-columns: 2rem 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 9px;
}
.row:nth-child(odd) {
  background: rgba(255, 255, 255, 0.03);
}
/* Your own row has to be findable in a glance down a list of twenty. */
.row.me {
  background: color-mix(in srgb, var(--accent) 18%, transparent);
  outline: 1px solid var(--accent);
}
.rank {
  font-size: 0.95rem;
  color: var(--muted);
  text-align: center;
}
.row.top .rank {
  font-size: 1.05rem;
}
.who {
  /* The menu centres its children; a ranked list has to read as a column. */
  text-align: left;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.shut {
  margin-left: 6px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--accent);
  color: var(--tile-ink);
  font-weight: 700;
  letter-spacing: 0.06em;
}
.rolls {
  color: var(--muted);
}
.score {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  min-width: 3ch;
  text-align: right;
}

.board-foot {
  border-top: 1px solid var(--line);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.signed-in {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.signed-in p {
  margin: 0;
  color: var(--muted);
}
.signed-in b {
  color: var(--bone);
}
.acts {
  display: flex;
  gap: 12px;
}
.linkish {
  background: none;
  border: 0;
  padding: 0;
  color: var(--muted);
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  font: inherit;
  font-size: 0.78rem;
}
.linkish:hover {
  color: var(--bone);
}
.linkish.danger:hover {
  color: var(--bad);
}

.rename {
  display: flex;
  gap: 6px;
}
.name-input {
  flex: 1;
  min-width: 0;
  padding: 7px 10px;
  border-radius: 9px;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.25);
  color: var(--bone);
  font: inherit;
}
.pill.small {
  padding: 6px 12px;
  font-size: 0.82rem;
}
.pill.ghost {
  background: transparent;
}

.signin {
  width: 100%;
  padding: 11px 14px;
  border-radius: 11px;
  border: 1px solid var(--accent);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--bone);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.signin:hover {
  background: var(--accent);
  color: var(--tile-ink);
}
.fine {
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
  /* `.micro` sets uppercase with tracking, which is unreadable over three
     lines of actual prose. */
  text-transform: none;
  letter-spacing: 0;
  font-size: 0.78rem;
}
.err {
  margin: 0;
  color: var(--bad);
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
