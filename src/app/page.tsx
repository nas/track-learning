import DashboardShell from "@/components/layout/dashboard-shell";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import { AddItemDialog } from "@/components/dashboard/add-item-dialog";

export default function Home() {
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
            Welcome back! Here is your learning progress.
            </p>
        </div>
        <AddItemDialog />
      </div>
      <DashboardContent />
    </DashboardShell>
  );
}