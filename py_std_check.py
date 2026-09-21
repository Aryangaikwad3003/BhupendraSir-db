import openpyxl
from collections import defaultdict

wb = openpyxl.load_workbook('Master file- Summary - Proj VS actual.xlsx', data_only=True, read_only=True)
ws = wb['Prod data']
rows = ws.iter_rows(values_only=True)

# skip 5 rows
for _ in range(5):
    next(rows)

headers = next(rows)
fg_code_idx = 41
kg_std_idx = 46

data = defaultdict(set)
for r in rows:
    if len(r) > max(fg_code_idx, kg_std_idx):
        fg = r[fg_code_idx]
        std = r[kg_std_idx]
        if fg and str(fg).strip():
            if std is not None and str(std).strip():
                data[str(fg).strip()].add(std)

mismatches = 0
for fg, stds in data.items():
    if len(stds) > 1:
        print(f"FG {fg} has multiple STDs: {stds}")
        mismatches += 1

if mismatches == 0:
    print("All FG CODEs have perfectly constant STDs.")
