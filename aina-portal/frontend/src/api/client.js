import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 alındığında refresh token ile bir kez yenilemeyi dener.
let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    const refresh = localStorage.getItem("refresh");
    if (error.response?.status === 401 && refresh && !original._retry && !original.url.includes("/auth/")) {
      original._retry = true;
      try {
        refreshing ??= axios.post("/api/auth/refresh/", { refresh });
        const { data } = await refreshing;
        localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      } finally {
        refreshing = null;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
