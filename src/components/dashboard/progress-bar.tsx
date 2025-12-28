'use client'

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  progress: string
  className?: string
}

export function ProgressBar({ progress, className }: ProgressBarProps) {
  // Extract number from string like "50%"
  const progressValue = parseInt(progress) || 0
  const validatedProgress = Math.min(Math.max(progressValue, 0), 100)

  return (
    <div className={cn("w-full flex items-center gap-3", className)}>
      <div className="h-2.5 flex-1 bg-secondary rounded-full overflow-hidden">
        <div 
          className="progress-fill h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${validatedProgress}%` }}
        />
      </div>
      <span className="text-xs font-bold min-w-[2.5rem] text-right">{progress}</span>
    </div>
  )
}
