import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z.string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(20, "A senha não pode ter mais que 20 caracteres")
});

export type LoginFormData = z.infer<typeof loginSchema>;