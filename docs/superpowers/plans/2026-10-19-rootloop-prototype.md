# RootLoop Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build RootLoop, a static, mobile-first React demo that follows a township's garden waste from intake to compost batch, maturity test, nursery trial, per-species mix recommendation and a public tree QR page, all running on deterministic simulated data.

**Architecture:** Single-page Vite + React app with no backend. One pure reducer owns the whole `AppData` object. A context provider saves it to localStorage and falls back to a seeded sample dataset. All domain math (GI, alerts, scoring, KPIs, IDs) and all simulation (sensor curves, fake AI) are pure functions in `src/lib` and `src/sim`, unit-tested on their own. Pages only render data and dispatch actions.

**Tech Stack:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, React Router 6, Recharts 2, qrcode.react 4, lucide-react, Vitest 2, React Testing Library 16, jsdom.

**Spec:** `docs/superpowers/specs/2026-10-19-rootloop-design.md`

## Global Constraints

- Local Node is 20.16, so use Vite 5.x and Vitest 2.x (not Vite 6 or 7). Install by major version; the lockfile pins exact versions.
- No backend and no runtime network calls. Fonts come from bundled `@fontsource` packages, not Google Fonts.
- Every section that shows simulated values (IoT readings, AI results, KPIs, charts, scores, township totals) shows `<SampleBadge />`, which reads "Sample data".
- Never say compost is germ-free or pathogen-free. Never mention carbon. Every recommendation shows `<PreliminaryBadge />`.
- Exact copy:
  - Maturity note: "This test shows compost maturity, not that it is free of pathogens."
  - Recommendations: "Updates as more batches and trials are added."
  - Tree headline: "Grown with compost from your township's leaves"
  - Pitch line: "Others ask if compost is ready. We ask if it's right for this tree."
- Nursery-only scope. No open-landscape monitoring screens.
- ID formats: batch `RL-B-<year>-<NNN>`, intake `RL-I-<NNNN>`, trial `RL-TR-<NNN>`, tray `<trialId>-M<mixPct>`, tree `RL-T-<NNNN>`.
- Works at 375 px with no page-level horizontal scroll. Tap targets are at least 44 px (`min-h-11`). Every input has a `<label>`. Focus is always visible (global `:focus-visible` outline in `index.css`).
- Display timezone and "today" use `Asia/Kuala_Lumpur`. Stored timestamps are UTC ISO strings. Intake and trial dates are `YYYY-MM-DD`.
- Git: the enclosing Git repo is the whole Desktop folder, which has unrelated pending changes. Task 1 runs `git init` inside `Rootloop/` so the project has its own repo. Always `git add` explicit paths, never `-A`.
- Deliberate sample-data deviation: batch `RL-B-2026-001` and its 4 intakes date from July 2026, before the 6-week intake window. This means the trials' 6 weeks of data come from a compost cycle that was already finished and tested. The batch passed with GI 92% and shows status "Sent to nursery" because both trials use it. Totals: 22 intakes, about 1,200 kg.
- Create actions carry their own ID, which the caller computes with the `next*Id` helpers. This lets the page navigate to the new record straight away.

## Review Focus

1. **Corrupt or outdated localStorage** (bad JSON, wrong `version`, missing arrays): the app loads the sample data instead of a blank screen. Tested in Task 5.
2. **"Clear all data", then visiting every screen:** each screen shows an empty state, with no crash, `NaN` or `Infinity`. Tested in Tasks 3 and 6.
3. **A root length set to blank, negative or non-numeric, or a control with zero germination:** GI shows "—", the cell is flagged and Save is disabled. Tested in Tasks 3 and 10.
4. **Opening `/tree/:id` directly on the deployed site** (QR scan or refresh), and unknown IDs: the `vercel.json` rewrite serves the app (Task 1), and an unknown ID shows "Tree not found" (Task 13).
5. **A new batch or trial with fewer than 2 readings, or only the week-0 record:** charts show "No readings yet", scoring skips trays without data, and no score is `NaN`. Tested in Tasks 3, 9 and 11.

---

### Task 1: Scaffold, theme and test harness

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `postcss.config.js`, `vercel.json`, `.gitignore`, `public/favicon.svg`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `AppRoutes(): JSX.Element` exported from `src/App.tsx`. `main.tsx` wraps it in `BrowserRouter`, and tests wrap it in `MemoryRouter`.

- [ ] **Step 1: Create the project repo.** In `Rootloop/`, run `git init`. Expected output: `Initialized empty Git repository in .../Rootloop/.git/`.
- [ ] **Step 2: Write `package.json`.** Set `"name": "rootloop"`, `"private": true` and `"type": "module"`, with these scripts:

```json
"dev": "vite",
"build": "tsc --noEmit && vite build",
"preview": "vite preview",
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Install dependencies.**

```bash
npm install react@18 react-dom@18 react-router-dom@6 recharts@2 qrcode.react@4 lucide-react @fontsource-variable/fraunces @fontsource/atkinson-hyperlegible
```

```bash
npm install -D vite@5 @vitejs/plugin-react@4 typescript@5 @types/react@18 @types/react-dom@18 @types/node@20 vitest@2 jsdom@25 @testing-library/react@16 @testing-library/dom@10 @testing-library/jest-dom@6 @testing-library/user-event@14 tailwindcss@3 postcss@8 autoprefixer@10
```

- [ ] **Step 4: Write the config files.**
  - `vite.config.ts`: `defineConfig` from `vitest/config`, the React plugin, and `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }`.
  - `tsconfig.json`: target `ES2020`; lib `["ES2020","DOM","DOM.Iterable"]`; module `ESNext`; moduleResolution `bundler`; jsx `react-jsx`; `strict: true`; `noEmit: true`; types `["vite/client","node"]`; include `["src","vite.config.ts"]`.
  - `vercel.json`: `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.
  - `.gitignore`: `node_modules`, `dist`, `.vercel`, `*.local`, `coverage`.
  - `index.html`: `lang="en"`, `<title>RootLoop</title>`, a viewport meta tag, `theme-color` `#2F5D43` and a leaf `favicon.svg`.
  - `tailwind.config.js`: content `['./index.html','./src/**/*.{ts,tsx}']`. Use these `theme.extend` tokens:

| Token | Shades |
|---|---|
| `soil` | 50 `#FAF6F0`, 100 `#F1E8DC`, 200 `#E6D5C3`, 500 `#8B6447`, 700 `#5A3E2B`, 900 `#2B1D14` |
| `leaf` | 100 `#E3EFE2`, 300 `#9CC5A1`, 500 `#4C8A5E`, 700 `#2F5D43`, 900 `#1F3B2C` |
| `ember` (heat, failures) | 100 `#F6DDD5`, 500 `#C8553D`, 700 `#8E3524` |
| `water` (moisture) | 100 `#DCEBF3`, 500 `#3B7EA1`, 700 `#285A75` |
| `sun` (badges) | 100 `#F8EBC4`, 400 `#E3B23C` |
| `fontFamily.display` | `['"Fraunces Variable"','Georgia','serif']` |
| `fontFamily.body` | `['"Atkinson Hyperlegible"','system-ui','sans-serif']` |

  - `src/index.css`: the Tailwind directives; `body` gets `bg-soil-50 text-soil-900 font-body antialiased`; `h1, h2, h3` get `font-display`; `:focus-visible { outline: 3px solid #4C8A5E; outline-offset: 2px; }`.
  - `src/test/setup.ts`:
    - Import `@testing-library/jest-dom/vitest`.
    - Stub `globalThis.ResizeObserver` with a no-op class (`observe`, `unobserve`, `disconnect`).
    - Stub `URL.createObjectURL` to return `'blob:preview'` and `URL.revokeObjectURL` to do nothing.
    - In `afterEach`, run `cleanup()` and `localStorage.clear()`.
- [ ] **Step 5: Write the failing test.** In `src/App.test.tsx`, render `<MemoryRouter><AppRoutes /></MemoryRouter>` and `expect(screen.getByRole('heading', { name: 'RootLoop' })).toBeInTheDocument()`.
- [ ] **Step 6: Run `npm test`.** Expected: FAIL, because `AppRoutes` is not exported.
- [ ] **Step 7: Implement the entry points.**
  - `AppRoutes` returns `<Routes><Route path="*" element={<h1>RootLoop</h1>} /></Routes>`.
  - `main.tsx` imports `@fontsource-variable/fraunces`, `@fontsource/atkinson-hyperlegible/400.css`, `@fontsource/atkinson-hyperlegible/700.css` and `./index.css`, then renders `<StrictMode><BrowserRouter><AppRoutes /></BrowserRouter></StrictMode>` into `#root`.
- [ ] **Step 8: Verify.** `npm test` passes, and `npm run build` exits 0 and produces `dist/index.html`.
- [ ] **Step 9: Commit.**

```bash
git add docs package.json package-lock.json index.html vite.config.ts tsconfig.json tailwind.config.js postcss.config.js vercel.json .gitignore public src
git commit -m "chore: scaffold RootLoop with Vite, Tailwind and Vitest"
```

---

### Task 2: Types, helpers and simulators

