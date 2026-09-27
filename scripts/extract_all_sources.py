import os, re, openpyxl, xlrd, pypdf
from collections import defaultdict

base = r'F:\Victor\TRABALHO\Flat Free'

def norm_measure(raw):
    if not raw: return None
    s = str(raw).strip().replace(',', '.')
    s = re.sub(r'\s+', ' ', s)
    # 165 60 14
    m = re.match(r'^(\d{3})\s+(\d{2})\s+(\d{2})$', s)
    if m: return f'{m.group(1)}/{m.group(2)} R{m.group(3)}'
    # 165/70/13 or 165/70R13 or 165/70 R13
    m = re.match(r'^(\d{3})/(\d{2})[/\s]*R?(\d{2}(\.5)?)$', s, re.IGNORECASE)
    if m: return f'{m.group(1)}/{m.group(2)} R{m.group(3)}'
    # 8.5R/17.5
    m = re.match(r'^(\d+\.?\d*)\s*R/?(\d{2}\.?\d*)$', s, re.IGNORECASE)
    if m: return f'{m.group(1)} R{m.group(2)}'
    # 10.00/20 or 11.00/20
    m = re.match(r'^(\d{2}\.00)[/\s-]*R?(\d{2})$', s, re.IGNORECASE)
    if m: return f'{m.group(1)} R{m.group(2)}'
    # 12.5L/15
    m = re.match(r'^(\d+\.?\d*)\s*L/?(\d{2})$', s, re.IGNORECASE)
    if m: return f'{m.group(1)}L R{m.group(2)}'
    # 16.7/20 or 17.5/25
    m = re.match(r'^(\d{2}\.?\d*)[/\s]*R?(\d{2})$', s, re.IGNORECASE)
    if m: return f'{m.group(1)} R{m.group(2)}'
    return s

all_observations = defaultdict(list)

# 1. Tabela Resumida Veículos (Sheet2 of Quantidade-Montadoras.xlsx)
wb_qm = openpyxl.load_workbook(os.path.join(base, 'Quantidade-Montadoras.xlsx'), data_only=True)
ws_s2 = wb_qm['Sheet2']
for r in range(4, ws_s2.max_row+1):
    p_l = ws_s2.cell(r, 2).value
    d_l = ws_s2.cell(r, 3).value
    if p_l and d_l:
        all_observations[norm_measure(p_l)].append({
            'source': 'Tabela Resumida Veículos (Leves)',
            'raw': str(p_l).strip(),
            'dose': float(d_l),
            'category': 'Passeio / Veículo Leve',
            'detail': f'Aro {ws_s2.cell(r, 1).value}'
        })
    p_p = ws_s2.cell(r, 8).value
    d_p = ws_s2.cell(r, 9).value
    if p_p and d_p:
        cat = 'Tratores e Maquinário Pesado' if float(d_p) > 50 else 'Caminhões e Ônibus'
        all_observations[norm_measure(p_p)].append({
            'source': 'Tabela Resumida Veículos (Pesados)',
            'raw': str(p_p).strip(),
            'dose': float(d_p),
            'category': cat,
            'detail': f'Aro {ws_s2.cell(r, 7).value}'
        })

# 2. DOSAGEM.xls - GM
wb_d = xlrd.open_workbook(os.path.join(base, 'QUANTIDADES MONTADORAS', 'DOSAGEM.xls'))
ws = wb_d.sheet_by_name('GM')
for r in range(18, 34):
    veh = ws.cell_value(r, 3)
    pneu = ws.cell_value(r, 4)
    dose = ws.cell_value(r, 5)
    if pneu and dose != '':
        all_observations[norm_measure(pneu)].append({
            'source': 'DOSAGEM.xls / Doses GM.pdf',
            'raw': str(pneu).strip(),
            'dose': float(dose),
            'category': 'Passeio / Veículo Leve',
            'detail': f'GM {veh}'
        })

# 3. DOSAGEM.xls - Volkswagen
ws = wb_d.sheet_by_name('Volkswagen')
for r in range(17, ws.nrows):
    veh = ws.cell_value(r, 3)
    dose = ws.cell_value(r, 4)
    pneu = ws.cell_value(r, 5) if ws.ncols > 5 else ''
    if pneu and dose != '':
        all_observations[norm_measure(pneu)].append({
            'source': 'DOSAGEM.xls / Doses Volkswagen.pdf',
            'raw': str(pneu).strip(),
            'dose': float(dose),
            'category': 'Passeio / Veículo Leve',
            'detail': f'VW {veh}'
        })

# 4. DOSAGEM.xls - Kia
ws = wb_d.sheet_by_name('Kia')
for r in range(17, 26):
    veh = ws.cell_value(r, 2)
    w = int(float(ws.cell_value(r, 3)))
    h = int(float(ws.cell_value(r, 4)))
    rim = int(float(ws.cell_value(r, 5)))
    dose = float(ws.cell_value(r, 6))
    pneu = f'{w}/{h} R{rim}'
    all_observations[norm_measure(pneu)].append({
        'source': 'DOSAGEM.xls / Doses Kia.pdf',
        'raw': f'{w} {h} {rim}',
        'dose': dose,
        'category': 'Passeio / SUV / Leve',
        'detail': f'Kia {veh}'
    })

# 5. DOSAGEM.xls - Mitsubishi
ws = wb_d.sheet_by_name('Mitsubishi')
for r in range(17, 27):
    veh = ws.cell_value(r, 3)
    pneu = ws.cell_value(r, 4)
    dose = ws.cell_value(r, 5)
    if pneu and dose != '':
        all_observations[norm_measure(pneu)].append({
            'source': 'DOSAGEM.xls / Doses Mitsubishi.pdf',
            'raw': str(pneu).strip(),
            'dose': float(dose),
            'category': 'Passeio / SUV / Leve',
            'detail': f'Mitsubishi {veh}'
        })

