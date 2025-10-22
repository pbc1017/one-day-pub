import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailVerification } from './entities/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification])],
  exports: [TypeOrmModule],
})
export class AuthModule {}
