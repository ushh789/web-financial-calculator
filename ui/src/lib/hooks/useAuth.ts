"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";

export function useLogin() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      setUser(user);
      router.push("/dashboard");
      toast.success(`Ласкаво просимо, ${user.username}!`);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      setUser(null);
      router.push("/login");
    },
    onError: () => {
      toast.error("Не вдалося вийти. Спробуйте ще раз.");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Акаунт створено! Увійдіть.");
      router.push("/login");
    },
  });
}
