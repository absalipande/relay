import { AuthForm } from "@/features/auth/components/auth-form";
import { AuthHero } from "@/features/auth/components/auth-hero";
import { WorkspaceEmptyState } from "@/features/workspaces/components/workspace-empty-state";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <AuthHero />
        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
          <div className="w-full max-w-[470px]">
            {user ? (
              <WorkspaceEmptyState email={user.email ?? "Unknown user"} />
            ) : (
              <>
                <div className="mb-7 text-center">
                  <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                    <img src="/relay-logo.svg" alt="" className="h-10 w-auto" />
                    <span className="text-2xl font-semibold tracking-tight">
                      relay
                    </span>
                  </div>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                    Welcome back
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Sign in to continue to Relay
                  </p>
                </div>
                <AuthForm />
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
