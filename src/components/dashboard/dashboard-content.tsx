'use client'

import { useLearningItems } from "@/hooks/useLearningItems"
import { ItemCard } from "./item-card"

export function DashboardContent() {
  const { data: items, isLoading, isError } = useLearningItems()

  if (isLoading) return <div aria-label="loading">Loading...</div>
  if (isError) return <div>Error loading data</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="learning-items-grid">
      {items?.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
