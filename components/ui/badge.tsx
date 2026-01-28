import * as React from 'react'
import { cn } from '@/lib/utils'

function getBadgeClasses(variant: string = 'default'): string {
  const base = 'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
  
  const variants: Record<string, string> = {
    default: 'border-transparent bg-muted text-muted-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    success: 'border-transparent bg-success text-success-foreground',
    warning: 'border-transparent bg-warning text-warning-foreground',
    primary: 'border-transparent bg-primary text-primary-foreground',
    outline: 'text-foreground border-border',
  }
  
  return `${base} ${variants[variant] || variants.default}`
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'primary' | 'outline'
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div className={cn(getBadgeClasses(variant), className)} {...props} />
  )
}

export { Badge }
