import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column, Generated, ManyToOne, JoinColumn } from 'typeorm';

import { ModifiableEntity } from '../common/entities/base.entity.js';

@Entity('registration_members')
export class RegistrationMember extends ModifiableEntity {
  @PrimaryColumn('varchar', { length: 36 })
  @Generated('uuid')
  @ApiProperty({ description: '회원 ID' })
  id: string;

  @Column('varchar', { length: 36 })
  @ApiProperty({ description: '신청 ID' })
  registrationId: string;

  @Column('int')
  @ApiProperty({ description: '순서 (1: 신청자, 2: 동반인)' })
  order: number;

  @Column({ length: 100 })
  @ApiProperty({ description: '이름' })
  name: string;

  @Column({ length: 100 })
  @ApiProperty({ description: '학과' })
  department: string;

  @Column({ length: 20 })
  @ApiProperty({ description: '학번' })
  studentId: string;

  @Column('int')
  @ApiProperty({ description: '출생년도' })
  birthYear: number;

  @Column({ length: 20 })
  @ApiProperty({ description: '전화번호' })
  phoneNumber: string;

  @Column({ length: 255, nullable: true })
  @ApiProperty({ description: '이메일 (신청자만)', nullable: true })
  email: string | null;

  @ManyToOne('Registration', 'members', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'registrationId' })
  @ApiProperty({ description: '신청 정보' })
  registration: any;
}
