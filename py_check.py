import openpyxl

wb = openpyxl.load_workbook('Master file- Summary - Proj VS actual.xlsx', data_only=True, read_only=True)
ws = wb['Prod data']
rows = ws.iter_rows(values_only=True)

for i in range(5):
    h = next(rows)
    print(f"ROW {i}:")
    for idx, v in enumerate(h):
        if v:
            print(f"[{idx}] {v}")
