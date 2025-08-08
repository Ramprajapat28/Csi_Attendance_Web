import "./App.css";
import TeacherInfo from "./components/pages/user_side/TeacherInfo";
import { motion, AnimatePresence } from "framer-motion";
import AnimationPage from "./components/pages/user_side/AnimationPage";
import React, { useEffect, useRef, useState } from "react";
// import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import Qrcode from "./components/pages/user_side/Qrcode";
import { Route, Routes, useLocation } from "react-router-dom";
import Logout from "./components/pages/user_side/LogoutPage";
import Dashboad from "./components/pages/user_side/Dashboad";
import { LoginPage } from "./components/pages/user_side/LoginPage";
import LoginPage_G from "./components/pages/Guard_side/LoginPage_G";
import QrGenerate from "./components/pages/Guard_side/QrGenerate";
// import { QRCodeSVG } from 'qrcode.react';

function App() {
    const location = useLocation();
    return (
        <>
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    {/* <Route path="/" element={<LoginPage />} />
                    <Route path="/Teacherinfo" element={<TeacherInfo />} />
                    <Route path="/scanQR" element={<Qrcode />} />
                    <Route path="/" element={<TeacherInfo />} />
                    <Route path="/Complete" element={<AnimationPage />} />
                    <Route path="/ShowLogOut" element={<Logout />} />
                    <Route path="/Dashboard" element={<Dashboad />} /> */}
                    {/* <Route path="/" element={<LoginPage_G/>} />
                    <Route path="/GenerateQr" element={<QrGenerate/>} /> */}
                </Routes>
            </AnimatePresence>
            
        </>
    );
}

export default App;
