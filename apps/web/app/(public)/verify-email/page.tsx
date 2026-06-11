import { Button } from "@/components/ui/button";
import Link from "next/link";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string;
  }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const { email } = await searchParams;
  const displayEmail = email?.trim() || "your email";

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
        <Link href="/" className="flex w-fit items-center gap-3">
          <img src="/relay-logo.svg" alt="" className="h-9 w-auto" />
          <span className="text-2xl font-semibold tracking-tight">relay</span>
        </Link>

        <section className="flex flex-1 justify-center pt-[12vh] sm:pt-[15vh]">
          <div className="w-full max-w-[520px] text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#007AFF] ring-1 ring-blue-100">
              <MailCheckIcon />
            </div>

            <p className="mt-7 text-sm font-semibold uppercase tracking-[0.18em] text-[#007AFF]">
              Verify your email
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Check your inbox
            </h1>
            <p className="mx-auto mt-4 max-w-[420px] text-base leading-7 text-slate-500">
              Supabase sent a confirmation link to{" "}
              <span className="font-semibold text-slate-800">
                {displayEmail}
              </span>
              . Click that link to verify your email, then you will return to
              Relay to sign in.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4">
              <Button
                asChild
                className="h-11 w-full rounded-lg bg-[#007AFF] px-5 text-sm font-semibold text-white shadow-lg shadow-[#312ECB]/10 hover:bg-[#006be0] sm:w-auto"
              >
                <a href="https://mail.google.com/mail/u/0/#inbox">Open Gmail</a>
              </Button>
              <Link
                href="/"
                className="text-sm font-semibold text-[#007AFF] hover:text-[#312ECB]"
              >
                Already verified? Sign in
              </Link>
            </div>

            <p className="mx-auto mt-6 max-w-[390px] text-sm leading-6 text-slate-400">
              The email may take a minute to arrive. Check spam or promotions if
              it is not in your inbox.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function MailCheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-7"
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
      <path
        d="m14.75 16.75 1.5 1.5 3-3.25"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
