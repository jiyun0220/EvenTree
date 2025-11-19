import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import toast, { Toaster } from "react-hot-toast";

interface PerformanceEvent {
  seq: string;
  title: string;
  startDate: string;
  endDate: string;
  place: string;
  realmName: string;
  area: string;
  thumbnail: string;
  gpsX: string;
  gpsY: string;
  category: string;
}

const categories = [
  "전체",
  "대중음악",
  "클래식",
  "무용",
  "뮤지컬",
  "영화",
  "개그쇼",
  "기타",
];

// 카테고리 매칭 키워드
const categoryKeywords: { [key: string]: string[] } = {
  대중음악: [
    "대중음악",
    "콘서트",
    "밴드",
    "가요",
    "힙합",
    "재즈",
    "록",
    "팝",
    "인디",
  ],
  클래식: ["클래식", "오케스트라", "심포니", "실내악", "독주회", "협주곡"],
  무용: ["무용", "댄스", "발레", "현대무용", "한국무용", "춤"],
  뮤지컬: ["뮤지컬", "오페라", "음악극"],
  영화: ["영화", "상영", "시네마", "필름"],
  개그쇼: ["개그", "코미디", "개그쇼", "토크쇼"],
  기타: [],
};

// 행사내용으로 카테고리 판별
const getCategoryFromContent = (content: string): string => {
  const lowerContent = content.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (category === "기타") continue;
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }

  return "기타";
};

// 카테고리 한글-영문 매핑
const categoryImageMap: { [key: string]: string } = {
  대중음악: "pop-music",
  클래식: "classic",
  무용: "dance",
  뮤지컬: "musical",
  영화: "movie",
  개그쇼: "comedy",
  기타: "etc",
};

// 카테고리별 이미지 경로
const getCategoryImage = (category: string): string => {
  const imageName = categoryImageMap[category] || "etc";
  return `/category/${imageName}.svg`;
};

