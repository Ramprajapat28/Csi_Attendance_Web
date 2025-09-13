// import React, { useEffect, useRef, useState } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";
// import "react-toastify/dist/ReactToastify.css";

// const Qrcode = () => {
//   const navigate = useNavigate();
//   const html5QrCodeRef = useRef(null);
//   const [isCheckedIn, setIsCheckedIn] = useState(() => {
//     const inT = localStorage.getItem("checkInTime");
//     const outT = localStorage.getItem("checkOutTime");
//     return !!inT && !outT;
//   });

//   const [data, setData] = useState("No result");
//   const [scannerRunning, setScannerRunning] = useState(false);

//   const cancel = () => navigate("/");

//   const isValidURL = (str) => {
//     try {
//       new URL(str);
//       return true;
//     } catch {
//       return false;
//     }
//   };
//   const handleScanning = async (decodedText) => {
//     const baseurl = "https://csi-attendance-web-s1yf.onrender.com"; // or your real backend URL

//   try {
//     const res = await axios.post(
//       `${baseurl}/attend/scan`,
//       { code : decodedText ,
//         type : isCheckedIn ? "Check Out" : "Check In",
//       },
//       {header:{Authorization : `Bearer ${token}`,},
//       withCredentials: true ,}
//     );
//     const qrData = JSON.parse(decodedText);
//     const token = localStorage.getItem("token");
//     // const res = await axios.post(
//     //   `${baseurl}/attend/scan`,
//     //   // { code : decodedText },
//     //   qrData,
//     //   {header:{Authorization : `Bearer ${token}`,},
//     //   withCredentials: true ,}
//     // );

//     if (res.data) {
//       console.log("Response:", res.data);
//       navigate("/Complete");
//     }
//   } catch (error) {
//     console.error("Scan failed:", error.response?.data || error.message);
//   }
// };

//   // ✅ Send scanned data to backend
//     // const handleScanning = async (e) => {
//     //   try {
//     //     const res = await axios.post(`${baseurl}/attend/scan`, 
//     //     {data: decodedText}, // or str: decodedText if backend expects "str"
//     //     {withCredentials: true,}
//     //   );
//     //   if (res.data) {
//     //     // login(res.data.user, res.data.accessToken);
//     //     // toast.success("Login successful!");
//     //     navigate("/Complete");
//     //   }
//     // } catch (error) {
//     //   // toast.error(error.response?.data?.message || "Login error");
//     // }
//   //     e?.preventDefault();
        
  
//   // .then((res) => {
//   //   console.log("Data sent to backend:", res.data.code); 
//   //   // Handle success, navigate or show message if needed
//   //   toast.success("QR processed!");
//   // })
//   // .catch((error) => {
//   //   console.error("Error sending to backend:", error.response?.data || error.message);
//   //   // Optional: show toast or alert
//   //   toast.error("Failed to process QR code");

//   // });
// // }

//   const handleCheckIn = () => {
//     const now = new Date();
//     localStorage.setItem("checkInTime", now.toISOString());
//     localStorage.removeItem("checkOutTime");
//     setIsCheckedIn(true);
//     localStorage.setItem("token",res.data.token);
//     navigate("/Complete");
//   };

//   const handleCheckOut = () => {
//     const now = new Date();
//     localStorage.setItem("checkOutTime", now.toISOString());
//     setIsCheckedIn(false);
//     navigate("/Dashboard");
//   };

//   const handleToggle = () => {
//     handleScanning();
//     if (isCheckedIn) handleCheckOut();
//     else handleCheckIn();
//   };

//   useEffect(() => {
//     const saved = localStorage.getItem("scannedData");
//     if (saved) setData(saved);

//     const elementId = "qr-reader";
//     html5QrCodeRef.current = new Html5Qrcode(elementId);

//     Html5Qrcode.getCameras()
//       .then((devices) => {
//         if (!devices || devices.length === 0) {
//           alert("No camera found");
//           return;
//         }

//         const cameraId = devices[0].id;
//         html5QrCodeRef.current
//           .start(
//             cameraId,
//             { fps: 10, qrbox: { width: 300, height: 300 },aspectRatio: 0.7, disableFlip: true },
//             (decodedText) => {
//               console.log(decodedText);
//               setData(decodedText);
//               localStorage.setItem("scannedData", decodedText);
//               handleScanning(decodedText); 

