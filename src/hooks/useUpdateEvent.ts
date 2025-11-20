import { useState } from "react";
import { updateEventDate } from "../services/eventService";

// 이벤트 날짜를 업데이트하는 훅
export const useUpdateEvent = () => {
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<unknown>(null); // 에러 상태

  const update = async (id: string, newDate: string) => {
    // 업데이트 함수
    setLoading(true); // 로딩 시작
    try {
      await updateEventDate(id, newDate); // API 호출
    } catch (err) {
      setError(err); // 에러 저장
      throw err;
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return { update, loading, error };
};