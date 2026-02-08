import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Upload,
  Sparkles,
  Wand2,
  Check,
  ImageIcon,
  RefreshCw,
} from "lucide-react";

interface ProductAnalysis {
  brand: string;
  productType: string;
  modelCategory: string;
  features: string[];
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedBadge: string;
  suggestedBackground: {
    type: "gradient" | "solid";
    colors: string[];
  };
  suggestedTextColor: string;
  price: number | null;
  discountPercent: number | null;
  formattedPrice: string | null;
  discountedPrice: string | null;
  offerText: string | null;
}

interface AIBannerCreatorProps {
  onBannerCreated: (bannerData: {
    title: string;
    image_url: string;
    is_ai_generated: boolean;
    ai_analysis: ProductAnalysis | null;
  }) => void;
  onCancel: () => void;
}

export function AIBannerCreator({ onBannerCreated, onCancel }: AIBannerCreatorProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [offerText, setOfferText] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [editableTitle, setEditableTitle] = useState("");
  const [editableDescription, setEditableDescription] = useState("");
  const [editableBadge, setEditableBadge] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload JPG, PNG, or WEBP images only",
          variant: "destructive",
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Reset analysis when new image is selected
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!imagePreview) {
      toast({
        title: "No image",
        description: "Please upload a product image first",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const response = await supabase.functions.invoke("analyze-product-image", {
        body: {
          imageBase64: imagePreview,
          price: price ? parseFloat(price) : undefined,
          discountPercent: discountPercent ? parseFloat(discountPercent) : undefined,
          offerText: offerText || undefined,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (!response.data?.success) {
        throw new Error(response.data?.error || "Analysis failed");
      }

      const analysisResult = response.data.analysis as ProductAnalysis;
      setAnalysis(analysisResult);
      setEditableTitle(analysisResult.suggestedTitle);
      setEditableDescription(analysisResult.suggestedDescription);
      setEditableBadge(analysisResult.suggestedBadge);

      toast({
        title: "✨ Analysis Complete!",
        description: `Detected: ${analysisResult.brand} ${analysisResult.productType}`,
      });
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze image",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `banners/ai-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCreateBanner = async () => {
    if (!imageFile || !analysis) {
      toast({
        title: "Missing data",
        description: "Please upload an image and analyze it first",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) throw new Error("Failed to upload image");

      // Update analysis with editable fields
      const finalAnalysis: ProductAnalysis = {
        ...analysis,
        suggestedTitle: editableTitle,
        suggestedDescription: editableDescription,
        suggestedBadge: editableBadge,
      };

      onBannerCreated({
        title: editableTitle,
        image_url: imageUrl,
        is_ai_generated: true,
        ai_analysis: finalAnalysis,
      });

      toast({
        title: "🎉 AI Banner Created!",
        description: "Your banner is ready to use",
      });
    } catch (error: any) {
      console.error("Create banner error:", error);
      toast({
        title: "Failed to create banner",
        description: error.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">AI Banner Creator</h3>
          <p className="text-sm text-muted-foreground">
            Upload a product image and AI will design the banner
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Input Section */}
        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium">
              Product Image <span className="text-destructive">*</span>
            </Label>
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-xl p-6 text-center transition-colors",
                imagePreview
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              {imagePreview ? (
                <div className="space-y-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-40 mx-auto rounded-lg object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setAnalysis(null);
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">Upload Product Photo</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    JPG, PNG, or WEBP • Clear product shot works best
                  </p>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="max-w-xs mx-auto"
                  />
                </>
              )}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="p-4 bg-muted/30 rounded-xl space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Optional Information (helps AI create better content)
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Price (₹)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs">Discount %</Label>
                <Input
                  type="number"
                  placeholder="e.g., 20"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Offer Text (optional)</Label>
              <Input
                placeholder="e.g., Diwali Special, Summer Sale"
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <Button
            type="button"
            onClick={analyzeImage}
            disabled={!imagePreview || analyzing}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing with AI...
              </>
            ) : analysis ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-analyze Image
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analyze & Generate Banner
              </>
            )}
          </Button>
        </div>

        {/* Right: Preview & Results */}
        <div className="space-y-4">
          {analysis ? (
            <>
              {/* AI Detection Results */}
              <div className="p-4 bg-cctv-success/10 border border-cctv-success/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-4 w-4 text-cctv-success" />
                  <span className="font-semibold text-cctv-success text-sm">
                    AI Detection Complete
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Brand:</span>{" "}
                    <span className="font-medium">{analysis.brand}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium">{analysis.productType}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Category:</span>{" "}
                    <span className="font-medium">{analysis.modelCategory}</span>
                  </div>
                </div>
                {analysis.features.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {analysis.features.map((feature, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 bg-background rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Editable Banner Content */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Banner Title (editable)</Label>
                  <Input
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    placeholder="Banner headline"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description (editable)</Label>
                  <Input
                    value={editableDescription}
                    onChange={(e) => setEditableDescription(e.target.value)}
                    placeholder="Short description"
                  />
                </div>
                <div>
                  <Label className="text-xs">Badge Text (editable)</Label>
                  <Input
                    value={editableBadge}
                    onChange={(e) => setEditableBadge(e.target.value)}
                    placeholder="e.g., HOT DEAL"
                  />
                </div>
              </div>

              {/* Preview Card */}
              <div
                className="relative rounded-xl overflow-hidden aspect-[21/9] p-4"
                style={{
                  background:
                    analysis.suggestedBackground.type === "gradient"
                      ? `linear-gradient(135deg, ${analysis.suggestedBackground.colors.join(", ")})`
                      : analysis.suggestedBackground.colors[0],
                }}
              >
                <div className="flex h-full">
                  <div className="w-[40%] flex flex-col justify-center pr-4">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded w-fit mb-2"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: analysis.suggestedTextColor,
                      }}
                    >
                      {editableBadge}
                    </span>
                    <h3
                      className="font-bold text-lg leading-tight mb-1"
                      style={{ color: analysis.suggestedTextColor }}
                    >
                      {editableTitle}
                    </h3>
                    <p
                      className="text-xs opacity-80"
                      style={{ color: analysis.suggestedTextColor }}
                    >
                      {editableDescription}
                    </p>
                    {analysis.discountedPrice && (
                      <div className="mt-2">
                        <span
                          className="line-through text-xs opacity-60"
                          style={{ color: analysis.suggestedTextColor }}
                        >
                          {analysis.formattedPrice}
                        </span>{" "}
                        <span
                          className="font-bold text-sm"
                          style={{ color: analysis.suggestedTextColor }}
                        >
                          {analysis.discountedPrice}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-[60%] flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Product"
                      className="max-h-full max-w-full object-contain drop-shadow-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Suggested Colors */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>AI suggested colors:</span>
                <div className="flex gap-1">
                  {analysis.suggestedBackground.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded border border-border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl p-8 bg-muted/20">
              <div className="text-center">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">
                  Upload a product image and click "Analyze" to see the AI-generated
                  banner preview
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleCreateBanner}
          disabled={!analysis || uploading}
          className="bg-primary hover:bg-primary/90"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Create AI Banner
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