//               // Stop scanner safely
//               if (html5QrCodeRef.current && scannerRunning) {
//                 html5QrCodeRef.current
//                   .stop()
//                   .then(() => {
//                     html5QrCodeRef.current.clear();
//                     setScannerRunning(false);

//                     // Open URL if scanned QR is a valid link
//                     if (isValidURL(decodedText)) {
//                       window.location.href = decodedText;
//                     }
//                   })
//                   .catch(() => console.warn("Scanner stop failed"));
//               }
//             }
//           )
//           .then(() => setScannerRunning(true))
//           .catch(() => alert("Failed to start scanner"));
//       })
//       // .catch(() => alert("Camera access denied"));

//     return () => {
//       if (html5QrCodeRef.current && scannerRunning) {
//         html5QrCodeRef.current
//           .stop()
//           .then(() => html5QrCodeRef.current.clear())
//           .catch(() => console.warn("Cleanup stop failed"));
//       }
//     };
//   }, []);

//   return (
//     <div className="flex flex-col items-center justify-center w-screen h-[100dvh] gap-4 pt-[70px] pb-[30px]">
//       {/* Close Button */}
//       <img
//         onClick={cancel}
//         src="/src/assets/cross.png"
//         className="h-[12px] absolute right-[15px] top-[25px] cursor-pointer"
//         alt="Cancel"
//       />

//       {/* Title */}
//       <div className="text flex flex-col items-center justify-center gap-0.5">
//         <span className="font-bold text-lg">Scan Code</span>
//         <span className="font-medium text-gray-400 text-xs">
//           Scan QR Code to check securely
//         </span>
//       </div>

//       {/* Scanner */}
//       <div
//         id="qr-reader"
//         className="w-[350px] rounded-[22px] m-auto flex overflow-hidden"
//       />

//       {/* Toggle Button */}
//       <button
//         onClick={handleToggle}
//         className={`flex justify-center items-center rounded-lg text-sm font-medium gap-3 
//           ${isCheckedIn ? "bg-red-500" : "bg-[#1D61E7]"} 
//           text-white w-[350px] h-[48px] shadow-[0px_4px_4px_0px_#00000040] 
//           active:shadow-[0px_2px_1px_0px_#00000040] transition-all duration-100`}
//       >
//         {isCheckedIn ? "Check Out" : "Check In"}
//         <img
//           src="/src/assets/check.png"
//           className="h-[15px] invert-100"
//           alt="Check"
//         />
//       </button>
//     </div>
//   );
// };

// export default Qrcode;
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Qrcode = () => {
  const navigate = useNavigate();
  const html5QrCodeRef = useRef(null);
  const [scannerRunning, setScannerRunning] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    const inT = localStorage.getItem("checkInTime");
    const outT = localStorage.getItem("checkOutTime");
    return !!inT && !outT;
  });

  const cancel = () => navigate("/");

  const isValidURL = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleScanning = async (decodedText) => {
    const baseurl = "https://csi-attendance-web-s1yf.onrender.com";

    try {
      const qrData = JSON.parse(decodedText);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found in localStorage.");
      }

      const res = await axios.post(
        `${baseurl}/attend/scan`,
        qrData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log("Scan successful:", res.data);

      // Update check-in state
      if (res.data.type === "check-in") {
        localStorage.setItem("checkInTime", new Date().toISOString());
        localStorage.removeItem("checkOutTime");
        setIsCheckedIn(true);
      } else if (res.data.type === "check-out") {
        localStorage.setItem("checkOutTime", new Date().toISOString());
        setIsCheckedIn(false);
      }

      navigate("/Complete");

    } catch (error) {
      console.error("Scan failed:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
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
            { fps: 10, qrbox: { width: 300, height: 300 }, aspectRatio: 0.7, disableFlip: true },
            (decodedText) => {
              console.log("QR scanned:", decodedText);
              localStorage.setItem("scannedData", decodedText);
              handleScanning(decodedText);

              // Stop scanner after scan
              if (html5QrCodeRef.current && scannerRunning) {
                html5QrCodeRef.current.stop().then(() => {
                  html5QrCodeRef.current.clear();
                  setScannerRunning(false);

                  if (isValidURL(decodedText)) {
                    window.location.href = decodedText;
                  }
                }).catch(() => console.warn("Scanner stop failed"));
              }
            }
          )
          .then(() => setScannerRunning(true))
          .catch(() => alert("Failed to start scanner"));
      });

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
        onClick={() => {}}
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
// Qrcode.jsx

