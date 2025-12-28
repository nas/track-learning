'use client'

import { motion } from 'framer-motion'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
          backgroundSize: ['200% 200%', '200% 200%'],
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'reverse',
          duration: 20,
          ease: 'linear',
        }}
      />
      <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[1px]" />
    </div>
  )
}
