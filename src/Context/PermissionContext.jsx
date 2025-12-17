import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axiosInstance from "../Api/axiosConfig";
import API_BASE_URL from "../constants";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ✅ Helper to fetch user permissions from new ACL API
  const fetchPermissions = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/admin/acl/my-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const permissionData = response.data.permissions || [];
        setPermissions(permissionData);
        localStorage.setItem("user_permissions", JSON.stringify(permissionData));
      }
    } catch (error) {
      console.error("Permission fetch failed:", error);
      
      // Try to load from localStorage as fallback
      const cachedPermissions = localStorage.getItem("user_permissions");
      if (cachedPermissions) {
        try {
          setPermissions(JSON.parse(cachedPermissions));
        } catch (parseError) {
          console.error("Failed to parse cached permissions:", parseError);
          setPermissions([]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Load permissions (from cache or API)
  useEffect(() => {
    const cachedPermissions = localStorage.getItem("user_permissions");
    if (cachedPermissions) {
      try {
        setPermissions(JSON.parse(cachedPermissions));
        setLoading(false);
      } catch (error) {
        console.error("Failed to parse cached permissions:", error);
        fetchPermissions();
      }
    } else {
      fetchPermissions();
    }
  }, [fetchPermissions]);

  // ✅ Helper function to check permission by SystemName
  const hasPermission = useCallback(
    (systemName) => {
      if (!Array.isArray(permissions)) return false;
      return permissions.includes(systemName);
    },
    [permissions]
  );

  // ✅ Helper function to check if user has ANY of the specified permissions
  const hasAnyPermission = useCallback(
    (systemNames) => {
      if (!Array.isArray(permissions) || !Array.isArray(systemNames)) return false;
      return systemNames.some((systemName) => permissions.includes(systemName));
    },
    [permissions]
  );

  // ✅ Helper function to check if user has ALL of the specified permissions
  const hasAllPermissions = useCallback(
    (systemNames) => {
      if (!Array.isArray(permissions) || !Array.isArray(systemNames)) return false;
      return systemNames.every((systemName) => permissions.includes(systemName));
    },
    [permissions]
  );

  // ✅ Context value (shared globally)
  const value = {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
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
