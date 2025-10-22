import { refreshTokenSchema } from '@one-day-pub/interface';
import { createZodDto } from 'nestjs-zod';

export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
