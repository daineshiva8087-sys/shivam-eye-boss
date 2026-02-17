import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Mail,
  Phone,
  Eye,
  EyeOff,
  MessageSquare,
  CheckCheck,
  RefreshCw,
} from "lucide-react";

interface Enquiry {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  message: string | null;
  page_name: string;
  source_type: string;
  is_read: boolean;
  created_at: string;
}

export function LeadsManagement() {
  const { toast } = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnquiries();

    // Realtime subscription for new enquiries
    const channel = supabase
      .channel("enquiries-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "enquiries" },
        (payload) => {
          setEnquiries((prev) => [payload.new as Enquiry, ...prev]);
          toast({
            title: "🔔 New Enquiry!",
            description: `${(payload.new as Enquiry).customer_name} from ${(payload.new as Enquiry).page_name}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEnquiries((data as Enquiry[]) || []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRead = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("enquiries")
        .update({ is_read: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, is_read: !currentStatus } : e))
      );
    } catch (error) {
      console.error("Error updating read status:", error);
    }
  };

  const markAllRead = async () => {
    try {
      const { error } = await supabase
        .from("enquiries")
        .update({ is_read: true })
        .eq("is_read", false);

      if (error) throw error;

      setEnquiries((prev) => prev.map((e) => ({ ...e, is_read: true })));
      toast({ title: "All enquiries marked as read" });
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const unreadCount = enquiries.filter((e) => !e.is_read).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const sourceTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      quotation: "Quotation Request",
      service_booking: "Service Booking",
      combo_quotation: "Combo Quote",
      general: "General Enquiry",
    };
    return map[type] || type;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold">Leads / Enquiries</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchEnquiries}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : enquiries.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">Status</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Message</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enquiries.map((enquiry) => (
                  <TableRow
                    key={enquiry.id}
                    className={!enquiry.is_read ? "bg-primary/5" : ""}
                  >
                    <TableCell>
                      {!enquiry.is_read ? (
                        <span className="flex h-3 w-3 rounded-full bg-primary" />
                      ) : (
                        <span className="flex h-3 w-3 rounded-full bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {enquiry.customer_name}
                    </TableCell>
                    <TableCell>
                      <a
                        href={`tel:${enquiry.customer_phone}`}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {enquiry.customer_phone}
                      </a>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {enquiry.customer_email ? (
                        <a
                          href={`mailto:${enquiry.customer_email}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="h-3 w-3" />
                          {enquiry.customer_email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                      {enquiry.message || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {sourceTypeLabel(enquiry.source_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize text-xs">
                      {enquiry.page_name}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDate(enquiry.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRead(enquiry.id, enquiry.is_read)}
                        title={enquiry.is_read ? "Mark as unread" : "Mark as read"}
                      >
                        {enquiry.is_read ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No enquiries yet.</p>
        </div>
      )}
    </div>
  );
}
