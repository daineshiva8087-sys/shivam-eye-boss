import { useState } from "react";
import { submitEnquiry } from "@/hooks/useEnquiryNotification";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ComboOffer } from "./ComboCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ComboQuotationModalProps {
  combo: ComboOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComboQuotationModal({
  combo,
  open,
  onOpenChange,
}: ComboQuotationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!combo) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("quotation_requests").insert({
        user_id: user?.id || null,
        product_id: null,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || null,
        message: `[COMBO REQUEST] ${combo.name}\n\nCombo Price: ₹${combo.combo_price.toLocaleString("en-IN")}\n\n${formData.message || ""}`,
      });

      if (error) throw error;

      // Send enquiry notification
      submitEnquiry({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        message: `Combo: ${combo.name} (₹${combo.combo_price.toLocaleString("en-IN")})${formData.message ? ` | ${formData.message}` : ''}`,
        page_name: "Combo Offers",
        source_type: "combo_quotation",
      });

      toast({
        title: "Request Submitted!",
        description: "We will contact you shortly with a quotation.",
      });

      setFormData({ name: "", phone: "", email: "", message: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Request Combo Quote</DialogTitle>
          <DialogDescription>
            {combo && `Get a quote for: ${combo.name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number *</Label>
            <Input
              id="phone"
              required
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your mobile number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Any specific requirements..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Submit Request
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
