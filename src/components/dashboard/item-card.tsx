'use client'

import { LearningItem } from "@/lib/schemas/learning-item";
import { cn } from "@/lib/utils";
import { EditItemDialog } from "./edit-item-dialog";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface ItemCardProps {
  item: LearningItem;
  className?: string;
}

export function ItemCard({ item, className }: ItemCardProps) {
  const TitleContent = (
    <div className="flex items-center gap-2 group-hover:text-blue-500 transition-colors">
      <h3 className="font-semibold leading-none tracking-tight">{item.title}</h3>
      {item.url && <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />}
    </div>
  );

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn("rounded-xl border bg-card text-card-foreground shadow flex flex-col justify-between h-full group", className)}
    >
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center justify-between">
          {item.url ? (
            <Link href={item.url} target="_blank" rel="noopener noreferrer">
              {TitleContent}
            </Link>
          ) : (
            TitleContent
          )}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border">
            {item.type}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{item.author}</p>
      </div>
      <div className="p-6 pt-0">
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="font-medium text-muted-foreground">{item.status}</span>
          <span className="font-bold">{item.progress}</span>
        </div>
        <div className="flex justify-end border-t pt-4">
            <EditItemDialog item={item} />
        </div>
      </div>
    </motion.div>
  );
}
