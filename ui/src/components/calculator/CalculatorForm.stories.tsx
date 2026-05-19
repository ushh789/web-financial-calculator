import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { http, HttpResponse } from "msw";
import { CalculatorForm } from "./CalculatorForm";

const successHandler = http.post("/api/calculations", () =>
  HttpResponse.json({ id: "calc-result-001", calculatorId: "calc-001" })
);

const meta: Meta<typeof CalculatorForm> = {
  title: "Calculator/CalculatorForm",
  component: CalculatorForm,
  parameters: {
    layout: "centered",
    msw: { handlers: [successHandler] },
  },
  decorators: [(Story) => <div className="w-80 p-4 border rounded-lg"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CalculatorForm>;

export const NoConstraints: Story = {
  args: { calculatorId: "calc-001", calculatorVersionId: "ver-001" },
};

export const LoanConstraints: Story = {
  args: {
    calculatorId: "calc-002",
    calculatorVersionId: "ver-002",
    constraints: { minAmount: 5000, maxAmount: 500000, minRate: 5, maxRate: 30, minTerm: 12, maxTerm: 360 },
    defaults: { fixedRate: 12, currency: "UAH", roundingScale: 2, roundingMode: "HALF_UP" },
  },
};

export const DepositConstraints: Story = {
  args: {
    calculatorId: "calc-003",
    calculatorVersionId: "ver-003",
    constraints: { minAmount: 500, maxAmount: 50000, minRate: 1, maxRate: 15, minTerm: 1, maxTerm: 36 },
    defaults: { fixedRate: 8, currency: "USD", roundingScale: 2, roundingMode: "HALF_UP" },
  },
};

export const FilledAndSubmit: Story = {
  args: { calculatorId: "calc-001", calculatorVersionId: "ver-001" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const amountInput = canvas.getByLabelText(/amount/i);
    const rateInput = canvas.getByLabelText(/rate/i);
    const termInput = canvas.getByLabelText(/term/i);
    await userEvent.clear(amountInput);
    await userEvent.type(amountInput, "50000");
    await userEvent.clear(rateInput);
    await userEvent.type(rateInput, "12");
    await userEvent.clear(termInput);
    await userEvent.type(termInput, "24");
    await userEvent.click(canvas.getByRole("button", { name: /calculat/i }));
  },
};
