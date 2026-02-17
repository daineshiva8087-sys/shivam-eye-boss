import { supabase } from "@/lib/supabase";

interface EnquiryData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message?: string;
  page_name: string;
  source_type: string;
}

export async function submitEnquiry(data: EnquiryData) {
  try {
    const { data: result, error } = await supabase.functions.invoke(
      "notify-enquiry",
      {
        body: data,
      }
    );

    if (error) {
      console.error("Enquiry notification error:", error);
    }

    return result;
  } catch (err) {
    console.error("Failed to submit enquiry notification:", err);
  }
}
