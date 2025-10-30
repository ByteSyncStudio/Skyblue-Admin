import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext/AuthContext";
import { usePermissions } from "../../Context/PermissionContext";
import { Result, Button, Spin } from "antd";

const ProtectedRoute = ({
  element: Element,
  permission,
  anyPermission,
  allPermissions,
  ...rest
}) => {
  const { token } = useContext(AuthContext);
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions();
  const isAuthenticated = token || localStorage.getItem("token");

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If still loading permissions, show loading state
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" tip="Loading permissions..." />
      </div>
    );
  }

  // Check permissions if required
  let isAllowed = true;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (anyPermission) {
    isAllowed = hasAnyPermission(anyPermission);
  } else if (allPermissions) {
    isAllowed = hasAllPermissions(allPermissions);
  }

  // If user doesn't have permission, show 403 page
  if (!isAllowed) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#f0f2f5",
        }}
      >
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have permission to access this page."
          extra={
            <Button type="primary" onClick={() => window.history.back()}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  // User is authenticated and has permission
  return <Element {...rest} />;
};

export default ProtectedRoute;
