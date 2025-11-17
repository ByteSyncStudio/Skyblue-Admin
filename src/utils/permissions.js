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
 * 
 * For parent items with children:
 * - If parent has requiredPermissions array, check if user has ANY of those permissions
 * - Show parent only if at least one child is visible after filtering
 * 
 * For child items:
 * - requiredPermission: Check single permission
 * - requiredPermissions + requireAll: true: User must have ALL permissions
 * - requiredPermissions + requireAll: false/undefined: User needs ANY permission
 * 
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
        
        // Check parent's permission requirements
        // If parent has requiredPermissions array, check if user has ANY of them
        if (item.requiredPermissions && Array.isArray(item.requiredPermissions)) {
          const hasParentAccess = hasAnyPermission(userPermissions, item.requiredPermissions);
          if (!hasParentAccess) {
            return null;
          }
        }
        
        return {
          ...item,
          children: filteredChildren,
        };
      }
      
      // If no permission required, show it
      if (!item.requiredPermission && !item.requiredPermissions) {
        return item;
      }
      
      // Handle requiredPermissions array (for items that need multiple permissions)
      if (item.requiredPermissions && Array.isArray(item.requiredPermissions)) {
        // If requireAll flag is set, user must have ALL permissions
        if (item.requireAll) {
          const hasAccess = hasAllPermissions(userPermissions, item.requiredPermissions);
          return hasAccess ? item : null;
        }
        // Otherwise, user needs ANY of the permissions
        const hasAccess = hasAnyPermission(userPermissions, item.requiredPermissions);
        return hasAccess ? item : null;
      }
      
      // Check if user has the required permission (single permission)
      const hasAccess = hasPermission(userPermissions, item.requiredPermission);
      
      // Only return item if user has access
      return hasAccess ? item : null;
    })
    .filter(Boolean); // Remove null items
};
