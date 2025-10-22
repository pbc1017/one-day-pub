import { verifyEmailSchema } from '@one-day-pub/interface';
import { createZodDto } from 'nestjs-zod';

export class VerifyEmailDto extends createZodDto(verifyEmailSchema) {}
