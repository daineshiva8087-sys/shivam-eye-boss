import { supabase } from "@/integrations/supabase/client";

export { supabase };

// Default categories for suggestions (admin can add any custom category)
export const DEFAULT_CATEGORIES = [
  'IP Camera',
  'Bullet Camera',
  'Dome Camera',
  'NVR',
  'DVR',
  'BNC Connector',
  'DC Connector',
  '2U Rack',
  '3U Rack',
  '4 Channel SMPS',
  '8 Channel SMPS',
  'Solar Camera',
  '4G SIM Camera',
  'PT Camera',
  'WiFi Camera',
  'Robot Camera'
];

export interface Product {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  price: number;
  stock_quantity: number;
  is_available: boolean;
  description: string | null;
  discount_percentage: number;
  discounted_price: number;
  created_at: string;
  updated_at: string;
}

export interface QuotationRequest {
  id: string;
  user_id: string | null;
  product_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export interface ServiceBooking {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_type: string;
  address: string | null;
  message: string | null;
  status: string;
  created_at: string;
}

export const BUSINESS_INFO = {
  name: "Shivam CCTV",
  phone: "8087153702",
  email: "support@shivamcctv.in",
  address: "Jay Bajrang Chowk, Chandanzira, Jalna – 431203",
  whatsappNumber: "918087153702",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Jay+Bajrang+Chowk+Chandanzira+Jalna+431203",
};
