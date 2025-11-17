import { useContext, useCallback } from "react";
import { AuthContext } from "../Context/AuthContext/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "./axiosConfig";

// Custom hook for retry logic
const useRetryRequest = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Retry logic helper function
  const retryRequest = useCallback(async (axiosCall, retries = 3) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await axiosCall();
        return response;
      } catch (error) {
        if (error.response) {
          // 403 Permission Denied - don't logout, let axiosConfig show toast
          if (error.response.status === 403) {
            console.warn(`Permission denied: ${error.response.status}`);
            throw error; // Throw error but don't logout
          }
          // 401 Unauthorized - handled by axiosConfig, will logout there
          if (error.response.status === 401) {
            throw error; // Let axiosConfig handle logout
          }
          // 404 or 500 - navigate to error page
          if (error.response.status === 404 || error.response.status === 500) {
            navigate('/500');
            console.error(`Server error: ${error.response.status}`);
            throw new Error(`Server error: ${error.response.status}`);
          }
        }
        attempt++;
        if (attempt >= retries) {
          console.error(`Failed after ${retries} attempts`);
          throw error; // Don't logout on retry failure
        }
        console.warn(`Retrying request, attempt: ${attempt}`);
      }
    }
  }, [logout, navigate]);

  return retryRequest;
};

export default useRetryRequest;
