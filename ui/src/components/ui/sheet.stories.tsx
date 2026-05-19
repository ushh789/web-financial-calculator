import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";

const meta: Meta = {
  title: "UI/Sheet",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger>Open sheet</SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>Sheet title</SheetTitle></SheetHeader>
        <p className="text-sm mt-4">Sheet content goes here.</p>
      </SheetContent>
    </Sheet>
  ),
};

export const LeftSide: Story = {
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger>Left sheet</SheetTrigger>
      <SheetContent side="left">
        <SheetHeader><SheetTitle>Left panel</SheetTitle></SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
