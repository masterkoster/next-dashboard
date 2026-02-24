/**
 * @fileoverview ModuleTabs component
 * @description A tab navigation component for module pages
 * 
 * @example
 * ```tsx
 * <ModuleTabs
 *   tabs={[
 *     { id: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
 *     { id: 'details', label: 'Details', icon: <FileText /> },
 *   ]}
 *   activeTab="overview"
 *   onChange={setActiveTab}
 * />
 * ```
 */

import { ReactNode } from 'react'
import Link from 'next/link'

/**
 * Tab configuration
 */
interface Tab {
  /** Unique tab identifier */
  id: string
  /** Tab label */
  label: string
  /** Optional icon */
  icon?: ReactNode
  /** Optional href for link tabs */
  href?: string
  /** Badge/count to display */
  badge?: string | number
}

/**
 * Props for ModuleTabs component
 */
interface ModuleTabsProps {
  /** Array of tab configurations */
  tabs: Tab[]
  /** Currently active tab */
  activeTab?: string
  /** Callback when tab changes */
  onChange?: (tabId: string) => void
  /** Optional align */
  align?: 'left' | 'center' | 'right'
  /** Show border under tabs */
  border?: boolean
  /** Additional className */
  className?: string
}

/**
 * ModuleTabs - Tab navigation for module pages
 * Provides consistent tab UI across modules
 */
export default function ModuleTabs({
  tabs,
  activeTab,
  onChange,
  align = 'left',
  border = true,
  className = ''
}: ModuleTabsProps) {
  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  const handleClick = (tab: Tab) => {
    if (tab.href) return // Let Next.js Link handle it
    onChange?.(tab.id)
  }

  const isActive = (tab: Tab) => {
    if (tab.href) return false
    return activeTab === tab.id
  }

  return (
    <div className={`border-b ${border ? 'border-border' : 'border-transparent'} ${className}`}>
      <div className={`flex ${alignClass[align]} gap-1`}>
        {tabs.map((tab) => {
          const active = isActive(tab)
          
          // If href is provided, use Link
          if (tab.href) {
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative
                  ${active 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`
                    ml-1 px-1.5 py-0.5 text-xs rounded-full
                    ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                  `}>
                    {tab.badge}
                  </span>
                )}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            )
          }

          // Otherwise use button
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab)}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative
                ${active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`
                  ml-1 px-1.5 py-0.5 text-xs rounded-full
                  ${active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                `}>
                  {tab.badge}
                </span>
              )}
              {active && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
