import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { http, HttpResponse, delay } from "msw";
import { ScenarioPanel } from "./ScenarioPanel";
import type { components } from "@/lib/types/api.types";

type CalculationDto = components["schemas"]["CalculationDto"];
type CalculationScenarioDto = components["schemas"]["CalculationScenarioDto"];

const calculation: CalculationDto = {
  id: "calc-001",
  userId: "user-001",
  calculatorId: "calc-base-001",
  calculatorVersionId: "ver-001",
  currency: "USD",
  selectedScenarioId: "scen-001",
  createdAt: "2025-01-15T10:00:00Z",
};

const scenarios: CalculationScenarioDto[] = [
  {
    id: "scen-001",
    calculationId: "calc-001",
    scenarioName: "Conservative (12%)",
    scenarioInput: { amount: 50000, rate: 12, term: 24 },
    scenarioResult: { cashFlows: [] },
  },
  {
    id: "scen-002",
    calculationId: "calc-001",
    scenarioName: "Aggressive (8%)",
    scenarioInput: { amount: 50000, rate: 8, term: 24 },
    scenarioResult: { cashFlows: [] },
  },
];

const meta: Meta<typeof ScenarioPanel> = {
  title: "Calculation/ScenarioPanel",
  component: ScenarioPanel,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof ScenarioPanel>;

export const WithScenarios: Story = {
  args: { calculation },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/calculations/calc-001/scenarios", () =>
          HttpResponse.json(scenarios)
        ),
        http.put("/api/calculations/calc-001/select-scenario/:scenarioId", () =>
          HttpResponse.json(null, { status: 204 })
        ),
        http.post("/api/calculations/calc-001/scenarios", () =>
          HttpResponse.json({
            id: "scen-003",
            calculationId: "calc-001",
            scenarioName: "New",
            scenarioInput: {},
            scenarioResult: null,
          })
        ),
      ],
    },
  },
};

export const Empty: Story = {
  args: { calculation },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/calculations/calc-001/scenarios", () =>
          HttpResponse.json([])
        ),
        http.post("/api/calculations/calc-001/scenarios", () =>
          HttpResponse.json({
            id: "scen-001",
            calculationId: "calc-001",
            scenarioName: "First",
            scenarioInput: {},
            scenarioResult: null,
          })
        ),
      ],
    },
  },
};

export const Loading: Story = {
  args: { calculation },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/calculations/calc-001/scenarios", async () => {
          await delay("infinite");
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};
