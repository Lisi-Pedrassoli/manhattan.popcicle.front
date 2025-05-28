import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosHeaders } from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = new AxiosHeaders({
      ...config.headers,
      Authorization: `Bearer ${token}`
    });
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      console.error("Erro de conexão:", error);
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = `/login`;

    }
    return Promise.reject(error);
  }
);
export default api;