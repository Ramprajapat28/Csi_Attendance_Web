import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Update this path

const Qrcode = () => {
  const navigate = useNavigate();
  const { baseurl } = useAuth();
  const html5QrCodeRef = useRef(null);
  
  const [showTypeSelector, setShowTypeSelector] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const cancel = () => navigate("/");

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setShowTypeSelector(false);
    // Don't start scanner immediately, let useEffect handle it
  };

  const startScanner = () => {
    const elementId = "qr-reader";
    
    // Check if element exists before initializing
    const element = document.getElementById(elementId);
    if (!element) {
      console.error("QR reader element not found");
      return;
    }

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
            { 
              fps: 10, 
              qrbox: { width: 300, height: 300 }, 
              aspectRatio: 0.7, 
              disableFlip: true 
            },
            (decodedText) => {
              // Stop scanner immediately after successful scan
              if (html5QrCodeRef.current && scannerRunning) {
                html5QrCodeRef.current
                  .stop()
                  .then(() => {
                    html5QrCodeRef.current.clear();
                    setScannerRunning(false);
                    // Make attendance API call
                    markAttendance(decodedText, selectedType);
                  })
                  .catch(() => console.warn("Scanner stop failed"));
              }
            }
          )
          .then(() => setScannerRunning(true))
          .catch((err) => {
            console.error("Failed to start scanner:", err);
            alert("Failed to start scanner");
          });
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        alert("Camera access denied");
      });
  };

  const markAttendance = async (qrCode, type) => {
    setIsLoading(true);
    setMessage("Processing attendance...");

    try {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        setMessage("Please login first");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // Get current location (optional)
      let location = null;
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: true
            });
          });
          
          location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
        } catch (error) {
          console.log("Location access denied or failed");
        }
      }

      const response = await fetch(`${baseurl}/attend/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          code: qrCode,
          type: type,
          location: location,
          deviceInfo: {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            deviceId: localStorage.getItem("deviceId") || "web-device"
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${type === 'check-in' ? 'Check-in' : 'Check-out'} successful!`);
        
        // Update local storage based on type
        if (type === 'check-in') {
          localStorage.setItem("checkInTime", new Date().toISOString());
          localStorage.removeItem("checkOutTime");
        } else {
          localStorage.setItem("checkOutTime", new Date().toISOString());
        }

        // Show success message for 2 seconds then navigate
        setTimeout(() => {
          if (type === 'check-in') {
            navigate("/Complete");
          } else {
            navigate("/Dashboard");
          }
        }, 2000);
      } else {
        setMessage(data.message || "Attendance marking failed");
      }
    } catch (error) {
      console.error("Attendance error:", error);
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (selectedType && !showTypeSelector) {
      // Stop scanner if running
      if (html5QrCodeRef.current && scannerRunning) {
        html5QrCodeRef.current
          .stop()
          .then(() => {
            html5QrCodeRef.current.clear();
            setScannerRunning(false);
            setShowTypeSelector(true);
            setSelectedType(null);
            setMessage("");
          })
          .catch(() => console.warn("Scanner stop failed"));
      } else {
        setShowTypeSelector(true);
        setSelectedType(null);
        setMessage("");
      }
    } else {
      navigate("/");
    }
  };

  // Effect to start scanner when type is selected and DOM is ready
  useEffect(() => {
    if (!showTypeSelector && selectedType && !scannerRunning) {
      // Add a small delay to ensure DOM element is rendered
      const timer = setTimeout(() => {
        startScanner();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [showTypeSelector, selectedType, scannerRunning]);

  // Cleanup on component unmount
  useEffect(() => {
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
      {/* Close/Back Button */}
      <img
        onClick={goBack}
        src="/src/assets/cross.png"
        className="h-[12px] absolute right-[15px] top-[25px] cursor-pointer"
        alt="Back"
      />

      {/* Title */}
      <div className="text flex flex-col items-center justify-center gap-0.5">
        <span className="font-bold text-lg">
          {showTypeSelector ? "Select Attendance Type" : "Scan QR Code"}
        </span>
        <span className="font-medium text-gray-400 text-xs">
          {showTypeSelector 
            ? "Choose check-in or check-out" 
            : `Scanning for ${selectedType}...`}
        </span>
      </div>

      {/* Type Selection Modal */}
      {showTypeSelector && (
        <div className="flex flex-col gap-4 w-[350px]">
          <button
            onClick={() => handleTypeSelection('check-in')}
            className="flex justify-center items-center rounded-lg text-sm font-medium gap-3 
              bg-green-500 text-white w-full h-[48px] shadow-[0px_4px_4px_0px_#00000040] 
              active:shadow-[0px_2px_1px_0px_#00000040] transition-all duration-100"
          >
            Check In
            <img
              src="/src/assets/check.png"
              className="h-[15px] invert"
              alt="Check In"
            />
          </button>

          <button
            onClick={() => handleTypeSelection('check-out')}
            className="flex justify-center items-center rounded-lg text-sm font-medium gap-3 
              bg-red-500 text-white w-full h-[48px] shadow-[0px_4px_4px_0px_#00000040] 
              active:shadow-[0px_2px_1px_0px_#00000040] transition-all duration-100"
          >
            Check Out
            <img
              src="/src/assets/check.png"
              className="h-[15px] invert"
              alt="Check Out"
            />
          </button>
        </div>
      )}

      {/* Scanner Container */}
      {!showTypeSelector && (
        <>
          <div
            id="qr-reader"
            className="w-[350px] rounded-[22px] m-auto flex overflow-hidden"
          />

          {/* Loading/Message Display */}
          {(isLoading || message) && (
            <div className="flex flex-col items-center gap-2">
              {isLoading && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              )}
              <span className="text-sm font-medium text-gray-600">
                {message}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Qrcode;
