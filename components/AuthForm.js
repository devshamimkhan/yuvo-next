"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

function PasswordToggle({ visible, onClick }) {
  return (
    <button
      type="button"
      className="toggle-pw"
      onClick={onClick}
      aria-label="Toggle password visibility"
    >
      <i className={visible ? "fa-regular fa-eye-slash" : "fa-regular fa-eye"} />
    </button>
  );
}

export default function AuthForm({ mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/auth/redirect";
  const isRegister = mode === "register";
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const strength = [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password) && /[^a-zA-Z0-9]/.test(password),
  ].filter(Boolean).length;

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const formPassword = formData.get("password");

    if (isRegister && formPassword !== formData.get("confirmPassword")) {
      setStatus({ type: "error", message: "Passwords do not match." });
      setIsSubmitting(false);
      return;
    }

    if (isRegister) {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email,
          password: formPassword,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setStatus({ type: "error", message: payload.message });
        setIsSubmitting(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password: formPassword,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setStatus({
        type: "error",
        message: "The email or password you entered is incorrect.",
      });
      return;
    }

    router.push(result?.url || callbackUrl);
    router.refresh();
  }

  if (isRegister) {
    return (
      <form className="register-form" onSubmit={handleSubmit} noValidate>
        <div className="field-group">
          <label htmlFor="regFullName">Full Name</label>
          <div className="field">
            <i className="fa-regular fa-user" />
            <input
              name="name"
              type="text"
              id="regFullName"
              placeholder="e.g. Alex Rivera"
              required
              autoFocus
              autoComplete="name"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="regEmail">Email Address</label>
          <div className="field">
            <i className="fa-regular fa-envelope" />
            <input
              name="email"
              type="email"
              id="regEmail"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="regPassword">Password</label>
          <div className="field">
            <i className="fa-solid fa-lock" />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              id="regPassword"
              placeholder="Create a strong password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
            />
            <PasswordToggle
              visible={showPassword}
              onClick={() => setShowPassword((value) => !value)}
            />
          </div>
          <div className="pw-hint">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`dot ${index < strength ? (strength === 3 ? "strong" : "active") : ""}`}
              />
            ))}
            <span>
              {password
                ? strength === 3
                  ? "Strong - great password!"
                  : strength === 2
                    ? "Fair - getting better, add more variety"
                    : "Weak - add more characters, numbers and symbols"
                : "Use 8+ characters with a mix of letters, numbers and symbols"}
            </span>
          </div>
        </div>

        <div className="field-group">
          <label htmlFor="regConfirm">Confirm Password</label>
          <div
            className={`field ${
              confirmPassword && confirmPassword === password
                ? "field-valid"
                : confirmPassword
                  ? "field-invalid"
                  : ""
            }`}
          >
            <i className="fa-solid fa-check-circle" />
            <input
              name="confirmPassword"
              type="password"
              id="regConfirm"
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="terms-row">
          <input type="checkbox" id="termsCheck" required />
          <label htmlFor="termsCheck">
            I agree to the <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>. I&apos;m at least 16 years old.
          </label>
        </div>

        {status.message ? <p className="auth-message">{status.message}</p> : null}

        <button className="register-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> Creating account...
            </>
          ) : (
            <>
              Create Account <i className="fa-solid fa-chevron-right" />
            </>
          )}
        </button>
      </form>
    );
  }

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      <div className="field-group">
        <label htmlFor="loginEmail">Email Address</label>
        <div className="field">
          <i className="fa-regular fa-envelope" />
          <input
            name="email"
            type="email"
            id="loginEmail"
            placeholder="you@example.com"
            required
            autoFocus
            autoComplete="email"
          />
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="loginPassword">Password</label>
        <div className="field">
          <i className="fa-solid fa-lock" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            id="loginPassword"
            placeholder="Password"
            required
            autoComplete="current-password"
          />
          <PasswordToggle
            visible={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          />
        </div>
      </div>

      <div className="options-row">
        <label className="remember">
          <input type="checkbox" name="remember" defaultChecked />
          Remember me
        </label>
        <a href="#" className="forgot-link">
          Forgot password?
        </a>
      </div>

      {status.message ? <p className="auth-message">{status.message}</p> : null}

      <button className="login-btn" type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" /> Please wait...
          </>
        ) : (
          <>
            Log In <i className="fa-solid fa-chevron-right" />
          </>
        )}
      </button>
    </form>
  );
}
