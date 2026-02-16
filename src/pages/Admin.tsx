import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Product, supabase, DEFAULT_CATEGORIES } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  LogOut,
  Home,
  Package,
  FileText,
  Wrench,
  Upload,
  X,
  Sparkles,
  Gift,
  Receipt,
  Image,
  Megaphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { OfferManagement } from "@/components/admin/OfferManagement";
import { ComboManagement } from "@/components/admin/ComboManagement";
import { QuotationBuilder } from "@/components/admin/QuotationBuilder";
import { ServiceChargesManagement } from "@/components/admin/ServiceChargesManagement";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { BannerManagement } from "@/components/admin/BannerManagement";
import { AnnouncementManagement } from "@/components/admin/AnnouncementManagement";

interface ProductFormData {
  name: string;
  category: string;
  customCategory: string;
  price: string;
  discount_percentage: string;
  stock_quantity: string;
  is_available: boolean;
  description: string;
  image_url: string;
}

const defaultFormData: ProductFormData = {
  name: "",
  category: "",
  customCategory: "",
  price: "",
  discount_percentage: "0",
  stock_quantity: "",
  is_available: true,
  description: "",
  image_url: "",
};

export default function Admin() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [quotationRequests, setQuotationRequests] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/auth");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, quotationsRes, bookingsRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("quotation_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("service_bookings").select("*").order("created_at", { ascending: false }),
      ]);

      if (productsRes.data) {
        const typedProducts = productsRes.data.map(item => ({
          ...item,
          category: item.category as string,
          price: Number(item.price),
          discount_percentage: Number(item.discount_percentage || 0),
          discounted_price: Number(item.discounted_price || item.price),
        }));
        setProducts(typedProducts);
      }
      if (quotationsRes.data) setQuotationRequests(quotationsRes.data);
      if (bookingsRes.data) setBookings(bookingsRes.data);
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
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

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

      const finalCategory = formData.category === "__custom__" 
        ? formData.customCategory.trim() 
        : formData.category;

      const productData = {
        name: formData.name,
        category: finalCategory,
        price: parseFloat(formData.price) || 0,
        discount_percentage: parseFloat(formData.discount_percentage) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_available: formData.is_available,
        description: formData.description || null,
        image_url: imageUrl || null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({ title: "Product updated successfully!" });
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;

        toast({ title: "Product added successfully!" });
      }

      setModalOpen(false);
      setFormData(defaultFormData);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview("");
      fetchData();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const isDefaultCategory = DEFAULT_CATEGORIES.includes(product.category);
    setFormData({
      name: product.name,
      category: isDefaultCategory ? product.category : "__custom__",
      customCategory: isDefaultCategory ? "" : product.category,
      price: product.price.toString(),
      discount_percentage: (product.discount_percentage || 0).toString(),
      stock_quantity: product.stock_quantity.toString(),
      is_available: product.is_available,
      description: product.description || "",
      image_url: product.image_url || "",
    });
    setImagePreview(product.image_url || "");
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Product deleted successfully!" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setImageFile(null);
    setImagePreview("");
    setModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Shivam CCTV</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="products">
          <TabsList className="mb-8 flex-wrap h-auto gap-1">
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="banners" className="gap-2">
              <Image className="h-4 w-4" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Wrench className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Offers
            </TabsTrigger>
            <TabsTrigger value="combos" className="gap-2">
              <Gift className="h-4 w-4" />
              Combos
            </TabsTrigger>
            <TabsTrigger value="quotations" className="gap-2">
              <Receipt className="h-4 w-4" />
              Quotations
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <FileText className="h-4 w-4" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="bookings" className="gap-2">
              <Wrench className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="announcement" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Announcement
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold">Products</h2>
              <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center">
                              <Camera className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>₹{product.price.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          {product.discount_percentage > 0 ? (
                            <span className="text-destructive font-medium">{product.discount_percentage}%</span>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{product.stock_quantity}</TableCell>
                        <TableCell>
                          <span
                            className={`text-sm font-medium ${
                              product.is_available ? "text-cctv-success" : "text-destructive"
                            }`}
                          >
                            {product.is_available ? "Available" : "Unavailable"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
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
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products yet. Add your first product!</p>
              </div>
            )}
          </TabsContent>

          {/* Banners Tab */}
          <TabsContent value="banners">
            <BannerManagement />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <ServiceChargesManagement />
          </TabsContent>

          {/* Offers Tab */}
          <TabsContent value="offers">
            <OfferManagement />
          </TabsContent>

          {/* Combos Tab */}
          <TabsContent value="combos">
            <ComboManagement />
          </TabsContent>

          {/* Quotations Tab */}
          <TabsContent value="quotations">
            <QuotationBuilder />
          </TabsContent>

          {/* Quotation Requests Tab */}
          <TabsContent value="requests">
            <h2 className="font-display text-2xl font-bold mb-6">Quotation Requests</h2>
            {quotationRequests.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotationRequests.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.customer_name}</TableCell>
                        <TableCell>{q.customer_phone}</TableCell>
                        <TableCell>{q.customer_email || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{q.message || "-"}</TableCell>
                        <TableCell>
                          <span className="capitalize text-sm">{q.status}</span>
                        </TableCell>
                        <TableCell>
                          {new Date(q.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No quotation requests yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <h2 className="font-display text-2xl font-bold mb-6">Service Bookings</h2>
            {bookings.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.customer_name}</TableCell>
                        <TableCell>{b.customer_phone}</TableCell>
                        <TableCell className="capitalize">{b.service_type.replace("_", " ")}</TableCell>
                        <TableCell className="max-w-xs truncate">{b.address || "-"}</TableCell>
                        <TableCell>
                          <span className="capitalize text-sm">{b.status}</span>
                        </TableCell>
                        <TableCell>
                          {new Date(b.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No service bookings yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Announcement Tab */}
          <TabsContent value="announcement">
            <AnnouncementManagement />
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-6 w-6" />
                    <span className="text-sm">Click to upload image</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value, customCategory: value === "__custom__" ? formData.customCategory : "" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">+ Add Custom Category</SelectItem>
                </SelectContent>
              </Select>
              {formData.category === "__custom__" && (
                <Input
                  placeholder="Enter custom category name"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  className="mt-2"
                  required
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discount_percentage}
                  onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                required
                min="0"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, stock_quantity: e.target.value })
                }
                placeholder="0"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="available">Available for Sale</Label>
              <Switch
                id="available"
                checked={formData.is_available}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_available: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            {/* Additional Images Manager - only show when editing */}
            {editingProduct && (
              <div className="border-t pt-4">
                <ProductImagesManager productId={editingProduct.id} />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {uploadingImage ? "Uploading..." : editingProduct ? "Update" : "Add Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
