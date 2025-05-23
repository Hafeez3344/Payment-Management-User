import "./App.css";
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./Components/Home/Home";
import NavBar from "./Components/NabBar/NavBar";
import Footer from "./Components/Footer/Footer";
import SideBar from "./Components/Sidebar/SideBar";
import MerchantLogin from "./Pages/Merchant-Login/MerchantLogin";

function App() {
  
  const [selectedPage, setSelectedPage] = useState("");
  const [showSidebar, setShowSide] = useState(window.innerWidth > 760 ? true : false);
  const [authorization, setAuthorizationState] = useState(localStorage.getItem("isAuthorized") === "true");

  const setAuthorization = (value) => {
    setAuthorizationState(value);
    if (value) {
      localStorage.setItem("isAuthorized", "true");
    } else {
      localStorage.removeItem("isAuthorized");
    }
  };

  return (
    <>
      {/* Sidebar only when authorized */}
      {authorization && (
        <SideBar
          showSidebar={showSidebar}
          setShowSide={setShowSide}
          setAuthorization={setAuthorization}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
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
