import { useEffect, useState } from "react";
import { getEvents, type EventData } from "../services/eventService";

// 전체 이벤트 데이터를 불러오는 훅
export const useEvents = () => {
  const [events, setEvents] = useState<EventData[]>([]); // 이벤트 리스트 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<unknown>(null); // 에러 상태

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getEvents(); // API 호출
        setEvents(data); // 데이터 저장
      } catch (err) {
        setError(err); // 에러 저장
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchData(); // 컴포넌트 첫 렌더 시 자동 호출
  }, []);

  return { events, loading, error, setEvents };
};