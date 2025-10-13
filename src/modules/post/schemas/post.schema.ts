import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .max(5000, 'Conteúdo deve ter no máximo 5000 caracteres'),
  author: z
    .string()
    .min(1, 'Autor é obrigatório')
    .max(100, 'Nome do autor deve ter no máximo 100 caracteres')
    .optional(),
  tags: z.array(z.string()).optional().default([]),
  published: z.boolean().optional().default(true),
  status: z
    .enum(['draft', 'published', 'scheduled', 'private'])
    .optional()
    .default('published'),
  scheduledAt: z.date().optional(),
});

export const UpdatePostSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .optional(),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .max(5000, 'Conteúdo deve ter no máximo 5000 caracteres')
    .optional(),
  author: z
    .string()
    .min(1, 'Autor é obrigatório')
    .max(100, 'Nome do autor deve ter no máximo 100 caracteres')
    .optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'scheduled', 'private']).optional(),
  scheduledAt: z.date().optional(),
});

export const SearchPostsSchema = z.object({
  query: z
    .string()
    .min(1, 'Termo de busca é obrigatório')
    .max(100, 'Termo de busca deve ter no máximo 100 caracteres'),
  page: z
    .number()
    .int()
    .min(1, 'Página deve ser maior que 0')
    .optional()
    .default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limite deve ser maior que 0')
    .max(50, 'Limite máximo é 50')
    .optional()
    .default(10),
});

export const PaginationSchema = z.object({
  page: z
    .number()
    .int()
    .min(1, 'Página deve ser maior que 0')
    .optional()
    .default(1),
  limit: z
    .number()
    .int()
    .min(1, 'Limite deve ser maior que 0')
    .max(50, 'Limite máximo é 50')
    .optional()
    .default(10),
});

export const ParamsSchema = z.object({
  id: z
    .string()
    .min(1, 'ID é obrigatório')
    .regex(/^[0-9a-fA-F]{24}$/, 'ID deve ser um ObjectId válido'),
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
export type UpdatePostDto = z.infer<typeof UpdatePostSchema>;
export type SearchPostsDto = z.infer<typeof SearchPostsSchema>;
export type PaginationDto = z.infer<typeof PaginationSchema>;
export type ParamsDto = z.infer<typeof ParamsSchema>;
