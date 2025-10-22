import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { ModifiableEntity } from '../common/entities/base.entity.js';

@Entity('seats')
export class Seat extends ModifiableEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '좌석 ID' })
  id: number;

  @Column({ type: 'varchar', unique: true, length: 10 })
  @ApiProperty({ description: '좌석 번호 (T1, T2, ...)' })
  seatNumber: string;

  @Column({ type: 'int' })
  @ApiProperty({ description: '테이블 인원 (4 or 6)' })
  tableSize: number;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: '활성화 여부' })
  isActive: boolean;
}
