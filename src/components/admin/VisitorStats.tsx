import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Calendar, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  monthVisits: number;
  last7Days: { date: string; count: number }[];
}

export function VisitorStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const week = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch all visits (limited batches)
      const [allRes, todayRes, monthRes, weekRes] = await Promise.all([
        supabase.from("site_visits").select("visitor_id", { count: "exact", head: true }),
        supabase.from("site_visits").select("id", { count: "exact", head: true }).gte("visited_at", todayStart),
        supabase.from("site_visits").select("id", { count: "exact", head: true }).gte("visited_at", monthStart),
        supabase.from("site_visits").select("visitor_id, visited_at").gte("visited_at", week),
      ]);

      // Unique visitors count
      const uniqueRes = await supabase.from("site_visits").select("visitor_id");
      const uniqueSet = new Set(uniqueRes.data?.map((r) => r.visitor_id) || []);

      // Daily breakdown for last 7 days
      const dailyMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dailyMap[d.toISOString().slice(0, 10)] = 0;
      }
      weekRes.data?.forEach((v) => {
        const day = new Date(v.visited_at).toISOString().slice(0, 10);
        if (dailyMap[day] !== undefined) dailyMap[day]++;
      });

      setStats({
        totalVisits: allRes.count || 0,
        uniqueVisitors: uniqueSet.size,
        todayVisits: todayRes.count || 0,
        monthVisits: monthRes.count || 0,
        last7Days: Object.entries(dailyMap).map(([date, count]) => ({ date, count })),
      });
    } catch (err) {
      console.error("Error fetching visitor stats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return <p className="text-muted-foreground">Failed to load stats.</p>;

  const maxCount = Math.max(...stats.last7Days.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Visitor Statistics</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayVisits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthVisits.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Last 7 Days Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {stats.last7Days.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">{day.count}</span>
                <div
                  className="w-full bg-primary rounded-t-sm min-h-[4px]"
                  style={{ height: `${(day.count / maxCount) * 100}%` }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
