import axios from "axios";
import { toast } from "react-toastify"; // added for toast messages
import "react-toastify/dist/ReactToastify.css";

const API = axios.create({
  baseURL: "http://localhost:5001/api",
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

// 📣 Global response interceptor for success/error toasts
API.interceptors.response.use(
  (response) => {
    // only notify for mutating methods
    const method = response.config.method?.toLowerCase();
    if (method && ["post", "put", "patch", "delete"].includes(method)) {
      // allow callers to supply a custom message via config.toastMessage
      const msg = response.config.toastMessage || "Operation successful";
      toast.success(msg);
    }

    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";
    toast.error(message);
    return Promise.reject(error);
  }
);

export default API;
