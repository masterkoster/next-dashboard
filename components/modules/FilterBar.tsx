/**
 * @fileoverview FilterBar component
 * @description A flexible filter bar with common filter controls
 * 
 * @example
 * ```tsx
 * <FilterBar
 *   filters={[
 *     { type: 'select', label: 'Status', options: [...], value, onChange },
 *     { type: 'date', label: 'From', value, onChange },
 *   ]}
 *   onReset={() => {}}
 * />
 * ```
 */

import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

/**
 * Filter configuration types
 */
type FilterType = 'select' | 'date' | 'text' | 'number' | 'daterange'

interface BaseFilter {
  id: string
  label: string
  placeholder?: string
}

interface SelectFilter extends BaseFilter {
  type: 'select'
  options: { value: string; label: string }[]
}

interface DateFilter extends BaseFilter {
  type: 'date'
}

interface TextFilter extends BaseFilter {
  type: 'text'
}

interface NumberFilter extends BaseFilter {
  type: 'number'
  min?: number
  max?: number
}

type FilterConfig = SelectFilter | DateFilter | TextFilter | NumberFilter

/**
 * Props for FilterBar component
 */
interface FilterBarProps {
  /** Array of filter configurations */
  filters: FilterConfig[]
  /** Current filter values */
  values: Record<string, string | number | undefined>
  /** Callbacks for filter changes */
  onChange: (id: string, value: string | number | undefined) => void
  /** Reset all filters */
  onReset?: () => void
  /** Show reset button */
  showReset?: boolean
  /** Additional className */
  className?: string
  /** Layout direction */
  direction?: 'horizontal' | 'vertical'
}

/**
 * FilterBar - Common filter controls for module pages
 * Supports select, date, text, and number filters
 */
export default function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  showReset = true,
  className = '',
  direction = 'horizontal'
}: FilterBarProps) {
  const hasActiveFilters = filters.some(f => values[f.id])

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.id]

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(newValue) => onChange(filter.id, newValue || undefined)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={filter.placeholder || filter.label} />
            </SelectTrigger>
            <SelectContent>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value as string || ''}
            onChange={(e) => onChange(filter.id, e.target.value || undefined)}
            className="w-[180px]"
          />
        )

      case 'text':
        return (
          <Input
            type="text"
            value={value as string || ''}
            onChange={(e) => onChange(filter.id, e.target.value || undefined)}
            placeholder={filter.placeholder}
            className="w-[180px]"
          />
        )

      case 'number':
        return (
          <Input
            type="number"
            min={filter.min}
            max={filter.max}
            value={value as string || ''}
            onChange={(e) => onChange(filter.id, e.target.value ? Number(e.target.value) : undefined)}
            placeholder={filter.placeholder}
            className="w-[120px]"
          />
        )

      default:
        return null
    }
  }

  return (
    <div
      className={`
        flex flex-wrap items-center gap-3 p-3 bg-card border border-border rounded-lg
        ${direction === 'horizontal' ? 'flex-row' : 'flex-col'}
        ${className}
      `}
    >
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground whitespace-nowrap">
            {filter.label}:
          </label>
          {renderFilter(filter)}
        </div>
      ))}

      {showReset && hasActiveFilters && onReset && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="ml-auto"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
