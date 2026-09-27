# FLAT FREE BRASIL — AUDITORIA DE FONTES E CONSOLIDAÇÃO TÉCNICA DE DOSAGEM

**Lote:** LOTE DOSAGEM 01-BIS
**Data:** 27 de setembro de 2026  
**Repositório:** `vicgouveia-cloud/flat-free-brasil`  
**Branch:** `feature/dosage-catalog-foundation`  
**Acervo local consultado:** Acervo local auditado

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
   O código do pneu (ex.: `295/80 R22.5`) informa a largura nominal de seção (295 mm da lateral à lateral). A largura nominal não fornece a largura real da banda de rodagem (*Tread Width*). Usá-la como aproximação é uma hipótese exploratória, não uma medição exigida pelo fabricante.
2. **Incompatibilidade Grave com Veículos Comerciais Pesados:**  
   Se aplicarmos a fórmula `/22` ao pneu comercial de caminhão `295/80 R22.5` usando dimensões nominais:
   $$\text{Altura} \approx 41,08\text{ pol}, \quad \text{Largura} \approx 11,61\text{ pol}$$
   $$\text{Dose calculada} = \frac{41,08 \times 11,61}{22} \approx 21,69\text{ fl oz}$$
   Isso resultaria em **~21,7 fl oz**, um valor **completamente defasado** em relação aos **32 fl oz** tabelados e confirmados pelo projeto.
3. **Decisão Arquitetural:**  
   A fórmula foi implementada em `lib/dosage.ts` (`calculateDoseFromFormula`) como função isolada e testável com todos os parâmetros exigidos pelo fabricante. **Ela NÃO está conectada como fallback automático da interface pública**, prevenindo subdosagens perigosas em pneus que não constem do catálogo confirmado.

---

## 4. Regras Canônicas Estabelecidas pelo Projeto

Por determinação expressa da liderança técnica do projeto Flat Free Brasil:

| Medida Canônica | Dosagem Canônica | Status Técnico | Observação de Auditoria |
|---|---|---|---|
| **`275/80 R22,5`** | **28 US fl oz** | `confirmed` | Unânime na Tabela Resumida e confirmada pelo projeto. |
| **`295/80 R22,5`** | **32 US fl oz** | `confirmed` | Dose da Tabela Resumida, confirmada pelo responsável; override de 34 removido. |
| **`305/70 R22,5`** | **32 US fl oz** | `confirmed` | Dose documental preservada. |

As divergências históricas são preservadas nos registros de auditoria do catálogo e documentadas neste arquivo, não substituindo as doses públicas canônicas.

---

## 5. Estatísticas da Base de Dados Extraída

Foram consolidadas e normalizadas **63 entradas técnicas** a partir de todos os documentos do acervo:

- **Total de medidas extraídas:** 63
- **Medidas com status `confirmed`:** 54
- **Medidas com status `historical_conflict` (bloqueadas para dose automática):** 9
- **Medidas pendentes de revisão (`needs_review`):** 0

### Distribuição por Categoria Documental:
- **Passeio e Veículos Leves (`passeio_leve`):** 53 medidas
- **Caminhões e Ônibus (`caminhao_onibus`):** 7 medidas
- **Tratores e Maquinário Pesado (`trator_maquinario`):** 3 medidas
- **Total:** 63 medidas (53 + 7 + 3)

---

## 6. Inventário de Divergências Históricas (`historical_conflict`)

As seguintes 9 medidas apresentaram variações entre diferentes documentos do acervo. Para garantir a integridade do sistema, essas medidas foram marcadas como `historical_conflict` e **retornam `null` em consultas automáticas públicas** até deliberação técnica manual:

