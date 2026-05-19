import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { fn } from "storybook/test";
import { http, HttpResponse } from "msw";
import { AddVersionForm } from "./AddVersionForm";

const successHandler = http.post(
  "/api/calculators/:id/versions",
  () => HttpResponse.json({ id: "ver-002", version: 2, active: false })
);

const meta: Meta<typeof AddVersionForm> = {
  title: "Admin/AddVersionForm",
  component: AddVersionForm,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-lg"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AddVersionForm>;

export const Empty: Story = {
  args: { calculatorId: "calc-001", onSuccess: fn() },
  parameters: { msw: { handlers: [successHandler] } },
};

export const ValidationErrors: Story = {
  args: { calculatorId: "calc-001", onSuccess: fn() },
  parameters: { msw: { handlers: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submitBtn = canvas.getByRole("button", { name: /add version/i });
    await userEvent.click(submitBtn);
    await expect(canvas.getAllByRole("paragraph")[0]).toBeInTheDocument();
  },
};
