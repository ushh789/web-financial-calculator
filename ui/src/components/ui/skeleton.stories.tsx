import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "./skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Line: Story = { args: { className: "h-4 w-64" } };
export const Circle: Story = { args: { className: "h-10 w-10 rounded-full" } };
export const Card: Story = {
  render: () => (
    <div className="space-y-3 w-72">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  ),
};
