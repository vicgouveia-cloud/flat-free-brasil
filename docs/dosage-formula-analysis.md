# FLAT FREE BRASIL — ANÁLISE MATEMÁTICA E REGRA EMPÍRICA PARA PESADOS RODOVIÁRIOS (/15)

**Lote:** LOTE DOSAGEM 01-QUATER (Ajuste Semântico)  
**Data:** 27 de setembro de 2026  
**Repositório:** `vicgouveia-cloud/flat-free-brasil`  
**Branch:** `feature/dosage-catalog-foundation`  
**Referência:** `scripts/analyze_dosage_formula.ts`

---

## 1. Contexto e Objetivo

A fórmula documental original da *ASI Chemical Inc.* (`Tire Chart.pdf`), definida com divisor 22 para veículos rodoviários acima de 45 MPH, foi desenvolvida pelo fabricante utilizando a largura real da banda de rodagem (*Width of Tread*) e altura total real.

O uso exploratório da fórmula /22 com LARGURA NOMINAL DA SEÇÃO não reproduz as doses históricas dos quatro pneus pesados analisados (resultaria em apenas ~21,7 fl oz para um pneu 295/80 R22,5, quando a tabela histórica auditada registra 32 fl oz).

> [!IMPORTANT]
> **Esclarecimento Metodológico sobre a Fórmula ASI /22:**
> - A documentação ASI exige explicitamente o *WIDTH OF TREAD* (largura real da banda de rodagem).
> - O comparativo exploratório utilizou a largura nominal da seção (*nominal section width*) como proxy dimensional simplificado.
> - Portanto, este comparativo **NÃO invalida a fórmula ASI** quando aplicada com o *tread width* real medido diretamente no pneu.
> - A regra empírica `/15` **NÃO substitui** a fórmula documental ASI `/22`, que permanece integralmente catalogada e preservada (`/22` para >45 mph e `/10` para <45 mph).

---

## 2. Base Matemática da Regra Empírica /15

A modelagem utiliza os quatro pneus pesados métricos documentados na *Tabela Resumida Veículos* (acervo histórico auditado):

1. **`215/75 R17,5`** = 17,0 fl oz
2. **`275/80 R22,5`** = 28,0 fl oz
3. **`295/80 R22,5`** = 32,0 fl oz *(dose histórica tabelada na Tabela Resumida)*
4. **`305/70 R22,5`** = 32,0 fl oz

### Fórmulas Geométricas Nominais:
Para cada medida com largura nominal $L_{\text{mm}}$, perfil $P$ e aro $A_{\text{pol}}$:
$$\text{Flanco (mm)} = \frac{L_{\text{mm}} \times P}{100}$$
$$\text{Diâmetro Externo Nominal (pol)} = A_{\text{pol}} + 2 \times \left(\frac{\text{Flanco (mm)}}{25,4}\right)$$
$$\text{Largura Nominal (pol)} = \frac{L_{\text{mm}}}{25,4}$$
$$\text{Produto Geométrico} = \text{Diâmetro Externo (pol)} \times \text{Largura Nominal (pol)}$$
$$\text{Divisor Implícito} = \frac{\text{Produto Geométrico}}{\text{Dose Tabelada}}$$

### Divisores Implícitos por Medida:
- **`215/75 R17,5`**: Produto = 255,60 $\rightarrow$ Divisor Implícito = **~15,04** (15,0355)
- **`275/80 R22,5`**: Produto = 431,15 $\rightarrow$ Divisor Implícito = **~15,40** (15,3983)
- **`295/80 R22,5`**: Produto = 477,14 $\rightarrow$ Divisor Implícito = **~14,91** (14,9107)
- **`305/70 R22,5`**: Produto = 472,04 $\rightarrow$ Divisor Implícito = **~14,75** (14,7513)

### Regressão por Mínimos Quadrados:
Para determinar o melhor divisor conjunto $k$ que minimiza o erro quadrático das dosagens:
$$k = \frac{\sum \text{Produto}_i^2}{\sum (\text{Dose}_i \times \text{Produto}_i)} \approx \mathbf{14,9966}$$

Trata-se de uma **regra empírica provisória com alta aderência aos quatro pontos históricos pesados métricos atualmente disponíveis**. Ressalta-se que a inclusão de novas evidências ou dados operacionais futuros poderá recalibrar o divisor.

---

## 3. Comparativo /22, /17 e /15

A tabela abaixo compara o comportamento dos divisores contra as dosagens tabeladas da *Tabela Resumida Veículos*:

| Medida | Dose Tabelada | Dose /22 | Erro /22 (%) | Dose /17 | Erro /17 (%) | Dose /15 | Erro /15 (%) |
|---|---:|---:|---:|---:|---:|---:|---:|
| **215/75 R17,5** | 17,0 fl oz | 11,62 fl oz | -31,7% | 15,04 fl oz | -11,6% | 17,04 fl oz | +0,2% |
| **275/80 R22,5** | 28,0 fl oz | 19,60 fl oz | -30,0% | 25,36 fl oz | -9,4% | 28,74 fl oz | +2,7% |
| **295/80 R22,5** | 32,0 fl oz | 21,69 fl oz | -32,2% | 28,07 fl oz | -12,3% | 31,81 fl oz | -0,6% |
| **305/70 R22,5** | 32,0 fl oz | 21,46 fl oz | -32,9% | 27,77 fl oz | -13,2% | 31,47 fl oz | -1,7% |

