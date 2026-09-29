// =============================================
// DADOS DE DEMONSTRAÇÃO - Flat Free Brasil MVP
// ATENÇÃO: Todos os dados abaixo são fictícios
// e servem exclusivamente para demonstração da interface.
// Nenhum cliente, frota ou teste real foi utilizado.
// =============================================

import type {
  Company, Unit, Vehicle, Tire, TireReading,
  FlatFreeApplication, PilotProject, Order, TirePositionHistory
} from './types'

export const DEMO_COMPANY: Company = {
  id: 'demo-company-1',
  nome: 'Transportadora Demo Ltda',
  razaoSocial: 'Transportadora Demo Ltda',
  cnpj: '00.000.000/0001-00',
  contatoPrincipal: 'Carlos Silva',
  email: 'carlos@demo-transportadora.com.br',
  telefone: '(11) 99999-0001',
  endereco: 'Av. Industrial, 1000 - São Paulo, SP',
}

export const DEMO_UNITS: Unit[] = [
  {
    id: 'unit-001',
    companyId: 'demo-company-1',
    nome: 'Matriz',
    endereco: 'Av. Industrial, 1000 - São Paulo, SP',
  },
]

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'veh-001',
    companyId: 'demo-company-1',
    identificacaoInterna: 'TK-01',
    placa: 'ABC-1234',
    tipo: 'Caminhão 6x4',
    fabricanteModelo: 'Volvo FH',
    configuracaoEixos: '6x4',
    status: 'ativo',
  },
  {
    id: 'veh-002',
    companyId: 'demo-company-1',
    identificacaoInterna: 'TK-02',
    placa: 'DEF-5678',
    tipo: 'Caminhão 6x4',
    fabricanteModelo: 'Scania R',
    configuracaoEixos: '6x4',
    status: 'ativo',
  },
]

export const DEMO_TIRES: Tire[] = [
  // Tratados com Flat Free
  {
    id: 'tire-001',
    companyId: 'demo-company-1',
    identificacaoInterna: 'PN-001',
    fabricante: 'Bridgestone',
    modelo: 'R295',
    medida: '295/80 R22,5',
    condicao: 'novo',
    custo: 2800,
    dataEntradaOperacao: '2026-01-15',
    status: 'em_operacao',
  },
  {
    id: 'tire-002',
    companyId: 'demo-company-1',
    identificacaoInterna: 'PN-002',
    fabricante: 'Michelin',
    modelo: 'X Line',
    medida: '275/80 R22,5',
    condicao: 'novo',
    custo: 2600,
    dataEntradaOperacao: '2026-01-15',
    status: 'em_operacao',
  },
  // Controle (sem Flat Free)
  {
    id: 'tire-003',
    companyId: 'demo-company-1',
    identificacaoInterna: 'PN-003',
    fabricante: 'Bridgestone',
    modelo: 'R295',
    medida: '295/80 R22,5',
    condicao: 'novo',
    custo: 2800,
    dataEntradaOperacao: '2026-01-15',
    status: 'em_operacao',
  },
  {
    id: 'tire-004',
    companyId: 'demo-company-1',
    identificacaoInterna: 'PN-004',
    fabricante: 'Goodyear',
    modelo: 'Regional RHS II',
    medida: '275/80 R22,5',
    condicao: 'recapado',
    custo: 1200,
    dataEntradaOperacao: '2026-02-01',
    status: 'em_operacao',
  },
]

// Applications only for the TREATED tires.
// doseAplicada is in fl oz (canonical values).
export const DEMO_APPLICATIONS: FlatFreeApplication[] = [
  {
    id: 'app-001',
    tireId: 'tire-001',
    data: '2026-01-20',
    doseAplicada: 32,   // 32 fl oz — canonical for 295/80 R22,5
    vehicleId: 'veh-001',
    posicaoInicial: 'Dianteiro Direito',
    responsavel: 'Carlos Silva',
    quilometragemAplicacao: 85000,
    sulcoInicial: 16.0,
    observacoes: 'Aplicação inicial — dados fictícios de demonstração',
  },
  {
    id: 'app-002',
    tireId: 'tire-002',
    data: '2026-01-20',
    doseAplicada: 28,   // 28 fl oz — canonical for 275/80 R22,5
    vehicleId: 'veh-001',
    posicaoInicial: 'Dianteiro Esquerdo',
    responsavel: 'Carlos Silva',
    quilometragemAplicacao: 62000,
    sulcoInicial: 16.0,
    observacoes: 'Aplicação inicial — dados fictícios de demonstração',
  },
]

