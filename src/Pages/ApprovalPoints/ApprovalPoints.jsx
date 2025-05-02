import axios from "axios";
import { Button } from "antd";
import moment from 'moment-timezone';

import React, { useState, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { Pagination, Modal, Input, notification, DatePicker, Space } from "antd";

import { FaRegEdit } from "react-icons/fa";
import { IoMdCheckmark } from "react-icons/io";
import { GoCircleSlash } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { RiFindReplaceLine } from "react-icons/ri";
import { FaIndianRupeeSign } from "react-icons/fa6";

import BACKEND_URL, { fn_getAllPointsPaymentApi, fn_updateTransactionStatusApi } from "../../api/api";

const ApprovalPoints = ({ setSelectedPage, authorization, showSidebar, permissionsData, loginType }) => {

  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const { RangePicker } = DatePicker;
  const [open, setOpen] = useState(false);
  const status = searchParams.get("status");
  const [isEdit, setIsEdit] = useState(false);
  const [merchant, setMerchant] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const containerHeight = window.innerHeight - 120;
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTrnId, setSearchTrnId] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const editablePermission = Object.keys(permissionsData).length > 0 ? permissionsData?.approvalPoints?.edit : true;
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const fetchTransactions = async (pageNumber) => {
    try {
      let startDate = null;
      let endDate = null;

      if (dateRange && dateRange[0]) {
        const startDateObj = new Date(dateRange[0].$d);
        const endDateObj = new Date(dateRange[1].$d);

        // Adjust for timezone difference and set start date to beginning of day
        startDateObj.setHours(0, 0, 0, 0);
        startDate = new Date(startDateObj.getTime() - startDateObj.getTimezoneOffset() * 60000).toISOString();

        // Adjust for timezone difference and set end date to end of day
        endDateObj.setHours(23, 59, 59, 999);
        endDate = new Date(endDateObj.getTime() - endDateObj.getTimezoneOffset() * 60000).toISOString();
      }

      console.log('Date Range State:', dateRange);
      console.log('Start Date:', startDate);
      console.log('End Date:', endDate);

      const result = await fn_getAllPointsPaymentApi(
        status || null,
        pageNumber,
        { startDate, endDate }
      );

      if (result?.status) {
        if (result?.data?.status === "ok") {
          setTransactions(result?.data?.data);
          setTotalPages(result?.data?.totalPages);
        } else {
          setTransactions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setTransactions([]);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    if (!authorization) {
      navigate("/login");
      return;
    }
    setSelectedPage("approval-points");
  }, []);

  // setTimeout(() => {
  //   fetchTransactions(currentPage || 1);
  // }, 3000);


  useEffect(() => {
    fetchTransactions(currentPage);
  }, [currentPage, dateRange]);

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction?.createdAt);

    const adjustedEndDate = dateRange[1] ? new Date(dateRange[1]) : null;
    if (adjustedEndDate) {
      adjustedEndDate.setHours(23, 59, 59, 999);
    }

    const isWithinDateRange =
      (!dateRange[0] || transactionDate >= dateRange[0]) &&
      (!adjustedEndDate || transactionDate <= adjustedEndDate);

    return (
      transaction?.ledgerId?.utr?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (merchant === "" || transaction?.ledgerId?.merchantName === merchant) &&
      isWithinDateRange &&
      (searchTrnId === "" || transaction?.ledgerId?.trnNo.toString().includes(searchTrnId))
    );
  });

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  const handleTransactionAction = async (action, transactionId) => {
    const response = await fn_updateTransactionStatusApi(transactionId, {
      status: action,
    });
    if (response.status) {
      fetchTransactions(currentPage);
      notification.success({
        message: "Success",
        description: "Transaction Updated!",
        placement: "topRight",
      });
      setIsEdit(false);
      setOpen(false);
    } else {
      setIsEdit(false);
      console.error(`Failed to ${action} transaction:`, response.message);
    }
  };

  const handleEditTransactionAction = async (status, id, amount, utr) => {
    const response = await fn_updateTransactionStatusApi(id, {
      status: status,
      total: parseInt(amount),
      utr: utr,
    });
    if (response.status) {
      fetchTransactions(currentPage);
      notification.success({
        message: "Success",
        description: "Transaction Updated!",
        placement: "topRight",
      });
      setOpen(false);
      setIsEdit(false);
    } else {
      setIsEdit(false);
      console.error(`Failed to ${action} transaction:`, response.message);
    }
  };

  const fn_deleteTransaction = async (ledgerId, merchantId) => {
    const response = await axios.post(`${BACKEND_URL}/approval/create`, { ledgerId, merchantId });
    if (response?.status) {
      notification.success({
        message: "Success",
        description: "Transaction Deleted!",
        placement: "topRight",
      });
      fetchTransactions(currentPage);
    }
  };

  const fn_checkPoints = async (item) => {
    console.log("item ", item);
    const data = {
      merchantId: item?.merchantId,
      ledgerId: item?._id
    };
    const response = await axios.post(`${BACKEND_URL}/approval/create`, data);
    if (response?.data?.status === "ok") {
      fetchTransactions(currentPage);
      notification.success({
        message: "Updated Successfully",
        description: "Added to Approval Points Table",
        placement: "topRight",
      });
    } else {
      notification.error({
        message: "Failed",
        description: "Failed to add to Approval Points Table",
        placement: "topRight",
      });
    };
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <>
      <div
        className={`bg-gray-100 transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
          }`}
        style={{ minHeight: `${containerHeight}px` }}
      >
        <div className="p-7">
          <div className="flex flex-col md:flex-row gap-[12px] items-center justify-between mb-7">
            <h1 className="text-[25px] font-[500]">All Approval Points</h1>
            <p className="text-[#7987A1] text-[13px] md:text-[15px] font-[400]">
              Dashboard - Data Table
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-center justify-between pb-3">
              <div>
                <p className="text-black font-medium text-lg">
                  List of all Approval Points
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <Space direction="vertical" size={10}>
                  <RangePicker
                    value={dateRange}
                    onChange={(dates) => {
                      setDateRange(dates);
                      setCurrentPage(1);
                    }}
                  />
                </Space>
                {/* Search Input */}
                <div className="flex flex-col w-full md:w-40">
                  <input
                    type="text"
                    placeholder="Search by TRN-ID"
                    value={searchTrnId}
                    onChange={(e) => setSearchTrnId(e.target.value)}
                    className="border w-full border-gray-300 rounded py-1.5 text-[12px] pl-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex flex-col w-full md:w-40">
                  <input
                    type="text"
                    placeholder="Search by UTR"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border w-full border-gray-300 rounded py-1.5 text-[12px] pl-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>
            <div className="w-full border-t-[1px] border-[#DDDDDD80] hidden sm:block mb-4"></div>
            <div className="overflow-x-auto">
              <table className="min-w-full border">
                <thead>
                  <tr className="bg-[#ECF0FA] text-left text-[12px] text-gray-700">
                    <th className="p-4 text-nowrap">TRN-ID</th>
                    <th className="p-4">DATE</th>
                    <th className="p-4 text-nowrap">User Name</th>
                    <th className="p-4 text-nowrap">Website URL</th>
                    <th className="p-4 text-nowrap">BANK NAME</th>
                    <th className="p-4 text-nowrap">TOTAL AMOUNT</th>
                    <th className="p-4 ">UTR#</th>
                    <th className="pl-8">Status</th>
                    <th className="pl-7 cursor-pointer">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction?._id}
                        className="text-gray-800 text-sm border-b"
                      >
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2]">
                          {transaction?.ledgerId?.trnNo}
                        </td>
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2] whitespace-nowrap">
                          {moment.utc(transaction?.createdAt).format('DD MMM YYYY, hh:mm A')}
                        </td>
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          {transaction?.ledgerId?.username && transaction?.ledgerId?.username !== "" ? transaction?.ledgerId?.username : "GUEST"}
                        </td>
                        <td className="p-4 text-[13px] font-[600] text-[#000000B2] text-nowrap">
                          {transaction?.ledgerId?.site || transaction?.ledgerId?.website}
                        </td>
                        <td className="p-4">
                          {transaction?.ledgerId?.bankId?.bankName ? (
                            <div className="">
                              <span className="text-[13px] font-[700] text-black whitespace-nowrap">
                                {transaction?.ledgerId?.bankId?.bankName}
                              </span>
                            </div>
                          ) : (
                            <div className="">
                              <p className="text-[14px] font-[700] text-black ">
                                UPI
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-[13px] font-[700] text-[#000000B2] text-nowrap">
                          <FaIndianRupeeSign className="inline-block mt-[-1px]" />{" "}
                          {transaction?.ledgerId?.total}
                        </td>
                        <td className="p-4 text-[12px] font-[700] text-[#0864E8]">
                          {transaction?.ledgerId?.utr}
                        </td>
                        <td className="p-4 text-[13px] font-[500]">
                          <span
                            className={`px-2 py-1 rounded-[20px] text-nowrap text-[11px] font-[600] min-w-20 flex items-center justify-center ${transaction?.ledgerId?.status === "Approved"
                              ? "bg-[#10CB0026] text-[#0DA000]"
                              : transaction?.ledgerId?.status === "Pending"
                                ? "bg-[#FFC70126] text-[#FFB800]"
                                : transaction?.ledgerId?.status === "Manual Verified"
                                  ? "bg-[#0865e851] text-[#0864E8]"
                                  : "bg-[#FF7A8F33] text-[#FF002A]"
                              }`}
                          >
                            {transaction?.ledgerId?.status?.charAt(0).toUpperCase() +
                              transaction?.ledgerId?.status?.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 flex space-x-2 transaction-view-model">
                          <button
                            className="bg-blue-100 text-blue-600 rounded-full px-2 py-2 mx-2"
                            title="View"
                            onClick={() => handleViewTransaction(transaction?.ledgerId)}
                          >
                            <FiEye />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-gray-500">
                        No Transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Modal
        centered
        footer={null}
        width={900}
        style={{ fontFamily: "sans-serif", padding: "20px" }}
        title={
          <p className="text-[20px] font-[700]">
            Transaction Details
          </p>
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          setIsEdit(false);
        }}
        onClose={() => {
          setOpen(false);
          setIsEdit(false);
        }}
      >
        {selectedTransaction && (
          <div className="flex flex-col md:flex-row">
            {/* Left side input fields */}
            <div className="flex flex-col gap-2 mt-3 w-full md:w-1/2">
              <p className="font-[500] mt-[-20px] mb-[15px]">Transaction Id: <span className="text-gray-500 font-[700]">{selectedTransaction.trnNo}</span></p>
              {[
                {
                  label: "Website:",
                  value: selectedTransaction?.website,
                },
                {
                  label: "Amount:",
                  value: selectedTransaction?.total,
                },
                {
                  label: "UTR#:",
                  value: selectedTransaction?.utr,
                },
                {
                  label: "Date & Time:",
                  value: `${moment.utc(selectedTransaction?.createdAt).format('DD MMM YYYY, hh:mm A')}`,
                },
                {
                  label: "Bank Name:",
                  value:
                    selectedTransaction.bankId?.bankName ||
                    "UPI",
                },
                {
                  label: "Status:",
                  value:
                    selectedTransaction.status,
                },
                // {
                //   label: "Description:",
                //   value:
                //     selectedTransaction.description || "",
                //   isTextarea: true,
                // },
              ].map((field, index) => (
                <div
                  className="flex items-center gap-4"
                  key={index}
                >
                  <p className="text-[12px] font-[600] w-[150px]">
                    {field.label}
                  </p>
                  {field.isTextarea ? (
                    <textarea
                      className="w-[50%] text-[11px] border rounded p-1 resize-none outline-none input-placeholder-black overflow-hidden"
                      value={field.value}
                      rows={3}
                      readOnly
                      style={{
                        overflow: "auto",
                        resize: "none",
                      }}
                    />
                  ) : (
                    <Input
                      prefix={
                        field.label === "Amount:" ? (
                          <FaIndianRupeeSign className="mt-[2px]" />
                        ) : null
                      }
                      className={`w-[50%] text-[12px] input-placeholder-black ${isEdit &&
                        (field.label === "Amount:" ||
                          field?.label === "UTR#:")
                        ? "bg-white"
                        : "bg-gray-200"
                        }`}
                      readOnly={
                        isEdit &&
                          (field.label === "Amount:" ||
                            field?.label === "UTR#:")
                          ? false
                          : true
                      }
                      value={field?.value}
                      onChange={(e) => {
                        if (field?.label === "Amount:") {
                          setSelectedTransaction((prev) => ({
                            ...prev,
                            total: e.target.value,
                          }));
                        } else {
                          setSelectedTransaction((prev) => ({
                            ...prev,
                            utr: e.target.value,
                          }));
                        }
                      }}
                    />
                  )}
                </div>
              ))}
              <div className="border-b w-[370px] mt-4"></div>

              {selectedTransaction?.trnStatus !== "Transaction Pending" && (
                <div>
                  <div className="flex items-center mt-4">
                    <p className="text-[14px] font-[700] mr-2">Transaction Activity:</p>
                  </div>
                  <div className="flex items-center mt-4">
                    <span
                      className={`text-nowrap text-[16px] font-[700] flex items-center justify-center ${selectedTransaction?.status === "Approved"
                          ? "text-[#0DA000]"
                          : selectedTransaction?.status === "Pending"
                            ? "text-[#FFB800]"
                            : selectedTransaction?.status === "Manual Verified"
                              ? "text-[#0864E8]"
                              : "text-[#FF002A]"
                        }`}
                    >
                      {selectedTransaction?.status === "Decline"
                        ? "Transaction Decline"
                        : selectedTransaction?.status === "Pending"
                          ? "Transaction Pending"
                          : selectedTransaction?.approval === true
                            ? "Points Approved"
                            : (selectedTransaction?.reason && selectedTransaction?.reason !== "")
                              ? "Points Decline"
                              : "Points Pending"}
                    </span>
                    <p className="text-[14px] font-[400] ml-6">
                      {moment(selectedTransaction?.updatedAt).tz('Asia/Kolkata').format('DD MMM YYYY, hh:mm A')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Right side with border and image */}
            <div className="w-full md:w-1/2 md:border-l my-10 md:mt-0 pl-0 md:pl-6 flex flex-col justify-between items-center h-full">
              <div className="relative w-full max-w-[400px] overflow-hidden cursor-zoom-in" style={{ aspectRatio: "1" }}>
                <img
                  src={`${BACKEND_URL}/${selectedTransaction?.image}`}
                  alt="Payment Proof"
                  className="w-full h-full object-contain"
                  style={{
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                    transform: isHovering ? "scale(2)" : "scale(1)",
                    transition: "transform 0.1s ease-out"
                  }}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onMouseMove={handleMouseMove}
                />
              </div>

              {/* <div className="flex">
                <button
                  className="mt-12 border flex border-black px-1 py-1 rounded"
                  onClick={() => {
                    const input =
                      document.createElement("input");
                    input.type = "file";
                    input.click();
                  }}
                >
                  <RiFindReplaceLine className="mt-[5px] mr-2 text-[#699BF7]" />
                  <p>Replace Payment Proof</p>
                </button>
              </div> */}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ApprovalPoints;
