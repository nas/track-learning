'use client'

import { useLearningItems } from "@/hooks/useLearningItems"
import { ItemCard } from "./item-card"
import { SearchFilters } from "./search-filters"
import { useState } from "react"

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
    // We might also want to exclude Archived items from main view by default?
    // The spec didn't specify, but usually they are hidden.
    // I'll keep them for now as per spec "Dashboard displays all items".
    return matchesSearch && matchesType
  })

  return (
    <div className="flex flex-col gap-4">
      <SearchFilters 
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="learning-items-grid">
        {filteredItems?.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      {filteredItems?.length === 0 && (
        <div className="text-center py-10 text-muted-foreground border rounded-lg border-dashed">
            No items found matching your search.
        </div>
      )}
    </div>
  )
}