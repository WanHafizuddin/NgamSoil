import { Award, FlaskConical, Leaf, QrCode, Sprout, Thermometer } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { HARDWARE, HARDWARE_BUDGET_RM, hardwareTotal } from '../data/hardware';

const FLOW = [
  { icon: Leaf, title: 'Waste intake', body: 'Leaves, branches and grass are weighed and logged.' },
  { icon: Thermometer, title: 'Compost pile', body: 'An IoT probe tracks the pile temperature.' },
  { icon: FlaskConical, title: 'Maturity test', body: 'AI reads a germination photo to check the compost is mature.' },
  { icon: Sprout, title: 'Nursery trials', body: 'IoT moisture sensors and AI seedling photos compare 0%, 25% and 50% mixes.' },
  { icon: Award, title: 'Mix per species', body: 'Each species gets the mix it grew best in.' },
  { icon: QrCode, title: 'QR tag on the tree', body: 'Residents scan a planted tree to see its story.' },
];

const PILOT = [
  { month: 'Month 1', body: 'Install sensors on 2 piles and start logging intakes.' },
  { month: 'Month 2', body: 'Run maturity tests and start trials for 4 species.' },
  { month: 'Month 3', body: 'Compare mixes and publish the first preliminary recommendations.' },
];

export function AboutPage() {
  return (
    <>
      <PageHeader title="About NgamSoil" intro="Township garden waste becomes compost, and each tree species gets the compost mix that suits it." />

      <blockquote className="mb-6 rounded-2xl bg-leaf-900 p-6 font-display text-2xl leading-snug text-soil-50 md:text-3xl">
        Others ask if compost is ready. We ask if it's right for this tree.
      </blockquote>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="The problem">
          <p className="text-soil-900">
            Township parks and homes produce tonnes of fallen leaves, branches and grass. Most of it is burned or sent to landfill, while
            nurseries buy soil for their seedlings. Where compost is made, nobody checks whether it actually suits a given tree species.
          </p>
        </Panel>
        <Panel title="What's new">
          <p className="text-soil-900">
            NgamSoil links each compost batch to the tree species grown in it. Every batch is tested before use, every species is trialled at
            three mixes, and the result travels with the tree on its QR tag.
          </p>
        </Panel>
      </div>

      <Panel title="How it works" className="mt-4">
        <ol aria-label="How NgamSoil works" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FLOW.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="flex gap-3 rounded-xl bg-soil-50 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-white">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-bold text-soil-900">
                  {i + 1}. {title}
                </span>
                <span className="block text-sm text-soil-700">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel title="Fit with Sime Darby Property" className="mt-4">
        <ul className="grid gap-2 text-soil-900 sm:grid-cols-2">
          <li>Circular economy: township waste becomes a nursery input.</li>
          <li>Biodiversity: native species such as Meranti and Tembusu get a better start.</li>
          <li>Elmina nursery: the pilot runs where the township's trees are raised.</li>
          <li>Builds on Sime Darby Property's record of 190,000+ trees planted.</li>
        </ul>
      </Panel>

      <Panel
        title="Prototype hardware"
        className="mt-4"
        caption={`Total: RM ${hardwareTotal()} (budget under RM ${HARDWARE_BUDGET_RM}). Estimated Malaysian retail prices. Photos come from staff phones.`}
      >
        <div className="overflow-x-auto">
          <table aria-label="Prototype hardware" className="w-full min-w-[32rem] text-sm">
            <thead className="text-left text-soil-700">
              <tr>
                <th scope="col" className="py-1 font-bold">Item</th>
                <th scope="col" className="py-1 text-right font-bold">Qty</th>
                <th scope="col" className="py-1 text-right font-bold">RM each</th>
                <th scope="col" className="py-1 pl-4 font-bold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-soil-100">
              {HARDWARE.map((h) => (
                <tr key={h.item}>
                  <td className="py-2 font-bold text-soil-900">{h.item}</td>
                  <td className="py-2 text-right tabular-nums">{h.qty}</td>
                  <td className="py-2 text-right tabular-nums">{h.unitRm}</td>
                  <td className="py-2 pl-4 text-soil-700">{h.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="Pilot plan: 3 months at the Elmina nursery">
          <ol className="flex flex-col gap-3">
            {PILOT.map((p) => (
              <li key={p.month}>
                <span className="block font-bold text-leaf-900">{p.month}</span>
                <span className="block text-soil-900">{p.body}</span>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Scope and limits">
          <ul className="flex list-disc flex-col gap-1 pl-5 text-soil-900">
            <li>Sensors and AI are simulated in this demo. Every simulated value is marked Sample data.</li>
            <li>The maturity test checks compost maturity. It is not a pathogen test.</li>
            <li>Nursery trays only. Open landscape planting is not monitored.</li>
            <li>Recommendations stay preliminary until the pilot ends.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
