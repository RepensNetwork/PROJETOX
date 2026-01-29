import { NextResponse } from "next/server"
import { syncEmailsImap } from "@/app/actions/emails"

export async function POST() {
  try {
    const result = await syncEmailsImap()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          imported: result.imported,
          fetched: result.fetched ?? 0,
          failed: result.failed ?? 0,
          error: result.error || "Falha ao sincronizar emails.",
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imported: result.imported,
      fetched: result.fetched ?? 0,
      failed: result.failed ?? 0,
      message: result.message,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao sincronizar emails."
    return NextResponse.json({ success: false, imported: 0, error: message }, { status: 500 })
  }
}
