import { sendCodeSchema } from '@one-day-pub/interface';
import { createZodDto } from 'nestjs-zod';

export class SendCodeDto extends createZodDto(sendCodeSchema) {}
