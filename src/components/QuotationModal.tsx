import { useState } from "react";
import { submitEnquiry } from "@/hooks/useEnquiryNotification";
import { Product, supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { usePromoCode } from "@/hooks/usePromoCode";
import { useLanguage } from "@/hooks/useLanguage";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Tag, Check, X } from "lucide-react";

interface QuotationModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuotationModal({
  product,
  open,
  onOpenChange,
}: QuotationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const { validatePromoCode, loading: promoLoading, error: promoError } = usePromoCode();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    promoCode: "",
  });
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount_type: string;
    discount_value: number;
  } | null>(null);

  const handleApplyPromo = async () => {
    if (!formData.promoCode.trim()) return;
    
    const result = await validatePromoCode(formData.promoCode);
    if (result && result.is_valid) {
      setAppliedPromo({
        code: formData.promoCode.toUpperCase(),
        discount_type: result.discount_type,
        discount_value: result.discount_value,
      });
      toast({
        title: language === 'mr' ? 'प्रोमो कोड लागू!' : language === 'hi' ? 'प्रोमो कोड लागू!' : 'Promo Code Applied!',
        description: `${result.discount_type === 'percentage' ? `${result.discount_value}%` : `₹${result.discount_value}`} ${language === 'en' ? 'discount' : 'सूट'}`,
      });
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setFormData({ ...formData, promoCode: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);
    try {
      const messageWithPromo = appliedPromo 
        ? `${formData.message || ''}\n\n[Promo Code: ${appliedPromo.code} - ${appliedPromo.discount_type === 'percentage' ? `${appliedPromo.discount_value}%` : `₹${appliedPromo.discount_value}`} discount]`
        : formData.message;

      const { error } = await supabase.from("quotation_requests").insert({
        user_id: user?.id || null,
        product_id: product.id,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || null,
        message: messageWithPromo || null,
      });

      if (error) throw error;

      // Send enquiry notification
      submitEnquiry({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        message: `Product: ${product.name}${appliedPromo ? ` | Promo: ${appliedPromo.code}` : ''}${formData.message ? ` | ${formData.message}` : ''}`,
        page_name: "Product Page",
        source_type: "quotation",
      });

      toast({
        title: language === 'mr' ? 'विनंती सबमिट झाली!' : language === 'hi' ? 'अनुरोध सबमिट हुआ!' : 'Request Submitted!',
        description: language === 'mr' ? 'आम्ही तुम्हाला लवकरच संपर्क करू.' : language === 'hi' ? 'हम जल्द ही आपसे संपर्क करेंगे।' : 'We will contact you shortly with a quotation.',
      });

      setFormData({ name: "", phone: "", email: "", message: "", promoCode: "" });
      setAppliedPromo(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting quotation:", error);
      toast({
        title: language === 'mr' ? 'त्रुटी' : language === 'hi' ? 'त्रुटि' : 'Error',
        description: language === 'mr' ? 'विनंती सबमिट करण्यात अयशस्वी.' : language === 'hi' ? 'अनुरोध सबमिट करने में विफल।' : 'Failed to submit request. Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    en: {
      title: 'Request Quotation',
      name: 'Your Name',
      phone: 'Mobile Number',
      email: 'Email (optional)',
      message: 'Message (optional)',
      promoCode: 'Promo Code',
      apply: 'Apply',
      submit: 'Submit Request',
      enterName: 'Enter your name',
      enterPhone: 'Enter your mobile number',
      enterEmail: 'Enter your email',
      requirements: 'Any specific requirements...',
      enterPromo: 'Enter promo code',
    },
    mr: {
      title: 'कोटेशन विनंती',
      name: 'तुमचे नाव',
      phone: 'मोबाइल नंबर',
      email: 'ईमेल (ऐच्छिक)',
      message: 'संदेश (ऐच्छिक)',
      promoCode: 'प्रोमो कोड',
      apply: 'लागू करा',
      submit: 'विनंती सबमिट करा',
      enterName: 'तुमचे नाव टाका',
      enterPhone: 'मोबाइल नंबर टाका',
      enterEmail: 'ईमेल टाका',
      requirements: 'विशेष आवश्यकता...',
      enterPromo: 'प्रोमो कोड टाका',
    },
    hi: {
      title: 'कोटेशन अनुरोध',
      name: 'आपका नाम',
      phone: 'मोबाइल नंबर',
      email: 'ईमेल (वैकल्पिक)',
      message: 'संदेश (वैकल्पिक)',
      promoCode: 'प्रोमो कोड',
      apply: 'लागू करें',
      submit: 'अनुरोध सबमिट करें',
      enterName: 'अपना नाम दर्ज करें',
      enterPhone: 'मोबाइल नंबर दर्ज करें',
      enterEmail: 'ईमेल दर्ज करें',
      requirements: 'विशेष आवश्यकताएं...',
      enterPromo: 'प्रोमो कोड दर्ज करें',
    },
  };

  const t = labels[language];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{t.title}</DialogTitle>
          <DialogDescription>
            {product && `Get a quote for: ${product.name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name} *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder={t.enterName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone} *</Label>
            <Input
              id="phone"
              required
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder={t.enterPhone}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.email}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={t.enterEmail}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">{t.message}</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder={t.requirements}
              rows={3}
            />
          </div>

          {/* Promo Code Section */}
          <div className="space-y-2 border-t border-border pt-4">
            <Label htmlFor="promo" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              {t.promoCode}
            </Label>
            
            {appliedPromo ? (
              <div className="flex items-center justify-between p-3 bg-cctv-success/10 rounded-lg border border-cctv-success/20">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-cctv-success" />
                  <code className="font-mono font-bold text-cctv-success">{appliedPromo.code}</code>
                  <Badge variant="secondary" className="bg-cctv-success/20 text-cctv-success text-xs">
                    {appliedPromo.discount_type === 'percentage' 
                      ? `${appliedPromo.discount_value}% OFF` 
                      : `₹${appliedPromo.discount_value} OFF`}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromo}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="promo"
                  value={formData.promoCode}
                  onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                  placeholder={t.enterPromo}
                  className="font-mono flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyPromo}
                  disabled={promoLoading || !formData.promoCode.trim()}
                >
                  {promoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : t.apply}
                </Button>
              </div>
            )}
            {promoError && !appliedPromo && (
              <p className="text-xs text-destructive">{promoError}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t.submit}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
