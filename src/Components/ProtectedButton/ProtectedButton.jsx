import React from "react";
import { Button, Tooltip } from "antd";
import { usePermissions } from "../../Context/PermissionContext";

/**
 * Button that disables itself if user lacks permission
 * @param {string} permission - Single permission to check
 * @param {string[]} anyPermission - Array of permissions (user needs at least one)
 * @param {string[]} allPermissions - Array of permissions (user needs all)
 * @param {string} tooltipTitle - Tooltip message when disabled
 * @param {object} buttonProps - All other button props
 */
export const ProtectedButton = ({
  permission,
  anyPermission,
  allPermissions,
  children,
  tooltipTitle = "You don't have permission to perform this action",
  ...buttonProps
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions();

  let isAllowed = true;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (anyPermission) {
    isAllowed = hasAnyPermission(anyPermission);
  } else if (allPermissions) {
    isAllowed = hasAllPermissions(allPermissions);
  }

  if (!isAllowed) {
    return (
      <Tooltip title={tooltipTitle}>
        <Button {...buttonProps} disabled loading={loading}>
          {children}
        </Button>
      </Tooltip>
    );
  }

  return <Button {...buttonProps}>{children}</Button>;
};

export default ProtectedButton;
