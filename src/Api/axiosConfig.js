// src/api/axiosConfig.js
import axios from "axios";
import { message } from "antd";
import API_BASE_URL from "../constants";

// Create an Axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// A function to clear all interceptors
const clearInterceptors = () => {
  axiosInstance.interceptors.request.handlers = [];
  axiosInstance.interceptors.response.handlers = [];
};

// A function to add the interceptor
export const setupInterceptors = (token) => {
  clearInterceptors(); // Clear existing interceptors

  axiosInstance.interceptors.request.use(
    (config) => {
      // If token is available, set the Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle permission errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data } = error.response;

        // Handle 403 Permission Denied
        if (status === 403) {
          // Verbose logging for debugging
          console.group("🚫 Permission Denied");
          console.error("URL:", error.config?.url);
          console.error("Method:", error.config?.method?.toUpperCase());
          console.error("Message:", data.message);
          console.error("Required Permission:", data.requiredPermission || "Not specified");
          console.error("Error Code:", data.code);
          console.error("Full Response:", data);
          console.groupEnd();

          message.error({
            content: `🚫 Access Denied: ${data.message || "You don't have permission to perform this action"}`,
            duration: 5,
            style: {
              marginTop: "20vh",
              fontSize: "16px",
            },
            className: "permission-denied-toast",
          });
        }

        // Handle 401 Unauthorized
        else if (status === 401) {
          console.warn("⚠️ 401 Unauthorized - Session expired or invalid token");
          console.warn("URL:", error.config?.url);
          
          message.warning({
            content: "⚠️ Session expired. Please login again.",
            duration: 4,
            style: {
              marginTop: "20vh",
            },
          });
          localStorage.removeItem("token");
          localStorage.removeItem("user_permissions");
          window.location.href = "/login";
        }

        // Handle server errors
        else if (status >= 500) {
          console.error("❌ Server Error:", status);
          console.error("URL:", error.config?.url);
          console.error("Details:", data);
          
          message.error({
            content: "⚠️ Server error. Please try again later.",
            duration: 4,
          });
        }
      } else if (error.request) {
        // Network error
        console.error("📡 Network Error - No response received");
        console.error("URL:", error.config?.url);
        
        message.error({
          content: "📡 Network error. Please check your connection.",
          duration: 4,
        });
      }

      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
