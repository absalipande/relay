import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-slate-950">
      <Loader2 className="size-5 animate-spin text-[#007AFF]" />
    </main>
  );
}
