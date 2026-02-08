import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  Image,
  ArrowUp,
  ArrowDown,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  Power,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getISTTimeString12,
  getISTDateString,
  formatISTDate,
  formatTime12Hour,
  getBannerStatus,
} from "@/lib/timezone";
import { BannerTypeSelector } from "./banner/BannerTypeSelector";
import { AIBannerCreator } from "./banner/AIBannerCreator";
import { ManualBannerCreator } from "./banner/ManualBannerCreator";

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  click_action_type: string;
  click_action_value: string | null;
  image_fit_mode: string;
  auto_slide_interval: number;
  created_at: string;
}

interface BannerFormData {
  title: string;
  image_url: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  click_action_type: string;
  click_action_value: string;
  image_fit_mode: string;
  auto_slide_interval: string;
}

const defaultFormData: BannerFormData = {
  title: "",
  image_url: "",
  is_active: false,
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  click_action_type: "none",
  click_action_value: "",
  image_fit_mode: "auto",
  auto_slide_interval: "5",
};

const CLICK_ACTION_OPTIONS = [
  { value: "none", label: "No Action" },
  { value: "product", label: "Open Product Detail" },
  { value: "category", label: "Open Category" },
  { value: "offers", label: "Open Offers Page" },
  { value: "services", label: "Open Services Page" },
  { value: "whatsapp", label: "Open WhatsApp" },
  { value: "external", label: "External Link" },
];

const IMAGE_FIT_OPTIONS = [
  { value: "auto", label: "Auto Fit (default)" },
  { value: "cover", label: "Cover (crop allowed)" },
  { value: "contain", label: "Contain (no crop)" },
];

type ModalMode = "closed" | "type-select" | "ai-create" | "manual-create" | "edit";

