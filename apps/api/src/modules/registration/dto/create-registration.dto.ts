import { createRegistrationSchema } from '@one-day-pub/interface';
import { createZodDto } from 'nestjs-zod';

export class CreateRegistrationDto extends createZodDto(createRegistrationSchema) {}
