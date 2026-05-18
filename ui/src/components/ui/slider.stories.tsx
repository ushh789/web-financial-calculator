import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Slider } from "./slider";

const meta: Meta<typeof Slider> = {
  title: "UI/Slider",
  component: Slider,
  parameters: { layout: "centered" },
  decorators: [(Story) => <div className="w-64"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = { args: { defaultValue: [50], min: 0, max: 100, step: 1 } };
export const RangeSlider: Story = { args: { defaultValue: [20, 80], min: 0, max: 100 } };
export const Disabled: Story = { args: { defaultValue: [40], disabled: true } };
