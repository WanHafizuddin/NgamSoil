export interface HardwareItem {
  item: string;
  qty: number;
  unitRm: number;
  purpose: string;
}

export const HARDWARE_BUDGET_RM = 200;

export const HARDWARE: HardwareItem[] = [
  { item: 'ESP32 DevKit V1', qty: 1, unitRm: 25, purpose: 'Reads sensors, sends data over Wi-Fi' },
  { item: 'DS18B20 waterproof temperature probe (1 m)', qty: 2, unitRm: 12, purpose: 'Core temperature of each compost pile' },
  { item: 'Capacitive soil moisture sensor v1.2', qty: 3, unitRm: 6, purpose: 'One per nursery tray mix' },
  { item: '4.7 kΩ resistor, jumper wires, mini breadboard', qty: 1, unitRm: 15, purpose: 'Wiring' },
  { item: 'IP65 junction box', qty: 1, unitRm: 20, purpose: 'Weatherproof enclosure' },
  { item: '2 × 18650 cells, holder and TP4056 charger', qty: 1, unitRm: 35, purpose: 'Battery power' },
  { item: '6 V 1 W mini solar panel', qty: 1, unitRm: 20, purpose: 'Top-up charging' },
];

export function hardwareTotal(): number {
  return HARDWARE.reduce((sum, h) => sum + h.qty * h.unitRm, 0);
}
