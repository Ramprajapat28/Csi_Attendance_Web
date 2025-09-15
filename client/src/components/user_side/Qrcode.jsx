import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Qrcode = () => {
  const navigate = useNavigate();
  const { baseurl } = useAuth();

  // DOM and scanner refs
  const readerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const mountedRef = useRef(true);

  // ADDED: guard to prevent duplicate handling
  const processingRef = useRef(false);

  // UI state
  const [showTypeSelector, setShowTypeSelector] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [scannerInitialized, setScannerInitialized] = useState(false);

  // Optional: show last detected code
  const [qrDetected, setQrDetected] = useState(false);
  const [detectedQrCode, setDetectedQrCode] = useState("");

  const handleTypeSelection = (type) => {
    setSelectedType(type);
    setShowTypeSelector(false);
    setMessage("");
  };

  const startScanner = async () => {
    if (scannerInitialized) return;

    const container = readerRef.current;
    if (!container) {
      setMessage("❌ Scanner view not ready. Please try again.");
      return;
    }

    try {
      setMessage("🔍 Initializing camera...");

      if (!html5QrCodeRef.current) {
        const elementId = container.id || "qr-reader";
        if (!container.id) {
          container.id = elementId;
        }
        html5QrCodeRef.current = new Html5Qrcode(elementId);
      }
      const html5QrCode = html5QrCodeRef.current;

      const devices = await Html5Qrcode.getCameras();

      if (!devices || devices.length === 0) {
        setMessage("❌ No camera found or permission denied.");
        return;
      }

      const backCam =
        devices.find((d) => /back|rear|environment/i.test(d.label))?.id ?? {
          facingMode: "environment",
        };

      const w = container.clientWidth || 320;
      const qrSize = Math.floor(Math.min(300, Math.max(180, w * 0.8)));

      await html5QrCode.start(
        backCam,
        {
          fps: 10,
          qrbox: { width: qrSize, height: qrSize },
        },
        // MODIFIED: success callback with processing guard + orderly stop then POST
        async (decodedText) => {
          if (processingRef.current) return;
          processingRef.current = true;
          setQrDetected(true);
          setDetectedQrCode(decodedText);
          await stopScanner();
          await markAttendance(decodedText);
        },
        () => {
          // ignore parse errors
        }
      );

      if (!mountedRef.current) return;
      setScannerInitialized(true);
      setMessage(`🔍 Scanning for ${selectedType} QR code...`);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setMessage(
        "❌ Failed to start camera. Ensure permission is granted and the site is loaded over HTTPS."
      );
    }
  };

  const logScanEvent = async (decodedText, decodedResult) => {
    const event = {
      code: decodedText,
      type: selectedType,
      // time: new Date().toISOString(),
      // ua: navigator.userAgent,
    };

    console.log("QR SCAN EVENT:", event, decodedResult);

    const logs = JSON.parse(localStorage.getItem("scanLogs") || "[]");
    logs.push(event);
    localStorage.setItem("scanLogs", JSON.stringify(logs));

    try {
      await fetch(`${baseurl}/logs/scans`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch (_) {
      // logging failures can be ignored
    }
  };

  useEffect(() => {
    if (qrDetected && detectedQrCode) {
      logScanEvent(detectedQrCode, null);
    }
  }, [qrDetected, detectedQrCode]);

  const stopScanner = async () => {
    const instance = html5QrCodeRef.current;
    if (!instance) return;

    try {
      await instance.stop();
      await instance.clear();
    } catch (err) {
      console.warn("Error stopping scanner:", err);
    } finally {
      html5QrCodeRef.current = null;
      setScannerInitialized(false);
    }
  };

  const markAttendance = async (qrCode) => {
    setIsLoading(true);
    setMessage("⏳ Processing attendance...");

    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setMessage("❌ Authentication required. Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // This matches exactly what your backend expects
      const requestBody = {
        code: qrCode, // The QR code string
        type: selectedType, // 'check-in' or 'check-out'
        // location: { latitude: 0, longitude: 0, accuracy: 0 },
        // deviceInfo: { deviceId: `web-${Date.now()}`, platform: "web" },
      };

      console.log("Sending request body:", requestBody); // Debug

      const response = await fetch(`${baseurl}/attend/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`, // Make sure Bearer is included
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Backend response:", data); // Debug

      if (response.ok) {
        const successMessage = `✅ ${
          selectedType === "check-in" ? "Check-in" : "Check-out"
        } successful!`;
        setMessage(successMessage);

        setTimeout(() => {
          navigate("/animation", {
            state: {
              type: selectedType,
              success: true,
              message: successMessage,
            },
          });
        }, 1500);
      } else {
        const errorMessage = data.message || "Attendance marking failed";
        setMessage(`❌ ${errorMessage}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage("❌ Network error. Please check the connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = async () => {
    await stopScanner();
    if (selectedType && !showTypeSelector) {
      setShowTypeSelector(true);
      setSelectedType(null);
      setMessage("");
      setQrDetected(false);
      setDetectedQrCode("");
      // ADDED: reset processing guard on back
      processingRef.current = false;
    } else {
      navigate("/dashboard");
    }
  };

  // MODIFIED: prevent auto-restart after a detection/while processing
  useEffect(() => {
    if (
      !showTypeSelector &&
      selectedType &&
      !scannerInitialized &&
      !qrDetected &&
      !processingRef.current
    ) {
      requestAnimationFrame(() => startScanner());
    }
  }, [showTypeSelector, selectedType, scannerInitialized, qrDetected]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-screen h-[100dvh] gap-4 pt-[70px] pb-[30px] px-4">
      {/* Close/Back Button */}
      <img
        onClick={goBack}
        src="/cross.png"
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

      {/* Main Content */}
      {showTypeSelector ? (
        /* Type Selection Buttons */
        <div className="flex flex-col gap-4 w-[350px] max-w-[90vw]">
          <button
            onClick={() => handleTypeSelection("check-in")}
            className="flex justify-center items-center rounded-lg text-sm font-medium gap-3 
              bg-green-500 hover:bg-green-600 text-white w-full h-[48px] shadow-[0px_4px_4px_0px_#00000040] 
              active:shadow-[0px_2px_1px_0px_#00000040] transition-all duration-200"
          >
            Check In
            <img src="/check.png" className="h-[15px] invert" alt="Check In" />
          </button>

          <button
            onClick={() => handleTypeSelection("check-out")}
            className="flex justify-center items-center rounded-lg text-sm font-medium gap-3 
              bg-red-500 hover:bg-red-600 text-white w-full h-[48px] shadow-[0px_4px_4px_0px_#00000040] 
              active:shadow-[0px_2px_1px_0px_#00000040] transition-all duration-200"
          >
            Check Out
            <img
              src="/check.png"
              className="h-[15px] invert"
              alt="Check Out"
            />
          </button>
        </div>
      ) : (
        /* QR Scanner Section */
        <div className="w-full max-w-md">
          <div
            ref={readerRef}
            id="qr-reader"
            className="mb-4 rounded-lg overflow-hidden border-2 border-gray-200"
            style={{ width: "100%" }}
          />

          {isLoading && (
            <div className="text-center mb-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
              <p className="text-sm text-gray-600">Processing...</p>
            </div>
          )}

          {message && (
            <div
              className={`text-center mb-4 p-3 rounded-lg font-medium ${
                message.includes("✅") || qrDetected
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : message.includes("❌")
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : message.includes("⚠️")
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              {message}
              {qrDetected && detectedQrCode && (
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded border">
                  <strong>Detected Code:</strong> {detectedQrCode}
                </div>
              )}
            </div>
          )}

          {!scannerInitialized && !isLoading && !message.includes("❌") && (
            <div className="text-center mb-4">
              <button
                onClick={startScanner}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg mb-2 transition duration-200"
              >
                📷 Start Camera
              </button>
              <p className="text-xs text-gray-500">
                Make sure to allow camera permissions when prompted
              </p>
            </div>
          )}

          {message.includes("❌") && !isLoading && (
            <div className="text-center mb-4">
              <button
                onClick={() => {
                  setScannerInitialized(false);
                  setMessage("");
                  setQrDetected(false);
                  setDetectedQrCode("");
                  // ADDED: reset processing guard on retry
                  processingRef.current = false;
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={goBack}
        disabled={isLoading}
        className="w-full max-w-md mt-6 bg-gray-500 hover:bg-gray-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
      >
        {showTypeSelector ? "🏠 Back to Dashboard" : "⬅️ Back"}
      </button>
    </div>
  );
};

export default Qrcode;
