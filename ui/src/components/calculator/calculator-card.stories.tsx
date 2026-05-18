import React, { Suspense } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalculatorCard } from "./CalculatorCard";
import type { components } from "@/lib/types/api.types";

type CalculatorDto = components["schemas"]["CalculatorDto"];

const loanCalc: CalculatorDto = {
  id: "calc-001",
  code: "loan_annuity_v1",
  name: "Annuity Loan",
  description: "Standard annuity loan with fixed monthly payments.",
  active: true,
};

const depositCalc: CalculatorDto = {
  id: "calc-002",
  code: "deposit_simple_v1",
  name: "Simple Deposit",
  description: "Fixed-term deposit with simple interest accrual.",
  active: true,
};

const inactiveCalc: CalculatorDto = {
  id: "calc-003",
  code: "legacy_loan_v1",
  name: "Legacy Loan",
  description: "Deprecated product, not available for new calculations.",
  active: false,
};

const meta: Meta = {
  title: "Calculator/CalculatorCard",
  parameters: {
    layout: "centered",
    nextjs: { appDirectory: true, navigation: { pathname: "/calculators" } },
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Suspense fallback={<div>Loading…</div>}>
          <Story />
        </Suspense>
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj;

export const ActiveLoan: Story = {
  render: () => <CalculatorCard calculator={loanCalc} />,
};

export const ActiveDeposit: Story = {
  render: () => <CalculatorCard calculator={depositCalc} />,
};

export const Inactive: Story = {
  render: () => <CalculatorCard calculator={inactiveCalc} />,
};
