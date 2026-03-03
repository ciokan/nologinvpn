import { Loader2, Shield } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <div className="relative">
          <Shield className="h-10 w-10 text-primary/30" />
          <Loader2 className="h-5 w-5 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-sm">Loading dashboard…</p>
      </div>
    </div>
  );
}
