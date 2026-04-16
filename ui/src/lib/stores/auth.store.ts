import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { components } from "@/lib/types/api.types";

type UserDto = components["schemas"]["UserDto"];

interface AuthState {
  user: UserDto | null;
  setUser: (user: UserDto | null) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      isAuthenticated: () => get().user !== null,
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
