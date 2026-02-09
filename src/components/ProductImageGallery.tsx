import { useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [zoomed, setZoomed] = useState(false);

  const allImages = images.length > 0 ? images : [];

  // Sync carousel with current index
  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }, [api]);

  // Setup carousel listeners
  useState(() => {
    if (!api) return;
    api.on("select", onSelect);
    onSelect();
  });

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-secondary flex items-center justify-center">
        <Camera className="h-16 w-16 text-muted-foreground" />
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    api?.scrollTo(index);
  };

  const handleImageTap = (index: number) => {
    setCurrentIndex(index);
    setFullscreenOpen(true);
  };

  const toggleZoom = () => {
    setZoomed(!zoomed);
  };

  return (
    <>
      <div className="space-y-2">
        {/* Main Swipeable Carousel */}
        <Carousel 
          setApi={setApi}
          opts={{ loop: true }}
          className="w-full"
        >
          <CarouselContent>
            {allImages.map((img, index) => (
              <CarouselItem key={index}>
                <div
                  className="relative aspect-square bg-secondary cursor-pointer overflow-hidden group"
                  onClick={() => handleImageTap(index)}
                >
                  <img
                    src={img}
                    alt={`${productName} - Image ${index + 1}`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Zoom indicator */}
                  <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn className="h-4 w-4 text-foreground" />
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {allImages.length > 1 && (
            <>
              <CarouselPrevious className="left-2 h-9 w-9 bg-background/80 backdrop-blur-sm" />
              <CarouselNext className="right-2 h-9 w-9 bg-background/80 backdrop-blur-sm" />
            </>
          )}
        </Carousel>

        {/* Dot Indicators */}
        {allImages.length > 1 && (
          <div className="flex justify-center gap-1.5 py-2">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  currentIndex === index
                    ? "w-6 h-2 bg-primary"
                    : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Thumbnail strip for desktop */}
        {allImages.length > 1 && (
          <div className="hidden md:flex gap-2 overflow-x-auto pb-2 px-1">
            {allImages.map((img, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  currentIndex === index
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Zoom Viewer */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black border-none rounded-none">
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={toggleZoom}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 h-10 w-10"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenOpen(false);
              }}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 md:left-4 z-10 text-white hover:bg-white/20 h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 md:right-4 z-10 text-white hover:bg-white/20 h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Zoomable Image */}
            <div 
              className={cn(
                "w-full h-full flex items-center justify-center overflow-auto",
                zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              )}
            >
              <img
                src={allImages[currentIndex]}
                alt={`${productName} - Fullscreen`}
                className={cn(
                  "transition-transform duration-300",
                  zoomed 
                    ? "max-w-none w-[200%] h-auto" 
                    : "max-w-full max-h-full object-contain"
                )}
              />
            </div>

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} / {allImages.length}
              </div>
            )}

            {/* Zoom Hint */}
            <div className="absolute bottom-4 right-4 text-white/70 text-xs bg-black/40 px-3 py-1.5 rounded-full">
              Tap to {zoomed ? "zoom out" : "zoom in"}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
