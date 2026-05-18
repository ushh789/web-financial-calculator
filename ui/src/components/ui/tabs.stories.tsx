import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta = {
  title: "UI/Tabs",
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="chart" className="w-80">
      <TabsList>
        <TabsTrigger value="chart">Chart</TabsTrigger>
        <TabsTrigger value="table">Table</TabsTrigger>
        <TabsTrigger value="sensitivity">Sensitivity</TabsTrigger>
      </TabsList>
      <TabsContent value="chart"><p className="text-sm p-2">Chart content</p></TabsContent>
      <TabsContent value="table"><p className="text-sm p-2">Table content</p></TabsContent>
      <TabsContent value="sensitivity"><p className="text-sm p-2">Sensitivity content</p></TabsContent>
    </Tabs>
  ),
};
