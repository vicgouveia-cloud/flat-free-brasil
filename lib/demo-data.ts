// =============================================
// DADOS DE DEMONSTRAÇÃO - Flat Free Brasil MVP
// ATENÇÃO: Todos os dados abaixo são fictícios
// e servem exclusivamente para demonstração da interface.
// =============================================

import type { Company, Vehicle, Tire, TireReading, FlatFreeApplication, PilotProject, Order } from './types'

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

export const DEMO_APPLICATIONS: FlatFreeApplication[] = [
  {
    id: 'app-001',
    tireId: 'tire-001',
    data: '2026-01-20',
    doseAplicada: 34,
    responsavel: 'Carlos Silva',
    quilometragemAplicacao: 0,
    sulcoInicial: 16.0,
    observacoes: 'Aplicação inicial - pneu novo',
  },
  {
    id: 'app-002',
    tireId: 'tire-002',
    data: '2026-01-20',
    doseAplicada: 28,
    responsavel: 'Carlos Silva',
    quilometragemAplicacao: 0,
    sulcoInicial: 16.0,
    observacoes: 'Aplicação inicial - pneu novo',
  },
]

export const DEMO_READINGS: TireReading[] = [
  {
    id: 'read-001',
    tireId: 'tire-001',
    data: '2026-03-15',
    vehicleId: 'veh-001',
    quilometragemVeiculo: 45000,
    sulco: 13.5,
    pressao: 110,
    posicaoAtual: 'Dianteiro Direito',
  },
  {
    id: 'read-002',
    tireId: 'tire-002',
    data: '2026-03-15',
    vehicleId: 'veh-001',
    quilometragemVeiculo: 45000,
    sulco: 12.8,
    pressao: 108,
    posicaoAtual: 'Dianteiro Esquerdo',
  },
  {
    id: 'read-003',
    tireId: 'tire-003',
    data: '2026-03-15',
    vehicleId: 'veh-002',
    quilometragemVeiculo: 38000,
    sulco: 14.2,
    pressao: 112,
    posicaoAtual: 'Dianteiro Direito',
  },
  {
    id: 'read-004',
    tireId: 'tire-004',
    data: '2026-03-15',
    vehicleId: 'veh-002',
    quilometragemVeiculo: 38000,
    sulco: 11.0,
    pressao: 106,
    posicaoAtual: 'Dianteiro Esquerdo',
  },
]

export const DEMO_PROJECTS: PilotProject[] = [
  {
    id: 'proj-001',
    companyId: 'demo-company-1',
    nome: 'Piloto Demo - Rota Interestadual',
    descricao: 'Comparativo em rota de longa distância entre pneus tratados e controle.',
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

export const DEMO_ORDERS: Order[] = [
  {
    id: 'ord-001',
    companyId: 'demo-company-1',
    data: '2026-01-10',
    itens: [
      { medida: '295/80 R22,5', quantidade: 10, doses: 34 },
      { medida: '275/80 R22,5', quantidade: 8, doses: 28 },
    ],
    quantidadeEstimadaProduto: 564,
    enderecoEntrega: 'Av. Industrial, 1000',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01000-000',
    nomeEmpresa: 'Transportadora Demo Ltda',
    nomeResponsavel: 'Carlos Silva',
    email: 'carlos@demo-transportadora.com.br',
    telefone: '(11) 99999-0001',
    observacoes: 'Pedido de demonstração',
    status: 'solicitado',
  },
]
