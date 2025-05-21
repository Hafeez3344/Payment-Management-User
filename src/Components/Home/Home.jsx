import { Button, DatePicker, Space, Modal, Input, message, Form, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fn_getCardDataByStatus,
  fn_getAllTransactionApi,
  fn_getAllMerchantApi,
} from "../../api/api";
import { FaIndianRupeeSign } from "react-icons/fa6";

const Home = ({ authorization, showSidebar }) => {
  const navigate = useNavigate();
  const { RangePicker } = DatePicker;
  const [error, setError] = useState("");
  const totalHeight = window.innerHeight - 366;
  const [loading, setLoading] = useState(true);
  const [totalTrns, setTotalTrns] = useState(0);
  const containerHeight = window.innerHeight - 120;
  const [adminCharges, setAdminCharges] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [totalTransaction, setTotalTransactions] = useState(0);
  const [declineTransactions, setDeclineTransactions] = useState(0);
  const [merchantAvailBalance, setMerchantAvailBalance] = useState(0);
  const [verifiedTransactions, setVerifiedTransactions] = useState(0);
  const [unverifiedTransactions, setUnverifiedTransactions] = useState(0);
  const [cardData, setCardData] = useState({
    approved: {},
    pending: {},
    failed: {},
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [createPaymentModalOpen, setCreatePaymentModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Define static transaction objects for the static rows
  const staticTransactions = [
    {
      trnNo: "TRN1001",
      createdAt: "2024-02-01T09:15:00",
      bankId: {
        accountType: "bank",
        accountNo: "1234567890",
        ifsc: "HDFC0001234",
      },
      total: 8500,
      status: "Pending",
    },
    {
      trnNo: "TRN1002",
      createdAt: "2024-02-01T10:00:00",
      bankId: {
        accountType: "upi",
        accountHolderName: "Amit Kumar",
        iban: "amit@upi",
      },
      total: 4200,
      status: "Pending",
    },
  ];

  useEffect(() => {
    window.scroll(0, 0);
    if (!authorization) {
      navigate("/login");
    }
    fetchAllData();
  }, [authorization, navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [approvedData, pendingData, declineData, totalData, merchantData] =
        await Promise.all([
          fn_getCardDataByStatus("Approved", activeFilter, dateRange),
          fn_getCardDataByStatus("Pending", activeFilter, dateRange),
          fn_getCardDataByStatus("Decline", activeFilter, dateRange),
          fn_getAllTransactionApi(),
          fn_getAllMerchantApi(null, 1, null, null, null, null, dateRange),
        ]);
      setVerifiedTransactions(approvedData?.data?.data || 0);
      setAdminCharges(approvedData?.data?.adminTotalSum || 0);
      setTotalTrns(approvedData?.data?.totalTransaction || 0);
      setUnverifiedTransactions(pendingData?.data?.data || 0);
      setDeclineTransactions(declineData?.data?.data || 0);
      setTotalTransactions(totalData?.data?.data || 0);
      setMerchantAvailBalance(approvedData?.data?.availableWithdraw || 0);
      setCardData({
        approved: approvedData?.data || {},
        pending: pendingData?.data || {},
        failed: declineData?.data || {},
      });
      if (merchantData?.status && merchantData?.data?.data) {
        setRecentTransactions(merchantData.data.data.slice(0, 10));
      } else {
        setRecentTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch dashboard data");
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorization) {
      fetchAllData();
    }
  }, [dateRange]);

  const resetFilters = () => {
    setDateRange([null, null]);
    setActiveFilter("all");
    fetchAllData();
  };

  const handleFilterClick = async (filterType) => {
    setLoading(true);
    setActiveFilter(filterType);
    setDateRange([null, null]);
    try {
      const [approvedData, pendingData, declineData, totalData, merchantData] =
        await Promise.all([
          fn_getCardDataByStatus("Approved", filterType, null),
          fn_getCardDataByStatus("Pending", filterType, null),
          fn_getCardDataByStatus("Decline", filterType, null),
          fn_getAllTransactionApi(),
          fn_getAllMerchantApi(null, 1, null, null, null, null, null),
        ]);
      setVerifiedTransactions(approvedData?.data?.data || 0);
      setAdminCharges(approvedData?.data?.adminTotalSum || 0);
      setTotalTrns(approvedData?.data?.totalTransaction || 0);
      setUnverifiedTransactions(pendingData?.data?.data || 0);
      setDeclineTransactions(declineData?.data?.data || 0);
      setTotalTransactions(totalData?.data?.data || 0);
      setMerchantAvailBalance(approvedData?.data?.availableWithdraw || 0);
      setCardData({
        approved: approvedData?.data || {},
        pending: pendingData?.data || {},
        failed: declineData?.data || {},
      });
      if (merchantData?.status && merchantData?.data?.data) {
        setRecentTransactions(merchantData.data.data.slice(0, 10));
      } else {
        setRecentTransactions([]);
      }
    } catch (err) {
      console.error("Error fetching filtered data:", err);
      setError("Failed to fetch filtered data");
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Create Payment Modal handlers
  const openCreatePaymentModal = () => {
    setCreatePaymentModalOpen(true);
  };
  const closeCreatePaymentModal = () => {
    setCreatePaymentModalOpen(false);
    form.resetFields();
  };
  const handleCreatePayment = (values) => {
    message.success("Payment created (demo only)");
    closeCreatePaymentModal();
  };

  return (
    <div
      className={`bg-gray-100 transition-all duration-500 ${
        showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
      }`}
      style={{ minHeight: `${containerHeight}px` }}
    >
      <div className="p-7">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-5">
          <h1 className="text-[25px] font-[500]">Payment Management User</h1>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2 text-[12px]">
              <button
                onClick={() => handleFilterClick("all")}
                className={`$${activeFilter === "all" ? "text-white bg-[#0864E8]" : "text-black"} border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                ALL
              </button>
              <button
                onClick={() => handleFilterClick("today")}
                className={`$${activeFilter === "today" ? "text-white bg-[#0864E8]" : "text-black"} border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                TODAY
              </button>
              <button
                onClick={() => handleFilterClick("7days")}
                className={`$${activeFilter === "7days" ? "text-white bg-[#0864E8]" : "text-black"} border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                7 DAYS
              </button>
              <button
                onClick={() => handleFilterClick("30days")}
                className={`$${activeFilter === "30days" ? "text-white bg-[#0864E8]" : "text-black"} border w-[70px] sm:w-[70px] p-1.5 rounded`}
              >
                30 DAYS
              </button>
            </div>
            {/* Date Range Picker */}
            <Space direction="vertical" size={10}>
              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (!dates) {
                    resetFilters();
                  } else {
                    setDateRange(dates);
                    setActiveFilter("custom");
                  }
                }}
                className="bg-gray-100"
              />
            </Space>
          </div>
        </div>

        {/* Boxes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-7 text-nowrap">
          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(245, 118, 0, 1), rgba(255, 196, 44, 1))",
            }}
          >
            <h2 className="text-[13px] uppercase font-[500]">
              Pending Transactions
            </h2>
            <p className="mt-[13px] text-[20px] font-[700]">
              ₹ {Number(unverifiedTransactions).toFixed(2)}
            </p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Pending Transactions: {" "}
              <span className="font-[700]">
                {cardData.pending.totalTransaction || 0}
              </span>
            </p>
          </div>
          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(0, 150, 102, 1), rgba(59, 221, 169, 1))",
            }}
          >
            <h2 className="text-[13px] uppercase font-[500]">
              Approved Transactions
            </h2>
            <p className="mt-[13px] text-[20px] font-[700]">
              ₹ {Number(merchantAvailBalance).toFixed(2)}
            </p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Approved Transactions: {" "}
              <span className="font-[700]">
                ₹ {Number(verifiedTransactions).toFixed(2) || 0}
              </span>
            </p>
          </div>

          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255, 61, 92, 1), rgba(255, 122, 143, 1))",
            }}
          >
            <h2 className="text-[13px] uppercase font-[500]">
              Rejected Transactions
            </h2>
            <p className="mt-[13px] text-[20px] font-[700]">
              ₹ {Number(declineTransactions).toFixed(2)}
            </p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Rejected Transactions: {" "}
              <span className="font-[700]">
                {cardData.failed.totalTransaction || 0}
              </span>
            </p>
          </div>
          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148, 0, 211, 1), rgba(186, 85, 211, 1))",
            }}
          >
            <h2 className="text-[13px] uppercase font-[500]">in progress</h2>
            <p className="mt-[13px] text-[20px] font-[700]">
              ₹ {Number(adminCharges).toFixed(2)}
            </p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Processing Transactions: {" "}
              <span className="font-[700]">{totalTrns}</span>
            </p>
          </div>
        </div>

        {/* Transaction Table Section */}
        <div className="bg-white rounded-lg p-4">
          <div className="flex flex-col md:flex-row items-center justify-between pb-3">
            <div className="flex justify-between items-center w-full">
              <p className="text-black font-[500] text-[24px] mr-2">
                All Transactions
              </p>
              <Button
                type="primary"
                className="bg-[#0864E8] hover:bg-[#0056b3] text-white font-[500] text-[13px] cursor-pointer border-none"
                onClick={openCreatePaymentModal}
              >
                Create Payment
              </Button>
            </div>
          </div>
          <div className="w-full border-t-[1px] border-[#DDDDDD80] hidden sm:block mb-4"></div>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                  <th className="p-4 text-nowrap">TRN-ID</th>
                  <th className="p-4">DATE</th>
                  <th className="p-4 text-nowrap">ACCOUNT NAME</th>
                  <th className="p-4 text-nowrap">{`IFSC / UPI`}</th>
                  <th className="p-4 text-nowrap">AMOUNT</th>
                  <th className="p-4 text- pl-16">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {/* Static Data Example Rows */}
                {staticTransactions.map((trx, idx) => (
                  <tr className="text-gray-800 text-sm border-b" key={trx.trnNo}>
                    <td className="p-4 text-[13px] font-[600] text-[#000000B2]">
                      {trx.trnNo}
                    </td>
                    <td className="p-4 text-[13px] font-[600] text-[#000000B2] whitespace-nowrap">
                      {new Date(trx.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                      {trx.bankId.accountType === "bank"
                        ? trx.bankId.accountNo
                        : trx.bankId.accountType === "upi"
                        ? trx.bankId.accountHolderName
                        : "-"}
                    </td>
                    <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                      {trx.bankId.accountType === "bank"
                        ? trx.bankId.ifsc
                        : trx.bankId.accountType === "upi"
                        ? trx.bankId.iban
                        : "-"}
                    </td>
                    <td className="p-4 text-[13px] font-[700] text-[#000000B2]">
                      <FaIndianRupeeSign className="inline-block mt-[-1px]" /> {trx.total}
                    </td>
                    <td className="p-4 text-[13px] font-[500]">
                      <span
                        className={`px-2  py-1 rounded-[20px] text-nowrap text-[11px] font-[600] min-w-20 flex items-center justify-center ${
                          trx.status === "Approved"
                            ? "bg-[#10CB0026] text-[#0DA000]"
                            : trx.status === "Pending"
                            ? "bg-[#FFC70126] text-[#FFB800]"
                            : "bg-[#FF7A8F33] text-[#FF002A]"
                        }`}
                      >
                        {trx.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {/* Dynamic Data */}
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : recentTransactions.length > 0 ? (
                  recentTransactions
                    .filter(
                      (trx) =>
                        trx.bankId &&
                        (trx.bankId.accountType === "bank" ||
                          trx.bankId.accountType === "upi")
                    )
                    .map((trx, idx) => (
                      <tr
                        key={trx._id || idx}
                        className="text-gray-800 text-sm border-b"
                      >
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2]">
                          {trx.trnNo}
                        </td>
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2] whitespace-nowrap">
                          {trx.createdAt
                            ? new Date(trx.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        {/* Account/Name */}
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          {trx.bankId.accountType === "bank"
                            ? trx.bankId.accountNo || "-"
                            : trx.bankId.accountType === "upi"
                            ? trx.bankId.accountHolderName || "-"
                            : "-"}
                        </td>
                        {/* IFSC/UPI */}
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          {trx.bankId.accountType === "bank"
                            ? trx.bankId.ifsc || "MOCKIFSC001"
                            : trx.bankId.accountType === "upi"
                            ? trx.bankId.iban || "-"
                            : "-"}
                        </td>
                        {/* Amount */}
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2]">
                          <FaIndianRupeeSign className="inline-block mt-[-1px]" /> {trx.total}
                        </td>
                        {/* Status */}
                        <td className="p-4 text-[13px] font-[500]">
                          <span
                            className={`px-2 py-1 rounded-[20px] text-nowrap text-[11px] font-[600] min-w-20 flex items-center justify-center ${
                              trx.status === "Approved"
                                ? "bg-[#10CB0026] text-[#0DA000]"
                                : trx.status === "Pending"
                                ? "bg-[#FFC70126] text-[#FFB800]"
                                : "bg-[#FF7A8F33] text-[#FF002A]"
                            }`}
                          >
                            {trx.status}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-4 text-gray-500">
                      No Transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Payment Modal */}
        <Modal
          open={createPaymentModalOpen}
          onCancel={closeCreatePaymentModal}
          footer={null}
          title={<p className="text-[20px] font-[700]">Create Payment</p>}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreatePayment}
            className="mt-4"
          >
            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: "Please enter amount" }]}
            >
              <Input prefix={<FaIndianRupeeSign />} placeholder="Enter amount" />
            </Form.Item>
            <Form.Item
              label="Account/Name"
              name="account"
              rules={[{ required: true, message: "Please enter account or name" }]}
            >
              <Input placeholder="Enter account number or name" />
            </Form.Item>
            <Form.Item
              label="Type"
              name="type"
              rules={[{ required: true, message: "Please select type" }]}
            >
              <Select placeholder="Select type">
                <Select.Option value="bank">Bank</Select.Option>
                <Select.Option value="upi">UPI</Select.Option>
              </Select>
            </Form.Item>
            {/* Conditional fields for IFSC or UPI Number */}
            <Form.Item shouldUpdate={(prev, curr) => prev.type !== curr.type} noStyle>
              {({ getFieldValue }) => {
                const type = getFieldValue('type');
                if (type === 'bank') {
                  return (
                    <Form.Item
                      label="IFSC"
                      name="ifsc"
                      rules={[{ required: true, message: "Please enter IFSC code" }]}
                    >
                      <Input placeholder="Enter IFSC code" />
                    </Form.Item>
                  );
                }
                if (type === 'upi') {
                  return (
                    <Form.Item
                      label="UPI Number"
                      name="upi"
                      rules={[{ required: true, message: "Please enter UPI number" }]}
                    >
                      <Input placeholder="Enter UPI number" />
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="bg-[#0864E8] hover:bg-[#0056b3] text-white font-[500] border-none w-full"
              >
                Create Payment
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Home;
