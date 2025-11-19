import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION_NAME = "events";

export interface EventData {
  id?: string;
  title: string;
  date: string;
  createdAt?: Date;
}

/**
 * Create - 행사 등록
 * @param title 행사명
 * @param date 날짜 (YYYY-MM-DD)
 */
export const addEvent = async (
  title: string,
  date: string
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      title,
      date,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding event: ", error);
    throw error;
  }
};

/**
 * Read - 캘린더 조회
 * 날짜순으로 정렬하여 가져옵니다.
 */
export const getEvents = async (): Promise<EventData[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);

    const events: EventData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title,
        date: data.date,
        createdAt: data.createdAt?.toDate(),
      });
    });

    return events;
  } catch (error) {
    console.error("Error getting events: ", error);
    throw error;
  }
};

/**
 * Update - 행사 날짜 수정
 * @param id 문서 ID
 * @param newDate 변경할 날짜
 */
export const updateEventDate = async (
  id: string,
  newDate: string
): Promise<void> => {
  try {
    const eventRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(eventRef, {
      date: newDate,
    });
  } catch (error) {
    console.error("Error updating event: ", error);
    throw error;
  }
};

/**
 * Delete - 일정 삭제
 * @param id 문서 ID
 */
export const deleteEvent = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error("Error deleting event: ", error);
    throw error;
  }
};
