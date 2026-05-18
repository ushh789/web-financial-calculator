import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalculatorDetail } from "./CalculatorDetail";
import type { components } from "@/lib/types/api.types";

type CalculatorDto = components["schemas"]["CalculatorDto"];
type CalculatorVersionDto = components["schemas"]["CalculatorVersionDto"];

const loanCalc: CalculatorDto = {
  id: "calc-001",
  code: "loan_annuity_v1",
  name: "Annuity Loan",
  description: "Standard annuity loan with fixed monthly payments.",
  active: true,
};

const inactiveCalc: CalculatorDto = {
  id: "calc-003",
  code: "legacy_loan_v1",
  name: "Legacy Loan",
  description: "Deprecated product, not available for new calculations.",
  active: false,
};

const versions: CalculatorVersionDto[] = [
  {
    id: "ver-001",
    calculatorId: "calc-001",
    version: 1,
    algorithmMetadata: {
      type: "LOAN",
      interest: {
        method: "COMPOUND",
        dayCountConvention: "ACT_365",
        rateType: "FIXED",
        accrualFrequency: "MONTHLY",
      },
      repayment: {
        strategy: "ANNUITY",
        frequency: "MONTHLY",
      },
      constraints: {
        minAmount: 5000,
        maxAmount: 500000,
        minRate: 5,
        maxRate: 30,
        minTerm: 12,
        maxTerm: 360,
      },
      defaults: {
        fixedRate: 12,
        currency: "USD",
        roundingScale: 2,
        roundingMode: "HALF_UP",
      },
    },
  },
  {
    id: "ver-002",
    calculatorId: "calc-001",
    version: 2,
    algorithmMetadata: {
      type: "LOAN",
      interest: {
        method: "COMPOUND",
        dayCountConvention: "ACT_365",
        rateType: "FIXED",
        accrualFrequency: "MONTHLY",
      },
      repayment: {
        strategy: "ANNUITY",
        frequency: "MONTHLY",
      },
      constraints: {
        minAmount: 1000,
        maxAmount: 1000000,
        minRate: 3,
        maxRate: 25,
        minTerm: 6,
        maxTerm: 480,
      },
      defaults: {
        fixedRate: 10,
        currency: "USD",
        roundingScale: 2,
        roundingMode: "HALF_UP",
      },
    },
  },
];

const meta: Meta<typeof CalculatorDetail> = {
  title: "Calculator/CalculatorDetail",
  component: CalculatorDetail,
  parameters: {
    layout: "padded",
    nextjs: { appDirectory: true },
  },
};
export default meta;
type Story = StoryObj<typeof CalculatorDetail>;

export const WithVersions: Story = {
  args: {
    calculator: loanCalc,
    versions,
  },
};

export const SingleVersion: Story = {
  args: {
    calculator: loanCalc,
    versions: [versions[1]!],
  },
};

export const NoVersions: Story = {
  args: {
    calculator: loanCalc,
    versions: [],
  },
};

export const InactiveCalculator: Story = {
  args: {
    calculator: inactiveCalc,
    versions,
  },
};
