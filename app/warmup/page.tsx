"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { PostLoginWarmup } from "@/components/post-login-warmup"
import type { Membro } from "@/lib/types/database"

const LANDING_ORDER: { key: string; href: string }[] = [
  { key: "dashboard", href: "/dashboard" },
  { key: "intake", href: "/intake" },
  { key: "inbox", href: "/emails" },
  { key: "transportes", href: "/motorista" },
  { key: "reservas", href: "/reservas" },
  { key: "escalas", href: "/escalas" },
  { key: "demandas", href: "/demandas" },
  { key: "navios", href: "/navios" },
  { key: "membros", href: "/membros" },
  { key: "logs", href: "/logs" },
  { key: "perfil", href: "/perfil" },
]

function getFirstAllowedHref(membro: Membro | null): string {
  if (!membro) return "/dashboard"
  if (membro.is_admin) return "/dashboard"
  const allowed = Array.isArray(membro.allowed_pages) ? membro.allowed_pages : []
  const first = LANDING_ORDER.find((item) => allowed.includes(item.key))
  return first?.href ?? "/perfil"
}

function getHrefsToPrefetch(membro: Membro | null): string[] {
  if (!membro) return ["/dashboard"]
  if (membro.is_admin) return LANDING_ORDER.map((o) => o.href)
  const allowed = Array.isArray(membro.allowed_pages) ? membro.allowed_pages : []
  return LANDING_ORDER.filter((item) => allowed.includes(item.key)).map((o) => o.href)
}

const MIN_WARMUP_MS = 1400

export default function WarmupPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function run() {
      const start = Date.now()
      const supabase = createClient()

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user || cancelled) {
        if (!cancelled) router.replace("/login")
        return
      }

      let membro: Membro | null = null
      const { data: membroData } = await supabase
        .from("membros")
        .select("*")
        .ilike("email", user.email ?? "")
        .single()

      if (membroData) membro = membroData as Membro

      const hrefs = getHrefsToPrefetch(membro)
      for (const href of hrefs) {
        if (cancelled) break
        router.prefetch(href)
      }

      const elapsed = Date.now() - start
      const remaining = Math.max(0, MIN_WARMUP_MS - elapsed)
      await new Promise((r) => setTimeout(r, remaining))

      if (cancelled) return
      const target = getFirstAllowedHref(membro)
      router.replace(target)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [router])

  return <PostLoginWarmup />
}
