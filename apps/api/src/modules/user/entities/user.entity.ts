import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column, Generated, OneToMany } from 'typeorm';

import { ModifiableEntity } from '../../../common/entities/base.entity.js';
import { UserRole } from '../../../common/enums/index.js';

import { RefreshToken } from './refresh-token.entity.js';

@Entity('users')
export class User extends ModifiableEntity {
  @PrimaryColumn('varchar', { length: 36 })
  @Generated('uuid')
  @ApiProperty({ description: '사용자 ID' })
  id: string;

  @Column({ type: 'varchar', unique: true, length: 255 })
  @ApiProperty({ description: '이메일' })
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.APPLICANT,
  })
  @ApiProperty({ description: '사용자 권한', enum: UserRole })
  role: UserRole;

  @OneToMany(() => RefreshToken, token => token.user)
  @ApiProperty({ description: '리프레시 토큰 목록' })
  refreshTokens: RefreshToken[];
}
