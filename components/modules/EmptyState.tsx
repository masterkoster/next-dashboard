/**
 * @fileoverview EmptyState component
 * @description A placeholder component for when there's no data to display
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Plane />}
 *   title="No aircraft found"
 *   description="Add your first aircraft to get started"
 *   action={<Button onClick={addAircraft}>Add Aircraft</Button>}
 * />
 * ```
 */

import { ReactNode } from 'react'

/**
 * Props for EmptyState component
 */
interface EmptyStateProps {
  /** Icon to display */
  icon?: ReactNode
  /** Main title */
  title: string
  /** Optional description */
  description?: string
  /** Optional action button */
  action?: ReactNode
  /** Full custom content */
  children?: ReactNode
  /** Additional className */
  className?: string
}

/**
 * EmptyState - Placeholder for empty data states
 * Provides consistent empty state UI across modules
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  children,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {children}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}