### Métricas Agregadas de Ajuste:

| Divisor | MAE (Erro Médio Absoluto) | MAPE (Erro Percentual Médio) | Avaliação Técnica |
|---|---:|---:|---|
| **/22 (ASI Original)** | **8,66 fl oz** | **31,71%** | O uso exploratório da fórmula /22 com LARGURA NOMINAL DA SEÇÃO não reproduz as doses históricas dos quatro pneus pesados analisados. |
| **/17** | **3,19 fl oz** | **11,62%** | Aproximação intermediária com resíduo sistemático em relação às doses históricas tabeladas. |
| **/15 (Regra Empírica)** | **0,38 fl oz** | **1,29%** | Regra empírica provisória com alta aderência aos quatro pontos históricos pesados métricos atualmente disponíveis (MAPE ~1,29%). Sujeita a recalibração com novas evidências. |

---

## 4. Fórmula Documental ASI /10 (< 45 MPH)

A fórmula com divisor 10 é **DOCUMENTALMENTE** a regra original da ASI Chemical Inc. para veículos que operam abaixo de 45 mph (maquinário industrial, tratores agrícolas e equipamentos fora de estrada).

> [!NOTE]
> Assim como a fórmula `/22`, a regra `/10` utiliza na especificação do fabricante:
> - Altura total real do pneu;
> - Largura real da banda de rodagem (*Width of Tread*).
>
> **Diretriz Técnica:** Não se deve afirmar ou assumir que qualquer medida nominal de trator ou maquinário pesado possa ser convertida automaticamente com `/10` sem validação equivalente e medição dimensional direta.

---

## 5. Implementação Isolada no Código

A função foi implementada em `lib/dosage.ts`:

```typescript
export interface HeavyRoadEmpiricalParams {
  nominalWidthMm: number
  aspectRatio: number
  rimInches: number
}

export interface HeavyRoadEmpiricalResult {
  outerDiameterInches: number
  nominalWidthInches: number
  rawOunces: number
  divisor: 15
  method: 'empirical_heavy_road'
}

export function calculateHeavyRoadDoseEmpirical(params: HeavyRoadEmpiricalParams): HeavyRoadEmpiricalResult
```

### Isolamento de Segurança:
- **NÃO conectada** à função pública `getDosageOz`.
- **NÃO conectada** a nenhuma interface pública (`app/calculadora`, `app/solicitar`, `app/app/*`).
- O catálogo e as tabelas históricas auditadas continuam tendo prioridade absoluta sobre qualquer cálculo.

---

## 6. Caso Exploratório: Medida 385/80 R22,5

A medida `385/80 R22,5` (super single / semi-reboques e eixos direcionais pesados especiais):

- **Largura nominal:** 385 mm ($15,1575''$)
- **Perfil:** 80 ($308,0\text{ mm}$ de flanco)
- **Diâmetro externo nominal:** $22,5 + 2 \times \frac{308}{25,4} = 46,7520''$
- **Produto geométrico:** $46,7520 \times 15,1575 = 708,6416$
- **Dose exploratória calculada (/15):**
  $$\text{Dose} = \frac{708,6416}{15} \approx \mathbf{47,24\text{ fl oz}} \quad (47,2428\text{ fl oz})$$

> [!WARNING]
> A medida `385/80 R22,5` **NÃO foi incluída no catálogo oficial**.
> - Classificação hierárquica: **Nível E** (Cálculo empírico provisório não validado em tabela documental).
> - Consultas a `getDosageOz('385/80 R22,5')` retornam estritamente `null`.
> - Necessita de validação operacional prévia antes de qualquer recomendação ao cliente final.

---

## 7. Hierarquia Documental da Dosagem Flat Free

Para assegurar rigor técnico, consistência e rastreabilidade na plataforma, adota-se a seguinte taxonomia de confiabilidade documental:

```
[NÍVEL A] Fonte atual do fabricante
      │   (validação direta contemporânea emitida pelo fabricante do produto, quando houver)
      ▼
[NÍVEL B] Tabela histórica auditada do acervo local
      │   (documentos históricos da Revix / ASI Chemical; ex.: 275/80 R22,5 = 28 fl oz, 295/80 R22,5 = 32 fl oz)
      ▼
[NÍVEL C] Decisão canônica do projeto
      │   (resolução deliberada e formalizada após auditoria técnica de divergências documentais)
      ▼
[NÍVEL D] Cálculo documental ASI com dimensões reais medidas
      │   (Fórmula ASI original com divisor 22 ou 10, utilizando medição real de Width of Tread e altura)
      ▼
[NÍVEL E] Cálculo empírico provisório
      │   (regra empírica provisória /15 para pesados métricos sem dose tabelada; ex.: 385/80 R22,5 ≈ 47,24 fl oz)
      ▼
[NÍVEL F] Conflito documental / histórico pendente
      │   (Status historical_conflict: divergência no acervo histórico; bloqueado, retorna null na API pública)
      ▼
[NÍVEL G] Medida sem fonte ou cálculo não validado
          (Retorna null — exige levantamento dimensional direto e consulta com engenharia)
```
