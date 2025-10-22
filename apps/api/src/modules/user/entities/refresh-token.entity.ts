import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column, Generated, ManyToOne, JoinColumn } from 'typeorm';

import { ModifiableEntity } from '../../../common/entities/base.entity.js';

import { User } from './user.entity.js';

@Entity('refresh_tokens')
export class RefreshToken extends ModifiableEntity {
  @PrimaryColumn('varchar', { length: 36 })
  @Generated('uuid')
  @ApiProperty({ description: '토큰 ID' })
  id: string;

  @Column('varchar', { length: 36 })
  @ApiProperty({ description: '사용자 ID' })
  userId: string;

  @Column({ unique: true, length: 500 })
  @ApiProperty({ description: 'JWT 리프레시 토큰' })
  token: string;

  @Column('timestamp')
  @ApiProperty({ description: '만료 시간' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: '취소 여부' })
  isRevoked: boolean;

  @ManyToOne(() => User, user => user.refreshTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({ description: '사용자 정보' })
  user: User;
}
