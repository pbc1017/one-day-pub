import { z } from 'zod';

export const memberSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100, '이름은 100자 이하여야 합니다'),
  department: z.string().min(1, '학과를 입력해주세요').max(100, '학과는 100자 이하여야 합니다'),
  studentId: z.string().regex(/^\d{8,9}$/, '학번은 8-9자리 숫자여야 합니다'),
  birthYear: z.number().int().min(1900).max(2100, '올바른 출생년도를 입력해주세요'),
  phoneNumber: z
    .string()
    .regex(/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/, '올바른 전화번호 형식이 아닙니다'),
});

export type MemberInfo = z.infer<typeof memberSchema>;
