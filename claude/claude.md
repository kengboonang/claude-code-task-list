# To‑Do + Focus App — Product Brief (claude.md)

## TL;DR
A to‑do app that *guides attention* and *builds momentum* by tightly integrating a Pomodoro timer, periodic rests, and a task list. It reduces context‑switching, schedules breaks intelligently, and turns progress into feedback you can feel.

---

## Problem & Goals
- **Problem:** Task lists capture work but don’t help you *do* the work. Users get overwhelmed, context‑switch, and burn out without structured breaks.
- **Goal:** Ship a system that (1) focuses you on one task at a time, (2) enforces healthy work–rest cycles, and (3) makes progress visible and rewarding.

**Primary user outcome:** More tasks finished with less mental fatigue.

---

## Product Principles
1. **One screen, one job.** When focusing, everything else fades.
2. **Rhythm over willpower.** Timers and rests create cadence so users don’t have to.
3. **Frictionless capture, deliberate execution.** Quick add → plan → focused doing.
4. **Progress is a loop.** Log, reflect, and adapt daily.

---

## Core Feature Set

### 1) Tasks + Focus Engine
- **Task–Timer Binding:** Start a Pomodoro *on a specific task*. Log focus time to that task automatically.
- **Estimates & Subtasks:** Optional estimate (e.g., in Pomodoros) with subtasks for chunking.
- **Tags & Priorities:** Lightweight labels (Area/Project), priority (P1–P3), and due/when.
- **Focus Mode (Single‑Task View):** Only the current task and the timer are visible; everything else is muted.
- **MIT (Most Important Task):** Daily highlight pinned at the top; guided prompt to pick it during daily planning.

### 2) Pomodoro Timer + Periodic Rests
- **Standard Cycles:** Default 25m focus / 5m short break; long break 15–20m after N cycles (configurable).
- **Adaptive Rests:** If user ends a session early or extends, rest durations adjust within healthy bounds.
- **Snooze/Extend:** 30–120s guardrails to finish a thought without derailing cadence.
- **Auto‑Resume Option:** After a break, auto‑start next focus with a 10s countdown (user can cancel).
- **Session Notes:** Quick jot when starting/ending to capture intent and outcome.

### 3) Planning & Scheduling
- **Today View:** Queue for today with MIT at top; single‑tap to enter Focus Mode.
- **Timeboxing:** Drag a task to block time on a mini‑timeline for the day.
- **Calendar Peek (Read‑Only MVP):** See events to avoid timer collisions (write‑sync later).
- **Backlog & Next:** Keep Today lean; push the rest into Backlog/Next lists.

### 4) Feedback, Insights, and Motivation
- **Session Log:** All focus/break sessions tied to tasks; searchable timeline.
- **Daily Review:** Auto‑generated summary (completed tasks, sessions, total focus time, rollover items).
- **Trends:** Focus time by day/week, sessions per MIT, best time‑of‑day heatmap.
- **Focus Score (MVP):** Planned vs. completed sessions × task completion ratio.
- **Streaks & Gentle Gamification:** Consecutive focus days, weekly goal badges (opt‑in).

### 5) Distraction & Environment
- **Lightweight Distraction Blocking (Optional):** During focus, mute notifications / block listed sites/apps via OS/browser hooks where available.
- **Ambient Cues:** Minimal sounds/vibrations at start/end; full‑screen break screens to enforce stepping away.
- **Do Not Disturb Bridge:** Toggle system DND when a session starts/ends (with permissions).

### 6) Capture & Integrations
- **Quick Add Everywhere:** Global hotkey, mobile widget, command palette.
- **Import/Sync (Later):** Read‑only sync from existing task sources; calendar write‑back in v1.
- **Offline‑First:** Core flows (capture, run timer, complete task) work without network; sync later.

---

## UX Flows

### A. Start a Focus Session
1) Pick MIT in **Today** → 2) Press **Focus** → 3) **Focus Mode** appears with large timer + single task → 4) Work until timer ends → 5) **Break Screen** with countdown → 6) **Auto‑Resume** or return to list.

### B. Complete or Carry Forward
- On session end: **Complete**, **Add Subtask**, or **Continue** (start another Pomodoro). Partial progress logged regardless.

### C. Daily Planning & Review
- Morning: Select MIT, set 3–5 tasks for Today, optional estimates.
- Evening: Review summary (what got finished, time focused, rollover prompts).

---

## Data Model (MVP)
- **Task** `{ id, title, notes, tags[], priority, estimate_pomos?, due?, status, created_at, updated_at }`
- **Session** `{ id, task_id, start_at, end_at, duration, type: focus|break, notes? }`
- **DaySummary** `{ date, total_focus_min, sessions_count, tasks_completed[], focus_score }`
- **UserPrefs** `{ pomo_len, short_break_len, long_break_len, cycles_to_long_break, auto_resume, dnd_enabled }`

---

## Success Metrics (North Stars)
- **Weekly Active Focus Days (WAFD)**
- **Average Focus Minutes per Active Day**
- **Planned→Completed Ratio** for Today tasks
- **Retention:** D7/D30
- **Interrupt Recovery:** % sessions restarted within 5 minutes after interruption

---

## Accessibility & Inclusivity
- Full keyboard navigation; large hit targets on mobile.
- Screen‑reader friendly timer updates (polite ARIA live regions).
- Adjustable session/break lengths; color‑blind‑safe palette; haptics optional.

---

## Security & Privacy
- No third‑party trackers in MVP.
- End‑to‑end encryption for notes (stretch goal).
- Local‑first storage with explicit cloud sync consent.

---

## Roadmap

### MVP (4–6 weeks)
- To‑do CRUD, Today/MIT
- Pomodoro timer with periodic rests
- Task–timer binding, session logging
- Focus Mode (single‑task UI)
- Daily Review (basic)
- Offline‑first core + basic settings

### v1
- Calendar peek + timeboxing polish
- Focus Score + Trends (weekly heatmap)
- Quick Add global hotkey & mobile widget
- Lightweight DND/distraction hooks
- Gentle gamification (streaks, weekly goals)

### v1.1+
- Read/write calendar sync
- Import from other task tools
- Mood/Energy logging and time‑of‑day insights
- Site/app blocking integrations per platform
- Team mode (share streaks, not tasks) — optional

---

## Risks & Mitigations
- **Over‑gamification → burnout:** Keep rewards quiet and optional.
- **Timer tyranny:** Easy skip/snooze with logged reasoning to adapt, not shame.
- **Too many knobs:** Sensible defaults; advanced settings behind “More”.

---

## Open Questions
1. What’s the default Pomodoro/break cadence for first‑run?
2. Do we enforce hard breaks (screen lock) or keep it suggestive?
3. How aggressive should auto‑resume be across desktop vs. mobile?
4. Which platform ships first (web/desktop/mobile), and how do we share code?
5. What’s the minimum viable distraction blocking per OS for MVP?

---

## Acceptance Criteria (MVP)
- I can create tasks, pick an MIT, and start a focus session *bound to that task*.
- Breaks are **automatic** and **configurable**, with a long break after N cycles.
- A **Daily Review** shows tasks completed and total focused minutes.
- If offline, I can still capture tasks and run the timer; data syncs later.
- Keyboard shortcut starts/pauses the timer in Focus Mode on desktop.

