/**
 * 4단계: 좌석 선택 (자유석만)
 */

import React from 'react';

import { SeatSelection } from '@/types/register';

interface SeatSelectionStepProps {
  data: SeatSelection;
  onChange: (data: SeatSelection) => void;
  onNext: () => void;
  onPrev: () => void;
}

// 예시 좌석 데이터 (실제로는 API에서 가져올 수 있음)
const SEATS = [
  { number: 'A1', available: true },
  { number: 'A2', available: true },
  { number: 'A3', available: false },
  { number: 'A4', available: true },
  { number: 'B1', available: true },
  { number: 'B2', available: true },
  { number: 'B3', available: true },
  { number: 'B4', available: false },
  { number: 'C1', available: true },
  { number: 'C2', available: true },
  { number: 'C3', available: true },
  { number: 'C4', available: true },
  { number: 'D1', available: true },
  { number: 'D2', available: false },
  { number: 'D3', available: true },
  { number: 'D4', available: true },
];

export default function SeatSelectionStep({
  data,
  onChange,
  onNext,
  onPrev,
}: SeatSelectionStepProps) {
  const handleSeatClick = (seatNumber: string, available: boolean) => {
    if (!available) return;
    onChange({ seatNumber: data.seatNumber === seatNumber ? null : seatNumber });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">좌석 선택</h2>
        <p className="text-gray-400 text-sm">원하시는 좌석을 선택해주세요</p>
      </div>

      {/* 범례 */}
      <div className="flex gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a1a1a] border-2 border-gray-700 rounded-lg"></div>
          <span className="text-gray-400">선택 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E53C87]/20 border-2 border-[#E53C87] rounded-lg"></div>
          <span className="text-gray-400">선택됨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 border-2 border-gray-800 rounded-lg opacity-50"></div>
          <span className="text-gray-400">예약 완료</span>
        </div>
      </div>

      {/* 좌석 배치 */}
      <div className="bg-[#1a1a1a] border-2 border-gray-700 rounded-xl p-6">
        <div className="text-center mb-6">
          <div className="inline-block px-8 py-2 bg-gray-700 rounded-lg">
            <span className="text-white font-bold">무대</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {SEATS.map(seat => {
            const isSelected = data.seatNumber === seat.number;
            return (
              <button
                key={seat.number}
                onClick={() => handleSeatClick(seat.number, seat.available)}
                disabled={!seat.available}
                className={`
                  aspect-square rounded-lg font-bold text-sm transition-all duration-200
                  ${
                    isSelected
                      ? 'bg-[#E53C87]/20 border-2 border-[#E53C87] text-white'
                      : seat.available
                        ? 'bg-[#0a0a0a] border-2 border-gray-700 text-white hover:border-[#E53C87]/50 hover:bg-[#E53C87]/10'
                        : 'bg-gray-800 border-2 border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                  }
                `}
              >
                {seat.number}
              </button>
            );
          })}
        </div>
      </div>

      {data.seatNumber && (
        <div className="bg-[#E53C87]/10 border-2 border-[#E53C87] rounded-xl p-4">
          <p className="text-white text-center">
            선택한 좌석: <span className="font-bold text-pink-gradient">{data.seatNumber}</span>
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 py-4 px-6 bg-gray-700 hover:bg-gray-600 border-2 border-gray-700 hover:border-gray-600 rounded-xl transition-all duration-300 text-lg font-bold text-white"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={!data.seatNumber}
          className="flex-1 py-4 px-6 bg-[#E53C87] hover:bg-[#F06292] disabled:bg-gray-600 disabled:cursor-not-allowed border-2 border-[#E53C87] hover:border-[#F06292] disabled:border-gray-600 rounded-xl transition-all duration-300 text-lg font-bold text-white"
        >
          다음
        </button>
      </div>
    </div>
  );
}
