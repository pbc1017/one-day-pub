import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column, Generated, ManyToOne, JoinColumn } from 'typeorm';

import { ModifiableEntity } from '../../../common/entities/base.entity.js';
import { User } from '../../user/entities/user.entity.js';

import { Registration } from './registration.entity.js';

@Entity('registration_members')
export class RegistrationMember extends ModifiableEntity {
  @PrimaryColumn('varchar', { length: 36 })
  @Generated('uuid')
  @ApiProperty({ description: '회원 ID' })
  id: string;

  @Column('varchar', { length: 36 })
  @ApiProperty({ description: '신청 ID' })
  registrationId: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  @ApiProperty({ description: '사용자 ID (신청자 또는 동반인이 User인 경우)', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({ description: '사용자 정보', nullable: true })
  user: User | null;

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

  @ManyToOne(() => Registration, registration => registration.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'registrationId' })
  @ApiProperty({ description: '신청 정보' })
  registration: Registration;
}
