import { Product } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Camera } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onRequestQuote: (product: Product) => void;
}

export function ProductCard({ product, onRequestQuote }: ProductCardProps) {
  const stockStatus = product.stock_quantity > 10
    ? "In Stock"
    : product.stock_quantity > 0
    ? "Low Stock"
    : "Out of Stock";

  const stockClass = product.stock_quantity > 10
    ? "stock-available"
    : product.stock_quantity > 0
    ? "stock-low"
    : "stock-out";

  return (
    <div className="product-card rounded-xl overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-secondary/50 flex items-center justify-center overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <Camera className="h-16 w-16 text-muted-foreground" />
        )}
        {!product.is_available && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <span className="text-muted-foreground font-medium">Unavailable</span>
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm"
        >
          {product.category}
        </Badge>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2 mb-2">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-display text-xl font-bold text-primary">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className={`text-sm font-medium ${stockClass}`}>
              {stockStatus}
            </span>
          </div>

          <Button
            onClick={() => onRequestQuote(product)}
            disabled={!product.is_available}
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
