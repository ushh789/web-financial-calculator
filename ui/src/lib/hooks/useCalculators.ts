"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { calculatorsApi } from "@/lib/api/calculators";
import { calculationsApi } from "@/lib/api/calculations";
import { calculationKeys } from "@/lib/hooks/useScenarios";
import type { components } from "@/lib/types/api.types";

type CalculationDto = components["schemas"]["CalculationDto"];
type CreateCalculationRequest = components["schemas"]["CreateCalculationRequest"];
type CreateCalculatorRequest = components["schemas"]["CreateCalculatorRequest"];
type CreateVersionRequest = components["schemas"]["CreateVersionRequest"];

export const calculatorKeys = {
  all: ["calculators"] as const,
  lists: () => [...calculatorKeys.all, "list"] as const,
  list: (page: number, size: number) =>
    [...calculatorKeys.lists(), { page, size }] as const,
  detail: (id: string) => [...calculatorKeys.all, id] as const,
  versions: (id: string) => [...calculatorKeys.detail(id), "versions"] as const,
};

export function useCalculators(page = 0, size = 20) {
  return useQuery({
    queryKey: calculatorKeys.list(page, size),
    queryFn: () => calculatorsApi.getAll(page, size),
  });
}

export function useCalculator(id: string) {
  return useQuery({
    queryKey: calculatorKeys.detail(id),
    queryFn: () => calculatorsApi.getById(id),
    enabled: !!id,
  });
}

export function useCalculatorVersions(id: string) {
  return useQuery({
    queryKey: calculatorKeys.versions(id),
    queryFn: () => calculatorsApi.getVersions(id),
    enabled: !!id,
  });
}

export function useCreateCalculator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCalculatorRequest) => calculatorsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: calculatorKeys.lists() });
      toast.success("Калькулятор створено!");
    },
  });
}

export function useAddCalculatorVersion(calculatorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVersionRequest) =>
      calculatorsApi.addVersion(calculatorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: calculatorKeys.versions(calculatorId),
      });
      toast.success("Версію додано!");
    },
  });
}

export function useCreateCalculation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCalculationRequest) => calculationsApi.create(data),
    onSuccess: (calculation) => {
        queryClient.setQueryData<CalculationDto>(
        calculationKeys.detail(calculation.id!),
        calculation,
      );
      toast.success("Розрахунок створено!");
      if (calculation.id) {
        router.push(`/calculations/${calculation.id}`);
      }
    },
  });
}
