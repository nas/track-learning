import DashboardShell from "@/components/layout/dashboard-shell";

export default function Home() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here is your learning progress.
        </p>
      </div>
      {/* Dashboard content will go here */}
    </DashboardShell>
  );
}