/**
 * 체크박스 컴포넌트 (핑크 테마)
 */

import React from 'react';

interface CheckboxProps {
  label?: string | React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function Checkbox({
  label,
  checked,
  onChange,
  required = false,
  error,
  className = '',
}: CheckboxProps) {
  return (
    <div className={className}>
      <label className="flex items-start cursor-pointer group">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            className="w-5 h-5 text-[#E53C87] bg-gray-700 border-gray-600 rounded focus:ring-[#E53C87] focus:ring-2 cursor-pointer"
            style={{ accentColor: '#E53C87' }}
          />
        </div>
        {label && (
          <div className="ml-3 flex-1">
            <span className="text-white text-sm">
              {label}
              {required && <span className="text-pink-gradient ml-1">*</span>}
            </span>
          </div>
        )}
      </label>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
