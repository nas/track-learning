import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { AnimatedBackground } from "./animated-background"

export default function DashboardShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-screen flex-col space-y-6 relative">
      <AnimatedBackground />
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between py-4 mx-auto px-4">
          <div className="flex gap-6 md:gap-10">
            <h1 className="text-xl font-bold">Learning Tracker</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <main className={cn("container mx-auto px-4 grid flex-1 gap-12 pb-10", className)}>
        {children}
      </main>
    </div>
  )
}