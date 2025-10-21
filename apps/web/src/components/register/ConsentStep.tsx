/**
 * 2단계: 개인정보 동의
 */

import React from 'react';

import Checkbox from '@/components/ui/Checkbox';

interface ConsentStepProps {
  consent: boolean;
  onChange: (consent: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ConsentStep({ consent, onChange, onNext, onPrev }: ConsentStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">개인정보 수집 및 이용 동의</h2>
        <p className="text-gray-400 text-sm">서비스 제공을 위해 아래 내용에 동의해주세요</p>
      </div>

      <div className="bg-[#1a1a1a] border-2 border-gray-700 rounded-xl p-6 max-h-96 overflow-y-auto">
        <div className="text-white text-sm space-y-4">
          <div>
            <h3 className="font-bold text-pink-gradient mb-2">1. 수집하는 개인정보 항목</h3>
            <p className="text-gray-300 leading-relaxed">
              일일호프 신청 및 운영을 위해 다음의 개인정보를 수집합니다:
            </p>
            <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1 ml-4">
              <li>필수항목: 이름, 학교, 학과, 학번, 생년, 성별, 전화번호, 이메일</li>
              <li>선택항목: 좌석 선택 정보, 입장 타임 정보</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-pink-gradient mb-2">2. 개인정보의 수집 및 이용 목적</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>일일호프 참가 신청 접수 및 확인</li>
              <li>참가자 본인 확인 및 신원 확인</li>
              <li>참가비 입금 확인 및 좌석 배정</li>
              <li>행사 관련 공지사항 전달</li>
              <li>행사 통계 및 분석</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-pink-gradient mb-2">3. 개인정보의 보유 및 이용 기간</h3>
            <p className="text-gray-300 leading-relaxed">
              수집된 개인정보는 행사 종료 후{' '}
              <span className="text-pink-gradient font-semibold">30일간</span> 보관되며, 이후 즉시
              파기됩니다. 단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관됩니다.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-pink-gradient mb-2">4. 개인정보 제공 동의 거부 권리</h3>
            <p className="text-gray-300 leading-relaxed">
              귀하는 개인정보 제공에 대한 동의를 거부할 권리가 있습니다. 다만, 필수 항목에 대한
              동의를 거부할 경우 일일호프 참가 신청이 제한될 수 있습니다.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-xs">
              본 동의서는 일일호프 참가 신청 시 필요한 개인정보 수집·이용을 위한 것이며, 위 내용을
              충분히 이해하였음을 확인합니다.
            </p>
          </div>
        </div>
      </div>

      <Checkbox
        label={
          <span className="text-base">
            위 개인정보 수집 및 이용에{' '}
            <span className="text-pink-gradient font-bold">동의합니다</span>
          </span>
        }
        checked={consent}
        onChange={onChange}
        required
      />

      <div className="flex gap-4">
        <button
          onClick={onPrev}
          className="flex-1 py-4 px-6 bg-gray-700 hover:bg-gray-600 border-2 border-gray-700 hover:border-gray-600 rounded-xl transition-all duration-300 text-lg font-bold text-white"
        >
          이전
        </button>
        <button
          onClick={onNext}
          disabled={!consent}
          className="flex-1 py-4 px-6 bg-[#E53C87] hover:bg-[#F06292] disabled:bg-gray-600 disabled:cursor-not-allowed border-2 border-[#E53C87] hover:border-[#F06292] disabled:border-gray-600 rounded-xl transition-all duration-300 text-lg font-bold text-white"
        >
          다음
        </button>
      </div>
    </div>
  );
}
