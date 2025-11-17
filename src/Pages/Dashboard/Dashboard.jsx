import { useEffect, useState } from "react";
import axiosInstance from "../../Api/axiosConfig";
import useRetryRequest from "../../Api/useRetryRequest";
import { Content, Header } from "antd/es/layout/layout";
import { Breadcrumb, Card, Col, Row } from "antd";
import CustomLayout from "../../Components/Layout/Layout";
import DashBoardStats from "./DashBoardStats";
import OrderCharts from "./Orders/OrdersCharts";
import Chart from "./Orders/Chart";
import NewCustomers from "./Customers/NewCustomers";
import LatestOrders from "./Customers/LatestOrders";
import BestSellerByAmount from "./BestSeller/BestSellerByAmount";
import BestSellerByQuantity from "./BestSeller/BestSellerByQuantity";
import Loader from "../../Components/Loader/Loader";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    registeredCustomers: 0,
    totalOrders: 0,
    newOrders: 0,
  });

  const [orderStats, setOrderStats] = useState({
    today: 0,
    week: 0,
    month: 0,
    year: 0,
    allTime: 0,
  });

  const [orderChart, setMonthlyOrder] = useState([]);
  const [orderChartState, setOrderChartState] = useState("year");

  const [newCustomers, setNewCustomers] = useState([]);
  const [newCustomersState, setNewCustomersState] = useState("year");

  const [orders, setOrders] = useState([]);
  const [bestSellerByQuantity, setBestSellerByQuantity] = useState([]);
  const [bestSellerByAmount, setBestSellerByAmount] = useState([]);

  const retryRequest = useRetryRequest();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch all data, but handle individual failures gracefully
        const results = await Promise.allSettled([
          retryRequest(() => axiosInstance.get("/admin/stats")),
          retryRequest(() => axiosInstance.get("/admin/orderStats")),
          retryRequest(() => axiosInstance.get(`/admin/all-orders?size=20`)),
          retryRequest(() => axiosInstance.get("/admin/bestSellerByQuantity")),
          retryRequest(() => axiosInstance.get("/admin/bestSellerByAmount")),
        ]);

        // Process stats if successful
        if (results[0].status === "fulfilled") {
          setDashboardStats(results[0].value.data);
        } else {
          console.warn("Failed to load dashboard stats:", results[0].reason);
        }

        // Process order stats if successful
        if (results[1].status === "fulfilled") {
          setOrderStats(results[1].value.data.data);
        } else {
          console.warn("Failed to load order stats:", results[1].reason);
        }

        // Process orders if successful
        if (results[2].status === "fulfilled") {
          const data = results[2].value.data.data.map((order) => ({
            key: order.Id,
            id: order.Id,
            orderStatus: order.OrderStatusId,
            orderNo: order.Id,
            customer: order.CustomerEmail,
            createdOn: new Date(order.CreatedonUtc).toLocaleString("en-US", {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            }),
            orderTotal: "$" + order.OrderTotal.toFixed(2),
          }));
          setOrders(data);
        } else {
          console.warn("Failed to load orders:", results[2].reason);
        }

        // Process best sellers by quantity if successful
        if (results[3].status === "fulfilled") {
          setBestSellerByQuantity(results[3].value.data);
        } else {
          console.warn("Failed to load best sellers by quantity:", results[3].reason);
        }

        // Process best sellers by amount if successful
        if (results[4].status === "fulfilled") {
          setBestSellerByAmount(results[4].value.data);
        } else {
          console.warn("Failed to load best sellers by amount:", results[4].reason);
        }
      } catch (error) {
        console.error("Unexpected error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [retryRequest]);

  useEffect(() => {
    const fetchOrderChart = async (state) => {
      try {
        const response = await retryRequest(() =>
          axiosInstance.get(`/admin/past-orders?period=${state}`)
        );
        const orderChartData = response.data
          .map((item) => ({
            day: item.month || item.date,
            Orders: item.orders,
          }))

        setMonthlyOrder(orderChartData);
      } catch (error) {
        console.warn("Failed to load order chart data:", error);
        // Don't show error message to user, just log it
        // The chart will show empty state
      }
    };

    fetchOrderChart(orderChartState);
  }, [orderChartState, retryRequest]);

  useEffect(() => {
    const fetchNewCustomer = async (state) => {
      try {
        const response = await retryRequest(() =>
          axiosInstance.get(`/admin/monthly-customers?period=${state}`)
        );
        const newCustomersData = response.data.map((item) => ({
          day: item.month || item.date,
          Customers: item.customers,
        }));
        setNewCustomers(newCustomersData);
      } catch (error) {
        console.warn("Failed to load new customers data:", error);
        // Don't show error message to user, just log it
        // The chart will show empty state
      }
    };

    fetchNewCustomer(newCustomersState);
  }, [newCustomersState, retryRequest]);

  return (
    <>
      <Loader isActive={isLoading} />
      <CustomLayout pageTitle="Dashboard" menuKey="1">
        <Header style={{ background: "#87CEEB", padding: 0 }}>
          <div
            className="logo"
            style={{ color: "black", fontSize: "20px", marginLeft: "20px" }}
          >
            Welcome Admin
          </div>
        </Header>
        <Content>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          </Breadcrumb>

          {/* Dashboard stats */}

          <DashBoardStats data={dashboardStats} />

          {/* Orders stats */}
          <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
            <Col xs={24} md={12}>
              <Chart title="Orders" datakey="Orders" orderTotalData={orderChart} state={orderChartState} setState={setOrderChartState} />
            </Col>
            <Col xs={24} md={12}>
              <Chart title="New Customers" datakey="Customers" orderTotalData={newCustomers} state={newCustomersState} setState={setNewCustomersState}/>
            </Col>
          </Row>

          <OrderCharts charts={orderStats} />

          <Card
            title="Latest Order"
            bordered={true}
            style={{ marginTop: "20px" }}
          >
            <LatestOrders orders={orders} />
          </Card>

          <Row gutter={[16, 16]} style={{ marginTop: "20px" }}>
            <Col xs={24} sm={12}>
              <BestSellerByQuantity data={bestSellerByQuantity} />
            </Col>
            <Col xs={24} sm={12}>
              <BestSellerByAmount data={bestSellerByAmount} />
            </Col>
          </Row>
        </Content>
      </CustomLayout>
    </>
  );
};

export default Dashboard;
