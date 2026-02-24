/**
 * @fileoverview StatCard component
 * @description A card component for displaying key metrics with icons and optional click interaction
 * 
 * @example
 * ```tsx
 * <StatCard
 *   icon={<Plane />}
 *   value="12"
 *   label="Total Aircraft"
 *   trend={{ value: '+2', positive: true }}
 *   onClick={() => setActiveTab('aircraft')}
 * />
 * ```
 */

import { ReactNode } from 'react'

/**
 * Trend indicator configuration
 */
interface StatTrend {
  /** Trend value (e.g., '+5', '-10') */
  value: string
  /** Whether the trend is positive (green) or negative (red) */
  positive: boolean
}

/**
 * Props for StatCard component
 */
interface StatCardProps {
  /** Icon displayed in the card */
  icon: ReactNode
  /** Main metric value */
  value: string | number
  /** Label describing the metric */
  label: string
  /** Optional trend indicator */
  trend?: StatTrend
  /** Click handler for interactivity */
  onClick?: () => void
  /** Optional subtitle text */
  subtitle?: string
  /** Color variant for the icon background */
  variant?: 'default' | 'success' | 'warning' | 'danger'
  /** Additional className */
  className?: string
}

/**
 * StatCard - Display key metrics in a card format
 * Supports icons, trends, click interaction, and color variants
 */
export default function StatCard({
  icon,
  value,
  label,
  trend,
  onClick,
  subtitle,
  variant = 'default',
  className = ''
}: StatCardProps) {
  // Color variants for icon background
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-destructive/10 text-destructive'
  }

  const variantClass = variantStyles[variant]

  return (
    <Card
      className={`
        ${onClick ? 'cursor-pointer transition-all hover:shadow-md hover:border-primary/50' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className={`rounded-full p-2 ${variantClass}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(trend || subtitle) && (
          <p className="text-xs text-muted-foreground mt-1">
            {trend ? (
              <span className={trend.positive ? 'text-green-600' : 'text-destructive'}>
                {trend.value}
              </span>
            ) : null}
            {trend && subtitle ? ' · ' : ''}
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Import Card components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
