import { z } from 'zod';

export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const paginatedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    total: z.number().int(),
    page: z.number().int(),
    limit: z.number().int(),
  });

export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
