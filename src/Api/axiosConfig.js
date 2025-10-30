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
          message.error({
            content: `⛔ ${data.message || "You don't have permission to perform this action"}`,
            duration: 4,
            style: {
              marginTop: "20vh",
            },
          });
        }

        // Handle 401 Unauthorized
        else if (status === 401) {
          message.error("Session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("user_permissions");
          window.location.href = "/login";
        }

        // Handle server errors
        else if (status >= 500) {
          message.error("Server error. Please try again later.");
        }
      } else if (error.request) {
        // Network error
        message.error("Network error. Please check your connection.");
      }

      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
