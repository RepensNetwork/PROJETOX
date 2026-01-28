// Versão simplificada caso clsx e tailwind-merge não estejam instalados
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ')
}
