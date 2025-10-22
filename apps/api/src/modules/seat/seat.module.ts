import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Seat } from './entities/index.js';

@Module({
  imports: [TypeOrmModule.forFeature([Seat])],
  exports: [TypeOrmModule],
})
export class SeatModule {}
