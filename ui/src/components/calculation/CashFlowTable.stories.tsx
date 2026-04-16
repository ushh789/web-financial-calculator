import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CashFlowTable, type CashFlow } from "./CashFlowTable";

const meta: Meta<typeof CashFlowTable> = {
  title: "Calculation/CashFlowTable",
  component: CashFlowTable,
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof CashFlowTable>;

// Кредит 10 000 USD, 12 місяців, 10% річних
const loanCashFlows: CashFlow[] = Array.from({ length: 12 }, (_, i) => {
  const principal = Number((800 + i * 3).toFixed(2));
  const interest = Number((83 - i * 6).toFixed(2));
  const total = Number((principal + interest).toFixed(2));
  const date = new Date(2025, i, 1).toISOString().split("T")[0]!;
  return {
    date,
    description: `Платіж ${i + 1}`,
    type: "OUTFLOW",
    totalAmount: { amount: total, currencyCode: "USD" },
    breakdown: {
      principal: { amount: principal, currencyCode: "USD" },
      interest: { amount: interest, currencyCode: "USD" },
      fee: { amount: 0, currencyCode: "USD" },
    },
  };
});

// Депозит: початкове зарахування + щомісячне нарахування відсотків
const depositCashFlows: CashFlow[] = [
  {
    date: "2025-01-01",
    description: "Зарахування депозиту",
    type: "INFLOW",
    totalAmount: { amount: 10000, currencyCode: "USD" },
    breakdown: {
      principal: { amount: 10000, currencyCode: "USD" },
      interest: { amount: 0, currencyCode: "USD" },
      fee: { amount: 0, currencyCode: "USD" },
    },
  },
  ...Array.from({ length: 6 }, (_, i) => ({
    date: new Date(2025, i + 1, 1).toISOString().split("T")[0]!,
    description: `Відсотки місяць ${i + 1}`,
    type: "INFLOW" as const,
    totalAmount: { amount: 66.67, currencyCode: "USD" },
    breakdown: {
      principal: { amount: 0, currencyCode: "USD" },
      interest: { amount: 66.67, currencyCode: "USD" },
      fee: { amount: 0, currencyCode: "USD" },
    },
  })),
];

/** Амортизаційна таблиця кредиту — 12 щомісячних платежів */
export const LoanAmortization: Story = {
  args: {
    cashFlows: loanCashFlows,
    currency: "USD",
  },
};

/** Депозит: надходження + щомісячне нарахування відсотків */
export const DepositAccrual: Story = {
  args: {
    cashFlows: depositCashFlows,
    currency: "USD",
  },
};

/** Порожній стан — немає даних */
export const Empty: Story = {
  args: {
    cashFlows: [],
    currency: "USD",
  },
};
