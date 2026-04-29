import { useState, useRef, useEffect } from "react";
import "./DonationMethods.css";

/* ─────────────────────────────────────────────
   DonationMethods.jsx
   Styles live in DonationMethods.css

   PAYSTACK INLINE FLOW (client-side init):
   ─────────────────────────────────────────
   1. User fills form and submits.
   2. For M-Pesa → POST /donations (unchanged, server handles everything).
   3. For Paystack/Card →
        a. Open PaystackPop.setup() with key+email+amount (v1 SDK, client-side init).
        b. On callback (success) → POST /donations/verify with the reference.
        c. Backend verifies with Paystack API and records the donation.
        d. Show success screen.

   WHY NOT server-side init for inline?
   ─────────────────────────────────────
   The v1 Paystack inline SDK does not support resumeTransaction().
   The v2 SDK does, but is still in beta and not stable.
   Passing access_code + key together to setup() triggers a second
   /checkout/request_inline call which Paystack rejects with 400.
   Client-side init (key + email + amount only) is the stable, documented
   approach for inline checkout with the v1 SDK.
───────────────────────────────────────────── */

const API                = import.meta.env.VITE_API_URL        ?? "http://127.0.0.1:5000";
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? "";

/* Prevent double popup in React StrictMode (double effect invocation) */
let _paystackPopupOpen = false;

const METHODS = [
  {
    id: "mpesa",
    label: "M-Pesa",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width={22} height={22}>
        <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" />
        <text
          x="50%" y="56%"
          dominantBaseline="middle"
          textAnchor="middle"
          style={{ fontFamily: "DM Sans, sans-serif", fontSize: 10, fontWeight: 600, fill: "currentColor" }}
        >M</text>
      </svg>
    ),
    color: "#5a9e3a",
  },
  {
    id: "paystack",
    label: "Paystack",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width={22} height={22}>
        <rect x="1" y="1" width="30" height="30" rx="6" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 16h6M18 16h6M8 11h16M8 21h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    color: "#a8d080",
  },
  {
    id: "card",
    label: "Card",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width={22} height={22}>
        <rect x="1" y="6" width="30" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 12h30" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5" y="18" width="6" height="3" rx="1" fill="currentColor" />
      </svg>
    ),
    color: "#1a1a1a",
  },
];

/* ── Validation helpers ── */
const validateAmount = (v) => {
  if (!v || isNaN(v)) return "Please enter a valid amount.";
  if (parseFloat(v) <= 0) return "Amount must be greater than 0.";
  return null;
};
const validatePhone = (v) => {
  if (!v) return "Phone number is required for M-Pesa.";
  const cleaned = v.replace(/\s+/g, "");
  if (!/^(\+?254|0)[17]\d{8}$/.test(cleaned))
    return "Enter a valid Kenyan number, e.g. 07XX XXX XXX.";
  return null;
};
const validateEmail = (v) => {
  if (!v) return "Email is required.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
  return null;
};
const validateCardNumber = (v) => {
  const d = v.replace(/\s/g, "");
  if (!d) return "Card number is required.";
  if (!/^\d{13,19}$/.test(d)) return "Enter a valid card number.";
  return null;
};
const validateExpiry = (v) => {
  if (!v) return "Expiry date is required.";
  const [m, y] = v.split("/").map((s) => parseInt(s, 10));
  if (!m || !y || m < 1 || m > 12) return "Enter a valid expiry (MM/YY).";
  const exp = new Date(2000 + y, m - 1);
  if (exp < new Date()) return "This card has expired.";
  return null;
};
const validateCVV = (v) => {
  if (!v) return "CVV is required.";
  if (!/^\d{3,4}$/.test(v)) return "Enter a valid 3-4 digit CVV.";
  return null;
};

/* ── Formatters ── */
const formatCard = (raw) =>
  raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (raw) => {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 3 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
};

/* ── Paystack v1 script loader ── */
function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(); return; }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Failed to load Paystack SDK."));
    document.body.appendChild(script);
  });
}

/* ── Sub-components ── */
const FieldError = ({ msg }) =>
  msg ? <span className="dm-field-error">{msg}</span> : null;

const InputRow = ({ label, children, error, hint }) => (
  <div className="dm-field-row">
    <label className="dm-label">{label}</label>
    {children}
    {hint && !error && <span className="dm-hint">{hint}</span>}
    <FieldError msg={error} />
  </div>
);

