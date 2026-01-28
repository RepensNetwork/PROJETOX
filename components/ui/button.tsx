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

// Função helper para variantes
function getButtonClasses(variant: string = 'default', size: string = 'default'): string {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50'
  
  const variants: Record<string, string> = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    outline: 'border border-gray-700 bg-transparent text-gray-200 hover:bg-gray-800 hover:text-white',
    secondary: 'bg-gray-800 text-gray-200 hover:bg-gray-700',
    ghost: 'hover:bg-gray-800 text-gray-200 hover:text-white',
    link: 'text-blue-400 underline-offset-4 hover:underline',
  }
  
  const sizes: Record<string, string> = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
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
