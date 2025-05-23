import { Button } from "antd";
import React, { useState } from "react";

import { TbLogout2 } from "react-icons/tb";
import { FaBarsStaggered } from "react-icons/fa6";
import { MdOutlineFullscreen, MdFullscreenExit } from "react-icons/md";

const NavBar = ({ setShowSide, showSidebar, setAuthorization }) => {

  const [isFullScreen, setIsFullScreen] = useState(false);

  const fn_controlSidebar = () => { setShowSide(!showSidebar) };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const fn_logout = () => {
    setAuthorization(false);
    window.location.reload();
    navigate("/login");
  };

  return (
    <div
      className={`h-[55px]  flex justify-between transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
        }`}
    >
      <div className="flex w-full justify-between items-center pl-7">
        <div className="text-[20px]">
          {/* <FaBarsStaggered
            onClick={fn_controlSidebar}
            className="cursor-pointer"
          /> */}
          <p className="text-[20px] font-[600]">Payment Management User</p>
        </div>
        <div className="flex items-center gap-5 pr-7">
          <div className="text-[26px] cursor-pointer" onClick={toggleFullScreen}>
            {isFullScreen ? <MdFullscreenExit /> : <MdOutlineFullscreen />}
          </div>
          <div className="text-[20px] cursor-pointer">
            <Button color="default" variant="solid" onClick={fn_logout}><TbLogout2 /> Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
