// Tenta usar as bibliotecas, mas tem fallback caso não estejam instaladas
let clsx: any
let twMerge: any

try {
  clsx = require('clsx')
  twMerge = require('tailwind-merge')
} catch {
  // Fallback simples se as dependências não estiverem instaladas
  clsx = (...args: any[]) => args.filter(Boolean).join(' ')
  twMerge = (str: string) => str
}

export function cn(...inputs: any[]): string {
  try {
    return twMerge(clsx(...inputs))
  } catch {
    // Fallback caso algo dê errado
    return inputs.filter(Boolean).join(' ')
  }
}