**Files:**
- Create: `src/types.ts`, `src/lib/random.ts`, `src/lib/dates.ts`, `src/lib/format.ts`, `src/data/species.ts`, `src/sim/growth.ts`, `src/sim/temperature.ts`, `src/sim/moisture.ts`, `src/sim/ai.ts`
- Test: `src/lib/random.test.ts`, `src/lib/format.test.ts`, `src/sim/temperature.test.ts`, `src/sim/moisture.test.ts`, `src/sim/ai.test.ts`

**Interfaces:**
- Produces, `src/types.ts`. These are exact, and every later task uses them:

```ts
export type Role = 'admin' | 'staff' | 'public';
export const INTAKE_SOURCES = ['Elmina Central Park', 'Resident drop-off point', 'Landscape team'] as const;
export type IntakeSource = (typeof INTAKE_SOURCES)[number];
export const MATERIALS = ['leaves', 'branches', 'grass'] as const;
export type Material = (typeof MATERIALS)[number];
export type BatchStatus = 'composting' | 'ready_for_test' | 'passed' | 'failed' | 'sent_to_nursery';
export type MixPct = 0 | 25 | 50;
export const MIX_PCTS: readonly MixPct[] = [0, 25, 50];
export type SpeciesId = 'meranti' | 'tembusu' | 'angsana' | 'kelat';
export interface Species { id: SpeciesId; common: string; scientific: string }
export interface Intake { id: string; date: string; source: IntakeSource; material: Material; weightKg: number; collector: string; batchId?: string }
export interface TempReading { t: string; celsius: number }
export interface GerminationInput { seedsSample: number; seedsControl: number; rootLengthsSample: number[]; rootLengthsControl: number[] }
export interface TestResult extends GerminationInput { date: string; gi: number; passed: boolean }
export interface Batch { id: string; createdAt: string; intakeIds: string[]; status: BatchStatus; tempReadings: TempReading[]; testResult?: TestResult }
export interface MoistureReading { t: string; vwc: number }
export interface WeeklyRecord { week: number; heightCm: number; leafHealth: number; alive: number }
export type TrayLogKind = 'death' | 'pest' | 'watering';
export interface TrayLog { date: string; kind: TrayLogKind; note: string; count?: number }
export interface Tray { id: string; mixPct: MixPct; moisture: MoistureReading[]; weekly: WeeklyRecord[]; logs: TrayLog[] }
export interface Trial { id: string; species: SpeciesId; batchId: string; startDate: string; trays: Tray[] }
export interface Tree { id: string; species: SpeciesId; trayId: string; batchId: string; plantedAt?: string; location?: string }
export interface AppData { version: 1; intakes: Intake[]; batches: Batch[]; trials: Trial[]; trees: Tree[] }
```

- Produces, `random.ts`:
  - `mulberry32(seed: number): () => number`, which returns values in [0, 1).
  - `hashString(s: string): number`, an unsigned 32-bit FNV-1a hash.
  - `randInt(rng, min, max): number`, inclusive of both ends.
  - `randFloat(rng, min, max): number`
  - `pick<T>(rng, items: readonly T[]): T`
  - `round1(n): number`
- Produces, `dates.ts`:
  - `addHours(iso, h): string`
  - `addDays(date: 'YYYY-MM-DD', days): string`
  - `hoursBetween(aIso, bIso): number`
  - `weekStart(date): string`, which returns that week's Monday as `YYYY-MM-DD`.
  - `toLocalDate(iso): string`, which returns `YYYY-MM-DD` in Asia/Kuala_Lumpur (`toLocaleDateString('en-CA', { timeZone })`).
  - `todayLocal(): string`
  - `nowIso(): string`
- Produces, `format.ts`:
  - `formatKg(kg)` returns `"1,204 kg"` (rounded, `en-MY` grouping).
  - `formatDate(isoOrDate)` returns `"19 Oct 2026"`.
  - `formatShortDate(d)` returns `"19 Oct"`.
  - `formatDateTime(iso)` returns `"19 Oct 2026, 08:00"`.
  - `formatPct(fraction, digits = 0)` turns `0.889` into `"89%"`, and `null` into `"—"`.
  - `formatGI(gi: number | null)` returns `"92.0%"`, or `"—"` for null.
  - `STATUS_LABEL: Record<BatchStatus, string>` is `Composting / Ready for test / Passed / Failed / Sent to nursery`.
  - `MATERIAL_LABEL` is `Leaves / Branches / Grass`.
  - `mixLabel(m: MixPct)` returns `"0% (control)"`, `"25% compost"` or `"50% compost"`.
- Produces, `species.ts`:
  - `SPECIES: readonly Species[]`, in this order: Meranti *Shorea leprosula*, Tembusu *Fagraea fragrans*, Angsana *Pterocarpus indicus*, Pokok Kelat *Syzygium sp.* (IDs `meranti`, `tembusu`, `angsana`, `kelat`).
  - `getSpecies(id): Species`
- Produces, `growth.ts`:
  - `SEEDLINGS_PER_TRAY = 12`
  - `GROWTH_PROFILES: Record<SpeciesId, { initialHeightCm: number; mixes: Record<MixPct, { cmPerWeek: number; leafHealth: number; deaths: number }> }>`

| species | initial cm | 0% (cm/wk, leaf, deaths) | 25% | 50% |
|---|---|---|---|---|
| meranti | 10 | 1.6, 80, 1 | 1.7, 81, 1 | 1.0, 64, 3 |
| tembusu | 8 | 1.4, 72, 2 | 2.1, 85, 0 | 1.7, 78, 1 |
| angsana | 12 | 2.4, 76, 1 | 2.8, 82, 0 | 3.0, 80, 1 |
| kelat | 9 | 1.2, 78, 1 | 1.4, 83, 0 | 1.3, 79, 1 |

- Produces, `temperature.ts`:
  - Constants: `AMBIENT_C = 30`, `RISE_END_H = 48`, `PLATEAU_END_H = 432`, `COOL_END_H = 960`, `READING_INTERVAL_MIN = 30`.
  - `generateTempReadings(opts: { start: string; end: string; seed: number; peak?: number; dips?: { fromHour: number; hours: number; celsius: number }[]; gaps?: { fromHour: number; hours: number }[] }): TempReading[]`
- Produces, `moisture.ts`: `generateMoistureReadings(opts: { start: string; end: string; seed: number; mixPct: MixPct }): MoistureReading[]`
- Produces, `ai.ts`:
  - `SEEDS_PER_DISH = 10`
  - `simulateGerminationAnalysis(seed: number): GerminationInput`
  - `simulateSeedlingAnalysis(a: { species: SpeciesId; mixPct: MixPct; prevHeightCm: number; seed: number }): { heightCm: number; leafHealth: number }`

Algorithms. These are pinned because the tests and sample data depend on them:
- **Temperature:**
  - Create one reading every 30 min, at `start + k·30 min`, while `t ≤ end`.
  - Let `h` be the hours since `start` and `peak = opts.peak ?? 55 + rng()·10`.
  - Base value by phase:
    - `h < 48`: `30 + (peak−30)·h/48`
    - `h < 432`: `peak`
    - `h < 960`: `peak − (peak−30)·(h−432)/528`
    - otherwise: `30`
  - Add noise `(rng()−0.5)·2`, then round to 0.1.
  - Inside a dip window, the value is `dip.celsius + noise`.
  - Inside a gap window (`fromHour ≤ h < fromHour+hours`), skip the reading.
  - The RNG is `mulberry32(seed)`.
- **Moisture:**
  - One reading every 6 h.
  - `top = 38 + mixPct·0.08`.
  - `vwc = max(18, top − 4·daysSinceWatering)`, where watering happens every 72 h (`daysSinceWatering = (h mod 72)/24`).
  - Add noise `(rng()−0.5)·2`, then round to 0.1.
- **Germination:**
  - `seedsControl = 10`, with 10 control lengths of `round1(randFloat(36, 44))`.
  - `seedsSample = randInt(8, 10)`, with that many sample lengths of `round1(randFloat(30, 44))`.
- **Seedling:**
  - `heightCm = round1(prev + cmPerWeek + (rng()−0.5)·0.06)`.
  - `leafHealth = clamp(profile leafHealth + randInt(−1, 1), 0, 100)`.

- [ ] **Step 1: Write the failing tests.**

