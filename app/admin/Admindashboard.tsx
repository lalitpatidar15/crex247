"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAdminSearch } from "./Adminsidebar";

interface RollType {
  _id: string;
  number: number;
  reward: number;
  code: string;
  instantId: string;
  createdAt: string;
  claimed?: boolean;
}

const AdminDashboard = ({version}: {version: string}) => {
  const [rolls, setRolls] = useState<RollType[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { searchQuery } = useAdminSearch();

  const fetchRolls = async () => {
    try {
      const res = await axios.get(`/api/admin/rolls?version=${version}`);
      if (Array.isArray(res.data.data)) {
        setRolls(res.data.data);
      } else {
        setRolls([]);
      }
    } catch (error) {
      console.error("Admin Fetch Error:", error);
      setRolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolls();
  }, []);

  const handleClaim = async (id: string) => {
    try {
      const res = await axios.post("/api/admin/rolls", {
        action: "claim",
        id,
        version,
      });

      if (res.data.success) {
        setMessage(" Reward Claimed Successfully");

        setRolls((prev) =>
          prev.map((roll) =>
            roll._id === id ? { ...roll, claimed: true } : roll
          )
        );

        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      alert("❌ Claim Failed");
    }
  };

  const filteredRolls = rolls.filter((roll) =>
    Object.values(roll)
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-4">
      {/* ✅ VERSION HEADER */}
      <h2 className="text-center mb-2">
        Admin Dashboard 
      </h2>

      {message && (
        <div className="alert alert-success text-center">{message}</div>
      )}

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : filteredRolls.length === 0 ? (
        <p className="text-center text-danger">No rolls found</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Dice</th>
                <th>Reward</th>
                <th>Instant ID</th>
                <th>Created At</th>
                <th>Claim</th>
                <th>Version</th>
              </tr>
            </thead>

            <tbody>
              {filteredRolls.map((roll, index) => (
                <tr key={roll._id}>
                  <td>{index + 1}</td>
                  <td>{roll.number}</td>
                  <td>{roll.reward}%</td>
                  <td>{roll.code}</td>
                  <td>
                    {new Date(roll.createdAt)
                      .toISOString()
                      .replace("T", " ")
                      .slice(0, 19)}
                  </td>

                  <td>
                    <button
                      className={`btn btn-sm ${
                        roll.claimed ? "btn-secondary" : "btn-success"
                      }`}
                      disabled={roll.claimed}
                      onClick={() => handleClaim(roll._id)}
                      style={{
                        filter: roll.claimed
                          ? "blur(0.3px) brightness(1.2)"
                          : "none",
                        cursor: roll.claimed ? "not-allowed" : "pointer",
                      }}
                    >
                      {roll.claimed ? "Claimed" : "Claim"}
                    </button>
                  </td>
                  <td>{version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
