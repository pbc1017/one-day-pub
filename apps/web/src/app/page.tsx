'use client';

import Image from 'next/image';
import Link from 'next/link';

import { getTodayStagesUrl } from '@/utils/stages';

export default function Home() {
  // 한국 시간 기준 현재 시간 구하기
  const getCurrentKoreanTime = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  };

  // 현재 시간이 운영시간 내인지 확인
  const isCurrentlyOpen = (operatingHours: string): boolean => {
    const koreanTime = getCurrentKoreanTime();
    const currentHour = koreanTime.getHours();
    const currentMinute = koreanTime.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [start, end] = operatingHours.split(' - ');
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const startTimeInMinutes = startHour * 60 + startMinute;
    let endTimeInMinutes = endHour * 60 + endMinute;

    // 24:00 처리 (자정)
    if (endHour === 24) {
      endTimeInMinutes = 24 * 60;
    }

    // 자정을 넘어가는 경우 (예: 17:00 - 24:00)
    if (endTimeInMinutes >= 24 * 60) {
      return currentTimeInMinutes >= startTimeInMinutes;
    }

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  };

  // 부스별 운영 시간 정보 (실시간 상태 계산)
  const operatingHoursData = [
    {
      zone: '부스존',
      hours: '13:00 - 18:00',
      description: '학과별 체험 부스',
      status: isCurrentlyOpen('13:00 - 18:00') ? 'open' : 'closed',
    },
    {
      zone: '인포 부스',
      hours: '13:00 - 22:30',
      description: '종합 안내 및 분실물',
      status: isCurrentlyOpen('13:00 - 22:30') ? 'open' : 'closed',
    },
    {
      zone: '푸드트럭',
      hours: '13:00 - 22:30',
      description: '다양한 음식 판매',
      status: isCurrentlyOpen('13:00 - 22:30') ? 'open' : 'closed',
    },
    {
      zone: '야시장',
      hours: '18:00 - 22:30',
      description: '주류 및 안주 판매',
      status: isCurrentlyOpen('18:00 - 22:30') ? 'open' : 'closed',
    },
    {
      zone: '무대',
      hours: '15:00 - 22:00',
      description: '공연 및 이벤트',
      status: isCurrentlyOpen('15:00 - 22:00') ? 'open' : 'closed',
    },
  ];
  const mainNavigation = [
    {
      title: '부스 배치도',
      url: '/booth',
    },
    {
      title: '무대 시간표',
      url: getTodayStagesUrl(),
    },
  ];

  return (
    <main className="min-h-screen bg-black-organic organic-overlay">
      {/* 헤더 */}
      <div className="text-center py-16">
        <div>
          <h1 className="text-6xl font-bold text-white mb-6">
            <span className="text-pink-gradient">One Day Pub</span> 2025
          </h1>
          <p className="text-2xl text-white font-medium">KAIST Art & Music Festival</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* 메인 로고 및 네비게이션 */}
        <div className="text-center mb-16">
          <div className="card-pink card-pink-hover rounded-3xl p-8 mb-12">
            <Image
              src="/kamf_main.png"
              alt="One Day Pub 2025"
              width={400}
              height={400}
              className="object-contain mx-auto mb-8"
              draggable={false}
            />
            <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
              {mainNavigation.map((nav, index) => (
                <Link key={index} href={nav.url}>
                  <button className="w-full py-4 px-8 bg-[#E53C87] hover:bg-[#F06292] border-2 border-[#E53C87] hover:border-[#F06292] rounded-xl transition-all duration-300 text-xl font-bold text-white hover:scale-105 text-center">
                    {nav.title}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* 부스별 운영 시간 */}
        <div className="card-pink rounded-3xl shadow-2xl p-8 mb-16">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">부스별 운영 시간</h3>
          <div className="space-y-4">
            {operatingHoursData.map((booth, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-[#0a0a0a] border-2 border-[#E53C87]/40 rounded-xl hover:border-[#E53C87] transition-all duration-300"
              >
                <div className="flex-1 mb-4 md:mb-0">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                    <h4 className="text-lg md:text-xl font-semibold text-white break-words">
                      {booth.zone}
                    </h4>
                    <span
                      className={`px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded-full ${
                        booth.status === 'open'
                          ? 'bg-green-600 text-white border-2 border-green-500'
                          : 'bg-orange-600 text-white border-2 border-orange-500'
                      }`}
                    >
                      {booth.status === 'open' ? '운영중' : '준비중'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base break-words">
                    {booth.description}
                  </p>
                </div>
                <div className="text-center md:text-right md:ml-6 mt-2 md:mt-0">
                  <div className="text-lg md:text-xl font-bold text-white">{booth.hours}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 추가 안내 */}
          <div className="mt-8 p-6 bg-[#0a0a0a] border-2 border-[#E53C87] rounded-xl">
            <p className="text-white text-center leading-relaxed">
              💡 운영 시간은 상황에 따라 변경될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
