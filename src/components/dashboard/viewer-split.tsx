'use client'

import Link from "next/link";
import { X, LayoutDashboard } from "lucide-react";

export function ViewerSplit({ url }: { url: string }) {
  return (
    <div className="fixed inset-0 z-50 flex bg-background overflow-hidden">
      <div className="w-[10%] min-w-[80px] border-r flex flex-col items-center py-8 gap-8 bg-muted/30">
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
        
        <div className="mt-auto mb-4 flex flex-col items-center gap-2">
            <div className="h-20 w-[1px] bg-border" />
            <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                Learning Mode
            </span>
        </div>
      </div>
      <div className="w-[90%] h-full bg-white relative">
        <iframe 
          src={url} 
          className="w-full h-full border-none"
          title="Learning Resource"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    </div>
  )
}
