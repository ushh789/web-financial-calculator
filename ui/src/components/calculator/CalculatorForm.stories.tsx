import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalculatorForm } from "./CalculatorForm";

const meta: Meta<typeof CalculatorForm> = {
  title: "Calculator/CalculatorForm",
  component: CalculatorForm,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-4 border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CalculatorForm>;

/** Форма без обмежень — всі поля вільні */
export const NoConstraints: Story = {
  args: {
    calculatorId: "calc-001",
    calculatorVersionId: "ver-001",
  },
};

/** Кредитний калькулятор з обмеженнями суми, ставки та терміну */
export const LoanConstraints: Story = {
  args: {
    calculatorId: "calc-002",
    calculatorVersionId: "ver-002",
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
      currency: "UAH",
      roundingScale: 2,
      roundingMode: "HALF_UP",
    },
  },
};

/** Депозитний калькулятор з обмеженнями */
export const DepositConstraints: Story = {
  args: {
    calculatorId: "calc-003",
    calculatorVersionId: "ver-003",
    constraints: {
      minAmount: 500,
      maxAmount: 50000,
      minRate: 1,
      maxRate: 15,
      minTerm: 1,
      maxTerm: 36,
    },
    defaults: {
      fixedRate: 8,
      currency: "USD",
      roundingScale: 2,
      roundingMode: "HALF_UP",
    },
  },
};