// Each tire needs TWO readings to form a valid interval:
// baseline (initial) and at least one posterior reading.
// tire-001 and tire-002 are TREATED (have FlatFreeApplication as baseline).
// tire-003 and tire-004 are CONTROL (use first reading as baseline).
export const DEMO_READINGS: TireReading[] = [
  // --- TREATED tire-001 (295/80 R22,5) ---
  // Baseline provided by application at km 85000, sulco 16.0
  // Posterior reading:
  {
    id: 'read-001',
    tireId: 'tire-001',
    data: '2026-06-15',
    vehicleId: 'veh-001',
    quilometragemVeiculo: 130000,
    sulco: 13.5,
    pressao: 110,
    posicaoAtual: 'Dianteiro Direito',
  },

  // --- TREATED tire-002 (275/80 R22,5) ---
  // Baseline provided by application at km 62000, sulco 16.0
  // Posterior reading:
  {
    id: 'read-002',
    tireId: 'tire-002',
    data: '2026-06-15',
    vehicleId: 'veh-001',
    quilometragemVeiculo: 107000,
    sulco: 12.8,
    pressao: 108,
    posicaoAtual: 'Dianteiro Esquerdo',
  },

  // --- CONTROL tire-003 (295/80 R22,5) ---
  // No application. Two readings form the interval:
  {
    id: 'read-003-baseline',
    tireId: 'tire-003',
    data: '2026-01-20',
    vehicleId: 'veh-002',
    quilometragemVeiculo: 90000,
    sulco: 16.0,
    pressao: 110,
    posicaoAtual: 'Dianteiro Direito',
  },
  {
    id: 'read-003',
    tireId: 'tire-003',
    data: '2026-06-15',
    vehicleId: 'veh-002',
    quilometragemVeiculo: 128000,
    sulco: 12.0,
    pressao: 108,
    posicaoAtual: 'Dianteiro Direito',
  },

  // --- CONTROL tire-004 (275/80 R22,5) ---
  // No application. Two readings form the interval:
  {
    id: 'read-004-baseline',
    tireId: 'tire-004',
    data: '2026-02-01',
    vehicleId: 'veh-002',
    quilometragemVeiculo: 70000,
    sulco: 14.0,
    pressao: 108,
    posicaoAtual: 'Dianteiro Esquerdo',
  },
  {
    id: 'read-004',
    tireId: 'tire-004',
    data: '2026-06-15',
    vehicleId: 'veh-002',
    quilometragemVeiculo: 103000,
    sulco: 11.0,
    pressao: 106,
    posicaoAtual: 'Dianteiro Esquerdo',
  },
]

export const DEMO_PROJECTS: PilotProject[] = [
  {
    id: 'proj-001',
    companyId: 'demo-company-1',
    nome: 'Piloto Demo — Rota Interestadual',
    descricao: 'Comparativo fictício em rota de longa distância entre pneus tratados e controle.',
    dataInicio: '2026-01-20',
    status: 'ativo',
    criteriosComparacao: 'Desgaste de sulco (mm/km), ocorrências de perfuração',
    pneus: [
      { tireId: 'tire-001', grupo: 'tratado' },
      { tireId: 'tire-002', grupo: 'tratado' },
      { tireId: 'tire-003', grupo: 'controle' },
      { tireId: 'tire-004', grupo: 'controle' },
    ],
  },
]

// OrderItem uses explicit doseUnitOz and totalOz fields.
export const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-001',
    companyId: 'demo-company-1',
    data: '2026-01-10',
    itens: [
      { medida: '295/80 R22,5', quantidade: 10, doseUnitOz: 32, totalOz: 320 },
      { medida: '275/80 R22,5', quantidade: 8,  doseUnitOz: 28, totalOz: 224 },
    ],
    quantidadeEstimadaProduto: 544,  // total fl oz
    enderecoEntrega: 'Av. Industrial, 1000',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01000-000',
    nomeEmpresa: 'Transportadora Demo Ltda',
    nomeResponsavel: 'Carlos Silva',
    email: 'carlos@demo-transportadora.com.br',
    telefone: '(11) 99999-0001',
    observacoes: 'Pedido de demonstração — dados fictícios',
    status: 'solicitado',
  },
]

// Initial position history based on demo readings
export const DEMO_POSITION_HISTORY: TirePositionHistory[] = [
  {
    id: 'pos-001',
    tireId: 'tire-001',
    vehicleId: 'veh-001',
    posicao: 'Dianteiro Direito',
    dataInicial: '2026-01-20',
  },
  {
    id: 'pos-002',
    tireId: 'tire-002',
    vehicleId: 'veh-001',
    posicao: 'Dianteiro Esquerdo',
    dataInicial: '2026-01-20',
  },
  {
    id: 'pos-003',
    tireId: 'tire-003',
    vehicleId: 'veh-002',
    posicao: 'Dianteiro Direito',
    dataInicial: '2026-01-20',
  },
  {
    id: 'pos-004',
    tireId: 'tire-004',
    vehicleId: 'veh-002',
    posicao: 'Dianteiro Esquerdo',
    dataInicial: '2026-02-01',
  },
]
