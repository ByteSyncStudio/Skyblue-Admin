import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axiosInstance from "../Api/axiosConfig";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ Helper to fetch user permissions
  const fetchPermissions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get("/admin/content-management/user-permission", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data || [];
      setPermissions(data);

      localStorage.setItem("user_permissions", JSON.stringify(data));
    } catch (error) {
      console.error("Permission fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Load permissions (from cache or API)
  useEffect(() => {
    const cachedPermissions = localStorage.getItem("user_permissions");
    if (cachedPermissions) {
      setPermissions(JSON.parse(cachedPermissions));
      setLoading(false);
    } else {
      fetchPermissions();
    }
  }, [fetchPermissions]);

  // ✅ Helper function to check permission by SystemName
  const hasPermission = useCallback(
    (systemName) => permissions.some((p) => p.SystemName === systemName),
    [permissions]
  );

  // ✅ Context value (shared globally)
  const value = {
    permissions,
    hasPermission,
    loading,
    refreshPermissions: fetchPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

/**
 * Custom hook for consuming the PermissionContext.
 */
export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};
