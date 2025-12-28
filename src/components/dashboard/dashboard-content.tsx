'use client'

import { useLearningItems } from "@/hooks/useLearningItems"
import { ItemCard } from "./item-card"
import { SearchFilters } from "./search-filters"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function DashboardContent() {
  const { data: items, isLoading, isError } = useLearningItems()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  if (isLoading) return <div aria-label="loading" className="text-center py-10">Loading...</div>
  if (isError) return <div className="text-center py-10 text-red-500">Error loading data</div>

  const filteredItems = items?.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.author.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "All" || item.type === typeFilter
    return matchesSearch && matchesType
  })?.sort((a, b) => {
    // Put Archived items at the end
    if (a.status === "Archived" && b.status !== "Archived") return 1
    if (a.status !== "Archived" && b.status === "Archived") return -1
    return 0
  })

  return (
    <div className="flex flex-col gap-4">
      <SearchFilters 
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />
      <motion.div 
        layout
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
        aria-label="learning-items-grid"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems?.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <ItemCard item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {filteredItems?.length === 0 && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10 text-muted-foreground border rounded-lg border-dashed"
        >
            No items found matching your search.
        </motion.div>
      )}
    </div>
  )
}
