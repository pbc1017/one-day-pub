'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // 네비게이션 아이템
  const navigationItems = [
    {
      title: '신청하기',
      url: '/register',
    },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-[#E53C87]/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* 로고 */}
            <div className="flex-1" />
            <Link href="/" className="flex-shrink-0 my-1" onClick={closeMenu}>
              <Image
                src="/kamf_logo.png"
                alt="One Day Pub 2025"
                width={100}
                height={30}
                className="object-contain hover:scale-105 transition-transform duration-300"
                draggable={false}
              />
            </Link>

            {/* 햄버거 메뉴 버튼 */}
            <div className="flex-1 flex justify-end items-center">
              <button
                onClick={toggleMenu}
                className="relative w-10 h-10 flex flex-col justify-center items-center space-y-1 bg-white hover:bg-[#E53C87] rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg group"
                aria-label="메뉴 열기"
              >
                <span
                  className={`block w-6 h-0.5 bg-black group-hover:bg-white transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-black group-hover:bg-white transition-all duration-300 ${
                    isMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-black group-hover:bg-white transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 오버레이 */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* 사이드 메뉴 */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full bg-black/95 backdrop-blur-xl border-l border-[#E53C87]/50 shadow-2xl">
          {/* 메뉴 헤더 */}
          <div className="flex justify-between items-center p-6 border-b border-[#E53C87]/50">
            <h2 className="text-2xl font-bold text-white">메뉴</h2>
            <button
              onClick={closeMenu}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-600/20 hover:bg-[#E53C87] transition-colors duration-200"
              aria-label="메뉴 닫기"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 메뉴 항목들 */}
          <nav className="p-6">
            <ul className="space-y-4">
              {navigationItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.url}
                    onClick={closeMenu}
                    className="block w-full text-left p-4 text-lg font-semibold text-white bg-[#E53C87] hover:bg-[#F06292] rounded-2xl border-2 border-[#E53C87] hover:border-[#F06292] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 하단 정보 */}
          <div className="absolute bottom-6 left-6 right-6 text-center">
            <div className="p-4 bg-[#0a0a0a] rounded-2xl border-2 border-[#E53C87]/50">
              <p className="text-[#E53C87] text-sm font-semibold">One Day Pub 2025</p>
              <p className="text-gray-300 text-xs mt-1">KAIST 일일호프</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
