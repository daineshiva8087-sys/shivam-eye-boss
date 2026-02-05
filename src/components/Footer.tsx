import { Camera, Phone, Mail, MapPin } from "lucide-react";
import { BUSINESS_INFO } from "@/lib/supabase";
import { Link } from "react-router-dom";

export function Footer() {
  const handleOpenMaps = () => {
    window.open(BUSINESS_INFO.googleMapsUrl, "_blank");
  };

  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Camera className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Shivam CCTV</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for professional CCTV installation and security solutions in Jalna.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Services
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-foreground">Contact Us</h3>
            <div className="space-y-3">
              <a
                href={`tel:${BUSINESS_INFO.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-4 w-4 text-primary" />
                {BUSINESS_INFO.phone}
              </a>
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
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Shivam CCTV. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