export function BannerManagement() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>("closed");
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(getISTTimeString12());
  const [currentDate, setCurrentDate] = useState(getISTDateString());

  // Update current time every second for live display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getISTTimeString12());
      setCurrentDate(getISTDateString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bannersRes, productsRes] = await Promise.all([
        supabase.from("banners").select("*").order("display_order", { ascending: true }),
        supabase.from("products").select("id, name, category"),
      ]);

      if (bannersRes.data) setBanners(bannersRes.data);
      if (productsRes.data) {
        setProducts(productsRes.data);
        const uniqueCategories = [...new Set(productsRes.data.map(p => p.category))];
        setCategories(uniqueCategories.sort());
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
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
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `banners/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("product-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Handler for AI Banner creation
  const handleAIBannerCreated = async (bannerData: {
    title: string;
    image_url: string;
    is_ai_generated: boolean;
    ai_analysis: any;
  }) => {
    try {
      const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order)) : 0;
      const { error } = await supabase.from("banners").insert({
        title: bannerData.title,
        image_url: bannerData.image_url,
        is_active: false, // Start as OFF
        display_order: maxOrder + 1,
        click_action_type: "product",
        image_fit_mode: "contain", // AI banners use contain to show full product
      });

      if (error) throw error;
      
      setModalMode("closed");
      fetchData();
    } catch (error: any) {
      console.error("Error creating AI banner:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create banner",
        variant: "destructive",
      });
    }
  };

  // Handler for Manual Banner creation
  const handleManualBannerCreated = async (bannerData: {
    title: string;
    image_url: string;
    click_action_type: string;
    click_action_value: string;
  }) => {
    try {
      const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order)) : 0;
      const { error } = await supabase.from("banners").insert({
        title: bannerData.title,
        image_url: bannerData.image_url,
        is_active: false, // Start as OFF
        display_order: maxOrder + 1,
        click_action_type: bannerData.click_action_type,
        click_action_value: bannerData.click_action_value || null,
        image_fit_mode: "cover", // Manual banners use cover to fill space
      });

      if (error) throw error;
      
      setModalMode("closed");
      fetchData();
    } catch (error: any) {
      console.error("Error creating manual banner:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create banner",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadImage(imageFile) || "";
        setUploadingImage(false);
      }

      if (!imageUrl) {
        throw new Error("Banner image is required");
      }

      const bannerData = {
        title: formData.title || null,
        image_url: imageUrl,
        is_active: formData.is_active,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        click_action_type: formData.click_action_type,
        click_action_value: formData.click_action_value || null,
        image_fit_mode: formData.image_fit_mode,
        auto_slide_interval: parseInt(formData.auto_slide_interval) || 5,
      };

      if (editingBanner) {
        const { error } = await supabase
          .from("banners")
          .update(bannerData)
          .eq("id", editingBanner.id);

        if (error) throw error;
        toast({ title: "Banner updated successfully!" });
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error saving banner:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save banner",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setModalMode("closed");
    setFormData(defaultFormData);
    setEditingBanner(null);
    setImageFile(null);
    setImagePreview("");
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      image_url: banner.image_url,
      is_active: banner.is_active,
      start_date: banner.start_date || "",
      end_date: banner.end_date || "",
      start_time: banner.start_time?.slice(0, 5) || "",
      end_time: banner.end_time?.slice(0, 5) || "",
      click_action_type: banner.click_action_type,
      click_action_value: banner.click_action_value || "",
      image_fit_mode: banner.image_fit_mode,
      auto_slide_interval: banner.auto_slide_interval.toString(),
    });
    setImagePreview(banner.image_url);
    setModalMode("edit");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Banner deleted successfully!" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete banner",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const newStatus = !banner.is_active;
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: newStatus })
        .eq("id", banner.id);

      if (error) throw error;
      
      toast({
        title: newStatus ? "✓ Banner is now ON" : "Banner is now OFF",
        description: newStatus 
          ? "Banner will be visible on Home Page (if within schedule)" 
          : "Banner is hidden from Home Page",
      });
      
      fetchData();
    } catch (error: any) {
      console.error("Error toggling banner:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update banner status",
        variant: "destructive",
      });
    }
  };

  const getBannerVisibilityStatus = (banner: Banner): { 
    visible: boolean; 
    reason: string; 
    type: 'success' | 'warning' | 'error';
    countdown?: string;
  } => {
    const status = getBannerStatus(
      banner.is_active,
      banner.start_date,
      banner.end_date,
      banner.start_time,
      banner.end_time
    );

    if (status.status === 'off') {
      return { visible: false, reason: status.message, type: 'error' };
    }
    if (status.status === 'expired') {
      return { visible: false, reason: status.message, type: 'error' };
    }
    if (status.status === 'scheduled' || status.status === 'upcoming') {
      return { 
        visible: false, 
        reason: status.message, 
        type: 'warning',
        countdown: status.status === 'upcoming' ? `${status.minutesUntil}m` : undefined
      };
    }
    return { 
      visible: true, 
      reason: status.message + (status.endTime ? ` (until ${status.endTime})` : ''), 
      type: 'success' 
    };
  };

  const handleMoveOrder = async (banner: Banner, direction: "up" | "down") => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (swapIndex < 0 || swapIndex >= banners.length) return;

    const swapBanner = banners[swapIndex];

    try {
      await Promise.all([
        supabase.from("banners").update({ display_order: swapBanner.display_order }).eq("id", banner.id),
        supabase.from("banners").update({ display_order: banner.display_order }).eq("id", swapBanner.id),
      ]);
      fetchData();
    } catch (error) {
      console.error("Error reordering banners:", error);
    }
  };

  const getClickActionLabel = (type: string, value: string | null) => {
    if (type === "none") return "No action";
    if (type === "product" && value) {
      const product = products.find(p => p.id === value);
      return product ? `→ ${product.name}` : "Product";
    }
    if (type === "category" && value) return `→ ${value}`;
    if (type === "external" && value) return `→ Link`;
    const option = CLICK_ACTION_OPTIONS.find(o => o.value === type);
    return option?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold">Banner Slider</h2>
          <p className="text-sm text-muted-foreground">
            Manage homepage banners with AI-powered or custom designs
          </p>
        </div>
        <Button 
          onClick={() => setModalMode("type-select")} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Banner
        </Button>
      </div>

      {/* Live IST Time Indicator */}
      <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary animate-pulse" />
              <div>
                <span className="text-2xl font-bold font-mono text-foreground">{currentTime}</span>
                <span className="ml-2 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">IST</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border hidden md:block" />
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">{formatISTDate(currentDate)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">Jalna, Maharashtra</span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">AI Banner</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Upload product photo, AI creates the design automatically
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-muted/50 border border-border rounded-xl">
          <div className="flex items-start gap-3">
            <Image className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Manual Banner</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Upload pre-designed banner, displays exactly as-is
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-muted/50 border border-border rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Recommended Size</h4>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>1080 × 420 px</strong> (21:9 ratio)
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : banners.length > 0 ? (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-12">Order</TableHead>
                <TableHead className="w-36">Preview</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, index) => {
                const status = getBannerVisibilityStatus(banner);
                return (
                  <TableRow key={banner.id} className="group">
                    {/* Order Controls */}
                    <TableCell>
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveOrder(banner, "up")}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium">{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveOrder(banner, "down")}
                          disabled={index === banners.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    
                    {/* Image Preview */}
                    <TableCell>
                      <img
                        src={banner.image_url}
                        alt={banner.title || "Banner"}
                        className="w-32 h-14 object-cover rounded-lg border border-border"
                      />
                    </TableCell>
                    
                    {/* Details */}
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">
                          {banner.title || <span className="text-muted-foreground italic">No title</span>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getClickActionLabel(banner.click_action_type, banner.click_action_value)}
                        </p>
                        {(banner.start_date || banner.end_date) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {banner.start_date && <span>{formatISTDate(banner.start_date)}</span>}
                            {banner.start_date && banner.end_date && <span>→</span>}
                            {banner.end_date && <span>{formatISTDate(banner.end_date)}</span>}
                          </div>
                        )}
                        {(banner.start_time || banner.end_time) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {banner.start_time && formatTime12Hour(banner.start_time)}
                              {banner.start_time && banner.end_time && ' - '}
                              {banner.end_time && formatTime12Hour(banner.end_time)}
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    {/* Status Toggle & Visibility */}
                    <TableCell>
                      <div className="space-y-2">
                        {/* ON/OFF Toggle Button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => handleToggleActive(banner)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs transition-all duration-200 cursor-pointer w-full justify-center",
                                  banner.is_active
                                    ? "bg-cctv-success/20 text-cctv-success border-2 border-cctv-success/40 hover:bg-cctv-success/30"
                                    : "bg-muted text-muted-foreground border-2 border-border hover:bg-muted/80"
                                )}
                              >
                                {banner.is_active ? (
                                  <>
                                    <Power className="h-3.5 w-3.5" />
                                    <span>ON</span>
                                  </>
                                ) : (
                                  <>
                                    <Power className="h-3.5 w-3.5" />
                                    <span>OFF</span>
                                  </>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to turn {banner.is_active ? "OFF" : "ON"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        {/* Visibility Status Badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] w-full justify-center",
                            status.type === 'success' && "bg-cctv-success/10 text-cctv-success border-cctv-success/30",
                            status.type === 'warning' && "bg-cctv-warning/10 text-cctv-warning border-cctv-warning/30",
                            status.type === 'error' && "bg-destructive/10 text-destructive border-destructive/30"
                          )}
                        >
                          {status.type === 'success' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {status.type === 'warning' && <Clock className="h-3 w-3 mr-1" />}
                          {status.type === 'error' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {status.reason}
                        </Badge>
                      </div>
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(banner.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/20">
          <Image className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No banners yet</p>
          <p className="text-sm mt-1">Add your first banner to display on the Home Page</p>
          <Button onClick={() => setModalMode("type-select")} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Banner
          </Button>
        </div>
      )}

      {/* Modal for Banner Creation/Editing */}
      <Dialog 
        open={modalMode !== "closed"} 
        onOpenChange={(open) => !open && resetForm()}
      >
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto",
          modalMode === "type-select" && "max-w-2xl",
          (modalMode === "ai-create" || modalMode === "manual-create") && "max-w-4xl",
          modalMode === "edit" && "max-w-4xl"
        )}>
          {modalMode === "type-select" && (
            <BannerTypeSelector
              onSelectAI={() => setModalMode("ai-create")}
              onSelectManual={() => setModalMode("manual-create")}
              onCancel={resetForm}
            />
          )}

          {modalMode === "ai-create" && (
            <AIBannerCreator
              onBannerCreated={handleAIBannerCreated}
              onCancel={resetForm}
            />
          )}

          {modalMode === "manual-create" && (
            <ManualBannerCreator
              products={products}
              categories={categories}
              onBannerCreated={handleManualBannerCreated}
              onCancel={resetForm}
            />
          )}

          {modalMode === "edit" && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Edit Banner
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Banner Title (Optional)</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Summer Sale 🔥"
                      />
                    </div>

                    <div>
                      <Label htmlFor="image">
                        Banner Image <span className="text-destructive">*</span>
                      </Label>
                      <div className="mt-1 p-4 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-primary mb-2" />
                          <p className="text-sm font-medium text-primary mb-1">
                            1080 × 420 px (21:9)
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">
                            JPG, PNG, or WEBP • Auto-fit enabled
                          </p>
                          <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="max-w-xs mx-auto"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Image Fit Mode</Label>
                      <Select
                        value={formData.image_fit_mode}
                        onValueChange={(value) => setFormData({ ...formData, image_fit_mode: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_FIT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Click Action</Label>
                      <Select
                        value={formData.click_action_type}
                        onValueChange={(value) => setFormData({ ...formData, click_action_type: value, click_action_value: "" })}
                      >
                        <SelectTrigger>
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

                    {formData.click_action_type === "product" && (
                      <div>
                        <Label>Select Product</Label>
                        <Select
                          value={formData.click_action_value}
                          onValueChange={(value) => setFormData({ ...formData, click_action_value: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
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

                    {formData.click_action_type === "category" && (
                      <div>
                        <Label>Select Category</Label>
                        <Select
                          value={formData.click_action_value}
                          onValueChange={(value) => setFormData({ ...formData, click_action_value: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
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

                    {formData.click_action_type === "external" && (
                      <div>
                        <Label>External URL</Label>
                        <Input
                          value={formData.click_action_value}
                          onChange={(e) => setFormData({ ...formData, click_action_value: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    )}

                    {formData.click_action_type === "whatsapp" && (
                      <div>
                        <Label>WhatsApp Message (Optional)</Label>
                        <Input
                          value={formData.click_action_value}
                          onChange={(e) => setFormData({ ...formData, click_action_value: e.target.value })}
                          placeholder="Hi, I'm interested in your products"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Auto-Slide Interval (seconds)</Label>
                      <Input
                        type="number"
                        min="2"
                        max="30"
                        value={formData.auto_slide_interval}
                        onChange={(e) => setFormData({ ...formData, auto_slide_interval: e.target.value })}
                      />
                    </div>

                    {/* Schedule Section */}
                    <div className="p-4 bg-muted/50 rounded-xl space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-semibold">Schedule (Optional)</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to show banner always (when ON)
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">End Date</Label>
                          <Input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Start Time</Label>
                          <Input
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">End Time</Label>
                          <Input
                            type="time"
                            value={formData.end_time}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                      <div>
                        <Label htmlFor="is_active" className="font-semibold">Banner Status</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formData.is_active ? "Banner will appear on Home Page" : "Banner is hidden"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200",
                          formData.is_active
                            ? "bg-cctv-success text-white"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        <Power className="h-4 w-4" />
                        {formData.is_active ? "ON" : "OFF"}
                      </button>
                    </div>
                  </div>

                  {/* Right Column - Preview */}
                  <div className="space-y-4">
                    <Label className="font-semibold">Preview</Label>
                    <div className="aspect-[21/9] rounded-xl overflow-hidden border border-border bg-muted/50">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <Image className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No image uploaded
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {uploadingImage ? "Uploading..." : "Saving..."}
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
