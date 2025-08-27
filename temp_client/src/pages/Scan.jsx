import { useEffect, useState } from "react";
import api from "../lib/apiClient";

function getDeviceInfo() {
  return {
    deviceId: navigator?.hardwareConcurrency
      ? `cpu-${navigator.hardwareConcurrency}`
      : "web",
    platform: navigator?.platform || "web",
    userAgent: navigator?.userAgent || "unknown",
  };
}

async function getFingerprint() {
  // Minimal placeholder; consider integrating FingerprintJS in production
  const key = "fpv1";
  let fp = localStorage.getItem(key);
  if (!fp) {
    fp = btoa(`${navigator.userAgent}-${Date.now()}-${Math.random()}`);
    localStorage.setItem(key, fp);
  }
  return fp;
}

export default function Scan() {
  const [status, setStatus] = useState(null);
  const [qr, setQr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/qrcode/active?qrType=check-in");
        setQr(data);
      } catch (e) {
        setStatus({
          error: e?.response?.data?.message || "Failed to load active QR",
        });
      }
    })();
  }, []);

  const scan = async () => {
    setStatus(null);
    try {
      const pos = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const location = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      const fingerprint = await getFingerprint();
      const deviceInfo = { ...getDeviceInfo(), ipAddress: undefined };
      const payload = {
        code: qr?.code,
        location,
        type: "check-in",
        deviceInfo,
        fingerprint,
      };
      const { data } = await api.post("/attend/scan", payload);
      setStatus({ ok: data });
    } catch (e) {
      setStatus({ error: e?.response?.data?.message || "Scan failed" });
    }
  };

  return (
    <div className="card">
      <h1 className="mb-3 text-2xl font-semibold">Scan QR</h1>
      {qr ? (
        <>
          <img
            alt="QR"
            className="mx-auto my-4 h-56 w-56 rounded-lg border border-neutral-800 bg-neutral-900"
            src={qr.qrImageData}
          />
          <button className="btn" onClick={scan}>
            Send Scan
          </button>
        </>
      ) : (
        <p className="text-neutral-400">Loading active QR…</p>
      )}
      {status?.ok && (
        <pre className="mt-4 overflow-auto rounded-md bg-neutral-900 p-3 text-sm">
          {JSON.stringify(status.ok, null, 2)}
        </pre>
      )}
      {status?.error && <p className="mt-3 text-red-400">{status.error}</p>}
    </div>
  );
}