```ts
// random.test.ts
expect(Array.from({ length: 5 }, mulberry32(42))).toEqual(Array.from({ length: 5 }, mulberry32(42)));
expect(hashString('RL-B-2026-001')).toBe(hashString('RL-B-2026-001'));
expect(hashString('a')).not.toBe(hashString('b'));
// randInt stays in [3, 5] across 200 draws and hits both ends

// format.test.ts
expect(formatKg(1204.4)).toBe('1,204 kg');
expect(formatGI(92)).toBe('92.0%'); expect(formatGI(null)).toBe('—');
expect(formatPct(64 / 72)).toBe('89%'); expect(formatPct(null)).toBe('—');
expect(weekStart('2026-10-18')).toBe('2026-10-12'); // Sunday maps to the Monday before
expect(toLocalDate('2026-10-18T17:00:00.000Z')).toBe('2026-10-19');

// temperature.test.ts  (start = '2026-10-01T00:00:00.000Z')
// 24 h window gives 49 readings spaced 30 min apart
// same seed and options give toEqual output
// peak 60, 41-day window: every reading with 100 ≤ h ≤ 400 is in [59, 61]; at h = 0 it is in [29, 31]; with h ≥ 960 it is in [29, 31]
// peak omitted: the max for 100 ≤ h ≤ 400 is in [54, 66]
// gaps [{fromHour:10,hours:3}]: no reading with 10 ≤ h < 13
// dips [{fromHour:100,hours:6,celsius:37}]: readings in that window are in [36, 38]

// moisture.test.ts: 48 h gives 9 readings 6 h apart; every vwc is in [15, 50]; mean(mix 50) > mean(mix 0) for the same seed

// ai.test.ts
// germination: same seed gives toEqual output; seedsControl === 10; seedsSample in [8, 10];
//   rootLengthsSample.length === seedsSample; rootLengthsControl.length === 10
// seedling (tembusu, 25, prev 20): heightCm in [22.0, 22.2]; leafHealth in [84, 86]
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL, because the modules are missing.
- [ ] **Step 3: Implement** the files listed above, using the signatures and algorithms pinned here.
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src/types.ts src/lib src/data/species.ts src/sim`, then `git commit -m "feat: add data types, seeded RNG and IoT/AI simulators"`.

---

### Task 3: Domain logic (GI, alerts, IDs, scoring, KPIs)

**Files:**
- Create: `src/lib/gi.ts`, `src/lib/alerts.ts`, `src/lib/ids.ts`, `src/lib/scoring.ts`, `src/lib/kpis.ts`
- Test: one `*.test.ts` next to each file

