import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = { args: { children: "Field label" } };
export const ForInput: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <Label htmlFor="demo">Email address</Label>
      <input id="demo" type="email" className="border rounded px-2 py-1 text-sm" />
    </div>
  ),
};
