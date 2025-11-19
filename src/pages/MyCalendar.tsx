import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../calendar.css";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  place: string;
  category: string;
  start?: Date;
  end?: Date;
}

export default function MyCalendar() {
  const navigate = useNavigate();

  // 더미 데이터 (추후 서버 연결 시 제거)
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: "1",
      title: "2024 방탄소년단 콘서트",
      date: "2024-12-25",
      time: "19:00",
      place: "서울 올림픽공원",
      category: "대중음악",
    },
    {
      id: "2",
      title: "신년 음악회",
      date: "2025-01-01",
      time: "15:00",
      place: "예술의전당 콘서트홀",
      category: "클래식",
    },
    {
      id: "3",
      title: "뮤지컬 오페라의 유령",
      date: "2025-02-14",
      time: "18:00",
      place: "샤롯데씨어터",
      category: "뮤지컬",
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [view, setView] = useState<View>("month");

  // date-fns localizer 설정
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: ko }),
    getDay,
    locales: { ko },
  });

  // 캘린더 이벤트 형식으로 변환
  const calendarEvents = useMemo(() => {
    return events.map((event) => {
      const dateTime = event.time
        ? new Date(`${event.date}T${event.time}`)
        : new Date(event.date);
      return {
        ...event,
        start: dateTime,
        end: new Date(dateTime.getTime() + 2 * 60 * 60 * 1000), // 2시간 후
        resource: event,
      };
    });
  }, [events]);

  // 카테고리별 색상
  const categoryColors: { [key: string]: string } = {
    대중음악: "#9333ea",
    클래식: "#3b82f6",
    무용: "#ec4899",
    뮤지컬: "#eab308",
    영화: "#ef4444",
    개그쇼: "#22c55e",
    기타: "#6b7280",
  };

  // 이벤트 클릭 핸들러
  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event.resource);
  }, []);

  // 이벤트 스타일
  const eventStyleGetter = useCallback(
    (event: any) => {
      const color =
        categoryColors[event.resource.category] || categoryColors["기타"];
      return {
        style: {
          backgroundColor: color,
          borderRadius: "5px",
          opacity: 0.8,
          color: "white",
          border: "0px",
          display: "block",
        },
      };
    },
    [categoryColors]
  );

  // 날짜 포맷팅
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekdays[date.getDay()];
    return `${year}.${month}.${day} (${weekday})`;
  };

  // 수정 모드 시작
  const handleEditStart = () => {
    if (!selectedEvent) return;
    setEditingId(selectedEvent.id);
    setEditDate(selectedEvent.date);
    setEditTime(selectedEvent.time || "");
  };

  // 수정 저장
  const handleEditSave = () => {
    if (!editingId) return;
    // TODO: 서버 API 호출
    setEvents(
      events.map((event) =>
        event.id === editingId
          ? { ...event, date: editDate, time: editTime }
          : event
      )
    );
    setEditingId(null);
    setSelectedEvent(null);
    toast.success("일정이 수정되었습니다");
  };

  // 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditDate("");
    setEditTime("");
  };

  // 삭제
  const handleDelete = () => {
    if (!selectedEvent) return;
    // TODO: 서버 API 호출
    setEvents(events.filter((event) => event.id !== selectedEvent.id));
    setSelectedEvent(null);
    toast.success("일정이 삭제되었습니다");
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setSelectedEvent(null);
    setEditingId(null);
    setEditDate("");
    setEditTime("");
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* 배경 그라데이션 */}
      <div className="fixed left-[-200px] top-[-200px] h-[538px] w-[692px] opacity-70 pointer-events-none z-[1]">
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl" />
      </div>

      <div className="fixed right-[-100px] bottom-[-100px] h-[538px] w-[692px] opacity-70 pointer-events-none z-[1]">
        <div className="w-full h-full bg-gradient-to-br from-green-200 to-green-300 rounded-full blur-3xl" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 flex items-center border-b border-[#888888]/30 bg-white px-10 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <span className="text-2xl">←</span>
          <img
            src="/logo.png"
            alt="EvenTree Logo"
            className="h-[40px] object-contain"
          />
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="relative z-10 max-w-7xl mx-auto px-10 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#222222] mb-2">내 캘린더</h1>
          <p className="text-[#888888]">
            저장한 일정을 확인하고 관리할 수 있습니다
          </p>
        </div>

        {/* 일정이 없는 경우 */}
        {events.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-xl text-[#888888] mb-2">
              저장된 일정이 없습니다
            </p>
            <p className="text-[#888888] mb-8">
              행사 상세 페이지에서 일정을 추가해보세요
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-[#38b000] text-white rounded-lg font-semibold hover:bg-[#2d8c00] transition-colors"
            >
              행사 둘러보기
            </button>
          </div>
        ) : (
          <>
            {/* 캘린더 */}
            <div
              className="bg-white rounded-xl shadow-lg p-6 mb-6"
              style={{ height: "700px" }}
            >
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                view={view}
                onView={setView}
                messages={{
                  next: "다음",
                  previous: "이전",
                  today: "오늘",
                  month: "월",
                  week: "주",
                  day: "일",
                  agenda: "일정",
                  date: "날짜",
                  time: "시간",
                  event: "이벤트",
                  noEventsInRange: "이 기간에는 일정이 없습니다.",
                  showMore: (total) => `+${total} 더보기`,
                }}
              />
            </div>

            {/* 카테고리 범례 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-[#222222] mb-4">
                카테고리
              </h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(categoryColors).map(([category, color]) => (
                  <div key={category} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-[#444444]">{category}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* 이벤트 상세 모달 */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      backgroundColor:
                        categoryColors[selectedEvent.category] ||
                        categoryColors["기타"],
                    }}
                  >
                    {selectedEvent.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-[#222222]">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#888888] hover:text-[#222222] text-2xl"
              >
                ×
              </button>
            </div>

            {editingId === selectedEvent.id ? (
              // 수정 모드
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#888888] mb-1">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full px-4 py-2 border border-[#888888] rounded-lg focus:outline-none focus:border-[#38b000]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#888888] mb-1">
                    시간
                  </label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full px-4 py-2 border border-[#888888] rounded-lg focus:outline-none focus:border-[#38b000]"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleEditSave}
                    className="flex-1 px-4 py-2 bg-[#38b000] text-white rounded-lg font-semibold hover:bg-[#2d8c00] transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="flex-1 px-4 py-2 bg-[#888888] text-white rounded-lg font-semibold hover:bg-[#666666] transition-colors"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              // 일반 모드
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[#444444]">
                    <span className="text-xl">📅</span>
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#444444]">
                    <span className="text-xl">⏰</span>
                    <span>{selectedEvent.time || "시간 미정"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#444444]">
                    <span className="text-xl">📍</span>
                    <span>{selectedEvent.place}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleEditStart}
                    className="flex-1 px-4 py-2 bg-white border border-[#38b000] text-[#38b000] rounded-lg font-semibold hover:bg-[#38b000] hover:text-white transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-white border border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-500 hover:text-white transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
