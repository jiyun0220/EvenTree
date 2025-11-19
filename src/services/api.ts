import axios from "axios";

// 공공데이터 API 기본 설정 (프록시 사용)
const publicDataApi = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

// 요청 인터셉터
publicDataApi.interceptors.request.use(
  (config) => {
    // 요청 전 처리
    console.log("Axios Request Config:", {
      baseURL: config.baseURL,
      url: config.url,
      fullURL: `${config.baseURL}${config.url}`,
      params: config.params,
    });
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

// 공연/전시 정보 조회
export const getPerformanceList = async (params?: {
  pageNo?: number;
  numOfRows?: number;
  eventCode?: string;
}) => {
  try {
    const response = await publicDataApi.get(
      "/openapi/tn_pubr_public_pblprfr_event_info_api",
      {
        params: {
          serviceKey: import.meta.env.VITE_PUBLIC_DATA_API_KEY || "",
          pageNo: params?.pageNo || 1,
          numOfRows: params?.numOfRows || 10,
          type: "json",
          eventCode: params?.eventCode || "",
        },
      }
    );
    console.log("Raw API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("API 호출 오류:", error);
    throw error;
  }
};

export default publicDataApi;
