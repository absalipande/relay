"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const authCall =
      mode === "sign-in"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await authCall;

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage(
      mode === "sign-up"
        ? "Account created. Check your email if confirmation is enabled, then sign in."
        : "Signed in. Refreshing your workspace.",
    );

    if (mode === "sign-in") {
      window.location.reload();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white text-sm font-semibold">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`border-b-2 px-4 py-3 transition ${
            mode === "sign-in"
              ? "border-[#007AFF] text-[#007AFF]"
              : "border-transparent text-slate-500"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`border-b-2 px-4 py-3 transition ${
            mode === "sign-up"
              ? "border-[#007AFF] text-[#007AFF]"
              : "border-transparent text-slate-500"
          }`}
        >
          Sign Up
        </button>
      </div>

      <label className="block space-y-3">
        <span className="text-sm font-semibold text-slate-800">
          Email address
        </span>
        <span className="mt-1.5 flex min-h-[42px] items-center gap-5 rounded-lg border border-[#E8EEF7] px-4 py-2 shadow-sm shadow-slate-900/[0.01] focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-blue-50">
          <MailIcon />
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-full min-w-0 flex-1 appearance-none bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400 focus:outline-none"
          />
        </span>
      </label>

      <label className="block space-y-3">
        <span className="text-sm font-semibold text-slate-800">
          Password
        </span>
        <span className="mt-1.5 flex min-h-[42px] items-center gap-5 rounded-lg border border-[#E8EEF7] px-4 py-2 shadow-sm shadow-slate-900/[0.01] focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-blue-50">
          <LockIcon />
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-full min-w-0 flex-1 appearance-none bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="text-slate-400 transition hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon />
          </button>
        </span>
      </label>

      {mode === "sign-in" ? (
        <div className="text-right">
          <button
            type="button"
            className="text-sm font-semibold text-[#007AFF] transition hover:text-[#312ECB]"
          >
            Forgot password?
          </button>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="h-12 min-h-12 w-full appearance-none rounded-lg bg-[#007AFF] px-5 text-base font-semibold leading-none text-white shadow-lg shadow-[#312ECB]/10 transition hover:bg-[#006be0] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading
          ? "Working..."
          : mode === "sign-in"
            ? "Sign In"
            : "Create account"}
      </button>

      <div className="flex items-center gap-5 text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-sm font-medium">or continue with</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-4">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#E8EEF7] py-3 text-base font-semibold text-slate-700 shadow-sm shadow-slate-900/[0.015] transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span className="text-xl font-bold text-[#ea4335]">G</span>
          Continue with Google
        </button>
      </div>

      <p className="pt-2 text-center text-sm text-slate-500">
        {mode === "sign-in"
          ? "Don't have an account? "
          : "Already have an account? "}
        <button
          type="button"
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="font-semibold text-[#007AFF] hover:text-[#312ECB]"
        >
          {mode === "sign-in" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </form>
  );
}

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M4.75 6.75h14.5v10.5H4.75V6.75Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m5.25 7.25 6.75 5 6.75-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7.75 10.25V8a4.25 4.25 0 0 1 8.5 0v2.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.75 10.25h10.5v8H6.75v-8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M3.75 12s2.75-5.25 8.25-5.25S20.25 12 20.25 12 17.5 17.25 12 17.25 3.75 12 3.75 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 14.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}
