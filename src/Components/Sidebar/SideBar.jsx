import React from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { MdOutlineDashboard } from "react-icons/md";
import { LuLogOut, LuShieldCheck } from "react-icons/lu";
import Royal247Logo from "../../assets/Royal247Logo.png";

const SideBar = ({ merchantVerified, showSidebar, setShowSide, setAuthorization, selectedPage, setSelectedPage, setMerchantVerified }) => {

  const navigate = useNavigate();
  const isMobile = () => window.innerWidth < 1024;
  const fn_controlSidebar = () => { setShowSide(!showSidebar) };

  const fn_logout = () => {
    Cookies.remove("website");
    Cookies.remove("merchantId");
    Cookies.remove("merchantToken");
    localStorage.removeItem("merchantVerified");
    setAuthorization(false);
    setMerchantVerified(true);
    window.location.reload();
    navigate("/login");
  };

  return (
    <div
      style={{ zIndex: 999 }}
      className={`fixed w-[270px] h-[100vh] bg-white border-r transition-all duration-500 ${showSidebar ? "left-0" : "left-[-270px]"}`}
    >
      <div className="flex pl-[21px] h-[55px] items-center gap-3 border-b border-secondary">
        <div>
          {/* <img className="w-[130px]" src={Royal247Logo} alt="" /> */}
          <p className="text-[20px] font-[600] text-gray-500">Management User</p>
        </div>
        <button
          className="bg-gray-200 h-[25px] w-[25px] rounded-sm flex md:hidden justify-center ml-20 items-center"
          onClick={fn_controlSidebar}
        >
          X
        </button>
      </div>
      <div className="mt-[10px]">
        {merchantVerified ? (
          <>
            <Menu
              onClick={() => {
                setSelectedPage("dashboard");
                navigate("/");
                if (isMobile()) fn_controlSidebar();
              }}
              label="Dashboard"
              name="dashboard"
              selectedPage={selectedPage}
              icon={<MdOutlineDashboard className="text-[20px]" />}
            />
          </>
        ) : (
          <div>
            <p>You are not authorized to access this page</p>
          </div>
        )}
        <div
          onClick={fn_logout}
          className="flex border-t gap-[15px] items-center py-[14px] px-[20px] cursor-pointer absolute bottom-0 w-full"
        >
          <div className="text-[rgba(105,155,247,1)]">
            <LuLogOut className="text-[20px] rotate-180" />
          </div>
          <p className="text-[14px] font-[600] text-gray-500">Logout</p>
        </div>
      </div>
    </div>
  );
};

export default SideBar;

const Menu = ({ label, name, icon, onClick, selectedPage }) => {
  return (
    <div
      className={`flex border-b gap-[15px] items-center py-[14px] px-[20px] cursor-pointer ${name === selectedPage && "bg-blue-50"
        }`}
      onClick={onClick}
    >
      <div className="text-[rgba(105,155,247,1)]">{icon}</div>
      <p className="text-[14px] font-[600] text-gray-500">{label}</p>
    </div>
  );
};
