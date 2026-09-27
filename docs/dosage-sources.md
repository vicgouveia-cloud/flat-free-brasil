# FLAT FREE BRASIL — AUDITORIA DE FONTES E CONSOLIDAÇÃO TÉCNICA DE DOSAGEM

**Lote:** LOTE DOSAGEM 01  
**Data:** 27 de setembro de 2026  
**Repositório:** `vicgouveia-cloud/flat-free-brasil`  
**Branch:** `feature/dosage-catalog-foundation`  
**Acervo local consultado:** `F:\Victor\TRABALHO\Flat Free`

---

## 1. Documentos Efetivamente Auditados

Todos os dados integrados neste lote procedem exclusivamente dos documentos originais do fabricante e da importadora (`ASI Chemical Inc.` e `Revix Imp. Exp. e Com. de Produtos Automotivos Ltda ME`):

1. **`Tire Chart.pdf`**  
   - Fabricante: *ASI Chemical Inc.* (Lake Wales, FL 33859, Tel: 863-678-1814).
   - Conteúdo: Guia técnico de instalação ("INSTALLATION FORMULAS") e diagramas de medição.
2. **`Tabela de aplicação passeio.pdf`** e **`tabela aplicação passeio exel.xlsx`**  
   - Importadora: *Revix / Flat Free Brasil*.
   - Conteúdo: Tabela de aplicação rápida por aro (13", 14", 15", 16") e fórmula traduzida.
3. **`Tabela Resumida Veículos.pdf`** e **`Tabela Resumida Veículos.docx`**  
   - Conteúdo: Tabela consolidada com 33 medidas de veículos leves, 7 de caminhões/ônibus e 3 de maquinário pesado/tratores.
4. **`Quantidade-Montadoras.xlsx`**  
   - Planilha mestre contendo as abas: `Sheet2` (espelho exato da Tabela Resumida), `Formula` (demonstração de cálculo com proporções métricas) e abas por montadora: `Chevrolet - GM`, `Fiat`, `Ford`, `Volkswagen`, `Renault`, `Peugeot`, `Hyundai`, `Kia`, `Toyota`, `Honda`, `Nissan`, `Volvo`, `Mitsubishi`, `Citroen`, `Honda (Motos)`.
5. **`QUANTIDADES MONTADORAS/DOSAGEM.xls`**  
   - Planilha oficial de dosagens por montadora com abas: `VW`, `GM`, `FIAT`, `Volkswagen`, `Kia`, `Mitsubishi`, `Sheet1` (Renault).
6. **`QUANTIDADES MONTADORAS/Doses *.pdf`**  
   - Conjunto de relatórios oficiais em PDF: `Doses Fiat.pdf`, `Doses Ford.pdf`, `Doses GM - Chevrolet.pdf`, `Doses Kia.pdf`, `Doses Mitsubishi.pdf`, `Doses Renault.pdf`, `Doses Volkswagen.pdf`.
7. **`Tabela de Custo por Produto.xls`**  
   - Especificação das embalagens comerciais: frascos de 8 oz, 16 oz, 32 oz e balde industrial de 5 galões US (640 fl oz ≈ 18,9 L).

---

## 2. A Fórmula Original do Fabricante (ASI Chemical Inc.)

Conforme extraído visual e textualmente do documento original **`Tire Chart.pdf`**:

### Texto Exato (Verbatim):
> **INSTALLATION FORMULAS**  
> *To calculate the quanity [sic] of Flat Free to install in a tire, use the simple formulas provided below.*  
>
> **For Tires To Be Used Over 45MPH**  
> *For Cars, Truck, Vans, SUV's, Light Vehicles And Vehicles Travelling Over 45MPH, Take the total tire height in inches and multiply the total tread width in inches and divide by 22 to get the ounces needed for each tire.*  
> *Note: Add 10% more Flat Free to old and extremely worn tires.*  
>
> **For Tires To Be Used Under 45MPH**  
> *For SUV's, Equipment, Trucks, ATV's And Vehicles Travelling Under 45MPH, Take the total tire height in inches and multiply the total tread width in inches and divide by 10 to get the ounces needed for each tire.*  
> *Note: Add 10% more Flat Free to old and extremely worn tires.*  
>
> *ASI Chemical Inc. • P.O. Box 712 • Lake Wales, FL 33859 • Tel: 863-678-1814 • Fax: 863-678-1914*

