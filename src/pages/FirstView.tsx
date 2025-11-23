import { useNavigate } from 'react-router-dom';

export default function FirstView() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-white to-[rgba(56,176,0,0.1)] flex flex-col items-center justify-center overflow-hidden">
      {/* 나무 이미지 */}
      <div className="flex-1 flex items-center justify-center">
        <img 
          src="/background_tree.png" 
          alt="Tree" 
          className="w-[300px] h-auto object-contain"
        />
      </div>

      {/* 시작하기 버튼 */}
      <div className="pb-20">
        <button
          onClick={() => navigate('/home')}
          className="px-12 py-4 bg-[#38B000] text-white text-xl font-bold rounded-full hover:bg-[#2d8c00] transition-colors shadow-lg"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
