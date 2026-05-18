export const e2eCalculatorsPage = {
  content: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      code: "ANNUITY_LOAN",
      name: "Annuity Loan",
      description: "Standard annuity loan calculator with equal periodic payments",
      active: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      code: "LINEAR_LOAN",
      name: "Linear Loan",
      description: "Linear amortization loan calculator with decreasing payments",
      active: true,
      createdAt: "2024-01-02T00:00:00Z",
    },
  ],
  totalElements: 2,
  totalPages: 1,
  size: 20,
  number: 0,
};

export const e2eEmptyCalculatorsPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 20,
  number: 0,
};

// Fixture for /api/calculations SSR (if ever needed server-side)
export const e2eCalculationsPage = {
  content: [],
  totalElements: 0,
  totalPages: 1,
  size: 20,
  number: 0,
};
