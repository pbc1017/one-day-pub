import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World! This is KAMF Server running on NestJS with ESM monorepo setup.';
  }
}
