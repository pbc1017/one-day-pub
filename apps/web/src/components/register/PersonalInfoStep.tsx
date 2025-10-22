/**
 * 3단계: 개인정보 입력
 */

import React, { useState } from 'react';

import { PersonalInfo, CompanionInfo, School } from '@/types/register';

interface PersonalInfoStepProps {
  data: PersonalInfo;
  companionData?: CompanionInfo;
  partySize?: number;
  school: School | null;
  onChange: (data: PersonalInfo) => void;
  onCompanionChange?: (data: CompanionInfo) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function PersonalInfoStep({
  data,
  companionData,
  partySize = 1,
  school,
  onChange,
  onCompanionChange,
  onNext,
  onPrev,
}: PersonalInfoStepProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({});
  const [companionErrors, setCompanionErrors] = useState<
    Partial<Record<keyof CompanionInfo, string>>
  >({});

  const is2People = partySize === 2;

  // 전화번호 자동 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, '');

    // 포맷 적용
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    // 전화번호 입력 시 자동 포맷팅 적용
    const formattedValue = field === 'phone' ? formatPhoneNumber(value) : value;
    onChange({ ...data, [field]: formattedValue });
    // 에러 초기화
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleCompanionChange = (field: keyof CompanionInfo, value: string) => {
    if (onCompanionChange && companionData) {
      // 전화번호 입력 시 자동 포맷팅 적용
      const formattedValue = field === 'phone' ? formatPhoneNumber(value) : value;
      onCompanionChange({ ...companionData, [field]: formattedValue });
      // 에러 초기화
      if (companionErrors[field]) {
        setCompanionErrors({ ...companionErrors, [field]: undefined });
      }
    }
  };

  const validatePersonalInfo = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalInfo, string>> = {};

    if (!data.name.trim()) newErrors.name = '이름을 입력해주세요';
    if (!data.department.trim()) newErrors.department = '학과를 입력해주세요';

    // 학번 검증: 학교별 자릿수 체크
    if (!data.studentId.trim()) {
      newErrors.studentId = '학번을 입력해주세요';
    } else if (
      (school === 'KAIST' && !/^\d{8}$/.test(data.studentId)) ||
      (school === 'CNU' && !/^\d{9}$/.test(data.studentId))
    ) {
      newErrors.studentId = '올바른 학번 형식이 아닙니다';
    }

    if (!data.birthYear.trim()) {
      newErrors.birthYear = '생년을 입력해주세요';
    } else if (!/^\d{4}$/.test(data.birthYear)) {
      newErrors.birthYear = '4자리 숫자로 입력해주세요 (예: 2000)';
    }
    if (!data.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(data.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }
    if (!data.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCompanionInfo = (): boolean => {
    if (!is2People || !companionData) return true;

    const newErrors: Partial<Record<keyof CompanionInfo, string>> = {};

    if (!companionData.name.trim()) newErrors.name = '이름을 입력해주세요';
    if (!companionData.department.trim()) newErrors.department = '학과를 입력해주세요';

    // 학번 검증: 학교별 자릿수 체크
    if (!companionData.studentId.trim()) {
      newErrors.studentId = '학번을 입력해주세요';
    } else if (
      (school === 'KAIST' && !/^\d{8}$/.test(companionData.studentId)) ||
      (school === 'CNU' && !/^\d{9}$/.test(companionData.studentId))
    ) {
      newErrors.studentId = '올바른 학번 형식이 아닙니다';
    }

    if (!companionData.birthYear.trim()) {
      newErrors.birthYear = '생년을 입력해주세요';
    } else if (!/^\d{4}$/.test(companionData.birthYear)) {
      newErrors.birthYear = '4자리 숫자로 입력해주세요 (예: 2000)';
    }
    if (!companionData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/.test(companionData.phone.replace(/-/g, ''))) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    setCompanionErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    const isPersonalValid = validatePersonalInfo();
    const isCompanionValid = validateCompanionInfo();

    if (isPersonalValid && isCompanionValid) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">개인정보 입력</h2>
        <p className="text-gray-400 text-sm">
          {is2People
            ? '신청자와 동반인의 정보를 정확히 입력해주세요'
            : '신청자 본인의 정보를 정확히 입력해주세요'}
        </p>
      </div>

      {/* 신청자 정보 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-gradient">신청자 정보</h3>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            이름 <span className="text-pink-gradient">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="홍길동"
            className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            학과 <span className="text-pink-gradient">*</span>
          </label>
          <input
            type="text"
            value={data.department}
            onChange={e => handleChange('department', e.target.value)}
            placeholder="컴퓨터공학과"
            className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
          />
          {errors.department && <p className="mt-1 text-sm text-red-400">{errors.department}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            학번 <span className="text-pink-gradient">*</span>
          </label>
          <input
            type="text"
            value={data.studentId}
            onChange={e => handleChange('studentId', e.target.value)}
            placeholder={school === 'KAIST' ? '20201234 (8자리)' : '202012345 (9자리)'}
            className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
          />
          {errors.studentId && <p className="mt-1 text-sm text-red-400">{errors.studentId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            생년 <span className="text-pink-gradient">*</span>
          </label>
          <input
            type="text"
            value={data.birthYear}
            onChange={e => handleChange('birthYear', e.target.value)}
            placeholder="2000"
            maxLength={4}
            className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
          />
          {errors.birthYear && <p className="mt-1 text-sm text-red-400">{errors.birthYear}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            전화번호 <span className="text-pink-gradient">*</span>
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={e => handleChange('phone', e.target.value)}
            placeholder="010-1234-5678"
            className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            이메일 <span className="text-pink-gradient">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={e => handleChange('email', e.target.value)}
            placeholder="example@email.com"
            className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>
      </div>

      {/* 동반인 정보 (2명일 경우) */}
      {is2People && companionData && (
        <div className="space-y-4 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-bold text-pink-gradient">동반인 정보</h3>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              이름 <span className="text-pink-gradient">*</span>
            </label>
            <input
              type="text"
              value={companionData.name}
              onChange={e => handleCompanionChange('name', e.target.value)}
              placeholder="김철수"
              className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
            />
            {companionErrors.name && (
              <p className="mt-1 text-sm text-red-400">{companionErrors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              학과 <span className="text-pink-gradient">*</span>
            </label>
            <input
              type="text"
              value={companionData.department}
              onChange={e => handleCompanionChange('department', e.target.value)}
              placeholder="전자공학과"
              className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
            />
            {companionErrors.department && (
              <p className="mt-1 text-sm text-red-400">{companionErrors.department}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              학번 <span className="text-pink-gradient">*</span>
            </label>
            <input
              type="text"
              value={companionData.studentId}
              onChange={e => handleCompanionChange('studentId', e.target.value)}
              placeholder={school === 'KAIST' ? '20209876 (8자리)' : '202098765 (9자리)'}
              className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
            />
            {companionErrors.studentId && (
              <p className="mt-1 text-sm text-red-400">{companionErrors.studentId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              생년 <span className="text-pink-gradient">*</span>
            </label>
            <input
              type="text"
              value={companionData.birthYear}
              onChange={e => handleCompanionChange('birthYear', e.target.value)}
              placeholder="2001"
              maxLength={4}
              className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
            />
            {companionErrors.birthYear && (
              <p className="mt-1 text-sm text-red-400">{companionErrors.birthYear}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              전화번호 <span className="text-pink-gradient">*</span>
            </label>
            <input
              type="tel"
              value={companionData.phone}
              onChange={e => handleCompanionChange('phone', e.target.value)}
              placeholder="010-9876-5432"
              className="w-full p-3 bg-[#1a1a1a] border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#E53C87] focus:outline-none transition-colors"
            />
            {companionErrors.phone && (
              <p className="mt-1 text-sm text-red-400">{companionErrors.phone}</p>
            )}
          </div>
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
          onClick={handleNext}
          className="flex-1 py-4 px-6 bg-[#E53C87] hover:bg-[#F06292] border-2 border-[#E53C87] hover:border-[#F06292] rounded-xl transition-all duration-300 text-lg font-bold text-white"
        >
          다음
        </button>
      </div>
    </div>
  );
}
