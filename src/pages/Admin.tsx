import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Product, supabase, DEFAULT_CATEGORIES } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  MessageSquare,
  Users,
  BarChart3,
  Boxes,
  AlertTriangle,
  ClipboardList,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { OfferManagement } from "@/components/admin/OfferManagement";
import { ComboManagement } from "@/components/admin/ComboManagement";
import { QuotationBuilder } from "@/components/admin/QuotationBuilder";
import { ServiceChargesManagement } from "@/components/admin/ServiceChargesManagement";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { BannerManagement } from "@/components/admin/BannerManagement";
import { AnnouncementManagement } from "@/components/admin/AnnouncementManagement";
import { LeadsManagement } from "@/components/admin/LeadsManagement";
import { VisitorStats } from "@/components/admin/VisitorStats";

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
  const [leads, setLeads] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [productSort, setProductSort] = useState("newest");
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
      const [productsRes, quotationsRes, bookingsRes, leadsRes, offersRes] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("quotation_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("service_bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("enquiries").select("*").order("created_at", { ascending: false }),
        supabase.from("offers").select("id, is_active"),
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
      if (leadsRes.data) setLeads(leadsRes.data);
      if (offersRes.data) setOffers(offersRes.data);
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

  const productCategories = useMemo(
    () => [...new Set(products.map((product) => product.category))].sort(),
    [products]
  );

  const filteredAdminProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch = !query || [product.name, product.category, product.description || ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesFilter = productFilter === "all"
        || (productFilter === "available" && product.is_available)
        || (productFilter === "unavailable" && !product.is_available)
        || (productFilter === "low" && product.stock_quantity > 0 && product.stock_quantity <= 10)
        || (productFilter === "out" && product.stock_quantity === 0);
      return matchesSearch && matchesFilter;
    });

    return [...filtered].sort((a, b) => {
      if (productSort === "name") return a.name.localeCompare(b.name);
      if (productSort === "price-low") return a.price - b.price;
      if (productSort === "price-high") return b.price - a.price;
      if (productSort === "stock") return a.stock_quantity - b.stock_quantity;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [products, productFilter, productSearch, productSort]);

  const dashboardMetrics = [
    { label: "Total products", value: products.length, detail: `${products.filter((product) => product.is_available).length} active`, icon: Package },
    { label: "Stock attention", value: products.filter((product) => product.stock_quantity <= 10).length, detail: `${products.filter((product) => product.stock_quantity === 0).length} out of stock`, icon: AlertTriangle },
    { label: "Categories", value: productCategories.length, detail: "Across the catalogue", icon: Boxes },
    { label: "Quote requests", value: quotationRequests.length, detail: `${quotationRequests.filter((request) => request.status === "pending").length} pending`, icon: FileText },
    { label: "Service bookings", value: bookings.length, detail: `${bookings.filter((booking) => booking.status === "pending").length} pending`, icon: Wrench },
    { label: "Unread leads", value: leads.filter((lead) => !lead.is_read).length, detail: `${leads.length} total enquiries`, icon: MessageSquare },
    { label: "Active offers", value: offers.filter((offer) => offer.is_active).length, detail: `${offers.length} total offers`, icon: Sparkles },
  ];

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
         <Tabs defaultValue="dashboard">
          <TabsList className="mb-8 flex-wrap h-auto gap-1">
             <TabsTrigger value="dashboard" className="gap-2">
               <BarChart3 className="h-4 w-4" />
               Dashboard
             </TabsTrigger>
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
            <TabsTrigger value="leads" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Leads
            </TabsTrigger>
            <TabsTrigger value="announcement" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Announcement
            </TabsTrigger>
            <TabsTrigger value="visitors" className="gap-2">
              <Users className="h-4 w-4" />
              Visitors
            </TabsTrigger>
          </TabsList>

           <TabsContent value="dashboard" className="space-y-8">
             <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
               <div>
                 <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Operations overview</p>
                 <h2 className="font-display text-3xl font-bold">Good to see you, Shivam.</h2>
                 <p className="mt-1 text-muted-foreground">Keep the catalogue, requests, and service pipeline moving.</p>
               </div>
               <Button onClick={handleAddNew} className="w-full gap-2 md:w-auto">
                 <Plus className="h-4 w-4" />
                 Add product
               </Button>
             </div>

             <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
               {dashboardMetrics.map(({ label, value, detail, icon: Icon }) => (
                 <div key={label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                   <div className="flex items-start justify-between gap-3">
                     <div>
                       <p className="text-sm text-muted-foreground">{label}</p>
                       <p className="mt-2 font-display text-3xl font-bold">{value}</p>
                     </div>
                     <div className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></div>
                   </div>
                   <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
                 </div>
               ))}
             </div>

             <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
               <div className="rounded-lg border border-border bg-card p-5">
                 <div className="mb-5 flex items-center justify-between gap-3">
                   <div>
                     <h3 className="font-display text-xl font-bold">Catalogue health</h3>
                     <p className="text-sm text-muted-foreground">Availability and stock signals from your products.</p>
                   </div>
                   <TrendingUp className="h-5 w-5 text-primary" />
                 </div>
                 <div className="space-y-4">
                   {[
                     ["Available", products.filter((product) => product.is_available).length, "bg-primary"],
                     ["Low stock", products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 10).length, "bg-yellow-500"],
                     ["Out of stock", products.filter((product) => product.stock_quantity === 0).length, "bg-destructive"],
                   ].map(([label, value, color]) => {
                     const total = Math.max(products.length, 1);
                     return <div key={label as string} className="space-y-2">
                       <div className="flex justify-between text-sm"><span>{label}</span><span className="font-medium">{value}</span></div>
                       <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${color}`} style={{ width: `${Math.min(100, (Number(value) / total) * 100)}%` }} /></div>
                     </div>;
                   })}
                 </div>
               </div>
               <div className="rounded-lg border border-border bg-card p-5">
                 <div className="mb-5 flex items-center gap-3"><ClipboardList className="h-5 w-5 text-primary" /><div><h3 className="font-display text-xl font-bold">Next actions</h3><p className="text-sm text-muted-foreground">Priorities for today.</p></div></div>
                 <div className="space-y-3 text-sm">
                   <button type="button" onClick={() => setProductFilter("out")} className="flex w-full items-center justify-between border-b border-border pb-3 text-left hover:text-primary"><span>Review out-of-stock products</span><Badge variant="secondary">{products.filter((product) => product.stock_quantity === 0).length}</Badge></button>
                   <button type="button" onClick={() => setProductFilter("low")} className="flex w-full items-center justify-between border-b border-border pb-3 text-left hover:text-primary"><span>Check low-stock products</span><Badge variant="secondary">{products.filter((product) => product.stock_quantity > 0 && product.stock_quantity <= 10).length}</Badge></button>
                   <button type="button" onClick={() => setProductFilter("all")} className="flex w-full items-center justify-between text-left hover:text-primary"><span>Open full catalogue</span><Badge variant="secondary">{products.length}</Badge></button>
                 </div>
               </div>
             </div>
           </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
             <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
               <div><h2 className="font-display text-2xl font-bold">Products</h2><p className="text-sm text-muted-foreground">Manage the catalogue customers use to request quotes.</p></div>
              <Button onClick={handleAddNew} className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

             <div className="mb-6 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_auto_auto]">
               <Input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products, categories, descriptions" />
               <Select value={productFilter} onValueChange={setProductFilter}>
                 <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Filter stock" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All products</SelectItem><SelectItem value="available">Available</SelectItem><SelectItem value="unavailable">Unavailable</SelectItem><SelectItem value="low">Low stock</SelectItem><SelectItem value="out">Out of stock</SelectItem>
                 </SelectContent>
               </Select>
               <Select value={productSort} onValueChange={setProductSort}>
                 <SelectTrigger className="w-full md:w-44"><SelectValue placeholder="Sort products" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="newest">Newest first</SelectItem><SelectItem value="name">Name A–Z</SelectItem><SelectItem value="price-low">Price low–high</SelectItem><SelectItem value="price-high">Price high–low</SelectItem><SelectItem value="stock">Lowest stock</SelectItem>
                 </SelectContent>
               </Select>
             </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
             ) : filteredAdminProducts.length > 0 ? (
               <div className="overflow-x-auto rounded-lg border border-border">
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
                     {filteredAdminProducts.map((product) => (
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
                 <p>{products.length ? "No products match these filters." : "No products yet. Add your first product!"}</p>
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

          {/* Leads Tab */}
          <TabsContent value="leads">
            <LeadsManagement />
          </TabsContent>

          {/* Announcement Tab */}
          <TabsContent value="announcement">
            <AnnouncementManagement />
          </TabsContent>

          {/* Visitors Tab */}
          <TabsContent value="visitors">
            <VisitorStats />
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
