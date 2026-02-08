import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, Cable, Settings } from "lucide-react";

interface ServiceCharge {
  id: string;
  name: string;
  description: string | null;
  price: number;
}

const iconMap: Record<string, React.ReactNode> = {
  "camera installation": <Settings className="h-8 w-8" />,
  "wiring charges": <Cable className="h-8 w-8" />,
  "repairing charges": <Wrench className="h-8 w-8" />,
};

const getIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(iconMap)) {
    if (lowerName.includes(key.split(" ")[0])) return icon;
  }
  return <Wrench className="h-8 w-8" />;
};

export function ServiceChargesSection() {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceCharge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("service_charges")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (data) {
        setServices(data.map((s) => ({ ...s, price: Number(s.price) })));
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading || services.length === 0) return null;

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl font-bold mb-2">
            {t('serviceCharges')}
          </h2>
          <p className="text-muted-foreground">
            {t('serviceChargesDescription')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className="bg-card hover:shadow-lg transition-shadow border-border"
            >
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {getIcon(service.name)}
                </div>
                <CardTitle className="text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {service.description}
                  </p>
                )}
                <div className="text-2xl font-bold text-primary">
                  ₹{service.price.toLocaleString("en-IN")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
