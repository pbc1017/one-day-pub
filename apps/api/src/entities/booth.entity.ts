import { ApiProperty } from '@nestjs/swagger';
import { Zone } from '@one-day-pub/interface/types/festival.type.js';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

import { BaseEntity } from '../common/entities/base.entity.js';

@Entity('booths')
export class Booth extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '부스 ID' })
  id: number;

  @Column({ type: 'varchar', length: 10, unique: true })
  @ApiProperty({ description: '부스 번호 (F1, A01 등)' })
  boothNumber: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: '부스 이름 (한국어)' })
  titleKo: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: '부스 이름 (English)' })
  titleEn: string;

  @Column({
    type: 'enum',
    enum: Zone,
  })
  @ApiProperty({ description: '부스 위치 구역', enum: Zone })
  zone: Zone;

  @Column({ type: 'text' })
  @ApiProperty({ description: '부스 설명 (한국어)' })
  descriptionKo: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: '부스 설명 (English)' })
  descriptionEn: string;
}
