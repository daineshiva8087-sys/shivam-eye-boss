import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Percent, Tag, Copy, Check } from "lucide-react";
import { useState } from "react";
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
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
}

interface OfferDetailModalProps {
  offer: Offer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfferDetailModal({ offer, open, onOpenChange }: OfferDetailModalProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const copyPromoCode = async () => {
    if (offer?.promo_code) {
      await navigator.clipboard.writeText(offer.promo_code);
      setCopied(true);
      toast({
        title: language === 'mr' ? 'कोड कॉपी झाला!' : language === 'hi' ? 'कोड कॉपी हुआ!' : 'Code Copied!',
        description: offer.promo_code,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!offer) return null;

  const discountText = offer.discount_type === 'percentage'
    ? `${offer.discount_value}% OFF`
    : offer.discount_value
    ? `₹${offer.discount_value} OFF`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {offer.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {offer.banner_image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={offer.banner_image_url}
                alt={offer.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {offer.highlight_text && (
              <Badge className="bg-primary text-primary-foreground">
                <Tag className="h-3 w-3 mr-1" />
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

          {offer.description && (
            <p className="text-muted-foreground">{offer.description}</p>
          )}

          {(offer.start_date || offer.end_date) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {offer.start_date && formatDate(offer.start_date)}
                {offer.start_date && offer.end_date && ' - '}
                {offer.end_date && formatDate(offer.end_date)}
              </span>
            </div>
          )}

          {(offer.start_time || offer.end_time) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {offer.start_time && formatTime(offer.start_time)}
                {offer.start_time && offer.end_time && ' - '}
                {offer.end_time && formatTime(offer.end_time)}
              </span>
            </div>
          )}

          {offer.promo_code && (
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">
                {language === 'mr' ? 'प्रोमो कोड' : language === 'hi' ? 'प्रोमो कोड' : 'Promo Code'}
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background border border-border rounded px-3 py-2 font-mono text-lg font-bold text-primary">
                  {offer.promo_code}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyPromoCode}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-cctv-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}