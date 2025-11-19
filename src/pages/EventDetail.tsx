import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  content: string;
  organizer: string;
  phone: string;
  website: string;
  fee: string;
}

const categoryImageMap: { [key: string]: string } = {
  대중음악: "pop-music",
  클래식: "classic",
  무용: "dance",
  뮤지컬: "musical",
  영화: "movie",
  개그쇼: "comedy",
  기타: "etc",
};

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<PerformanceEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchEventDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch("/events.csv");
        const buffer = await response.arrayBuffer();

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
          transformHeader: (header: string) =>
            header.replace(/_\d+$/, "").trim(),
          complete: (results) => {
            const itemIndex = parseInt(id || "0");
            const item = results.data[itemIndex] as any;

            if (item) {
              const content =
                item["행사내용"] || item["내용"] || item["설명"] || "";
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
                클래식: [
                  "클래식",
                  "오케스트라",
                  "심포니",
                  "실내악",
                  "독주회",
                  "협주곡",
                ],
                무용: ["무용", "댄스", "발레", "현대무용", "한국무용", "춤"],
                뮤지컬: ["뮤지컬", "오페라", "음악극"],
                영화: ["영화", "상영", "시네마", "필름"],
                개그쇼: ["개그", "코미디", "개그쇼", "토크쇼"],
                기타: [],
              };

              let category = "기타";
              const lowerContent = content.toLowerCase();
              for (const [cat, keywords] of Object.entries(categoryKeywords)) {
                if (cat === "기타") continue;
                for (const keyword of keywords) {
                  if (lowerContent.includes(keyword.toLowerCase())) {
                    category = cat;
                    break;
                  }
                }
                if (category !== "기타") break;
              }

              const imageName = categoryImageMap[category] || "etc";

              setEvent({
                seq: id || "0",
                title: item["행사명"] || item["공연명"] || "",
                startDate: item["행사시작일자"] || item["공연시작일"] || "",
                endDate: item["행사종료일자"] || item["공연종료일"] || "",
                place: item["개최장소"] || item["공연장소"] || "",
                realmName: item["문화행사구분명"] || "",
                area: item["소재지도로명주소"] || item["소재지지번주소"] || "",
                thumbnail: `/category/${imageName}.svg`,
                gpsX: item["경도"] || "",
                gpsY: item["위도"] || "",
                category: category,
                content: content,
                organizer: item["주최기관"] || item["주관기관"] || "",
                phone: item["전화번호"] || "",
                website: item["홈페이지주소"] || item["URL"] || "",
                fee: item["이용요금"] || item["관람료"] || "무료",
              });
            }
            setLoading(false);
          },
        });
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        toast.error("데이터를 불러오는데 실패했습니다.");
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [id]);

  const isUpcoming = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const cleaned = dateStr.replace(/[^0-9]/g, "");
    if (cleaned.length === 8) {
      const year = parseInt(cleaned.substring(0, 4));
      const month = parseInt(cleaned.substring(4, 6)) - 1;
      const day = parseInt(cleaned.substring(6, 8));
      const eventDate = new Date(year, month, day);
      return eventDate >= new Date();
    }
    return false;
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const cleaned = dateStr.replace(/[^0-9]/g, "");
    if (cleaned.length === 8) {
      return `${cleaned.substring(0, 4)}.${cleaned.substring(
        4,
        6
      )}.${cleaned.substring(6, 8)}`;
    }
    return dateStr;
  };

  const handleAddToCalendar = () => {
    if (!selectedDate) {
      toast.error("날짜를 선택해주세요.");
      return;
    }
    toast.success("일정이 추가되었습니다!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[rgba(56,176,0,0.1)]">
        <p className="text-xl text-[#38b000]">로딩 중...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[rgba(56,176,0,0.1)]">
        <p className="text-xl text-[#888888]">행사 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-white to-[rgba(56,176,0,0.1)] overflow-x-hidden">
      {/* 배경 나무 이미지 */}
      <div className="fixed bottom-[-180px] left-0 right-0 z-0 pointer-events-none">
        <img
          src="/background_tree.png"
          alt=""
          className="w-full h-auto object-cover object-bottom"
        />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between px-10 py-8 bg-white/80 backdrop-blur-sm">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-[#38b000] hover:text-[#2d8c00] transition-colors"
        >
          <span className="text-2xl">←</span>
          <img src="/logo.png" alt="EVENTREE" className="h-12" />
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 max-w-6xl mx-auto px-10 py-12">
        <div className="bg-white rounded-[20px] shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* 왼쪽: 이미지 */}
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-[3/4] bg-gradient-to-br from-white to-gray-50 rounded-[10px] border border-[#888888]/50 flex items-center justify-center p-8">
                <img
                  src={event.thumbnail}
                  alt={event.category}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="inline-block px-4 py-2 bg-[#38b000]/10 text-[#38b000] text-sm rounded-full text-center">
                {event.category}
              </div>
            </div>

            {/* 오른쪽: 상세 정보 */}
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold text-[#222222] mb-4">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2 text-[#888888] mb-2">
                  <span className="text-xl">📍</span>
                  <span>{event.place}</span>
                </div>
                {event.area && (
                  <div className="flex items-center gap-2 text-[#888888] text-sm mb-4">
                    <span className="ml-7">{event.area}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid gap-4">
                  {(event.startDate || event.endDate) && (
                    <div>
                      <p className="text-sm text-[#888888] mb-1">행사 기간</p>
                      <p className="text-lg text-[#222222]">
                        {formatDate(event.startDate)} ~{" "}
                        {formatDate(event.endDate)}
                      </p>
                    </div>
                  )}

                  {event.organizer && (
                    <div>
                      <p className="text-sm text-[#888888] mb-1">주최/주관</p>
                      <p className="text-lg text-[#222222]">
                        {event.organizer}
                      </p>
                    </div>
                  )}

                  {event.fee && event.fee !== "무료" && (
                    <div>
                      <p className="text-sm text-[#888888] mb-1">이용 요금</p>
                      <p className="text-lg text-[#222222]">{event.fee}</p>
                    </div>
                  )}

                  {event.phone && (
                    <div>
                      <p className="text-sm text-[#888888] mb-1">문의 전화</p>
                      <p className="text-lg text-[#222222]">{event.phone}</p>
                    </div>
                  )}

                  {event.website && (
                    <div>
                      <p className="text-sm text-[#888888] mb-1">홈페이지</p>
                      <a
                        href={event.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg text-[#38b000] hover:underline"
                      >
                        바로가기
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* 날짜 선택 및 추가 버튼 (미래 행사인 경우) */}
              {isUpcoming(event.startDate) && (
                <div className="border-t border-gray-200 pt-6 mt-auto">
                  <p className="text-sm text-[#888888] mb-3">일정에 추가하기</p>
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={event.startDate.replace(
                        /(\d{4})(\d{2})(\d{2})/,
                        "$1-$2-$3"
                      )}
                      max={event.endDate.replace(
                        /(\d{4})(\d{2})(\d{2})/,
                        "$1-$2-$3"
                      )}
                      className="flex-1 px-4 py-3 border border-[#888888] rounded-lg focus:outline-none focus:border-[#38b000]"
                    />
                    <button
                      onClick={handleAddToCalendar}
                      className="px-6 py-3 bg-[#38b000] text-white rounded-lg font-semibold hover:bg-[#2d8c00] transition-colors"
                    >
                      추가하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 행사 내용 */}
          {event.content && (
            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#222222] mb-4">
                행사 소개
              </h2>
              <p className="text-[#444444] leading-relaxed whitespace-pre-wrap">
                {event.content}
              </p>
            </div>
          )}

          {/* 위치 정보 */}
          {event.gpsX && event.gpsY && (
            <div className="border-t border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-[#222222] mb-4">위치</h2>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <p className="text-[#888888]">
                  좌표: {event.gpsY}, {event.gpsX}
                </p>
                <p className="text-sm text-[#888888] mt-2">
                  지도 기능은 추후 추가 예정입니다.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
