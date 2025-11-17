import {
  FundProjectionScreenOutlined,
  ToolOutlined,
  PicRightOutlined,
  FileTextOutlined,
  BookOutlined,
  UserOutlined,
  DollarOutlined,
  ProductOutlined,
  CustomerServiceOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  PictureOutlined,
  TagOutlined,
  MailOutlined,
  NotificationOutlined,
  EditOutlined,
  SettingOutlined,
  DockerOutlined,
  CarOutlined,
  ClusterOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Menu } from "antd";

const routeItems = [
  {
    key: "1",
    icon: <FundProjectionScreenOutlined />,
    label: <Link to="/">Dashboard</Link>,
    requiredPermission: "AccessAdminPanel",
  },
  {
    key: "sub1", 
    icon: <ProductOutlined />,
    label: "Catalog",
    requiredPermissions: ["ManageProducts", "ManageCategories", "ManageManufacturers", "ManageAttributes"], // Show if user has ANY
    children: [ 
      {
        key: "2",
        icon: <ProductOutlined />,
        label: <Link to="/categories">Categories</Link>,
        requiredPermission: "ManageCategories",
      },
      {
        key: "3",
        icon: <CustomerServiceOutlined />,
        label: <Link to="/products">Products</Link>,
        requiredPermissions: ["ManageProducts", "ManageCategories", "ManageManufacturers", "ManageVendors"], // Needs ALL these permissions
        requireAll: true, // Must have ALL permissions (not just ANY)
      },
      {
        key: "4",
        icon: <ToolOutlined />,
        label: <Link to="/manufacturers">Manufacturers</Link>,
        requiredPermission: "ManageManufacturers",
      },
      {
        key: "5",
        icon: <PicRightOutlined />,
        label: <Link to="/inventory">Inventory</Link>,
        requiredPermission: "ManageProducts",
      },
      {
        key: "23",
        icon: <DockerOutlined />,
        label: <Link to="/product-attributes">Product Attributes</Link>,
        requiredPermission: "ManageAttributes",
      }
    ],
  },
 
  {
    key: "sub6", 
    icon: <ShopOutlined />,
    label: "Vendor Orders",
    requiredPermissions: ["ManageVendors"],
    children: [ 
      {
        key: "6",
        icon: <ShopOutlined />,
        label: <Link to="/vendors">Vendors</Link>,
        requiredPermission: "ManageVendors",
      },
      {
        key: "20",
        icon: <EditOutlined />,
        label: <Link to="/bulk-edit">Bulk Edit</Link>,
        requiredPermissions: ["ManageProducts", "ManageVendors", "ManageManufacturers", "ManageCategories"],
        requireAll: true, // Must have ALL permissions
      },
    ],
  },
  {
    key: "sub2",
    icon: <ShoppingCartOutlined />,
    label: "Sales",
    requiredPermissions: ["ManageOrders", "ManageCurrentCarts"],
    children: [
      {
        key: "7",
        icon: <ShopOutlined />,
        label: <Link to="/orders">Orders</Link>,
        requiredPermission: "ManageOrders",
      },
      {
        key: "8",
        icon: <ShoppingCartOutlined />,
        label: <Link to="/current-carts">Current Carts</Link>,
        requiredPermission: "ManageCurrentCarts",
      },
      {
        key: "9",
        icon: <StarOutlined />,
        label: <Link to="/best-seller">Best Seller</Link>,
        requiredPermission: "AccessAdminPanel",
      },
    ],
  },
  {
    key: "sub3",
    icon: <UserOutlined />,
    label: "Customers",
    requiredPermissions: ["ManageCustomers"],
    children: [
      {
        key: "10",
        icon: <UserOutlined />,
        label: <Link to="/customer">Customers</Link>,
        requiredPermission: "ManageCustomers",
      },
      {
        key: "11",
        icon: <UserOutlined />,
        label: <Link to="/customer-roles">Customer Roles</Link>,
        requiredPermission: "ManageCustomers",
      },

      {
        key: "12",
        icon: <UserOutlined />,
        label: <Link to="/customer-report">Customer Reports</Link>,
        requiredPermission: "ManageCustomers",
      },
      {
        key: "13",
        icon: <UserOutlined />,
        label: <Link to="/customer-approval">Approval</Link>,
        requiredPermission: "ManageCustomers",
      },
    ],
  },
  {
    key: "sub4",
    icon: <TagOutlined />,
    label: "Promotions",
    requiredPermissions: ["ManageDiscounts", "ManageCampaigns"],
    children: [
      {
        key: "14",
        icon: <DollarOutlined />,
        label: <Link to="/discounts">Discounts</Link>,
        requiredPermission: "ManageDiscounts",
      },
      {
        key: "15",
        icon: <MailOutlined />,
        label: <Link to="/campaign">Campaign</Link>,
        requiredPermission: "ManageCampaigns",
      },
      {
        key: "16",
        icon: <BookOutlined />,
        label: <Link to="/flyer">Flyer</Link>,
        requiredPermission: "ManageCampaigns",
      },
      {
        key: "17",
        icon: <FileTextOutlined />,
        label: <Link to="/order-sheet">OrderSheet</Link>,
        requiredPermission: "ManageCampaigns",
      },
    ],
  },
  {
    key: "sub5",
    icon: <PictureOutlined />,
    label: "Content Management",
    requiredPermissions: ["ManageWidgets"],
    children: [
      {
        key: "18",
        icon: <NotificationOutlined />,
        label: <Link to="/notice">Notice</Link>,
        requiredPermission: "ManageWidgets",
      },
      {
        key: "19",
        icon: <PictureOutlined />,
        label: <Link to="/banners">Banners</Link>,
        requiredPermission: "ManageWidgets",
      },
    ],
  },
  {
    key: "sub7",
    icon: <SettingOutlined />,
    label: "Configuration",
    requiredPermissions: ["ManageShippingSettings", "ManageACL"],
    children: [
      {
        key: "21",
        icon: <CarOutlined />,
        label: <Link to="/shipping-methods">Shipping Methods</Link>,
        requiredPermission: "ManageShippingSettings",
      },
      {
        key: "22",
        icon: <ClusterOutlined />,
        label: <Link to="/access-control-list">Access Control List</Link>,
        requiredPermission: "ManageACL",
      },
    ],
  },
];

export default routeItems;
