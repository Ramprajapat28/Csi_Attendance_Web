import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

const Qrcode = () => {
  const navigate = useNavigate();
  const html5QrCodeRef = useRef(null);
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    const inT = localStorage.getItem("checkInTime");
    const outT = localStorage.getItem("checkOutTime");
    return !!inT && !outT;
  });

  const [data, setData] = useState("No result");
  const [scannerRunning, setScannerRunning] = useState(false);

  const cancel = () => navigate("/");

  const isValidURL = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleCheckIn = () => {
    const now = new Date();
    localStorage.setItem("checkInTime", now.toISOString());
    localStorage.removeItem("checkOutTime");
    setIsCheckedIn(true);
    navigate("/Complete");
  };

  const handleCheckOut = () => {
    const now = new Date();
    localStorage.setItem("checkOutTime", now.toISOString());
    setIsCheckedIn(false);
    navigate("/Dashboard");
  };

  const handleToggle = () => {
    if (isCheckedIn) handleCheckOut();
    else handleCheckIn();
  };

  useEffect(() => {
    const saved = localStorage.getItem("scannedData");
    if (saved) setData(saved);

    const elementId = "qr-reader";
    html5QrCodeRef.current = new Html5Qrcode(elementId);

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          alert("No camera found");
          return;
        }

        const cameraId = devices[0].id;
        html5QrCodeRef.current
          .start(
            cameraId,
            { fps: 10, qrbox: { width: 300, height: 300 },aspectRatio: 0.7, disableFlip: true },
            (decodedText) => {
              setData(decodedText);
              localStorage.setItem("scannedData", decodedText);

              // Stop scanner safely
              if (html5QrCodeRef.current && scannerRunning) {
                html5QrCodeRef.current
                  .stop()
                  .then(() => {
                    html5QrCodeRef.current.clear();
                    setScannerRunning(false);

                    // Open URL if scanned QR is a valid link
                    if (isValidURL(decodedText)) {
                      window.location.href = decodedText;
                    }
                  })
                  .catch(() => console.warn("Scanner stop failed"));
              }
            }
          )
          .then(() => setScannerRunning(true))
          .catch(() => alert("Failed to start scanner"));
      })
      // .catch(() => alert("Camera access denied"));

    return () => {
      if (html5QrCodeRef.current && scannerRunning) {
        html5QrCodeRef.current
          .stop()
          .then(() => html5QrCodeRef.current.clear())
          .catch(() => console.warn("Cleanup stop failed"));
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-[100dvh] gap-4 pt-[70px] pb-[30px]">
      {/* Close Button */}
      <img
        onClick={cancel}
        src="/src/assets/cross.png"
        className="h-[12px] absolute right-[15px] top-[25px] cursor-pointer"
        alt="Cancel"
      />

      {/* Title */}
      <div className="text flex flex-col items-center justify-center gap-0.5">
        <span className="font-bold text-lg">Scan Code</span>
        <span className="font-medium text-gray-400 text-xs">
          Scan QR Code to check securely
        </span>
      </div>

      {/* Scanner */}
      <div
        id="qr-reader"
        className="w-[350px] rounded-[22px] m-auto flex overflow-hidden"
      />

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className={`flex justify-center items-center rounded-lg text-sm font-medium gap-3 
          ${isCheckedIn ? "bg-red-500" : "bg-[#1D61E7]"} 
          text-white w-[350px] h-[48px] shadow-[0px_4px_4px_0px_#00000040] 
          active:shadow-[0px_2px_1px_0px_#00000040] transition-all duration-100`}
      >
        {isCheckedIn ? "Check Out" : "Check In"}
        <img
          src="/src/assets/check.png"
          className="h-[15px] invert-100"
          alt="Check"
        />
      </button>
    </div>
  );
};

export default Qrcode;
