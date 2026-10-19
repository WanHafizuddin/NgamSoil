# RootLoop

RootLoop turns a township's fallen leaves, branches and grass into compost. It checks every batch with IoT sensors and AI photo analysis, then finds which compost mix suits each tree species in the nursery.

> Others ask if compost is ready. We ask if it's right for this tree.

This is a clickable prototype built for the Sime Darby Property hackathon (Planet theme).

**Sample data notice:** RootLoop has no backend. The sensors (temperature, soil moisture) and the AI photo analysis are simulated, and every simulated value is marked "Sample data" in the app. Data is stored in your browser's localStorage. You can reset it to the sample story or clear it from the Dashboard.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer

## Setup and run

```bash
npm install
npm run dev        # start the dev server at http://localhost:5173
npm test           # run the unit and component tests (Vitest)
npm run build      # type-check and build to dist/
npm run preview    # serve the production build locally
```

## Demo roles

There is no login. Use the **Demo role** picker in the header:

| Role | Can use |
|---|---|
| Admin (SDP) | Dashboard, intake, batches, maturity tests, trials, recommendations, tree tags, About |
| Staff (nursery) | Intake, batches, maturity tests, trials, About |
| Public (resident) | Public tree pages only (`/tree/:id`) |

## Demo walkthrough

1. **Intake:** log a load, tick two loads that are not in a batch yet, and choose **Create batch**.
2. **Batch:** check the temperature chart and alerts, then choose **Mark ready for test**.
3. **Maturity test:** upload any photo and choose **Analyse**. Edit a root length to watch the Germination Index update, then save.
4. **Trials:** start a trial with a passed batch, and add a weekly seedling photo.
5. **Recommendations:** see the preliminary best mix per species.
6. **Tree tags:** open a QR code's public page, or scan it from a phone.

## Deploy to Vercel

The app is a static Vite build.

**Option A: GitHub import**

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the detected settings: framework **Vite**, build command `npm run build`, output directory `dist`.
4. Deploy.

**Option B: Vercel CLI**

```bash
npx vercel
```

```bash
npx vercel --prod
```

`vercel.json` rewrites every path to `index.html`. QR codes link straight to `/tree/:id`, and without the rewrite those deep links would return 404. After deploying, open `https://<your-deployment>/tree/RL-T-0001` directly to confirm the rewrite works.

## Project structure

```
src/
  types.ts           data model
  data/              seeded sample data, species list, hardware list
  sim/               simulated IoT readings and AI photo analysis
  lib/               GI, alerts, scoring, KPIs, IDs, dates, formatting
  state/             reducer, localStorage persistence, roles and access rules
  components/        layout, navigation, badges, charts, photo analyser
  features/          forms and panels for intake, maturity tests, trials and trees
  pages/             one file per screen
  test/              test setup, render helper and copy guard
```

## Scope

- This is a nursery-only prototype. Open landscape planting is not monitored.
- The maturity test checks compost maturity. It is not a pathogen test.
- Recommendations are rule-based (height growth 50%, leaf health 30%, survival 20%). They stay preliminary until the 3-month Elmina nursery pilot ends.
- Prototype hardware costs RM 157, within the RM 200 budget. The full list is on the About page.
