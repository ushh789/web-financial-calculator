export const SELECTORS = {
  amortizationChart: '[data-testid="amortization-chart"]',
  cashflowTable: '[data-testid="cashflow-table"]',
  cashflowPagination: '[data-testid="cashflow-pagination"]',
  sensitivityPanel: '[data-testid="sensitivity-panel"]',
  sensitivityChart: '[data-testid="sensitivity-chart"]',
  sensitivityAxisBtn: (axis: string) => `[data-testid="sensitivity-axis-${axis}"]`,
  scenarioPanel: '[data-testid="scenario-panel"]',
  addScenarioBtn: '[data-testid="add-scenario-btn"]',
  scenarioList: '[data-testid="scenario-list"]',
  calculationSummary: '[data-testid="calculation-summary"]',
  adminCalculatorsPage: '[data-testid="admin-calculators-page"]',
  createCalculatorBtn: '[data-testid="create-calculator-btn"]',
} as const;
