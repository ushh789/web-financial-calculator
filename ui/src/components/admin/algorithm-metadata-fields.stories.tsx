import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useForm } from "react-hook-form";
import type { CreateCalculatorFormValues } from "@/lib/schemas/admin.schema";
import { AlgorithmMetadataFields } from "./AlgorithmMetadataFields";

const meta: Meta = {
  title: "Admin/AlgorithmMetadataFields",
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-xl"><Story /></div>],
};
export default meta;
type Story = StoryObj;

type AlgorithmMetadata = CreateCalculatorFormValues["algorithmMetadata"];

const Wrapper = ({ defaults }: { defaults: AlgorithmMetadata }) => {
  const form = useForm<CreateCalculatorFormValues>({
    defaultValues: { algorithmMetadata: defaults },
  });
  return (
    <AlgorithmMetadataFields
      control={form.control}
      errors={form.formState.errors}
    />
  );
};

export const LoanDefaults: Story = {
  render: () => (
    <Wrapper
      defaults={{
        type: "LOAN",
        interest: {
          method: "SIMPLE",
          dayCountConvention: "ACTUAL_365",
          rateType: "FIXED",
        },
        repayment: { strategy: "ANNUITY", frequency: "MONTHLY" },
        defaults: { currency: "USD", roundingScale: 2, roundingMode: "HALF_UP" },
      }}
    />
  ),
};

export const DepositDefaults: Story = {
  render: () => (
    <Wrapper
      defaults={{
        type: "DEPOSIT",
        interest: {
          method: "COMPOUND",
          dayCountConvention: "ACTUAL_365",
          rateType: "FIXED",
          compoundingFrequency: "MONTHLY",
        },
        repayment: { strategy: "BULLET", frequency: "MONTHLY" },
        defaults: { currency: "EUR", roundingScale: 2, roundingMode: "HALF_UP" },
      }}
    />
  ),
};

export const WithConstraints: Story = {
  render: () => (
    <Wrapper
      defaults={{
        type: "LOAN",
        interest: {
          method: "SIMPLE",
          dayCountConvention: "ACTUAL_360",
          rateType: "FLOATING",
          accrualFrequency: "MONTHLY",
        },
        repayment: { strategy: "LINEAR", frequency: "MONTHLY" },
        constraints: {
          minAmount: 5000,
          maxAmount: 500000,
          minRate: 5,
          maxRate: 30,
          minTerm: 12,
          maxTerm: 360,
        },
        defaults: {
          currency: "UAH",
          fixedRate: 12,
          roundingScale: 2,
          roundingMode: "HALF_UP",
        },
      }}
    />
  ),
};

export const Empty: Story = {
  render: () => (
    <Wrapper
      defaults={{
        type: "LOAN",
        interest: { method: "SIMPLE", dayCountConvention: "ACTUAL_365", rateType: "FIXED" },
        repayment: { strategy: "ANNUITY", frequency: "MONTHLY" },
      }}
    />
  ),
};
