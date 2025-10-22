/**
 * AlertDialog 컴포넌트
 * 모달 형태의 알림 다이얼로그
 */

import React, { useEffect } from 'react';

interface AlertDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

export default function AlertDialog({
  isOpen,
  title,
  message,
  confirmText = '확인',
  onConfirm,
}: AlertDialogProps) {
  // 다이얼로그가 열리면 body 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // cleanup: 컴포넌트 언마운트 시 스크롤 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onConfirm} />

      {/* Dialog */}
      <div className="relative z-10 bg-[#1a1a1a] border-2 border-[#2a2a2a] rounded-3xl p-8 max-w-sm w-auto min-w-[320px] mx-auto shadow-2xl">
        {title && <h3 className="text-xl font-bold text-white mb-4">{title}</h3>}

        <p className="text-base text-gray-300 mb-8 leading-relaxed">{message}</p>

        <div className="flex justify-end">
          <button
            onClick={onConfirm}
            className="py-2 px-8 bg-transparent hover:bg-[#E53C87]/10 border-2 border-transparent hover:border-[#E53C87] rounded-xl transition-all duration-300 text-base font-bold text-[#E53C87]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
