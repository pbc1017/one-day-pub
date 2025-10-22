import { z } from 'zod';

import { memberSchema } from './member.schema.js';

export const sendVerificationCodeSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
});

export const verifyEmailSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  code: z.string().length(6, '인증 코드는 6자리여야 합니다'),
});

export const checkAvailabilitySchema = z.object({
  isMeeting: z.boolean(),
  school: z.enum(['CNU', 'KAIST']),
  gender: z.enum(['M', 'F']),
  time: z.union([z.literal(1), z.literal(2)]),
  memberCount: z.union([z.literal(1), z.literal(2)]),
});

export const createRegistrationSchema = z
  .object({
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    school: z.enum(['CNU', 'KAIST'], 'CNU 또는 KAIST를 선택해주세요'),
    gender: z.enum(['M', 'F'], '성별을 선택해주세요'),
    seatType: z.enum(['MEETING', 'GENERAL'], '좌석 유형을 선택해주세요'),
    timeSlot: z.union([z.literal(1), z.literal(2)], '타임을 선택해주세요'),
    seatId: z.number().int().optional(),
    members: z
      .array(memberSchema)
      .min(1, '최소 1명의 정보가 필요합니다')
      .max(2, '최대 2명까지 신청 가능합니다'),
  })
  .refine(
    data => {
      if (data.seatType === 'MEETING') {
        return data.members.length === 2;
      }
      if (data.seatType === 'GENERAL') {
        return data.members.length === 1 && data.seatId !== undefined;
      }
      return true;
    },
    {
      message: '미팅석은 2명, 일반석은 1명이며 좌석을 선택해야 합니다',
    }
  );

export type SendVerificationCodeRequest = z.infer<typeof sendVerificationCodeSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;
export type CheckAvailabilityQuery = z.infer<typeof checkAvailabilitySchema>;
export type CreateRegistrationRequest = z.infer<typeof createRegistrationSchema>;
