import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { ComboCard, ComboOffer } from "./ComboCard";
import { ComboQuotationModal } from "./ComboQuotationModal";
import { Loader2, Gift } from "lucide-react";

export function ComboSection() {
  const { t } = useLanguage();
  const [combos, setCombos] = useState<ComboOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCombo, setSelectedCombo] = useState<ComboOffer | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchCombos();
  }, []);

  const fetchCombos = async () => {
    try {
      const { data, error } = await supabase
        .from("combo_offers")
        .select(`
          *,
          combo_products (
            id,
            product_id,
            quantity,
            products (
              name,
              image_url
            )
          )
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const typedCombos = (data || []).map((item) => ({
        ...item,
        original_price: Number(item.original_price),
        combo_price: Number(item.combo_price),
        discount_percentage: Number(item.discount_percentage),
      }));

      setCombos(typedCombos);
    } catch (error) {
      console.error("Error fetching combos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestQuote = (combo: ComboOffer) => {
    setSelectedCombo(combo);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (combos.length === 0) return null;

  return (
    <section className="py-16 bg-card">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary mb-2">
            <Gift className="h-5 w-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Special Deals</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('comboOffers')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('comboOffersDescription')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {combos.map((combo, index) => (
            <div
              key={combo.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ComboCard combo={combo} onRequestQuote={handleRequestQuote} />
            </div>
          ))}
        </div>
      </div>

      <ComboQuotationModal
        combo={selectedCombo}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
}
