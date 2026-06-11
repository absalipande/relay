"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

export type AuthMode = "sign-in" | "sign-up";

const authSchema = z.object({
  fullName: z.string().optional(),
  email: z.email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type AuthFormValues = z.infer<typeof authSchema>;

type AuthFormProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
};

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function submitAuth(values: AuthFormValues) {
    setIsLoading(true);
    setMessage(null);

    const fullName = values.fullName?.trim();
    const email = values.email.trim();

    if (mode === "sign-up" && (!fullName || fullName.length < 2)) {
      setIsLoading(false);
      setError("fullName", {
        message: "Enter your full name.",
        type: "manual",
      });
      return;
    }

    const authCall =
      mode === "sign-in"
        ? supabase.auth.signInWithPassword({
            email,
            password: values.password,
          })
        : supabase.auth.signUp({
            email,
            password: values.password,
            options: {
              emailRedirectTo: `${window.location.origin}/`,
              data: {
                full_name: fullName,
              },
            },
          });

    const { error } = await authCall;

    setIsLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (mode === "sign-in") {
      setMessage("Signed in. Opening your workspace.");
      router.push("/app");
      router.refresh();
    } else {
      const params = new URLSearchParams({ email });
      router.push(`/verify-email?${params.toString()}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(submitAuth)} className="space-y-5">
      <Tabs
        value={mode}
        onValueChange={(value) => onModeChange(value as AuthMode)}
      >
        <TabsList
          variant="line"
          className="grid h-auto w-full grid-cols-2 gap-0 bg-white p-0 text-sm font-semibold"
        >
          <TabsTrigger
            value="sign-in"
            className="rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-4 py-3 text-slate-500 shadow-none after:hidden focus-visible:border-x-0 focus-visible:border-t-0 focus-visible:border-b-[#007AFF] focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-[#007AFF] data-[state=active]:bg-transparent data-[state=active]:text-[#007AFF] data-active:border-x-0 data-active:border-t-0 data-active:border-b-[#007AFF] data-active:bg-transparent data-active:text-[#007AFF]"
          >
            Sign In
          </TabsTrigger>
          <TabsTrigger
            value="sign-up"
            className="rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-4 py-3 text-slate-500 shadow-none after:hidden focus-visible:border-x-0 focus-visible:border-t-0 focus-visible:border-b-[#007AFF] focus-visible:ring-0 focus-visible:outline-none data-[state=active]:border-x-0 data-[state=active]:border-t-0 data-[state=active]:border-b-[#007AFF] data-[state=active]:bg-transparent data-[state=active]:text-[#007AFF] data-active:border-x-0 data-active:border-t-0 data-active:border-b-[#007AFF] data-active:bg-transparent data-active:text-[#007AFF]"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {mode === "sign-up" ? (
        <Label className="block space-y-3">
          <span className="block text-sm font-semibold text-slate-800">
            Full name
          </span>
          <span className="mt-1.5 flex h-12 items-center gap-4 rounded-lg border border-[#E8EEF7] bg-white px-4 shadow-sm shadow-slate-900/[0.01] focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-blue-50">
            <UserIcon />
            <Input
              type="text"
              placeholder="Your name"
              autoComplete="name"
              {...register("fullName")}
              className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-base leading-none text-slate-950 caret-[#007AFF] shadow-none outline-none selection:bg-blue-100 placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-0"
            />
          </span>
          {errors.fullName ? (
            <span className="mt-1 block text-xs font-medium text-red-600">
              {errors.fullName.message}
            </span>
          ) : null}
        </Label>
      ) : null}

      <Label className="block space-y-3">
        <span className="block text-sm font-semibold text-slate-800">
          Email address
        </span>
        <span className="mt-1.5 flex h-12 items-center gap-4 rounded-lg border border-[#E8EEF7] bg-white px-4 shadow-sm shadow-slate-900/[0.01] focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-blue-50">
          <MailIcon />
          <Input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-base leading-none text-slate-950 caret-[#007AFF] shadow-none outline-none selection:bg-blue-100 placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-0"
          />
        </span>
        {errors.email ? (
          <span className="mt-1 block text-xs font-medium text-red-600">
            {errors.email.message}
          </span>
        ) : null}
      </Label>

      <Label className="block space-y-3">
        <span className="block text-sm font-semibold text-slate-800">
          Password
        </span>
        <span className="mt-1.5 flex h-12 items-center gap-4 rounded-lg border border-[#E8EEF7] bg-white px-4 shadow-sm shadow-slate-900/[0.01] focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-blue-50">
          <LockIcon />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 text-base leading-none text-slate-950 caret-[#007AFF] shadow-none outline-none selection:bg-blue-100 placeholder:text-slate-400 focus-visible:border-transparent focus-visible:ring-0"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowPassword((value) => !value)}
            className="size-6 text-slate-400 hover:bg-transparent hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <EyeIcon />
          </Button>
        </span>
        {errors.password ? (
          <span className="mt-1 block text-xs font-medium text-red-600">
            {errors.password.message}
          </span>
        ) : null}
      </Label>

      {mode === "sign-in" ? (
        <div className="text-right">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-semibold text-[#007AFF] hover:text-[#312ECB]"
          >
            Forgot password?
          </Button>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-900">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 min-h-12 w-full appearance-none rounded-lg bg-[#007AFF] px-5 text-base font-semibold leading-none text-white shadow-lg shadow-[#312ECB]/10 hover:bg-[#006be0] disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin text-white" />
            {mode === "sign-in" ? "Signing in" : "Creating account"}
          </>
        ) : mode === "sign-in" ? (
          "Sign In"
        ) : (
          "Create account"
        )}
      </Button>

      <div className="flex items-center gap-5 text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span className="text-sm font-medium">or continue with</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="h-auto w-full gap-3 rounded-lg border-[#E8EEF7] py-3 text-base font-semibold text-slate-700 shadow-sm shadow-slate-900/[0.015] hover:border-slate-300 hover:bg-slate-50"
        >
          <span className="text-xl font-bold text-[#ea4335]">G</span>
          Continue with Google
        </Button>
      </div>

      <p className="pt-2 text-center text-sm text-slate-500">
        {mode === "sign-in"
          ? "Don't have an account? "
          : "Already have an account? "}
        <Button
          type="button"
          variant="link"
          onClick={() =>
            onModeChange(mode === "sign-in" ? "sign-up" : "sign-in")
          }
          className="h-auto p-0 font-semibold text-[#007AFF] hover:text-[#312ECB]"
        >
          {mode === "sign-in" ? "Sign up" : "Sign in"}
        </Button>
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

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M12 12.25a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 19.25a6.25 6.25 0 0 1 12.5 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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
