import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { BUSINESS_INFO } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle, Clock, Globe } from "lucide-react";

export default function Contact() {
  const handleCall = () => {
    window.open(`tel:${BUSINESS_INFO.phone}`, "_self");
  };

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=Hello! I'm interested in your CCTV products and services.`,
      "_blank"
    );
  };

  const handleOpenMaps = () => {
    window.open(BUSINESS_INFO.googleMapsUrl, "_blank");
  };

  const handleEmail = () => {
    window.open(`mailto:${BUSINESS_INFO.email}`, "_self");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="hero-section py-16 md:py-24">
          <div className="container text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Get in touch with us for any queries or support
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Cards */}
              <div className="space-y-6">
                <div className="product-card rounded-xl p-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      Phone
                    </h3>
                    <p className="text-muted-foreground mb-3">{BUSINESS_INFO.phone}</p>
                    <Button onClick={handleCall} className="bg-primary hover:bg-primary/90">
                      Call Now
                    </Button>
                  </div>
                </div>

                <div className="product-card rounded-xl p-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cctv-success/10 flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-cctv-success" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      WhatsApp
                    </h3>
                    <p className="text-muted-foreground mb-3">{BUSINESS_INFO.phone}</p>
                    <Button onClick={handleWhatsApp} variant="outline" className="border-cctv-success text-cctv-success hover:bg-cctv-success hover:text-primary-foreground">
                      Chat on WhatsApp
                    </Button>
                  </div>
                </div>

                <div className="product-card rounded-xl p-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      Email
                    </h3>
                    <p className="text-muted-foreground mb-3">{BUSINESS_INFO.email}</p>
                    <Button onClick={handleEmail} variant="outline">
                      Send Email
                    </Button>
                  </div>
                </div>

                <div className="product-card rounded-xl p-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      Website
                    </h3>
                    <a
                      href="https://shivamcctv.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      🌐 shivamcctv.in
                    </a>
                  </div>
                </div>

                <div className="product-card rounded-xl p-6 flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                      Business Hours
                    </h3>
                    <p className="text-muted-foreground">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                    <p className="text-muted-foreground">Sunday: 10:00 AM - 4:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Map & Address */}
              <div className="space-y-6">
                <div className="product-card rounded-xl p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold text-foreground mb-1">
                        Our Location
                      </h3>
                      <p className="text-muted-foreground">{BUSINESS_INFO.address}</p>
                    </div>
                  </div>
                  <Button onClick={handleOpenMaps} className="w-full bg-primary hover:bg-primary/90">
                    <MapPin className="h-4 w-4 mr-2" />
                    Open in Google Maps
                  </Button>
                </div>

                {/* Embedded Map */}
                <div className="product-card rounded-xl overflow-hidden h-[300px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3752.384893825894!2d75.88347887488845!3d19.843695681507807!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdb9e56a6e9c4a7%3A0x7e9d7c9c8c8c8c8c!2sJalna%2C%20Maharashtra%20431203!5e0!3m2!1sen!2sin!4v1699999999999!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Shivam CCTV Location"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Support Email Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
                Customer Support
              </h2>
              <div className="product-card rounded-xl p-6 md:p-8 space-y-5">
                <a
                  href={`mailto:${BUSINESS_INFO.email}?subject=${encodeURIComponent('Support Request - Shivam CCTV')}`}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Primary Email</p>
                    <p className="text-foreground font-semibold group-hover:text-primary transition-colors">{BUSINESS_INFO.email}</p>
                  </div>
                </a>
                <a
                  href={`mailto:support@shivamcctv.in?subject=${encodeURIComponent('Support Request - Shivam CCTV')}`}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Support Email</p>
                    <p className="text-foreground font-semibold group-hover:text-primary transition-colors">support@shivamcctv.in</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
