import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardSidebar from "@/components/DashboardSidebar";
import MetricCard from "@/components/MetricCard";
import PerformanceChart from "@/components/PerformanceChart";
import FileUpload from "@/components/FileUpload";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Star, TrendingUp, Activity, LogOut, BarChart3, Menu } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  full_name: string;
  employee_id: string;
  email: string;
  projects_completed: number;
  productivity_score: number;
  rating: number;
  performance_score: number;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<{ month: string; score: number }[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [profileRes, historyRes, filesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("performance_history").select("month, score").eq("user_id", user.id),
      supabase.from("uploaded_files").select("*").eq("user_id", user.id).order("uploaded_at", { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data as unknown as Profile);
    if (historyRes.data) {
      const order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const sorted = [...historyRes.data].sort((a, b) => order.indexOf(a.month) - order.indexOf(b.month));
      setHistory(sorted);
    }
    if (filesRes.data) setFiles(filesRes.data);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar fullName={profile?.full_name || ""} email={profile?.email || user.email || ""} onSignOut={signOut} />

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold">PerfManager</span>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome, {profile?.full_name || "Employee"}</h1>
            <p className="text-sm text-muted-foreground">Employee ID: {profile?.employee_id} · {profile?.email}</p>
          </div>

          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Upload className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h2 className="text-xl font-semibold mb-2">Upload a file to view performance data</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md">
                Your dashboard metrics will populate with performance scores once you upload a project file.
              </p>
              <FileUpload userId={user.id} files={files} onRefresh={fetchData} />
            </div>
          ) : (
            <>
              {/* Metric cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <MetricCard title="Projects Completed" value={profile?.projects_completed ?? 0} icon={Briefcase} />
                <MetricCard title="Productivity Score" value={`${profile?.productivity_score ?? 0}%`} icon={TrendingUp} accent />
                <MetricCard title="Rating" value={`${profile?.rating ?? 0} / 5`} icon={Star} />
                <MetricCard title="Performance" value={`${profile?.performance_score ?? 0}%`} icon={Activity} accent />
              </div>

              {/* Productivity bar */}
              <Card className="mb-6 fade-in">
                <CardHeader>
                  <CardTitle className="text-lg">Productivity Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Overall Productivity</span>
                    <span className="font-semibold text-success">{profile?.productivity_score ?? 0}%</span>
                  </div>
                  <Progress value={profile?.productivity_score ?? 0} className="h-3" />
                </CardContent>
              </Card>

              {/* Chart + File upload */}
              <div className="grid gap-6 lg:grid-cols-2">
                <PerformanceChart data={history} />
                <FileUpload userId={user.id} files={files} onRefresh={fetchData} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
