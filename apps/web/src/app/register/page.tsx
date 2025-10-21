'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import BasicInfoStep from '@/components/register/BasicInfoStep';
import ConsentStep from '@/components/register/ConsentStep';
import PaymentInfoStep from '@/components/register/PaymentInfoStep';
import PersonalInfoStep from '@/components/register/PersonalInfoStep';
import SeatSelectionStep from '@/components/register/SeatSelectionStep';
import StepIndicator from '@/components/register/StepIndicator';
import {
  BasicInfo,
  PersonalInfo,
  CompanionInfo,
  SeatSelection,
  RegistrationData,
  RegistrationStep,
} from '@/types/register';

const STORAGE_KEY = 'onedaypub_registration';

export default function RegisterPage() {
  const router = useRouter();

  // 단계 관리
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('basic');

  // 폼 데이터
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    school: null,
    gender: null,
    seatType: null,
    timeSlot: null,
    partySize: 1, // 기본값 1명
  });

  const [consent, setConsent] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    department: '',
    studentId: '',
    birthYear: '',
    phone: '',
    email: '',
  });

  const [companionInfo, setCompanionInfo] = useState<CompanionInfo>({
    name: '',
    department: '',
    studentId: '',
    birthYear: '',
    phone: '',
  });

  const [seatSelection, setSeatSelection] = useState<SeatSelection>({
    seatNumber: null,
  });

  // 로컬스토리지에서 데이터 복원 (페이지 새로고침 시)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data: RegistrationData = JSON.parse(saved);
        setBasicInfo(data.basicInfo);
        setConsent(data.consent);
        setPersonalInfo(data.personalInfo);
        if (data.companionInfo) {
          setCompanionInfo(data.companionInfo);
        }
        if (data.seatSelection) {
          setSeatSelection(data.seatSelection);
        }
      } catch (error) {
        console.error('Failed to restore registration data:', error);
      }
    }
  }, []);

  // 데이터 변경 시 로컬스토리지에 저장
  useEffect(() => {
    const data: RegistrationData = {
      basicInfo,
      consent,
      personalInfo,
      companionInfo: basicInfo.partySize === 2 ? companionInfo : undefined,
      seatSelection: basicInfo.seatType === 'GENERAL' ? seatSelection : undefined,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [basicInfo, consent, personalInfo, companionInfo, seatSelection]);

  // 자유석 여부
  const isGeneralSeat = basicInfo.seatType === 'GENERAL';

  // 총 단계 수 계산
  const totalSteps = isGeneralSeat ? 5 : 4;
  const stepLabels = isGeneralSeat
    ? ['기본정보', '동의', '개인정보', '좌석선택', '입금안내']
    : ['기본정보', '동의', '개인정보', '입금안내'];

  // 현재 단계 번호
  const getCurrentStepNumber = (): number => {
    switch (currentStep) {
      case 'basic':
        return 1;
      case 'consent':
        return 2;
      case 'personal':
        return 3;
      case 'seat':
        return 4;
      case 'payment':
        return isGeneralSeat ? 5 : 4;
      default:
        return 1;
    }
  };

  // 단계 이동 핸들러
  const handleNext = (from: RegistrationStep) => {
    switch (from) {
      case 'basic':
        setCurrentStep('consent');
        break;
      case 'consent':
        setCurrentStep('personal');
        break;
      case 'personal':
        if (isGeneralSeat) {
          setCurrentStep('seat');
        } else {
          setCurrentStep('payment');
        }
        break;
      case 'seat':
        setCurrentStep('payment');
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = (from: RegistrationStep) => {
    switch (from) {
      case 'consent':
        setCurrentStep('basic');
        break;
      case 'personal':
        setCurrentStep('consent');
        break;
      case 'seat':
        setCurrentStep('personal');
        break;
      case 'payment':
        if (isGeneralSeat) {
          setCurrentStep('seat');
        } else {
          setCurrentStep('personal');
        }
        break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 신청 완료
  const handleComplete = () => {
    const registrationData: RegistrationData = {
      basicInfo,
      consent,
      personalInfo,
      companionInfo: basicInfo.partySize === 2 ? companionInfo : undefined,
      seatSelection: isGeneralSeat ? seatSelection : undefined,
      timestamp: new Date().toISOString(),
    };

    // 로컬스토리지에 최종 저장
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrationData));
    localStorage.setItem(`${STORAGE_KEY}_completed`, 'true');

    // 성공 토스트
    toast.success('신청이 완료되었습니다! 참가비 입금 후 확인 메일을 기다려주세요.', {
      duration: 4000,
    });

    // 메인 페이지로 이동
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  // 전체 등록 데이터
  const registrationData: RegistrationData = {
    basicInfo,
    consent,
    personalInfo,
    seatSelection: isGeneralSeat ? seatSelection : undefined,
    timestamp: new Date().toISOString(),
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-pink-gradient">일일호프 신청</span>
          </h1>
          <p className="text-gray-400">2025. 11. 11. 궁동 로데오거리 하루해</p>
        </div>

        {/* 단계 표시기 */}
        <StepIndicator
          currentStep={getCurrentStepNumber()}
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />

        {/* 단계별 컴포넌트 */}
        <div className="card-pink rounded-3xl p-6">
          {currentStep === 'basic' && (
            <BasicInfoStep
              data={basicInfo}
              onChange={setBasicInfo}
              onNext={() => handleNext('basic')}
            />
          )}

          {currentStep === 'consent' && (
            <ConsentStep
              consent={consent}
              onChange={setConsent}
              onNext={() => handleNext('consent')}
              onPrev={() => handlePrev('consent')}
            />
          )}

          {currentStep === 'personal' && (
            <PersonalInfoStep
              data={personalInfo}
              companionData={companionInfo}
              partySize={basicInfo.partySize || 1}
              onChange={setPersonalInfo}
              onCompanionChange={setCompanionInfo}
              onNext={() => handleNext('personal')}
              onPrev={() => handlePrev('personal')}
            />
          )}

          {currentStep === 'seat' && isGeneralSeat && (
            <SeatSelectionStep
              data={seatSelection}
              onChange={setSeatSelection}
              onNext={() => handleNext('seat')}
              onPrev={() => handlePrev('seat')}
            />
          )}

          {currentStep === 'payment' && (
            <PaymentInfoStep
              data={registrationData}
              onComplete={handleComplete}
              onPrev={() => handlePrev('payment')}
            />
          )}
        </div>

        {/* 하단 안내 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    </main>
  );
}
