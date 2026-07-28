import Link from "next/link";
import Image from "next/image";
import AuthForm from "@/components/AuthForm";

export default function AuthCard({ mode }) {
  const isRegister = mode === "register";

  return (
    <>
      <main className={isRegister ? "register-page" : "login-page"}>
        <section className={isRegister ? "register-card" : "login-card"}>
          <div className={isRegister ? "register-logo" : "login-logo"}>
            <Image src="/assets/img/logo.png" alt="YUVO" width={151} height={52} />
          </div>
          <p className={isRegister ? "register-tagline" : "login-tagline"}>
            Move Freely. Live Fully.
          </p>

          <AuthForm mode={mode} />

          <div className="divider">or</div>

          <p className={isRegister ? "login-note" : "signup-note"}>
            {isRegister ? "Already have an account?" : "New to YUVO?"}{" "}
            <Link href={isRegister ? "/login" : "/register"}>
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
