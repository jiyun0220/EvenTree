import { useState } from 'react';

// 임시 이미지 데이터 (실제로는 공공 API에서 가져올 예정)
const eventData = [
  {
    id: 1,
    title: '신지윤 마술사의 세상에서 가장 재미있는 마술쇼',
    image: 'https://via.placeholder.com/200x250/cccccc/666666?text=Magic+Show',
    category: '클래식',
  },
  {
    id: 2,
    title: '2022 신년음악회<A New Year Concert>',
    image: 'https://via.placeholder.com/200x250/cccccc/666666?text=Concert',
    category: '대중음악',
  },
  {
    id: 3,
    title: '[문화가 있는 날-키즈브런치] 아카펠라그룹 제니스와 함께하는 목소리상자',
    image: 'https://via.placeholder.com/200x250/cccccc/666666?text=Acapella',
    category: '대중음악',
  },
  {
    id: 4,
    title: '[문화가 있는 날] 남경주와 함께하는 올댓스테이지 - 뮤지컬',
    image: 'https://via.placeholder.com/200x250/cccccc/666666?text=Musical',
    category: '뮤지컬',
  },
  {
    id: 5,
    title: '봉오동전투',
    image: 'https://via.placeholder.com/200x250/cccccc/666666?text=Movie',
    category: '영화',
  },
];

const categories = ['클래식', '대중음악', '뮤지컬', '영화', '개그쇼', '무용'];

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['클래식', '대중음악']);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const filteredEvents = eventData.filter((event) =>
    selectedCategories.length === 0 || selectedCategories.includes(event.category)
  );

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-white to-[rgba(56,176,0,0.1)]">
      {/* 배경 장식 이미지들 */}
      <div className="absolute left-[-111px] top-[625px] h-[538px] w-[692px] opacity-50 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl" />
      </div>
      <div className="absolute left-[419px] top-[719px] h-[538px] w-[692px] opacity-30 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl" />
      </div>
      <div className="absolute left-[930px] top-[556px] h-[538px] w-[692px] opacity-70 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center border-b border-[#888888]/30 bg-white px-10 py-4">
        <div className="flex items-center gap-2">
          <div className="h-[75px] w-[75px] flex items-center justify-center text-5xl">
            🌳
          </div>
          <h1 className="font-['Itim'] text-[32px] text-[#222222]">EvenTree</h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2 rounded-full border border-[#888888] bg-white px-4 py-2 w-[615px]">
          <input
            type="text"
            placeholder="보고싶은 방송을 찾아보세요!"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm outline-none"
          />
          <span className="text-[#888888] text-xl">🔍</span>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 px-10 py-8">
        {/* 카테고리 필터 */}
        <div className="flex gap-5 mb-12">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`rounded-full border px-4 py-2 text-xl font-semibold transition-all ${
                  isSelected
                    ? 'border-[#38b000] bg-[rgba(56,176,0,0.1)] text-[#38b000]'
                    : 'border-[#888888] bg-white text-[#888888] hover:border-[#38b000] hover:text-[#38b000]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 이벤트 카드 목록 */}
        <div className="flex gap-[30px] overflow-x-auto pb-4">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className={`flex shrink-0 flex-col gap-[30px] rounded-[10px] border p-[30px] transition-all hover:shadow-lg ${
                index === 0
                  ? 'border-[#38b000] bg-white'
                  : 'border-[#888888] bg-white hover:border-[#38b000]'
              }`}
            >
              <div className="h-[250px] w-[200px] overflow-hidden rounded-[10px] border border-[#888888]/50">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="w-[200px] text-[20px] text-[#222222] line-clamp-2">
                {event.title}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
