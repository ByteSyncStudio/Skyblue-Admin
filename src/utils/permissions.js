/**
 * Permission Helper for Admin Panel
 * Utility functions for permission checking and filtering
 */

/**
 * Check if user has a specific permission
 * @param {Array} userPermissions - Array of user's permission objects with SystemName
 * @param {string} permissionName - Permission system name to check
 * @returns {boolean}
 */
export const hasPermission = (userPermissions, permissionName) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return userPermissions.some((p) => p.SystemName === permissionName);
};

/**
 * Check if user has ALL of the specified permissions
 * @param {Array} userPermissions - Array of user's permission objects
 * @param {string[]} requiredPermissions - Permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return requiredPermissions.every((permission) =>
    userPermissions.some((p) => p.SystemName === permission)
  );
};

/**
 * Check if user has ANY of the specified permissions
 * @param {Array} userPermissions - Array of user's permission objects
 * @param {string[]} requiredPermissions - Permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  return requiredPermissions.some((permission) =>
    userPermissions.some((p) => p.SystemName === permission)
  );
};

/**
 * Filter menu items based on user permissions
 * Recursively filters menu items and their children
 * @param {Array} menuItems - Original menu structure
 * @param {Array} userPermissions - User's permissions
 * @returns {Array} Filtered menu items
 */
export const filterMenuByPermissions = (menuItems, userPermissions) => {
  if (!menuItems || !Array.isArray(menuItems)) return [];
  
  return menuItems
    .map((item) => {
      // If item has children, filter them recursively
      if (item.children && Array.isArray(item.children)) {
        const filteredChildren = filterMenuByPermissions(
          item.children,
          userPermissions
        );
        
        // If no children passed the filter, hide parent too
        if (filteredChildren.length === 0) {
          return null;
        }
        
        return {
          ...item,
          children: filteredChildren,
        };
      }
      
      // If no permission required, show it
      if (!item.requiredPermission) {
        return item;
      }
      
      // Check if user has the required permission
      const hasAccess = hasPermission(userPermissions, item.requiredPermission);
      
      // Only return item if user has access
      return hasAccess ? item : null;
    })
    .filter(Boolean); // Remove null items
};
