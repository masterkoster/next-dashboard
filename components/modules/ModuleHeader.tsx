/**
 * @fileoverview ModuleHeader component
 * @description A standardized header component for module pages with title, breadcrumbs, and action buttons
 * 
 * @example
 * ```tsx
 * <ModuleHeader
 *   title="Flight Planner"
 *   description="Plan your routes"
 *   breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Modules' }]}
 *   actions={<Button>Add New</Button>}
 * />
 * ```
 */

import { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/**
 * Props for ModuleHeader component
 */
interface ModuleHeaderProps {
  /** Main page title */
  title: string
  /** Optional description text */
  description?: string
  /** Breadcrumb navigation items */
  breadcrumbs?: { label: string; href?: string }[]
  /** Action buttons (right side) */
  actions?: ReactNode
  /** Optional tabs navigation */
  tabs?: { id: string; label: string; href?: string; active?: boolean }[]
  /** Additional className */
  className?: string
}

/**
 * ModuleHeader - Standard header for module pages
 * Provides consistent styling for title, breadcrumbs, and actions
 */
export default function ModuleHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  tabs,
  className = ''
}: ModuleHeaderProps) {
  return (
    <header className={`border-b border-border bg-card ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="px-4 lg:px-6 py-2">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3" />}
                {crumb.href ? (
                  <Link 
                    href={crumb.href} 
                    className="hover:text-foreground transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Title and Actions */}
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-muted-foreground text-sm mt-1">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>

      {/* Tabs */}
      {tabs && tabs.length > 0 && (
        <div className="px-4 lg:px-6">
          <div className="flex gap-1 border-b border-border">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href || '#'}
                className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                  tab.active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
