import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Введіть логін"),
  password: z.string().min(1, "Введіть пароль"),
});

export const registerSchema = z
  .object({
    username: z.string().min(3, "Мінімум 3 символи").max(100),
    email: z.string().email("Невірний формат email"),
    password: z.string().min(8, "Мінімум 8 символів"),
    confirmPassword: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Паролі не збігаються",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
