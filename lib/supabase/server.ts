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

// Mock client para build sem Supabase (Vercel sem env): auth.getUser + chains .eq/.neq/.order etc. devem existir
function createMockClient() {
  const empty = { data: [] as any[], error: null }
  const emptySingle = { data: null, error: null }
  const makeChain = (result: { data: any; error: null } = empty) => {
    const chain: any = {
      then(resolve: (v: any) => void) {
        resolve(result)
        return chain
      },
      catch() {
        return chain
      },
      single: () => emptySingle,
      eq: () => chain,
      neq: () => chain,
      or: () => chain,
      in: () => chain,
      order: () => chain,
      limit: () => chain,
      lt: () => chain,
      gte: () => chain,
      data: result.data,
      error: result.error,
    }
    return chain
  }
  const auth = {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
  }
  return {
    auth,
    from: (_table: string) => ({
      select: (_columns?: string) => makeChain(),
      insert: (_data: any) => ({
        select: () => ({ single: () => emptySingle }),
      }),
      update: (_data: any) => ({
        eq: () => ({ error: null }),
      }),
      delete: () => ({
        eq: () => ({ error: null }),
      }),
    }),
  } as any
}
