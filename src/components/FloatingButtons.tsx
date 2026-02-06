import { Phone } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/supabase";

export function FloatingButtons() {
  const handleCall = () => {
    window.open(`tel:${BUSINESS_INFO.phone}`, "_self");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <button
        onClick={handleCall}
        className="fab flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        aria-label="Call"
      >
        <Phone className="h-6 w-6" />
      </button>
    </div>
  );
}
