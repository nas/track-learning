'use client'

import { useLearningItems } from "@/hooks/useLearningItems"
import { ItemCard } from "./item-card"
import { SearchFilters } from "./search-filters"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { EmptyState } from "./empty-state"
import { Loader2, AlertCircle } from "lucide-react"

export function DashboardContent() {
  const { data: items, isLoading, isError } = useLearningItems()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")

  if (isLoading) {
    return (
      <div aria-label="loading" className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-muted-foreground font-medium animate-pulse">Gathering your progress...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-red-500">
        <AlertCircle className="h-10 w-10" />
        <p className="font-bold tracking-tight">Oops! Something went wrong.</p>
        <button onClick={() => window.location.reload()} className="text-sm underline">Try again</button>
      </div>
    )
  }

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

  const isSearching = search !== "" || typeFilter !== "All"

  return (
    <div className="flex flex-col gap-8">
      <SearchFilters 
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />
      
      {filteredItems && filteredItems.length > 0 ? (
        <motion.div 
          layout
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
          aria-label="learning-items-grid"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ItemCard item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState 
          iconType={isSearching ? 'search' : 'default'}
          title={isSearching ? "No results found" : "Your dashboard is empty"}
          message={isSearching 
            ? "We couldn't find anything matching your filters. Try adjusting them!" 
            : "Time to start a new adventure! Add your first item to begin tracking your journey."
          }
        />
      )}
    </div>
  )
}
