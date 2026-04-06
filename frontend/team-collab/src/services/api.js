import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🌍 Detect environment automatically
const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5001/api"
    : "https://your-backend.onrender.com/api";

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 🔐 Attach token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 📣 Global response interceptor
API.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();

    if (method && ["post", "put", "patch", "delete"].includes(method)) {
      const msg = response.config.toastMessage || "Operation successful";
      toast.success(msg);
    }

    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    toast.error(message);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default API;