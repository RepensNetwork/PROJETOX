"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createBrowserClient } from "@/lib/supabase/client"

// Esta função deve ser executada UMA VEZ para criar o usuário inicial
// Pode ser chamada via API route ou executada manualmente
export async function criarUsuarioInicial() {
  const supabase = await createClient()

  // 1. Verificar se o membro já existe
  const { data: membroExistente } = await supabase
    .from("membros")
    .select("*")
    .eq("email", "mateusfriese@hotmail.com")
    .single()

  if (!membroExistente) {
    // Criar membro na tabela membros
    const { data: novoMembro, error: membroError } = await supabase
      .from("membros")
      .insert({
        nome: "Mateus Friese",
        email: "mateusfriese@hotmail.com",
        ativo: true,
      })
      .select()
      .single()

    if (membroError) {
      return {
        success: false,
        error: `Erro ao criar membro: ${membroError.message}`,
      }
    }
  }

  // 2. Criar usuário no Supabase Auth
  // NOTA: Isso precisa ser feito via Supabase Admin API ou Dashboard
  // Por enquanto, retornamos instruções

  return {
    success: true,
    message: "Membro criado com sucesso! Agora crie o usuário no Supabase Auth.",
    instrucoes: [
      "1. Acesse o Supabase Dashboard",
      "2. Vá em Authentication > Users",
      "3. Clique em 'Add User'",
      "4. Preencha:",
      "   - Email: mateusfriese@hotmail.com",
      "   - Password: Brf@2016",
      "   - Auto Confirm User: ✅",
      "5. Clique em 'Create User'",
    ],
  }
}
