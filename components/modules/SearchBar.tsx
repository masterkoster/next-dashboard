/**
 * @fileoverview SearchBar component
 * @description A debounced search input with results dropdown
 * 
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="Search airports..."
 *   value={query}
 *   onChange={setQuery}
 *   results={airports}
 *   onSelect={(airport) => addWaypoint(airport)}
 *   renderResult={(airport) => (
 *     <div>{airport.icao} - {airport.name}</div>
 *   )}
 * />
 * ```
 */

import { useState, useCallback, useRef, useEffect, ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

/**
 * Generic result item type
 */
interface SearchResult {
  /** Unique identifier */
  id: string | number
  /** Display label */
  label?: string
  [key: string]: unknown
}

/**
 * Props for SearchBar component
 */
interface SearchBarProps<T extends SearchResult> {
  /** Current search value */
  value: string
  /** Callback when value changes (debounced) */
  onChange: (value: string) => void
  /** Search results to display */
  results: T[]
  /** Callback when result is selected */
  onSelect: (result: T) => void
  /** Render function for result items */
  renderResult: (result: T) => ReactNode
  /** Placeholder text */
  placeholder?: string
  /** Debounce delay in ms */
  debounceMs?: number
  /** Show clear button */
  clearable?: boolean
  /** Callback when clear is clicked */
  onClear?: () => void
  /** Loading state */
  loading?: boolean
  /** Additional className */
  className?: string
  /** Input id */
  inputId?: string
}

/**
 * SearchBar - Debounced search with results dropdown
 * Provides consistent search UI across modules
 */
export default function SearchBar<T extends SearchResult>({
  value,
  onChange,
  results,
  onSelect,
  renderResult,
  placeholder = 'Search...',
  debounceMs = 300,
  clearable = true,
  onClear,
  loading = false,
  className = '',
  inputId
}: SearchBarProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      onChange(newValue)
    }, debounceMs)
  }, [onChange, debounceMs])

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
    onClear?.()
  }, [onChange, onClear])

  // Handle result selection
  const handleSelect = useCallback((result: T) => {
    onSelect(result)
    setLocalValue('')
    onChange('')
    setIsOpen(false)
  }, [onSelect, onChange])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show dropdown when there are results
  useEffect(() => {
    if (results.length > 0 && localValue.length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [results, localValue])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id={inputId}
            type="text"
            value={localValue}
            onChange={handleChange}
            onFocus={() => localValue.length >= 2 && results.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="pl-9 pr-8"
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}
        </div>
        {clearable && localValue && !loading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b border-border last:border-0"
              >
                {renderResult(result)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
