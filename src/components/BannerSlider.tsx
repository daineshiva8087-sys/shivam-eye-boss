import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  click_action_type: string;
  click_action_value: string | null;
  image_fit_mode: string;
  auto_slide_interval: number;
}

const WHATSAPP_NUMBER = "917972698618";

export function BannerSlider() {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const isBannerCurrentlyActive = useCallback((banner: Banner): boolean => {
    if (!banner.is_active) return false;

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    if (banner.start_date && currentDate < banner.start_date) return false;
    if (banner.end_date && currentDate > banner.end_date) return false;
    if (banner.start_time && banner.end_time) {
      if (currentTime < banner.start_time || currentTime > banner.end_time) return false;
    }

    return true;
  }, []);

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      const activeBanners = (data || []).filter(isBannerCurrentlyActive);
      console.log("[BannerSlider] Loaded banners:", activeBanners.length, "active out of", data?.length || 0);
      setBanners(activeBanners);
    } catch (error) {
      console.error("[BannerSlider] Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  }, [isBannerCurrentlyActive]);

  // Initial fetch
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // Real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('banners-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'banners',
        },
        (payload) => {
          console.log("[BannerSlider] Real-time update:", payload.eventType);
          fetchBanners();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchBanners]);

  // Auto-slide functionality
  useEffect(() => {
    if (!api || banners.length <= 1) return;

    // Use the first banner's interval or default to 5 seconds
    const interval = (banners[0]?.auto_slide_interval || 5) * 1000;

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

  const handleBannerClick = useCallback((banner: Banner) => {
    switch (banner.click_action_type) {
      case "product":
        if (banner.click_action_value) {
          // Scroll to products and potentially filter/highlight
          const productsSection = document.getElementById("products");
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth" });
          }
        }
        break;
      case "category":
        if (banner.click_action_value) {
          // Scroll to products section - category filtering handled by parent
          const productsSection = document.getElementById("products");
          if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth" });
          }
          // Dispatch custom event for category selection
          window.dispatchEvent(new CustomEvent("selectCategory", { 
            detail: { category: banner.click_action_value } 
          }));
        }
        break;
      case "offers":
        navigate("/");
        // Scroll to combo section which shows offers
        setTimeout(() => {
          document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
        break;
      case "services":
        navigate("/services");
        break;
      case "whatsapp":
        const message = banner.click_action_value || "Hi, I'm interested in your products";
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        break;
      case "external":
        if (banner.click_action_value) {
          window.open(banner.click_action_value, "_blank");
        }
        break;
      default:
        break;
    }
  }, [navigate]);

  if (loading || banners.length === 0) return null;

  return (
    <section className="w-full bg-muted/30">
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-0">
              <div
                onClick={() => handleBannerClick(banner)}
                className={cn(
                  "relative w-full aspect-[21/9] cursor-pointer overflow-hidden",
                  banner.click_action_type !== "none" && "cursor-pointer"
                )}
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  className={cn(
                    "w-full h-full transition-transform duration-300 hover:scale-[1.02]",
                    banner.image_fit_mode === "cover" && "object-cover",
                    banner.image_fit_mode === "contain" && "object-contain bg-muted",
                    banner.image_fit_mode === "auto" && "object-fill"
                  )}
                  loading="eager"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {banners.length > 1 && (
          <>
            <CarouselPrevious className="left-2 md:left-4 h-8 w-8 md:h-10 md:w-10 opacity-70 hover:opacity-100" />
            <CarouselNext className="right-2 md:right-4 h-8 w-8 md:h-10 md:w-10 opacity-70 hover:opacity-100" />
          </>
        )}

        {/* Dot Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  current === index
                    ? "bg-primary w-6"
                    : "bg-primary/40 hover:bg-primary/60"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  );
}
