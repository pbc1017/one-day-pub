import { DataSource } from 'typeorm';

import { AdminRole } from '../../common/enums/index.js';
import { AdminUser } from '../../entities/admin-user.entity.js';

export async function seedAdminUsers(dataSource: DataSource) {
  const adminRepo = dataSource.getRepository(AdminUser);

  // 환경변수에서 관리자 이메일 가져오기
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@one-day-pub.site';

  const existing = await adminRepo.findOne({ where: { email: adminEmail } });

  if (!existing) {
    await adminRepo.save({
      email: adminEmail,
      role: AdminRole.SUPER_ADMIN,
    });
    console.log(`✅ 관리자 계정 생성: ${adminEmail}`);
  } else {
    console.log('ℹ️  관리자 계정이 이미 존재합니다');
  }
}
