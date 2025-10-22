import { sendVerificationCodeSchema } from '@one-day-pub/interface';
import { createZodDto } from 'nestjs-zod';

export class SendVerificationCodeDto extends createZodDto(sendVerificationCodeSchema) {}
