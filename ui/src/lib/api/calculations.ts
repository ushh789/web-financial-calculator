import { apiClient } from "./client";
import type { components } from "@/lib/types/api.types";

type CalculationDto = components["schemas"]["CalculationDto"];
type CalculationScenarioDto = components["schemas"]["CalculationScenarioDto"];
type CreateCalculationRequest = components["schemas"]["CreateCalculationRequest"];
type CreateScenarioRequest = components["schemas"]["CreateScenarioRequest"];
type PageCalculationDto = components["schemas"]["PageCalculationDto"];

export const calculationsApi = {
  create: (data: CreateCalculationRequest) =>
    apiClient.post<CalculationDto>("/api/calculations", data).then((r) => r.data),

  getByUser: (userId: string, page = 0, size = 20) =>
    apiClient
      .get<PageCalculationDto>("/api/calculations", { params: { userId, page, size } })
      .then((r) => r.data),

  getScenarios: (calculationId: string) =>
    apiClient
      .get<CalculationScenarioDto[]>(`/api/calculations/${calculationId}/scenarios`)
      .then((r) => r.data),

  addScenario: (calculationId: string, data: CreateScenarioRequest) =>
    apiClient
      .post<CalculationScenarioDto>(`/api/calculations/${calculationId}/scenarios`, data)
      .then((r) => r.data),

  selectScenario: (calculationId: string, scenarioId: string) =>
    apiClient
      .put<void>(`/api/calculations/${calculationId}/select-scenario/${scenarioId}`)
      .then((r) => r.data),
};
