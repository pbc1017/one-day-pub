'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-sm mx-auto px-4 py-8">
        {/* 일일호프 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-pink-gradient">CNU & KAIST</span>
          </h1>
          <h2 className="text-4xl font-bold text-white mb-2">일일호프</h2>
          <p className="text-xl text-pink-gradient font-semibold">w. 하루해</p>
          <div className="mt-4 inline-block px-6 py-2 rounded-full border-2 border-[#E53C87]">
            <p className="text-white font-bold">일시 : 2025. 11. 11. 18:00</p>
          </div>
        </div>

        {/* 신청 버튼 */}
        <div className="mb-8">
          <div className="card-pink rounded-3xl p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/register')}
                className="w-full py-4 px-6 bg-[#E53C87] hover:bg-[#F06292] border-2 border-[#E53C87] hover:border-[#F06292] rounded-xl transition-all duration-300 text-lg font-bold text-white"
              >
                신청하기
              </button>
              <button className="w-full py-4 px-6 bg-[#E53C87] hover:bg-[#F06292] border-2 border-[#E53C87] hover:border-[#F06292] rounded-xl transition-all duration-300 text-lg font-bold text-white">
                신청 변경
              </button>
            </div>
          </div>
        </div>

        {/* 일일호프 소개 */}
        <div className="mb-8">
          <div className="card-pink rounded-3xl p-6">
            <h3 className="text-2xl font-bold text-white text-center mb-6">장소 및 참가비</h3>

            <div className="space-y-4 text-white">
              {/* 참여 대상 */}
              <div>
                <h4 className="text-lg font-bold text-pink-gradient mb-2">참여 대상</h4>
                <p className="text-base">: 충남대/카이스트 학생</p>
                <p className="text-sm text-gray-300 ml-2">(재학생, 휴학생 포함)</p>
              </div>

              {/* 참가비 */}
              <div>
                <h4 className="text-lg font-bold text-pink-gradient mb-2">참가비 : 5천원</h4>
              </div>

              {/* 장소 */}
              <div>
                <h4 className="text-lg font-bold text-pink-gradient mb-2">장소</h4>
                <div className="flex items-center gap-3">
                  <p className="text-base">
                    : 궁동 로데오거리 <span className="text-orange-500 font-bold">하루해</span>
                  </p>
                  <a
                    href="https://naver.me/x7vB70tH"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#E53C87] hover:bg-[#F06292] border border-[#E53C87] hover:border-[#F06292] rounded-lg transition-all duration-300 text-sm font-semibold text-white whitespace-nowrap"
                  >
                    지도 보기
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 타임라인 */}
        <div className="mb-8">
          <div className="card-pink rounded-3xl p-6">
            <h3 className="text-2xl font-bold text-white text-center mb-6">타임라인</h3>

            <div className="space-y-4 text-white">
              {/* 입장 시간 */}
              <div>
                <h4 className="text-lg font-bold text-pink-gradient mb-2">{'<입장 시간>'}</h4>
                <p className="text-base">
                  <span className="text-pink-gradient font-bold">1타임</span> : 19:00~21:00
                </p>
                <p className="text-base">
                  <span className="text-pink-gradient font-bold">2타임</span> : 22:00~24:00
                </p>
              </div>

              {/* 이벤트 */}
              <div>
                <h4 className="text-lg font-bold text-pink-gradient mb-2">{'<이벤트>'}</h4>
                <p className="text-base mb-2">
                  매시 <span className="text-pink-gradient font-bold">11분</span>마다 있는 이벤트!
                </p>
                <p className="text-sm text-gray-300">(사연라디오, 빼빼로 테마 게임)</p>

                <div className="mt-4 p-4 bg-[#0a0a0a] border-2 border-[#E53C87] rounded-xl">
                  <div className="mb-3">
                    <h5 className="font-bold text-pink-gradient mb-1">사연라디오</h5>
                    <p className="text-sm">
                      <span className="text-pink-gradient font-bold">릴스 댓글</span>과{' '}
                      <span className="text-pink-gradient font-bold">현장 사연</span>으로 진행되는{' '}
                      <span className="text-pink-gradient font-bold">일일호프 라디오</span>
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-pink-gradient mb-1">빼빼로 테마 게임</h5>
                    <p className="text-sm">
                      <span className="text-pink-gradient font-bold">빼빼로</span>를 이용한 다양한{' '}
                      <span className="text-pink-gradient font-bold">미니게임</span>과 상품이 있는
                      게임
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 빼빼로 이미지 */}
        <div className="mb-8">
          <div className="rounded-3xl overflow-hidden">
            <Image
              src="/pepero.png"
              alt="빼빼로 이미지"
              width={640}
              height={360}
              className="w-full h-auto object-cover"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
