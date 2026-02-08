import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Percent } from "lucide-react";
import { OfferDetailModal } from "./OfferDetailModal";
import { isBannerVisible } from "@/lib/timezone";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  banner_image_url: string | null;
  highlight_text: string | null;
  is_active: boolean;
  display_order: number;
  promo_code: string | null;
  discount_type: string | null;
  discount_value: number | null;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

export function OfferBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const isOfferCurrentlyActive = useCallback((offer: Offer): boolean => {
    // Use IST timezone utility for consistent behavior
    return isBannerVisible(
      offer.is_active,
      offer.start_date,
      offer.end_date,
      offer.start_time,
      offer.end_time
    );
  }, []);

  const fetchOffers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      // Filter offers that are currently active based on IST date/time
      const activeOffers = (data || []).filter(isOfferCurrentlyActive);
      setOffers(activeOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  }, [isOfferCurrentlyActive]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  // Periodic refresh for time-based visibility
  useEffect(() => {
    const interval = setInterval(fetchOffers, 60000);
    return () => clearInterval(interval);
  }, [fetchOffers]);

  const handleOfferClick = (offer: Offer) => {
    setSelectedOffer(offer);
    setModalOpen(true);
  };

  if (loading || offers.length === 0) return null;

  return (
    <>
      <section className="py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container">
          <Carousel
            opts={{ loop: true }}
            className="w-full"
          >
            <CarouselContent>
              {offers.map((offer) => {
                const discountText = offer.discount_type === 'percentage'
                  ? `${offer.discount_value}% OFF`
                  : offer.discount_value
                  ? `₹${offer.discount_value} OFF`
                  : null;

                return (
                  <CarouselItem key={offer.id}>
                    <div 
                      className="relative flex flex-col md:flex-row items-center gap-4 p-6 rounded-xl bg-card border border-primary/20 overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
                      onClick={() => handleOfferClick(offer)}
                    >
                      {offer.banner_image_url && (
                        <div className="w-full md:w-1/3 aspect-video md:aspect-square max-h-40 rounded-lg overflow-hidden">
                          <img
                            src={offer.banner_image_url}
                            alt={offer.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                          {offer.highlight_text && (
                            <Badge className="bg-primary text-primary-foreground">
                              <Sparkles className="h-3 w-3 mr-1" />
                              {offer.highlight_text}
                            </Badge>
                          )}
                          {discountText && (
                            <Badge variant="secondary" className="bg-cctv-success/20 text-cctv-success">
                              <Percent className="h-3 w-3 mr-1" />
                              {discountText}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                          {offer.title}
                        </h3>
                        {offer.description && (
                          <p className="text-muted-foreground text-sm md:text-base">
                            {offer.description}
                          </p>
                        )}
                        {offer.promo_code && (
                          <p className="text-xs text-primary mt-2">
                            Click for promo code
                          </p>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {offers.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>
      </section>

      <OfferDetailModal
        offer={selectedOffer}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
