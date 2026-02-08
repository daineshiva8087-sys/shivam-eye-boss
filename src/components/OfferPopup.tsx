import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, X, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  banner_image_url: string | null;
  highlight_text: string | null;
  promo_code: string | null;
  discount_type: string | null;
  discount_value: number | null;
  show_popup: boolean;
}

export function OfferPopup() {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [popupOffer, setPopupOffer] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkForPopupOffer();
  }, []);

  const checkForPopupOffer = async () => {
    // Check if popup was already shown in this session
    const shownOffers = sessionStorage.getItem('shownOfferPopups');
    const shownIds = shownOffers ? JSON.parse(shownOffers) : [];

    try {
      const { data, error } = await supabase
        .from("offers")
        .select("*")
        .eq("is_active", true)
        .eq("show_popup", true)
        .order("display_order", { ascending: true })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const offer = data[0];
        
        // Check if offer is currently active based on date/time
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

        let isActive = true;

        if (offer.start_date && currentDate < offer.start_date) isActive = false;
        if (offer.end_date && currentDate > offer.end_date) isActive = false;
        if (offer.start_time && offer.end_time) {
          if (currentTime < offer.start_time || currentTime > offer.end_time) isActive = false;
        }

        if (isActive && !shownIds.includes(offer.id)) {
          setPopupOffer(offer);
          setOpen(true);
          
          // Mark as shown
          sessionStorage.setItem('shownOfferPopups', JSON.stringify([...shownIds, offer.id]));
        }
      }
    } catch (error) {
      console.error("Error fetching popup offer:", error);
    }
  };

  const copyPromoCode = async () => {
    if (popupOffer?.promo_code) {
      await navigator.clipboard.writeText(popupOffer.promo_code);
      setCopied(true);
      toast({
        title: language === 'mr' ? 'कोड कॉपी झाला!' : language === 'hi' ? 'कोड कॉपी हुआ!' : 'Code Copied!',
        description: popupOffer.promo_code,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!popupOffer) return null;

  const discountText = popupOffer.discount_type === 'percentage'
    ? `${popupOffer.discount_value}% OFF`
    : popupOffer.discount_value
    ? `₹${popupOffer.discount_value} OFF`
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {language === 'mr' ? 'विशेष ऑफर!' : language === 'hi' ? 'विशेष ऑफर!' : 'Special Offer!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {popupOffer.banner_image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={popupOffer.banner_image_url}
                alt={popupOffer.title}
                className="w-full h-40 object-cover"
              />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              {popupOffer.highlight_text && (
                <Badge className="bg-primary text-primary-foreground">
                  {popupOffer.highlight_text}
                </Badge>
              )}
              {discountText && (
                <Badge variant="secondary" className="bg-cctv-success/20 text-cctv-success">
                  {discountText}
                </Badge>
              )}
            </div>
            <h3 className="font-display text-lg font-bold">{popupOffer.title}</h3>
            {popupOffer.description && (
              <p className="text-sm text-muted-foreground mt-1">{popupOffer.description}</p>
            )}
          </div>

          {popupOffer.promo_code && (
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">
                {language === 'mr' ? 'प्रोमो कोड वापरा' : language === 'hi' ? 'प्रोमो कोड उपयोग करें' : 'Use Promo Code'}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background border border-border rounded px-2 py-1.5 font-mono font-bold text-primary">
                  {popupOffer.promo_code}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPromoCode}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          <Button onClick={() => setOpen(false)} className="w-full">
            {language === 'mr' ? 'समजले!' : language === 'hi' ? 'समझ गया!' : 'Got it!'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}