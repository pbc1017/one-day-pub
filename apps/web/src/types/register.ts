/**
 * 신청 폼 데이터 타입 정의
 */

export type School = 'CNU' | 'KAIST';
export type Gender = 'MALE' | 'FEMALE';
export type SeatType = 'MEETING' | 'GENERAL';
export type TimeSlot = 'TIME_1' | 'TIME_2';
export type PartySize = 1 | 2;

export interface BasicInfo {
  school: School | null;
  gender: Gender | null;
  seatType: SeatType | null;
  timeSlot?: TimeSlot | null; // 미팅석일 경우에만
  partySize?: PartySize | null; // 미팅석일 경우에만
}

export interface PersonalInfo {
  name: string;
  department: string;
  studentId: string;
  birthYear: string;
  phone: string;
  email: string;
}

export interface CompanionInfo {
  name: string;
  department: string;
  studentId: string;
  birthYear: string;
  phone: string;
}

export interface SeatSelection {
  seatNumber: string | null;
}

export interface RegistrationData {
  basicInfo: BasicInfo;
  consent: boolean;
  personalInfo: PersonalInfo;
  companionInfo?: CompanionInfo; // 2명일 경우에만
  seatSelection?: SeatSelection; // 자유석일 경우에만
  timestamp: string;
}

export type RegistrationStep = 'basic' | 'consent' | 'personal' | 'seat' | 'payment';
