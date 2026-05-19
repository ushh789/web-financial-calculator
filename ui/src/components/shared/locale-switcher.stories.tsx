import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LocaleSwitcher } from "./LocaleSwitcher";

const meta: Meta<typeof LocaleSwitcher> = {
  title: "Shared/LocaleSwitcher",
  component: LocaleSwitcher,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof LocaleSwitcher>;

export const Default: Story = {};
