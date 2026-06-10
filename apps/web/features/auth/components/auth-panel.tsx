"use client";

import { useState } from "react";
import { AuthForm, type AuthMode } from "./auth-form";

export function AuthPanel() {
  const [mode, setMode] = useState<AuthMode>("sign-in");

  return (
    <>
      <div className="mb-7 text-center">
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
          <img src="/relay-logo.svg" alt="" className="h-10 w-auto" />
          <span className="text-2xl font-semibold tracking-tight">relay</span>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
          Welcome back
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {mode === "sign-in"
            ? "Sign in to continue to Relay"
            : "Sign up to continue to Relay"}
        </p>
      </div>
      <AuthForm mode={mode} onModeChange={setMode} />
    </>
  );
}
