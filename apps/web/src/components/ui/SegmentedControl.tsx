/**
 * Segmented Control 컴포넌트 (핑크 테마)
 */

import React from 'react';

export interface SegmentOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  label?: string;
  options: SegmentOption[];
  value: string | null;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function SegmentedControl({
  label,
  options,
  value,
  onChange,
  required = false,
  className = '',
}: SegmentedControlProps) {
  const selectedIndex = options.findIndex(option => option.value === value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-white mb-3">
          {label}
          {required && <span className="text-pink-gradient ml-1">*</span>}
        </label>
      )}

      <div className="relative flex bg-[#1a1a1a] border-2 border-gray-700 p-1 rounded-xl">
        {/* 슬라이딩 배경 */}
        {selectedIndex >= 0 && (
          <div
            className="absolute top-1 bottom-1 bg-[#E53C87] rounded-lg shadow-lg transition-all duration-300 ease-out"
            style={{
              left: `${(selectedIndex * 100) / options.length}%`,
              width: `calc(${100 / options.length}% - 0.5rem)`,
              marginLeft: '0.25rem',
            }}
          />
        )}

        {/* 버튼들 */}
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative flex-1 px-6 py-3 rounded-lg font-semibold text-sm transition-colors duration-200 z-10
              ${value === option.value ? 'text-white' : 'text-gray-400 hover:text-white'}
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
