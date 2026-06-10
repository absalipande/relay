import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white text-slate-950">
      <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-600 shadow-sm">
        <Loader2 className="size-4 animate-spin text-[#007AFF]" />
        Opening Relay
      </div>
    </main>
  );
}
