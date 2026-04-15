"use client";
import "./payment.css";
import Navbar from "../component/Navbar";
import Footer from "../component/Footer";
import { useState, useEffect } from "react";

export default function PaymentPage() {
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");

  // 1. جلب التوكن من الـ LocalStorage عند تحميل الصفحة
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleContinue = () => {
    alert("Continue clicked");
  };

  // 2. فانكشن الدفع وربطها بالـ API
  const handlePay = async () => {
    if (!token) {
      alert("⚠️ يجب تسجيل الدخول أولاً لإتمام عملية الدفع!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // إرسال التوكن للتحقق
        },
        body: JSON.stringify({
          fees: 55, // القيمة الإجمالية المكتوبة في السعر تحت
          duration: "Once", // مدة الاشتراك
          payment_method: method, // نوع الكارت (card, paypal, apple)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ تم الدفع بنجاح: " + (data.message || "Operation Successful"));
        // يمكنك هنا التوجيه لصفحة النجاح مثلاً:
        // window.location.href = "/success";
      } else {
        // التعامل مع الخطأ (مثل "حساب ولي الأمر غير موجود")
        alert("❌ فشل الدفع: " + (data.message || "حدث خطأ ما"));
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("❌ السيرفر لا يستجيب، تأكد من تشغيل الـ Backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <section className="payment">
        <h2 className="title">Select your card</h2>

        {/* ✅ PAYMENT METHODS SELECTION */}
        <div className="card-types">
          <div
            className={`type ${method === "card" ? "active" : ""}`}
            onClick={() => setMethod("card")}
          >
            💳 Card
          </div>

          <div
            className={`type ${method === "paypal" ? "active" : ""}`}
            onClick={() => setMethod("paypal")}
          >
            PayPal
          </div>

          <div
            className={`type ${method === "apple" ? "active" : ""}`}
            onClick={() => setMethod("apple")}
          >
            Apple Pay
          </div>
        </div>

        {/* ✅ CARD DETAILS FORM */}
        {method === "card" && (
          <>
            <div className="cards">
              <div className="credit-card red">
                <div className="card-top">
                  <span>🏦 FYI BANK</span>
                  <span>CREDIT</span>
                </div>
                <h3 className="number">0000 2363 8364 8269</h3>
                <div className="card-bottom">
                  <div><small>VALID THRU</small><p>5/23</p></div>
                  <div><small>CVV</small><p>633</p></div>
                </div>
                <div className="card-name">Okechukwu Ozioma</div>
                <div className="brand">VISA</div>
              </div>

              <div className="credit-card blue">
                <div className="card-top">
                  <span>🏦 FYI BANK</span>
                  <span>CREDIT</span>
                </div>
                <h3 className="number">0000 2363 8364 8269</h3>
                <div className="card-bottom">
                  <div><small>VALID THRU</small><p>5/23</p></div>
                  <div><small>CVV</small><p>633</p></div>
                </div>
                <div className="card-name">Okechukwu Ozioma</div>
                <div className="brand">MasterCard</div>
              </div>
            </div>

            <div className="content">
              <div className="form">
                <h3>Enter card details</h3>
                <input placeholder="Card name" />
                <input placeholder="Card number" />
                <div className="row">
                  <input placeholder="MM / YY" />
                  <input placeholder="CVV" />
                </div>
                <div className="checkbox">
                  <label><input type="checkbox" /> I agree to Terms</label>
                  <label><input type="checkbox" /> Save card details</label>
                </div>
              </div>

              <div className="summary">
                <div className="line"><span>Custom bag</span><span>$50</span></div>
                <div className="line"><span>Delivery charge</span><span>$5</span></div>
                <hr />
                <div className="total"><span>Total Amount</span><span>$55</span></div>
                
                <button className="btn" onClick={handleContinue}>CONTINUE</button>
                
                <button 
                  className="btn primary" 
                  onClick={handlePay} 
                  disabled={loading}
                >
                  {loading ? "Processing..." : "PAY NOW"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* PAYPAL BOX */}
        {method === "paypal" && (
          <div className="method-box">
            <h3>Pay with PayPal</h3>
            <button className="btn primary" onClick={handlePay} disabled={loading}>
              {loading ? "Connecting..." : "Pay Now with PayPal"}
            </button>
          </div>
        )}

        {/* APPLE PAY BOX */}
        {method === "apple" && (
          <div className="method-box">
            <h3>Pay with Apple Pay</h3>
            <button className="btn primary" onClick={handlePay} disabled={loading}>
              {loading ? "Authorizing..." : "Pay Now with Apple"}
            </button>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}