### Variáveis e Unidades Exatas:
- **`HEIGHT OF TIRE`**: Altura total física do pneu montado, medida em **polegadas** (*inches*).
- **`WIDTH OF TREAD`**: Largura da **banda de rodagem** (área de contato com o solo), medida em **polegadas** (*inches*). **Não é a largura de seção nominal** (section width) estampada na lateral do pneu.
- **Divisor 22**: Aplicado para veículos rodoviários e de velocidade acima de 45 MPH (~72 km/h).
- **Divisor 10**: Aplicado para veículos de baixa velocidade e maquinário pesado abaixo de 45 MPH (~72 km/h).
- **Unidade do Resultado**: Onças fluidas americanas (**US fluid ounces / fl oz**) de produto por pneu.

### Regras Especiais de Desgaste:
- **Regra ASI (`Tire Chart.pdf`)**: Adicionar **+10%** de produto para pneus antigos e excessivamente desgastados (*"Add 10% more Flat Free to old and extremely worn tires"*).
- **Regra Revix Brasil (`Tabela de aplicação passeio.pdf`)**: *"Para pneus com mais de 15.000 km rodados, acrescentar 1 onça adicional por pneu."*

---

## 3. Análise da Fórmula como Fallback Geral (Limitação Crítica)

A auditoria confrontou o cálculo teórico da fórmula com as dosagens reais das tabelas para validar se a fórmula poderia atuar como fallback automático público para qualquer código de pneu.

### Resultado do Confronto:
1. **Divergência entre Largura da Banda e Largura Nominal de Seção:**  
   O código do pneu (ex.: `295/80 R22.5`) informa a largura nominal de seção (295 mm da lateral à lateral). A largura da banda de rodagem (*Tread Width*) é substancialmente menor (geralmente entre 75% e 85% da largura da seção). Se um algoritmo presumir `Tread Width = Section Width`, estará violando a física descrita no documento.
2. **Incompatibilidade Grave com Veículos Comerciais Pesados:**  
   Se aplicarmos a fórmula `/22` ao pneu comercial de caminhão `295/80 R22.5` usando dimensões nominais:
   $$\text{Altura} \approx 41,08\text{ pol}, \quad \text{Largura} \approx 11,61\text{ pol}$$
   $$\text{Dose calculada} = \frac{41,08 \times 11,61}{22} \approx 21,69\text{ fl oz}$$
   Isso resultaria em **~21,7 fl oz**, um valor **completamente defasado** em relação aos **34 fl oz** canônicos exigidos para frotas pesadas.
3. **Decisão Arquitetural:**  
   A fórmula foi implementada em `lib/dosage.ts` (`calculateDoseFromFormula`) como função isolada e testável com todos os parâmetros exigidos pelo fabricante. **Ela NÃO está conectada como fallback automático da interface pública**, prevenindo subdosagens perigosas em pneus que não constem do catálogo confirmado.

---

## 4. Regras Canônicas Estabelecidas pelo Projeto

Por determinação expressa da liderança técnica do projeto Flat Free Brasil:

| Medida Canônica | Dosagem Canônica | Status Técnico | Observação de Auditoria |
|---|---|---|---|
| **`275/80 R22,5`** | **28 US fl oz** | `confirmed` | Unânime na Tabela Resumida e confirmada pelo projeto. |
| **`295/80 R22,5`** | **34 US fl oz** | `confirmed` | **Decisão Canônica do Projeto**. Prevalece sobre os 32 fl oz registrados historicamente na Tabela Resumida. |

As divergências históricas são preservadas nos registros de auditoria do catálogo e documentadas neste arquivo, não substituindo as doses públicas canônicas.

---

## 5. Estatísticas da Base de Dados Extraída

