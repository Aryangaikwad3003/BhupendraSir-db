const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. PD_COL updates
content = content.replace(
  /date: 1,\n  machine: 30, fgCode: 41, output: 38,/,
  `date: 1, sortingKg: 4,\n  machine: 30, fgCode: 41, output: 38,`
);

// 2. parseProdData sortingKg addition
content = content.replace(
  /const output = num\(r\[PD_COL\.output\]\);/,
  `const output = num(r[PD_COL.output]);\n    const sortingKg = num(r[PD_COL.sortingKg]);`
);
content = content.replace(
  /output,\n      ladies,\n      gents/,
  `output,\n      sortingKg,\n      ladies,\n      gents`
);

// 3. Remove parseXlsbSorting
content = content.replace(/function parseXlsbSorting[\s\S]*?return \{ rows: out, diag: \{[\s\S]*?\}\n\}\n/m, '');

// 4. Remove xlsbSorting state
content = content.replace(/const \[xlsbSorting, setXlsbSorting\] = useState\(\[\]\);\n/, '');
content = content.replace(/setXlsbSorting\(data\.xlsbSorting \|\| \[\]\);\n/, '');
content = content.replace(/xlsbSorting, /g, ''); // Fix in persist
content = content.replace(/xlsbCount=\{xlsbSorting\.length\} /, '');
content = content.replace(/xlsbSorting=\{xlsbSorting\} /, '');

// 5. Remove handleDailyFile
content = content.replace(/const handleDailyFile = async[\s\S]*?setBusy\(false\);\n  \};\n/m, '');
content = content.replace(/onDailyFile=\{handleDailyFile\}\n\s*/, '');
content = content.replace(/const XLSB_COL = \{ date: 1, bazanaMP: 44, sortingKG: 45 \};\n/, '');

// 6. Update EfficiencyPanel props
content = content.replace(/function EfficiencyPanel\(\{ prodData, payRates, productMasterByCode \}\)/, 'function EfficiencyPanel({ prodData, payRates, productMasterByCode })'); // already removed from props

// 7. Update bazanaStats calculation
const newBazanaStats = `const bazanaStats = useMemo(() => {
    const byMonth = {};
    const byDay = {};

    for (const row of prodData) {
      const dateStr = row.iso;
      if (!dateStr) continue;

      const w = getWeights(payRates, row.month);
      const mp = (row.ladies.bazanaSorting || 0) * w.ladies + (row.gents.bazanaSorting || 0) * w.gents;
      const qty = row.sortingKg || 0;

      if (mp > 0 || qty > 0) {
        if (!byDay[dateStr]) byDay[dateStr] = { date: dateStr, month: row.month, weightedManpower: 0, qty: 0 };
        byDay[dateStr].weightedManpower += mp;
        byDay[dateStr].qty += qty;
        
        if (!byMonth[row.month]) byMonth[row.month] = { month: row.month, weightedManpower: 0, qty: 0 };
        byMonth[row.month].weightedManpower += mp;
        byMonth[row.month].qty += qty;
      }
    }

    const monthly = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)).map(m => ({
      name: monthLabel(m.month),
      actual: m.weightedManpower > 0 ? m.qty / m.weightedManpower : 0,
      qty: m.qty,
    }));

    const daily = Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)).slice(-30).map(d => ({
      name: d.date.substring(5), // MM-DD
      actual: d.weightedManpower > 0 ? d.qty / d.weightedManpower : 0,
      qty: d.qty,
    }));

    return { monthly, daily };
  }, [prodData, payRates]);`;

content = content.replace(/const bazanaStats = useMemo\(\(\) => \{[\s\S]*?\}, \[prodData, payRates\]\);/, newBazanaStats);

// 8. Update Bazana Sorting UI text
content = content.replace(
  /Matched \{bazanaStats\.matchedDays\} of \{bazanaStats\.totalBazanaDaysInProdData\} days[\s\S]*?by individual product\./,
  "Bazana Sorting KG/Worker is calculated by tracking 'Sorting Kg' entries under the Pre-sorting phase against the Bazana Sorting manpower logged in the Master file."
);

// 9. Remove Upload UI Box for Daily Report
content = content.replace(
  /\{!\(prodDataCount > 0 && productMasterCount > 0\) && \([\s\S]*?onDailyFile\(\{ target: \{ files: \[f\] \} \}\)\}\n\s*\/>\n\s*<\/div>\n\s*\)\}\n\s*<\/div>/,
  `{!prodDataCount && (
              <div style={{ padding: 24, background: '#F8FAFC', borderRadius: 8, border: '1px dashed #CBD5E1', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', flex: 1, justifyContent: 'center' }}>
                <Package size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                <div style={{ fontWeight: 600, color: '#334155', marginBottom: 4 }}>No daily report needed</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>Bazana Sorting stats are now pulled directly from the Master File</div>
              </div>
            )}
          </div>`
);

// 10. Update Settings Panel stats box
content = content.replace(/<StatBox label="Sorting-KG entries" value=\{xlsbCount\} \/>\n/, '');
content = content.replace(/xlsbCount, /, '');
content = content.replace(/function SettingsPanel\(\{ payRates, onSave, importLog, prodDataCount, productMasterCount, joinStats \}\)/, 'function SettingsPanel({ payRates, onSave, importLog, prodDataCount, productMasterCount, joinStats })');

fs.writeFileSync(file, content, 'utf8');
console.log("Done refactoring bazana");
