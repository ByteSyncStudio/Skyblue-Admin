import React, { useState, useEffect } from "react";
import { Table, Typography, Spin, Row, Col, message, Checkbox } from "antd";
import axiosInstance from "../../../Api/axiosConfig";
import API_BASE_URL from "../../../constants";
import CustomLayout from "../../../Components/Layout/Layout";
import "./AccessControl.css";

const { Title } = Typography;

const AccessControl = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingCell, setUpdatingCell] = useState(null);

  useEffect(() => {
    fetchAclMatrix();
  }, []);

  const fetchAclMatrix = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${API_BASE_URL}/admin/acl/matrix`);
      
      if (response.data.success) {
        setRoles(response.data.roles || []);
        setPermissions(response.data.permissions || []);
      } else {
        message.error("Failed to fetch access control data");
      }
    } catch (error) {
      console.error("Error fetching access control data:", error);
      message.error("Error fetching access control data");
    } finally {
      setLoading(false);
    }
  };

  // Check if a permission is mapped to a role
  const isPermissionMapped = (permissionId, roleId) => {
    const permission = permissions.find((p) => p.permissionId === permissionId);
    return permission?.roles?.[roleId] || false;
  };

  // Handle checkbox toggle with API call
  const handleCheckboxChange = async (permissionId, roleId, currentValue) => {
    const cellKey = `${permissionId}-${roleId}`;
    setUpdatingCell(cellKey);

    try {
      const response = await axiosInstance.patch(
        `${API_BASE_URL}/admin/acl/toggle`,
        {
          permissionId,
          roleId,
        }
      );

      if (response.data.success) {
        // Optimistically update local state
        setPermissions((prevPermissions) =>
          prevPermissions.map((perm) => {
            if (perm.permissionId === permissionId) {
              return {
                ...perm,
                roles: {
                  ...perm.roles,
                  [roleId]: !currentValue,
                },
              };
            }
            return perm;
          })
        );

        // Show success message
        const action = response.data.action === "granted" ? "granted" : "revoked";
        message.success(`Permission ${action} successfully`);
      } else {
        message.error("Failed to update permission");
      }
    } catch (error) {
      console.error("Error updating permission:", error);
      message.error("Failed to update permission. Please try again.");
    } finally {
      setUpdatingCell(null);
    }
  };

  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    const category = perm.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(perm);
    return acc;
  }, {});

  // Create table columns
  const columns = [
    {
      title: "Permission Name",
      dataIndex: "permissionName",
      key: "permissionName",
      fixed: "left",
      width: 300,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    ...roles.map((role) => ({
      title: role.Name,
      dataIndex: `role_${role.Id}`,
      key: role.Id,
      width: 120,
      align: "center",
      render: (_, record) => {
        const cellKey = `${record.permissionId}-${role.Id}`;
        const isChecked = isPermissionMapped(record.permissionId, role.Id);
        const isUpdating = updatingCell === cellKey;

        return (
          <Checkbox
            checked={isChecked}
            disabled={isUpdating}
            onChange={() =>
              handleCheckboxChange(record.permissionId, role.Id, isChecked)
            }
          />
        );
      },
    })),
  ];

  // Prepare data source with category grouping
  const dataSource = [];
  Object.entries(permissionsByCategory).forEach(([category, perms]) => {
    // Add category header row
    dataSource.push({
      key: `category-${category}`,
      permissionName: category,
      isCategory: true,
    });
    
    // Add permission rows
    perms.forEach((permission) => {
      dataSource.push({
        key: permission.permissionId,
        permissionId: permission.permissionId,
        permissionName: permission.permissionName,
        isCategory: false,
      });
    });
  });

  return (
    <CustomLayout pageTitle="Access Control List" menuKey="22">
      <Title level={2} style={{ textAlign: "center", marginBottom: 20 }}>
        Access Control List
      </Title>
      <div style={{ padding: "20px" }}>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              bordered
              pagination={false}
              scroll={{ x: true }}
              rowClassName={(record) =>
                record.isCategory ? "acl-category-row" : ""
              }
              onRow={(record) => ({
                style: record.isCategory
                  ? {
                      backgroundColor: "#f5f5f5",
                      fontWeight: "bold",
                    }
                  : {},
              })}
            />
          </Col>
        </Row>
      </div>
    </CustomLayout>
  );
};

export default AccessControl;
