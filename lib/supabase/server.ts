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

// Mock client para build/desenvolvimento sem Supabase (evita quebrar prerender quando env não está configurado)
function createMockClient() {
  const empty = { data: [] as any[], error: null }
  const emptySingle = { data: null, error: null }
  const thenable = (result: { data: any; error: null } = empty) => {
    const chain: any = {
      then(res: (v: any) => void) {
        res(result)
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
      ...result,
    }
    return chain
  }
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    from: (_table: string) => ({
      select: (_columns?: string) => thenable(),
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
