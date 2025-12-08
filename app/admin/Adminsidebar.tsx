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
            <h5 className="mb-0">Admin Dashboard</h5>
            <button
              className="btn btn-danger btn-sm"
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
