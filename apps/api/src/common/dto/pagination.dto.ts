import { paginationQuerySchema } from '@one-day-pub/interface';
import { createZodDto } from 'nestjs-zod';

export class PaginationDto extends createZodDto(paginationQuerySchema) {}
