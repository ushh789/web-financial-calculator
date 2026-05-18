import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { http, HttpResponse, delay } from "msw";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useEffect } from "react";
import { CalculationView } from "./CalculationView";

const cashFlows = Array.from({ length: 12 }, (_, i) => ({
  date: new Date(2025, i, 1).toISOString().split("T")[0]!,
  description: `Payment ${i + 1}`,
  type: "OUTFLOW" as const,
  totalAmount: { amount: 879.12, currencyCode: "USD" },
  breakdown: {
    principal: { amount: 800 + i * 5, currencyCode: "USD" },
    interest: { amount: 79.12 - i * 5, currencyCode: "USD" },
    fee: { amount: 0, currencyCode: "USD" },
  },
}));

const mockCalculation = {
  id: "calc-001",
  userId: "user-001",
  calculatorId: "calc-base-001",
  calculatorVersionId: "ver-001",
  currency: "USD",
  selectedScenarioId: "scen-001",
  createdAt: "2025-01-15T10:00:00Z",
};

const mockScenarios = [
  {
    id: "scen-001",
    calculationId: "calc-001",
    scenarioName: "Base Scenario",
    scenarioInput: { amount: 10000, rate: 9.5, term: 12 },
    scenarioResult: { cashFlows },
    createdAt: "2025-01-15T10:00:00Z",
  },
];

const mockVersions = [
  {
    id: "ver-001",
    version: 1,
    active: true,
    algorithmMetadata: { constraints: null },
  },
];

const WithUser = ({ children }: { children: React.ReactNode }) => {
  const setUser = useAuthStore((s) => s.setUser);
  useEffect(() => {
    setUser({ id: "user-001", username: "john", role: "USER" } as never);
    return () => setUser(null);
  }, [setUser]);
  return <>{children}</>;
};

const meta: Meta<typeof CalculationView> = {
  title: "Calculation/CalculationView",
  component: CalculationView,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <WithUser>
        <div className="max-w-4xl">
          <Story />
        </div>
      </WithUser>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof CalculationView>;

export const WithData: Story = {
  args: { calculationId: "calc-001" },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/calculations", () =>
          HttpResponse.json({ content: [mockCalculation], totalPages: 1 })
        ),
        http.get("/api/calculations/calc-001/scenarios", () =>
          HttpResponse.json(mockScenarios)
        ),
        http.get("/api/calculators/calc-base-001/versions", () =>
          HttpResponse.json(mockVersions)
        ),
      ],
    },
  },
};

export const Loading: Story = {
  args: { calculationId: "calc-001" },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/calculations", async () => {
          await delay("infinite");
          return HttpResponse.json({ content: [], totalPages: 0 });
        }),
      ],
    },
  },
};

export const NotFound: Story = {
  args: { calculationId: "calc-999" },
  parameters: {
    msw: {
      handlers: [
        http.get("/api/calculations", () =>
          HttpResponse.json({ content: [], totalPages: 0 })
        ),
      ],
    },
  },
};
