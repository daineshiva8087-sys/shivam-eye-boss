import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/supabase";
import { generateQuotationPDF, shareViaWhatsApp } from "@/lib/pdfGenerator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAuth } from "@/hooks/useAuth";
import {
  Plus,
  Trash2,
  Loader2,
  FileText,
  Download,
  Share2,
  Eye,
  Pencil,
  Wrench,
} from "lucide-react";

interface QuotationItem {
  product_id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface ServiceCharge {
  id: string;
  name: string;
  price: number;
}

interface QuotationFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  discountPercentage: string;
  notes: string;
  items: QuotationItem[];
  selectedServices: string[];
}

interface Quotation {
  id: string;
  quotation_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  subtotal: number;
  discount_amount: number;
  discount_percentage: number;
  total_amount: number;
  notes: string | null;
  status: string;
  created_at: string;
}

const defaultFormData: QuotationFormData = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  discountPercentage: "0",
  notes: "",
  items: [],
  selectedServices: [],
};

export function QuotationBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [combos, setCombos] = useState<any[]>([]);
  const [services, setServices] = useState<ServiceCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<QuotationFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quotationsRes, productsRes, combosRes, servicesRes] = await Promise.all([
        supabase.from("quotations").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("name"),
        supabase.from("combo_offers").select("*").eq("is_active", true).order("name"),
        supabase.from("service_charges").select("*").eq("is_active", true).order("name"),
      ]);

      if (quotationsRes.data) {
        setQuotations(
          quotationsRes.data.map((q) => ({
            ...q,
            subtotal: Number(q.subtotal),
            discount_amount: Number(q.discount_amount),
            discount_percentage: Number(q.discount_percentage),
            total_amount: Number(q.total_amount),
          }))
        );
      }
      if (productsRes.data) {
        setProducts(productsRes.data.map((p) => ({ ...p, price: Number(p.price), discount_percentage: Number(p.discount_percentage || 0) })));
      }
      if (combosRes.data) {
        setCombos(combosRes.data.map((c) => ({ ...c, combo_price: Number(c.combo_price) })));
      }
      if (servicesRes.data) {
        setServices(servicesRes.data.map((s) => ({ ...s, price: Number(s.price) })));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { product_id: "", name: "", quantity: 1, unitPrice: 0, discount: 0, total: 0 },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    const combo = combos.find((c) => c.id === productId);

    if (product) {
      const newItems = [...formData.items];
      const discountedPrice = product.discount_percentage > 0
        ? product.price * (1 - product.discount_percentage / 100)
        : product.price;
      newItems[index] = {
        product_id: productId,
        name: product.name,
        quantity: 1,
        unitPrice: discountedPrice,
        discount: product.discount_percentage,
        total: discountedPrice,
      };
      setFormData({ ...formData, items: newItems });
    } else if (combo) {
      const newItems = [...formData.items];
      newItems[index] = {
        product_id: productId,
        name: `[COMBO] ${combo.name}`,
        quantity: 1,
        unitPrice: combo.combo_price,
        discount: 0,
        total: combo.combo_price,
      };
      setFormData({ ...formData, items: newItems });
    }
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newItems = [...formData.items];
    newItems[index].quantity = quantity;
    newItems[index].total = newItems[index].unitPrice * quantity;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const itemsSubtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const servicesTotal = formData.selectedServices.reduce((sum, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
    const subtotal = itemsSubtotal + servicesTotal;
    const discountPercentage = parseFloat(formData.discountPercentage) || 0;
    const discountAmount = (subtotal * discountPercentage) / 100;
    const totalAmount = subtotal - discountAmount;
    return { subtotal, itemsSubtotal, servicesTotal, discountAmount, discountPercentage, totalAmount };
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter((id) => id !== serviceId)
        : [...prev.selectedServices, serviceId],
    }));
  };

  const generateNumber = async (): Promise<string> => {
    const { data, error } = await supabase.rpc("generate_quotation_number");
    if (error) throw error;
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      toast({ title: "Error", description: "Add at least one item", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { subtotal, discountAmount, discountPercentage, totalAmount } = calculateTotals();

    try {
      const quotationNumber = editingQuotation
        ? editingQuotation.quotation_number
        : await generateNumber();

      const quotationData = {
        quotation_number: quotationNumber,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail || null,
        customer_address: formData.customerAddress || null,
        subtotal,
        discount_amount: discountAmount,
        discount_percentage: discountPercentage,
        total_amount: totalAmount,
        notes: formData.notes || null,
        status: "draft",
        created_by: user?.id,
      };

      let quotationId: string;

      if (editingQuotation) {
        const { error } = await supabase
          .from("quotations")
          .update(quotationData)
          .eq("id", editingQuotation.id);
        if (error) throw error;
        quotationId = editingQuotation.id;

        // Delete old items
        await supabase.from("quotation_items").delete().eq("quotation_id", quotationId);
      } else {
        const { data, error } = await supabase
          .from("quotations")
          .insert(quotationData)
          .select()
          .single();
        if (error) throw error;
        quotationId = data.id;
      }

      // Insert items
      const { error: itemsError } = await supabase.from("quotation_items").insert(
        formData.items.map((item) => ({
          quotation_id: quotationId,
          product_id: products.find((p) => p.id === item.product_id) ? item.product_id : null,
          combo_id: combos.find((c) => c.id === item.product_id) ? item.product_id : null,
          item_name: item.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percentage: item.discount,
          total_price: item.total,
        }))
      );
      if (itemsError) throw itemsError;

      toast({ title: editingQuotation ? "Quotation updated!" : "Quotation created!" });
      setModalOpen(false);
      setFormData(defaultFormData);
      setEditingQuotation(null);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = (quotation: Quotation) => {
    const pdfData = {
      quotationNumber: quotation.quotation_number,
      date: new Date(quotation.created_at).toLocaleDateString("en-IN"),
      customerName: quotation.customer_name,
      customerPhone: quotation.customer_phone,
      customerEmail: quotation.customer_email || undefined,
      customerAddress: quotation.customer_address || undefined,
      items: [], // We'd need to fetch items - using mock for now
      subtotal: quotation.subtotal,
      discountAmount: quotation.discount_amount,
      discountPercentage: quotation.discount_percentage,
      totalAmount: quotation.total_amount,
      notes: quotation.notes || undefined,
    };

    // Fetch items
    supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", quotation.id)
      .then(({ data }) => {
        if (data) {
          pdfData.items = data.map((item) => ({
            name: item.item_name,
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            discount: Number(item.discount_percentage),
            total: Number(item.total_price),
          }));
        }

        const doc = generateQuotationPDF(pdfData);
        doc.save(`Quotation-${quotation.quotation_number}.pdf`);
        toast({ title: "PDF Downloaded!" });
      });
  };

  const handleShareWhatsApp = async (quotation: Quotation) => {
    const { data } = await supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", quotation.id);

    const pdfData = {
      quotationNumber: quotation.quotation_number,
      date: new Date(quotation.created_at).toLocaleDateString("en-IN"),
      customerName: quotation.customer_name,
      customerPhone: quotation.customer_phone,
      customerEmail: quotation.customer_email || undefined,
      customerAddress: quotation.customer_address || undefined,
      items: (data || []).map((item) => ({
        name: item.item_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        discount: Number(item.discount_percentage),
        total: Number(item.total_price),
      })),
      subtotal: quotation.subtotal,
      discountAmount: quotation.discount_amount,
      discountPercentage: quotation.discount_percentage,
      totalAmount: quotation.total_amount,
      notes: quotation.notes || undefined,
    };

    const doc = generateQuotationPDF(pdfData);
    const pdfBlob = doc.output("blob");
    shareViaWhatsApp(pdfBlob, quotation.quotation_number, quotation.customer_phone);
  };

  const handleEdit = async (quotation: Quotation) => {
    const { data: items } = await supabase
      .from("quotation_items")
      .select("*")
      .eq("quotation_id", quotation.id);

    setEditingQuotation(quotation);
    setFormData({
      customerName: quotation.customer_name,
      customerPhone: quotation.customer_phone,
      customerEmail: quotation.customer_email || "",
      customerAddress: quotation.customer_address || "",
      discountPercentage: quotation.discount_percentage.toString(),
      notes: quotation.notes || "",
      items: (items || []).map((item) => ({
        product_id: item.product_id || item.combo_id || "",
        name: item.item_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        discount: Number(item.discount_percentage),
        total: Number(item.total_price),
      })),
      selectedServices: [],
    });
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setEditingQuotation(null);
    setFormData(defaultFormData);
    setModalOpen(true);
  };

  const { subtotal, itemsSubtotal, servicesTotal, discountAmount, totalAmount } = calculateTotals();

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
        <h2 className="font-display text-2xl font-bold">Quotations</h2>
        <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Quotation
        </Button>
      </div>

      {quotations.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono font-medium">{q.quotation_number}</TableCell>
                  <TableCell>{q.customer_name}</TableCell>
                  <TableCell>{q.customer_phone}</TableCell>
                  <TableCell className="font-bold text-primary">
                    ₹{q.total_amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>{new Date(q.created_at).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(q)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(q)} title="Download PDF">
                        <Download className="h-4 w-4" />
                      </Button>
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareWhatsApp(q)}
                        className="text-cctv-success"
                        title="Share via WhatsApp"
                      >
                        <Share2 className="h-4 w-4" />
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
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No quotations yet. Create your first quotation!</p>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingQuotation ? `Edit Quotation #${editingQuotation.quotation_number}` : "Create Quotation"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone *</Label>
                <Input
                  id="customerPhone"
                  required
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Mobile number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="Email (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Address</Label>
                <Input
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  placeholder="Address (optional)"
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items *</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddProduct}>
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>

              {formData.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded">
                  Add products or combos to this quotation
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center p-2 bg-muted/50 rounded">
                      <Select
                        value={item.product_id}
                        onValueChange={(v) => handleItemChange(index, v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product/combo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="" disabled>
                            Products
                          </SelectItem>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} - ₹{p.price.toLocaleString("en-IN")}
                              {p.discount_percentage > 0 && ` (${p.discount_percentage}% off)`}
                            </SelectItem>
                          ))}
                          {combos.length > 0 && (
                            <>
                              <SelectItem value="" disabled>
                                Combos
                              </SelectItem>
                              {combos.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  [COMBO] {c.name} - ₹{c.combo_price.toLocaleString("en-IN")}
                                </SelectItem>
                              ))}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        className="w-16"
                      />
                      <span className="w-24 text-right font-medium">
                        ₹{item.total.toLocaleString("en-IN")}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Charges */}
            {services.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Service Charges
                </Label>
                <div className="grid grid-cols-1 gap-2 p-3 bg-muted/50 rounded-lg">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center justify-between cursor-pointer hover:bg-muted p-2 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={formData.selectedServices.includes(service.id)}
                          onCheckedChange={() => handleServiceToggle(service.id)}
                        />
                        <span>{service.name}</span>
                      </div>
                      <span className="font-medium">₹{service.price.toLocaleString("en-IN")}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Discount and Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount">Additional Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special notes..."
                />
              </div>
            </div>

            {/* Summary */}
            {(formData.items.length > 0 || formData.selectedServices.length > 0) && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                {itemsSubtotal > 0 && (
                  <div className="flex justify-between">
                    <span>Products/Combos:</span>
                    <span>₹{itemsSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {servicesTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Service Charges:</span>
                    <span>₹{servicesTotal.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount ({formData.discountPercentage}%):</span>
                    <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingQuotation ? "Update Quotation" : "Create Quotation"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
