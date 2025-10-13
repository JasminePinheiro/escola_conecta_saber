import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email deve ser um endereço de email válido' })
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),
  role: z
    .enum(['student', 'teacher'])
    .optional()
    .default('student'),
});

export const LoginUserSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email deve ser um endereço de email válido' }),
  password: z
    .string()
    .min(1, 'Senha é obrigatória'),
});

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  email: z
    .string()
    .email({ message: 'Email deve ser um endereço de email válido' })
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .optional(),
}).refine((data) => data.name !== undefined || data.email !== undefined, {
  message: 'Pelo menos um campo (nome ou email) deve ser fornecido',
});

export const ChangePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'A senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve ter no mínimo 6 caracteres')
    .max(50, 'A nova senha deve ter no máximo 50 caracteres'),
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'A nova senha deve ser diferente da senha atual',
  path: ['newPassword'],
});

