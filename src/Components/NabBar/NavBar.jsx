import React, { useState } from "react";

import { FaRegUser } from "react-icons/fa6";
import { FaBarsStaggered } from "react-icons/fa6";
import { MdOutlineFullscreen, MdFullscreenExit } from "react-icons/md";

const NavBar = ({ setShowSide, showSidebar }) => {

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

  return (
    <div
      className={`h-[55px]  flex justify-between transition-all duration-500 ${showSidebar ? "pl-0 md:pl-[270px]" : "pl-0"
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
          <div className="text-[26px] cursor-pointer" onClick={toggleFullScreen}>
            {isFullScreen ? <MdFullscreenExit /> : <MdOutlineFullscreen />}
          </div>
          <div className="text-[20px] cursor-pointer">
            <FaRegUser />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
