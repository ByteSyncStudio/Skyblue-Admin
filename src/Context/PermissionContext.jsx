import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axiosInstance from "../Api/axiosConfig";
import API_BASE_URL from "../constants";
import { AuthContext } from "./AuthContext/AuthContext";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  // ✅ Helper to fetch user permissions from new ACL API
  const fetchPermissions = useCallback(async () => {
    const authToken = token || localStorage.getItem("token");
    
    if (!authToken) {
      setLoading(false);
      setPermissions([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/admin/acl/my-permissions`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        // Use permissionsDetail which has the full object structure with SystemName
        const permissionData = response.data.permissionsDetail || [];
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

  // ✅ Load permissions on mount and when token changes
  useEffect(() => {
    const authToken = token || localStorage.getItem("token");
    const cachedPermissions = localStorage.getItem("user_permissions");
    
    // If we have cached permissions, load them immediately for fast UI render
    if (cachedPermissions && authToken) {
      try {
        setPermissions(JSON.parse(cachedPermissions));
        setLoading(false);
      } catch (error) {
        console.error("Failed to parse cached permissions:", error);
      }
    }
    
    // Always fetch fresh permissions if we have a token
    if (authToken) {
      fetchPermissions();
    } else {
      setLoading(false);
      setPermissions([]);
    }
  }, [token, fetchPermissions]);

  // ✅ Helper function to check permission by SystemName
  const hasPermission = useCallback(
    (systemName) => {
      if (!Array.isArray(permissions)) return false;
      return permissions.some((p) => p.SystemName === systemName);
    },
    [permissions]
  );

  // ✅ Helper function to check if user has ANY of the specified permissions
  const hasAnyPermission = useCallback(
    (systemNames) => {
      if (!Array.isArray(permissions) || !Array.isArray(systemNames)) return false;
      return systemNames.some((systemName) =>
        permissions.some((p) => p.SystemName === systemName)
      );
    },
    [permissions]
  );

  // ✅ Helper function to check if user has ALL of the specified permissions
  const hasAllPermissions = useCallback(
    (systemNames) => {
      if (!Array.isArray(permissions) || !Array.isArray(systemNames)) return false;
      return systemNames.every((systemName) =>
        permissions.some((p) => p.SystemName === systemName)
      );
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
