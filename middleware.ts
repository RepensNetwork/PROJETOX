import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const SECURITY_HEADERS: [string, string][] = [
  ["X-Frame-Options", "DENY"],
  ["X-Content-Type-Options", "nosniff"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(self), microphone=(self), geolocation=(), browsing-topics=()"],
]

function applySecurityHeaders(res: NextResponse): NextResponse {
  SECURITY_HEADERS.forEach(([key, value]) => res.headers.set(key, value))
  return res
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const getClientIp = () => {
    const forwarded = request.headers.get("x-forwarded-for")
    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }
    const realIp = request.headers.get("x-real-ip")
    if (realIp) return realIp
    return request.ip ?? null
  }

  const routePermissions = [
    { prefix: "/dashboard", key: "dashboard" },
    { prefix: "/emails", key: "inbox" },
    { prefix: "/motorista", key: "transportes" },
    { prefix: "/reservas", key: "reservas" },
    { prefix: "/navios", key: "navios" },
    { prefix: "/escalas", key: "escalas" },
    { prefix: "/demandas", key: "demandas" },
    { prefix: "/membros", key: "membros" },
    { prefix: "/intake", key: "intake" },
    { prefix: "/perfil", key: "perfil" },
    { prefix: "/sistema", key: "sistema" },
    { prefix: "/admin", key: "admin" },
    { prefix: "/logs", key: "logs" },
  ]

  const resolvePermissionKey = (path: string) => {
    const match = routePermissions.find((route) => path.startsWith(route.prefix))
    return match?.key || null
  }

  /** Ordem de prioridade para página inicial do usuário (primeira tela com acesso) */
  const landingOrder: { key: string; path: string }[] = [
    { key: "dashboard", path: "/dashboard" },
    { key: "intake", path: "/intake" },
    { key: "inbox", path: "/emails" },
    { key: "transportes", path: "/motorista" },
    { key: "reservas", path: "/reservas" },
    { key: "escalas", path: "/escalas" },
    { key: "demandas", path: "/demandas" },
    { key: "navios", path: "/navios" },
    { key: "membros", path: "/membros" },
    { key: "logs", path: "/logs" },
    { key: "perfil", path: "/perfil" },
  ]

  const getFirstAllowedPath = (membro: { is_admin?: boolean; allowed_pages?: string[] | null }) => {
    if (membro.is_admin) return "/dashboard"
    const allowed = Array.isArray(membro.allowed_pages) ? membro.allowed_pages : []
    const first = landingOrder.find((item) => allowed.includes(item.key))
    return first?.path ?? "/perfil"
  }

  // Rotas públicas (warmup é pós-login, exige autenticação)
  const publicRoutes = ["/login", "/auth/callback", "/forgot-password", "/reset-password"]
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Se não está autenticado e não é rota pública, redirecionar para login
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return applySecurityHeaders(NextResponse.redirect(url))
  }

  if (user) {
    const { data: membro, error: membroError } = await supabase
      .from("membros")
      .select("id, email, ativo, is_admin, allowed_pages, session_ip")
      .eq("email", user.email)
      .single()

    if (membroError || !membro) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("error", "member_missing")
      return applySecurityHeaders(NextResponse.redirect(url))
    }

    if (!membro.ativo) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("error", "inactive")
      return applySecurityHeaders(NextResponse.redirect(url))
    }

    // Raiz ou login: redirecionar para a primeira tela que o usuário tem acesso
    const firstAllowed = getFirstAllowedPath(membro)
    if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/login") {
      const url = request.nextUrl.clone()
      url.pathname = firstAllowed
      return applySecurityHeaders(NextResponse.redirect(url))
    }

    const currentIp = getClientIp()
    if (currentIp && !membro.session_ip) {
      await supabase
        .from("membros")
        .update({ session_ip: currentIp, last_login_at: new Date().toISOString() })
        .eq("id", membro.id)
    }

    if (!membro.is_admin) {
      const permissionKey = resolvePermissionKey(request.nextUrl.pathname)
      if (permissionKey) {
        if (permissionKey === "perfil") {
          return applySecurityHeaders(response)
        }
        const allowed = Array.isArray(membro.allowed_pages) ? membro.allowed_pages : []
        if (!allowed.includes(permissionKey)) {
          const url = request.nextUrl.clone()
          url.pathname = getFirstAllowedPath(membro)
          url.searchParams.set("denied", "1")
          return applySecurityHeaders(NextResponse.redirect(url))
        }
      }
    }
  }

  return applySecurityHeaders(response)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
