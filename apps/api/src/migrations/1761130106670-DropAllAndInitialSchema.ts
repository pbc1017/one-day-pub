import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAllAndInitialSchema1761130106670 implements MigrationInterface {
  name = 'DropAllAndInitialSchema1761130106670';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`email_verifications\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`code\` varchar(6) NOT NULL, \`purpose\` enum ('ADMIN_LOGIN') NOT NULL, \`isVerified\` tinyint NOT NULL DEFAULT 0, \`expiresAt\` timestamp NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`registration_members\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`registrationId\` varchar(36) NOT NULL, \`order\` int NOT NULL, \`name\` varchar(100) NOT NULL, \`department\` varchar(100) NOT NULL, \`studentId\` varchar(20) NOT NULL, \`birthYear\` int NOT NULL, \`phoneNumber\` varchar(20) NOT NULL, \`email\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`registrations\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`school\` enum ('CNU', 'KAIST') NOT NULL, \`gender\` enum ('MALE', 'FEMALE') NOT NULL, \`seatType\` enum ('MEETING', 'GENERAL') NOT NULL, \`timeSlot\` enum ('TIME_1', 'TIME_2') NOT NULL, \`status\` enum ('PENDING', 'PAYMENT_CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING', \`seatId\` int NULL, UNIQUE INDEX \`IDX_42ac3f2b11e5acd13d326769f0\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`seats\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` int NOT NULL AUTO_INCREMENT, \`seatNumber\` varchar(10) NOT NULL, \`tableSize\` int NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, UNIQUE INDEX \`IDX_03abebde86da24356112ac8e44\` (\`seatNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`admin_users\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`role\` enum ('SUPER_ADMIN', 'ADMIN') NOT NULL DEFAULT 'ADMIN', UNIQUE INDEX \`IDX_dcd0c8a4b10af9c986e510b9ec\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `CREATE TABLE \`admin_refresh_tokens\` (\`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`id\` varchar(36) NOT NULL, \`adminUserId\` varchar(36) NOT NULL, \`token\` varchar(500) NOT NULL, \`expiresAt\` timestamp NOT NULL, \`isRevoked\` tinyint NOT NULL DEFAULT 0, UNIQUE INDEX \`IDX_9b042cf4b05b80ace2f4dec888\` (\`token\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
    await queryRunner.query(
      `ALTER TABLE \`registration_members\` ADD CONSTRAINT \`FK_efb64e76cda1dd6570669b6646a\` FOREIGN KEY (\`registrationId\`) REFERENCES \`registrations\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`registrations\` ADD CONSTRAINT \`FK_75d6f3fa2aa1bcecaa775504fd6\` FOREIGN KEY (\`seatId\`) REFERENCES \`seats\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`admin_refresh_tokens\` ADD CONSTRAINT \`FK_4a1872780580b6e23f031c05d2d\` FOREIGN KEY (\`adminUserId\`) REFERENCES \`admin_users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`admin_refresh_tokens\` DROP FOREIGN KEY \`FK_4a1872780580b6e23f031c05d2d\``
    );
    await queryRunner.query(
      `ALTER TABLE \`registrations\` DROP FOREIGN KEY \`FK_75d6f3fa2aa1bcecaa775504fd6\``
    );
    await queryRunner.query(
      `ALTER TABLE \`registration_members\` DROP FOREIGN KEY \`FK_efb64e76cda1dd6570669b6646a\``
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_9b042cf4b05b80ace2f4dec888\` ON \`admin_refresh_tokens\``
    );
    await queryRunner.query(`DROP TABLE \`admin_refresh_tokens\``);
    await queryRunner.query(`DROP INDEX \`IDX_dcd0c8a4b10af9c986e510b9ec\` ON \`admin_users\``);
    await queryRunner.query(`DROP TABLE \`admin_users\``);
    await queryRunner.query(`DROP INDEX \`IDX_03abebde86da24356112ac8e44\` ON \`seats\``);
    await queryRunner.query(`DROP TABLE \`seats\``);
    await queryRunner.query(`DROP INDEX \`IDX_42ac3f2b11e5acd13d326769f0\` ON \`registrations\``);
    await queryRunner.query(`DROP TABLE \`registrations\``);
    await queryRunner.query(`DROP TABLE \`registration_members\``);
    await queryRunner.query(`DROP TABLE \`email_verifications\``);
  }
}
