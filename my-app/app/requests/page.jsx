"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import "./requests.css";

export default function RequestsPage() {
  const [providerRequests, setProviderRequests] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);

  // ==========================
  // FETCH REQUESTS
  // ==========================
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      // provider requests
      const providerRes = await axios.get(
        "http://localhost:5000/api/admin/provider-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // payment requests
      const paymentRes = await axios.get(
        "http://localhost:5000/api/admin/payment-requests",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProviderRequests(providerRes.data);
      setPaymentRequests(paymentRes.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ==========================
  // PROVIDER ACTIONS
  // ==========================
  const handleProviderAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/admin/${action}-provider/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProviderRequests((prev) =>
        prev.filter((p) => p.user_id !== id)
      );

    } catch (err) {
      console.error(err);
    }
  };

  // ==========================
  // PAYMENT ACTIONS
  // ==========================
  const handlePaymentAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/admin/${action}-payment/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPaymentRequests((prev) =>
        prev.filter((p) => p.user_id !== id)
      );

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="requests-container">

      <h1 className="page-title">Admin Requests</h1>

      {/* ========================= */}
      {/* PROVIDER REQUESTS */}
      {/* ========================= */}
      <section>
        <h2 className="section-title">
          Provider Requests
        </h2>

        <div className="requests-grid">
          {providerRequests.map((provider) => (
            <div
              key={provider.user_id}
              className="request-card"
            >
              <h3>{provider.email}</h3>

              <p>
                <strong>Role:</strong> {provider.role}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {provider.approval_status}
              </p>

              <div className="actions">
                <button
                  className="approve-btn"
                  onClick={() =>
                    handleProviderAction(
                      provider.user_id,
                      "approve"
                    )
                  }
                >
                  Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() =>
                    handleProviderAction(
                      provider.user_id,
                      "reject"
                    )
                  }
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================= */}
      {/* PAYMENT REQUESTS */}
      {/* ========================= */}
      <section>
        <h2 className="section-title">
          Payment Requests
        </h2>

        <div className="requests-grid">
          {paymentRequests.map((payment) => (
            <div
              key={payment.user_id}
              className="request-card"
            >
              <h3>{payment.email}</h3>

              <p>
                <strong>Role:</strong> {payment.role}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {payment.payment_status}
              </p>

              <div className="actions">
                <button
                  className="approve-btn"
                  onClick={() =>
                    handlePaymentAction(
                      payment.user_id,
                      "approve"
                    )
                  }
                >
                  Approve
                </button>

                <button
                  className="reject-btn"
                  onClick={() =>
                    handlePaymentAction(
                      payment.user_id,
                      "reject"
                    )
                  }
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}