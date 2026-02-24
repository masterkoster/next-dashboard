/**
 * @fileoverview PageContainer component
 * @description A standardized wrapper component for module pages
 * 
 * @example
 * ```tsx
 * <PageContainer>
 *   <ModuleHeader title="Dashboard" />
 *   <StatsGrid>...</StatsGrid>
 *   <DataTable>...</DataTable>
 * </PageContainer>
 * ```
 */

import { ReactNode } from 'react'

/**
 * Props for PageContainer component
 */
interface PageContainerProps {
  /** Page content */
  children: ReactNode
  /** Optional full width */
  fluid?: boolean
  /** Additional padding */
  padding?: boolean
  /** Additional className */
  className?: string
}

/**
 * PageContainer - Standard wrapper for module pages
 * Provides consistent padding and layout
 */
export default function PageContainer({
  children,
  fluid = false,
  padding = true,
  className = ''
}: PageContainerProps) {
  return (
    <main className={`
      flex-1 flex flex-col bg-background
      ${padding ? 'p-4 lg:p-6' : ''}
      ${fluid ? '' : 'max-w-[1800px] mx-auto w-full'}
      ${className}
    `}>
      {children}
    </main>
  )
}
