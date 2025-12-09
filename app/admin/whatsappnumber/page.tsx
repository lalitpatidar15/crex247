"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const WhatsAppNumbers = ({ version = "v1" }: { version?: string }) => {
  const [numbers, setNumbers] = useState({
    newCustomer: "",
    deposit: "",
    withdrawal: "",
    support: "",
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ FETCH ON PAGE LOAD
  useEffect(() => {
    fetchNumbers();
  }, []);
  

  const fetchNumbers = async () => {
    try {
      const res = await axios.get(`/api/whatsapp?version=${version}`);
      setNumbers({
        newCustomer: res.data?.newCustomer || "",
        deposit: res.data?.deposit || "",
        withdrawal: res.data?.withdrawal || "",
        support: res.data?.support || "",
      });
    } catch (error) {
      console.log("Fetch failed", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumbers({
      ...numbers,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ SAVE + LIVE UPDATE
  const saveNumbers = async () => {
    if (
      numbers.newCustomer.length < 10 ||
      numbers.deposit.length < 10 ||
      numbers.withdrawal.length < 10 ||
      numbers.support.length < 10
    ) {
      alert("❌ Please enter all valid WhatsApp numbers");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/api/whatsapp", { ...numbers, version });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      fetchNumbers(); // ✅ SAVE KE BAAD TURANT SHOW
    } catch (error) {
      alert("❌ Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <h3 className="mb-4">📞 WhatsApp Support Numbers</h3>

      <div className="row g-3">
        {["newCustomer", "deposit", "withdrawal", "support"].map((key) => (
          <div className="col-md-6 col-12" key={key}>
            <div className="card shadow-sm p-3">
              <label className="form-label fw-bold text-capitalize">
                {key}
              </label>
              <input
                type="text"
                name={key}
                value={(numbers as any)[key]}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          className="btn btn-success px-4"
          onClick={saveNumbers}
          disabled={loading}
        >
          {loading ? "Saving..." : "✅ Save & Replace Numbers"}
        </button>

        {saved && (
          <p className="text-success mt-2 fw-bold">
             Numbers Updated Successfully
          </p>
        )}
      </div>

      {/* ✅ LIVE PREVIEW BELOW */}
      <div className="card mt-4 p-3 shadow bg-light">
        <h5 className="fw-bold mb-2">📌 Current Live Numbers</h5>
        <p>🆕 New Customer: {numbers.newCustomer}</p>
        <p>💰 Deposit: {numbers.deposit}</p>
        <p>🏧 Withdrawal: {numbers.withdrawal}</p>
        <p>🎧 Support: {numbers.support}</p>
      </div>
    </div>
  );
};

export default WhatsAppNumbers;
