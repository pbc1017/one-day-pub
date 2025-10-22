import { verifyCodeSchema } from '@one-day-pub/interface';
import { createZodDto } from 'nestjs-zod';

export class VerifyCodeDto extends createZodDto(verifyCodeSchema) {}
