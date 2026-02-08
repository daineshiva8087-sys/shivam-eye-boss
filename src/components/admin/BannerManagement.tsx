import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  Image,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  Smartphone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  is_active: true,
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
  { value: "product", label: "Open Product" },
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

export function BannerManagement() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      // Validate file type
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
      } else {
        // Get next display order
        const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.display_order)) : 0;
        const { error } = await supabase
          .from("banners")
          .insert({ ...bannerData, display_order: maxOrder + 1 });

        if (error) throw error;
        toast({ title: "Banner added successfully!" });
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
    setModalOpen(false);
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
    setModalOpen(true);
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
    try {
      const { error } = await supabase
        .from("banners")
        .update({ is_active: !banner.is_active })
        .eq("id", banner.id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error toggling banner:", error);
    }
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

  const isBannerCurrentlyActive = (banner: Banner): boolean => {
    if (!banner.is_active) return false;

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);

    if (banner.start_date && currentDate < banner.start_date) return false;
    if (banner.end_date && currentDate > banner.end_date) return false;
    if (banner.start_time && banner.end_time) {
      if (currentTime < banner.start_time || currentTime > banner.end_time) return false;
    }

    return true;
  };

  const getClickActionLabel = (type: string, value: string | null) => {
    const option = CLICK_ACTION_OPTIONS.find(o => o.value === type);
    if (type === "none") return "No action";
    if (type === "product" && value) {
      const product = products.find(p => p.id === value);
      return product ? `Product: ${product.name}` : "Product";
    }
    if (type === "category" && value) return `Category: ${value}`;
    if (type === "external" && value) return `Link: ${value}`;
    return option?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Banner Slider</h2>
          <p className="text-sm text-muted-foreground">
            Manage homepage banners like Flipkart. Recommended size: 1080×420px (21:9)
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : banners.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead className="w-32">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Click Action</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner, index) => (
                <TableRow key={banner.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleMoveOrder(banner, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <span className="text-center text-xs">{banner.display_order}</span>
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
                  <TableCell>
                    <img
                      src={banner.image_url}
                      alt={banner.title || "Banner"}
                      className="w-28 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {banner.title || <span className="text-muted-foreground">No title</span>}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getClickActionLabel(banner.click_action_type, banner.click_action_value)}
                  </TableCell>
                  <TableCell className="text-xs">
                    {banner.start_date || banner.end_date ? (
                      <div>
                        {banner.start_date && <div>From: {banner.start_date}</div>}
                        {banner.end_date && <div>To: {banner.end_date}</div>}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Always</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => handleToggleActive(banner)}
                      />
                      {isBannerCurrentlyActive(banner) ? (
                        <Badge className="bg-cctv-success/20 text-cctv-success">Live</Badge>
                      ) : (
                        <Badge variant="secondary">Off</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(banner)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(banner.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No banners yet. Add your first banner!</p>
        </div>
      )}

      {/* Banner Form Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Banner" : "Add New Banner"}
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
                    placeholder="e.g., Summer Sale"
                  />
                </div>

                <div>
                  <Label htmlFor="image">
                    Banner Image <span className="text-destructive">*</span>
                  </Label>
                  <div className="mt-1 p-4 border-2 border-dashed border-border rounded-lg bg-muted/30">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Recommended: <strong>1080 × 420 px</strong> (21:9 ratio)
                      </p>
                      <p className="text-xs text-muted-foreground mb-3">
                        Formats: JPG, PNG, WEBP
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Banner Active</Label>
                </div>
              </div>

              {/* Right Column - Mobile Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <Label>Mobile Preview</Label>
                </div>
                <div className="bg-muted rounded-2xl p-2 max-w-[320px] mx-auto">
                  <div className="bg-background rounded-xl overflow-hidden">
                    <div className="h-6 bg-muted flex items-center justify-center">
                      <div className="w-16 h-1 bg-muted-foreground/30 rounded-full" />
                    </div>
                    <div className="aspect-[21/9] bg-muted relative">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className={`w-full h-full ${
                            formData.image_fit_mode === "cover" 
                              ? "object-cover" 
                              : formData.image_fit_mode === "contain" 
                              ? "object-contain" 
                              : "object-fill"
                          }`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  This is how the banner will appear on mobile devices
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || uploadingImage}>
                {(submitting || uploadingImage) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingBanner ? "Update Banner" : "Add Banner"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
