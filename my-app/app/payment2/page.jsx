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
  const [plan, setPlan] = useState("Custom bag");

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
      if (amountParam && !isNaN(Number(amountParam))) setAmount(Number(amountParam));
    }
  }, []);

  const handleCardNumberChange = (e) => {
    const formattedValue = CreditCardValidator.formatCardNumber(e.target.value).slice(0, 23);
    const detectedType = CreditCardValidator.detectCardType(formattedValue);

    setCardNumber(formattedValue);
    setTouched((currentTouched) => ({ ...currentTouched, cardNumber: true }));

    if (detectedType.includes("visa")) setSelectedCard("visa");
    if (detectedType.includes("mastercard")) setSelectedCard("mastercard");
  };

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
      showNotice("success", "Payment successful", `Your payment of $${amount} is complete.`);
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
    setTimeout(() => {
        alert("✅ Payment Successful!");
        setLoading(false);
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <section className="payment-page-wrapper">
        <h2 className="section-header">Select your card</h2>

        {/* TOP TABS */}
        <div className="method-selector">
          <button className={`tab-btn ${method === "card" ? "active" : ""}`} onClick={() => setMethod("card")}>💳 Card</button>
          <button className={`tab-btn ${method === "paypal" ? "active" : ""}`} onClick={() => setMethod("paypal")}>PayPal</button>
          <button className={`tab-btn ${method === "apple" ? "active" : ""}`} onClick={() => setMethod("apple")}>Apple Pay</button>
        </div>

        {method === "card" && (
          <>
            {/* SIDE-BY-SIDE CARDS */}
            <div className="cards-display-row">
                <div 
                  className={`ui-credit-card card-red ${selectedCard === "visa" ? "focused" : ""}`} 
                  onClick={() => setSelectedCard("visa")}
                >
                  <div className="card-header">
                    <span>🏦 FYI BANK</span>
                    <span>CREDIT</span>
                  </div>
                  <h3 className="card-digits">{maskedCardNumber || "0000 2363 8364 8269"}</h3>
                  <div className="card-info-grid">
                    <div><small>VALID THRU</small><p>{expiry || "5/23"}</p></div>
                    <div><small>CVV</small><p>{maskedCvv || "***"}</p></div>
                  </div>
                  <div className="holder-name">{cardName || "Okechukwu Ozioma"}</div>
                  <div className="card-brand">VISA</div>
                </div>

                <div 
                  className={`ui-credit-card card-purple ${selectedCard === "mastercard" ? "focused" : ""}`} 
                  onClick={() => setSelectedCard("mastercard")}
                >
                  <div className="card-header">
                    <span>🏦 FYI BANK</span>
                    <span>CREDIT</span>
                  </div>
                  <h3 className="card-digits">{maskedCardNumber || "0000 2363 8364 8269"}</h3>
                  <div className="card-info-grid">
                    <div><small>VALID THRU</small><p>{expiry || "5/23"}</p></div>
                    <div><small>CVV</small><p>{maskedCvv || "***"}</p></div>
                  </div>
                  <div className="holder-name">{cardName || "Okechukwu Ozioma"}</div>
                  <div className="card-brand">MasterCard</div>
                </div>
            </div>

            {/* FORM AND CHECKOUT BOX */}
            <div className="main-checkout-grid">
              <div className="details-form">
                <h3>Enter card details</h3>
                <input
                  type="text"
                  className={`styled-input ${fieldErrors.cardName ? "input-error" : ""}`}
                  placeholder="Card name"
                  value={cardName}
                  onChange={(e) => {
                    setCardName(e.target.value);
                    markTouched("cardName");
                  }}
                  onBlur={() => markTouched("cardName")}
                  aria-invalid={Boolean(fieldErrors.cardName)}
                />
                {fieldErrors.cardName && <p className="field-error">{fieldErrors.cardName}</p>}
                <input
                  type="text"
                  className={`styled-input ${fieldErrors.cardNumber ? "input-error" : ""}`}
                  placeholder="Card number"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={23}
                  inputMode="numeric"
                  onBlur={() => markTouched("cardNumber")}
                  aria-invalid={Boolean(fieldErrors.cardNumber)}
                />
                {fieldErrors.cardNumber && <p className="field-error">{fieldErrors.cardNumber}</p>}
                <div className="dual-inputs">
                  <div className="dual-input-field">
                    <input
                      type="text"
                      className={`styled-input ${fieldErrors.expiry ? "input-error" : ""}`}
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                      inputMode="numeric"
                      onBlur={() => markTouched("expiry")}
                      aria-invalid={Boolean(fieldErrors.expiry)}
                    />
                    {fieldErrors.expiry && <p className="field-error">{fieldErrors.expiry}</p>}
                  </div>
                  <div className="dual-input-field">
                    <input
                      type="text"
                      className={`styled-input ${fieldErrors.cvv ? "input-error" : ""}`}
                      placeholder="CVV"
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value.replace(/\D/g, "").slice(0, 3));
                        markTouched("cvv");
                      }}
                      maxLength={3}
                      inputMode="numeric"
                      onBlur={() => markTouched("cvv")}
                      aria-invalid={Boolean(fieldErrors.cvv)}
                    />
                    {fieldErrors.cvv && <p className="field-error">{fieldErrors.cvv}</p>}
                  </div>
                </div>
                <div className="checkbox-group">
                  <label className={fieldErrors.agreeTerms ? "checkbox-error" : ""}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        markTouched("agreeTerms");
                      }}
                    />
                    I agree to Terms
                  </label>
                  {fieldErrors.agreeTerms && <p className="field-error checkbox-field-error">{fieldErrors.agreeTerms}</p>}
                  <label><input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} /> Save card details</label>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-row"><span>Custom bag</span> <span>$50</span></div>
                <div className="summary-row"><span>Delivery charge</span> <span>$5</span></div>
                <hr className="divider" />
                <div className="summary-row total-row"><span>Total Amount</span> <span>${amount}</span></div>
                
                <button className="btn-continue">CONTINUE</button>
                <button className="btn-pay-now" onClick={handlePay} disabled={loading || !isCardPaymentValid}>
                  {loading ? "PROCESSING..." : "PAY NOW"}
                </button>
              </div>
            </div>
          </>
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
      <Footer />
    </>
  );
}
