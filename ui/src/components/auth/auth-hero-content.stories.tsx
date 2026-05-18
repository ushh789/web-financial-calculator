import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthHeroContent } from "./AuthHeroContent";

const meta: Meta<typeof AuthHeroContent> = {
  title: "Auth/AuthHeroContent",
  component: AuthHeroContent,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-80"><Story /></div>],
  args: {
    headline: "Smart financial calculations",
    subheadline:
      "A platform for precise loan, deposit, and cash flow planning.",
    features: [
      "Annuity and linear repayment models",
      "Sensitivity analysis and scenario comparison",
      "Amortization charts and Cash Flow tables",
      "Export data in CSV format",
    ],
  },
};
export default meta;
type Story = StoryObj<typeof AuthHeroContent>;

export const Default: Story = {};
