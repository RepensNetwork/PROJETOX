"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, MoreVertical, Edit2, Trash2, AtSign, Check, CheckCheck } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { sendMensagem, deleteMensagem, updateMensagem } from "@/app/actions/mensagens"
import { marcarMensagemComoLida } from "@/app/actions/leituras"
import type { Mensagem, Membro } from "@/lib/types/database"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface EscalaChatProps {
  escalaId: string
  membroAtual: Membro
  mensagensIniciais: (Mensagem & { autor: Membro })[]
  todosMembros: Membro[]
}

// Função para renderizar menções no texto
function renderizarMencoes(texto: string, membros: Membro[]): React.ReactNode {
  const partes: React.ReactNode[] = []
  const regex = /@(\w+)/g
  let ultimoIndex = 0
  let match

  while ((match = regex.exec(texto)) !== null) {
    // Adicionar texto antes da menção
    if (match.index > ultimoIndex) {
      partes.push(texto.substring(ultimoIndex, match.index))
    }

    const mencionado = match[1]
    const membro = membros.find(m =>
      m.nome.toLowerCase().includes(mencionado.toLowerCase()) ||
      m.id === mencionado ||
      m.email.toLowerCase().includes(mencionado.toLowerCase())
    )

    if (membro) {
      partes.push(
        <span
          key={match.index}
          className="font-semibold text-primary bg-primary/20 px-1 rounded"
        >
          @{membro.nome}
        </span>
      )
    } else {
      partes.push(`@${mencionado}`)
    }

    ultimoIndex = match.index + match[0].length
  }

  // Adicionar texto restante
  if (ultimoIndex < texto.length) {
    partes.push(texto.substring(ultimoIndex))
  }

  return partes.length > 0 ? partes : texto
}

