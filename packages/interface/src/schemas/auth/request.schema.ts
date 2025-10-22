import { z } from 'zod';

export const sendCodeSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
});

export const verifyCodeSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  code: z.string().length(6, '인증 코드는 6자리여야 합니다'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '리프레시 토큰이 필요합니다'),
});

export type SendCodeRequest = z.infer<typeof sendCodeSchema>;
export type VerifyCodeRequest = z.infer<typeof verifyCodeSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
