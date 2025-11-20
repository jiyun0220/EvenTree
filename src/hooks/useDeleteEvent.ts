import { useState } from "react";
import { deleteEvent } from "../services/eventService";

// 이벤트를 삭제하는 훅
export const useDeleteEvent = () => {
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<unknown>(null); // 에러 상태

  const remove = async (id: string) => {
    // 삭제 함수
    setLoading(true); // 로딩 시작
    try {
      await deleteEvent(id); // API 호출
    } catch (err) {
      setError(err); // 에러 저장
      throw err;
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return { remove, loading, error };
};