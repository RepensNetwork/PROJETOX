import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null
  try {
    cookieStore = await cookies()
  } catch {
    // cookies() pode falhar em alguns contextos (ex.: geração estática)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Se não houver credenciais, retornar um cliente mock
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase não configurado!')
    console.warn('📝 Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local')
    console.warn('📖 Veja CONFIGURAR-SUPABASE.md para instruções completas')
    console.warn('🔧 Usando mock client (funcionalidade limitada)')
    return createMockClient()
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore?.getAll?.() ?? []
        },
        setAll(cookiesToSet) {
          if (!cookieStore) return
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore!.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Mock client para desenvolvimento sem Supabase
function createMockClient() {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: () => ({ 
          single: () => ({ data: null, error: null }),
          data: [],
          error: null,
        }),
        neq: () => ({ 
          order: () => ({ 
            limit: () => ({ data: [], error: null }),
            data: [],
            error: null,
          }),
          data: [],
          error: null,
        }),
        in: () => ({ 
          order: () => ({ data: [], error: null }),
          data: [],
          error: null,
        }),
        or: () => ({ 
          order: () => ({ 
            limit: () => ({ data: [], error: null }),
            data: [],
            error: null,
          }),
          data: [],
          error: null,
        }),
        order: (column: string, options?: { ascending?: boolean }) => ({
          limit: (count: number) => ({ data: [], error: null }),
          data: [],
          error: null,
        }),
        limit: (count: number) => ({ data: [], error: null }),
        data: [],
        error: null,
      }),
      insert: (data: any) => ({
        select: (columns?: string) => ({
          single: () => ({ data: null, error: null }),
        }),
      }),
      update: (data: any) => ({
        eq: () => ({ error: null }),
      }),
      delete: () => ({
        eq: () => ({ error: null }),
      }),
    }),
  } as any
}