Foram consolidadas e normalizadas **63 entradas técnicas** a partir de todos os documentos do acervo:

- **Total de medidas extraídas:** 63
- **Medidas com status `confirmed`:** 54
- **Medidas com status `historical_conflict` (bloqueadas para dose automática):** 9
- **Medidas pendentes de revisão (`needs_review`):** 0

### Distribuição por Categoria Documental:
- **Passeio e Veículos Leves (`passeio_leve`):** 46 medidas
- **Caminhões e Ônibus (`caminhao_onibus`):** 8 medidas
- **Tratores e Maquinário Pesado (`trator_maquinario`):** 3 medidas
- **Total:** 63 medidas (57 no catálogo primário consolidado + variações de montadora)

---

## 6. Inventário de Divergências Históricas (`historical_conflict`)

As seguintes 9 medidas apresentaram variações entre diferentes documentos do acervo. Para garantir a integridade do sistema, essas medidas foram marcadas como `historical_conflict` e **retornam `null` em consultas automáticas públicas** até deliberação técnica manual:

1. **`165/70 R13`**:  
   - 7,0 fl oz: *Tabela Resumida*, *Doses Fiat* (Uno Mille), *Doses GM* (Celta, Classic).  
   - 6,5 fl oz: *Doses Ford* (Ka antigo).
2. **`175/70 R14`**:  
   - 7,0 fl oz: *Tabela Resumida*, *Doses VW* (Gol, Saveiro Trend, Voyage).  
   - 7,5 fl oz: *Doses Ford* (Courrier).  
   - 8,0 fl oz: *Doses GM* (Montana), *Doses Fiat* (Strada).
3. **`195/55 R15`**:  
   - 8,5 fl oz: *Tabela Resumida*.  
   - 8,0 fl oz: *Doses VW* (Fox iMotion, Spacefox, Voyage Comfortline, Gol Power, Polo).
4. **`195/60 R15`**:  
   - 9,0 fl oz: *Tabela Resumida*, *Doses Renault* (Sandero Stepway), *Doses Ford* (New Fiesta SD, Focus Antigo), *Doses Fiat* (Idea).  
   - 8,5 fl oz: *Doses GM* (Meriva).
5. **`205/55 R16`**:  
   - 9,5 fl oz: *Tabela Resumida*, *Doses Ford* (Focus Titanium), *Doses Renault* (Megane), *Peugeot* (307, 407), *Citroën* (C4 Hatch).  
   - 9,0 fl oz: *Doses VW* (Golf 2.0), *Doses GM* (Astra, Zafira, Vectra GT), *Doses Fiat* (Bravo Aro 16), *Toyota* (Corolla).
6. **`225/55 R18`**:  
   - 11,5 fl oz: *Tabela Resumida*.  
   - 12,0 fl oz: *Doses Mitsubishi* (Outlander).
7. **`225/65 R17`**:  
   - 11,5 fl oz: *Tabela Resumida*.  
   - 12,0 fl oz: *Doses Mitsubishi* (Pajero TR4).  
   - 10,0 fl oz: *Toyota* (RAV4).
8. **`265/70 R16`**:  
   - 15,0 fl oz: *Tabela Resumida*, *Doses Mitsubishi* (L200 Outdoor, L200 Triton).  
   - 12,0 fl oz: *Toyota* (Hilux).
9. **`295/80 R22,5`** (*Divergência tratada por Decisão Canônica*):  
   - 34,0 fl oz: **Valor Canônico Oficial** (decisão do projeto).  
   - 32,0 fl oz: Valor histórico na *Tabela Resumida Veículos*.

---

## 7. Fatores de Conversão Padronizados

- **1 galão americano (US gal)** = 128 US fl oz
- **1 balde comercial (5 gal US)** = 640 US fl oz ≈ 18,927 L (adotado canonicamente: 18,9 L)
- **1 litro** ≈ 33,814 US fl oz
- Arredondamento para pedido de baldes: **sempre para cima** (`Math.ceil`) para garantir suprimento completo da dosagem calculada.