const Spinner = () => (
  <svg className="dm-spinner" width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
    <path d="M8 2a6 6 0 016 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ══════════════════════════════════════════
   Main component
══════════════════════════════════════════ */
export default function DonationMethods({ campaignId, campaignName = "Campaign", onSuccess }) {
  const [method, setMethod]         = useState("mpesa");
  const [amount, setAmount]         = useState("");
  const [donorName, setDonorName]   = useState("");
  const [phone, setPhone]           = useState("");
  const [email, setEmail]           = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvv, setCvv]               = useState("");
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [focusedInput, setFocused]  = useState(null);

  const tabsRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!tabsRef.current) return;
    const idx = METHODS.findIndex((m) => m.id === method);
    const btn = tabsRef.current.children[idx + 1];
    if (btn) setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [method]);

  /* Preload Paystack SDK when user switches to those tabs */
  useEffect(() => {
    if (method === "paystack" || method === "card") {
      loadPaystackScript().catch(() => {});
    }
  }, [method]);

  const clearError = (key) => setErrors((prev) => ({ ...prev, [key]: null }));

  const validate = () => {
    const e = {};
    if (validateAmount(amount))                                 e.amount     = validateAmount(amount);
    if (method === "mpesa"    && validatePhone(phone))          e.phone      = validatePhone(phone);
    if (method === "paystack" && validateEmail(email))          e.email      = validateEmail(email);
    if (method === "card") {
      if (validateEmail(email))                                 e.email      = validateEmail(email);
      if (validateCardNumber(cardNumber))                       e.cardNumber = validateCardNumber(cardNumber);
      if (validateExpiry(expiry))                               e.expiry     = validateExpiry(expiry);
      if (validateCVV(cvv))                                     e.cvv        = validateCVV(cvv);
    }
    return e;
  };

  /* ── Paystack inline popup (client-side init via v1 SDK) ──
   *
   * We initialise the transaction entirely client-side using the public key.
   * On success Paystack calls our callback with a `reference`. We then POST
   * that reference to /donations/verify so the backend can verify with
   * Paystack's API and record the donation.
   *
   * This avoids the 400 "Please enter a valid Key" error that occurs when
   * you mix a server-side access_code with a client-side key in setup().
   */
  const openPaystackPopup = ({ campaignId, donorName, email, amount }) => {
    return new Promise((resolve, reject) => {
      if (_paystackPopupOpen) { reject(new Error("A payment is already in progress.")); return; }
      _paystackPopupOpen = true;

      const handler = window.PaystackPop.setup({
        key:      PAYSTACK_PUBLIC_KEY,
        email,
        amount:   Math.round(parseFloat(amount) * 100), // KES → smallest unit
        currency: "KES",
        metadata: {
          campaign_id:  campaignId,
          campaign_name: campaignName,
          donor_name:   donorName || "Anonymous",
        },
        callback: (response) => {
          _paystackPopupOpen = false;
          resolve(response); // response.reference
        },
        onClose: () => {
          _paystackPopupOpen = false;
          reject(new Error("Payment was cancelled."));
        },
      });

      handler.openIframe();
    });
  };

  /* ── POST /donations/verify after Paystack confirms ── */
  const verifyPaystackDonation = async ({ reference, amount, donorName, donorEmail }) => {
    const res = await fetch(`${API}/donations/verify`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reference,
        campaign_id: campaignId || 1,
        amount:      parseFloat(amount),
        donor_name:  donorName || "Anonymous",
        donor_email: donorEmail,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Payment verification failed.");
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    try {
      /* ── M-Pesa: server-side initiation (unchanged) ── */
      if (method === "mpesa") {
        const res  = await fetch(`${API}/donations`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            campaign_id:    campaignId || 1,
            amount:         parseFloat(amount),
            payment_method: "mpesa",
            donor_name:     donorName.trim() || "Anonymous",
            phone_number:   phone,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Something went wrong.");
        setSubmitted(true);
        onSuccess?.(data);
        return;
      }

      /* ── Paystack / Card: client-side inline popup ── */
      if (method === "paystack" || method === "card") {
        if (!PAYSTACK_PUBLIC_KEY) {
          throw new Error("Paystack public key is not configured. Add VITE_PAYSTACK_PUBLIC_KEY to your .env.");
        }

        await loadPaystackScript();

        const paystackResponse = await openPaystackPopup({
          campaignId,
          donorName: donorName.trim(),
          email,
          amount,
        });

        /* Popup succeeded — verify and record on the backend */
        const data = await verifyPaystackDonation({
          reference:  paystackResponse.reference,
          amount,
          donorName:  donorName.trim(),
          donorEmail: email,
        });

        setSubmitted(true);
        onSuccess?.(data);
        return;
      }

    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="dm-card">
        <div className="dm-success-wrap">
          <div className="dm-success-circle">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M7 16l6 6 12-12" stroke="#5a9e3a" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="dm-success-title">Thank you.</h2>
          <p className="dm-success-sub">
            Your donation of <strong>KES {parseFloat(amount).toLocaleString()}</strong> for{" "}
            <em>{campaignName}</em> has been received.
            {method === "mpesa" && " Check your phone for the M-Pesa prompt."}
          </p>
          <button
            className="dm-btn-primary"
            style={{ background: "#5a9e3a" }}
            onClick={() => { setSubmitted(false); setAmount(""); }}
          >
            Donate Again
          </button>
        </div>
      </div>
    );
  }

  const currentMethod = METHODS.find((m) => m.id === method);

  return (
    <div className="dm-card">

      <div className="dm-header">
        <span className="dm-tag-pill">
          <span className="dm-tag-dot" />
          Give
        </span>
        <h2 className="dm-title">Make a Donation</h2>
        {campaignName && <p className="dm-sub">{campaignName}</p>}
      </div>

      <hr className="dm-divider" />

      <div className="dm-tabs-wrap">
        <div className="dm-tabs" ref={tabsRef}>
          <div
            className="dm-tab-indicator"
            style={{ left: indicator.left, width: indicator.width, background: currentMethod.color }}
          />
          {METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`dm-tab-btn${method === m.id ? " is-active" : ""}`}
              onClick={() => { setMethod(m.id); setErrors({}); }}
            >
              <span className="dm-tab-icon">{m.icon}</span>
              <span className="dm-tab-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form className="dm-form" onSubmit={handleSubmit} noValidate>

        <InputRow label="Amount (KES)" error={errors.amount}>
          <div className={`dm-amount-wrap${focusedInput === "amount" ? " is-focused" : ""}`}>
            <span className="dm-currency-prefix">KES</span>
            <input
              type="number" min="1" step="any" placeholder="0.00"
              value={amount} autoComplete="off"
              onChange={(e) => { setAmount(e.target.value); clearError("amount"); }}
              onFocus={() => setFocused("amount")}
              onBlur={() => setFocused(null)}
              className="dm-amount-input"
            />
          </div>
          <div className="dm-quick-amounts">
            {[500, 1000, 2500, 5000].map((v) => (
              <button
                key={v} type="button"
                className={`dm-quick-btn${amount == v ? " is-active" : ""}`}
                onClick={() => { setAmount(String(v)); clearError("amount"); }}
              >
                {v.toLocaleString()}
              </button>
            ))}
          </div>
        </InputRow>

        <InputRow label="Your Name" hint="Optional — leave blank for Anonymous">
          <input
            type="text" placeholder="Anonymous" value={donorName} autoComplete="name"
            onChange={(e) => setDonorName(e.target.value)}
            onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
            className={`dm-input${focusedInput === "name" ? " is-focused" : ""}`}
          />
        </InputRow>

        {method === "mpesa" && (
          <InputRow label="M-Pesa Phone Number" error={errors.phone} hint="e.g. 0712 345 678">
            <input
              type="tel" placeholder="07XX XXX XXX" value={phone} autoComplete="tel"
              onChange={(e) => { setPhone(e.target.value); clearError("phone"); }}
              onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)}
              className={`dm-input${focusedInput === "phone" ? " is-focused" : ""}`}
            />
          </InputRow>
        )}

        {(method === "paystack" || method === "card") && (
          <InputRow label="Email Address" error={errors.email}>
            <input
              type="email" placeholder="you@example.com" value={email} autoComplete="email"
              onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
              className={`dm-input${focusedInput === "email" ? " is-focused" : ""}`}
            />
          </InputRow>
        )}

        {method === "card" && (
          <>
            <InputRow label="Card Number" error={errors.cardNumber}>
              <input
                type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                value={cardNumber} autoComplete="cc-number"
                onChange={(e) => { setCardNumber(formatCard(e.target.value)); clearError("cardNumber"); }}
                onFocus={() => setFocused("card")} onBlur={() => setFocused(null)}
                className={`dm-input dm-input--card-number${focusedInput === "card" ? " is-focused" : ""}`}
              />
            </InputRow>

            <div className="dm-row-two">
              <InputRow label="Expiry" error={errors.expiry}>
                <input
                  type="text" inputMode="numeric" placeholder="MM/YY"
                  value={expiry} autoComplete="cc-exp"
                  onChange={(e) => { setExpiry(formatExpiry(e.target.value)); clearError("expiry"); }}
                  onFocus={() => setFocused("expiry")} onBlur={() => setFocused(null)}
                  className={`dm-input${focusedInput === "expiry" ? " is-focused" : ""}`}
                />
              </InputRow>
              <InputRow label="CVV" error={errors.cvv}>
                <input
                  type="password" inputMode="numeric" maxLength={4} placeholder="•••"
                  value={cvv} autoComplete="cc-csc"
                  onChange={(e) => { setCvv(e.target.value.replace(/\D/g, "").slice(0, 4)); clearError("cvv"); }}
                  onFocus={() => setFocused("cvv")} onBlur={() => setFocused(null)}
                  className={`dm-input${focusedInput === "cvv" ? " is-focused" : ""}`}
                />
              </InputRow>
            </div>
          </>
        )}

        {errors.submit && <div className="dm-submit-error">{errors.submit}</div>}

        <button
          type="submit" disabled={loading}
          className="dm-btn-primary"
          style={{ background: currentMethod.color }}
        >
          {loading ? (
            <><Spinner /> Processing…</>
          ) : (
            <>
              {method === "mpesa"    && "Send M-Pesa Prompt"}
              {method === "paystack" && "Pay with Paystack"}
              {method === "card"     && "Complete Donation"}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor"
                  strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>

        <p className="dm-secure-note">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="5" width="10" height="7" rx="1.5" stroke="#8a8a8a" strokeWidth="1.2" />
            <path d="M4 5V3.5a2 2 0 014 0V5" stroke="#8a8a8a" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Payments are processed securely. Your details are never stored.
        </p>

      </form>
    </div>
  );
}