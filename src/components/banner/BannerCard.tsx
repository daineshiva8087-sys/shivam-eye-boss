import { cn } from "@/lib/utils";

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
  imageFitMode,
  onClick,
  className,
}: BannerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full overflow-hidden cursor-pointer",
        "rounded-xl md:rounded-2xl",
        "shadow-lg",
        "border border-white/[0.08]",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl",
        "group",
        className
      )}
    >
      {/* Full-width banner image container */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[21/7] md:aspect-[21/6] overflow-hidden">
        <img
          src={imageUrl}
          alt={title || "Banner"}
          className={cn(
            "w-full h-full",
            "transition-all duration-500 ease-out",
            "group-hover:scale-[1.02]",
            imageFitMode === "cover" && "object-cover object-center",
            imageFitMode === "contain" && "object-contain object-center",
            imageFitMode === "auto" && "object-cover object-center"
          )}
          loading="eager"
        />
      </div>
    </div>
  );
}