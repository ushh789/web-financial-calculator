import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  const axiosError = error as {
    response?: { data?: { detail?: string; title?: string } };
  };
  return (
    axiosError.response?.data?.detail ??
    axiosError.response?.data?.title ??
    "Сталася помилка"
  );
}

let queryClientInstance: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
        },
        mutations: {
          onError: (error) => {
            toast.error(getErrorMessage(error));
          },
        },
      },
    });
  }
  return queryClientInstance;
}
