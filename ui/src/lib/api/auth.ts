import { apiClient } from "./client";
import type { components } from "@/lib/types/api.types";

type LoginRequest = components["schemas"]["LoginRequest"];
type UserDto = components["schemas"]["UserDto"];
type CreateUserRequest = components["schemas"]["CreateUserRequest"];

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<UserDto>("/auth/login", data).then((r) => r.data),

  logout: () =>
    apiClient.post<void>("/auth/logout").then((r) => r.data),

  refresh: () =>
    apiClient.post<UserDto>("/auth/refresh").then((r) => r.data),

  register: (data: CreateUserRequest) =>
    apiClient.post<UserDto>("/auth/register", data).then((r) => r.data),
};
