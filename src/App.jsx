import "./App.css";
import Cookies from "js-cookie";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";

import Home from "./Components/Home/Home";
import NavBar from "./Components/NabBar/NavBar";
import Footer from "./Components/Footer/Footer";
import SideBar from "./Components/Sidebar/SideBar";
import MerchantLogin from "./Pages/Merchant-Login/MerchantLogin";

function App() {

  const [selectedPage, setSelectedPage] = useState("");
  const [showSidebar, setShowSide] = useState(window.innerWidth > 760 ? true : false);
  const [authorization, setAuthorization] = useState(Cookies.get("merchantToken") ? true : false);
  const [merchantVerified, setMerchantVerified] = useState(localStorage.getItem("merchantVerified") === "true" ? true : localStorage.getItem("merchantVerified") === "false" ? false : false);

const navigate = useNavigate();
const inactivityTimeoutRef = useRef(null);
const tabCloseTimeoutRef = useRef(null);

const fn_logout = () => {
  Cookies.remove("merchantToken");
  localStorage.removeItem("merchantVerified");
  setAuthorization(false);
  navigate("/login");
};

// ⏱️ Check if last closed time was over 1 minute ago
useEffect(() => {
  const token = Cookies.get("merchantToken");
  const lastClosedAt = localStorage.getItem("lastTabClosedAt");

  if (token && lastClosedAt) {
    const closedTime = parseInt(lastClosedAt, 10);
    const now = Date.now();
    const oneMinute = 1 * 60 * 1000;

    if (now - closedTime > oneMinute) {
      fn_logout(); // Session expired after tab close
    } else {
      // Still within 1 minute — clear it
      localStorage.removeItem("lastTabClosedAt");
    }
  }
}, []);

// 🕓 Inactivity and tab blur handling
useEffect(() => {
  if (!authorization) return;

  const activityEvents = ["mousemove", "keydown", "scroll", "click"];

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimeoutRef.current);
    inactivityTimeoutRef.current = setTimeout(() => {
      fn_logout(); // 10 min inactivity logout
    }, 10 * 60 * 1000);
  };

  const handleTabBlur = () => {
    clearTimeout(tabCloseTimeoutRef.current);
    tabCloseTimeoutRef.current = setTimeout(() => {
      fn_logout(); // Optional: logout after 5 min tab blur
    }, 5 * 60 * 1000);
  };

  const handleTabFocus = () => {
    clearTimeout(tabCloseTimeoutRef.current);
  };

  activityEvents.forEach((event) =>
    window.addEventListener(event, resetInactivityTimer)
  );
  window.addEventListener("blur", handleTabBlur);
  window.addEventListener("focus", handleTabFocus);

  resetInactivityTimer();

  return () => {
    activityEvents.forEach((event) =>
      window.removeEventListener(event, resetInactivityTimer)
    );
    window.removeEventListener("blur", handleTabBlur);
    window.removeEventListener("focus", handleTabFocus);
    clearTimeout(inactivityTimeoutRef.current);
    clearTimeout(tabCloseTimeoutRef.current);
  };
}, [authorization]);

// 💾 Store tab close time
useEffect(() => {
  const handleTabClose = () => {
    localStorage.setItem("lastTabClosedAt", Date.now().toString());
  };

  window.addEventListener("beforeunload", handleTabClose);
  return () => {
    window.removeEventListener("beforeunload", handleTabClose);
  };
}, []);

// ✅ If on login route, reset verified state
useEffect(() => {
  if (window.location.pathname === "/login") {
    setMerchantVerified(true);
  }
}, []);

  return (
    <>
      {/* Sidebar only when authorized */}
      {authorization && (
        <SideBar
          merchantVerified={merchantVerified}
          showSidebar={showSidebar}
          setShowSide={setShowSide}
          setAuthorization={setAuthorization}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          setMerchantVerified={setMerchantVerified}
        />
      )}
      <div>
        {/* Navbar only when authorized */}
        {authorization && (
          <NavBar setShowSide={setShowSide} showSidebar={showSidebar} />
        )}
        <Routes>
          <Route
            path="/login"
            element={
              <MerchantLogin
                authorization={authorization}
                setAuthorization={setAuthorization}
                setMerchantVerified={setMerchantVerified}
              />
            }
          />
          <Route
            path="/"
            element={
              authorization ? (
                <Home
                  setSelectedPage={setSelectedPage}
                  authorization={authorization}
                  showSidebar={showSidebar}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        {/* Footer only when authorized */}
        {authorization && <Footer />}
      </div>
    </>
  );
}

export default App;
