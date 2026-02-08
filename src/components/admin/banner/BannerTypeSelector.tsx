import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Wand2, ImageIcon, ArrowRight, Sparkles } from "lucide-react";

interface BannerTypeSelectorProps {
  onSelectAI: () => void;
  onSelectManual: () => void;
  onCancel: () => void;
}

export function BannerTypeSelector({
  onSelectAI,
  onSelectManual,
  onCancel,
}: BannerTypeSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center pb-4">
        <h3 className="text-xl font-bold mb-2">Create New Banner</h3>
        <p className="text-sm text-muted-foreground">
          Choose how you want to create your banner
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Banner Option */}
        <button
          onClick={onSelectAI}
          className={cn(
            "relative p-6 rounded-2xl text-left transition-all duration-300",
            "bg-gradient-to-br from-primary/10 via-primary/5 to-transparent",
            "border-2 border-primary/30 hover:border-primary",
            "hover:shadow-lg hover:shadow-primary/20",
            "group"
          )}
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
                <Wand2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  AI Banner
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </h4>
                <p className="text-xs text-primary font-medium">RECOMMENDED</p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Upload just a product photo. AI will automatically:
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Detect brand & product type
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Generate catchy headline
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Choose matching colors & style
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Create professional design
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-primary/20">
              <p className="text-xs text-muted-foreground">
                <strong>Best for:</strong> Quick banners when you only have a
                product photo
              </p>
            </div>
          </div>
        </button>

        {/* Manual Banner Option */}
        <button
          onClick={onSelectManual}
          className={cn(
            "relative p-6 rounded-2xl text-left transition-all duration-300",
            "bg-muted/50",
            "border-2 border-border hover:border-foreground/30",
            "hover:shadow-lg",
            "group"
          )}
        >
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-muted-foreground/10 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">Manual Banner</h4>
                <p className="text-xs text-muted-foreground font-medium">
                  CUSTOM UPLOAD
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Upload your own pre-designed banner:
            </p>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Full design control
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Display exactly as uploaded
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                No AI modifications
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Set click action
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Best for:</strong> Professionally designed banners from
                your designer
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex justify-center pt-2">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
