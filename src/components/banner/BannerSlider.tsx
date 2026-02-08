import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { BannerCard } from "./BannerCard";
import { useBanners } from "./useBanners";
import { useBannerActions } from "./useBannerActions";

// Generate dynamic content based on click action
function getBannerContent(banner: {
  title: string | null;
  click_action_type: string;
  click_action_value: string | null;
}) {
  const badges: Record<string, string> = {
    product: "🎯 FEATURED",
    category: "📦 COLLECTION",
    offers: "🔥 HOT DEAL",
    services: "🛠️ SERVICE",
    whatsapp: "💬 CONTACT US",
    external: "🔗 EXPLORE",
    none: "",
  };

  const descriptions: Record<string, string> = {
    product: "Check out this amazing product with great features",
    category: "Browse our curated collection",
    offers: "Limited time offer - Don't miss out!",
    services: "Professional CCTV installation services",
    whatsapp: "Get instant quotation via WhatsApp",
    external: "Discover more about our offerings",
    none: "Explore our premium products",
  };

  const ctaTexts: Record<string, string> = {
    product: "View Product",
    category: "Browse Collection",
    offers: "See Offers",
    services: "Book Service",
    whatsapp: "Chat Now",
    external: "Learn More",
    none: "View Details",
  };

  return {
    badge: badges[banner.click_action_type] || "",
    description: descriptions[banner.click_action_type] || "",
    ctaText: ctaTexts[banner.click_action_type] || "View Details",
  };
}

export function BannerSlider() {
  const { banners, loading } = useBanners();
  const { handleBannerClick } = useBannerActions();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  // Auto-slide functionality
  useEffect(() => {
    if (!api || banners.length <= 1) return;

    // Use the first banner's interval or default to 4 seconds
    const interval = (banners[0]?.auto_slide_interval || 4) * 1000;

    const autoSlide = setInterval(() => {
      api.scrollNext();
    }, interval);

    return () => clearInterval(autoSlide);
  }, [api, banners]);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Don't render if loading or no active banners
  if (loading || banners.length === 0) return null;

  return (
    <section className="w-full py-4 md:py-6 bg-gradient-to-b from-muted/30 to-background">
      <div className="container px-4">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {banners.map((banner) => {
              const content = getBannerContent(banner);
              
              return (
                <CarouselItem key={banner.id} className="pl-2 md:pl-4">
                  <BannerCard
                    title={banner.title}
                    imageUrl={banner.image_url}
                    badge={content.badge}
                    description={content.description}
                    ctaText={content.ctaText}
                    imageFitMode={banner.image_fit_mode}
                    onClick={() => handleBannerClick(banner)}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {banners.length > 1 && (
            <>
              <CarouselPrevious className="left-2 md:left-6 h-8 w-8 md:h-10 md:w-10 opacity-80 hover:opacity-100 bg-background/80 backdrop-blur-sm border-border/50 shadow-lg" />
              <CarouselNext className="right-2 md:right-6 h-8 w-8 md:h-10 md:w-10 opacity-80 hover:opacity-100 bg-background/80 backdrop-blur-sm border-border/50 shadow-lg" />
            </>
          )}
        </Carousel>

        {/* Dot Indicators */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  current === index
                    ? "bg-primary w-8"
                    : "bg-primary/30 hover:bg-primary/50 w-2"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
