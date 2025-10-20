/**
 * 라디오 버튼 그룹 컴포넌트 (핑크 테마)
 */

import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function RadioGroup({
  label,
  options,
  value,
  onChange,
  name,
  required = false,
  error,
  className = '',
}: RadioGroupProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-white mb-3">
          {label}
          {required && <span className="text-pink-gradient ml-1">*</span>}
        </label>
      )}

      <div className="space-y-3">
        {options.map(option => (
          <label
            key={option.value}
            className={`
              flex items-start p-4 rounded-xl cursor-pointer transition-all duration-200
              ${
                value === option.value
                  ? 'bg-[#E53C87]/20 border-2 border-[#E53C87]'
                  : 'bg-[#1a1a1a] border-2 border-gray-700 hover:border-[#E53C87]/50'
              }
            `}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={e => onChange(e.target.value)}
              className="mt-1 w-4 h-4 text-[#E53C87] bg-gray-700 border-gray-600 focus:ring-[#E53C87] focus:ring-2"
              style={{ accentColor: '#E53C87' }}
            />
            <div className="ml-3 flex-1">
              <div className="text-white font-medium">{option.label}</div>
              {option.description && (
                <div className="text-sm text-gray-400 mt-1">{option.description}</div>
              )}
            </div>
          </label>
        ))}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
