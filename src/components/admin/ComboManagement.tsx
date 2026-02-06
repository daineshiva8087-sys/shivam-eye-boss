import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Upload, X, Package, Gift } from "lucide-react";

interface ComboProduct {
  product_id: string;
  quantity: number;
}

interface Combo {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  original_price: number;
  combo_price: number;
  discount_percentage: number;
  is_active: boolean;
  combo_products?: { product_id: string; quantity: number }[];
}

interface ComboFormData {
  name: string;
  description: string;
  image_url: string;
  original_price: string;
  combo_price: string;
  is_active: boolean;
  products: ComboProduct[];
}

const defaultFormData: ComboFormData = {
  name: "",
  description: "",
  image_url: "",
  original_price: "",
  combo_price: "",
  is_active: true,
  products: [],
};

export function ComboManagement() {
  const { toast } = useToast();
  const [combos, setCombos] = useState<Combo[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);
  const [formData, setFormData] = useState<ComboFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [combosRes, productsRes] = await Promise.all([
        supabase
          .from("combo_offers")
          .select(`*, combo_products (product_id, quantity)`)
          .order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("name"),
      ]);

      if (combosRes.data) {
        setCombos(
          combosRes.data.map((c) => ({
            ...c,
            original_price: Number(c.original_price),
            combo_price: Number(c.combo_price),
            discount_percentage: Number(c.discount_percentage),
          }))
        );
      }
      if (productsRes.data) {
        setProducts(
          productsRes.data.map((p) => ({ ...p, price: Number(p.price) }))
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `combos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const calculateOriginalPrice = (comboProducts: ComboProduct[]) => {
    return comboProducts.reduce((total, cp) => {
      const product = products.find((p) => p.id === cp.product_id);
      return total + (product?.price || 0) * cp.quantity;
    }, 0);
  };

  const handleAddProduct = () => {
    if (products.length === 0) return;
    setFormData({
      ...formData,
      products: [...formData.products, { product_id: "", quantity: 1 }],
    });
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = formData.products.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      products: newProducts,
      original_price: calculateOriginalPrice(newProducts).toString(),
    });
  };

  const handleProductChange = (index: number, productId: string) => {
    const newProducts = [...formData.products];
    newProducts[index].product_id = productId;
    setFormData({
      ...formData,
      products: newProducts,
      original_price: calculateOriginalPrice(newProducts).toString(),
    });
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newProducts = [...formData.products];
    newProducts[index].quantity = quantity;
    setFormData({
      ...formData,
      products: newProducts,
      original_price: calculateOriginalPrice(newProducts).toString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.products.length === 0 || formData.products.some((p) => !p.product_id)) {
      toast({
        title: "Error",
        description: "Please add at least one product to the combo",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        setUploadingImage(true);
        imageUrl = (await uploadImage(imageFile)) || "";
        setUploadingImage(false);
      }

      const comboData = {
        name: formData.name,
        description: formData.description || null,
        image_url: imageUrl || null,
        original_price: parseFloat(formData.original_price) || 0,
        combo_price: parseFloat(formData.combo_price) || 0,
        is_active: formData.is_active,
      };

      if (editingCombo) {
        // Update combo
        const { error } = await supabase
          .from("combo_offers")
          .update(comboData)
          .eq("id", editingCombo.id);
        if (error) throw error;

        // Delete old products and insert new ones
        await supabase.from("combo_products").delete().eq("combo_id", editingCombo.id);
        await supabase.from("combo_products").insert(
          formData.products.map((p) => ({
            combo_id: editingCombo.id,
            product_id: p.product_id,
            quantity: p.quantity,
          }))
        );

        toast({ title: "Combo updated successfully!" });
      } else {
        // Create new combo
        const { data: newCombo, error } = await supabase
          .from("combo_offers")
          .insert(comboData)
          .select()
          .single();
        if (error) throw error;

        // Insert combo products
        await supabase.from("combo_products").insert(
          formData.products.map((p) => ({
            combo_id: newCombo.id,
            product_id: p.product_id,
            quantity: p.quantity,
          }))
        );

        toast({ title: "Combo created successfully!" });
      }

      setModalOpen(false);
      setFormData(defaultFormData);
      setEditingCombo(null);
      setImageFile(null);
      setImagePreview("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save combo",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const handleEdit = (combo: Combo) => {
    setEditingCombo(combo);
    setFormData({
      name: combo.name,
      description: combo.description || "",
      image_url: combo.image_url || "",
      original_price: combo.original_price.toString(),
      combo_price: combo.combo_price.toString(),
      is_active: combo.is_active,
      products: combo.combo_products || [],
    });
    setImagePreview(combo.image_url || "");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this combo?")) return;

    try {
      const { error } = await supabase.from("combo_offers").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Combo deleted successfully!" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete combo",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setEditingCombo(null);
    setFormData(defaultFormData);
    setImageFile(null);
    setImagePreview("");
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold">Combo Offers</h2>
        <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Combo
        </Button>
      </div>

      {combos.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Original Price</TableHead>
                <TableHead>Combo Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {combos.map((combo) => (
                <TableRow key={combo.id}>
                  <TableCell>
                    {combo.image_url ? (
                      <img src={combo.image_url} alt={combo.name} className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                        <Gift className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{combo.name}</TableCell>
                  <TableCell>₹{combo.original_price.toLocaleString("en-IN")}</TableCell>
                  <TableCell className="text-primary font-bold">₹{combo.combo_price.toLocaleString("en-IN")}</TableCell>
                  <TableCell>{Math.round(combo.discount_percentage)}%</TableCell>
                  <TableCell>
                    <span className={`text-sm font-medium ${combo.is_active ? "text-cctv-success" : "text-destructive"}`}>
                      {combo.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(combo)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(combo.id)}
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
          <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No combo offers yet. Create your first combo!</p>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">{editingCombo ? "Edit Combo" : "Create Combo Offer"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Combo Image</Label>
              <div className="flex gap-4">
                {(imagePreview || formData.image_url) && (
                  <div className="relative">
                    <img
                      src={imagePreview || formData.image_url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                        setFormData({ ...formData, image_url: "" });
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <label className="flex-1 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Upload image</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Combo Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., 4 Camera Complete Kit"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's included in this combo..."
                rows={2}
              />
            </div>

            {/* Products in Combo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Products in Combo *</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </Button>
              </div>

              {formData.products.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded">
                  Click "Add Product" to include products
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.products.map((cp, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Select value={cp.product_id} onValueChange={(v) => handleProductChange(index, v)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} - ₹{p.price.toLocaleString("en-IN")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={cp.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        className="w-20"
                        placeholder="Qty"
                      />
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveProduct(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price (₹)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="Auto-calculated"
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="combo_price">Combo Price (₹) *</Label>
                <Input
                  id="combo_price"
                  type="number"
                  required
                  min="0"
                  value={formData.combo_price}
                  onChange={(e) => setFormData({ ...formData, combo_price: e.target.value })}
                  placeholder="Discounted price"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {uploadingImage ? "Uploading..." : editingCombo ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
