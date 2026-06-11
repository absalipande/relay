import { Spinner } from "@/components/ui/spinner";

export default function AppLoading() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <div className="h-3 w-32 rounded-full bg-[#E2E8F0]" />
          <div className="h-9 w-64 max-w-full rounded-[0.75rem] bg-[#E2E8F0]" />
          <div className="h-4 w-96 max-w-full rounded-full bg-[#F1F5F9]" />
        </div>
        <div className="flex items-center gap-2 rounded-[0.85rem] border border-[#E4E4E7] bg-white px-3 py-2 text-sm font-medium text-[#64748B]">
          <Spinner className="size-4 text-[#007AFF]" aria-label="Loading page content" />
          Loading
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-40 rounded-[1rem] border border-[#E4E4E7] bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-[0.8rem] bg-[#EEF6FF]" />
              <div className="h-4 w-28 rounded-full bg-[#E2E8F0]" />
            </div>
            <div className="mt-8 h-9 w-16 rounded-[0.75rem] bg-[#E2E8F0]" />
            <div className="mt-3 h-4 w-36 rounded-full bg-[#F1F5F9]" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_0.95fr]">
        <PanelSkeleton />
        <PanelSkeleton compact />
      </div>
    </div>
  );
}

function PanelSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <section className="rounded-[1rem] border border-[#E4E4E7] bg-white p-5">
      <div className="h-5 w-36 rounded-full bg-[#E2E8F0]" />
      <div className="mt-2 h-4 w-60 max-w-full rounded-full bg-[#F1F5F9]" />
      <div
        className={`mt-5 rounded-[0.9rem] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] ${
          compact ? "h-56" : "h-72"
        }`}
      />
    </section>
  );
}
