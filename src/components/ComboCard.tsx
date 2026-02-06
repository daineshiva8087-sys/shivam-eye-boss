import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Gift, ShoppingCart } from "lucide-react";

interface ComboProduct {
  id: string;
  product_id: string;
  quantity: number;
  products?: {
    name: string;
    image_url: string | null;
  };
}

export interface ComboOffer {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  original_price: number;
  combo_price: number;
  discount_percentage: number;
  is_active: boolean;
  combo_products?: ComboProduct[];
}

interface ComboCardProps {
  combo: ComboOffer;
  onRequestQuote: (combo: ComboOffer) => void;
}

export function ComboCard({ combo, onRequestQuote }: ComboCardProps) {
  const savings = combo.original_price - combo.combo_price;

  return (
    <div className="product-card rounded-xl overflow-hidden flex flex-col border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="relative aspect-video bg-secondary/50 flex items-center justify-center overflow-hidden">
        {combo.image_url ? (
          <img
            src={combo.image_url}
            alt={combo.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex items-center gap-2">
            <Package className="h-12 w-12 text-muted-foreground" />
            <Gift className="h-8 w-8 text-primary" />
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground font-bold">
          {Math.round(combo.discount_percentage)}% OFF
        </Badge>
        <Badge
          variant="secondary"
          className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
        >
          Combo Deal
        </Badge>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2 mb-2">
          {combo.name}
        </h3>

        {combo.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {combo.description}
          </p>
        )}

        {combo.combo_products && combo.combo_products.length > 0 && (
          <div className="text-xs text-muted-foreground mb-3">
            <span className="font-medium">Includes:</span>{" "}
            {combo.combo_products.map((cp, idx) => (
              <span key={cp.id}>
                {cp.quantity > 1 && `${cp.quantity}x `}
                {cp.products?.name || "Product"}
                {idx < combo.combo_products!.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-primary">
                ₹{combo.combo_price.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{combo.original_price.toLocaleString("en-IN")}
              </span>
            </div>
            <span className="text-xs text-cctv-success font-medium">
              Save ₹{savings.toLocaleString("en-IN")}
            </span>
          </div>

          <Button
            onClick={() => onRequestQuote(combo)}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Request Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
