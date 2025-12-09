"use client";

import { useEffect, useState } from "react";

interface AdminUser {
  _id: string;
  email: string;
  role: string;
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [versions, setVersions] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const loadAdmins = async () => {
    setMessage("");
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok && data.success) {
      setAdmins(data.data);
    } else {
      setMessage(data.message || "Failed to load admins");
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, versions }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setEmail("");
      setPassword("");
      setRole("admin");
      setVersions([]);
      loadAdmins();
      setMessage("Admin created");
    } else {
      setMessage(data.message || "Failed to create admin");
    }
  };

  const deleteAdmin = async (id: string) => {
    setMessage("");
    const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok && data.success) {
      loadAdmins();
    } else {
      setMessage(data.message || "Failed to delete admin");
    }
  };

  return (
    <div className="container py-3">
      <h3>Manage Admins</h3>
      {message && <p>{message}</p>}

      <form onSubmit={createAdmin} style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #dee2e6" }}
            required
          />
          <input
            type="text"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 8, borderRadius: 6, border: "1px solid #dee2e6" }}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
            <option value="user">user</option>
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {(["v1","v2","v3","v4"] as const).map((v) => (
              <label key={v} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <input
                  type="checkbox"
                  checked={versions.includes(v)}
                  onChange={(e) => {
                    setVersions((prev) => {
                      if (e.target.checked) return [...prev, v];
                      return prev.filter((x) => x !== v);
                    });
                  }}
                />
                {v}
              </label>
            ))}
          </div>
          <button type="submit" style={{ padding: 8, borderRadius: 6 }}>Create</button>
        </div>
      </form>

      <table className="table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Versions</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a._id}>
              <td>{a.email}</td>
              <td>{a.role}</td>
              <td>{Array.isArray((a as any).versions) && (a as any).versions.length ? (a as any).versions.join(", ") : "-"}</td>
              <td>
                <button onClick={() => deleteAdmin(a._id)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
