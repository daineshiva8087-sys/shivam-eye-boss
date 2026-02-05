import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingButtons } from "@/components/FloatingButtons";
import { ServiceModal } from "@/components/ServiceModal";
import { Button } from "@/components/ui/button";
import { Camera, Wrench, Shield, CheckCircle, Eye, PlayCircle, Settings } from "lucide-react";

export default function Services() {
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState("site_survey");

  const handleBookService = (serviceType: string) => {
    setSelectedServiceType(serviceType);
    setServiceModalOpen(true);
  };

  const services = [
    {
      icon: Camera,
      title: "CCTV Installation",
      description: "Professional installation of CCTV cameras for homes, offices, shops, factories, and warehouses. We provide complete end-to-end installation with proper cable management and optimal camera positioning.",
      features: ["HD & 4K Cameras", "Night Vision", "Wide Angle Coverage", "Weatherproof Cameras"],
      serviceType: "installation",
    },
    {
      icon: Eye,
      title: "Free Site Survey",
      description: "Get a complimentary security assessment of your premises. Our experts will analyze your location and recommend the best CCTV solution for your needs.",
      features: ["No Obligation", "Expert Consultation", "Custom Recommendations", "Budget Planning"],
      serviceType: "site_survey",
    },
    {
      icon: PlayCircle,
      title: "Free Demo",
      description: "Experience our products before you buy. We offer free demonstrations of our CCTV systems so you can see the quality and features firsthand.",
      features: ["Live Demonstration", "Product Comparison", "Feature Explanation", "Q&A Session"],
      serviceType: "demo",
    },
    {
      icon: Wrench,
      title: "Repair & Maintenance",
      description: "Keep your surveillance system running smoothly with our maintenance and repair services. We service all brands and models of CCTV equipment.",
      features: ["Quick Response", "All Brands Serviced", "Spare Parts Available", "Annual Contracts"],
      serviceType: "service",
    },
    {
      icon: Settings,
      title: "System Upgrade",
      description: "Upgrade your existing CCTV system to the latest technology. We can enhance your current setup with HD cameras, better storage, and remote viewing capabilities.",
      features: ["HD Upgrades", "Cloud Storage", "Mobile Viewing", "AI Features"],
      serviceType: "installation",
    },
    {
      icon: Shield,
      title: "24/7 Support",
      description: "Round-the-clock technical support for all your security needs. Our team is always available to help you with any issues or concerns.",
      features: ["Phone Support", "Remote Troubleshooting", "Emergency Visits", "Training"],
      serviceType: "service",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="hero-section py-16 md:py-24">
          <div className="container text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Our Services
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Complete security solutions from installation to maintenance
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="product-card rounded-xl p-6 space-y-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <service.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleBookService(service.serviceType)}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Book Now
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingButtons />

      <ServiceModal
        open={serviceModalOpen}
        onOpenChange={setServiceModalOpen}
        defaultServiceType={selectedServiceType}
      />
    </div>
  );
}
