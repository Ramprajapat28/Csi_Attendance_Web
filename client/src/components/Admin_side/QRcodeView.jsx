import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  FileText,
  BarChart3,
  QrCode,
  Home,
  TrendingUp,
  Clock,
  UserCheck,
  RefreshCw,
  Download,
} from "lucide-react";

const QRcodeView = () => {
  const { baseurl } = useAuth();
  const [qrCodes, setQrCodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  // Dummy data fallback
  const dummyData = {
    checkIn: {
      qrImageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      code: "dummy_checkin_code_123",
      usageCount: 12,
      type: "check-in",
      active: true
    },
    checkOut: {
      qrImageData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      code: "dummy_checkout_code_456",
      usageCount: 10,
      type: "check-out", 
      active: true
    }
  };

  // Fetch QR codes from backend
  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`${baseurl}/admin/qrcodes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ QR Codes fetched successfully:", data);
        
        // 🔧 FIX: Map the backend response to frontend expected structure
        const mappedQrCodes = {
          checkIn: data.checkInQRCode ? {
            qrImageData: data.checkInQRCode.qrImageData,
            code: data.checkInQRCode.code,
            usageCount: data.checkInQRCode.usageCount,
            type: data.checkInQRCode.qrType,
            active: data.checkInQRCode.active,
            id: data.checkInQRCode.id || data.checkInQRCode._id
          } : null,
          checkOut: data.checkOutQRCode ? {
            qrImageData: data.checkOutQRCode.qrImageData,
            code: data.checkOutQRCode.code,
            usageCount: data.checkOutQRCode.usageCount,
            type: data.checkOutQRCode.qrType,
            active: data.checkOutQRCode.active,
            id: data.checkOutQRCode.id || data.checkOutQRCode._id
          } : null
        };
        
        setQrCodes(mappedQrCodes);
      } else {
        console.warn("❌ Backend error, using dummy data");
        setQrCodes(dummyData);
      }
    } catch (error) {
      console.error("❌ Failed to fetch QR codes, using dummy data:", error);
      setQrCodes(dummyData);
      setError("Failed to fetch QR codes from server");
    } finally {
      setLoading(false);
    }
  };

  // Regenerate QR codes
  const regenerateQRCodes = async (type = "both") => {
    try {
      setRegenerating(true);
      const token = localStorage.getItem("accessToken");
      
      const response = await fetch(`${baseurl}/admin/qrcodes/regenerate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ QR Codes regenerated:", data);
        // Refresh the QR codes
        fetchQRCodes();
      } else {
        console.error("❌ Failed to regenerate QR codes");
        alert("Failed to regenerate QR codes");
      }
    } catch (error) {
      console.error("❌ Error regenerating QR codes:", error);
      alert("Error regenerating QR codes");
    } finally {
      setRegenerating(false);
    }
  };

  // Download QR code
  const downloadQRCode = (qrImageData, type) => {
    const link = document.createElement('a');
    link.href = qrImageData;
    link.download = `${type}-qr-code.png`;
    link.click();
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        <p className="ml-4">Loading QR Codes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <QrCode className="mr-3" size={32} />
            QR Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your organization's check-in and check-out QR codes
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => fetchQRCodes()}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center transition-colors"
          >
            <RefreshCw className="mr-2" size={16} />
            Refresh
          </button>
          
          <button
            onClick={() => regenerateQRCodes("both")}
            disabled={regenerating}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center transition-colors"
          >
            <RefreshCw className={`mr-2 ${regenerating ? 'animate-spin' : ''}`} size={16} />
            {regenerating ? 'Regenerating...' : 'Regenerate All'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
          <p className="font-bold">⚠️ Warning</p>
          <p>{error}</p>
          <p className="text-sm mt-1">Showing dummy data for demonstration.</p>
        </div>
      )}

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Check-In QR Code */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-green-600 flex items-center">
              <UserCheck className="mr-2" size={24} />
              Check-In QR Code
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => downloadQRCode(qrCodes?.checkIn?.qrImageData, 'check-in')}
                className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                title="Download QR Code"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => regenerateQRCodes("check-in")}
                disabled={regenerating}
                className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                title="Regenerate Check-In QR"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-4 mb-4 inline-block">
              {/* 🔧 FIX: Use qrImageData instead of qrImage */}
              <img
                src={qrCodes?.checkIn?.qrImageData || dummyData.checkIn.qrImageData}
                alt="Check-In QR Code"
                className="w-48 h-48 mx-auto border border-gray-200 rounded"
                onError={(e) => {
                  console.error("Failed to load check-in QR image");
                  e.target.src = dummyData.checkIn.qrImageData;
                }}
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Code:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {qrCodes?.checkIn?.code || dummyData.checkIn.code}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Usage Count:</span>
                <span className="font-semibold text-green-600">
                  {qrCodes?.checkIn?.usageCount || dummyData.checkIn.usageCount}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (qrCodes?.checkIn?.active ?? dummyData.checkIn.active)
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {(qrCodes?.checkIn?.active ?? dummyData.checkIn.active) ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Check-Out QR Code */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-red-600 flex items-center">
              <Clock className="mr-2" size={24} />
              Check-Out QR Code
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => downloadQRCode(qrCodes?.checkOut?.qrImageData, 'check-out')}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Download QR Code"
              >
                <Download size={18} />
              </button>
              <button
                onClick={() => regenerateQRCodes("check-out")}
                disabled={regenerating}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                title="Regenerate Check-Out QR"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-50 rounded-lg p-4 mb-4 inline-block">
              {/* 🔧 FIX: Use qrImageData instead of qrImage */}
              <img
                src={qrCodes?.checkOut?.qrImageData || dummyData.checkOut.qrImageData}
                alt="Check-Out QR Code"
                className="w-48 h-48 mx-auto border border-gray-200 rounded"
                onError={(e) => {
                  console.error("Failed to load check-out QR image");
                  e.target.src = dummyData.checkOut.qrImageData;
                }}
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Code:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {qrCodes?.checkOut?.code || dummyData.checkOut.code}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Usage Count:</span>
                <span className="font-semibold text-red-600">
                  {qrCodes?.checkOut?.usageCount || dummyData.checkOut.usageCount}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  (qrCodes?.checkOut?.active ?? dummyData.checkOut.active)
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {(qrCodes?.checkOut?.active ?? dummyData.checkOut.active) ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📱 How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-semibold mb-2">For Employees:</h4>
            <ul className="space-y-1">
              <li>• Scan Check-In QR when arriving</li>
              <li>• Scan Check-Out QR when leaving</li>
              <li>• Ensure location services are enabled</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">For Admins:</h4>
            <ul className="space-y-1">
              <li>• Monitor usage counts</li>
              <li>• Regenerate QR codes if needed</li>
              <li>• Download QR codes for display</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRcodeView;
