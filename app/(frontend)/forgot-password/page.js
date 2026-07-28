import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import StoreStyles from "@/components/StoreStyles";
import ForgotPasswordClient from "./ForgotPasswordClient";

export const metadata = {
  title: "YUVO Fitness – Forgot Password",
  description: "Reset your YUVO password. Enter your email to receive a password reset link.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="yuvo-store-shell">
      <StoreStyles />
      <style>{`
        /* Local overrides specific to forgot password template */
        :root {
          --glass: rgba(255, 255, 255, 0.62);
          --glass-border: rgba(255, 255, 255, 0.78);
        }
        
        /* Instead of styling body, we style the page container */
        .forgot-page-wrapper {
          background: linear-gradient(145deg, #f0f4fe 0%, #e6edf9 40%, #dce3f2 100%);
          min-height: 100vh;
          position: relative;
          z-index: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .forgot-page-wrapper::before,
        .forgot-page-wrapper::after {
          content: '';
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.35;
          pointer-events: none;
          z-index: 0;
        }
        .forgot-page-wrapper::before {
          width: 600px; height: 600px; top: -200px; right: -100px;
          background: radial-gradient(circle, var(--yuvo-blue), transparent 70%);
        }
        .forgot-page-wrapper::after {
          width: 500px; height: 500px; bottom: -150px; left: -100px;
          background: radial-gradient(circle, var(--yuvo-red), transparent 70%);
        }

        .forgot-page {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 140px 24px 80px; position: relative; z-index: 1;
        }
        .forgot-card {
          width: min(440px, 100%); padding: clamp(36px, 4vw, 52px) clamp(28px, 3.5vw, 44px);
          border-radius: 28px; background: var(--glass); border: 1px solid var(--glass-border);
          box-shadow: 0 28px 80px rgba(47, 66, 52, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); position: relative; z-index: 2;
        }
        .forgot-logo { display: flex; justify-content: center; margin-bottom: 8px; }
        .forgot-tagline {
          text-align: center; font-size: 14px; font-weight: 400; color: var(--yuvo-muted);
          margin-bottom: 24px; letter-spacing: 0.02em;
        }
        .forgot-card h1 {
          margin: 0 0 6px; font-size: 28px; line-height: 1.2; font-weight: 600;
          color: #111820; text-align: center; letter-spacing: -0.02em;
        }
        .forgot-card .sub {
          text-align: center; font-size: 14px; color: var(--yuvo-muted);
          margin-bottom: 28px; max-width: 340px; margin-left: auto; margin-right: auto;
        }
        .forgot-form .field-group { margin-bottom: 18px; }
        .forgot-form label { display: block; font-weight: 500; font-size: 0.85rem; color: #1a1a2e; margin-bottom: 5px; }
        .forgot-form .field {
          display: flex; align-items: center; gap: 12px; height: 50px; border-radius: 12px;
          border: 1px solid rgba(55, 80, 62, 0.16); background: rgba(255, 255, 255, 0.55);
          padding: 0 16px; transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .forgot-form .field:focus-within {
          border-color: var(--yuvo-blue); box-shadow: 0 0 0 4px rgba(14, 79, 168, 0.10); background: rgba(255, 255, 255, 0.75);
        }
        .forgot-form .field i { flex: 0 0 auto; font-size: 15px; color: #8a96a8; line-height: 1; }
        .forgot-form .field input {
          width: 100%; border: 0; outline: 0; background: transparent;
          font-family: var(--font); font-size: 14px; color: #111820; padding: 0;
        }
        .forgot-form .field input::placeholder { color: #9aa6b8; }
        .forgot-form .reset-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; min-height: 52px; padding: 0 24px; border: none; border-radius: 12px;
          font-family: var(--font); font-weight: 600; font-size: 15px; cursor: pointer;
          background: linear-gradient(180deg, #0e4fa8, #073c86); color: #ffffff;
          box-shadow: 0 10px 28px rgba(14, 79, 168, 0.28);
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease; margin-top: 4px;
        }
        .forgot-form .reset-btn:hover:not(:disabled) {
          transform: translateY(-2px); background: #052e68; box-shadow: 0 14px 34px rgba(14, 79, 168, 0.36);
        }
        .forgot-form .reset-btn i { font-size: 12px; line-height: 1; opacity: 0.9; }
        .forgot-form .reset-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .forgot-card .back-link {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 20px;
          font-size: 14px; color: var(--yuvo-muted); text-decoration: none;
          transition: color 0.2s, gap 0.2s; font-weight: 500;
        }
        .forgot-card .back-link:hover { color: var(--yuvo-blue); gap: 12px; }
        .forgot-card .back-link i { font-size: 12px; }
        
        .success-state { text-align: center; padding: 12px 0 4px; }
        .success-state .success-icon { font-size: 48px; color: #2d9e6b; margin-bottom: 12px; }
        .success-state h3 { font-size: 20px; font-weight: 600; color: #111820; margin-bottom: 6px; }
        .success-state p { font-size: 14px; color: var(--yuvo-muted); max-width: 300px; margin: 0 auto 12px; }

        @media (max-width: 768px) {
          .forgot-page { padding: 120px 16px 60px; }
          .forgot-card { padding: 28px 20px; border-radius: 22px; }
          .forgot-card h1 { font-size: 24px; }
        }
        @media (max-width: 480px) {
          .forgot-card { padding: 24px 16px; }
          .forgot-card h1 { font-size: 20px; }
          .forgot-form .field { height: 44px; padding: 0 12px; }
          .forgot-form .reset-btn { min-height: 46px; font-size: 14px; }
        }
      `}</style>
      
      <div className="forgot-page-wrapper">
        <StoreHeader />
        <ForgotPasswordClient />
        <StoreFooter />
      </div>
    </div>
  );
}
