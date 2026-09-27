# Comparação exploratória ASI /22 × catálogo

Gerado por `scripts/analyze_dosage_formula.ts`. Apenas medidas métricas com status `confirmed` entram nas estatísticas.

Hipótese: largura nominal de seção aproxima a largura da banda. Isso não comprova equivalência física nem valida uma dose.
Flanco (mm) = largura × perfil / 100; diâmetro (pol) = aro + 2 × flanco / 25,4; dose (fl oz) = diâmetro × (largura / 25,4) / 22.
Diferença = calculado − tabelado; percentual usa a dose tabelada como denominador. Estatísticas usam valores sem arredondamento; somente a exibição é arredondada.
Sem fator corretivo, arredondamento comercial, acréscimo por desgaste ou fallback público. /22 é uma hipótese uniforme de comparação, não uma atribuição de regime operacional às categorias.

| Categoria | N | Erro absoluto médio (fl oz) | Erro percentual absoluto médio | Dentro de ±5% | Dentro de ±10% | Dentro de ±0,5 fl oz |
|---|---:|---:|---:|---:|---:|---:|
| passeio_leve | 44 | 0.3760 | 3.6591% | 32 | 43 | 27 |
| caminhao_onibus | 4 | 8.6598 | 31.7094% | 0 | 0 | 0 |
| trator_maquinario | 0 | N/A | N/A | 0 | 0 | 0 |

## Comparação por medida

