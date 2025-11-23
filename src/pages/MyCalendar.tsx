import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, ko } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../calendar.css";
import { useTranslation } from "react-i18next";
import type { Formats } from "react-big-calendar";
import { useEvents } from "../hooks/useEvents";
import type { EventData } from "../services/eventService";

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
  
  // 다국어 지원
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const changeLanguage = (lng: "en" | "ko") => {
    i18n.changeLanguage(lng);
  };

  const { events, loading, error, setEvents } = useEvents();

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [view, setView] = useState<View>("month");
  const locales = { "en-US": enUS, "ko-KR": ko };
  
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales,
  });
  
  const customFormats: Formats = {
    weekdayFormat: (date: Date, culture?: string) => {
      const weekdays = [
        t("sun"),
        t("mon"),
        t("tue"),
        t("wed"),
        t("thu"),
        t("fri"),
        t("sat"),
      ];
      return weekdays[date.getDay()];
    },
    monthHeaderFormat: (date: Date, culture?: string) => {
      return t(`${date.getMonth() + 1}`);
    },
  };
  
  const calendarEvents = useMemo(() => {
    return events.map((event) => {
      const dateTime = new Date(event.date); // time 없음 → 날짜만 사용
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
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* 배경 그라데이션 */}
      <div className="fixed left-[-200px] top-[-200px] h-[538px] w-[692px] opacity-70 pointer-events-none z-[1]">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-200 to-green-300 blur-3xl" />
      </div>

      <div className="fixed right-[-100px] bottom-[-100px] h-[538px] w-[692px] opacity-70 pointer-events-none z-[1]">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-green-200 to-green-300 blur-3xl" />
      </div>

      {/* 헤더 */}
      <header className="fixed top-0 left-0 w-full z-100 flex items-center border-b border-[#888888]/30 bg-white px-10 py-4">
        <img
          src="/logo.png"
          alt="EvenTree Logo"
          className="h-[40px] object-contain"
          onClick={() => navigate("/")}
        />
        <div className="flex items-center gap-4 ml-auto">
          {/* 언어 전환 버튼 */}
          <button
            onClick={() => {
              changeLanguage(i18n.language === "ko" ? "en" : "ko");
            }}
            className="flex items-center gap-2 px-4 py-2 border border-[#888888] rounded-lg hover:border-[#38b000] hover:bg-[#f0fdf4] transition-colors"
            aria-label="언어 전환"
          >
            <span className="text-sm font-medium text-[#444444]">
              {i18n.language === "ko" ? "KO" : "EN"}{" "}
            </span>
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
      <main className="relative z-10 px-10 mx-30 auto py-30 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#222222] mb-2">
            {t("myCalendar")}
          </h1>
          <p className="text-[#888888]">{t("calendarDescription")}</p>
        </div>

        {/* 일정이 없는 경우 */}
        {events.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mb-4 text-6xl">📅</div>
            <p className="text-xl text-[#888888] mb-2">{t("noSavedEvent")}</p>
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
              className="p-6 mb-6 bg-white shadow-lg rounded-xl"
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
                  next: t("next"),
                  previous: t("before"),
                  today: t("today"),
                  month: t("month"),
                  week: t("week"),
                  day: t("day"),
                  agenda: t("schedule"),
                  date: t("date"),
                  time: t("time"),
                  event: t("evnet"),
                  noEventsInRange: t("noEventsInRange"),
                  showMore: (total) => `+${total} ${t("more")}`,
                }}
                formats={customFormats}
              />
            </div>

            {/* 카테고리 범례 */}
            <div className="p-6 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-bold text-[#222222] mb-4">
                {t("category")}
              </h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(categoryColors).map(([category, color]) => (
                  <div key={category} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm text-[#444444]">
                      {t(category)}
                    </span>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={handleCloseModal}
        >
          <div
            className="w-full max-w-md p-8 mx-4 bg-white shadow-2xl rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="px-3 py-1 text-xs font-semibold text-white rounded-full"
                    style={{
                      backgroundColor:
                        categoryColors[selectedEvent.category] ||
                        categoryColors["기타"],
                    }}
                  >
                    {t(selectedEvent.category || "기타")}
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
                    className="flex-1 px-4 py-2 font-semibold text-red-500 transition-colors bg-white border border-red-500 rounded-lg hover:bg-red-500 hover:text-white"
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
