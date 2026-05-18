import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { http, HttpResponse, delay } from "msw";
import { AdminCalculatorsView } from "./AdminCalculatorsView";
import type { components } from "@/lib/types/api.types";

type CalculatorDto = components["schemas"]["CalculatorDto"];

const calculators: CalculatorDto[] = [
  {
    id: "calc-001",
    code: "loan_annuity_v1",
    name: "Annuity Loan",
    description: "Standard annuity loan.",
    active: true,
  },
  {
    id: "calc-002",
    code: "deposit_simple_v1",
    name: "Simple Deposit",
    description: "Fixed-term deposit.",
    active: true,
  },
  {
    id: "calc-003",
    code: "legacy_loan_v0",
    name: "Legacy Loan",
    description: "Deprecated.",
    active: false,
  },
];

const meta: Meta<typeof AdminCalculatorsView> = {
  title: "Admin/AdminCalculatorsView",
  component: AdminCalculatorsView,
  parameters: { layout: "padded" },
  decorators: [(Story) => <div className="max-w-4xl"><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof AdminCalculatorsView>;

export const WithData: Story = {
  parameters: {
    msw: {
      handlers: [
        http.post("/api/calculators", () =>
          HttpResponse.json({
            id: "calc-new",
            code: "new_v1",
            name: "New Calculator",
            active: false,
          })
        ),
        http.get("/api/calculators", () =>
          HttpResponse.json({ content: calculators, totalPages: 1 })
        ),
      ],
    },
  },
};

export const Empty: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/calculators", () =>
          HttpResponse.json({ content: [], totalPages: 0 })
        ),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/calculators", async () => {
          await delay("infinite");
          return HttpResponse.json({ content: [], totalPages: 0 });
        }),
      ],
    },
  },
};
