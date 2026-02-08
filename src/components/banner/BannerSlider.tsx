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
    none: "✨ SPECIAL",
  };

  const descriptions: Record<string, string> = {
    product: "Discover this amazing product with premium features",
    category: "Browse our curated collection of quality products",
    offers: "Limited time offer - Don't miss out on savings!",
    services: "Professional CCTV installation & maintenance",
    whatsapp: "Get instant quotation via WhatsApp",
    external: "Explore more about our premium offerings",
    none: "Explore our premium CCTV products",
  };

  const ctaTexts: Record<string, string> = {
    product: "View Product",
    category: "Browse Now",
    offers: "See Offers",
    services: "Book Service",
    whatsapp: "Chat Now",
    external: "Learn More",
    none: "View Details",
  };

  return {
    badge: badges[banner.click_action_type] || "✨ SPECIAL",
    description: descriptions[banner.click_action_type] || "Explore our products",
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
    <section className="w-full py-6 md:py-10 relative">
      {/* Background with subtle separation */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      {/* Subtle backdrop glow for premium feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[200%] bg-primary/5 blur-[100px] rounded-full" />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <Carousel
          setApi={setApi}
          opts={{
            loop: true,
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3 md:-ml-4">
            {banners.map((banner) => {
              const content = getBannerContent(banner);
              
              return (
                <CarouselItem key={banner.id} className="pl-3 md:pl-4">
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

          {/* Premium Navigation arrows */}
          {banners.length > 1 && (
            <>
              <CarouselPrevious 
                className={cn(
                  "left-2 md:left-6",
                  "h-9 w-9 md:h-11 md:w-11",
                  "bg-background/95 backdrop-blur-md",
                  "border border-white/20 shadow-xl",
                  "hover:bg-background hover:scale-110 hover:border-primary/30",
                  "transition-all duration-300",
                  "opacity-80 hover:opacity-100"
                )} 
              />
              <CarouselNext 
                className={cn(
                  "right-2 md:right-6",
                  "h-9 w-9 md:h-11 md:w-11",
                  "bg-background/95 backdrop-blur-md",
                  "border border-white/20 shadow-xl",
                  "hover:bg-background hover:scale-110 hover:border-primary/30",
                  "transition-all duration-300",
                  "opacity-80 hover:opacity-100"
                )} 
              />
            </>
          )}
        </Carousel>

        {/* Premium Dot Indicators */}
        {banners.length > 1 && (
          <div className="flex justify-center gap-2.5 mt-5">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "rounded-full transition-all duration-400 ease-out",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  current === index
                    ? "bg-primary w-9 h-3 shadow-lg shadow-primary/40"
                    : "bg-primary/25 hover:bg-primary/45 w-3 h-3 hover:scale-125"
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