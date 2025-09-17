import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  QrCode,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const QRcodeView = () => {
  const { baseurl } = useAuth();

  const [qrCodes, setQrCodes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState(null);

  // Optional: keep dummy only for explicit fallback testing
  const dummyData = {
    checkIn: {
      qrImageData:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      code: "dummy_checkin_code_123",
      usageCount: 12,
      type: "check-in",
      active: true,
    },
    checkOut: {
      qrImageData:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      code: "dummy_checkout_code_456",
      usageCount: 10,
      type: "check-out",
      active: true,
    },
  };

  const normalizeDataUrl = (value) => {
    if (!value) return "";
    return value.startsWith("data:") ? value : `data:image/png;base64,${value}`;
  };

  // Fetch QR codes from backend
  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${baseurl}/admin/qrcodes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      // Expecting shape like:
      // { lastUpdated, organizationId, organizationName,
      //   qrCodes: { checkIn: {..., qrImage: "data:image/png;base64,..."}, checkOut: {...} },
      //   settings: {...}
      // }
      console.log("✅ QR Codes fetched successfully:", data);

      const mapped = data?.qrCodes
        ? {
            checkIn: data.qrCodes.checkIn
              ? {
                  qrImageData: normalizeDataUrl(
                    data.qrCodes.checkIn.qrImage ??
                      data.qrCodes.checkIn.qrImageData
                  ),
                  code: data.qrCodes.checkIn.code,
                  usageCount: data.qrCodes.checkIn.usageCount ?? 0,
                  type: data.qrCodes.checkIn.type || "check-in",
                  active: data.qrCodes.checkIn.active ?? true,
                  id:
                    data.qrCodes.checkIn.id ||
                    data.qrCodes.checkIn._id ||
                    undefined,
                }
              : null,
            checkOut: data.qrCodes.checkOut
              ? {
                  qrImageData: normalizeDataUrl(
                    data.qrCodes.checkOut.qrImage ??
                      data.qrCodes.checkOut.qrImageData
                  ),
                  code: data.qrCodes.checkOut.code,
                  usageCount: data.qrCodes.checkOut.usageCount ?? 0,
                  type: data.qrCodes.checkOut.type || "check-out",
                  active: data.qrCodes.checkOut.active ?? true,
                  id:
                    data.qrCodes.checkOut.id ||
                    data.qrCodes.checkOut._id ||
                    undefined,
                }
              : null,
          }
        : null;

      if (!mapped) {
        throw new Error("Unexpected response shape: missing qrCodes");
      }

      setQrCodes(mapped);
    } catch (e) {
      console.error("❌ Failed to fetch QR codes:", e);
      setError(
        e?.message || "Failed to fetch QR codes from server. Please retry."
      );
      // Comment out the next line if dummy fallback should not appear automatically
      // setQrCodes(dummyData);
    } finally {
      setLoading(false);
    }
  };

  // Regenerate QR codes
  const regenerateQRCodes = async (type = "both") => {
    try {
      setRegenerating(true);
      const token = localStorage.getItem("accessToken");

      const res = await fetch(`${baseurl}/admin/qrcodes/regenerate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }), // type: 'both' | 'check-in' | 'check-out'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ QR Codes regenerated:", data);
      await fetchQRCodes();
    } catch (e) {
      console.error("❌ Error regenerating QR codes:", e);
      setError("Failed to regenerate QR codes");
    } finally {
      setRegenerating(false);
    }
  };

  // Download QR code
  const downloadQRCode = (qrImageData, type) => {
    const link = document.createElement("a");
    link.href = normalizeDataUrl(qrImageData);
    link.download = `${type}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  useEffect(() => {
    fetchQRCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-2">Loading QR Codes…</h2>
        <p className="text-sm text-gray-600">
          Fetching the latest organization QR codes from the server.
        </p>
      </div>
    );
  }

  const Card = ({ title, data }) => (
    <div className="rounded-lg border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          {title}
        </h3>
        {data?.active ? (
          <span className="inline-flex items-center text-green-600 text-sm gap-1">
            <CheckCircle2 className="w-4 h-4" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center text-red-600 text-sm gap-1">
            <XCircle className="w-4 h-4" /> Inactive
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-[240px] h-[240px] border rounded-md flex items-center justify-center bg-white">
          {data?.qrImageData ? (
            <img
              src={normalizeDataUrl(data.qrImageData)}
              alt={`${title} QR`}
              width={240}
              height={240}
              className="object-contain"
            />
          ) : (
            <span className="text-gray-500 text-sm">No QR available</span>
          )}
        </div>

        <div className="flex-1">
          <div className="text-sm text-gray-700">
            <div>
              <span className="font-medium">Code:</span>{" "}
              <span className="break-all">{data?.code || "—"}</span>
            </div>
            <div>
              <span className="font-medium">Usage Count:</span>{" "}
              {data?.usageCount ?? 0}
            </div>
            <div>
              <span className="font-medium">Type:</span> {data?.type || "—"}
            </div>
            <div>
              <span className="font-medium">ID:</span>{" "}
              <span className="break-all">{data?.id || "—"}</span>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => downloadQRCode(data?.qrImageData, data?.type)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-gray-50"
              disabled={!data?.qrImageData}
              title="Download PNG"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            {/* <button
              type="button"
              onClick={() =>
                regenerateQRCodes(
                  data?.type === "check-in" ? "check-in" : "check-out"
                )
              }
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-60"
              disabled={regenerating}
              title="Regenerate this QR"
            >
              <RefreshCw
                className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`}
              />
              Regenerate
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Organization QR Codes</h2>
        {/* <button
          type="button"
          onClick={() => regenerateQRCodes("both")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border hover:bg-gray-50 disabled:opacity-60"
          disabled={regenerating}
          title="Regenerate both QR codes"
        >
          <RefreshCw
            className={`w-4 h-4 ${regenerating ? "animate-spin" : ""}`}
          />
          Regenerate Both
        </button> */}
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Check-in" data={qrCodes?.checkIn} />
        <Card title="Check-out" data={qrCodes?.checkOut} />
      </div>
    </div>
  );
};

export default QRcodeView;
