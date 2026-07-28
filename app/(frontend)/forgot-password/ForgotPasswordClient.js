"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      alert("Please enter a valid email address.");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmittedEmail(email);
      setIsSuccess(true);
      setIsSubmitting(false);
    }, 1200);
  };

  const handleResend = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate resend
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`📨 Reset link resent to ${submittedEmail}`);
    }, 800);
  };

  return (
    <main className="forgot-page">
      <div className="forgot-card">
        <div className="forgot-logo">
          <Image src="/assets/img/logo.png" alt="YUVO" width={120} height={52} style={{ objectFit: "contain" }} />
        </div>
        <p className="forgot-tagline">Move Freely. Live Fully.</p>

        {!isSuccess ? (
          <div id="defaultState">
            <h1>Reset Your Password</h1>
            <p className="sub">
              Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
            </p>

            <form className="forgot-form" onSubmit={handleSubmit} noValidate>
              <div className="field-group">
                <label htmlFor="resetEmail">Email Address</label>
                <div className="field">
                  <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                  <input
                    type="email"
                    id="resetEmail"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button className="reset-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Sending…</>
                ) : (
                  <>Send Reset Link <i className="fa-solid fa-chevron-right" aria-hidden="true"></i></>
                )}
              </button>
            </form>

            <Link href="/login" className="back-link">
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              Back to Log In
            </Link>
          </div>
        ) : (
          <div className="success-state" style={{ display: "block" }}>
            <div className="success-icon">
              <i className="fa-regular fa-circle-check"></i>
            </div>
            <h3>Check Your Inbox</h3>
            <p>
              We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>.
              Please check your spam folder if you don&apos;t see it within a few minutes.
            </p>
            <button 
              onClick={handleResend} 
              className="resend-link" 
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "var(--yuvo-blue)" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resending..." : "Resend email"}
            </button>
            <br /><br />
            <Link href="/login" className="back-link" style={{ display: "inline-flex", marginTop: 0 }}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              Back to Log In
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
