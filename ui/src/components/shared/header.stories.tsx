import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "./Header";

const meta: Meta<typeof Header> = {
  title: "Shared/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/dashboard" },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Header>;

export const Dashboard: Story = {};

export const CalculatorsPage: Story = {
  parameters: {
    nextjs: { appDirectory: true, navigation: { pathname: "/calculators" } },
  },
};
