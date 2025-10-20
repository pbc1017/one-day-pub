/**
 * 신청 단계 표시기 컴포넌트
 */

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      {/* 진행률 바 */}
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#E53C87] to-[#F06292] transition-all duration-500"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-[#E53C87] text-white'
                      : isActive
                        ? 'bg-[#E53C87] text-white ring-4 ring-[#E53C87]/30'
                        : 'bg-gray-700 text-gray-400'
                  }
                `}
              >
                {isCompleted ? '✓' : stepNumber}
              </div>
              <span
                className={`text-xs text-center ${isActive || isCompleted ? 'text-white font-medium' : 'text-gray-500'}`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
