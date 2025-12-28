'use client'

import { LearningItem } from "@/lib/schemas/learning-item";
import { cn } from "@/lib/utils";
import { EditItemDialog } from "./edit-item-dialog";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "./progress-bar";

interface ItemCardProps {
  item: LearningItem;
  className?: string;
}

export function ItemCard({ item, className }: ItemCardProps) {
  const TitleContent = (
    <div className="flex items-center gap-2 group/title hover:text-blue-600 transition-colors">
      <h3 className="font-bold text-lg leading-tight tracking-tight">{item.title}</h3>
      {item.url && <ExternalLink className="h-4 w-4 opacity-30 group-hover/title:opacity-100 transition-opacity" />}
    </div>
  );

  return (
    <motion.div 
      whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      className={cn(
        "rounded-2xl border bg-card/50 backdrop-blur-sm text-card-foreground shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full group", 
        className
      )}
    >
      <div className="flex flex-col space-y-2 p-7">
        <div className="flex items-start justify-between gap-4">
          {item.url ? (
            <Link href={`?viewer=${encodeURIComponent(item.url)}`}>
              {TitleContent}
            </Link>
          ) : (
            TitleContent
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 shrink-0">
            {item.type}
          </span>
        </div>
        <p className="text-sm font-medium text-muted-foreground/80">{item.author}</p>
      </div>
      <div className="p-7 pt-0 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">
            <span>Status</span>
            <span className="text-foreground">{item.status}</span>
          </div>
          <ProgressBar progress={item.progress} />
        </div>
        <div className="flex justify-end border-t border-border/50 pt-5">
            <EditItemDialog item={item} />
        </div>
      </div>
    </motion.div>
  );
}
