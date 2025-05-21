import React, { useState } from "react";
import { FaBarsStaggered } from "react-icons/fa6";
import { RiMessageLine } from "react-icons/ri";
import Cookies from "js-cookie";
import { MdOutlineNotificationsNone } from "react-icons/md";
import { MdOutlineFullscreen } from "react-icons/md";
import { FaRegUser } from "react-icons/fa6";
import { Button, Input, Modal, notification } from "antd";

const NavBar = ({ setShowSide, showSidebar }) => {
  const [open, setOpen] = React.useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [showLinkField, setShowLinkField] = useState(false);
  const [transactionData, setTransactionData] = useState({
    amount: "",
    username: "",
  });
  const baseUrl = Cookies.get("website");

  const fn_controlSidebar = () => {
    setShowSide(!showSidebar);
  };

  const handleCreateTransaction = async () => {
    try {
      if (!transactionData.amount) {
        return notification.error({
          message: "Error",
          description: "Please enter amount",
          placement: "topRight",
        });
      }
      if (!transactionData.username) {
        return notification.error({
          message: "Error",
          description: "Please enter username",
          placement: "topRight",
        });
      }

      const link = `${baseUrl}/payment?amount=${transactionData.amount}&username=${transactionData.username}`;
      setGeneratedLink(link);
      setShowLinkField(true);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to create transaction",
        placement: "topRight",
      });
    }
  };

  const items = [
    {
      key: "1",
      label: "For New User",
      onClick: () => {
        setGeneratedLink(baseUrl);
        setShowLinkField(true);
        setOpen(true);
      }
    },
    {
      key: "2",
      label: "For Existing User",
      onClick: () => setOpen(true),
    },
  ];

  return (
    <div
      className={`h-[55px]  flex justify-between transition-all duration-500 ${
        showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
      }`}
    >
      <div className="flex w-full justify-between items-center pl-7">
        <div className="text-[20px]">
          <FaBarsStaggered
            onClick={fn_controlSidebar}
            className="cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-7 pr-7">
          <div className="text-[25px] cursor-pointer">
            <RiMessageLine />
          </div>
          <div className="text-[25px] cursor-pointer">
            <MdOutlineNotificationsNone />
          </div>
          <div className="text-[26px] cursor-pointer">
            <MdOutlineFullscreen />
          </div>
          <div className="text-[20px] cursor-pointer">
            <FaRegUser />
          </div>
        </div>
      </div>
      <Modal
        centered
        width={600}
        style={{ fontFamily: "sans-serif" }}
        title={
          <p className="text-[16px] font-[700]">
            {showLinkField
              ? "Generated Payment Link"
              : "Create New Transaction"}
          </p>
        }
        open={open}
        onCancel={() => {
          setOpen(false);
          setShowLinkField(false);
          setGeneratedLink("");
          setTransactionData({ amount: "", username: "" });
        }}
        footer={
          <div className="flex gap-4">
            {!showLinkField ? (
              <Button
                className="flex start px-10 text-[12px]"
                type="primary"
                onClick={handleCreateTransaction}
              >
                Create
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  className="flex items-center px-6 text-[12px]"
                  type="primary"
                  onClick={copyLink}
                >
                  Copy Link
                </Button>
                <Button
                  className="flex items-center px-6 text-[12px]"
                  type="primary"
                  onClick={shareLink}
                >
                  Share Link
                </Button>
              </div>
            )}
            <Button
              className="flex start px-10 bg-white text-[#FF3D5C] border border-[#FF7A8F] text-[12px]"
              onClick={() => {
                setOpen(false);
                setShowLinkField(false);
                setGeneratedLink("");
                setTransactionData({ amount: "", username: "" });
              }}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {!showLinkField ? (
            <>
              <div className="flex-1 my-2">
                <p className="text-[12px] font-[500] pb-1">
                  Amount <span className="text-[#D50000]">*</span>
                </p>
                <Input
                  value={transactionData.amount}
                  onChange={(e) =>
                    setTransactionData((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                  className="w-full text-[12px]"
                  placeholder="Enter Amount"
                  type="number"
                />
              </div>
              <div className="flex-1 my-2">
                <p className="text-[12px] font-[500] pb-1">
                  Username <span className="text-[#D50000]">*</span>
                </p>
                <Input
                  value={transactionData.username}
                  onChange={(e) =>
                    setTransactionData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="w-full text-[12px]"
                  placeholder="Enter Username"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 my-2">
              <p className="text-[12px] font-[500] pb-1">Payment Link</p>
              <Input.TextArea
                value={generatedLink}
                className="border-none"
                readOnly
                autoSize={{ minRows: 2, maxRows: 5 }}
                style={{ border: "none", boxShadow: "none" }}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default NavBar;
