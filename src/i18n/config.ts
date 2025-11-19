import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// 번역 리소스
const resources = {
  ko: {
    translation: {
      // 공통
      loading: "로딩 중...",
      error: "오류가 발생했습니다",
      success: "성공했습니다",

      // 네비게이션
      home: "홈",
      about: "소개",
      contact: "연락처",

      // TODO: 실제 사용할 번역 키를 추가하세요
    },
  },
  en: {
    translation: {
      // Common
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",

      // Navigation
      home: "Home",
      about: "About",
      contact: "Contact",

      // TODO: Add actual translation keys
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ko", // 기본 언어
  fallbackLng: "ko",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