| Medida | Categoria | Flanco mm | Diâmetro pol | Largura nominal pol | Tabela fl oz | /22 fl oz | Diferença fl oz | Diferença % |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 165/60 R14 | passeio_leve | 99.0000 | 21.7953 | 6.4961 | 7 | 6.4356 | -0.5644 | -8.0627 |
| 175/60 R14 | passeio_leve | 105.0000 | 22.2677 | 6.8898 | 7 | 6.9736 | -0.0264 | -0.3771 |
| 185/55 R15 | passeio_leve | 101.7500 | 23.0118 | 7.2835 | 8 | 7.6184 | -0.3816 | -4.7695 |
| 185/60 R15 | passeio_leve | 111.0000 | 23.7402 | 7.2835 | 8 | 7.8596 | -0.1404 | -1.7553 |
| 185/65 R14 | passeio_leve | 120.2500 | 23.4685 | 7.2835 | 8 | 7.7696 | -0.2304 | -2.8795 |
| 185/65 R15 | passeio_leve | 120.2500 | 24.4685 | 7.2835 | 8.5 | 8.1007 | -0.3993 | -4.6976 |
| 185/70 R14 | passeio_leve | 129.5000 | 24.1969 | 7.2835 | 8 | 8.0108 | 0.0108 | 0.1346 |
| 195/55 R16 | passeio_leve | 107.2500 | 24.4449 | 7.6772 | 9 | 8.5303 | -0.4697 | -5.2185 |
| 195/65 R15 | passeio_leve | 126.7500 | 24.9803 | 7.6772 | 9 | 8.7172 | -0.2828 | -3.1424 |
| 205/55 R15 | passeio_leve | 112.7500 | 23.8780 | 8.0709 | 8 | 8.7598 | 0.7598 | 9.4976 |
| 205/55 R17 | passeio_leve | 112.7500 | 25.8780 | 8.0709 | 10 | 9.4935 | -0.5065 | -5.0648 |
| 205/60 R15 | passeio_leve | 123.0000 | 24.6850 | 8.0709 | 8 | 9.0559 | 1.0559 | 13.1987 |
| 205/60 R16 | passeio_leve | 123.0000 | 25.6850 | 8.0709 | 10 | 9.4228 | -0.5772 | -5.7725 |
| 205/65 R15 | passeio_leve | 133.2500 | 25.4921 | 8.0709 | 10 | 9.3520 | -0.6480 | -6.4802 |
| 205/70 R15 | passeio_leve | 143.5000 | 26.2992 | 8.0709 | 10 | 9.6481 | -0.3519 | -3.5194 |
| 205/75 R16 | passeio_leve | 153.7500 | 28.1063 | 8.0709 | 11 | 10.3110 | -0.6890 | -6.2636 |
| 215/45 R17 | passeio_leve | 96.7500 | 24.6181 | 8.4646 | 10 | 9.4719 | -0.5281 | -5.2811 |
| 215/45 R18 | passeio_leve | 96.7500 | 25.6181 | 8.4646 | 10 | 9.8566 | -0.1434 | -1.4335 |
| 215/50 R17 | passeio_leve | 107.5000 | 25.4646 | 8.4646 | 10 | 9.7976 | -0.2024 | -2.0243 |
| 215/55 R16 | passeio_leve | 118.2500 | 25.3110 | 8.4646 | 10 | 9.7385 | -0.2615 | -2.6151 |
| 215/55 R17 | passeio_leve | 118.2500 | 26.3110 | 8.4646 | 10.5 | 10.1232 | -0.3768 | -3.5881 |
| 215/60 R17 | passeio_leve | 129.0000 | 27.1575 | 8.4646 | 10.5 | 10.4489 | -0.0511 | -0.4864 |
| 215/65 R16 | passeio_leve | 139.7500 | 27.0039 | 8.4646 | 11 | 10.3898 | -0.6102 | -5.5468 |
| 215/75 R17,5 | caminhao_onibus | 161.2500 | 30.1969 | 8.4646 | 17 | 11.6183 | -5.3817 | -31.6569 |
| 225/45 R17 | passeio_leve | 101.2500 | 24.9724 | 8.8583 | 10 | 10.0551 | 0.0551 | 0.5512 |
| 225/45 R18 | passeio_leve | 101.2500 | 25.9724 | 8.8583 | 11 | 10.4578 | -0.5422 | -4.9294 |
| 225/50 R17 | passeio_leve | 112.5000 | 25.8583 | 8.8583 | 11 | 10.4118 | -0.5882 | -5.3473 |
| 225/70 R16 | passeio_leve | 157.5000 | 28.4016 | 8.8583 | 12 | 11.4359 | -0.5641 | -4.7012 |
| 235/40 R18 | passeio_leve | 94.0000 | 25.4016 | 9.2520 | 11 | 10.6825 | -0.3175 | -2.8865 |
| 235/50 R18 | passeio_leve | 117.5000 | 27.2520 | 9.2520 | 12 | 11.4607 | -0.5393 | -4.4946 |
| 235/55 R17 | passeio_leve | 129.2500 | 27.1772 | 9.2520 | 12 | 11.4292 | -0.5708 | -4.7567 |
| 235/55 R18 | passeio_leve | 129.2500 | 28.1772 | 9.2520 | 12 | 11.8497 | -0.1503 | -1.2522 |
| 235/60 R16 | passeio_leve | 141.0000 | 27.1024 | 9.2520 | 12 | 11.3977 | -0.6023 | -5.0189 |
| 235/60 R17 | passeio_leve | 141.0000 | 28.1024 | 9.2520 | 12 | 11.8183 | -0.1817 | -1.5143 |
| 235/60 R18 | passeio_leve | 141.0000 | 29.1024 | 9.2520 | 12.5 | 12.2388 | -0.2612 | -2.0894 |
| 235/70 R16 | passeio_leve | 164.5000 | 28.9528 | 9.2520 | 12.5 | 12.1759 | -0.3241 | -2.5927 |
| 245/40 R18 | passeio_leve | 98.0000 | 25.7165 | 9.6457 | 11.5 | 11.2751 | -0.2249 | -1.9553 |
| 245/45 R18 | passeio_leve | 110.2500 | 26.6811 | 9.6457 | 12 | 11.6980 | -0.3020 | -2.5163 |
| 245/45 R20 | passeio_leve | 110.2500 | 28.6811 | 9.6457 | 13 | 12.5749 | -0.4251 | -3.2698 |
| 245/60 R18 | passeio_leve | 147.0000 | 29.5748 | 9.6457 | 13 | 12.9668 | -0.0332 | -0.2557 |
| 245/70 R16 | passeio_leve | 171.5000 | 29.5039 | 9.6457 | 13 | 12.9357 | -0.0643 | -0.4947 |
| 255/45 R20 | passeio_leve | 114.7500 | 29.0354 | 10.0394 | 13.5 | 13.2499 | -0.2501 | -1.8527 |
| 255/55 R18 | passeio_leve | 140.2500 | 29.0433 | 10.0394 | 13.5 | 13.2535 | -0.2465 | -1.8261 |
| 265/60 R18 | passeio_leve | 159.0000 | 30.5197 | 10.4331 | 15 | 14.4734 | -0.5266 | -3.5109 |
| 265/65 R17 | passeio_leve | 172.2500 | 30.5630 | 10.4331 | 15 | 14.4939 | -0.5061 | -3.3740 |
| 275/80 R22,5 | caminhao_onibus | 220.0000 | 39.8228 | 10.8268 | 28 | 19.5979 | -8.4021 | -30.0077 |
| 295/80 R22,5 | caminhao_onibus | 236.0000 | 41.0827 | 11.6142 | 32 | 21.6882 | -10.3118 | -32.2242 |
| 305/70 R22,5 | caminhao_onibus | 213.5000 | 39.3110 | 12.0079 | 32 | 21.4564 | -10.5436 | -32.9486 |

## Exclusões explícitas

| Medida | Categoria | Motivo |
|---|---|---|
| 10.00 R20 | caminhao_onibus | Formato sem perfil métrico explícito; dimensões não inferidas |
| 11.00 R20 | caminhao_onibus | Formato sem perfil métrico explícito; dimensões não inferidas |
| 12,5L R15 | trator_maquinario | Formato sem perfil métrico explícito; dimensões não inferidas |
| 16.7 R20 | trator_maquinario | Formato sem perfil métrico explícito; dimensões não inferidas |
| 165/70 R13 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 17,5 R25 | trator_maquinario | Formato sem perfil métrico explícito; dimensões não inferidas |
| 175/65 R14 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 175/70 R14 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 195/55 R15 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 195/60 R15 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 205/55 R16 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 225/55 R18 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 225/65 R17 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 265/70 R16 | passeio_leve | historical_conflict: sem dose única validada no acervo |
| 8,5 R17,5 | caminhao_onibus | Formato sem perfil métrico explícito; dimensões não inferidas |

A aproximação em leves e a divergência em pesados não demonstram como a tabela foi construída. Não há amostra métrica elegível de maquinário para avaliar /22 nessa categoria.
