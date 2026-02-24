/**
 * @fileoverview DataTable component
 * @description A sortable, paginated data table component
 * 
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'date', header: 'Date', sortable: true },
 *   ]}
 *   data={items}
 *   onSort={(key, dir) => {}}
 *   pagination={{ page: 1, total: 100, pageSize: 10 }}
 * />
 * ```
 */

import { useState, useMemo, ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Column configuration
 */
interface Column<T> {
  /** Unique key for the column */
  key: string
  /** Header label */
  header: string
  /** Whether column is sortable */
  sortable?: boolean
  /** Custom render function */
  render?: (item: T) => ReactNode
  /** Column width */
  width?: string
  /** Text alignment */
  align?: 'left' | 'center' | 'right'
}

/**
 * Pagination configuration
 */
interface Pagination {
  /** Current page number (1-indexed) */
  page: number
  /** Total number of items */
  total: number
  /** Number of items per page */
  pageSize: number
}

/**
 * Sort configuration
 */
interface SortConfig {
  /** Column key to sort by */
  key: string
  /** Sort direction */
  direction: 'asc' | 'desc'
}

/**
 * Props for DataTable component
 */
interface DataTableProps<T> {
  /** Column definitions */
  columns: Column<T>[]
  /** Data items to display */
  data: T[]
  /** Sort configuration */
  sort?: SortConfig
  /** Callback when sort changes */
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  /** Pagination configuration */
  pagination?: Pagination
  /** Callback when page changes */
  onPageChange?: (page: number) => void
  /** Callback when row is clicked */
  onRowClick?: (item: T) => void
  /** Show header row */
  showHeader?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Additional className */
  className?: string
}

/**
 * DataTable - Sortable, paginated table component
 * Provides consistent table UI across modules
 */
export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  sort,
  onSort,
  pagination,
  onPageChange,
  onRowClick,
  showHeader = true,
  emptyMessage = 'No data available',
  className = ''
}: DataTableProps<T>) {
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1

  const handleSort = (key: string) => {
    if (!onSort) return
    
    const newDirection = sort?.key === key && sort.direction === 'asc' ? 'desc' : 'asc'
    onSort(key, newDirection)
  }

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item)
    }
    return String(item[column.key] ?? '-')
  }

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-left'
    }
  }

  return (
    <div className={className}>
      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            {showHeader && (
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`
                        px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground
                        ${column.sortable ? 'cursor-pointer hover:text-foreground' : ''}
                        ${alignClass(column.align)}
                        ${column.width || ''}
                      `}
                      onClick={() => column.sortable && handleSort(column.key)}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      <div className={`flex items-center gap-1 ${column.align === 'right' ? 'justify-end' : column.align === 'center' ? 'justify-center' : ''}`}>
                        {column.header}
                        {column.sortable && sort?.key === column.key && (
                          sort.direction === 'asc' 
                            ? <ChevronUp className="h-3 w-3" />
                            : <ChevronDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            )}

            {/* Body */}
            <tbody className="divide-y divide-border">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    className={`
                      hover:bg-muted/50 transition-colors
                      ${onRowClick ? 'cursor-pointer' : ''}
                    `}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm ${alignClass(column.align)}`}
                      >
                        {renderCell(item, column)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-card">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange?.(pagination.page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {pagination.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= totalPages}
              onClick={() => onPageChange?.(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
