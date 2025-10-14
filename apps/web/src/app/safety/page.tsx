'use client';

import type { TodayStats, UserStats } from '@one-day-pub/interface/dtos/safety.dto.js';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import HourlyChart from '@/components/safety/HourlyChart';
import SafetyControls from '@/components/safety/SafetyControls';
import { FullScreenLoading } from '@/components/ui/LoadingSpinner';
import { useRequireAuth } from '@/hooks/useAuthGuard';
import { useSafetyStats } from '@/hooks/useSafety';
import { useAuth } from '@/providers/AuthProvider';

export default function SafetyPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('safety');

  // 언어별 로케일 설정
  const timeLocale = locale === 'en' ? 'en-US' : 'ko-KR';

  // 기본 인증 가드
  const { isLoading: authGuardLoading } = useRequireAuth();
  const { user, isLoading: userLoading } = useAuth();

  // Safety 통계 데이터 조회 (초기 데이터)
  const { data: stats, isLoading: statsLoading, error: statsError } = useSafetyStats();

  // Count 응답에서 받은 최신 통계 데이터 (우선순위 높음)
  const [countStats, setCountStats] = useState<{
    todayStats: TodayStats;
    userStats: UserStats;
    currentTotal: number;
  } | null>(null);

  // SAFETY 역할 확인
  const hasSafetyRole = user?.roles?.includes('safety') || false;

  // 표시할 데이터 결정 (Count 응답 데이터 우선, 없으면 Stats API 데이터)
  const displayStats = countStats || stats;
  const isLoading = statsLoading && !countStats;

  // Count 응답 데이터 업데이트 핸들러
  const handleStatsUpdate = (newStats: {
    todayStats: TodayStats;
    userStats: UserStats;
    currentTotal: number;
  }) => {
    console.log('🔄 Updated stats from count response:', newStats);
    setCountStats(newStats);
  };

  useEffect(() => {
    // 사용자 로딩이 완료되고 SAFETY 역할이 없으면 홈으로 리다이렉트
    if (!userLoading && !hasSafetyRole) {
      router.push('/');
    }
  }, [userLoading, hasSafetyRole, router]);

  // 로딩 상태 처리
  if (authGuardLoading || userLoading) {
    return <FullScreenLoading />;
  }

  // SAFETY 역할이 없는 경우
  if (!hasSafetyRole) {
    return <FullScreenLoading />; // 리다이렉트 중이므로 로딩 표시
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* 통계 오류 표시 */}
        {statsError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-400 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <p className="text-red-700 font-medium">{t('statsError')}</p>
            </div>
          </div>
        )}

        {/* 메인 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 현재 인원수 카드 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">{t('currentTotal')}</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">{t('loading')}</span>
                </div>
              ) : (
                <>
                  <div className="text-6xl font-bold text-blue-600 mb-2">
                    {displayStats?.currentTotal ?? 0}
                  </div>
                  <p className="text-gray-500 text-lg">{t('people')}</p>
                  {displayStats && (
                    <div className="mt-4 text-sm text-gray-400">
                      {countStats ? (
                        <>
                          <span className="text-green-600 font-medium">● {t('realtime')}</span>
                          <span className="ml-2">{t('syncCompleted')}</span>
                        </>
                      ) : (
                        <>
                          {t('lastUpdate')}: {new Date().toLocaleTimeString(timeLocale)}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* In/Out 컨트롤 영역 */}
          <SafetyControls onStatsUpdate={handleStatsUpdate} />

          {/* 오늘 통계 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('todayStats')}</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
                <span className="ml-2 text-gray-500">로딩 중...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('totalEntries')}</span>
                  <span className="text-2xl font-bold text-green-600">
                    {displayStats?.todayStats.totalIncrement ?? 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('totalExits')}</span>
                  <span className="text-2xl font-bold text-red-600">
                    {displayStats?.todayStats.totalDecrement ?? 0}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">{t('currentInside')}</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {displayStats?.todayStats.currentInside ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 사용자 기여 통계 카드 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('myContributions')}</h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300"></div>
                  <span className="ml-2 text-gray-500">{t('loading')}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {displayStats?.userStats.increment ?? 0}
                    </div>
                    <p className="text-gray-600">{t('myEntries')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {displayStats?.userStats.decrement ?? 0}
                    </div>
                    <p className="text-gray-600">{t('myExits')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {displayStats?.userStats.netCount ?? 0}
                    </div>
                    <p className="text-gray-600">{t('netContribution')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 시간대별 차트 영역 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('hourlyStats')}</h3>
              <HourlyChart minuteStats={stats?.minuteStats || []} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
