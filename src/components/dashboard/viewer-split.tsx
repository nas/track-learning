'use client'

import Link from "next/link";
import { X, LayoutDashboard, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ViewerSplit({ url }: { url: string }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex bg-background overflow-hidden"
    >
      <div className="w-[10%] min-w-[100px] border-r flex flex-col items-center py-8 gap-8 bg-muted/30 backdrop-blur-sm">
        <Link 
          href="/"
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors group"
          title="Back to Dashboard"
        >
          <div className="p-2 rounded-lg bg-background shadow-sm group-hover:shadow-md transition-all">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dashboard</span>
        </Link>

        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors group"
          title="Open in new tab"
        >
          <div className="p-2 rounded-lg bg-background shadow-sm group-hover:shadow-md transition-all">
            <ExternalLink className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Open Link</span>
        </a>
        
        <div className="mt-auto mb-4 flex flex-col items-center gap-4">
            {isLoading && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Loader2 className="h-4 w-4 text-blue-500" />
                </motion.div>
            )}
            <div className="h-20 w-[1px] bg-border" />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                Learning Mode
            </span>
        </div>
      </div>
      <div className="w-[90%] h-full bg-white relative">
        <AnimatePresence>
            {isLoading && (
                <motion.div 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10"
                >
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-sm text-muted-foreground animate-pulse">Loading resource...</p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        <iframe 
          src={url} 
          className="w-full h-full border-none"
          title="Learning Resource"
          sandbox="allow-same-origin allow-scripts allow-forms"
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </motion.div>
  )
}
