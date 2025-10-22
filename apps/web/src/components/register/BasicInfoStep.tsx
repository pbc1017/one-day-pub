/**
 * 1단계: 기본 정보 입력
 */

import RadioGroup, { RadioOption } from '@/components/ui/RadioGroup';
import SegmentedControl, { SegmentOption } from '@/components/ui/SegmentedControl';
import { BasicInfo, School, Gender, SeatType, TimeSlot, PartySize } from '@/types/register';

interface BasicInfoStepProps {
  data: BasicInfo;
  onChange: (data: BasicInfo) => void;
  onNext: () => void;
}

const schoolOptions: SegmentOption[] = [
  { value: 'CNU', label: '충남대학교' },
  { value: 'KAIST', label: 'KAIST' },
];

const genderOptions: SegmentOption[] = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

const seatTypeOptions: SegmentOption[] = [
  { value: 'MEETING', label: '미팅석' },
  { value: 'GENERAL', label: '자유석' },
];

const timeSlotOptions: RadioOption[] = [
  { value: 'TIME_1', label: '1타임', description: '19:00 ~ 21:00' },
  { value: 'TIME_2', label: '2타임', description: '22:00 ~ 24:00' },
];

const partySizeOptions: SegmentOption[] = [
  { value: '1', label: '1명' },
  { value: '2', label: '2명' },
];

export default function BasicInfoStep({ data, onChange, onNext }: BasicInfoStepProps) {
  const isMeetingSeat = data.seatType === 'MEETING';

  const handleChange = (field: keyof BasicInfo, value: BasicInfo[keyof BasicInfo]) => {
    const newData = { ...data, [field]: value };

    // 좌석 유형이 자유석으로 변경되면 타임과 인원 초기화
    if (field === 'seatType' && value === 'GENERAL') {
      delete newData.timeSlot;
      delete newData.partySize;
    }

    onChange(newData);
  };

  const canProceed = () => {
    if (!data.school || !data.gender || !data.seatType) return false;
    if (isMeetingSeat && (!data.timeSlot || !data.partySize)) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">기본 정보</h2>
        <p className="text-gray-400 text-sm">신청을 위한 기본 정보를 선택해주세요</p>
      </div>

      <SegmentedControl
        label="학교"
        options={schoolOptions}
        value={data.school}
        onChange={value => handleChange('school', value as School)}
        required
      />

      <SegmentedControl
        label="성별"
        options={genderOptions}
        value={data.gender}
        onChange={value => handleChange('gender', value as Gender)}
        required
      />

      <SegmentedControl
        label="좌석 유형"
        options={seatTypeOptions}
        value={data.seatType}
        onChange={value => handleChange('seatType', value as SeatType)}
        required
      />

      {isMeetingSeat && (
        <>
          <SegmentedControl
            label="인원"
            options={partySizeOptions}
            value={data.partySize?.toString() || null}
            onChange={value => handleChange('partySize', parseInt(value) as PartySize)}
            required
          />
          <RadioGroup
            label="입장 타임"
            options={timeSlotOptions}
            value={data.timeSlot || null}
            onChange={value => handleChange('timeSlot', value as TimeSlot)}
            name="timeSlot"
            required
          />
        </>
      )}

      <button
        onClick={onNext}
        disabled={!canProceed()}
        className="w-full py-4 px-6 bg-[#E53C87] hover:bg-[#F06292] disabled:bg-gray-600 disabled:cursor-not-allowed border-2 border-[#E53C87] hover:border-[#F06292] disabled:border-gray-600 rounded-xl transition-all duration-300 text-lg font-bold text-white"
      >
        다음
      </button>
    </div>
  );
}
