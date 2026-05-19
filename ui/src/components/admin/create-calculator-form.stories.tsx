import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { fn } from "storybook/test";
import { http, HttpResponse } from "msw";
import { CreateCalculatorForm } from "./CreateCalculatorForm";

const successHandler = http.post(
  "/api/calculators",
  () =>
    HttpResponse.json({ id: "calc-new-001", code: "loan_v2", name: "Loan V2", active: false })
);

const meta: Meta<typeof CreateCalculatorForm> = {
  title: "Admin/CreateCalculatorForm",
  component: CreateCalculatorForm,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-lg"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof CreateCalculatorForm>;

export const Empty: Story = {
  args: { onSuccess: fn() },
  parameters: { msw: { handlers: [successHandler] } },
};

export const FilledAndSubmit: Story = {
  args: { onSuccess: fn() },
  parameters: { msw: { handlers: [successHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText("loan_annuity_v1"), "loan_v2");
    await userEvent.type(canvas.getByPlaceholderText("Loan calculator"), "Loan V2");
    await userEvent.click(canvas.getByRole("button", { name: /create calculator/i }));
  },
};

export const ValidationErrors: Story = {
  args: { onSuccess: fn() },
  parameters: { msw: { handlers: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /create calculator/i }));
    await expect(canvas.getAllByRole("paragraph")[0]).toBeInTheDocument();
  },
};
