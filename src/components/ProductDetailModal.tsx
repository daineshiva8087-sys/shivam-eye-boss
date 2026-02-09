import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Product, BUSINESS_INFO } from "@/lib/supabase";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImageGallery } from "./ProductImageGallery";
import { 
  Phone, 
  MessageCircle, 
  Tag, 
  Shield, 
  Eye, 
  Cpu, 
  Sun, 
  Moon, 
  Home, 
  Building2,
  Package,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Award,
  Wrench,
  FileText
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestQuote: () => void;
}

// Extract key highlights from product data
function extractHighlights(product: Product) {
  const highlights: { icon: React.ElementType; label: string; value: string }[] = [];
  const name = product.name.toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const category = product.category.toLowerCase();

  // Resolution detection
  const resMatch = name.match(/(\d+)\s*mp/i) || desc.match(/(\d+)\s*mp/i);
  if (resMatch) {
    highlights.push({ icon: Eye, label: "Resolution", value: `${resMatch[1]} MP` });
  }

  // Night Vision detection
  if (desc.includes("night vision") || desc.includes("ir") || name.includes("night")) {
    highlights.push({ icon: Moon, label: "Night Vision", value: "Yes" });
  }

  // Brand detection
  const brands = ["cp plus", "hikvision", "dahua", "godrej", "realme", "mi"];
  for (const brand of brands) {
    if (name.includes(brand)) {
      highlights.push({ icon: Award, label: "Brand", value: brand.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") });
      break;
    }
  }

  // Indoor/Outdoor detection
  if (category.includes("dome") || desc.includes("indoor")) {
    highlights.push({ icon: Home, label: "Usage", value: "Indoor" });
  } else if (category.includes("bullet") || desc.includes("outdoor") || desc.includes("weatherproof")) {
    highlights.push({ icon: Building2, label: "Usage", value: "Outdoor" });
  }

  // WiFi/Connectivity
  if (name.includes("wifi") || category.includes("wifi") || desc.includes("wireless")) {
    highlights.push({ icon: Cpu, label: "Connectivity", value: "WiFi" });
  }

  // Solar
  if (name.includes("solar") || category.includes("solar")) {
    highlights.push({ icon: Sun, label: "Power", value: "Solar" });
  }

  // Default highlights if none found
  if (highlights.length === 0) {
    highlights.push({ icon: Shield, label: "Type", value: product.category });
  }

  return highlights.slice(0, 4); // Max 4 highlights
}

export function ProductDetailModal({
  product,
  open,
  onOpenChange,
  onRequestQuote,
}: ProductDetailModalProps) {
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (product && open) {
      fetchProductImages();
      setDescriptionExpanded(false);
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

  const handleCall = useCallback(() => {
    window.location.href = `tel:${BUSINESS_INFO.phone}`;
  }, []);

  const handleWhatsApp = useCallback(() => {
    if (!product) return;
    const message = encodeURIComponent(
      `नमस्कार,\nमला "${product.name}" बद्दल माहिती हवी आहे.\nकृपया किंमत आणि तपशील सांगा.`
    );
    window.open(
      `https://wa.me/${BUSINESS_INFO.whatsappNumber}?text=${message}`,
      "_blank"
    );
  }, [product]);

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

  const highlights = extractHighlights(product);
  const description = product.description || "";
  const shouldTruncate = description.length > 150;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-hidden p-0 gap-0">
        {/* Scrollable Content Area */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] pb-24">
          {/* Image Gallery Section */}
          <div className="relative">
            {loading ? (
              <div className="aspect-square bg-secondary animate-pulse" />
            ) : (
              <ProductImageGallery
                images={allImages}
                productName={product.name}
              />
            )}
            
            {/* Discount Badge Overlay */}
            {hasDiscount && (
              <Badge 
                className="absolute top-4 left-4 bg-destructive text-destructive-foreground font-bold text-sm px-3 py-1.5 shadow-lg"
              >
                <Tag className="h-4 w-4 mr-1.5" />
                {product.discount_percentage}% OFF
              </Badge>
            )}
          </div>

          {/* Product Info Section */}
          <div className="p-4 space-y-4">
            {/* Category Badge */}
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
              {product.category}
            </Badge>

            {/* Product Name */}
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight">
              {product.name}
            </h2>

            {/* Price Section */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                ₹{discountedPrice.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ₹{product.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-medium text-cctv-success">
                    Save ₹{(product.price - discountedPrice).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className={cn(
              "inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full",
              product.is_available 
                ? "bg-cctv-success/10 text-cctv-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {product.is_available ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  In Stock
                  {product.stock_quantity > 0 && (
                    <span className="text-muted-foreground">
                      ({product.stock_quantity} units)
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span>✗</span> Out of Stock
                </>
              )}
            </div>

            {/* Key Highlights */}
            {highlights.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  Key Highlights
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {highlights.map((highlight, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 border border-border"
                    >
                      <highlight.icon className="h-4 w-4 text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">{highlight.label}</p>
                        <p className="text-sm font-medium text-foreground truncate">{highlight.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expandable Description */}
            {description && (
              <Collapsible open={descriptionExpanded} onOpenChange={setDescriptionExpanded}>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Description
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {shouldTruncate && !descriptionExpanded
                      ? `${description.slice(0, 150)}...`
                      : description}
                  </p>
                  {shouldTruncate && (
                    <CollapsibleTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                      >
                        {descriptionExpanded ? (
                          <>Show Less <ChevronUp className="h-4 w-4 ml-1" /></>
                        ) : (
                          <>Read More <ChevronDown className="h-4 w-4 ml-1" /></>
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </div>
              </Collapsible>
            )}

            {/* What's in the Box */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                What's in the Box
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-cctv-success" />
                  1x {product.name}
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-cctv-success" />
                  Power Adapter / Cable
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-cctv-success" />
                  Mounting Kit
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-cctv-success" />
                  User Manual
                </li>
              </ul>
            </div>

            {/* Trust Section */}
            <div className="space-y-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Why Choose Shivam CCTV?
              </h3>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Serving Jalna Since 2016</p>
                    <p className="text-xs text-muted-foreground">8+ years of trusted service</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Wrench className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Installation Support Available</p>
                    <p className="text-xs text-muted-foreground">Professional setup by experts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">100% Genuine Products</p>
                    <p className="text-xs text-muted-foreground">Authentic branded equipment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCall}
              className="flex-1 h-11"
            >
              <Phone className="h-4 w-4 mr-1.5" />
              Call
            </Button>
            <Button
              size="sm"
              onClick={handleWhatsApp}
              className="flex-1 h-11 bg-[#25D366] hover:bg-[#20BD5A] text-white"
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              WhatsApp
            </Button>
            <Button
              size="sm"
              onClick={onRequestQuote}
              className="flex-1 h-11 bg-primary hover:bg-primary/90"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Quote
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
