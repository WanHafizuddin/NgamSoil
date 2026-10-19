# RootLoop – Build Spec (Prototype for Sime Darby Property Hackathon, Planet theme)

## What it is

RootLoop turns a township's fallen leaves, branches and grass into compost, checks every batch with IoT sensors and AI photo analysis, then finds which compost mix suits each tree species in the nursery. Pitch line: "Others ask if compost is ready. We ask if it's right for this tree."

Flow: Waste intake → Compost pile (IoT temperature) → Maturity test (AI germination photo) → Nursery trials (IoT moisture + AI seedling photos) → Per-species mix recommendation → QR tag on planted tree.

## Build type

- Clickable demo web app for the preliminary round, mobile-first and responsive to desktop
- No backend. All data is mock/sample data in JSON, with state in React plus localStorage
- AI and IoT are SIMULATED. Every simulated value carries a visible "Sample data" badge
- Deployable to Vercel as a static site

## Tech stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- React Router
- Recharts (charts)
- qrcode.react (QR tags)
- lucide-react (icons)
- Vitest + React Testing Library (basic tests)

## Roles (switchable from a demo role picker, no real auth)

- Admin (SDP): dashboard, all modules
- Staff (nursery/landscape): intake, batches, tests, trials
- Public: tree QR page only

## Screens

### 1. Dashboard (Admin)

- KPI cards: waste diverted (kg), batches active/passed/failed, seedlings growing, seedling survival rate, estimated soil saved (kg)
- Chart: waste diverted per week
- List of alerts, such as a pile running too cold or a sensor offline
- Clear the data, or reset it to the sample data, from a button

### 2. Waste Intake

- Form: source (Elmina Central Park / Resident drop-off point / Landscape team), material (leaves / branches / grass), weight (kg), date, collector
- Intake log table
- Button to group selected intakes into a new compost batch, which generates an ID like `RL-B-2026-001`

### 3. Compost Batches

- List with status: Composting → Ready for test → Passed / Failed → Sent to nursery
- Batch detail:
  - Simulated IoT temperature chart (readings every 30 min over the batch's age; thermophilic curve rising to ~55–65°C, then cooling to ambient ~30°C)
  - Alerts: too cold (<40°C during the active phase), too hot (>70°C), sensor offline (gap of over 2 h)
  - Total input weight and linked intakes
  - "Mark ready for test" button

### 4. Maturity Test (simulated AI)

- Upload a germination test photo (any image, shown as a preview)
- "Analyse" runs a ~2 s fake loading state, then returns sample results:
  - Seeds germinated vs control, average root length vs control
  - Germination Index: GI = (germination % of sample ÷ control) × (mean root length of sample ÷ control) × 100
  - Pass if GI > 80%
- Editable table of root lengths (human override) that recomputes GI live
- Note always shown: "This test shows compost maturity, not that it is free of pathogens."
- Save the result to the batch; only passed batches can go to the nursery

### 5. Nursery Trials

- Create a trial: species + passed batch. Auto-creates 3 trays: 0% (control), 25%, 50% compost
- Sample species: Meranti (Shorea leprosula), Tembusu (Fagraea fragrans), Angsana (Pterocarpus indicus), Pokok Kelat (Syzygium sp.)
- Per tray:
  - Simulated soil moisture chart (% VWC)
  - Weekly photo upload, then simulated AI returns height (cm) and a leaf health score (0–100)
  - Manual log: deaths, pests, watering
- Growth chart comparing the 3 mixes over weeks

### 6. Recommendations

- Per species: rank the mixes by a simple score (height growth 50%, leaf health 30%, survival 20%)
- Show the best mix with a "Preliminary" badge, sample size (n trays, n weeks) and a short reason
- Rule-based, not ML. Copy: "Updates as more batches and trials are added."

### 7. Tree QR Tags + Public Page

- Generate a QR for each seedling or planted tree (encodes `/tree/:id`)
- Public page `/tree/:id`: species, planting date, location, compost batch ID, "Grown with compost from your township's leaves", township's total waste diverted
- Clean, friendly design for residents

## Data model (TypeScript types)

- `Intake { id, date, source, material, weightKg, collector, batchId? }`
- `Batch { id, createdAt, intakeIds[], status, tempReadings: {t, celsius}[], testResult? }`
- `TestResult { date, seedsSample, seedsControl, rootLengthsSample[], rootLengthsControl[], gi, passed }`
- `Trial { id, species, batchId, startDate, trays: Tray[] }`
- `Tray { id, mixPct: 0|25|50, moisture: {t, vwc}[], weekly: {week, heightCm, leafHealth, alive}[], logs[] }`
- `Tree { id, species, trayId, batchId, plantedAt?, location? }`

## Sample data

- About 20 intakes over 6 weeks (~1,200 kg total)
- 4 batches: 1 composting, 1 ready for test, 1 passed (GI 92%), 1 failed (GI 64%)
- 2 trials (Meranti and Tembusu), 6 weeks of weekly data each
  - Tembusu: 25% mix performs best
  - Meranti: 0% and 25% perform close, 50% worse (to show that species differ)
- Generate the sample data with a seeded function, so it's realistic but deterministic

## Constraints

- Prototype hardware budget under RM200 (ESP32, DS18B20 temperature probe, capacitive soil moisture sensors). Show this on an "About / Hardware" page
- Never claim compost is germ-free
- Never claim carbon savings
- All recommendations are labelled "Preliminary" until the 3-month Elmina nursery pilot ends
- Nursery-only scope; no open-landscape monitoring
- Every simulated value is visibly marked "Sample data"

## Non-functional

- Mobile-first (works at 375px), large tap targets, few steps per task
- Accessible: labels on inputs, visible focus, sufficient contrast
- Earthy, clean visual style (greens, soil browns), avoiding generic templates
- Fast loading; no external API calls

## About page

- Problem, solution flow diagram, what's new (the link from compost batch to tree species), SDP fit (circular economy, biodiversity, Elmina nursery, 190,000+ trees planted), hardware list with costs, pilot plan (3 months at Elmina nursery)

## Acceptance criteria

- All 7 screens are reachable and work with sample data
- GI recalculates correctly when root lengths are edited (unit test)
- The recommendation ranking is correct for the sample data (unit test)
- QR codes open the matching public tree page
- `npm run build` passes, and the app deploys to Vercel
- README with setup, run and deploy steps

## Out of scope

- Real hardware integration, real AI models, auth, a backend or database, pathogen testing, open-landscape monitoring
