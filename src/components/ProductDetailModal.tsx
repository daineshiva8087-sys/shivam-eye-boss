import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product, BUSINESS_INFO } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImageGallery } from "./ProductImageGallery";
import { Phone, MessageCircle, Tag } from "lucide-react";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestQuote: () => void;
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onRequestQuote,
}: ProductDetailModalProps) {
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product && open) {
      fetchProductImages();
    } else {
      setAdditionalImages([]);
    }
  }, [product, open]);

  const fetchProductImages = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", product.id)
        .order("display_order", { ascending: true });

      if (data) {
        setAdditionalImages(data.map((img) => img.image_url));
      }
    } catch (error) {
      console.error("Error fetching product images:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  // Combine main image with additional images
  const allImages = [
    ...(product.image_url ? [product.image_url] : []),
    ...additionalImages,
  ];

  const hasDiscount = product.discount_percentage > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount_percentage / 100)
    : product.price;

  const handleCall = () => {
    window.location.href = `tel:${BUSINESS_INFO.phone}`;
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi, I'm interested in ${product.name}. Please share more details.`
    );
    window.open(
      `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Image Gallery */}
          <div>
            {loading ? (
              <div className="aspect-square bg-secondary rounded-lg animate-pulse" />
            ) : (
              <ProductImageGallery
                images={allImages}
                productName={product.name}
              />
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>

              {hasDiscount && (
                <Badge variant="destructive" className="ml-2">
                  <Tag className="h-3 w-3 mr-1" />
                  {product.discount_percentage}% OFF
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              {hasDiscount && (
                <p className="text-muted-foreground line-through">
                  ₹{product.price.toLocaleString("en-IN")}
                </p>
              )}
              <p className="text-3xl font-bold text-primary">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </p>
            </div>

            {product.description && (
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {product.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <span
                className={`font-medium ${
                  product.is_available ? "text-cctv-success" : "text-destructive"
                }`}
              >
                {product.is_available ? "✓ In Stock" : "✗ Out of Stock"}
              </span>
              {product.stock_quantity > 0 && (
                <span className="text-muted-foreground">
                  ({product.stock_quantity} units)
                </span>
              )}
            </div>

            <div className="pt-4 space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={onRequestQuote}
              >
                Request Quotation
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleCall}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button
                  variant="outline"
                  className="text-cctv-success hover:text-cctv-success"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
