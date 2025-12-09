"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface WhatsAppData {
  newCustomer?: string;
  deposit?: string;
  withdrawal?: string;
  support?: string;
}

const versions = ["v1", "v2", "v3", "v4"] as const;

type Version = typeof versions[number];

export default function AllWhatsAppPage() {
  const [byVersion, setByVersion] = useState<Record<Version, WhatsAppData>>({ v1: {}, v2: {}, v3: {}, v4: {} });
  const [version, setVersion] = useState<Version>("v1");
  const [form, setForm] = useState<WhatsAppData>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const results = await Promise.all(
        versions.map(async (v) => {
          const res = await fetch(`/api/whatsapp/version?version=${v}`);
          const data = await res.json();
          return { v, rows: data || {} } as { v: Version; rows: WhatsAppData };
        })
      );
      const grouped: Record<Version, WhatsAppData> = { v1: {}, v2: {}, v3: {}, v4: {} };
      results.forEach(({ v, rows }) => (grouped[v] = rows));
      setByVersion(grouped);
      setForm(grouped[version] || {});
    } catch (e) {
      setMessage("Failed to load WhatsApp data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setForm(byVersion[version] || {});
  }, [version, byVersion]);

  const handleChange = (key: keyof WhatsAppData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`/api/whatsapp/version?version=${version}`,
        {
          newCustomer: form.newCustomer || "",
          deposit: form.deposit || "",
          withdrawal: form.withdrawal || "",
          support: form.support || "",
        }
      );
      if (res.data?.success) {
        setMessage("Saved ✅");
        await load();
      } else {
        setMessage("Save failed ❌");
      }
    } catch (e) {
      setMessage("Save failed ❌");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2500);
    }
  };

  return (
    <div className="container py-3">
      <h3>All WhatsApp Numbers (v1–v4)</h3>
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="fw-bold">Version:</span>
        <select
          className="form-select w-auto"
          value={version}
          onChange={(e) => setVersion(e.target.value as Version)}
        >
          {versions.map((v) => (
            <option key={v} value={v}>{v.toUpperCase()}</option>
          ))}
        </select>
      </div>
      {message && <p>{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <div className="card p-3 shadow-sm mb-3">
            <h5 className="mb-2">Edit WhatsApp Numbers for {version.toUpperCase()}</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">New Customer</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.newCustomer || ""}
                  onChange={(e) => handleChange("newCustomer", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Deposit</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.deposit || ""}
                  onChange={(e) => handleChange("deposit", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Withdrawal</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.withdrawal || ""}
                  onChange={(e) => handleChange("withdrawal", e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Support</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.support || ""}
                  onChange={(e) => handleChange("support", e.target.value)}
                />
              </div>
             
            </div>
            <button className="btn btn-success mt-3" onClick={handleSave} disabled={loading}>
              {loading ? "Saving..." : "Save / Update"}
            </button>
          </div>

          <div className="card p-3 shadow-sm">
            <h5 className="mb-2">Current Values</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>New Customer</th>
                    <th>Deposit</th>
                    <th>Withdrawal</th>
                    <th>Support</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{byVersion[version].newCustomer || "-"}</td>
                    <td>{byVersion[version].deposit || "-"}</td>
                    <td>{byVersion[version].withdrawal || "-"}</td>
                    <td>{byVersion[version].support || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
