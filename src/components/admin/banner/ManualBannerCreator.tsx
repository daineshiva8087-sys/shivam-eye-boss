import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Loader2, Upload, ImageIcon, Check, Info } from "lucide-react";

interface ManualBannerCreatorProps {
  products: { id: string; name: string }[];
  categories: string[];
  onBannerCreated: (bannerData: {
    title: string;
    image_url: string;
    click_action_type: string;
    click_action_value: string;
  }) => void;
  onCancel: () => void;
}

const CLICK_ACTION_OPTIONS = [
  { value: "none", label: "No Action" },
  { value: "product", label: "Open Product Detail" },
  { value: "category", label: "Open Category" },
  { value: "offers", label: "Open Offers Page" },
  { value: "services", label: "Open Services Page" },
  { value: "whatsapp", label: "Open WhatsApp" },
  { value: "external", label: "External Link" },
];

export function ManualBannerCreator({
  products,
  categories,
  onBannerCreated,
  onCancel,
}: ManualBannerCreatorProps) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [title, setTitle] = useState("");
  const [clickActionType, setClickActionType] = useState("none");
  const [clickActionValue, setClickActionValue] = useState("");
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

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
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
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `banners/manual-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCreateBanner = async () => {
    if (!imageFile) {
      toast({
        title: "No image",
        description: "Please upload a banner image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const imageUrl = await uploadImage();
      if (!imageUrl) throw new Error("Failed to upload image");

      onBannerCreated({
        title: title || "Manual Banner",
        image_url: imageUrl,
        click_action_type: clickActionType,
        click_action_value: clickActionValue,
      });

      toast({
        title: "✓ Banner Created!",
        description: "Your manual banner has been added",
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
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Manual Banner Upload</h3>
          <p className="text-sm text-muted-foreground">
            Upload your pre-designed banner image (displayed as-is)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Upload & Settings */}
        <div className="space-y-4">
          {/* Info Box */}
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">
                Recommended Size: 1080 × 420 px (21:9)
              </p>
              <p>
                Your banner will be displayed exactly as uploaded. Make sure it includes
                all text, graphics, and branding.
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium">
              Banner Image <span className="text-destructive">*</span>
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
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium mb-1">
                    Upload Pre-Designed Banner
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    JPG, PNG, or WEBP • Max 5MB
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

          {/* Title */}
          <div>
            <Label className="text-sm">Banner Title (for admin reference)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Diwali Sale Banner"
              className="mt-1"
            />
          </div>

          {/* Click Action */}
          <div>
            <Label className="text-sm">Click Action</Label>
            <Select value={clickActionType} onValueChange={setClickActionType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLICK_ACTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Value based on type */}
          {clickActionType === "product" && (
            <div>
              <Label className="text-sm">Select Product</Label>
              <Select value={clickActionValue} onValueChange={setClickActionValue}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {clickActionType === "category" && (
            <div>
              <Label className="text-sm">Select Category</Label>
              <Select value={clickActionValue} onValueChange={setClickActionValue}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {clickActionType === "external" && (
            <div>
              <Label className="text-sm">External URL</Label>
              <Input
                value={clickActionValue}
                onChange={(e) => setClickActionValue(e.target.value)}
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
          )}

          {clickActionType === "whatsapp" && (
            <div>
              <Label className="text-sm">WhatsApp Message (optional)</Label>
              <Input
                value={clickActionValue}
                onChange={(e) => setClickActionValue(e.target.value)}
                placeholder="Hi, I'm interested in..."
                className="mt-1"
              />
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Banner Preview</Label>
          <div className="aspect-[21/9] rounded-xl overflow-hidden border border-border bg-muted/50">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Banner Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Upload an image to see preview
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This is how your banner will appear on the Home Page
          </p>
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
          disabled={!imagePreview || uploading}
          className="bg-primary hover:bg-primary/90"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Create Banner
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
