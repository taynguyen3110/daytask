import axios from "axios";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7234/api";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage instead of using a hook
    const auth = localStorage.getItem("auth");
    if (auth) {
      const { token } = JSON.parse(auth);
      if (token?.accessToken) {
        config.headers.Authorization = `Bearer ${token.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
