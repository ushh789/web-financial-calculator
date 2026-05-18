import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "@storybook/test";
import { VersionSelector } from "./VersionSelector";
import type { components } from "@/lib/types/api.types";

type CalculatorVersionDto = components["schemas"]["CalculatorVersionDto"];

const versions: CalculatorVersionDto[] = [
  { id: "ver-001", calculatorId: "calc-001", version: 1 },
  { id: "ver-002", calculatorId: "calc-001", version: 2 },
  { id: "ver-003", calculatorId: "calc-001", version: 3 },
];

const meta: Meta<typeof VersionSelector> = {
  title: "Calculator/VersionSelector",
  component: VersionSelector,
  parameters: { layout: "centered" },
  args: { onChange: fn() },
};
export default meta;
type Story = StoryObj<typeof VersionSelector>;

export const Default: Story = {
  args: { versions, selectedVersionId: "ver-002" },
};

export const SingleVersion: Story = {
  args: { versions: [versions[1]!], selectedVersionId: "ver-002" },
};

export const NoVersions: Story = {
  args: { versions: [], selectedVersionId: "" },
};
