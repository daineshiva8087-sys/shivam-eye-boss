import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface BannerCardProps {
  title: string | null;
  imageUrl: string;
  badge?: string;
  description?: string;
  discount?: string;
  ctaText?: string;
  imageFitMode: string;
  onClick?: () => void;
  className?: string;
}

export function BannerCard({
  title,
  imageUrl,
  badge,
  description,
  discount,
  ctaText = "View Details",
  imageFitMode,
  onClick,
  className,
}: BannerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl cursor-pointer",
        "bg-gradient-to-r from-card via-card to-card/80",
        "border border-border/50 shadow-lg hover:shadow-xl",
        "transition-all duration-300 hover:scale-[1.01]",
        "group",
        className
      )}
    >
      {/* Main Container - Card Layout */}
      <div className="relative aspect-[21/9] md:aspect-[21/8] flex">
        {/* Left Content Section */}
        <div className="relative z-10 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 w-1/2 md:w-2/5">
          {/* Badge */}
          {badge && (
            <Badge 
              className="w-fit mb-2 md:mb-3 bg-primary/90 text-primary-foreground text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 shadow-md"
            >
              {badge}
            </Badge>
          )}

          {/* Title */}
          {title && (
            <h3 className="font-display text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold text-foreground leading-tight mb-1 sm:mb-2 line-clamp-2">
              {title}
            </h3>
          )}

          {/* Description */}
          {description && (
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2 md:mb-3 hidden sm:block">
              {description}
            </p>
          )}

          {/* Discount Highlight */}
          {discount && (
            <div className="mb-2 md:mb-4">
              <span className="text-xs sm:text-sm md:text-lg font-bold text-primary">
                {discount}
              </span>
            </div>
          )}

          {/* CTA Button */}
          <Button
            size="sm"
            className="w-fit mt-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md group-hover:shadow-lg transition-all text-[10px] sm:text-xs md:text-sm px-2 sm:px-4 py-1 sm:py-2 h-auto"
          >
            {ctaText}
            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Right Image Section */}
        <div className="absolute right-0 top-0 h-full w-3/5 md:w-2/3">
          {/* Gradient Overlay for text visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-card via-card/70 to-transparent z-10" />
          
          {/* Product Image */}
          <img
            src={imageUrl}
            alt={title || "Banner"}
            className={cn(
              "w-full h-full transition-transform duration-500 group-hover:scale-105",
              imageFitMode === "cover" && "object-cover",
              imageFitMode === "contain" && "object-contain",
              imageFitMode === "auto" && "object-cover"
            )}
            loading="eager"
          />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