**Interfaces:**
- Consumes: Task 2 types, `generateTempReadings`, `round1`, `hoursBetween`, `weekStart`.
- Produces:
  - `gi.ts`:
    - `GI_PASS_THRESHOLD = 80`
    - `computeGI(input: GerminationInput): number | null`. Returns `null` if `seedsControl ≤ 0`, the control lengths are empty, the mean control length is ≤ 0, or any count or length is negative or not finite. Returns `0` if `seedsSample` is 0 or the sample lengths are empty. Otherwise returns `round1((seedsSample/seedsControl)·(meanSample/meanControl)·100)`.
    - `isPass(gi: number | null): boolean`, which is `gi !== null && gi > 80`.
  - `alerts.ts`:
    - `AlertKind = 'too_cold' | 'too_hot' | 'sensor_offline'`
    - `Alert { id: string; batchId: string; kind: AlertKind; at: string; message: string }`
    - Constants: `TOO_COLD_C = 40`, `TOO_HOT_C = 70`, `OFFLINE_GAP_H = 2`, `ACTIVE_START_H = 48`, `ACTIVE_END_H = 432` (hours from the batch's first reading).
    - `detectAlerts(batch: Batch): Alert[]`, sorted by `at`.
    - `activeAlerts(batches: Batch[]): Alert[]`, which only covers batches with status `composting`.
  - `ids.ts`:
    - `nextBatchId(batches, year: number)`
    - `nextIntakeId(intakes)`
    - `nextTrialId(trials)`
    - `nextTreeId(trees)`
    - `trayId(trialId, mixPct)`
  - `scoring.ts`:
    - `SCORE_WEIGHTS = { height: 0.5, leafHealth: 0.3, survival: 0.2 }`
    - `MixScore { mixPct: MixPct; score: number; heightGrowthCm: number; avgLeafHealth: number; survivalRate: number; trayCount: number; weeks: number }`
    - `Recommendation { species: SpeciesId; best: MixScore; ranking: MixScore[]; trialCount: number; trayCount: number; weekCount: number; reason: string }`
    - `scoreTrays(trays: Tray[]): MixScore[]`
    - `recommendForSpecies(trials: Trial[], species: SpeciesId): Recommendation | null`
  - `kpis.ts`:
    - `COMPOST_YIELD = 0.4`
    - `Kpis { wasteDivertedKg; batchesActive; batchesPassed; batchesFailed; seedlingsGrowing; survivalRate: number | null; estimatedSoilSavedKg }`
    - `computeKpis(data: AppData): Kpis`
    - `wasteByWeek(intakes: Intake[], weeks = 8): { weekStart: string; kg: number }[]`

Pinned rules:
- **Alerts:**
  - Each run of consecutive readings with the same condition produces one alert, with `at` set to the run's first reading.
  - `too_cold`: a reading inside the active window with `celsius < 40`.
  - `too_hot`: a reading at any time with `celsius > 70`.
  - `sensor_offline`: more than 2 h between consecutive readings, with `at` set to the last reading before the gap.
  - IDs follow `${batchId}-${kind}-${n}`.
  - Messages:
    - too cold: `Too cold: ${min}°C during the active phase`
    - too hot: `Too hot: ${max}°C`
    - sensor offline: `Sensor offline for ${round1(gapH)} h`
- **IDs:**
  - Batch: `RL-B-${year}-` followed by (max sequence among IDs with that year + 1), padded to 3 digits. Other years are ignored.
  - Intake and tree: (max + 1), padded to 4 digits.
  - Trial: padded to 3 digits.
- **`scoreTrays`:**
  - Use only trays with at least 2 weekly records.
  - For each tray:
    - growth = last.heightCm − first.heightCm
    - avgLeaf = mean leafHealth of records with week ≥ 1
    - survival = last.alive / first.alive, or 0 if first.alive is 0
  - Average these per `mixPct`.
  - `heightScore = maxGrowth > 0 ? max(0, growth)/maxGrowth : 0`
  - `score = round1(100·(0.5·heightScore + 0.3·avgLeaf/100 + 0.2·survival))`
  - Sort by score, highest first. Ties go to the lower `mixPct`.
  - `weeks` is the maximum `last.week` in the group.
- **`recommendForSpecies`:**
  - Run `scoreTrays` on every tray of every trial of that species. Return `null` if the result is empty.
  - `trayCount` is the number of scored trays and `weekCount` is the maximum `weeks`.
  - `reason` is
    `` `${b.mixPct}% compost grew ${b.heightGrowthCm.toFixed(1)} cm in ${weekCount} weeks with leaf health ${Math.round(b.avgLeafHealth)}/100 and ${Math.round(b.survivalRate*100)}% survival` ``
    followed by `` `, vs ${c.heightGrowthCm.toFixed(1)} cm for the 0% control.` `` when the best mix is not 0% and a 0% control score exists, or by `.` otherwise.
- **KPIs:**
  - active = `composting` + `ready_for_test`
  - passed = `passed` + `sent_to_nursery`
  - `seedlingsGrowing` is the sum of the latest `alive` across all trays.
  - `survivalRate` = that sum ÷ the sum of the first `alive`, or `null` when there are no trays.
  - `estimatedSoilSavedKg = 0.4 ×` the intake weight of passed + sent batches.
- **`wasteByWeek`:** returns the last `weeks` Monday-start weeks, ending with the week of the latest intake, with zero-filled gaps. It returns `[]` when there are no intakes.

- [ ] **Step 1: Write the failing tests.**

```ts
// gi.test.ts
const control = [38, 42, 40, 41, 39, 40, 43, 37, 40, 40];
const passSample = [36, 38, 35, 37, 39, 36, 37, 38, 36, 36];
const failSample = [30, 34, 31, 33, 32, 29, 35, 32];
expect(computeGI({ seedsSample: 10, seedsControl: 10, rootLengthsSample: passSample, rootLengthsControl: control })).toBeCloseTo(92.0);
expect(computeGI({ seedsSample: 10, seedsControl: 10, rootLengthsSample: [4, ...passSample.slice(1)], rootLengthsControl: control })).toBeCloseTo(84.0);
expect(computeGI({ seedsSample: 8, seedsControl: 10, rootLengthsSample: failSample, rootLengthsControl: control })).toBeCloseTo(64.0);
expect(isPass(80)).toBe(false); expect(isPass(80.1)).toBe(true); expect(isPass(null)).toBe(false);
// returns null for: seedsControl 0, control lengths all 0, a length of -1, a length of NaN
// returns 0 for: seedsSample 0 with rootLengthsSample []

// alerts.test.ts (readings from generateTempReadings, start '2026-10-01T00:00:00.000Z', end +20 days, peak 60)
// clean curve: []
// dips [{fromHour:300,hours:6,celsius:37}]: exactly 1 alert, kind 'too_cold', message contains '°C during the active phase'
// dips [{fromHour:10,hours:6,celsius:35}] (rise phase): []
// dips [{fromHour:200,hours:2,celsius:72}]: 1 alert, kind 'too_hot'
// gaps [{fromHour:200,hours:3}]: 1 alert, kind 'sensor_offline'
// batch with 0 or 1 readings: []
// activeAlerts ignores a batch with status 'failed' that has a cold dip

// ids.test.ts
expect(nextBatchId([], 2026)).toBe('RL-B-2026-001');
// with IDs RL-B-2026-001 and RL-B-2026-004: 'RL-B-2026-005'; with only RL-B-2025-007: 'RL-B-2026-001'
expect(nextIntakeId([])).toBe('RL-I-0001'); expect(nextTreeId([])).toBe('RL-T-0001'); expect(nextTrialId([])).toBe('RL-TR-001');
expect(trayId('RL-TR-001', 25)).toBe('RL-TR-001-M25');

// scoring.test.ts — helper tray(mix, growth, leaf, aliveEnd): weekly [{week:0,heightCm:10,leafHealth:leaf,alive:12},{week:6,heightCm:10+growth,leafHealth:leaf,alive:aliveEnd}]
// [tray(0,10,80,12), tray(25,5,90,12)] gives mixes [0,25] with scores 94.0 and 72.0
// tray(50,10,80,6) on its own gives score 84.0
// equal scores give the lower mix first
// a tray with only week 0 is skipped; all trays week-0 only gives []
// all growth 0 gives finite scores
// two trays of the same mix are averaged and trayCount is 2
// recommendForSpecies: no trials for the species gives null
// fixture Tembusu trays (0%: growth 8.4, leaf 72, alive 10; 25%: 12.6, 85, 12; 50%: 10.2, 78, 11) give reason
//   '25% compost grew 12.6 cm in 6 weeks with leaf health 85/100 and 100% survival, vs 8.4 cm for the 0% control.'

// kpis.test.ts
// emptyData-like object: all counts 0, wasteDivertedKg 0, survivalRate null, no NaN anywhere
// fixture: intakes 100 + 50.4 kg, both in a 'sent_to_nursery' batch: wasteDivertedKg 150.4, estimatedSoilSavedKg ≈ 60.16
// wasteByWeek([10 kg on 2026-10-12, 5 kg on 2026-10-18, 20 kg on 2026-10-05], 3) gives
//   [{weekStart:'2026-09-28',kg:0},{weekStart:'2026-10-05',kg:20},{weekStart:'2026-10-12',kg:15}]
// wasteByWeek([]) gives []
```

- [ ] **Step 2: Run `npm test`.** Expected: FAIL, because the modules are missing.
- [ ] **Step 3: Implement** the five modules using the rules above.
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src/lib`, then `git commit -m "feat: add GI, alert, ID, scoring and KPI logic"`.

---

### Task 4: Seeded sample dataset

**Files:**
- Create: `src/data/sampleData.ts`
- Test: `src/data/sampleData.test.ts`

**Interfaces:**
- Consumes: Tasks 2 and 3.
- Produces:
  - `SAMPLE_SEED = 20261019`
  - `SAMPLE_NOW = '2026-10-19T00:00:00.000Z'`
  - `buildSampleData(): AppData`
  - `emptyData(): AppData`, which returns `{ version: 1, intakes: [], batches: [], trials: [], trees: [] }`

Contents (pinned):
- **Intakes.** There are 22, with IDs `RL-I-0001`…`RL-I-0022` assigned in this date order:

| IDs | Dates | Batch |
|---|---|---|
| 0001–0004 | 2026-07-06, 07-08, 07-10, 07-12 | RL-B-2026-001 |
| 0005–0008 | 09-07, 09-08, 09-09, 09-10 | RL-B-2026-002 |
| 0009–0013 | 09-11, 09-12, 09-14, 09-16, 09-17 | RL-B-2026-003 |
| 0014 | 09-22 | none |
| 0015–0020 | 09-29, 10-01, 10-02, 10-03, 10-05, 10-06 | RL-B-2026-004 |
| 0021, 0022 | 10-12, 10-16 | none |

  - Pick each intake's source, material and collector with `pick(mulberry32(SAMPLE_SEED), …)`. Collectors are `['Aiman','Siti','Kumar','Mei Ling','Farid']`.
  - Raw weight ranges are leaves 30–70, grass 40–80 and branches 50–90. Scale all weights so they total 1,200, then round each to the nearest 0.5 kg.
- **Batches.**
  - `createdAt` is the batch's last intake date at `T02:00:00.000Z`.
  - Readings start at the first intake date at `T00:00:00.000Z`, with seed `hashString(batchId)`.

| ID | Readings end | Peak | Dips / gaps | Status | Test result |
|---|---|---|---|---|---|
| RL-B-2026-001 | 2026-08-15T00:00Z | 62 | none | sent_to_nursery | 2026-08-25T02:00Z, pass fixture from Task 3 (GI 92.0) |
| RL-B-2026-002 | 2026-10-12T00:00Z | 48 | dip {120, 80, 37} | failed | 2026-10-13T02:00Z, fail fixture (GI 64.0) |
| RL-B-2026-003 | 2026-10-18T00:00Z | 60 | none | ready_for_test | none |
| RL-B-2026-004 | SAMPLE_NOW | 63 | gap {200, 3}; dip {300, 6, 37} | composting | none |

- **Trials.** `RL-TR-001` is meranti and `RL-TR-002` is tembusu. Both use batch `RL-B-2026-001` and start on `2026-09-07`. Each has trays M0, M25 and M50, seeded with `hashString(trayId)`:
  - **Moisture:** `generateMoistureReadings` from `2026-09-07T00:00:00.000Z` to `SAMPLE_NOW`.
  - **Weekly records:** weeks 0–6.
    - Week 0 is exact: `heightCm = initialHeightCm`, `leafHealth = profile leafHealth`, `alive = 12`.
    - Each later week `w` has `heightCm = round1(initial + w·cmPerWeek + (rng()−0.5)·0.06)` and `leafHealth = profile + randInt(−1, 1)`.
    - Deaths fall at weeks 2, 3 and 4, in that order. `alive` at week w is 12 minus the deaths at or before w.
  - **Logs:**
    - one `death` log per death (count 1, note "Seedling died", dated `startDate + 7·week`)
    - one `watering` log per week 1–6 (note "Watered 500 ml")
    - one `pest` log on `RL-TR-001-M50` at week 3 (note "Aphids on two seedlings, removed by hand")
- **Trees.** All use batch `RL-B-2026-001`:

| ID | Species | Tray | Planted | Location |
|---|---|---|---|---|
| RL-T-0001 | tembusu | RL-TR-002-M25 | 2026-10-16 | Elmina Central Park, east lawn |
| RL-T-0002 | tembusu | RL-TR-002-M25 | 2026-10-16 | Elmina Central Park, east lawn |
| RL-T-0003 | tembusu | RL-TR-002-M25 | none | none |
| RL-T-0004 | meranti | RL-TR-001-M25 | 2026-10-16 | Elmina Central Park, lakeside path |
| RL-T-0005 | meranti | RL-TR-001-M25 | none | none |
| RL-T-0006 | meranti | RL-TR-001-M0 | none | none |

- [ ] **Step 1: Write the failing tests.**

```ts
const d = buildSampleData();
expect(buildSampleData()).toEqual(d);                         // deterministic
expect(d.intakes).toHaveLength(22);
const total = d.intakes.reduce((s, i) => s + i.weightKg, 0);
expect(total).toBeGreaterThanOrEqual(1190); expect(total).toBeLessThanOrEqual(1210);
expect(d.batches.map(b => [b.id, b.status])).toEqual([
  ['RL-B-2026-001', 'sent_to_nursery'], ['RL-B-2026-002', 'failed'],
  ['RL-B-2026-003', 'ready_for_test'], ['RL-B-2026-004', 'composting']]);
expect(d.batches[0].testResult).toMatchObject({ gi: 92, passed: true });
expect(d.batches[1].testResult).toMatchObject({ gi: 64, passed: false });
// every batch.intakeIds entry exists and its intake has the matching batchId; RL-I-0014/0021/0022 have no batchId
expect(detectAlerts(d.batches[3]).map(a => a.kind).sort()).toEqual(['sensor_offline', 'too_cold']);
expect(detectAlerts(d.batches[0])).toEqual([]);
expect(activeAlerts(d.batches)).toHaveLength(2);
// each trial has 3 trays with 7 weekly records; moisture length > 100
// ACCEPTANCE: recommendation ranking for the sample data
const tem = recommendForSpecies(d.trials, 'tembusu')!;
expect(tem.ranking.map(m => m.mixPct)).toEqual([25, 50, 0]);
const mer = recommendForSpecies(d.trials, 'meranti')!;
expect(mer.ranking.map(m => m.mixPct)).toEqual([25, 0, 50]);
const s = Object.fromEntries(mer.ranking.map(m => [m.mixPct, m.score]));
expect(s[25] - s[0]).toBeGreaterThan(0); expect(s[25] - s[0]).toBeLessThan(6);   // close
expect(s[0] - s[50]).toBeGreaterThanOrEqual(15);                                   // 50% clearly worse
expect(recommendForSpecies(d.trials, 'angsana')).toBeNull();
expect(computeKpis(d)).toMatchObject({ batchesActive: 2, batchesPassed: 1, batchesFailed: 1, seedlingsGrowing: 64 });
expect(d.trees.map(t => t.id)).toEqual(['RL-T-0001','RL-T-0002','RL-T-0003','RL-T-0004','RL-T-0005','RL-T-0006']);
```

- [ ] **Step 2: Run `npm test -- sampleData`.** Expected: FAIL.
- [ ] **Step 3: Implement `buildSampleData` and `emptyData`.**
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src/data/sampleData.ts src/data/sampleData.test.ts`, then `git commit -m "feat: add seeded deterministic sample dataset"`.

---

### Task 5: State (reducer, persistence, providers)

**Files:**
- Create: `src/state/reducer.ts`, `src/state/storage.ts`, `src/state/DataContext.tsx`, `src/state/RoleContext.tsx`
- Test: `src/state/reducer.test.ts`, `src/state/storage.test.ts`

**Interfaces:**
- Consumes: the Task 2 simulators, the Task 3 `trayId` helper, and the Task 4 `buildSampleData` and `emptyData`.
- Produces:

```ts
export type Action =
  | { type: 'reset' } | { type: 'clear' }
  | { type: 'addIntake'; intake: Intake }
  | { type: 'createBatch'; id: string; intakeIds: string[]; now: string }
  | { type: 'markReadyForTest'; batchId: string }
  | { type: 'saveTestResult'; batchId: string; result: TestResult }
  | { type: 'createTrial'; id: string; species: SpeciesId; batchId: string; now: string }
  | { type: 'addWeeklyRecord'; trialId: string; trayId: string; record: WeeklyRecord }
  | { type: 'addTrayLog'; trialId: string; trayId: string; log: TrayLog }
  | { type: 'createTree'; tree: Tree };
export function reducer(state: AppData, action: Action): AppData;
```

  - `storage.ts`:
    - `STORAGE_KEY = 'rootloop:data:v1'`
    - `ROLE_KEY = 'rootloop:role'`
    - `loadData(): AppData`
    - `saveData(d: AppData): void`
    - `loadRole(): Role`, which defaults to `'admin'`
    - `saveRole(r: Role): void`
  - `DataContext.tsx`:
    - `DataProvider({ children, initialData?: AppData })`
    - `useData(): { data: AppData; dispatch: (a: Action) => void }`, which throws outside the provider.
  - `RoleContext.tsx`:
    - `RoleProvider({ children, initialRole?: Role })`
    - `useRole(): { role: Role; setRole: (r: Role) => void }`

Reducer rules. An unknown ID or an invalid transition returns the same `state` reference:
- `reset` returns `buildSampleData()`, and `clear` returns `emptyData()`.
- **`createBatch`:**
  - Use only the given intakes that exist and have no `batchId`. If none qualify, do nothing.
  - Otherwise set `status: 'composting'`, `createdAt: now`, and the `batchId` on each linked intake.
  - Readings come from `generateTempReadings({ start, end: now, seed: hashString(id) })`. Here `start` is the later of (earliest linked intake date at `T00:00:00.000Z`) and (`now` minus 60 days).
- `markReadyForTest` only works from `composting`.
- `saveTestResult` only works from `ready_for_test`. It sets `testResult`, and sets status to `passed` or `failed` from `result.passed`.
- **`createTrial`:**
  - Only works when the batch is `passed` or `sent_to_nursery`. It sets the batch to `sent_to_nursery`.
  - `startDate = toLocalDate(now)`.
  - Create one tray per mix in `MIX_PCTS` with:
    - `id: trayId(id, mix)`
    - `moisture` from `generateMoistureReadings({ start: now, end: now, seed: hashString(trayId), mixPct })`
    - `weekly: [{ week: 0, heightCm: initialHeightCm, leafHealth: profile leafHealth, alive: 12 }]`
    - `logs: []`
- `addTrayLog` with `kind: 'death'` and `count > 0` also sets the latest weekly record's `alive` to `max(0, alive − count)`.
- **Storage:**
  - `loadData` returns the parsed value only if it is an object with `version === 1` and array `intakes`, `batches`, `trials` and `trees`. Otherwise it returns `buildSampleData()`.
  - All localStorage access is wrapped in try/catch.
  - `DataProvider` uses `useReducer(reducer, null, () => initialData ?? loadData())` and saves in a `useEffect` whenever `data` changes.

- [ ] **Step 1: Write the failing tests.**
  - **Reducer:**
    - `reset` after `clear` deep-equals `buildSampleData()`.
    - `addIntake` appends the intake.
    - `createBatch` with `RL-I-0021` and `RL-I-0022` at `now = '2026-10-19T02:00:00.000Z'` creates `RL-B-2026-005`. Its status is `composting`, it has 2 intake IDs, and both intakes get the `batchId`. `tempReadings.length > 100`, because readings start on 2026-10-12.
    - `createBatch` with the already-batched `RL-I-0001` returns the same reference.
    - `markReadyForTest` on 004 sets `ready_for_test`. On 002 it returns the same reference.
    - `saveTestResult` on 003 with `passed: true` sets `passed`.
    - `createTrial` (`RL-TR-003`, angsana, 001) creates trays `RL-TR-003-M0/M25/M50`, each with weekly `[{ week: 0, heightCm: 12, alive: 12, … }]`. The batch stays `sent_to_nursery`.
    - `createTrial` with 002 returns the same reference.
    - A death log with `count: 2` on `RL-TR-002-M25` takes the latest `alive` from 12 to 10.
    - `createTree` appends the tree.
  - **Storage:**
    - Missing key, `'{bad json'`, `{"version":2}` and `{"version":1}` without arrays all return data deep-equal to `buildSampleData()`.
    - Valid saved data round-trips.
    - `loadRole()` with `'hacker'` stored returns `'admin'`.
- [ ] **Step 2: Run `npm test -- state`.** Expected: FAIL.
- [ ] **Step 3: Implement** the four files.
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src/state`, then `git commit -m "feat: add reducer, localStorage persistence and role context"`.

---

### Task 6: App shell, navigation, roles and shared UI

Before designing the layout, invoke the `frontend-design:frontend-design` skill. The design should feel earthy and editorial, not like a template: Fraunces headings, soft soil-paper background, leaf-green actions, and rounded-2xl cards with soil-200 borders.

**Files:**
- Create: `src/state/access.ts`, `src/components/Layout.tsx`, `src/components/Nav.tsx`, `src/components/RolePicker.tsx`, `src/components/RoleGate.tsx`, `src/components/SampleBadge.tsx`, `src/components/PreliminaryBadge.tsx`, `src/components/StatusBadge.tsx`, `src/components/EmptyState.tsx`, `src/test/render.tsx`
- Create placeholder pages, each holding only its `<h1>`: `src/pages/DashboardPage.tsx` ("Dashboard"), `IntakePage.tsx` ("Waste intake"), `BatchesPage.tsx` ("Compost batches"), `TrialsPage.tsx` ("Nursery trials"), `RecommendationsPage.tsx` ("Recommendations"), `TreesPage.tsx` ("Tree QR tags"), `AboutPage.tsx` ("About RootLoop"), `NotFoundPage.tsx` ("Page not found"). The detail placeholders `BatchDetailPage.tsx`, `MaturityTestPage.tsx`, `TrialDetailPage.tsx` and `PublicTreePage.tsx` render `useParams().id` as their h1.
- Modify: `src/App.tsx`, `src/main.tsx`
- Test: `src/App.test.tsx` (replace the contents)

**Interfaces:**
- Consumes: `useData`, `useRole`, `DataProvider`, `RoleProvider`, `buildSampleData` and `emptyData`.
- Produces:
  - **`access.ts`:**
    - `NavItem { to: string; label: string; icon: LucideIcon; roles: Role[] }`
    - `NAV_ITEMS`, in order:
      - `/` Dashboard (admin)
      - `/intake` Intake (admin, staff)
      - `/batches` Batches (admin, staff)
      - `/trials` Trials (admin, staff)
      - `/recommendations` Recommendations (admin)
      - `/trees` Tree tags (admin)
      - `/about` About (admin, staff)
    - `canAccess(role, pathname): boolean`. Any path under `/tree/` is always allowed. Otherwise the path is matched by its first segment, and `/` matches only exactly.
    - `homeFor(role, firstTreeId?: string): string`. Admin goes to `/`, staff to `/intake`, and public to `/tree/${firstTreeId}`, or `/` when there are no trees.
  - **`<SampleBadge />`:** a pill with `FlaskConical` and the text "Sample data" (sun-100 background, soil-900 text).
  - **`<PreliminaryBadge />`:** reads "Preliminary", with a dashed leaf-700 border on leaf-100.
  - **`<StatusBadge status />`:** shows the `STATUS_LABEL` text. Colors: composting sun, ready_for_test water, passed leaf, failed ember, sent_to_nursery solid leaf-700 with white text.
  - **`<EmptyState title body? action? />`**
  - **`<RolePicker compact? />`:** a labelled select "Demo role" with the options "Admin (SDP)", "Staff (nursery)" and "Public (resident)". On change it calls `setRole` and navigates to `homeFor`.
  - **`<RoleGate />`:** h1 "Not available for this role".
    - For public, it adds "Residents open tree pages by scanning a QR tag." and a link "Open an example tree page" to the first tree.
    - Otherwise it says "Switch role in the demo picker to see this screen."
  - **`Layout`:**
    - A sticky header with the RootLoop wordmark and `RolePicker`.
    - A sidebar for md and up.
    - A fixed bottom tab bar below md. It shows up to 5 allowed items; if the role has more than 5, it shows 4 plus a "More" menu.
    - Main content uses `max-w-5xl` with `pb-24` on mobile.
    - It renders `<RoleGate />` in place of the `<Outlet />` when `!canAccess(role, pathname)`.
  - **Routes in `AppRoutes`:**
    - Inside `Layout`: `/`, `/intake`, `/batches`, `/batches/:id`, `/batches/:id/test`, `/trials`, `/trials/:id`, `/recommendations`, `/trees` and `/about`.
    - Outside `Layout`: `/tree/:id` and `*` (NotFoundPage).
  - **`src/test/render.tsx`:** `renderApp(opts?: { route?: string; data?: AppData; role?: Role })`. It renders the providers, `MemoryRouter initialEntries={[route]}` and `AppRoutes`, and returns `{ ...renderResult, user: userEvent.setup() }`. Defaults: route `/`, sample data, admin.
  - **`main.tsx`:** `DataProvider` › `RoleProvider` › `BrowserRouter` › `AppRoutes`.

- [ ] **Step 1: Write the failing tests** in `App.test.tsx`.
  - `ROUTES` is a table of `[path, h1]`. Start with the 7 static pages, then `/nope` → "Page not found".
  - For each row, test both `renderApp({ route })` and `renderApp({ route, data: emptyData() })` and expect `getByRole('heading', { level: 1, name })`.
  - Admin sees links named "Recommendations" and "Tree tags". Use `getAllByRole`, because the mobile and desktop navs both render.
  - Staff on `/` sees "Not available for this role", and has no "Dashboard" link.
  - Public on `/intake` sees the gate and a link "Open an example tree page" with `href` `/tree/RL-T-0001`.
  - Choosing "Staff (nursery)" in "Demo role" on `/` shows the "Waste intake" heading.
  - Later tasks append their detail routes to `ROUTES`.
- [ ] **Step 2: Run `npm test -- App`.** Expected: FAIL.
- [ ] **Step 3: Implement** the shell, components and placeholders.
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass. Then run `npm run build` and expect exit 0.
- [ ] **Step 5: Commit.** Run `git add src`, then `git commit -m "feat: add app shell, role-based navigation and shared badges"`.

---

### Task 7: Dashboard

**Files:**
- Modify: `src/pages/DashboardPage.tsx`
- Create: `src/components/KpiCard.tsx`, `src/components/charts/WasteChart.tsx`
- Test: `src/pages/DashboardPage.test.tsx`

**Interfaces:**
- Consumes: `computeKpis`, `wasteByWeek`, `activeAlerts`, `formatKg`, `formatPct` and `useData`.
- Produces: `KpiCard({ label: string; value: string; caption?: string; icon: LucideIcon })`.

Content:
- Five KPI cards in a grid (2 columns on mobile, 3 on md and up), under a section heading with `<SampleBadge />`:
  - "Waste diverted": `formatKg`
  - "Batches": `"${active} active · ${passed} passed · ${failed} failed"`
  - "Seedlings growing"
  - "Seedling survival": `formatPct(survivalRate)`
  - "Est. soil saved": `formatKg`, with the caption "Estimate: 40% of input weight from passed batches, used in place of bought soil"
- **"Waste diverted per week" chart:** a Recharts `BarChart` of `wasteByWeek(intakes, 8)` in leaf-500, with x ticks from `formatShortDate`. With no intakes, show `<EmptyState title="No intakes yet" />`.
- **"Alerts" list:** `activeAlerts`, each showing the message, batch ID (linked to `/batches/:id`) and `formatDateTime(at)`. When empty, show "No alerts. All active piles are within range."
- **"Demo data" section:**
  - The "Reset to sample data" button calls `window.confirm('Replace all data with the sample data?')` and dispatches `reset`.
  - The "Clear all data" button calls `window.confirm('Delete all data? You can reset to the sample data later.')` and dispatches `clear`.

- [ ] **Step 1: Write the failing tests.**
  - With sample data:
    - The text `formatKg(computeKpis(buildSampleData()).wasteDivertedKg)` is shown.
    - "2 active · 1 passed · 1 failed", "64" and "89%" are shown.
    - Two alert items each link to `/batches/RL-B-2026-004`.
  - With `vi.spyOn(window, 'confirm').mockReturnValue(true)`:
    - Clicking "Clear all data" shows "0 kg", "No intakes yet" and "—".
    - Clicking "Reset to sample data" brings back the 2 alerts.
  - With confirm returning `false`, clicking Clear changes nothing.
- [ ] **Step 2: Run `npm test -- Dashboard`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src`, then `git commit -m "feat: add admin dashboard with KPIs, weekly waste chart and alerts"`.

---

### Task 8: Waste intake and batch creation

**Files:**
- Modify: `src/pages/IntakePage.tsx`
- Create: `src/features/intake/IntakeForm.tsx`, `src/features/intake/IntakeList.tsx`
- Test: `src/pages/IntakePage.test.tsx`

**Interfaces:**
- Consumes: `nextIntakeId`, `nextBatchId`, `todayLocal`, `nowIso`, `INTAKE_SOURCES`, `MATERIALS` and `MATERIAL_LABEL`.

Content:
- **Form fields:**
  - Source (select)
  - Material (select)
  - "Weight (kg)": `type="number"`, `step="0.1"`, `min="0.1"`, `inputMode="decimal"`
  - "Date": defaults to `todayLocal()`, with `max` set to today
  - "Collector"
- **Validation messages** (exact, shown next to the field with `aria-describedby`):
  - "Weight must be more than 0 kg"
  - "Enter the collector's name"
  - "Date can't be in the future"
- **On submit:**
  - Dispatch `addIntake` with the ID from `nextIntakeId`.
  - Announce `Intake ${id} logged` in an `aria-live="polite"` region.
  - Clear the weight and collector fields, and keep the source, material and date.
- **List:**
  - Newest first. Each item shows the date, source, material, kg and collector.
  - A batched intake shows a link to its batch.
  - An unbatched intake shows a checkbox labelled `Select ${id}`.
- **Batch button:**
  - The label is `Create batch from ${n} selected`, and the button is disabled when nothing is selected.
  - On click: `id = nextBatchId(batches, Number(todayLocal().slice(0, 4)))`, dispatch `createBatch` with `now: nowIso()`, then navigate to `/batches/${id}`.

- [ ] **Step 1: Write the failing tests.**
  - Use `vi.useFakeTimers({ toFake: ['Date'] })` and `vi.setSystemTime(new Date('2026-10-19T02:00:00Z'))`.
  - Adding an intake with weight 25 and collector "Aiman" shows "Intake RL-I-0023 logged" and a list item with "Aiman" and "25 kg".
  - Submitting with an empty collector and weight 0 shows both error messages and adds no row.
  - Checking "Select RL-I-0021" and "Select RL-I-0022", then clicking "Create batch from 2 selected", shows the heading "RL-B-2026-005" (the BatchDetail placeholder renders `useParams().id` as its h1 until Task 9).
  - "Select RL-I-0001" does not exist.
- [ ] **Step 2: Run `npm test -- Intake`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src`, then `git commit -m "feat: add waste intake form, log and batch grouping"`.

---

### Task 9: Compost batches list and detail

**Files:**
- Modify: `src/pages/BatchesPage.tsx`, `src/pages/BatchDetailPage.tsx`
- Create: `src/components/charts/TempChart.tsx`, `src/components/BatchFlow.tsx`
- Test: `src/pages/BatchesPage.test.tsx`; append to `ROUTES` in `src/App.test.tsx`

**Interfaces:**
- Consumes: `detectAlerts`, `StatusBadge`, `formatGI`, `STATUS_LABEL` and `useData`.
- Produces:
  - `TempChart({ readings: TempReading[] })`. Below 2 readings it renders `<EmptyState title="No readings yet" />`.
  - `BatchFlow({ status: BatchStatus })`, a 4-step stepper: Composting › Ready for test › Passed / Failed › Sent to nursery.

Content:
- **List:**
  - Cards, newest first: ID, `StatusBadge`, created date, total kg and `GI ${formatGI}` when tested. Each links to the detail page.
  - When empty: "No batches yet", plus a link "Log an intake" to `/intake`.
- **Detail:**
  - The h1 is the batch ID, followed by `StatusBadge` and `BatchFlow`.
  - "Temperature" section with `<SampleBadge />` and the caption "IoT probe, one reading every 30 min". It holds a Recharts `LineChart` with x as epoch ms (ticks from `formatShortDate`), y domain [20, 75], ember-500 line, no dots, and `ReferenceLine`s at 40 ("40°C active minimum") and 70 ("70°C maximum").
  - "Alerts" section: `detectAlerts`, or "No alerts for this batch".
  - "Inputs" section: "Total input" `formatKg`, and the linked intakes (date, source, material, kg).
  - **Actions by status:**
    - composting: button "Mark ready for test"
    - ready_for_test: link "Run maturity test" to `/batches/:id/test`
    - passed or sent_to_nursery: link "Start a nursery trial" to `/trials?batch=:id`
  - When a test result exists: "Maturity test" summary with `GI ${formatGI(gi)}`, "Pass" or "Fail", and the date.
  - Unknown ID: h1 "Batch not found".

- [ ] **Step 1: Write the failing tests.**
  - The list shows all 4 IDs with "Composting", "Ready for test", "Sent to nursery" and "Failed".
  - The empty list shows "No batches yet".
  - Detail for 004 shows text matching `/Too cold/` and `/Sensor offline/`, and "Total input" with `formatKg` of the sum of its intakes.
  - Clicking "Mark ready for test" shows "Ready for test" and the link "Run maturity test".
  - Detail for 001 shows "GI 92.0%" and "Pass".
  - `render(<TempChart readings={[oneReading]} />)` shows "No readings yet".
  - Append these `ROUTES` rows: `['/batches/RL-B-2026-001','RL-B-2026-001']`, and with empty data `/batches/RL-B-2026-001` gives "Batch not found".
- [ ] **Step 2: Run `npm test -- Batches`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src`, then `git commit -m "feat: add compost batch list and detail with IoT temperature chart and alerts"`.

---

### Task 10: Maturity test (simulated AI)

**Files:**
- Create: `src/components/PhotoAnalyser.tsx`, `src/features/maturity/GiEditor.tsx`
- Modify: `src/pages/MaturityTestPage.tsx`
- Test: `src/features/maturity/GiEditor.test.tsx`, `src/pages/MaturityTestPage.test.tsx`; append to `ROUTES`

**Interfaces:**
- Consumes: `simulateGerminationAnalysis`, `hashString`, `computeGI`, `isPass`, `formatGI`, `SEEDS_PER_DISH` and `nowIso`.
- Produces:
  - **`PhotoAnalyser({ inputLabel: string; onAnalysed: () => void })`:**
    - Exports `ANALYSIS_DELAY_MS = 2000`.
    - A file input (`accept="image/*"`, labelled `inputLabel`) and a preview `<img alt="Uploaded photo preview">`.
    - An "Analyse" button that stays disabled until a file is chosen.
    - While running, the button reads "Analysing…" with `aria-busy`. After 2000 ms it calls `onAnalysed`.
    - Revokes the object URL when the file changes or on unmount, and clears the timer on unmount.
    - Task 11 reuses it.
  - **`GiEditor({ initial: GerminationInput; onChange: (r: { input: GerminationInput; gi: number } | null) => void })`:**
    - Keeps raw string cell values.
    - Shows "Germinated: ${seedsSample}/10 sample, ${seedsControl}/10 control".
    - Shows "Mean root length: ${sample} mm sample vs ${control} mm control", each to 1 decimal place, recomputed live.
    - Has two lists, "Sample root lengths (mm)" and "Control root lengths (mm)". The inputs are labelled `Sample seed ${n} root length (mm)` and `Control seed ${n} root length (mm)`.
    - A cell is invalid when it is empty, not a number or negative. It gets `aria-invalid` and the message "Enter a length of 0 mm or more".
    - Shows "Germination Index" with `formatGI`, plus a "Pass" or "Fail" chip. Shows "—" while any cell is invalid or GI is null.
    - Calls `onChange(null)` whenever there is no valid GI.

Page content:
- **Guards:**
  - Unknown batch: h1 "Batch not found".
  - Status `composting`: "Mark this batch ready for test first." with a link back to the batch.
  - Status passed, failed or sent: show the saved result read-only.
- For `ready_for_test`:
  - h1 "Maturity test", then `PhotoAnalyser` labelled "Germination test photo".
  - After analysis: `<SampleBadge />` and a `GiEditor` with `initial = simulateGerminationAnalysis(hashString(batch.id))`.
  - The "Save result" button is disabled while `onChange` reports null. Clicking it dispatches `saveTestResult` with `{ ...input, date: nowIso(), gi, passed: isPass(gi) }`, then navigates to `/batches/:id`.
- The exact maturity note is always visible, in every state.

- [ ] **Step 1: Write the failing tests.** These cover the ACCEPTANCE criterion that GI recalculates when root lengths are edited.
  - **GiEditor:**
    - With the pass fixture from Task 3, it shows "92.0%" and "Pass".
    - Typing `4` into "Sample seed 1 root length (mm)" (clear it first) shows "84.0%".
    - With the fail fixture, it shows "64.0%" and "Fail".
    - Clearing "Control seed 3 root length (mm)" shows "—" and "Enter a length of 0 mm or more", and the last `onChange` call is `null`.
  - **Page:**
    - Use `vi.useFakeTimers({ shouldAdvanceTime: true })` and `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.
    - On 003: upload `new File(['x'], 'g.jpg', { type: 'image/jpeg' })` and click "Analyse", which shows "Analysing…".
    - `await act(() => vi.advanceTimersByTimeAsync(2000))`, which shows "Germination Index".
    - Click "Save result". The heading becomes "RL-B-2026-003", with the status label "Passed" or "Failed" matching `isPass(computeGI(simulateGerminationAnalysis(hashString('RL-B-2026-003'))))`.
    - The note text is present before and after analysis.
    - Batch 004 shows "Mark this batch ready for test first."
  - Append the `ROUTES` row `['/batches/RL-B-2026-003/test','Maturity test']`. With empty data that route gives "Batch not found".
- [ ] **Step 2: Run `npm test -- Maturity GiEditor`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src`, then `git commit -m "feat: add simulated AI maturity test with editable GI"`.

---

### Task 11: Nursery trials

**Files:**
- Modify: `src/pages/TrialsPage.tsx`, `src/pages/TrialDetailPage.tsx`
- Create: `src/features/trials/NewTrialForm.tsx`, `src/features/trials/TrayPanel.tsx`, `src/features/trials/TrayLogForm.tsx`, `src/components/charts/MoistureChart.tsx`, `src/components/charts/GrowthChart.tsx`
- Test: `src/pages/TrialsPage.test.tsx`; append to `ROUTES`

**Interfaces:**
- Consumes: `PhotoAnalyser` (Task 10), `simulateSeedlingAnalysis`, `nextTrialId`, `SPECIES`, `getSpecies`, `mixLabel`, `todayLocal` and `nowIso`.
- Produces:
  - `MoistureChart({ readings: MoistureReading[] })`: y domain [0, 60], label "VWC %", water-500 line. Below 2 readings it renders "No readings yet".
  - `GrowthChart({ trays: Tray[] })`: height in cm against week, one line per tray (0% soil-500, 25% leaf-700, 50% water-500), with a legend using `mixLabel`.

Content:
- **List:**
  - Trial cards show the species common name, the scientific name in italics, the batch ID, `formatDate(startDate)` and `${maxWeek} weeks of data`.
  - Empty state: "No trials yet".
- **`NewTrialForm`:**
  - "Species" select.
  - "Compost batch" select, listing only batches that are `passed` or `sent_to_nursery`, labelled `${id} · GI ${formatGI}`. It preselects the `?batch=` value.
  - When no batch is eligible, show "No passed batches yet. Run a maturity test first." in place of the form.
  - Submitting dispatches `createTrial` with `nextTrialId` and `nowIso()`, then navigates to the new trial.
- **Detail:**
  - h1 `${common} trial`, with the scientific name, batch link and start date.
  - "Growth by mix" `GrowthChart` with `<SampleBadge />`.
  - Tray tabs (`role="tablist"`, tab names from `mixLabel`). The selected tray shows a `TrayPanel`:
    - "Soil moisture" `MoistureChart` with `<SampleBadge />`.
    - "Weekly records" list: Week, Height (cm), Leaf health, Alive.
    - A `PhotoAnalyser` labelled "Weekly seedling photo". On analysis it dispatches `addWeeklyRecord` with `{ week: last.week + 1, ...simulateSeedlingAnalysis({ species, mixPct, prevHeightCm: last.heightCm, seed: hashString(`${tray.id}-w${last.week + 1}`) }), alive: last.alive }`, then announces `Week ${n} added`.
    - `TrayLogForm`: "Log type" select (Death, Pest, Watering); "Note" (required for Pest); "Number of seedlings" (Death only, min 1, default 1). It dispatches with `date: todayLocal()`.
    - The log list, newest first.
  - Unknown ID: h1 "Trial not found".

- [ ] **Step 1: Write the failing tests.**
  - The list shows "Meranti" and "Tembusu".
  - The "Compost batch" options include `RL-B-2026-001` and exclude 002, 003 and 004.
  - Creating an Angsana trial with 001 shows the heading "Angsana trial" and 3 tabs: "0% (control)", "25% compost", "50% compost". Its moisture section shows "No readings yet", because a new tray has 1 reading.
  - On `/trials/RL-TR-002`, selecting "25% compost", uploading a photo, clicking "Analyse" and advancing 2000 ms (fake timers as in Task 10) shows "Week 7 added".
  - A death log with 2 seedlings on that tray makes the latest record's Alive 10.
  - Append the `ROUTES` row `['/trials/RL-TR-002','Tembusu trial']`. With empty data, `/trials` shows "No trials yet" and `/trials/RL-TR-002` shows "Trial not found".
- [ ] **Step 2: Run `npm test -- Trials`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src`, then `git commit -m "feat: add nursery trials with tray moisture, weekly AI photos and logs"`.

---

### Task 12: Recommendations

**Files:**
- Modify: `src/pages/RecommendationsPage.tsx`
- Test: `src/pages/RecommendationsPage.test.tsx`

**Interfaces:**
- Consumes: `recommendForSpecies`, `SPECIES`, `mixLabel`, `PreliminaryBadge` and `SampleBadge`.

Content:
- **Intro copy:**
  - "Rule-based score: height growth 50%, leaf health 30%, survival 20%."
  - "Updates as more batches and trials are added." (exact)
  - "All recommendations are preliminary until the 3-month Elmina nursery pilot ends."
- **One `<article aria-labelledby>` per species,** headed by the common name:
  - With no recommendation: "No trial data yet".
  - Otherwise:
    - "Best mix: ${mixLabel(best)}", `<PreliminaryBadge />` and `<SampleBadge />`.
    - `${trayCount} trays · ${weekCount} weeks`.
    - The `reason`.
    - Ranking bars: a div at `width: score%` labelled `${mixLabel} — ${score.toFixed(1)}`.

- [ ] **Step 1: Write the failing tests.**
  - Inside `getByRole('article', { name: 'Tembusu' })`: "Best mix: 25% compost", "Preliminary", "3 trays · 6 weeks" and text starting "25% compost grew".
  - The Meranti best mix is "Best mix: 25% compost".
  - The "Angsana" and "Pokok Kelat" articles show "No trial data yet".
  - The exact "Updates as more batches and trials are added." copy is present.
- [ ] **Step 2: Run `npm test -- Recommendations`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src`, then `git commit -m "feat: add per-species preliminary mix recommendations"`.

---

### Task 13: Tree QR tags and public tree page

**Files:**
- Create: `src/lib/treeUrl.ts`, `src/features/trees/NewTreeForm.tsx`
- Modify: `src/pages/TreesPage.tsx`, `src/pages/PublicTreePage.tsx`
- Test: `src/lib/treeUrl.test.ts`, `src/pages/Trees.test.tsx`; append to `ROUTES`

**Interfaces:**
- Consumes: `QRCodeSVG` from `qrcode.react`, `nextTreeId`, `getSpecies`, `mixLabel`, `formatKg` and `RolePicker`.
- Produces: `treeUrl(id: string, origin: string = window.location.origin): string`, which returns `${origin}/tree/${encodeURIComponent(id)}`.

Content:
- **TreesPage (admin):**
  - A grid of cards. Each has `<QRCodeSVG value={treeUrl(id)} title={treeUrl(id)} size={132} level="M" marginSize={2} />`, the ID, the species, either `Planted ${formatDate} · ${location}` or "In nursery", and a link "Open public page" to `/tree/:id`.
  - A "Print tags" button calls `window.print()`. The header and nav use `print:hidden`.
  - **`NewTreeForm`:**
    - "Seedling tray" select over every tray of every trial, labelled `${common} · ${mixLabel} · ${trialId}`.
    - Optional "Planting date" and "Location".
    - Submitting dispatches `createTree` with `nextTreeId`, plus the species and batch taken from the tray's trial.
  - Empty state: "No trees tagged yet".
- **PublicTreePage (`/tree/:id`, outside Layout, never gated):**
  - The h1 is the species common name, with the scientific name in italics.
  - A hero band (leaf-700 background, white text) with the exact headline.
  - Facts:
    - "Planted": `formatDate`, or "Still growing in the Elmina nursery"
    - "Location": the location, or "Elmina nursery"
    - "Compost batch": the batch ID
    - "Compost mix": `mixLabel` from the tray, or "Unknown"
  - "Your township has diverted" `formatKg(sum of all intakes)` "of garden waste", with `<SampleBadge />`.
  - A 3-step strip: Leaves collected › Composted and tested › Grown into this tree.
  - The footer has `<RolePicker compact />`.
  - Unknown ID: h1 "Tree not found" and "Check the tag and try again."

- [ ] **Step 1: Write the failing tests.**
  - `treeUrl('RL-T-0001', 'https://rootloop.vercel.app')` returns `'https://rootloop.vercel.app/tree/RL-T-0001'`.
  - `/trees` renders 6 elements matching `getByTitle(treeUrl(id))` for `RL-T-0001`…`0006`.
  - The "Open public page" links have `href="/tree/RL-T-0001"`.
  - ACCEPTANCE: clicking the first "Open public page" link shows the h1 "Tembusu", "RL-B-2026-001", the headline, and `formatKg` of the sample total.
  - `/tree/RL-T-9999` shows "Tree not found".
  - `renderApp({ route: '/tree/RL-T-0001', role: 'public' })` shows "Tembusu" and no "Not available for this role".
  - Adding a tree from "Tembusu · 25% compost · RL-TR-002" shows a card for `RL-T-0007`.
  - Append the `ROUTES` row `['/tree/RL-T-0001','Tembusu']`. With empty data that route gives "Tree not found".
- [ ] **Step 2: Run `npm test -- Trees treeUrl`.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.
- [ ] **Step 5: Commit.** Run `git add src`, then `git commit -m "feat: add tree QR tags and public tree page"`.

---

### Task 14: About page, copy guard, README and final verification

**Files:**
- Create: `src/data/hardware.ts`, `src/test/copyGuard.test.ts`, `README.md`
- Modify: `src/pages/AboutPage.tsx`
- Test: `src/data/hardware.test.ts`

**Interfaces:**
- Produces:
  - `HardwareItem { item: string; qty: number; unitRm: number; purpose: string }`
  - `HARDWARE: HardwareItem[]`
  - `HARDWARE_BUDGET_RM = 200`
  - `hardwareTotal(): number`

`HARDWARE` (estimated Malaysian retail prices):

| Item | Qty | RM each | Purpose |
|---|---|---|---|
| ESP32 DevKit V1 | 1 | 25 | Reads sensors, sends data over Wi-Fi |
| DS18B20 waterproof temperature probe (1 m) | 2 | 12 | Core temperature of each compost pile |
| Capacitive soil moisture sensor v1.2 | 3 | 6 | One per nursery tray mix |
| 4.7 kΩ resistor, jumper wires, mini breadboard | 1 | 15 | Wiring |
| IP65 junction box | 1 | 20 | Weatherproof enclosure |
| 2 × 18650 cells, holder and TP4056 charger | 1 | 35 | Battery power |
| 6 V 1 W mini solar panel | 1 | 20 | Top-up charging |

The total is RM 157. Photos come from staff phones at no extra cost.

About page sections, under the h1 "About RootLoop":
1. **The problem:** township garden waste is burned or sent to landfill, while nurseries buy soil. Nobody checks whether compost actually suits a given tree species.
2. **How it works:** a 6-step flow diagram (vertical on mobile, horizontal on md and up), with lucide icons and the spec's flow labels.
3. **What's new:** the pitch line, plus the link from compost batch to tree species, carried through to the QR tag.
4. **Fit with Sime Darby Property:** circular economy, biodiversity, the Elmina nursery, and "190,000+ trees planted".
5. **Prototype hardware:** the table, then `Total: RM ${hardwareTotal()} (budget under RM ${HARDWARE_BUDGET_RM})`, labelled as estimated prices.
6. **Pilot plan, 3 months at the Elmina nursery:**
   - Month 1: install sensors on 2 piles and start intake logging.
   - Month 2: run maturity tests and start trials for 4 species.
   - Month 3: compare mixes and publish the first preliminary recommendations.
7. **Scope and limits:** sensors and AI are simulated in this demo; the maturity test is not a pathogen test; nursery scope only.

- [ ] **Step 1: Write the failing tests.**
  - `hardwareTotal()` is 157 and less than `HARDWARE_BUDGET_RM`.
  - The About page renders "190,000+ trees planted" and "RM 157".
  - In `copyGuard.test.ts`:

```ts
const files = import.meta.glob(['/src/**/*.{ts,tsx}', '!/src/test/copyGuard.test.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
for (const [path, text] of Object.entries(files)) {
  expect(text, path).not.toMatch(/carbon|germ[- ]?free|pathogen[- ]free|sterili[sz]/i);
}
expect(Object.keys(files).length).toBeGreaterThan(20);
```

- [ ] **Step 2: Run `npm test -- hardware copyGuard`.** Expected: FAIL for hardware. The copy guard should already pass, and if it does not, fix the copy.
- [ ] **Step 3: Implement** `hardware.ts` and `AboutPage`. Write `README.md` with these sections:
  - what RootLoop is, and a sample-data notice
  - prerequisites (Node 20+)
  - `npm install`, `npm run dev`, `npm test`, `npm run build` and `npm run preview`
  - the demo roles
  - deploying to Vercel, either by pushing to GitHub and importing in Vercel (framework Vite, build `npm run build`, output `dist`) or with `npx vercel` and then `npx vercel --prod`
  - why `vercel.json` is needed for `/tree/:id` deep links
  - the folder map
- [ ] **Step 4: Run the full verification.**
  - `npm test` passes in full, and `npm run build` exits 0.
  - Run `npm run preview` and open it in the browser at 375×812. Walk the whole flow:
    1. Intake: log an intake, select 2, create a batch.
    2. Mark it ready for test, then upload, analyse and save.
    3. Create a trial and add a weekly photo.
    4. Check Recommendations.
    5. In Tree tags, open a public page.
    6. Switch to the Public role.
  - On each screen, `document.documentElement.scrollWidth <= 375`, and the console shows no errors.
- [ ] **Step 5: Commit.** Run `git add src README.md`, then `git commit -m "feat: add About/hardware page, copy guard and README"`.
- [ ] **Step 6: Deploy (user step).** The user deploys to Vercel with their own account, following the README. After deploying, open `https://<deployment>/tree/RL-T-0001` directly to confirm the rewrite works.
