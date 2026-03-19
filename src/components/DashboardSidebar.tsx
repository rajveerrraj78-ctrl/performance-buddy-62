import { BarChart3, LayoutDashboard, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  fullName: string;
  email: string;
  onSignOut: () => void;
}

export default function DashboardSidebar({ fullName, email, onSignOut }: DashboardSidebarProps) {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <BarChart3 className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-semibold">PerfManager</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        <div className="flex items-center gap-3 rounded-md bg-secondary px-3 py-2 text-sm font-medium">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </div>
      </nav>

      <div className="border-t border-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {fullName.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{fullName || "Employee"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}
