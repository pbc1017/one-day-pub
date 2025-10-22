import { z } from 'zod';

export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z
    .object({
      id: z.string(),
      email: z.string().email(),
      role: z.enum(['APPLICANT', 'ADMIN', 'SUPER_ADMIN']),
    })
    .optional(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