1. **`165/70 R13`**: Divergência histórica entre documentos: 7.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 13), 7.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Celta), 7.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Classic), 6.5 fl oz (Doses Ford.pdf - Ford Ka (ant.)), 7.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Uno Mille). Requer revisão técnica antes de exposição pública como dose oficial.
2. **`175/65 R14`**: Divergência histórica entre documentos: 7.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 14), 7.5 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Corsa), 7.5 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Prisma), 7.0 fl oz (Doses Ford.pdf - Ford Fiesta), 7.0 fl oz (Doses Ford.pdf - Ford Ka), 7.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Palio), 7.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Siena). Requer revisão técnica antes de exposição pública como dose oficial.
3. **`175/70 R14`**: Divergência histórica entre documentos: 7.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 14), 8.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Montana), 7.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Gol), 7.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Saveiro Trend), 7.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Voyage), 7.5 fl oz (Doses Ford.pdf - Ford Courrier), 8.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Strada). Requer revisão técnica antes de exposição pública como dose oficial.
4. **`195/55 R15`**: Divergência histórica entre documentos: 8.5 fl oz (Tabela Resumida Veículos (Leves) - Aro 15), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Fox iMotion), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Spacefox), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Voyage Comfortline), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Gol Power), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Polo), 8.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Spacefox). Requer revisão técnica antes de exposição pública como dose oficial.
5. **`195/60 R15`**: Divergência histórica entre documentos: 9.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 15), 8.5 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Meriva), 9.0 fl oz (DOSAGEM.xls / Doses Renault.pdf - Renault Sandero Stepway), 9.0 fl oz (Doses Ford.pdf - Ford New Fiesta SD), 9.0 fl oz (Doses Ford.pdf - Ford Focus Antigo), 9.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Idea). Requer revisão técnica antes de exposição pública como dose oficial.
6. **`205/55 R16`**: Divergência histórica entre documentos: 9.5 fl oz (Tabela Resumida Veículos (Leves) - Aro 16), 9.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Astra), 9.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Zafira), 9.0 fl oz (DOSAGEM.xls / Doses GM.pdf - GM Vectra GT), 9.0 fl oz (DOSAGEM.xls / Doses Volkswagen.pdf - VW Golf 2.0), 9.5 fl oz (DOSAGEM.xls / Doses Renault.pdf - Renault Megane), 9.5 fl oz (Doses Ford.pdf - Ford Focus Titanium), 9.0 fl oz (Doses Fiat.pdf / Quantidade-Montadoras (Fiat) - Fiat Bravo (Aro 16)), 9.5 fl oz (Quantidade-Montadoras (Peugeot) - Peugeot 307), 9.5 fl oz (Quantidade-Montadoras (Peugeot) - Peugeot 407), 9.0 fl oz (Quantidade-Montadoras (Toyota) - Toyota Corolla), 9.5 fl oz (Quantidade-Montadoras (Citroen) - Citroen C4 Hatch). Requer revisão técnica antes de exposição pública como dose oficial.
7. **`225/55 R18`**: Divergência histórica entre documentos: 11.5 fl oz (Tabela Resumida Veículos (Leves) - Aro 18), 12.0 fl oz (DOSAGEM.xls / Doses Mitsubishi.pdf - Mitsubishi Outlander). Requer revisão técnica antes de exposição pública como dose oficial.
8. **`225/65 R17`**: Divergência histórica entre documentos: 11.5 fl oz (Tabela Resumida Veículos (Leves) - Aro 17), 12.0 fl oz (DOSAGEM.xls / Doses Mitsubishi.pdf - Mitsubishi Pajero TR4), 10.0 fl oz (Quantidade-Montadoras (Toyota) - Toyota RAV4). Requer revisão técnica antes de exposição pública como dose oficial.
9. **`265/70 R16`**: Divergência histórica entre documentos: 15.0 fl oz (Tabela Resumida Veículos (Leves) - Aro 16), 15.0 fl oz (DOSAGEM.xls / Doses Mitsubishi.pdf - Mitsubishi L200 Outdoor), 15.0 fl oz (DOSAGEM.xls / Doses Mitsubishi.pdf - Mitsubishi L200 Triton), 12.0 fl oz (Quantidade-Montadoras (Toyota) - Toyota Hilux). Requer revisão técnica antes de exposição pública como dose oficial.

---

## 7. Fatores de Conversão Padronizados

- **1 galão americano (US gal)** = 128 US fl oz
- **1 balde comercial (5 gal US)** = 640 US fl oz ≈ 18,927 L (adotado canonicamente: 18,9 L)
- **1 litro** ≈ 33,814 US fl oz
- Arredondamento para pedido de baldes: **sempre para cima** (`Math.ceil`) para garantir suprimento completo da dosagem calculada.


## 8. Reprodução do micro-lote 01-BIS

`confirmed` significa ausência de divergência de dose no acervo consultado, inclusive quando há apenas uma fonte histórica. Não significa confirmação atual pelo fabricante nem múltiplas fontes independentes. São 54 medidas sem divergência e 9 com conflito; o override de 275 apenas reafirma a dose documental.

A categoria documental reconhecida precede heurísticas por medida no gerador. Em particular, `17,5 R25` pertence a `trator_maquinario`. As heurísticas são usadas somente quando a categoria da extração não é reconhecida. A extração histórica da Sheet2 ainda usa dose >50 para classificar suas linhas pesadas; isso é uma regra legada de extração, não uma classificação universal de pneus.

O caminho original acima documenta a proveniência, mas não é fixado no código. Instale `openpyxl` e `xlrd`; execute `python -B scripts/generate_catalog_code.py --source-dir "CAMINHO_DO_ACERVO"`, ou defina `FLAT_FREE_SOURCE_DIR` e omita o argumento. `--source-dir` prevalece sobre a variável. O acervo é somente lido.

A análise reproduzível está em [dosage-formula-analysis.md](dosage-formula-analysis.md). Após `npm ci`, compile os scripts com `npx tsc scripts/test_dosage_engine.ts scripts/analyze_dosage_formula.ts --outDir dist/dosage-audit --module commonjs --target es2020 --esModuleInterop --skipLibCheck`. Na raiz do repositório, execute `node dist/dosage-audit/scripts/test_dosage_engine.js` e `node dist/dosage-audit/scripts/analyze_dosage_formula.js`.

A comparação usa dimensões nominais derivadas de medidas métricas e /22, separada por categoria. Conflitos são excluídos das estatísticas porque a referência numérica do catálogo não resolve suas doses divergentes; medidas sem perfil métrico explícito também são excluídas, sem inferir dimensões. Não se introduz fator corretivo nem fallback público.


### Resultado reproduzido da comparação

- Leves: 44 medidas, erro percentual absoluto médio de 3,6591%; 32/44 dentro de ±5%, 43/44 dentro de ±10% e 27/44 dentro de ±0,5 fl oz.
- Caminhões/ônibus: 4 medidas métricas elegíveis, erro percentual absoluto médio de 31,7094%; nenhuma dentro de ±10%.
- Maquinário: nenhuma medida com perfil métrico explícito; sem estatística calculável.
- Total: 48 comparadas e 15 excluídas (9 conflitos + 6 formatos sem perfil métrico).

Os dados fictícios de demonstração também foram alinhados a 32 fl oz para 295/80 R22,5: item de 10 pneus = 320 fl oz e pedido total = 544 fl oz. Nenhum componente de interface foi alterado.
