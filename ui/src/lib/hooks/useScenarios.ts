"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { calculationsApi } from "@/lib/api/calculations";
import type { components } from "@/lib/types/api.types";

type CalculationDto = components["schemas"]["CalculationDto"];
type CalculationScenarioDto = components["schemas"]["CalculationScenarioDto"];
type CreateScenarioRequest = components["schemas"]["CreateScenarioRequest"];

export const calculationKeys = {
  all: ["calculations"] as const,
  lists: (userId: string) => [...calculationKeys.all, "user", userId] as const,
  detail: (id: string) => [...calculationKeys.all, id] as const,
  scenarios: (id: string) => [...calculationKeys.detail(id), "scenarios"] as const,
};

export function useUserCalculations(userId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: [...calculationKeys.lists(userId), { page, size }],
    queryFn: () => calculationsApi.getByUser(userId, page, size),
    enabled: !!userId,
  });
}

export function useCalculation(calculationId: string, userId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: calculationKeys.detail(calculationId),
    queryFn: async () => {
      const cached = queryClient.getQueryData<CalculationDto>(
        calculationKeys.detail(calculationId),
      );
      if (cached) return cached;

      const page = await calculationsApi.getByUser(userId, 0, 100);
      const found = page.content?.find((c) => c.id === calculationId);
      if (!found) throw new Error("Розрахунок не знайдено");
      return found;
    },
    enabled: !!calculationId && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useScenarios(calculationId: string) {
  return useQuery({
    queryKey: calculationKeys.scenarios(calculationId),
    queryFn: () => calculationsApi.getScenarios(calculationId),
    enabled: !!calculationId,
  });
}

export function useAddScenario(calculationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateScenarioRequest) =>
      calculationsApi.addScenario(calculationId, data),
    onSuccess: (newScenario) => {
      queryClient.setQueryData<CalculationScenarioDto[]>(
        calculationKeys.scenarios(calculationId),
        (old = []) => [...old, newScenario],
      );
      toast.success(`Сценарій "${newScenario.scenarioName}" створено`);
    },
  });
}

export function useSelectScenario(calculationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scenarioId: string) =>
      calculationsApi.selectScenario(calculationId, scenarioId),

    onMutate: async (scenarioId) => {
      await queryClient.cancelQueries({
        queryKey: calculationKeys.detail(calculationId),
      });

      const previousCalculation = queryClient.getQueryData<CalculationDto>(
        calculationKeys.detail(calculationId),
      );

      queryClient.setQueryData<CalculationDto>(
        calculationKeys.detail(calculationId),
        (old) => (old ? { ...old, selectedScenarioId: scenarioId } : old),
      );

      return { previousCalculation };
    },

    onError: (_error, _scenarioId, context) => {
      if (context?.previousCalculation) {
        queryClient.setQueryData(
          calculationKeys.detail(calculationId),
          context.previousCalculation,
        );
      }
    },

    onSuccess: () => {
      toast.success("Активний сценарій змінено");
    },
  });
}

