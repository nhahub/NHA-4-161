import { Heart } from "lucide-react";

export default function Logo() {
  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600">
        <Heart className="h-7 w-7 text-white" fill="currentColor" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">MediCare</h1>
      <p className="text-sm italic text-slate-500">Hospital Reservation System</p>
    </div>
  );
}