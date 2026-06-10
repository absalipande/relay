import { AuthHero } from "@/features/auth/components/auth-hero";
import { AuthPanel } from "@/features/auth/components/auth-panel";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
        <AuthHero />
        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
          <div className="w-full max-w-[470px]">
            <AuthPanel />
          </div>
        </section>
      </div>
    </main>
  );
}
