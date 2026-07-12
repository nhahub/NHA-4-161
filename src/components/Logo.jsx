import { Heart } from "lucide-react";

export default function Logo({ compact = false, subtitle = "Hospital Reservation System" }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600">
          <Heart className="h-4 w-4 text-white" fill="currentColor" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-foreground">MediCare</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
        <Heart className="h-7 w-7 text-white" fill="currentColor" />
      </div>
      <h1 className="text-2xl font-bold text-foreground">MediCare</h1>
      <p className="text-sm italic text-muted-foreground">{subtitle}</p>
    </div>
  );
}