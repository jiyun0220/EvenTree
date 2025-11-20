import { useState } from "react";
import { addEvent, getEvents } from "../services/eventService"; // 기존 API + 전체 이벤트 가져오기

export const useAddEvent = () => {
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [error, setError] = useState<unknown>(null); // 에러 상태

  const add = async (title: string, date: string) => {
    setLoading(true); // 로딩 시작
    try {
      const events = await getEvents(); // 기존 이벤트 모두 가져오기
      const duplicate = events.find(
        (e) => e.title === title && e.date === date // 이름과 날짜가 모두 같은 이벤트 있는지 확인
      );

      if (duplicate) {
        throw new Error("이미 같은 날짜와 이름의 일정이 존재합니다."); // 중복 시 에러
      }

      const id = await addEvent(title, date); // 중복 없으면 이벤트 추가
      return id; // 생성된 문서 ID 반환
    } catch (err) {
      setError(err); // 에러 상태 저장
      throw err; // 호출한 쪽에서 처리 가능
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return { add, loading, error };
};