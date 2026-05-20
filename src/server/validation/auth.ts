import { z } from "zod";

export const authCredentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Usuario precisa ter pelo menos 3 caracteres.")
    .max(32, "Usuario pode ter no maximo 32 caracteres.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, numeros e underline."),
  password: z
    .string()
    .min(6, "Senha precisa ter pelo menos 6 caracteres.")
    .max(128, "Senha pode ter no maximo 128 caracteres."),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;

