import 'reflect-metadata';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import { config } from 'dotenv';
import { DataSource } from 'typeorm';

import databaseConfig from '../config/database.config.js';

import { runSeeds } from './seeds/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드
config({ path: resolve(__dirname, '../../../.env') });

async function seed() {
  const dbConfig = databaseConfig();
  const dataSource = new DataSource(dbConfig as any);

  try {
    await dataSource.initialize();
    console.log('✅ 데이터베이스 연결 성공');

    await runSeeds(dataSource);

    await dataSource.destroy();
    console.log('✅ 데이터베이스 연결 종료');
    process.exit(0);
  } catch (error) {
    console.error('❌ 시드 실행 중 오류:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

seed();
