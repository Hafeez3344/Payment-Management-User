import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, DatePicker, Space, Modal, Input, message, Form, Select, Pagination } from "antd";

import BACKEND_URL, { fn_createPaymentApi, fn_getUserPaymentApi } from "../../api/api";

import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaSpinner } from "react-icons/fa";

const Home = ({ authorization, showSidebar }) => {

  const navigate = useNavigate();
  const { RangePicker } = DatePicker;
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const containerHeight = window.innerHeight - 120;
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState([null, null]);
  const [dateRange2, setDateRange2] = useState([null, null]);

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [createPaymentModalOpen, setCreatePaymentModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [summaryData, setSummaryData] = useState({});

  useEffect(() => {
    fn_getSummary();
  }, []);

  useEffect(() => {
    window.scroll(0, 0);
    if (!authorization) {
      navigate("/login");
    }
    fetchAllData(1, null, null);
  }, [authorization, navigate]);

  const fetchAllData = async (page, startDate = null, endDate = null) => {
    try {
      setLoading(true);
      const response = await fn_getUserPaymentApi(page, startDate, endDate);
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
        setRecentTransactions(mapped);
        setTotalPages(response?.data?.pagination?.total || 1); // Update total pages dynamically
        setCurrentPage(response?.data?.pagination?.page || 1); // Update total pages dynamically
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

  const resetFilters = () => {
    setCurrentPage(1)
    setDateRange(() => [null, null]);
    setDateRange2(() => [null, null]);
    setActiveFilter("all");
    fetchAllData(1, null, null);
  };

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
        const [startDate, endDate] = dateRange;
        fetchAllData(1, startDate || null, endDate || null);
        fn_getSummary();
      } else {
        message.error(response.message || "Failed to create payment");
      }
    } catch (err) {
      message.error("Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  const fn_getSummary = async () => {
    const userId = Cookies.get("userId");
    const response = await axios.get(`${BACKEND_URL}/payment/userSummary/${userId}`);
    if (response?.status === 200) {
      setSummaryData(response?.data);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div
      className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
        }`}
      style={{ minHeight: `${containerHeight}px` }}
    >
      <div className="p-7">
        {/* Header Section */}
        {/* <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-5">
          <h1 className="text-[25px] font-[500]">Payment Management User Side</h1>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2 text-[12px]">
              <button
                onClick={() => handleFilterClick("all")}
                className={`$${activeFilter === "all"
                  ? "text-white bg-[#0864E8]"
                  : "text-black"
                  } border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                ALL
              </button>
              <button
                onClick={() => handleFilterClick("today")}
                className={`$${activeFilter === "today"
                  ? "text-white bg-[#0864E8]"
                  : "text-black"
                  } border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                TODAY
              </button>
              <button
                onClick={() => handleFilterClick("7days")}
                className={`$${activeFilter === "7days"
                  ? "text-white bg-[#0864E8]"
                  : "text-black"
                  } border w-[70px] sm:w-[70px] p-1 rounded`}
              >
                7 DAYS
              </button>
              <button
                onClick={() => handleFilterClick("30days")}
                className={`$${activeFilter === "30days"
                  ? "text-white bg-[#0864E8]"
                  : "text-black"
                  } border w-[70px] sm:w-[70px] p-1.5 rounded`}
              >
                30 DAYS
              </button>
            </div>

          </div>
        </div> */}

        {/* Boxes Section */}
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-7 text-nowrap">
          <div className="bg-[#009666] px-[14px] py-[20px] rounded-[5px] shadow text-white flex items-center justify-between">
            <div>
              <h2 className="text-[13px] uppercase font-[500]">Approved Payments</h2>
              <p className="mt-[13px] text-[20px] font-[700]">₹ {Number(summaryData?.approvedAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">No. of Approved Payments: <span className="font-[700]">{Number(summaryData?.approvedCount || 0)}</span></p>
            </div>
            <FaCheckCircle className="text-[38px] opacity-70" />
          </div>
          <div className="bg-[#f57600] px-[14px] py-[10px] rounded-[5px] shadow text-white flex items-center justify-between">
            <div>
              <h2 className="text-[13px] uppercase font-[500]">Pending Payments</h2>
              <p className="mt-[13px] text-[20px] font-[700]">₹ {Number(summaryData?.pendingAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">No. of Pending Payments: <span className="font-[700]">{Number(summaryData?.pendingCount || 0)}</span></p>
            </div>
            <FaHourglassHalf className="text-[38px] opacity-70" />
          </div>
          <div className="bg-[#ff3d5c] px-[14px] py-[10px] rounded-[5px] shadow text-white flex items-center justify-between">
            <div>
              <h2 className="text-[13px] uppercase font-[500]">Rejected Payments</h2>
              <p className="mt-[13px] text-[20px] font-[700]">₹ {Number(summaryData?.declinedAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">No. of Rejected Payments: <span className="font-[700]">{Number(summaryData?.declinedCount || 0)}</span></p>
            </div>
            <FaTimesCircle className="text-[38px] opacity-70" />
          </div>
          {/* <div className="bg-[#9400d3] px-[14px] py-[10px] rounded-[5px] shadow text-white flex items-center justify-between">
            <div>
              <h2 className="text-[13px] uppercase font-[500]">Processing Payments</h2>
              <p className="mt-[13px] text-[20px] font-[700]">₹ {Number(summaryData?.processingAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              <p className="pt-[3px] text-[13px] font-[500] mb-[7px]">No. of Processing Payments: <span className="font-[700]">{Number(summaryData?.processingCount || 0)}</span></p>
            </div>
            <FaSpinner className="text-[38px] opacity-70 animate-spin-slow" />
          </div> */}
        </div>

        {/* Transaction Table Section */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex flex-col md:flex-row items-center justify-between pb-3">
            <div className="flex justify-between items-center w-full">
              <p className="text-black font-[500] text-[24px] mr-2">
                All Payments
              </p>
              <div className="flex gap-[10px]">
                {/* Date Range Picker */}
                <Space direction="vertical" size={10}>
                  <RangePicker
                    value={dateRange2}
                    onChange={(dates) => {
                      if (!dates) {
                        resetFilters();
                      } else {
                        const [startDate, endDate] = dates;
                        const start = formatDate(startDate);
                        const end = formatDate(endDate);
                        setDateRange(() => [start, end])
                        setDateRange2(() => [startDate, endDate])
                        fetchAllData(1, start, end);
                      }
                    }}
                    className="bg-gray-100"
                  />
                </Space>
                <Button
                  type="primary"
                  className="bg-[#0864E8] hover:bg-[#0056b3] text-white font-[500] text-[13px] cursor-pointer border-none"
                  onClick={openCreatePaymentModal}
                >
                  Create Payment
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full border-t-[1px] border-[#DDDDDD80] hidden sm:block mb-4"></div>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 rounded-xl overflow-hidden bg-white">
              <thead>
                <tr className="bg-[#4f8cff] text-left text-[13px] text-white rounded-t-xl">
                  <th className="p-4 text-nowrap rounded-tl-xl">TRN-ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-nowrap">Account Holder Name</th>
                  <th className="p-4 text-nowrap">Bank Name</th>
                  <th className="p-4 text-nowrap">Account Number</th>
                  <th className="p-4 text-nowrap">{`IFSC / UPI ID`}</th>
                  <th className="p-4 text-nowrap">Amount</th>
                  <th className="p-4 text- pl-16 rounded-tr-xl">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4">
                      Loading...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : recentTransactions?.length > 0 ? recentTransactions?.map((trx, idx) => (
                  <tr
                    key={trx._id || idx}
                    className="text-gray-800 text-sm border-b border-[#e3eafc] hover:bg-[#eaf4ff] transition-colors"
                  >
                    <td className="p-4 text-[13px] font-[600] text-[#1a237e]">
                      {trx.trnId}
                    </td>
                    <td className="p-4 text-[13px] font-[600] text-[#1a237e] whitespace-nowrap">
                      {trx.createdAt
                        ? new Date(trx.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    {/* Account Holder Name */}
                    <td className="p-4 text-[13px] font-[700] text-[#1a237e] text-nowrap">
                      {trx.bankId.accountHolderName || "-"}
                    </td>
                    {/* Bank Name */}
                    <td className="p-4 text-[13px] font-[700] text-[#1a237e] text-nowrap">
                      {trx.bankId.accountType === "bank"
                        ? trx.bankId.bankName || "-"
                        : trx.bankId.accountType === "upi"
                          ? "UPI"
                          : "-"}
                    </td>
                    {/* Account Number */}
                    <td className="p-4 text-[13px] font-[700] text-[#1a237e] text-nowrap">
                      {trx.bankId.accountType === "bank"
                        ? trx.bankId.accountNo || "-"
                        : trx.bankId.accountType === "upi"
                          ? "-"
                          : "-"}
                    </td>
                    {/* IFSC/UPI */}
                    <td className="p-4 text-[13px] font-[700] text-[#1a237e] text-nowrap">
                      {trx.bankId.accountType === "bank"
                        ? trx.bankId.ifsc || "MOCKIFSC001"
                        : trx.bankId.accountType === "upi"
                          ? trx.bankId.iban || "-"
                          : "-"} 
                    </td>
                    {/* Amount */}
                    <td className="p-4 text-[13px] font-[700] text-[#1a237e] text-nowrap">
                      <FaIndianRupeeSign className="inline-block mt-[-1px]" />{" "}
                      {trx.total}
                    </td>
                    {/* Status */}
                    <td className="p-4 text-[13px] font-[500]">
                      <span
                        className={`px-2 py-1 rounded-[20px] text-nowrap text-[11px] font-[600] min-w-20 flex items-center justify-center ${trx.status === "Approved"
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
                )) : (
                  <tr>
                    <td colSpan="8" className="text-center p-4 text-gray-500">
                      No Payment Found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          <div className="flex justify-end mt-4">
            <Pagination
              pageSize={10}
              total={totalPages} // Calculate total items dynamically
              current={currentPage}
              onChange={(page) => {
                const [startDate, endDate] = dateRange;
                setCurrentPage(page);
                fetchAllData(page, startDate, endDate);
              }}
              className="custom-pagination"
            />
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
