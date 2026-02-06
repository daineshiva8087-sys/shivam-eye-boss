import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  banner_image_url: string | null;
  highlight_text: string | null;
  is_active: boolean;
  display_order: number;
}

export function OfferBanner() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || offers.length === 0) return null;

  return (
    <section className="py-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container">
        <Carousel
          opts={{ loop: true }}
          className="w-full"
        >
          <CarouselContent>
            {offers.map((offer) => (
              <CarouselItem key={offer.id}>
                <div className="relative flex flex-col md:flex-row items-center gap-4 p-6 rounded-xl bg-card border border-primary/20 overflow-hidden">
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
                    {offer.highlight_text && (
                      <Badge className="mb-2 bg-primary text-primary-foreground">
                        <Sparkles className="h-3 w-3 mr-1" />
                        {offer.highlight_text}
                      </Badge>
                    )}
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="text-muted-foreground text-sm md:text-base">
                        {offer.description}
                      </p>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
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
  );
}