# 6. DOSAGEM.xls - Renault
ws = wb_d.sheet_by_name('Sheet1')
for r in range(16, 22):
    veh = ws.cell_value(r, 3)
    pneu = ws.cell_value(r, 4)
    dose = ws.cell_value(r, 5)
    if pneu and dose != '':
        all_observations[norm_measure(pneu)].append({
            'source': 'DOSAGEM.xls / Doses Renault.pdf',
            'raw': str(pneu).strip(),
            'dose': float(dose),
            'category': 'Passeio / Veículo Leve',
            'detail': f'Renault {veh}'
        })

# 7. Doses Ford.pdf
ford_data = [
    ('Ka (ant.)', '165/70/13', 6.5),
    ('Fiesta', '175/65/14', 7.0),
    ('Ka', '175/65/14', 7.0),
    ('Courrier', '175/70/14', 7.5),
    ('New Fiesta HB', '185/60/15', 8.0),
    ('New Fiesta SD', '195/60/15', 9.0),
    ('Focus Antigo', '195/60/15', 9.0),
    ('Focus Titanium', '205/55/16', 9.5),
    ('EcoSport', '205/65/15', 10.0),
    ('Fusion', '225/50/17', 11.0),
    ('Ranger', '245/70/16', 13.0),
]
for veh, pneu, dose in ford_data:
    all_observations[norm_measure(pneu)].append({
        'source': 'Doses Ford.pdf',
        'raw': pneu,
        'dose': dose,
        'category': 'Passeio / Utilitário',
        'detail': f'Ford {veh}'
    })

# 8. Doses Fiat.pdf + Quantidade-Montadoras (Fiat)
# Linking vehicles from Doses Fiat.pdf with tire specs from Quantidade-Montadoras.xlsx (Fiat)
fiat_data = [
    ('Palio', '175/65/14', 7.0),
    ('Siena', '175/65/14', 7.0),
    ('Uno Mille', '165/70/13', 7.0),
    ('Fiat 500', '185/55/15', 8.0),
    ('Palio Weekend', '185/65/14', 8.0),
    ('Strada', '175/70/14', 8.0),
    ('Uno Sporting', '185/60/15', 8.0),
    ('Bravo (Aro 16)', '205/55/16', 9.0),
    ('Idea', '195/60/15', 9.0),
    ('Linea', '195/65/15', 9.0),
    ('Bravo (Aro 17)', '215/45/17', 10.0),
    ('Doblò', '205/70/15', 10.0),
    ('Strada Adventure', '205/70/15', 10.0),
    ('Duccato', '205/75/16', 11.0),
]
for veh, pneu, dose in fiat_data:
    all_observations[norm_measure(pneu)].append({
        'source': 'Doses Fiat.pdf / Quantidade-Montadoras (Fiat)',
        'raw': pneu,
        'dose': dose,
        'category': 'Passeio / Utilitário',
        'detail': f'Fiat {veh}'
    })

# 9. Additional montadora sheets in Quantidade-Montadoras: Peugeot, Toyota, Honda, Nissan, Citroen
# Let's extract explicit pneu & dose pairs
# Peugeot
ws_p = wb_qm['Peugeot']
for r in [4, 6, 7, 8, 9, 10, 11, 12]:
    veh = ws_p.cell(r, 1).value
    pneu = ws_p.cell(r, 2).value
    dose = ws_p.cell(r, 3).value
    if pneu and dose:
        all_observations[norm_measure(pneu)].append({
            'source': 'Quantidade-Montadoras (Peugeot)',
            'raw': str(pneu).strip(),
            'dose': float(dose),
            'category': 'Passeio',
            'detail': f'Peugeot {veh}'
        })

# Toyota
ws_toy = wb_qm['Toyota']
for r in range(4, 7):
    veh = ws_toy.cell(r, 1).value
    dose = ws_toy.cell(r, 4).value
    pneu = ws_toy.cell(r, 5).value
    if pneu and dose:
        all_observations[norm_measure(pneu)].append({
            'source': 'Quantidade-Montadoras (Toyota)',
            'raw': str(pneu).strip(),
            'dose': float(dose),
            'category': 'Passeio / SUV',
            'detail': f'Toyota {veh}'
        })

# Citroen
ws_cit = wb_qm['Citroen']
for r in range(8, 18):
    veh = ws_cit.cell(r, 1).value
    pneu = ws_cit.cell(r, 2).value
    dose = ws_cit.cell(r, 3).value
    if pneu and dose:
        all_observations[norm_measure(pneu)].append({
            'source': 'Quantidade-Montadoras (Citroen)',
            'raw': str(pneu).strip(),
            'dose': float(dose),
            'category': 'Passeio',
            'detail': f'Citroen {veh}'
        })

print(f'Total distinct normalized measures extracted: {len(all_observations)}')
print('='*80)
for norm in sorted(all_observations.keys()):
    obs = all_observations[norm]
    doses = set(o['dose'] for o in obs)
    cat = obs[0]['category']
    sources = set(o['source'].split('/')[0].strip() for o in obs)
    if len(doses) == 1:
        status = 'COINCIDENT'
    else:
        status = 'DIVERGENT'
    print(f'{norm:18} | Status: {status:10} | Doses: {sorted(list(doses))} | Cat: {cat[:20]:20} | Obs count: {len(obs)}')
    if len(doses) > 1:
        for o in obs:
            dose_val = o['dose']
            src_val = o['source']
            det_val = o['detail']
            print(f"   -> {dose_val} oz from {src_val} ({det_val})")
