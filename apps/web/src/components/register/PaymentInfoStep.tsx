/**
 * 최종 단계: 참가비 입금 안내
 */

import React from 'react';

import { RegistrationData } from '@/types/register';

interface PaymentInfoStepProps {
  data: RegistrationData;
  onComplete: () => void;
  onPrev: () => void;
}

export default function PaymentInfoStep({ data, onComplete, onPrev }: PaymentInfoStepProps) {
  const { basicInfo, personalInfo, companionInfo, seatSelection } = data;

  const schoolLabel = basicInfo.school === 'CNU' ? '충남대학교' : 'KAIST';
  const genderLabel = basicInfo.gender === 'MALE' ? '남성' : '여성';
  const seatTypeLabel = basicInfo.seatType === 'MEETING' ? '미팅석' : '자유석';
  const timeSlotLabel =
    basicInfo.timeSlot === 'TIME_1'
      ? '1타임 (19:00~21:00)'
      : basicInfo.timeSlot === 'TIME_2'
        ? '2타임 (22:00~24:00)'
        : '-';
  const is2People = basicInfo.partySize === 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">신청 완료</h2>
        <p className="text-gray-400 text-sm">아래 계좌로 참가비를 입금해주세요</p>
      </div>

      {/* 입금 정보 */}
      <div className="bg-[#E53C87]/10 border-2 border-[#E53C87] rounded-xl p-6">
        <h3 className="text-lg font-bold text-pink-gradient mb-4 text-center">참가비 입금 안내</h3>

        <div className="space-y-3 text-white">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">참가비</span>
            <span className="text-xl font-bold text-pink-gradient">5,000원</span>
          </div>

          <div className="border-t border-[#E53C87]/30 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">은행</span>
              <span className="font-semibold">카카오뱅크</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">계좌번호</span>
              <span className="font-semibold">3333-12-3456789</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">예금주</span>
              <span className="font-semibold">일일호프</span>
            </div>
          </div>

          <div className="bg-[#0a0a0a] rounded-lg p-4 mt-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              <span className="text-pink-gradient font-bold">입금자명:</span> {personalInfo.name} (
              {schoolLabel})
              <br />
              <span className="text-xs text-gray-500 mt-2 block">
                ※ 입금 확인 후 신청이 최종 완료됩니다
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 신청 정보 요약 */}
      <div className="bg-[#1a1a1a] border-2 border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">신청 정보</h3>

        <div className="space-y-3 text-sm">
          {/* 기본 정보 */}
          <div className="flex justify-between">
            <span className="text-gray-400">학교</span>
            <span className="text-white font-medium">{schoolLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">성별</span>
            <span className="text-white font-medium">{genderLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">좌석 유형</span>
            <span className="text-white font-medium">{seatTypeLabel}</span>
          </div>
          {basicInfo.seatType === 'MEETING' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">입장 타임</span>
                <span className="text-white font-medium">{timeSlotLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">인원</span>
                <span className="text-white font-medium">{basicInfo.partySize}명</span>
              </div>
            </>
          )}
          {seatSelection?.seatNumber && (
            <div className="flex justify-between">
              <span className="text-gray-400">좌석 번호</span>
              <span className="text-white font-medium">{seatSelection.seatNumber}</span>
            </div>
          )}
        </div>

        {/* 신청자 정보 */}
        <div className="mt-6 pt-6 border-t border-gray-700 space-y-3 text-sm">
          <h4 className="text-md font-bold text-pink-gradient mb-3">신청자 정보</h4>
          <div className="flex justify-between">
            <span className="text-gray-400">이름</span>
            <span className="text-white font-medium">{personalInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">학과</span>
            <span className="text-white font-medium">{personalInfo.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">학번</span>
            <span className="text-white font-medium">{personalInfo.studentId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">생년</span>
            <span className="text-white font-medium">{personalInfo.birthYear}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">전화번호</span>
            <span className="text-white font-medium">{personalInfo.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">이메일</span>
            <span className="text-white font-medium">{personalInfo.email}</span>
          </div>
        </div>

        {/* 동반인 정보 (2명일 경우) */}
        {is2People && companionInfo && (
          <div className="mt-6 pt-6 border-t border-gray-700 space-y-3 text-sm">
            <h4 className="text-md font-bold text-pink-gradient mb-3">동반인 정보</h4>
            <div className="flex justify-between">
              <span className="text-gray-400">이름</span>
              <span className="text-white font-medium">{companionInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">학과</span>
              <span className="text-white font-medium">{companionInfo.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">학번</span>
              <span className="text-white font-medium">{companionInfo.studentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">생년</span>
              <span className="text-white font-medium">{companionInfo.birthYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">전화번호</span>
              <span className="text-white font-medium">{companionInfo.phone}</span>
            </div>
          </div>
        )}
      </div>

      {/* 안내 메시지 */}
      <div className="bg-[#0a0a0a] border-2 border-[#E53C87]/30 rounded-xl p-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="text-pink-gradient font-bold">※ 유의사항</span>
          <br />
          • 입금 확인은 영업일 기준 1~2일 소요될 수 있습니다
          <br />
          • 입금 완료 후 이메일로 확인 메시지가 발송됩니다
          <br />
          • 환불은 행사 7일 전까지 가능합니다
          <br />• 문의사항은 이메일로 연락주시기 바랍니다
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 py-4 px-6 bg-gray-700 hover:bg-gray-600 border-2 border-gray-700 hover:border-gray-600 rounded-xl transition-all duration-300 text-lg font-bold text-white"
        >
          이전
        </button>
        <button
          onClick={onComplete}
          className="flex-1 py-4 px-6 bg-[#E53C87] hover:bg-[#F06292] border-2 border-[#E53C87] hover:border-[#F06292] rounded-xl transition-all duration-300 text-lg font-bold text-white"
        >
          신청 완료
        </button>
      </div>
    </div>
  );
}
