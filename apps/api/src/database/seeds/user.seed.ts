import { DataSource } from 'typeorm';

import { UserRole } from '../../common/enums/index.js';
import { User } from '../../modules/user/entities/user.entity.js';

export async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  // 환경변수에서 관리자 이메일 가져오기
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@one-day-pub.site';

  const existing = await userRepo.findOne({ where: { email: adminEmail } });

  if (!existing) {
    await userRepo.save({
      email: adminEmail,
      role: UserRole.SUPER_ADMIN,
    });
    console.log(`✅ 관리자 계정 생성: ${adminEmail}`);
  } else {
    console.log('ℹ️  관리자 계정이 이미 존재합니다');
  }
}
