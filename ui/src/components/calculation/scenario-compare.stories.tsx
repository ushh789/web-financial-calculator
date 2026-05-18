import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ScenarioCompare } from "./ScenarioCompare";
import type { components } from "@/lib/types/api.types";

type CalculationScenarioDto = components["schemas"]["CalculationScenarioDto"];

const makeCashFlows = (principal: number, interest: number, months: number) =>
  Array.from({ length: months }, (_, i) => ({
    date: new Date(2025, i, 1).toISOString().split("T")[0],
    description: `Payment ${i + 1}`,
    type: "OUTFLOW",
    totalAmount: { amount: principal + interest, currencyCode: "USD" },
    breakdown: {
      principal: { amount: principal, currencyCode: "USD" },
      interest: { amount: interest, currencyCode: "USD" },
      fee: { amount: 0, currencyCode: "USD" },
    },
  }));

const scenarios: CalculationScenarioDto[] = [
  {
    id: "scen-001",
    scenarioName: "Conservative (12%)",
    scenarioInput: { amount: 50000, rate: 12, term: 24 },
    scenarioResult: { cashFlows: makeCashFlows(2200, 500, 24) },
  },
  {
    id: "scen-002",
    scenarioName: "Aggressive (8%)",
    scenarioInput: { amount: 50000, rate: 8, term: 24 },
    scenarioResult: { cashFlows: makeCashFlows(2250, 333, 24) },
  },
];

const meta: Meta<typeof ScenarioCompare> = {
  title: "Calculation/ScenarioCompare",
  component: ScenarioCompare,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-3xl"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ScenarioCompare>;

export const TwoScenarios: Story = {
  args: { scenarios, currency: "USD" },
};

export const NoResults: Story = {
  args: {
    scenarios: [
      { id: "scen-001", scenarioName: "A", scenarioInput: { amount: 50000, rate: 12, term: 24 }, scenarioResult: null },
      { id: "scen-002", scenarioName: "B", scenarioInput: { amount: 50000, rate: 8, term: 24 }, scenarioResult: null },
    ],
    currency: "USD",
  },
};
