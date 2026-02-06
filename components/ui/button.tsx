import * as React from 'react'
import { cn } from '@/lib/utils'

// Tenta importar dependências, mas tem fallback
let Slot: any = 'button'
let cva: any
let VariantProps: any

try {
  const slotModule = require('@radix-ui/react-slot')
  Slot = slotModule.Slot || 'button'
} catch {
  Slot = 'button'
}

try {
  const cvaModule = require('class-variance-authority')
  cva = cvaModule.cva
  VariantProps = cvaModule.VariantProps
} catch {
  // Fallback simples
  cva = () => () => ''
  VariantProps = {}
}

// Variantes alinhadas ao design system (Figma-style)
function getButtonClasses(variant: string = 'default', size: string = 'default'): string {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50'
  
  const variants: Record<string, string> = {
    default: 'bg-primary text-primary-foreground shadow-elevation-1 hover:bg-primary/90 hover:shadow-elevation-2 active:scale-[0.98]',
    destructive: 'bg-destructive text-destructive-foreground shadow-elevation-1 hover:bg-destructive/90 active:scale-[0.98]',
    outline: 'border border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]',
    ghost: 'text-foreground hover:bg-muted hover:text-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  }
  
  const sizes: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-lg px-3 text-xs',
    lg: 'h-11 rounded-xl px-6 text-base',
    icon: 'h-10 w-10 rounded-lg',
  }
  
  return `${base} ${variants[variant] || variants.default} ${sizes[size] || sizes.default}`
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild && Slot !== 'button' ? Slot : 'button'
    return (
      <Comp
        className={cn(getButtonClasses(variant, size), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
