import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalculationSummary } from "./CalculationSummary";
import type { CashFlow } from "./CashFlowTable";

const loanCashFlows: CashFlow[] = Array.from({ length: 24 }, (_, i) => {
  const principal = Number((3800 + i * 60).toFixed(2));
  const interest = Number((1000 - i * 40).toFixed(2));
  return {
    date: new Date(2025, i, 1).toISOString().split("T")[0]!,
    description: `Payment ${i + 1}`,
    type: "OUTFLOW",
    totalAmount: { amount: principal + interest, currencyCode: "USD" },
    breakdown: {
      principal: { amount: principal, currencyCode: "USD" },
      interest: { amount: Math.max(interest, 0), currencyCode: "USD" },
      fee: { amount: 0, currencyCode: "USD" },
    },
  };
});

const meta: Meta<typeof CalculationSummary> = {
  title: "Calculation/CalculationSummary",
  component: CalculationSummary,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CalculationSummary>;

export const LoanSummary: Story = {
  args: { cashFlows: loanCashFlows, currency: "USD", amount: 100000, rate: 12, term: 24 },
};

export const EmptySummary: Story = {
  args: { cashFlows: [], currency: "USD" },
};
