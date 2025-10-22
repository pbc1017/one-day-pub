import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryColumn,
  Column,
  Generated,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

import { ModifiableEntity } from '../../../common/entities/base.entity.js';
import {
  School,
  Gender,
  SeatType,
  TimeSlot,
  RegistrationStatus,
} from '../../../common/enums/index.js';
import { Seat } from '../../seat/entities/seat.entity.js';
import { User } from '../../user/entities/user.entity.js';

import { RegistrationMember } from './registration-member.entity.js';

@Entity('registrations')
export class Registration extends ModifiableEntity {
  @PrimaryColumn('varchar', { length: 36 })
  @Generated('uuid')
  @ApiProperty({ description: '신청 ID' })
  id: string;

  @Column('varchar', { length: 36 })
  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({ description: '사용자 정보' })
  user: User;

  @Column({ type: 'enum', enum: School })
  @ApiProperty({ description: '학교', enum: School })
  school: School;

  @Column({ type: 'enum', enum: Gender })
  @ApiProperty({ description: '성별', enum: Gender })
  gender: Gender;

  @Column({ type: 'enum', enum: SeatType })
  @ApiProperty({ description: '좌석 유형', enum: SeatType })
  seatType: SeatType;

  @Column({ type: 'enum', enum: TimeSlot })
  @ApiProperty({ description: '타임', enum: TimeSlot })
  timeSlot: TimeSlot;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  @ApiProperty({ description: '신청 상태', enum: RegistrationStatus })
  status: RegistrationStatus;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({ description: '좌석 ID (자유석만)', nullable: true })
  seatId: number | null;

  @ManyToOne(() => Seat, { nullable: true })
  @JoinColumn({ name: 'seatId' })
  @ApiProperty({ description: '좌석 정보', nullable: true })
  seat: Seat | null;

  @OneToMany(() => RegistrationMember, member => member.registration, {
    cascade: true,
  })
  @ApiProperty({ description: '신청자 및 동반인 정보' })
  members: RegistrationMember[];
}