export default function Home() {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "전체",
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allEvents, setAllEvents] = useState<PerformanceEvent[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<PerformanceEvent[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  // 날짜 파싱 함수
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    // YYYY-MM-DD 또는 YYYYMMDD 형식 지원
    const cleaned = dateStr.replace(/[^0-9]/g, "");
    if (cleaned.length === 8) {
      const year = parseInt(cleaned.substring(0, 4));
      const month = parseInt(cleaned.substring(4, 6)) - 1;
      const day = parseInt(cleaned.substring(6, 8));
      return new Date(year, month, day);
    }
    return null;
  };

  // 최근 1년 필터링
  const isWithinLastYear = (dateStr: string): boolean => {
    const date = parseDate(dateStr);
    if (!date) return false;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date >= oneYearAgo;
  };

  // CSV 데이터 가져오기
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch("/events.csv");
        const buffer = await response.arrayBuffer();

        // EUC-KR 디코딩 시도, 실패하면 UTF-8
        let csvText: string;
        try {
          const decoder = new TextDecoder("euc-kr");
          csvText = decoder.decode(buffer);
        } catch {
          const decoder = new TextDecoder("utf-8");
          csvText = decoder.decode(buffer);
        }

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string, _index: number) => {
            // 중복 헤더 제거 및 정규화
            return header.replace(/_\d+$/, "").trim();
          },
          complete: (results) => {
            console.log("CSV 파싱 결과 (처음 5개):", results.data.slice(0, 5));
            console.log("헤더:", results.meta.fields);

            const parsedEvents: PerformanceEvent[] = results.data
              .map((item: any, originalIndex: number) => {
                const title =
                  item["행사명"] || item["공연명"] || item["title"] || "";
                const startDate =
                  item["행사시작일자"] ||
                  item["공연시작일"] ||
                  item["startDate"] ||
                  "";

                if (!title || !isWithinLastYear(startDate)) {
                  return null;
                }

                const content =
                  item["행사내용"] ||
                  item["내용"] ||
                  item["설명"] ||
                  item["행사명"] ||
                  "";
                const category = getCategoryFromContent(content);

                return {
                  seq: String(originalIndex),
                  title:
                    item["행사명"] || item["공연명"] || item["title"] || "",
                  startDate:
                    item["행사시작일자"] ||
                    item["공연시작일"] ||
                    item["startDate"] ||
                    "",
                  endDate:
                    item["행사종료일자"] ||
                    item["공연종료일"] ||
                    item["endDate"] ||
                    "",
                  place:
                    item["개최장소"] || item["공연장소"] || item["place"] || "",
                  realmName: item["문화행사구분명"] || item["구분"] || "",
                  area:
                    item["소재지도로명주소"] ||
                    item["소재지지번주소"] ||
                    item["주소"] ||
                    "",
                  thumbnail: getCategoryImage(category),
                  gpsX: item["경도"] || item["longitude"] || "",
                  gpsY: item["위도"] || item["latitude"] || "",
                  category: category,
                };
              })
              .filter((item): item is PerformanceEvent => item !== null)
              .sort((a, b) => {
                // 최신순 정렬
                const dateA = parseDate(a.startDate);
                const dateB = parseDate(b.startDate);
                if (!dateA || !dateB) return 0;
                return dateB.getTime() - dateA.getTime();
              });

            console.log("필터링 및 정렬된 이벤트:", parsedEvents.length);
            console.log("샘플 이벤트:", parsedEvents.slice(0, 3));
            setAllEvents(parsedEvents);
            setDisplayedEvents(parsedEvents.slice(0, ITEMS_PER_PAGE));
            setPage(1);
            setHasMore(parsedEvents.length > ITEMS_PER_PAGE);

            if (parsedEvents.length > 0) {
              toast.success(
                `${parsedEvents.length}개의 공연 정보를 불러왔습니다!`
              );
            } else {
              toast.error("공연 정보가 없습니다.");
            }
          },
          error: (error: Error) => {
            console.error("CSV 파싱 오류:", error);
            throw error;
          },
        });
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        toast.error("데이터를 불러오는데 실패했습니다.");
        setAllEvents([]);
        setDisplayedEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 무한 스크롤 핸들러
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 500
      ) {
        if (!loading && hasMore) {
          loadMore();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page]);

  const loadMore = () => {
    const nextPage = page + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const filteredEvents = filterEvents(allEvents);
    const newEvents = filteredEvents.slice(startIndex, endIndex);

    if (newEvents.length > 0) {
      setDisplayedEvents((prev) => [...prev, ...newEvents]);
      setPage(nextPage);
      setHasMore(endIndex < filteredEvents.length);
    } else {
      setHasMore(false);
    }
  };

  // 카테고리 및 검색 필터링
  const filterEvents = (events: PerformanceEvent[]) => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.place.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.includes("전체") ||
        selectedCategories.some((cat) => event.category === cat);
      return matchesSearch && matchesCategory;
    });
  };

  // 카테고리나 검색어 변경 시 표시 이벤트 업데이트
  useEffect(() => {
    const filtered = filterEvents(allEvents);
    setDisplayedEvents(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [selectedCategories, searchQuery]);

  const toggleCategory = (category: string) => {
    if (category === "전체") {
      setSelectedCategories(["전체"]);
    } else {
      setSelectedCategories((prev) => {
        const filtered = prev.filter((c) => c !== "전체");
        return filtered.includes(category)
          ? filtered.filter((c) => c !== category)
          : [...filtered, category];
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-white to-[rgba(56,176,0,0.1)] overflow-x-hidden">
      {/* 배경 나무 이미지 - 가장 뒤 */}
      <div className="fixed bottom-[-180px] left-0 right-0 z-0 pointer-events-none">
        <img
          src="/background_tree.png"
          alt=""
          className="w-full h-auto object-cover object-bottom"
        />
      </div>

      {/* 배경 장식 이미지들 */}
      <div className="fixed left-[-111px] top-[625px] h-[538px] w-[692px] opacity-50 pointer-events-none z-[1]">
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl" />
      </div>
      <div className="fixed left-[419px] top-[719px] h-[538px] w-[692px] opacity-30 pointer-events-none z-[1]">
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl" />
      </div>
      <div className="fixed left-[930px] top-[556px] h-[538px] w-[692px] opacity-70 pointer-events-none z-[1]">
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center border-b border-[#888888]/30 bg-white px-10 py-4">
        <img
          src="/logo.png"
          alt="EvenTree Logo"
          className="h-[40px] object-contain"
        />

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full border border-[#888888] bg-white px-4 py-2 w-[615px]">
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm outline-none"
            />
            <span className="text-[#888888] text-xl">🔍</span>
          </div>
          <button
            onClick={() => {
              // TODO: 언어 전환 로직 추가
              toast.success("이소에 언어 전환 기능 추가해");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-[#888888] rounded-lg hover:border-[#38b000] hover:bg-[#f0fdf4] transition-colors"
            aria-label="언어 전환"
          >
            <span className="text-sm font-medium text-[#444444]">KO</span>
          </button>
          <button
            onClick={() => navigate("/calendar")}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-[#38b000] hover:bg-[#2d8c00] transition-colors"
            aria-label="내 캘린더"
          >
            <img src="/profile-icon.svg" alt="프로필" className="w-6 h-6" />
          </button>
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
                    ? "border-[#38b000] bg-[rgba(56,176,0,0.1)] text-[#38b000]"
                    : "border-[#888888] bg-white text-[#888888] hover:border-[#38b000] hover:text-[#38b000]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 이벤트 카드 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-4">
          {loading ? (
            <div className="col-span-full flex items-center justify-center w-full py-20">
              <p className="text-xl text-[#38b000]">로딩 중...</p>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="col-span-full flex items-center justify-center w-full py-20">
              <p className="text-xl text-[#888888]">공연 정보가 없습니다.</p>
            </div>
          ) : (
            displayedEvents.map((event: PerformanceEvent, index: number) => (
              <div
                key={event.seq}
                onClick={() => navigate(`/event/${event.seq}`)}
                className={`flex flex-col gap-[20px] rounded-[10px] border p-[20px] transition-all hover:shadow-lg cursor-pointer ${
                  index === 0
                    ? "border-[#38b000] bg-white"
                    : "border-[#888888] bg-white hover:border-[#38b000]"
                }`}
              >
                <div className="w-full aspect-[4/5] overflow-hidden rounded-[10px] border border-[#888888]/50 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center p-4">
                  {event.thumbnail ? (
                    <img
                      src={event.thumbnail}
                      alt={event.category}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🎭</div>
                        <div className="text-sm">No Image</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <div className="inline-block px-2 py-1 bg-[#38b000]/10 text-[#38b000] text-xs rounded-full mb-2">
                    {event.category}
                  </div>
                  <p className="text-[18px] text-[#222222] line-clamp-2 mb-2 font-medium">
                    {event.title}
                  </p>
                  <p className="text-sm text-[#888888] line-clamp-1">
                    {event.place}
                  </p>
                  <p className="text-xs text-[#888888] mt-1">
                    {event.startDate} ~ {event.endDate}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 무한 스크롤 로딩 인디케이터 */}
        {!loading && hasMore && (
          <div className="flex items-center justify-center w-full py-10">
            <p className="text-lg text-[#38b000]">더 보기...</p>
          </div>
        )}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
