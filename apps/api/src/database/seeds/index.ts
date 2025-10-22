import { DataSource } from 'typeorm';

import { seedAdminUsers } from './admin-user.seed.js';
import { seedSeats } from './seat.seed.js';

export async function runSeeds(dataSource: DataSource) {
  console.log('🌱 시드 데이터 생성 시작...');

  await seedSeats(dataSource);
  await seedAdminUsers(dataSource);

  console.log('✅ 모든 시드 데이터 생성 완료');
}
