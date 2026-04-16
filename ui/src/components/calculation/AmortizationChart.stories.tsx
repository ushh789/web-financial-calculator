import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AmortizationChart } from "./AmortizationChart";
import type { CashFlow } from "./CashFlowTable";

const meta: Meta<typeof AmortizationChart> = {
  title: "Calculation/AmortizationChart",
  component: AmortizationChart,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-3xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AmortizationChart>;

// Кредит 100 000 USD, 24 місяці, 12% річних
const loanFlows: CashFlow[] = Array.from({ length: 24 }, (_, i) => {
  const principal = Number((3800 + i * 60).toFixed(2));
  const interest = Number((1000 - i * 40).toFixed(2));
  const total = Number((principal + interest).toFixed(2));
  return {
    date: new Date(2025, i, 1).toISOString().split("T")[0]!,
    description: `Платіж ${i + 1}`,
    type: "OUTFLOW",
    totalAmount: { amount: total, currencyCode: "USD" },
    breakdown: {
      principal: { amount: principal, currencyCode: "USD" },
      interest: { amount: Math.max(interest, 0), currencyCode: "USD" },
      fee: { amount: 0, currencyCode: "USD" },
    },
  };
});

// Депозит 10 000 USD, 12 місяців, 8% річних — нарахування відсотків OUTFLOW (вилучення тіла)
const depositFlows: CashFlow[] = [
  // Первинне розміщення — вхідний потік
  {
    date: "2025-01-01",
    description: "Розміщення депозиту",
    type: "INFLOW",
    totalAmount: { amount: 10000, currencyCode: "USD" },
    breakdown: {
      principal: { amount: 10000, currencyCode: "USD" },
      interest: { amount: 0, currencyCode: "USD" },
      fee: { amount: 0, currencyCode: "USD" },
    },
  },
  // Капіталізація: кожен місяць — OUTFLOW (повернення тіла + відсотки)
  ...Array.from({ length: 12 }, (_, i) => ({
    date: new Date(2025, i + 1, 1).toISOString().split("T")[0]!,
    description: `Капіталізація ${i + 1}`,
    type: "OUTFLOW" as const,
    totalAmount: { amount: 66.67, currencyCode: "USD" },
    breakdown: {
      principal: { amount: 0, currencyCode: "USD" },
      interest: { amount: 66.67, currencyCode: "USD" },
      fee: { amount: 0, currencyCode: "USD" },
    },
  })),
];

/** Графік амортизації кредиту — спадання основного боргу та відсотків */
export const LoanAmortization: Story = {
  args: {
    cashFlows: loanFlows,
    initialAmount: 100000,
    currency: "USD",
  },
};

/** Депозит — зростання відсотків за кожен місяць */
export const DepositAccrual: Story = {
  args: {
    cashFlows: depositFlows,
    initialAmount: 10000,
    currency: "USD",
  },
};

/** Порожній стан — немає Cash Flows для побудови графіку */
export const Empty: Story = {
  args: {
    cashFlows: [],
    initialAmount: 0,
    currency: "USD",
  },
};
