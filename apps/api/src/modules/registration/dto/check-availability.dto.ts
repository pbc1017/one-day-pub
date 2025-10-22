import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Query parameter는 문자열로 들어오므로 변환 필요
const checkAvailabilityQuerySchema = z.object({
  isMeeting: z
    .string()
    .transform(val => val === 'true')
    .pipe(z.boolean()),
  school: z.enum(['CNU', 'KAIST']),
  gender: z.enum(['M', 'F']),
  time: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.union([z.literal(1), z.literal(2)])),
  memberCount: z
    .string()
    .transform(val => parseInt(val, 10))
    .pipe(z.union([z.literal(1), z.literal(2)])),
});

export class CheckAvailabilityDto extends createZodDto(checkAvailabilityQuerySchema) {}
