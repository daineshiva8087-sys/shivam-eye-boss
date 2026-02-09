import { Button } from "@/components/ui/button";
import { BUSINESS_INFO } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { Shield, Phone, MapPin, Eye, MessageCircle } from "lucide-react";

interface HeroSectionProps {
  onBookService: () => void;
}

export function HeroSection({ onBookService }: HeroSectionProps) {
  const { t } = useLanguage();

  const handleOpenMaps = () => {
    window.open(BUSINESS_INFO.googleMapsUrl, "_blank");
  };

  const handleCall = () => {
    window.open(`tel:${BUSINESS_INFO.phone}`, "_self");
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `नमस्कार,\nमी Shivam CCTV App वरून संपर्क करत आहे.\nकृपया माहिती द्या.`
    );
    window.open(
      `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <section className="hero-section relative py-16 md:py-24 lg:py-32">
      <div className="absolute inset-0 grid-pattern" />
      
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Security Badge */}
          <div className="inline-flex items-center gap-2 security-badge animate-fade-in">
            <Shield className="h-4 w-4" />
            <span>{t('trustedSecurityPartner')}</span>
          </div>

          {/* Brand Name */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground animate-slide-up">
            {t('brandName')}
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl font-semibold text-gradient animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {t('tagline')}
          </p>

          {/* Since 2016 */}
          <p className="text-lg md:text-xl text-muted-foreground animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {t('since2016')}
          </p>

          {/* CTA Buttons - Prominent placement */}
          <div className="flex flex-col gap-3 pt-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {/* Primary CTAs - Call & WhatsApp side by side on mobile */}
            <div className="flex gap-2 justify-center">
              <Button
                size="lg"
                onClick={handleCall}
                className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-base sm:text-lg px-4 sm:px-6 h-12 sm:h-14 shadow-lg shadow-primary/30"
              >
                <Phone className="h-5 w-5 mr-2" />
                {t('callNow')}
              </Button>
              <Button
                size="lg"
                onClick={handleWhatsApp}
                className="flex-1 sm:flex-none bg-[#25D366] hover:bg-[#20BD5A] text-white text-base sm:text-lg px-4 sm:px-6 h-12 sm:h-14 shadow-lg shadow-[#25D366]/30"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                {t('whatsAppNow')}
              </Button>
            </div>
            {/* Free Site Survey CTA */}
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={onBookService}
                className="text-base sm:text-lg px-6 h-11 border-primary/50 hover:bg-primary/10 hover:border-primary"
              >
                <Eye className="h-5 w-5 mr-2 text-primary" />
                {t('freeSiteSurvey')}
              </Button>
            </div>
          </div>

          {/* Business Info */}
          <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <button
              onClick={handleOpenMaps}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <MapPin className="h-4 w-4 text-primary" />
              <span>{BUSINESS_INFO.address}</span>
            </button>
            <button
              onClick={handleCall}
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4 text-primary" />
              <span>{BUSINESS_INFO.phone}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