export function EscalaChat({ escalaId, membroAtual, mensagensIniciais, todosMembros }: EscalaChatProps) {
  const [mensagens, setMensagens] = useState<(Mensagem & { autor: Membro })[]>(mensagensIniciais)
  const [novaMensagem, setNovaMensagem] = useState("")
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mensagemToDelete, setMensagemToDelete] = useState<string | null>(null)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const [cursorPosition, setCursorPosition] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionDropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Filtrar membros para autocomplete
  const filteredMembros = todosMembros.filter(membro =>
    membro.nome.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    membro.email.toLowerCase().includes(mentionQuery.toLowerCase())
  ).filter(membro => membro.id !== membroAtual.id)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensagens])

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [editingId])

  // Marcar mensagens como lidas quando visualizadas
  useEffect(() => {
    const marcarComoLidas = async () => {
      for (const mensagem of mensagens) {
        if (mensagem.membro_id !== membroAtual.id) {
          await marcarMensagemComoLida(mensagem.id, membroAtual.id)
        }
      }
    }
    marcarComoLidas()
  }, [mensagens, membroAtual.id])

  // Atualizar posição do cursor
  const updateCursorPosition = () => {
    if (textareaRef.current) {
      setCursorPosition(textareaRef.current.selectionStart)
    }
  }

  // Detectar @ no texto
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursorPos = e.target.selectionStart
    setNovaMensagem(value)
    setCursorPosition(cursorPos)

    // Verificar se há @ antes do cursor
    const textBeforeCursor = value.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      // Verificar se não há espaço após o @
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionQuery(textAfterAt)
        setShowMentions(true)
        setSelectedMentionIndex(0)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  const inserirMencao = (membro: Membro) => {
    if (!textareaRef.current) return

    const textBeforeCursor = novaMensagem.substring(0, cursorPosition)
    const textAfterCursor = novaMensagem.substring(cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")
    
    if (lastAtIndex !== -1) {
      const beforeAt = novaMensagem.substring(0, lastAtIndex)
      const newText = `${beforeAt}@${membro.nome} ${textAfterCursor}`
      setNovaMensagem(newText)
      setShowMentions(false)
      setMentionQuery("")
      
      // Focar no textarea e ajustar cursor
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = lastAtIndex + membro.nome.length + 2 // @ + nome + espaço
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    }
  }

  const handleSend = async () => {
    if (!novaMensagem.trim() || loading) return

    const conteudo = novaMensagem.trim()
    setNovaMensagem("")
    setShowMentions(false)
    setLoading(true)

    try {
      const result = await sendMensagem(escalaId, membroAtual.id, conteudo, todosMembros)
      if (result.success && result.mensagem) {
        setMensagens([...mensagens, result.mensagem])
        router.refresh()
      } else {
        alert(result.error || "Erro ao enviar mensagem")
        setNovaMensagem(conteudo)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Erro ao enviar mensagem")
      setNovaMensagem(conteudo)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (mensagemId: string) => {
    if (!editContent.trim()) {
      setEditingId(null)
      setEditContent("")
      return
    }

    try {
      const result = await updateMensagem(mensagemId, editContent)
      if (result.success) {
        setMensagens(mensagens.map(m => 
          m.id === mensagemId 
            ? { ...m, conteudo: editContent.trim(), updated_at: new Date().toISOString() }
            : m
        ))
        setEditingId(null)
        setEditContent("")
        router.refresh()
      } else {
        alert(result.error || "Erro ao editar mensagem")
      }
    } catch (error) {
      console.error("Error updating message:", error)
      alert("Erro ao editar mensagem")
    }
  }

  const handleDelete = async () => {
    if (!mensagemToDelete) return

    try {
      const result = await deleteMensagem(mensagemToDelete)
      if (result.success) {
        setMensagens(mensagens.filter(m => m.id !== mensagemToDelete))
        setMensagemToDelete(null)
        setDeleteDialogOpen(false)
        router.refresh()
      } else {
        alert(result.error || "Erro ao deletar mensagem")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      alert("Erro ao deletar mensagem")
    }
  }

  const startEdit = (mensagem: Mensagem & { autor: Membro }) => {
    setEditingId(mensagem.id)
    setEditContent(mensagem.conteudo)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditContent("")
  }

  const isOwnMessage = (mensagem: Mensagem & { autor: Membro }) => {
    return mensagem.membro_id === membroAtual.id
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat da Escala
          </CardTitle>
          <CardDescription>
            Comunicação interna entre os membros da equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Área de Mensagens */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {mensagens.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!</p>
              </div>
            ) : (
              mensagens.map((mensagem) => {
                const isOwn = isOwnMessage(mensagem)
                const isEditing = editingId === mensagem.id

                return (
                  <div
                    key={mensagem.id}
                    className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={mensagem.autor?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {mensagem.autor?.nome.split(" ").map(n => n[0]).join("").slice(0, 2) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 space-y-1 ${isOwn ? "items-end flex flex-col" : ""}`}>
                      <div className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                        <span className="text-sm font-medium">
                          {mensagem.autor?.nome || "Usuário desconhecido"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(mensagem.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                        {isOwn && !isEditing && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEdit(mensagem)}>
                                <Edit2 className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setMensagemToDelete(mensagem.id)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Deletar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Textarea
                            ref={textareaRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[80px]"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleEdit(mensagem.id)
                              }
                              if (e.key === "Escape") {
                                cancelEdit()
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(mensagem.id)}
                              disabled={!editContent.trim()}
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEdit}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "rounded-lg px-4 py-2 max-w-[80%]",
                            isOwn
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-muted"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {renderizarMencoes(mensagem.conteudo, todosMembros)}
                          </p>
                          {mensagem.updated_at !== mensagem.created_at && (
                            <p className="text-xs opacity-70 mt-1">
                              (editado)
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Área de Input com Autocomplete de Menções */}
          <div className="relative flex gap-2 pt-4 border-t">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={novaMensagem}
                onChange={handleTextChange}
                onKeyDown={(e) => {
                  if (showMentions && filteredMembros.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault()
                      setSelectedMentionIndex(prev => 
                        prev < filteredMembros.length - 1 ? prev + 1 : prev
                      )
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault()
                      setSelectedMentionIndex(prev => prev > 0 ? prev - 1 : 0)
                    } else if (e.key === "Enter" || e.key === "Tab") {
                      e.preventDefault()
                      inserirMencao(filteredMembros[selectedMentionIndex])
                    } else if (e.key === "Escape") {
                      setShowMentions(false)
                    }
                  } else if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                onKeyUp={updateCursorPosition}
                onMouseUp={updateCursorPosition}
                onClick={updateCursorPosition}
                placeholder="Digite sua mensagem... Use @ para mencionar alguém"
                className="min-h-[80px] resize-none"
                disabled={loading}
              />
              
              {/* Dropdown de Menções */}
              {showMentions && filteredMembros.length > 0 && (
                <div
                  ref={mentionDropdownRef}
                  className="absolute bottom-full left-0 mb-2 w-full max-h-[200px] overflow-y-auto bg-popover border rounded-md shadow-lg z-50"
                  style={{ maxWidth: "400px" }}
                >
                  {filteredMembros.map((membro, index) => (
                    <button
                      key={membro.id}
                      type="button"
                      onClick={() => inserirMencao(membro)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-left",
                        index === selectedMentionIndex && "bg-accent"
                      )}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={membro.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {membro.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{membro.nome}</p>
                        <p className="text-xs text-muted-foreground truncate">{membro.email}</p>
                      </div>
                      <AtSign className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={!novaMensagem.trim() || loading}
              size="icon"
              className="h-[80px] w-[80px]"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação de Delete */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar mensagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A mensagem será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
