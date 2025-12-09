"use client";
import React, { useState, createContext, useContext, ReactNode } from "react";
import Link from "next/link";

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const SearchContext = createContext<SearchContextType>({
  searchQuery: "",
  setSearchQuery: () => {},
});

export const useAdminSearch = () => useContext(SearchContext);

interface AdminLayoutProps {
  children: ReactNode;
  version: string;
}

const AdminLayout = ({ children, version }: AdminLayoutProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState<string>("");

  // Read role from cookie on client
  if (typeof window !== "undefined" && !role) {
    const match = document.cookie.match(/(?:^|; )admin-role=([^;]+)/);
    if (match) setRole(decodeURIComponent(match[1]));
  }

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div className="d-flex min-vh-100">
        {/* SIDEBAR */}
        <div
          className={`bg-dark text-white p-3 sidebar ${
            open ? "d-block" : "d-none d-md-block"
          }`}
          style={{ width: "240px" }}
        >
          <h4 className="text-center mb-4">Admin Panel</h4>
          <ul className="nav flex-column gap-2">
            <li className="nav-item">
              <Link href={`/${version}/admin`} className="nav-link text-white">
                📊 Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${version}/admin/dicerolls`} className="nav-link text-white">
                🎲 Dice Rolls
              </Link>
            </li>
            <li className="nav-item">
              <Link href={`/${version}/admin/whatsappnumber`} className="nav-link text-white">
                📞 WhatsApp Number
              </Link>
            </li>
            {role === "superadmin" && (
              <>
                <li className="nav-item">
                  <Link href={`/admin`} className="nav-link text-white">
                    🧭 Admin Home
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href={`/admin/users`} className="nav-link text-white">
                    👤 Manage Admins
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href={`/admin/all-rolls`} className="nav-link text-white">
                    📚 All Rolls (v1–v4)
                  </Link>
                </li>
                <li className="nav-item">
                  <Link href={`/admin/all-whatsapp`} className="nav-link text-white">
                    📞 All WhatsApp Numbers
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-grow-1">
          {/* HEADER */}
          <header className="bg-primary text-white d-flex align-items-center justify-content-between px-3 py-2 shadow">
            <button
              className="btn btn-light d-md-none"
              onClick={() => setOpen(!open)}
            >
              ☰
            </button>
            <div className="d-flex align-items-center gap-2">
              <h5 className="mb-0">Admin Dashboard</h5>
              {role === "superadmin" && (
                <div className="d-none d-md-flex align-items-center gap-1 ms-3">
                  <span className="badge bg-light text-dark">Switch:</span>
                  <Link href="/v1/admin" className="btn btn-outline-light btn-sm">v1</Link>
                  <Link href="/v2/admin" className="btn btn-outline-light btn-sm">v2</Link>
                  <Link href="/v3/admin" className="btn btn-outline-light btn-sm">v3</Link>
                  <Link href="/v4/admin" className="btn btn-outline-light btn-sm">v4</Link>
                </div>
              )}
              <button
                className="btn btn-danger btn-sm ms-2"
                onClick={async () => {
                  try {
                    const res = await fetch("/logout", { method: "POST" });
                    if (res.ok) {
                      window.location.href = "/login";
                    }
                  } catch (_) {}
                }}
              >
                Logout
              </button>
            </div>
          </header>

          {/* SEARCH INPUT */}
          <div className="bg-light p-2 shadow-sm">
            <div className="container text-center">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  maxWidth: "350px",
                  width: "100%",
                  margin: "",
                }}
              />
            </div>
          </div>

          <main className="p-3 bg-light min-vh-100">{children}</main>
        </div>
      </div>
    </SearchContext.Provider>
  );
};

export default AdminLayout;