// import React, { useEffect, useRef, useState } from "react";
// import { Html5Qrcode } from "html5-qrcode";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// const Qrcode = () => {
//   const navigate = useNavigate();
//   const html5QrCodeRef = useRef(null);

//   const [scannerRunning, setScannerRunning] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [data, setData] = useState("No result");

//   const baseurl = "https://csi-attendance-web-s1yf.onrender.com"; // your backend

//   const cancel = () => {
//     navigate("/");
//   };

//   const isValidURL = (str) => {
//     try {
//       new URL(str);
//       return true;
//     } catch {
//       return false;
//     }
//   };

//   const handleScanning = async (decodedText) => {
//     // decodedText might be JSON string or plain string depending on QR
//     let parsedData = null;
//     try {
//       parsedData = JSON.parse(decodedText);
//     } catch(e) {
//       // If it's not JSON, wrap it
//       parsedData = { codeData: decodedText };
//     }

//     const token = localStorage.getItem("token");
//     if (!token) {
//       console.error("Scan failed: No token found in localStorage.");
//       setErrorMessage("You must login first.");
//       navigate("/login");  // redirect to login if needed
//       return;
//     }

//     try {
//       const res = await axios.post(
//         `${baseurl}/attend/scan`,
//         parsedData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//           withCredentials: true,
//         }
//       );
//       console.log("Scan successful:", res.data);
//       // navigate to success page
//       navigate("/Complete");
//     } catch (error) {
//       console.error("Scan failed:", error.response?.data || error.message);
//       setErrorMessage(
//         error.response?.data?.message || "Scan request failed."
//       );
//     }
//   };

//   useEffect(() => {
//     const elementId = "qr-reader";
//     html5QrCodeRef.current = new Html5Qrcode(elementId);

//     Html5Qrcode.getCameras()
//       .then((devices) => {
//         if (!devices || devices.length === 0) {
//           setErrorMessage("No camera found");
//           return;
//         }
//         const cameraId = devices[0].id;

//         html5QrCodeRef.current
//           .start(
//             cameraId,
//             { fps: 10, qrbox: { width: 300, height: 300 }, aspectRatio: 1.0, disableFlip: true },
//             (decodedText) => {
//               console.log("Decoded:", decodedText);
//               setData(decodedText);
//               localStorage.setItem("scannedData", decodedText);

//               handleScanning(decodedText);

//               // stop scanner
//               if (html5QrCodeRef.current && scannerRunning) {
//                 html5QrCodeRef.current
//                   .stop()
//                   .then(() => {
//                     html5QrCodeRef.current.clear();
//                     setScannerRunning(false);

//                     if (isValidURL(decodedText)) {
//                       window.location.href = decodedText;
//                     }
//                   })
//                   .catch((err) => {
//                     console.warn("Scanner stop failed", err);
//                   });
//               }
//             }
//           )
//           .then(() => {
//             setScannerRunning(true);
//           })
//           .catch((err) => {
//             console.error("Failed to start scanner", err);
//             setErrorMessage("Failed to start scanner");
//           });
//       })
//       .catch((err) => {
//         console.error("Error getting cameras", err);
//         setErrorMessage("Error accessing camera");
//       });

//     return () => {
//       if (html5QrCodeRef.current && scannerRunning) {
//         html5QrCodeRef.current
//           .stop()
//           .then(() => {
//             html5QrCodeRef.current.clear();
//           })
//           .catch((err) => console.warn("Cleanup stop failed", err));
//       }
//     };
//   }, [scannerRunning]);

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Scan QR Code</h2>
//       {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
//       <div id="qr-reader" style={{ width: 350, height: 350, border: "1px solid #ccc" }}></div>
//       <div>Scanned data: {data}</div>
//       <button onClick={cancel}>Cancel</button>
//     </div>
//   );
// };

// export default Qrcode;
