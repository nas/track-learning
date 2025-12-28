'use client'

import { motion } from 'framer-motion'
import { Sparkles, Search } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  message?: string
  action?: ReactNode
  iconType?: 'default' | 'search'
}

export function EmptyState({ 
  title = "No learning items found", 
  message = "Time to start a new adventure! Add your first item above.", 
  action,
  iconType = 'default'
}: EmptyStateProps) {
  const Icon = iconType === 'search' ? Search : Sparkles

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed rounded-3xl bg-muted/20 border-muted-foreground/20"
    >
      <div className="p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-6">
        <Icon className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-[250px] mx-auto mb-8 text-sm font-medium">
        {message}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </motion.div>
  )
}
