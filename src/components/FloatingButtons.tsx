import { Phone, MessageCircle } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/supabase";

export function FloatingButtons() {
  const handleCall = () => {
    window.open(`tel:${BUSINESS_INFO.phone}`, "_self");
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello! I'm interested in your CCTV products and services.`,
      "_blank"
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <button
        onClick={handleWhatsApp}
        className="fab flex h-14 w-14 items-center justify-center rounded-full bg-cctv-success text-primary-foreground hover:opacity-90 transition-colors"
        aria-label="WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
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
