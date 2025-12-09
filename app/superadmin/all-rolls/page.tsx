"use client";

import { useEffect, useState } from "react";

interface RollType {
  _id: string;
  number: number;
  reward: number;
  code: string;
  instantId: string;
  createdAt: string;
  claimed?: boolean;
}

const versions = ["v1", "v2", "v3", "v4"] as const;

type Version = typeof versions[number];

type RollWithVersion = RollType & { version: Version };

export default function AllRollsPage() {
  const [allRolls, setAllRolls] = useState<RollWithVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const results = await Promise.all(
        versions.map(async (v) => {
          const res = await fetch(`/api/admin/rolls?version=${v}`);
          const data = await res.json();
          const rows: RollType[] = Array.isArray(data.data) ? data.data : [];
          return rows.map((r) => ({ ...r, version: v })) as RollWithVersion[];
        })
      );
      const flattened = results.flat();
      setAllRolls(flattened);
    } catch (e) {
      setMessage("Failed to load rolls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container py-3">
      <h3>All Rolls</h3>
      {message && <p>{message}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>S.No</th>
                <th>Version</th>
                <th>Dice</th>
                <th>Reward</th>
                <th>Instant ID</th>
                <th>Created At</th>
                <th>Claim</th>
              </tr>
            </thead>
            <tbody>
              {allRolls.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted">No rolls</td>
                </tr>
              ) : (
                allRolls.map((roll, index) => (
                  <tr key={`${roll.version}-${roll._id}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{roll.version.toUpperCase()}</td>
                    <td>{roll.number}</td>
                    <td>{roll.reward}%</td>
                    <td>{roll.code}</td>
                    <td>{new Date(roll.createdAt).toISOString().replace("T", " ").slice(0, 19)}</td>
                    <td>{roll.claimed ? "Claimed" : "Pending"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
