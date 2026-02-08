import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface PromoCodeResult {
  offer_id: string;
  offer_title: string;
  discount_type: string;
  discount_value: number;
  is_valid: boolean;
}

interface UsePromoCodeReturn {
  validatePromoCode: (code: string) => Promise<PromoCodeResult | null>;
  applyDiscount: (subtotal: number, promoResult: PromoCodeResult) => number;
  loading: boolean;
  error: string | null;
}

export function usePromoCode(): UsePromoCodeReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePromoCode = async (code: string): Promise<PromoCodeResult | null> => {
    if (!code.trim()) {
      setError("Please enter a promo code");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase
        .rpc('validate_promo_code', { code: code.trim().toUpperCase() });

      if (rpcError) throw rpcError;

      if (!data || data.length === 0) {
        setError("Invalid promo code");
        return null;
      }

      const result = data[0] as PromoCodeResult;

      if (!result.is_valid) {
        setError("This promo code has expired or is not active");
        return null;
      }

      return result;
    } catch (err: any) {
      console.error("Error validating promo code:", err);
      setError("Failed to validate promo code");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const applyDiscount = (subtotal: number, promoResult: PromoCodeResult): number => {
    if (!promoResult || !promoResult.is_valid) return 0;

    if (promoResult.discount_type === 'percentage') {
      return (subtotal * promoResult.discount_value) / 100;
    } else {
      return Math.min(promoResult.discount_value, subtotal);
    }
  };

  return {
    validatePromoCode,
    applyDiscount,
    loading,
    error,
  };
}