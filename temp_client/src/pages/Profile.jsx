import { useEffect, useState } from "react";
import api from "../lib/apiClient";

export default function Profile() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/auth2/viewProfile");
        setData(data);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load profile");
      }
    })();
  }, []);

  return (
    <div className="card">
      <h1 className="mb-3 text-2xl font-semibold">Profile</h1>
      {err && <p className="text-red-400">{err}</p>}
      {data && (
        <pre className="rounded-md bg-neutral-900 p-3 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
