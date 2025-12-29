'use client'

interface SearchFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  isParsing?: boolean
}

export function SearchFilters({
  search,
  onSearchChange,
  isParsing = false,
}: SearchFiltersProps) {
  return (
    <div className="mb-6">
      <div className="relative">
        <label htmlFor="search" className="sr-only">Search</label>
        <input
          id="search"
          type="text"
          placeholder='Search items... (e.g., "completed books", "in progress courses", "items with 50% progress", "books only")'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full p-2 border rounded-md pr-10"
        />
        {isParsing && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
