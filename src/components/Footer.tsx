import { Phone, Mail, MapPin, MessageCircle, Globe } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/supabase";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

export function Footer() {
  const { t } = useLanguage();

  const handleOpenMaps = () => {
    window.open(BUSINESS_INFO.googleMapsUrl, "_blank");
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
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img 
                src="/app-icon.png" 
                alt="Shivam CCTV" 
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="font-display text-xl font-bold">Shivam CCTV</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('footerTagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">{t('quickLinks')}</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('home')}
              </Link>
              <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('services')}
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('contact')}
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">{t('contactUs')}</h3>
            <div className="space-y-3">
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                {BUSINESS_INFO.phone}
              </a>
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[#25D366]" />
                WhatsApp
              </button>
              <a
                href={`mailto:${BUSINESS_INFO.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                {BUSINESS_INFO.email}
              </a>
              <button
                onClick={handleOpenMaps}
                className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
              >
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                {BUSINESS_INFO.address}
              </button>
              <a
                href="https://shivamcctv.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Globe className="h-4 w-4 text-primary" />
                🌐 Website: shivamcctv.in
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          {t('footerCopyright')}
        </div>
      </div>
    </footer>
  );
}
