import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { Button } from "./button";

const meta: Meta = {
  title: "UI/Tooltip",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip open>
        <TooltipTrigger render={<Button variant="outline">Hover me</Button>} />
        <TooltipContent>This is a tooltip</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};
