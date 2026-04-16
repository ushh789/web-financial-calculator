import { apiClient } from "./client";
import type { components } from "@/lib/types/api.types";

type CalculatorDto = components["schemas"]["CalculatorDto"];
type CalculatorVersionDto = components["schemas"]["CalculatorVersionDto"];
type PageCalculatorDto = components["schemas"]["PageCalculatorDto"];
type CreateCalculatorRequest = components["schemas"]["CreateCalculatorRequest"];
type CreateVersionRequest = components["schemas"]["CreateVersionRequest"];

export const calculatorsApi = {
  getAll: (page = 0, size = 20) =>
    apiClient
      .get<PageCalculatorDto>("/api/calculators", { params: { page, size } })
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient.get<CalculatorDto>(`/api/calculators/${id}`).then((r) => r.data),

  getVersions: (id: string) =>
    apiClient
      .get<CalculatorVersionDto[]>(`/api/calculators/${id}/versions`)
      .then((r) => r.data),

  create: (data: CreateCalculatorRequest) =>
    apiClient.post<CalculatorDto>("/api/calculators", data).then((r) => r.data),

  addVersion: (id: string, data: CreateVersionRequest) =>
    apiClient
      .post<CalculatorVersionDto>(`/api/calculators/${id}/versions`, data)
      .then((r) => r.data),
};
