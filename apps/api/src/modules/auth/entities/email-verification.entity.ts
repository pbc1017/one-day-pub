import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryColumn,
  Column,
  Generated,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { EmailVerificationPurpose } from '../../../common/enums/index.js';

@Entity('email_verifications')
export class EmailVerification {
  @PrimaryColumn('varchar', { length: 36 })
  @Generated('uuid')
  @ApiProperty({ description: '인증 ID' })
  id: string;

  @Column({ length: 255 })
  @ApiProperty({ description: '이메일' })
  email: string;

  @Column({ length: 6 })
  @ApiProperty({ description: '6자리 인증 코드' })
  code: string;

  @Column({ type: 'enum', enum: EmailVerificationPurpose })
  @ApiProperty({ description: '인증 목적', enum: EmailVerificationPurpose })
  purpose: EmailVerificationPurpose;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: '인증 완료 여부' })
  isVerified: boolean;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: '사용 완료 여부 (신청 완료 등)' })
  isUsed: boolean;

  @Column('timestamp')
  @ApiProperty({ description: '만료 시간' })
  expiresAt: Date;

  @CreateDateColumn()
  @ApiProperty({ description: '생성 일시' })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: '수정 일시' })
  updatedAt: Date;
}
