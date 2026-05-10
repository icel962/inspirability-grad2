"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import NextImage from "next/image"; 
import CreditCardValidator from "../lib/creditCardValidator";
import "./payment.css";

export default function PaymentPage() {
  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [amount, setAmount] = useState(55);
  const [plan, setPlan] = useState("Custom Plan");
  const [duration, setDuration] = useState("Once");

  // Card form state
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [selectedCard, setSelectedCard] = useState("visa");
  const [touched, setTouched] = useState({});
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setMounted(true);
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const amountParam = params.get("amount");
      const planParam = params.get("plan");
      const durationParam = params.get("duration");

      if (amountParam && !isNaN(Number(amountParam))) setAmount(Number(amountParam));
      if (planParam) setPlan(planParam);
      if (durationParam) setDuration(durationParam);
    }
  }, []);

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    const formattedValue = CreditCardValidator.formatCardNumber(e.target.value).slice(0, 23);
    const detectedType = CreditCardValidator.detectCardType(formattedValue);

    setCardNumber(formattedValue);
    setTouched((currentTouched) => ({ ...currentTouched, cardNumber: true }));

    if (detectedType.includes("visa")) setSelectedCard("visa");
    if (detectedType.includes("mastercard")) setSelectedCard("mastercard");
  };

  // Format Expiry (adds / automatically)
  const handleExpiryChange = (e) => {
    setExpiry(CreditCardValidator.formatExpiry(e.target.value));
    setTouched((currentTouched) => ({ ...currentTouched, expiry: true }));
  };

  const markTouched = (field) => {
    setTouched((currentTouched) => ({ ...currentTouched, [field]: true }));
  };

  const validateCardDetails = () => {
    const nextErrors = {};

    if (!validation.fields.cardholderName.valid) nextErrors.cardName = validation.fields.cardholderName.message;
    if (!validation.fields.cardNumber.valid) nextErrors.cardNumber = validation.fields.cardNumber.message;
    if (!validation.fields.expiry.valid) nextErrors.expiry = validation.fields.expiry.message;
    if (!validation.fields.cvv.valid) nextErrors.cvv = validation.fields.cvv.message;
    if (!agreeTerms) nextErrors.agreeTerms = "Please agree to the terms.";

    return nextErrors;
  };

  const showNotice = (variant, title, messages) => {
    setNotice({
      variant,
      title,
      messages: Array.isArray(messages) ? messages : [messages],
    });
  };

  const alert = (message) => {
    const messageText = String(message);

    if (messageText.toLowerCase().includes("successful")) {
      showNotice("success", "Payment successful", `Your ${plan} payment of $${amount} is complete.`);
      return;
    }

    if (messageText.toLowerCase().includes("login")) {
      showNotice("warning", "Login required", "Please login to complete payment.");
      return;
    }

    showNotice("warning", "Payment notice", messageText.split("\n").filter(Boolean));
  };

  const validation = CreditCardValidator.validateAll({
    cardNumber,
    expiry,
    cvv,
    cardholderName: cardName,
  });

  const fieldErrors = {
    cardName:
      touched.cardName && !validation.fields.cardholderName.valid
        ? validation.fields.cardholderName.message
        : "",
    cardNumber:
      touched.cardNumber && !validation.fields.cardNumber.valid
        ? validation.fields.cardNumber.message
        : "",
    expiry:
      touched.expiry && !validation.fields.expiry.valid
        ? validation.fields.expiry.message
        : "",
    cvv:
      touched.cvv && !validation.fields.cvv.valid
        ? validation.fields.cvv.message
        : "",
    agreeTerms:
      touched.agreeTerms && !agreeTerms ? "Please agree to the terms." : "",
  };

  const isCardPaymentValid = validation.valid && agreeTerms;
  const maskedCardNumber = CreditCardValidator.cleanCardNumber(cardNumber)
    .replace(/\d(?=\d{4})/g, "*")
    .replace(/(.{4})/g, "$1 ")
    .trim();
  const maskedCvv = cvv ? "***" : "";

  const handlePay = async () => {
    if (method === 'card') {
      const nextErrors = validateCardDetails();

      if (Object.keys(nextErrors).length > 0) {
        setTouched({
          cardName: true,
          cardNumber: true,
          expiry: true,
          cvv: true,
          agreeTerms: true,
        });
        return;
      }
    }

    if (!token) return alert("⚠️ Please login to complete payment!");
    if (method === 'card' && !agreeTerms) return alert("Please agree to the terms.");
    
    setLoading(true);
    // Simulate backend processing
    setTimeout(() => {
        alert("✅ Payment Successful!");
        setLoading(false);
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <section className="payment-container">
        <h2 className="payment-title">Checkout</h2>

        {/* PAYMENT METHOD SELECTION */}
        <div className="payment-method-tabs">
          <div className={`method-tab ${method === "card" ? "active" : ""}`} onClick={() => setMethod("card")}>
            <span className="tab-icon">💳</span> Card
          </div>
          
          <div className={`method-tab ${method === "paypal" ? "active" : ""}`} onClick={() => setMethod("paypal")}>
            <NextImage src="/images/paypal.png" alt="PayPal" width={25} height={25} />
            PayPal
          </div>

          <div className={`method-tab ${method === "apple" ? "active" : ""}`} onClick={() => setMethod("apple")}>
            <NextImage src="/images/apple-pay.png" alt="Apple Pay" width={40} height={25} />
            Apple Pay
          </div>
        </div>

        {method === "card" && (
          <>
            {/* BRAND SELECTOR */}
            <div className="brand-selector">
                <button className={`brand-btn ${selectedCard === "visa" ? "active" : ""}`} onClick={() => setSelectedCard("visa")}>
                  <div className="dot"></div>
                  <img src="/images/visa.png" alt="Visa" className="card-logo-img" />
                </button>
                <button className={`brand-btn ${selectedCard === "mastercard" ? "active" : ""}`} onClick={() => setSelectedCard("mastercard")}>
                  <div className="dot"></div>
                  <img src="/images/mastercard.png" alt="MasterCard" className="card-logo-img" />
                </button>
            </div>

            {/* CARD PREVIEW */}
            <div className="cards">
                <div className={`credit-card ${selectedCard === "visa" ? "red" : "blue"}`}>
                  <div className="card-top">
                    <span>🏦 INSPIRABILITY BANK</span>
                    <span>CREDIT</span>
                  </div>
                  <h3 className="number">{maskedCardNumber || "0000 0000 0000 0000"}</h3>
                  <div className="card-bottom">
                    <div><small>VALID THRU</small><p>{expiry || "MM/YY"}</p></div>
                    <div><small>CVV</small><p>{maskedCvv || "***"}</p></div>
                  </div>
                  <div className="card-name">{cardName || "YOUR NAME"}</div>
                  <div className="brand">{selectedCard.toUpperCase()}</div>
                </div>
            </div>

            {/* FORM AND SUMMARY */}
            <div className="payment-flex-layout">
              <div className="card-form-side">
                <div className="input-group">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => {
                      setCardName(e.target.value);
                      markTouched("cardName");
                    }}
                    onBlur={() => markTouched("cardName")}
                    placeholder="Full Name"
                    className={fieldErrors.cardName ? "input-error" : ""}
                    aria-invalid={Boolean(fieldErrors.cardName)}
                  />
                  {fieldErrors.cardName && <p className="field-error">{fieldErrors.cardName}</p>}
                  
                  <label>Card Number</label>
                  <input 
                    type="text" 
                    value={cardNumber} 
                    onChange={handleCardNumberChange} 
                    placeholder="0000 0000 0000 0000"
                    maxLength={23}
                    inputMode="numeric"
                    onBlur={() => markTouched("cardNumber")}
                    className={fieldErrors.cardNumber ? "input-error" : ""}
                    aria-invalid={Boolean(fieldErrors.cardNumber)}
                  />
                  {fieldErrors.cardNumber && <p className="field-error">{fieldErrors.cardNumber}</p>}

                  <div className="input-row">
                    <div>
                      <label>Expiry</label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        inputMode="numeric"
                        onBlur={() => markTouched("expiry")}
                        className={fieldErrors.expiry ? "input-error" : ""}
                        aria-invalid={Boolean(fieldErrors.expiry)}
                      />
                      {fieldErrors.expiry && <p className="field-error">{fieldErrors.expiry}</p>}
                    </div>
                    <div>
                      <label>CVV</label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => {
                          setCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
                          markTouched("cvv");
                        }}
                        placeholder="123"
                        maxLength={3}
                        inputMode="numeric"
                        onBlur={() => markTouched("cvv")}
                        className={fieldErrors.cvv ? "input-error" : ""}
                        aria-invalid={Boolean(fieldErrors.cvv)}
                      />
                      {fieldErrors.cvv && <p className="field-error">{fieldErrors.cvv}</p>}
                    </div>
                  </div>
                </div>

                <div className="checkbox-section">
                  <label className={fieldErrors.agreeTerms ? "checkbox-error" : ""}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        markTouched("agreeTerms");
                      }}
                    />
                    Agree to Terms
                  </label>
                  {fieldErrors.agreeTerms && <p className="field-error checkbox-field-error">{fieldErrors.agreeTerms}</p>}
                  <label><input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} /> Save card</label>
                </div>
              </div>

              <div className="order-summary-side">
                <div className="summary-box">
                  <h3>Order Summary</h3>
                  <div className="item"><span>Plan:</span> <strong>{plan}</strong></div>
                  <div className="item"><span>Duration:</span> <strong>{duration}</strong></div>
                  <hr />
                  <div className="total"><span>Total:</span> <strong>${amount}</strong></div>
                  <button className="pay-btn" onClick={handlePay} disabled={loading || !isCardPaymentValid}>
                    {loading ? "Processing..." : `PAY $${amount} NOW`}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PAYPAL / APPLE PAY VIEW */}
        {(method === "paypal" || method === "apple") && (
          <div className="alt-method-view">
             <div className="method-hero-icon">
                <NextImage 
                    src={`/images/${method === 'paypal' ? 'paypal.png' : 'apple-pay.png'}`} 
                    alt={method} 
                    width={150} 
                    height={80} 
                    style={{ objectFit: 'contain' }}
                />
             </div>
            <h3 className="method-title">Pay with {method === "paypal" ? "PayPal" : "Apple Pay"}</h3>
            <p className="method-title">You will be redirected to complete your <strong>${amount}</strong> payment.</p>
            <button className="pay-btn large" onClick={handlePay} disabled={loading}>
                {loading ? "Connecting..." : `Continue to ${method}`}
            </button>
          </div>
        )}
      </section>
      {notice && (
        <div className="payment-modal-overlay">
          <div
            className={`payment-modal payment-modal--${notice.variant}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
          >
            <button className="payment-modal-close" onClick={() => setNotice(null)} aria-label="Close message">
              X
            </button>
            <div className="payment-modal-mark" aria-hidden="true">
              {notice.variant === "success" ? "OK" : "!"}
            </div>
            <p className="payment-modal-kicker">Inspirability checkout</p>
            <h3 id="payment-modal-title">{notice.title}</h3>
            {notice.messages.length > 1 ? (
              <ul className="payment-modal-list">
                {notice.messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : (
              <p className="payment-modal-message">{notice.messages[0]}</p>
            )}
            <button className="payment-modal-action" onClick={() => setNotice(null)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
