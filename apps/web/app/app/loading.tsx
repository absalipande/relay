import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="grid min-h-full place-items-center py-24">
      <Loader2
        className="size-5 animate-spin text-[#007AFF]"
        aria-label="Loading page content"
      />
    </div>
  );
}
