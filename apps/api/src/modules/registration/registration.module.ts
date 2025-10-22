import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Registration, RegistrationMember } from './entities/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([Registration, RegistrationMember])],
  exports: [TypeOrmModule],
})
export class RegistrationModule {}
