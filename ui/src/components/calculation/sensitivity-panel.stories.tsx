import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SensitivityPanel } from "./SensitivityPanel";

const meta: Meta<typeof SensitivityPanel> = {
  title: "Calculation/SensitivityPanel",
  component: SensitivityPanel,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-3xl"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof SensitivityPanel>;

export const Default: Story = {
  args: {
    baseAmount: 50000,
    baseRate: 12,
    baseTerm: 24,
    currency: "USD",
    constraints: { minAmount: 1000, maxAmount: 500000, minRate: 1, maxRate: 30, minTerm: 3, maxTerm: 360 },
  },
};

export const NoConstraints: Story = {
  args: { baseAmount: 50000, baseRate: 12, baseTerm: 24, currency: "USD" },
};

export const Loading: Story = {
  args: { baseAmount: 50000, baseRate: 12, baseTerm: 24, currency: "USD", isLoading: true },
};
