import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryColumn, Column, Generated, OneToMany } from 'typeorm';

import { ModifiableEntity } from '../common/entities/base.entity.js';
import { AdminRole } from '../common/enums/index.js';

@Entity('admin_users')
export class AdminUser extends ModifiableEntity {
  @PrimaryColumn('varchar', { length: 36 })
  @Generated('uuid')
  @ApiProperty({ description: '관리자 ID' })
  id: string;

  @Column({ unique: true, length: 255 })
  @ApiProperty({ description: '관리자 이메일' })
  email: string;

  @Column({
    type: 'enum',
    enum: AdminRole,
    default: AdminRole.ADMIN,
  })
  @ApiProperty({ description: '관리자 권한', enum: AdminRole })
  role: AdminRole;

  @OneToMany('AdminRefreshToken', 'adminUser')
  @ApiProperty({ description: '리프레시 토큰 목록' })
  refreshTokens: any[];
}
