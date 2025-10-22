import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column, Generated, ManyToOne, JoinColumn } from 'typeorm';

import { ModifiableEntity } from '../common/entities/base.entity.js';

@Entity('admin_refresh_tokens')
export class AdminRefreshToken extends ModifiableEntity {
  @PrimaryColumn('varchar', { length: 36 })
  @Generated('uuid')
  @ApiProperty({ description: '토큰 ID' })
  id: string;

  @Column('varchar', { length: 36 })
  @ApiProperty({ description: '관리자 ID' })
  adminUserId: string;

  @Column({ unique: true, length: 500 })
  @ApiProperty({ description: 'JWT 리프레시 토큰' })
  token: string;

  @Column('timestamp')
  @ApiProperty({ description: '만료 시간' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: '취소 여부' })
  isRevoked: boolean;

  @ManyToOne('AdminUser', 'refreshTokens', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'adminUserId' })
  @ApiProperty({ description: '관리자 정보' })
  adminUser: any;
}
