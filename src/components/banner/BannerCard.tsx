import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

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
        "relative w-full overflow-hidden cursor-pointer",
        // Premium card styling - rounded corners and shadow
        "rounded-xl md:rounded-2xl",
        "shadow-lg hover:shadow-2xl",
        // Premium gradient background
        "bg-gradient-to-br from-card via-card to-card/90",
        // Border with subtle glow effect
        "border border-border/40",
        "ring-1 ring-primary/5 hover:ring-primary/20",
        // Smooth transitions
        "transition-all duration-500 ease-out",
        "hover:scale-[1.01] hover:-translate-y-0.5",
        "group",
        className
      )}
    >
      {/* Main Container - 21:9 aspect ratio */}
      <div className="relative aspect-[21/9] flex overflow-hidden">
        
        {/* Left Content Section - Text Area */}
        <div className="relative z-20 flex flex-col justify-center p-3 sm:p-5 md:p-8 lg:p-10 w-[55%] md:w-[45%]">
          
          {/* Animated sparkle accent */}
          <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
          
          {/* Badge */}
          {badge && (
            <Badge 
              className={cn(
                "w-fit mb-2 md:mb-3",
                "bg-gradient-to-r from-primary to-primary/80",
                "text-primary-foreground",
                "text-[9px] sm:text-[10px] md:text-xs font-bold",
                "px-2 py-0.5 sm:px-3 sm:py-1",
                "shadow-md shadow-primary/20",
                "border-0"
              )}
            >
              {badge}
            </Badge>
          )}

          {/* Title */}
          {title && (
            <h3 className={cn(
              "font-display font-bold text-foreground leading-tight",
              "text-sm sm:text-lg md:text-2xl lg:text-3xl",
              "mb-1 sm:mb-2",
              "line-clamp-2",
              "drop-shadow-sm"
            )}>
              {title}
            </h3>
          )}

          {/* Description - Hidden on small mobile */}
          {description && (
            <p className={cn(
              "text-muted-foreground",
              "text-[10px] sm:text-xs md:text-sm",
              "line-clamp-2 mb-2 md:mb-3",
              "hidden sm:block"
            )}>
              {description}
            </p>
          )}

          {/* Discount Highlight */}
          {discount && (
            <div className="mb-2 md:mb-4">
              <span className={cn(
                "font-bold text-primary",
                "text-xs sm:text-sm md:text-lg",
                "drop-shadow-sm"
              )}>
                {discount}
              </span>
            </div>
          )}

          {/* CTA Button - Premium Style */}
          <Button
            size="sm"
            className={cn(
              "w-fit mt-auto",
              "bg-gradient-to-r from-primary to-primary/90",
              "hover:from-primary/90 hover:to-primary",
              "text-primary-foreground",
              "shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30",
              "transition-all duration-300",
              "text-[9px] sm:text-xs md:text-sm",
              "px-2 sm:px-4 py-1 sm:py-2 h-auto",
              "rounded-full md:rounded-lg"
            )}
          >
            {ctaText}
            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Right Image Section */}
        <div className="absolute right-0 top-0 h-full w-[60%] md:w-[65%]">
          {/* Multi-layer gradient overlay for premium text visibility */}
          <div className={cn(
            "absolute inset-0 z-10",
            "bg-gradient-to-r from-card via-card/80 to-transparent"
          )} />
          <div className={cn(
            "absolute inset-0 z-10",
            "bg-gradient-to-t from-card/30 via-transparent to-card/20"
          )} />
          
          {/* Product Image with premium hover effect */}
          <img
            src={imageUrl}
            alt={title || "Banner"}
            className={cn(
              "w-full h-full transition-transform duration-700 ease-out",
              "group-hover:scale-110",
              imageFitMode === "cover" && "object-cover",
              imageFitMode === "contain" && "object-contain object-right",
              imageFitMode === "auto" && "object-cover object-center"
            )}
            loading="eager"
          />
          
          {/* Subtle shine effect on hover */}
          <div className={cn(
            "absolute inset-0 z-10",
            "bg-gradient-to-r from-transparent via-white/5 to-transparent",
            "translate-x-[-100%] group-hover:translate-x-[100%]",
            "transition-transform duration-1000 ease-out"
          )} />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1",
        "bg-gradient-to-r from-primary/50 via-primary to-primary/50",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-300"
      )} />
      
      {/* Corner glow effect */}
      <div className={cn(
        "absolute -top-20 -right-20 w-40 h-40",
        "bg-primary/10 rounded-full blur-3xl",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-500"
      )} />
    </div>
  );
}
