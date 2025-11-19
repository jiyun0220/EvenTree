import axios from "axios";

// 공공데이터 API 기본 설정
// TODO: 실제 사용할 공공데이터 API의 serviceKey를 .env 파일에 추가하세요
const publicDataApi = axios.create({
  baseURL: "https://apis.data.go.kr", // 기본 URL (실제 API에 맞게 수정)
  timeout: 10000,
  params: {
    serviceKey: import.meta.env.VITE_PUBLIC_DATA_API_KEY,
  },
});

// 요청 인터셉터
publicDataApi.interceptors.request.use(
  (config) => {
    // 요청 전 처리
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
publicDataApi.interceptors.response.use(
  (response) => {
    // 응답 데이터 처리
    return response;
  },
  (error) => {
    // 에러 처리
    return Promise.reject(error);
  }
);

export default publicDataApi;
