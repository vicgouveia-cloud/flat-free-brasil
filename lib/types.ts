// =============================================
// FLAT FREE BRASIL - Type Definitions
// =============================================

export interface Company {
  id: string
  nome: string
  razaoSocial?: string
  cnpj?: string
  contatoPrincipal: string
  email: string
  telefone: string
  endereco: string
}

export interface Unit {
  id: string
  companyId: string
  nome: string
  endereco: string
}

export type VehicleStatus = 'ativo' | 'inativo' | 'em_manutencao'

export interface Vehicle {
  id: string
  companyId: string
  identificacaoInterna: string
  placa?: string
  tipo: string
  fabricanteModelo?: string
  configuracaoEixos?: string
  status: VehicleStatus
}

export type TireCondition = 'novo' | 'recapado'
export type TireStatus = 'em_operacao' | 'estoque' | 'descartado' | 'recapagem'

export interface Tire {
  id: string
  companyId: string
  identificacaoInterna: string
  numeroFogo?: string
  fabricante: string
  modelo: string
  medida: string
  condicao: TireCondition
  custo?: number
  dataEntradaOperacao: string // ISO date
  status: TireStatus
}

export interface TirePositionHistory {
  id: string
  tireId: string
  vehicleId: string
  posicao: string
  dataInicial: string
  dataFinal?: string
  observacoes?: string
}

export interface FlatFreeApplication {
  id: string
  tireId: string
  data: string
  doseAplicada: number
  lote?: string
  responsavel?: string
  quilometragemAplicacao: number
  pressaoInicial?: number
  sulcoInicial: number
  observacoes?: string
}

export interface TireReading {
  id: string
  tireId: string
  data: string
  vehicleId: string
  quilometragemVeiculo: number
  sulco: number
  pressao?: number
  posicaoAtual: string
  observacoes?: string
}

export type OccurrenceType =
  | 'perfuracao'
  | 'reparo'
  | 'perda_pressao'
  | 'valvula'
  | 'rodizio'
  | 'retirada'
  | 'recapagem'
  | 'outro'

export interface Occurrence {
  id: string
  tireId: string
  data: string
  tipo: OccurrenceType
  descricao: string
}

export type PilotProjectStatus = 'planejamento' | 'ativo' | 'concluido' | 'cancelado'
export type TireGroup = 'tratado' | 'controle'

export interface PilotProjectTire {
  tireId: string
  grupo: TireGroup
}

export interface PilotProject {
  id: string
  companyId: string
  nome: string
  descricao?: string
  dataInicio: string
  status: PilotProjectStatus
  criteriosComparacao?: string
  observacoes?: string
  pneus: PilotProjectTire[]
}

export interface TechnicalDosageBasis {
  method: 'asi_physical_measurements'
  tireHeightInches: number
  treadWidthInches: number
  speedRegime: 'over_45_mph' | 'under_45_mph'
  isOldOrExtremelyWorn: boolean
  calculatedDoseBeforeRounding: number
}

export interface OperationalDosageBasis {
  method: 'operational_class'
  usageClass: 'light_road' | 'heavy_road' | 'slow_machinery'
  calculatedDoseBeforeRounding?: number
}

export interface OrderItem {
  medida: string
  quantidade: number          // number of tires
  doseUnitOz: number          // fl oz per tire (canonical dosage)
  totalOz: number             // doseUnitOz * quantidade
  technicalBasis?: TechnicalDosageBasis
  operationalBasis?: OperationalDosageBasis
}

export type PendingDosageReason =
  | 'unknown_measure'
  | 'needs_usage_class'
  | 'insufficient_geometry'
  | 'historical_conflict'
  | 'needs_review'

export interface PendingOrderItem {
  medida: string
  quantidade: number
  status: 'pendente_confirmacao_dosagem'
  reason?: PendingDosageReason
}

export type OrderStatus = 'pendente_dosagem' | 'solicitado' | 'em_analise' | 'aprovado' | 'enviado' | 'entregue' | 'cancelado'

export interface Order {
  id: string
  companyId: string
  data: string
  itens: OrderItem[]
  itensPendentes?: PendingOrderItem[]
  quantidadeEstimadaProduto: number  // total fl oz estimated
  enderecoEntrega: string
  cidade: string
  estado: string
  cep: string
  nomeEmpresa: string
  razaoSocial?: string
  cnpj?: string
  nomeResponsavel: string
  email: string
  telefone: string
  observacoes?: string
  status: OrderStatus
}
