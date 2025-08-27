import { useEffect, useState } from "react";
import api from "../lib/apiClient";

export default function Records() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/attend/records?limit=20&page=1");
        setRows(data.records || []);
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load records");
      }
    })();
  }, []);

  return (
    <div className="card">
      <h1 className="mb-3 text-2xl font-semibold">Attendance Records</h1>
      {err && <p className="text-red-400">{err}</p>}
      <div className="mt-2 overflow-auto rounded-md border border-neutral-800">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-900">
            <tr>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">Verified</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-t border-neutral-800">
                <td className="px-3 py-2">
                  {r.userId?.name} ({r.userId?.email})
                </td>
                <td className="px-3 py-2">{r.type}</td>
                <td className="px-3 py-2">
                  {new Date(r.timestamp).toLocaleString()}
                </td>
                <td className="px-3 py-2">{String(r.verified)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
