import { DataSource } from 'typeorm';

import { Seat } from '../../modules/seat/entities/seat.entity.js';

export async function seedSeats(dataSource: DataSource) {
  const seatRepo = dataSource.getRepository(Seat);

  const seats = [];

  // 4인석 8개 (T1-T8)
  for (let i = 1; i <= 8; i++) {
    seats.push({
      seatNumber: `T${i}`,
      tableSize: 4,
      isActive: true,
    });
  }

  // 6인석 4개 (T9-T12)
  for (let i = 9; i <= 12; i++) {
    seats.push({
      seatNumber: `T${i}`,
      tableSize: 6,
      isActive: true,
    });
  }

  await seatRepo.save(seats);
  console.log('✅ 좌석 12개 생성 완료 (4인석 8개 + 6인석 4개)');
}
