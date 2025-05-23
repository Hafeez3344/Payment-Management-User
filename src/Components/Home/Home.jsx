import {
  Button,
  DatePicker,
  Space,
  Modal,
  Input,
  message,
  Form,
  Select,
  Pagination,
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fn_createPaymentApi,
  fn_getUserPaymentApi,
  fn_getAllMerchantApi,
} from "../../api/api";
import { FaIndianRupeeSign } from "react-icons/fa6";
import Cookies from "js-cookie";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      // Use the user API to get only current user's payments
      const response = await fn_getUserPaymentApi();
      if (response?.status && response?.data) {
        const payments = Array.isArray(response.data) ? response.data : response.data.data || response.data.payments || [];
        const mapped = payments.map(payment => ({
          ...payment,
          bankId: {
            accountType: payment.transactionType,
            accountNo: payment.accountNumber,
            bankName: payment.bankName,
            ifsc: payment.ifsc,
            accountHolderName: payment.accountHolder,
            iban: payment.upi || "",
            upi: payment.upi || ""
          },
          total: payment.amount,
        }));
        // Sort by createdAt descending (latest first)
        mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTransactions(mapped);
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
      const response = await fn_getUserPaymentApi();
      if (response?.status && response?.data) {
        const payments = Array.isArray(response.data) ? response.data : response.data.data || response.data.payments || [];
        const mapped = payments.map(payment => ({
          ...payment,
          bankId: {
            accountType: payment.transactionType,
            accountNo: payment.accountNumber,
            bankName: payment.bankName,
            ifsc: payment.ifsc,
            accountHolderName: payment.accountHolder,
            iban: payment.upi || "",
            upi: payment.upi || ""
          },
          total: payment.amount,
        }));
        // Sort by createdAt descending (latest first)
        mapped.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentTransactions(mapped);
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
  const handleCreatePayment = async (values) => {
    try {
      setLoading(true);
      const userId = Cookies.get("userId");
      const { type, ...rest } = values;
      // For UPI, remove bankName, accountNumber, ifsc if present
      let payload = {
        ...rest,
        status: "Pending",
        transactionType: type,
        userId,
      };
      if (type === "upi") {
        delete payload.bankName;
        delete payload.accountNumber;
        delete payload.ifsc;
      }
      const response = await fn_createPaymentApi(payload);
      if (response.status) {
        message.success("Payment created successfully");
        closeCreatePaymentModal();
        fetchAllData();
      } else {
        message.error(response.message || "Failed to create payment");
      }
    } catch (err) {
      message.error("Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  const paginatedTransactions = recentTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
                className={`$${
                  activeFilter === "all"
                    ? "text-white bg-[#0864E8]"
                    : "text-black"
                } border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                ALL
              </button>
              <button
                onClick={() => handleFilterClick("today")}
                className={`$${
                  activeFilter === "today"
                    ? "text-white bg-[#0864E8]"
                    : "text-black"
                } border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                TODAY
              </button>
              <button
                onClick={() => handleFilterClick("7days")}
                className={`$${
                  activeFilter === "7days"
                    ? "text-white bg-[#0864E8]"
                    : "text-black"
                } border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                7 DAYS
              </button>
              <button
                onClick={() => handleFilterClick("30days")}
                className={`$${
                  activeFilter === "30days"
                    ? "text-white bg-[#0864E8]"
                    : "text-black"
                } border w-[70px] sm:w-[70px] p-1.5 rounded`}
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
                "linear-gradient(to right, rgba(0, 150, 102, 1), rgba(59, 221, 169, 1))",
            }}
          >
            <h2 className="text-[13px] uppercase font-[500]">
              Approved Payments
            </h2>
            <p className="mt-[13px] text-[20px] font-[700]">
              ₹ {Number(merchantAvailBalance).toFixed(2)}
            </p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Approved Payments:{" "}
              <span className="font-[700]">
                 {Number(verifiedTransactions) }
              </span>
            </p>
          </div>
          <div
            className="bg-white px-[14px] py-[10px] rounded-[5px] shadow text-white"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(245, 118, 0, 1), rgba(255, 196, 44, 1))",
            }}
          >
            <h2 className="text-[13px] uppercase font-[500]">
              Pending Payments
            </h2>
            <p className="mt-[13px] text-[20px] font-[700]">
              ₹ {Number(unverifiedTransactions).toFixed(2)}
            </p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Pending Payments:{" "}
              <span className="font-[700]">
                {cardData.pending.totalTransaction } <span>0</span>
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
              Rejected Payments
            </h2>
            <p className="mt-[13px] text-[20px] font-[700]">
              ₹ {Number(declineTransactions).toFixed(2)}
            </p>
            <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">
              No. of Rejected Payments:{" "}
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
              No. of Processing Payments:{" "}
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
                  <th className="p-4">Date</th>
                  <th className="p-4 text-nowrap">Account Holder Name</th>
                  <th className="p-4 text-nowrap">Bank Name</th>
                  <th className="p-4 text-nowrap">Account Number</th>
                  <th className="p-4 text-nowrap">{`IFSC / UPI ID`}</th>
                  <th className="p-4 text-nowrap">Amount</th>
                  <th className="p-4 text- pl-16">Status</th>
                </tr>
              </thead>
              <tbody>
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
                  paginatedTransactions
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
                          {trx.trnId}
                        </td>
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2] whitespace-nowrap">
                          {trx.createdAt
                            ? new Date(trx.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        {/* Account Holder Name */}
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          {trx.bankId.accountHolderName || "-"}
                        </td>
                        {/* Bank Name */}
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          {trx.bankId.accountType === "bank"
                            ? trx.bankId.bankName || "-"
                            : trx.bankId.accountType === "upi"
                            ? "UPI"
                            : "-"}
                        </td>
                        {/* Account Number */}
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          {trx.bankId.accountType === "bank"
                            ? trx.bankId.accountNo || "-"
                            : trx.bankId.accountType === "upi"
                            ? "-"
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
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          <FaIndianRupeeSign className="inline-block mt-[-1px]" />{" "}
                          {trx.total}
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
                      No Payment Found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {recentTransactions.length > 0 && (
            <div className="flex justify-end mt-4">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={recentTransactions.length}
                showSizeChanger={false}
                onChange={(page) => {
                  setCurrentPage(page);
                }}
                className="custom-pagination"
              />
            </div>
          )}
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
              <Input
                prefix={<FaIndianRupeeSign />}
                placeholder="Enter amount"
              />
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
            {/* Conditional fields for IFSC or UPI Number and other fields */}
            <Form.Item shouldUpdate={(prev, curr) => prev.type !== curr.type} noStyle>
              {({ getFieldValue }) => {
                const type = getFieldValue("type");
                if (type === "bank") {
                  return (
                    <>
                      <Form.Item
                        label="Account Holder Name"
                        name="accountHolder"
                        rules={[
                          { required: true, message: "Please enter account holder name" },
                        ]}
                      >
                        <Input placeholder="Enter account holder name" />
                      </Form.Item>
                      <Form.Item
                        label="Bank Name"
                        name="bankName"
                        rules={[{ required: true, message: "Please enter bank name" }]}
                      >
                        <Input placeholder="Enter bank name" />
                      </Form.Item>
                      <Form.Item
                        label="Account Number"
                        name="accountNumber"
                        rules={[{ required: true, message: "Please enter account number" }]}
                      >
                        <Input placeholder="Enter account number" />
                      </Form.Item>
                      <Form.Item
                        label="IFSC"
                        name="ifsc"
                        rules={[{ required: true, message: "Please enter IFSC code" }]}
                      >
                        <Input placeholder="Enter IFSC code" />
                      </Form.Item>
                    </>
                  );
                }
                if (type === "upi") {
                  return (
                    <>
                      <Form.Item
                        label="Account Holder Name"
                        name="accountHolder"
                        rules={[
                          { required: true, message: "Please enter account holder name" },
                        ]}
                      >
                        <Input placeholder="Enter account holder name" />
                      </Form.Item>
                      <Form.Item
                        label="UPI ID"
                        name="upi"
                        rules={[{ required: true, message: "Please enter UPI ID" }]}
                      >
                        <Input placeholder="Enter UPI ID" />
                      </Form.Item>
                    </>
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
