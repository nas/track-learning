'use client'

import { LearningItemType } from "@/lib/schemas/learning-item"

interface SearchFiltersProps {
  search: string
  typeFilter: string
  onSearchChange: (value: string) => void
  onTypeFilterChange: (value: string) => void
}

export function SearchFilters({
  search,
  typeFilter,
  onSearchChange,
  onTypeFilterChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="search" className="sr-only">Search</label>
        <input
          id="search"
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <div className="w-full md:w-48">
        <label htmlFor="type-filter" className="sr-only">Filter by Type</label>
        <select
          id="type-filter"
          aria-label="Filter by Type"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          <option value="All">All Types</option>
          {LearningItemType.options.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
