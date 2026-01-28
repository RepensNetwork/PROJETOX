import { NextResponse } from "next/server"
import { criarUsuarioInicial } from "@/app/actions/setup"

// Esta rota pode ser chamada uma vez para criar o usuário inicial
// Acesse: http://localhost:3000/api/setup
export async function GET() {
  try {
    const result = await criarUsuarioInicial()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
