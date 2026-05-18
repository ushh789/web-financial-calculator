import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "@storybook/test";
import { http, HttpResponse } from "msw";
import { fn } from "@storybook/test";
import { AddScenarioForm } from "./AddScenarioForm";

const successHandler = http.post(
  "/api/calculations/:id/scenarios",
  () =>
    HttpResponse.json({
      id: "scen-001",
      scenarioName: "Conservative",
      scenarioInput: {},
    })
);

const meta: Meta<typeof AddScenarioForm> = {
  title: "Calculation/AddScenarioForm",
  component: AddScenarioForm,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-96"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AddScenarioForm>;

export const Empty: Story = {
  args: { calculationId: "calc-001", onSuccess: fn() },
  parameters: { msw: { handlers: [successHandler] } },
};

export const WithInitialValues: Story = {
  args: {
    calculationId: "calc-001",
    onSuccess: fn(),
    initialInput: { amount: 50000, rate: 12, term: 24, startDate: "2025-01-01" },
  },
  parameters: { msw: { handlers: [successHandler] } },
};

export const FilledAndSubmit: Story = {
  args: { calculationId: "calc-001", onSuccess: fn() },
  parameters: { msw: { handlers: [successHandler] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/scenario name/i), "Conservative scenario");
    await userEvent.clear(canvas.getByLabelText(/amount/i));
    await userEvent.type(canvas.getByLabelText(/amount/i), "45000");
    await userEvent.click(canvas.getByRole("button", { name: /create scenario/i }));
  },
};

export const ValidationErrors: Story = {
  args: { calculationId: "calc-001", onSuccess: fn() },
  parameters: { msw: { handlers: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /create scenario/i }));
    await expect(canvas.getByText(/enter scenario name/i)).toBeInTheDocument();
  },
};
