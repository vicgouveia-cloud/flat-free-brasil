# FLAT FREE BRASIL — ANÁLISE MATEMÁTICA E REGRA EMPÍRICA PARA PESADOS RODOVIÁRIOS (/15)

**Lote:** LOTE DOSAGEM 01-TER  
**Data:** 27 de setembro de 2026  
**Repositório:** `vicgouveia-cloud/flat-free-brasil`  
**Branch:** `feature/dosage-catalog-foundation`  
**Referência:** `scripts/analyze_dosage_formula.ts`

---

## 1. Contexto e Objetivo

A fórmula documental original da *ASI Chemical Inc.* (`Tire Chart.pdf`), definida com divisor 22 para veículos rodoviários acima de 45 MPH, foi desenvolvida prioritariamente para veículos leves/passeio utilizando a largura real da banda de rodagem (*tread width*). 

Quando aplicada com dimensões nominais métricas a pneus de caminhões pesados, a fórmula `/22` subestima a dosagem em mais de 30% (resultaria em apenas ~21,7 fl oz para um pneu 295/80 R22,5, quando a tabela histórica e o projeto exigem 32–34 fl oz).

Este documento formaliza e valida a **regra empírica derivada para pesados rodoviários (divisor 15)** a partir das dosagens históricas consagradas nos documentos oficiais da empresa.

> [!IMPORTANT]
> A regra `/15` **NÃO substitui** a fórmula documental ASI `/22`. Ela é catalogada como uma **regra empírica derivada** para pesados rodoviários métricos de alta velocidade. A fórmula documental ASI permanece preservada integralmente (`/22` para >45 mph e `/10` para <45 mph).

---

## 2. Base Matemática do Divisor 15

A modelagem utiliza os quatro pneus pesados métricos documentados na *Tabela Resumida Veículos* (e validados na operação brasileira):

1. **`215/75 R17,5`** = 17,0 fl oz
2. **`275/80 R22,5`** = 28,0 fl oz
3. **`295/80 R22,5`** = 32,0 fl oz *(base histórica tabelada na Tabela Resumida)*
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

O valor inteiro **15** possui aderência estatística quase perfeita aos dados históricos documentados.

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
| **/22 (ASI Original)** | **8,66 fl oz** | **31,71%** | Inaplicável com dimensões nominais de pesados (subdosagem crítica de ~1/3) |
| **/17** | **3,19 fl oz** | **11,62%** | Aproximação intermediária ainda com subdosagem sistemática |
| **/15 (Regra Empírica)** | **0,38 fl oz** | **1,29%** | **Altíssima aderência** ao acervo histórico dos veículos pesados |

---

## 4. Implementação Isolada no Código

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
- O catálogo e as tabelas oficiais continuam tendo prioridade absoluta sobre qualquer cálculo.

---

## 5. Caso Exploratório: Medida 385/80 R22,5

A medida `385/80 R22,5` (super single / semi-reboques e eixos direcionais pesados especiais):

- **Largura nominal:** 385 mm ($15,1575''$)
- **Perfil:** 80 ($308,0\text{ mm}$ de flanco)
- **Diâmetro externo nominal:** $22,5 + 2 \times \frac{308}{25,4} = 46,7520''$
- **Produto geométrico:** $46,7520 \times 15,1575 = 708,6416$
- **Dose exploratória calculada (/15):**
  $$\text{Dose} = \frac{708,6416}{15} \approx \mathbf{47,24\text{ fl oz}} \quad (47,2428\text{ fl oz})$$

> [!WARNING]
> A medida `385/80 R22,5` **NÃO foi incluída no catálogo oficial**.
> - Classificação hierárquica: **Nível D** (Estimativa empírica não validada em tabela documental).
> - Consultas a `getDosageOz('385/80 R22,5')` retornam estritamente `null`.
> - Necessita de validação operacional prévia antes de qualquer recomendação ao cliente final.

---

## 6. Hierarquia Documental da Dosagem Flat Free

Para assegurar consistência e rastreabilidade técnica na plataforma, adota-se a seguinte taxonomia de confiabilidade:

```
[NÍVEL A] Dose tabelada confirmada por fabricante / acervo oficial auditado
      │   (ex.: 275/80 R22,5 = 28 fl oz, 295/80 R22,5 = 32 fl oz)
      ▼
[NÍVEL B] Dose canônica de projeto deliberadamente resolvida
      │   (decisão explícita documentada após auditoria técnica)
      ▼
[NÍVEL C] Fórmula documental ASI com tread width real medido
      │   (Divisor 22 para >45 mph; Divisor 10 para <45 mph)
      ▼
[NÍVEL D] Regra empírica derivada para pesados (/15)
      │   (Estimativa matemática para pneus pesados rodoviários sem dose de tabela)
      ▼
[NÍVEL E] Conflito documental / histórico pendente
      │   (Status historical_conflict: retorna null na API pública)
      ▼
[NÍVEL F] Medida sem fonte ou cálculo não validado
          (Retorna null — exige consulta com suporte técnico de engenharia)
```
