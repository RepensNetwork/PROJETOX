// Database types for Ship Operations Management System

// Status and Priority Types
export type EscalaStatus = 'planejada' | 'em_operacao' | 'concluida' | 'cancelada'
export type DemandaStatus = 'pendente' | 'em_andamento' | 'aguardando_terceiro' | 'concluida' | 'cancelada'
export type DemandaPrioridade = 'baixa' | 'media' | 'alta' | 'urgente'
export type DemandaCategoria = 'passageiros' | 'saude' | 'suprimentos' | 'abastecimento' | 'autoridades' | 'logistica' | 'processos_internos'
export type EmailStatus = 'new' | 'triaged' | 'assigned' | 'done'

// Alias for compatibility
export type StatusEscala = EscalaStatus
export type StatusDemanda = DemandaStatus
export type Prioridade = DemandaPrioridade

export type DemandaTipo = 
  | 'embarque_passageiros'
  | 'desembarque_passageiros'
  | 'controle_listas'
  | 'suporte_especial'
  | 'visita_medica'
  | 'atendimento_emergencial'
  | 'documentacao_medica'
  | 'orcamento_produtos'
  | 'compra'
  | 'entrega_bordo'
  | 'confirmacao_recebimento'
  | 'abastecimento_agua'
  | 'combustivel'
  | 'controle_horarios'
  | 'policia_federal'
  | 'receita_federal'
  | 'mapa'
  | 'port_authority'
  | 'reserva_hotel'
  | 'transporte_terrestre'
  | 'motorista'
  | 'veiculo'
  | 'pickup_dropoff'
  | 'checklist_padrao'
  | 'relatorio'
  | 'documento_obrigatorio'
  | 'procedimento_repetitivo'
  | 'outro'

export interface Navio {
  id: string
  nome: string
  companhia: string
  observacoes?: string | null
  created_at: string
  updated_at: string
}

export interface Membro {
  id: string
  nome: string
  email: string
  avatar_url?: string | null
  ativo: boolean
  is_admin?: boolean
  allowed_pages?: string[] | null
  session_ip?: string | null
  last_login_at?: string | null
  created_at: string
}

export interface Escala {
  id: string
  navio_id: string
  porto: string
  data_chegada: string
  data_saida: string
  observacoes?: string | null
  status: EscalaStatus
  created_at: string
  updated_at: string
  navio?: Navio
}

export interface Demanda {
  id: string
  escala_id: string
  demanda_pai_id?: string | null
  tipo: DemandaTipo
  categoria: DemandaCategoria
  titulo: string
  descricao?: string | null
  pickup_at?: string | null
  pickup_local?: string | null
  dropoff_local?: string | null
  transporte_status?: string | null
  transporte_modalidade?: string | null
  transporte_grupo?: string | null
  transporte_concluido_em?: string | null
  transporte_legs?: any
  /** Reserva hotel */
  reserva_hotel_nome?: string | null
  reserva_hotel_endereco?: string | null
  reserva_checkin?: string | null
  reserva_checkout?: string | null
  reserva_valor?: number | null
  reserva_cafe_incluso?: boolean | null
  reserva_almoco_incluso?: boolean | null
  reserva_confirmado?: boolean | null
  responsavel_id?: string | null
  prioridade: DemandaPrioridade
  status: DemandaStatus
  prazo?: string | null
  checklist?: any
  observacoes?: string | null
  created_at: string
  updated_at: string
  escala?: Escala
  responsavel?: Membro
  /** Demanda principal (tripulante) quando esta é sub-demanda */
  demanda_pai?: Demanda | null
  /** Sub-demandas (ex: transporte, hotel) quando esta é demanda principal */
  sub_demandas?: Demanda[]
}

export interface Comentario {
  id: string
  demanda_id: string
  membro_id?: string | null
  conteudo: string
  created_at: string
  autor?: Membro
  // Alias for compatibility
  autor_id?: string | null
}

export interface Anexo {
  id: string
  demanda_id: string
  nome_arquivo: string
  url: string
  tipo?: string | null
  tamanho?: number | null
  created_at: string
  tipo_mime?: string | null
  tamanho_bytes?: number | null
  uploaded_by?: string | null
}

export interface Historico {
  id: string
  demanda_id: string
  membro_id?: string | null
  acao: string
  detalhes?: any
  created_at: string
  autor?: Membro
  // Alias for compatibility
  autor_id?: string | null
}

export interface DashboardStats {
  totalEscalasAtivas: number
  totalDemandas: number
  demandasPendentes: number
  demandasEmAndamento: number
  demandasConcluidas: number
  demandasBloqueadas: number
  demandasAtrasadas: number
  demandasCriticas: number
  // Alias for compatibility
  demandasAguardandoTerceiro?: number
  demandasUrgentes?: number
}

export interface Mensagem {
  id: string
  escala_id: string
  membro_id: string
  conteudo: string
  created_at: string
  updated_at: string
  autor?: Membro
  escala?: Escala
  mencoes?: Mencao[]
  leituras?: LeituraMensagem[]
}

export interface Mencao {
  id: string
  mensagem_id: string
  membro_id: string
  membro?: Membro
  created_at: string
}

export interface Notificacao {
  id: string
  mensagem_id: string
  membro_id: string
  escala_id: string
  lida: boolean
  lida_em?: string | null
  created_at: string
  mensagem?: Mensagem & { autor: Membro }
  membro?: Membro
}

export interface NotificacaoDemanda {
  id: string
  demanda_id: string
  membro_id: string
  lida: boolean
  lida_em?: string | null
  created_at: string
  demanda?: Demanda & { escala?: Escala }
}

export interface LeituraMensagem {
  id: string
  mensagem_id: string
  membro_id: string
  lida_em: string
  membro?: Membro
}

export interface EmailRegistro {
  id: string
  provider: string
  provider_id: string
  thread_id?: string | null
  demanda_id?: string | null
  account_tag?: string | null
  from_name?: string | null
  from_email?: string | null
  subject?: string | null
  received_at?: string | null
  body_raw_html?: string | null
  body_clean_text?: string | null
  navio_id?: string | null
  ship?: string | null
  topic?: string | null
  due_at?: string | null
  status: EmailStatus
  priority?: string | null
  attachments?: any
  created_at: string
  navio?: Navio
}

export interface AuditLog {
  id: string
  entity: string
  entity_id: string
  action: string
  old_values?: any
  new_values?: any
  actor_id?: string | null
  actor_email?: string | null
  created_at: string
}

export interface EscalaComDemandas extends Escala {
  demandas: Demanda[]
  _count?: {
    demandas: number
    demandasPendentes: number
    demandasEmAndamento: number
    demandasConcluidas: number
  }
}
