import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles, Flame, Star, Zap } from "lucide-react";

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

// Animated badge icons based on type
const getBadgeIcon = (badge: string) => {
  if (badge.includes("HOT") || badge.includes("🔥")) return Flame;
  if (badge.includes("SPECIAL") || badge.includes("✨")) return Sparkles;
  if (badge.includes("FEATURED") || badge.includes("🎯")) return Star;
  return Zap;
};

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
  const BadgeIcon = badge ? getBadgeIcon(badge) : Zap;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden cursor-pointer",
        // Premium glassmorphism card with 18px radius
        "rounded-[18px]",
        // Strong elevation shadow for depth
        "shadow-[0_12px_35px_rgba(0,0,0,0.55)]",
        // Glassmorphism border
        "border border-white/[0.12]",
        // Premium gradient background with blur effect
        "bg-gradient-to-br from-card/95 via-card/90 to-card/85",
        "backdrop-blur-sm",
        // Ring glow effect on hover (red/orange tone)
        "ring-1 ring-primary/10 hover:ring-primary/30",
        // Smooth transitions
        "transition-all duration-500 ease-out",
        // Scale effect on hover
        "hover:scale-[1.02] hover:-translate-y-1",
        "hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(220,38,38,0.15)]",
        "group",
        className
      )}
    >
      {/* Outer glow effect */}
      <div className={cn(
        "absolute -inset-[1px] rounded-[19px]",
        "bg-gradient-to-r from-primary/20 via-transparent to-primary/20",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-500",
        "pointer-events-none"
      )} />

      {/* Main Container - 21:9 aspect ratio */}
      <div className="relative aspect-[21/9] flex overflow-hidden rounded-[18px]">
        
        {/* Left Content Section - 40% width */}
        <div className="relative z-20 flex flex-col justify-center p-4 sm:p-6 md:p-8 lg:p-10 w-[45%] md:w-[40%]">
          
          {/* Background gradient for text readability */}
          <div className={cn(
            "absolute inset-0 -z-10",
            "bg-gradient-to-r from-card via-card/95 to-transparent"
          )} />
          
          {/* Animated Badge */}
          {badge && (
            <Badge 
              className={cn(
                "w-fit mb-2 md:mb-3",
                "bg-gradient-to-r from-primary via-primary to-primary/90",
                "text-primary-foreground",
                "text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wide",
                "px-2.5 py-1 sm:px-3 sm:py-1.5",
                "shadow-lg shadow-primary/40",
                "border-0",
                "animate-pulse",
                "flex items-center gap-1.5"
              )}
            >
              <BadgeIcon className="h-3 w-3 animate-bounce" />
              {badge.replace(/[🎯📦🔥🛠️💬🔗✨]/g, '').trim()}
            </Badge>
          )}

          {/* Bold Title */}
          {title && (
            <h3 className={cn(
              "font-display font-extrabold text-foreground leading-tight",
              "text-base sm:text-xl md:text-2xl lg:text-3xl",
              "mb-1.5 sm:mb-2",
              "line-clamp-2",
              "drop-shadow-md",
              "tracking-tight"
            )}>
              {title}
            </h3>
          )}

          {/* Punchline Description */}
          {description && (
            <p className={cn(
              "text-muted-foreground",
              "text-[10px] sm:text-xs md:text-sm",
              "line-clamp-2 mb-2 md:mb-4",
              "hidden sm:block",
              "font-medium"
            )}>
              {description}
            </p>
          )}

          {/* Discount Highlight */}
          {discount && (
            <div className="mb-2 md:mb-4">
              <span className={cn(
                "font-extrabold text-primary",
                "text-sm sm:text-base md:text-xl",
                "drop-shadow-lg animate-pulse"
              )}>
                {discount}
              </span>
            </div>
          )}

          {/* Premium CTA Button - Always Red */}
          <Button
            size="sm"
            className={cn(
              "w-fit mt-auto",
              // Red gradient background
              "bg-gradient-to-r from-primary to-red-600",
              "hover:from-red-600 hover:to-primary",
              "text-primary-foreground font-semibold",
              // Strong shadow and glow
              "shadow-lg shadow-primary/40",
              "hover:shadow-xl hover:shadow-primary/50",
              // Glow effect on hover
              "hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 hover:ring-offset-background",
              "transition-all duration-300",
              "text-[10px] sm:text-xs md:text-sm",
              "px-3 sm:px-5 py-1.5 sm:py-2.5 h-auto",
              "rounded-full"
            )}
          >
            {ctaText}
            <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Button>
        </div>

        {/* Right Image Section - 60% width */}
        <div className="absolute right-0 top-0 h-full w-[60%] md:w-[65%]">
          {/* Very light gradient overlay - max 25% opacity for text side only */}
          <div className={cn(
            "absolute inset-0 z-10",
            "bg-gradient-to-r from-card/25 via-transparent to-transparent"
          )} />
          
          {/* Product Image - Bright and Sharp */}
          <img
            src={imageUrl}
            alt={title || "Banner"}
            className={cn(
              "w-full h-full transition-all duration-700 ease-out",
              // Zoom effect on hover
              "group-hover:scale-[1.08]",
              // Enhanced brightness and contrast
              "brightness-105 contrast-105 saturate-110",
              "group-hover:brightness-110 group-hover:contrast-110",
              imageFitMode === "cover" && "object-cover object-center",
              imageFitMode === "contain" && "object-contain object-right",
              imageFitMode === "auto" && "object-cover object-center"
            )}
            loading="eager"
          />
          
          {/* Shine sweep effect on hover */}
          <div className={cn(
            "absolute inset-0 z-10",
            "bg-gradient-to-r from-transparent via-white/20 to-transparent",
            "translate-x-[-150%] group-hover:translate-x-[150%]",
            "transition-transform duration-1000 ease-out"
          )} />
        </div>
      </div>

      {/* Bottom accent line - Red glow */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1",
        "bg-gradient-to-r from-primary/60 via-primary to-primary/60",
        "opacity-60 group-hover:opacity-100",
        "transition-opacity duration-300",
        "shadow-[0_0_15px_rgba(220,38,38,0.5)]"
      )} />
      
      {/* Corner glow effects */}
      <div className={cn(
        "absolute -top-16 -right-16 w-32 h-32",
        "bg-primary/15 rounded-full blur-3xl",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-500"
      )} />
      <div className={cn(
        "absolute -bottom-16 -left-16 w-32 h-32",
        "bg-primary/10 rounded-full blur-3xl",
        "opacity-0 group-hover:opacity-100",
        "transition-opacity duration-500"
      )} />
    </div>
  );
}