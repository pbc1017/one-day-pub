import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserBasedSystem1761137256895 implements MigrationInterface {
  name = 'InitUserBasedSystem1761137256895';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. users 테이블
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`role\` enum('APPLICANT', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'APPLICANT',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_users_email\` (\`email\`),
        KEY \`IDX_users_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. refresh_tokens 테이블
    await queryRunner.query(`
      CREATE TABLE \`refresh_tokens\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`token\` varchar(500) NOT NULL,
        \`expires_at\` timestamp NOT NULL,
        \`is_revoked\` tinyint(1) NOT NULL DEFAULT '0',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_refresh_tokens_token\` (\`token\`),
        KEY \`IDX_refresh_tokens_user_id\` (\`user_id\`),
        KEY \`IDX_refresh_tokens_revoked_expires\` (\`is_revoked\`, \`expires_at\`),
        CONSTRAINT \`FK_refresh_tokens_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. email_verifications 테이블
    await queryRunner.query(`
      CREATE TABLE \`email_verifications\` (
        \`id\` varchar(36) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`code\` varchar(6) NOT NULL,
        \`purpose\` enum('REGISTRATION', 'LOGIN', 'ADMIN_LOGIN') NOT NULL,
        \`is_verified\` tinyint(1) NOT NULL DEFAULT '0',
        \`is_used\` tinyint(1) NOT NULL DEFAULT '0',
        \`expires_at\` timestamp NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_email_verifications_lookup\` (\`email\`, \`code\`, \`is_verified\`),
        KEY \`IDX_email_verifications_expires\` (\`expires_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 4. seats 테이블
    await queryRunner.query(`
      CREATE TABLE \`seats\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`seat_number\` varchar(10) NOT NULL,
        \`table_size\` int NOT NULL,
        \`is_active\` tinyint(1) NOT NULL DEFAULT '1',
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_seats_number\` (\`seat_number\`),
        KEY \`IDX_seats_active\` (\`is_active\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 5. registrations 테이블
    await queryRunner.query(`
      CREATE TABLE \`registrations\` (
        \`id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NOT NULL,
        \`school\` enum('CNU', 'KAIST') NOT NULL,
        \`gender\` enum('MALE', 'FEMALE') NOT NULL,
        \`seat_type\` enum('MEETING', 'GENERAL') NOT NULL,
        \`time_slot\` enum('TIME_1', 'TIME_2') NOT NULL,
        \`status\` enum('PENDING', 'PAYMENT_CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        \`seat_id\` int NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`IDX_registrations_user\` (\`user_id\`),
        KEY \`IDX_registrations_status\` (\`status\`),
        KEY \`IDX_registrations_seat_type_time\` (\`seat_type\`, \`time_slot\`),
        KEY \`IDX_registrations_school_gender_time\` (\`school\`, \`gender\`, \`time_slot\`),
        CONSTRAINT \`FK_registrations_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_registrations_seat\` FOREIGN KEY (\`seat_id\`) REFERENCES \`seats\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 6. registration_members 테이블
    await queryRunner.query(`
      CREATE TABLE \`registration_members\` (
        \`id\` varchar(36) NOT NULL,
        \`registration_id\` varchar(36) NOT NULL,
        \`user_id\` varchar(36) NULL,
        \`order\` int NOT NULL,
        \`name\` varchar(100) NOT NULL,
        \`department\` varchar(100) NOT NULL,
        \`student_id\` varchar(20) NOT NULL,
        \`birth_year\` int NOT NULL,
        \`phone_number\` varchar(20) NOT NULL,
        \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`UQ_registration_members_order\` (\`registration_id\`, \`order\`),
        KEY \`IDX_registration_members_registration\` (\`registration_id\`),
        KEY \`IDX_registration_members_user\` (\`user_id\`),
        CONSTRAINT \`FK_registration_members_registration\` FOREIGN KEY (\`registration_id\`) REFERENCES \`registrations\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_registration_members_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`registration_members\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`registrations\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`seats\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`email_verifications\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`refresh_tokens\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`users\``);
  }
}
