const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove parseXlsbSorting
const pxStart = content.indexOf('function parseXlsbSorting(wb) {');
const pxEnd = content.indexOf('function parseProductMaster(wb) {');
if (pxStart > -1 && pxEnd > -1) {
    content = content.substring(0, pxStart) + content.substring(pxEnd);
}

// 2. Remove xlsbSorting state
content = content.replace(/const \[xlsbSorting, setXlsbSorting\] = useState\(\[\]\);\n\s*/, '');
content = content.replace(/setXlsbSorting\(data\.xlsbSorting \|\| \[\]\);\n\s*/, '');

// 3. Remove from persist and localForage
content = content.replace(/productMaster, prodDataByKey, xlsbSorting, payRates, importLog/g, 'productMaster, prodDataByKey, payRates, importLog');
content = content.replace(/xlsbSorting: sorting, importLog: newLog/g, 'importLog: newLog');

// 4. Remove handleDailyFile
const hdfStart = content.indexOf('const handleDailyFile = async (file) => {');
const hdfEnd = content.indexOf('return (', hdfStart);
if (hdfStart > -1 && hdfEnd > -1) {
    // wait, there's another function? no, return is the start of render
    content = content.substring(0, hdfStart) + content.substring(hdfEnd);
}

// 5. Remove onDailyFile prop and xlsbCount
content = content.replace(/onDailyFile=\{handleDailyFile\}\n\s*/, '');
content = content.replace(/xlsbCount=\{xlsbSorting\.length\}\n\s*/, '');
content = content.replace(/xlsbSorting=\{xlsbSorting\} /, '');
content = content.replace(/xlsbCount=\{xlsbCount\} /, '');
content = content.replace(/function EfficiencyPanel\(\{ prodData, payRates, productMasterByCode, xlsbSorting \}\)/, 'function EfficiencyPanel({ prodData, payRates, productMasterByCode })');
content = content.replace(/function SettingsPanel\(\{ payRates, onSave, importLog, prodDataCount, productMasterCount, xlsbCount, joinStats \}\)/, 'function SettingsPanel({ payRates, onSave, importLog, prodDataCount, productMasterCount, joinStats })');
content = content.replace(/<StatBox label="Sorting-KG entries" value=\{xlsbCount\} \/>\n\s*/, '');

// 6. Update BazanaStats
const bazanaStatsStart = content.indexOf('const bazanaStats = useMemo(() => {');
const bazanaStatsEnd = content.indexOf('}, [prodData, payRates, xlsbSorting]);');
if (bazanaStatsStart > -1 && bazanaStatsEnd > -1) {
    const newBazana = `const bazanaStats = useMemo(() => {
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
  `;
    content = content.substring(0, bazanaStatsStart) + newBazana + content.substring(bazanaStatsEnd);
}

// 7. Update UI text for Bazana
content = content.replace(
  /Matched \{bazanaStats\.matchedDays\} of \{bazanaStats\.totalBazanaDaysInProdData\} days[\s\S]*?by individual product\./,
  "Bazana Sorting KG/Worker is calculated by tracking 'Sorting Kg' entries under the Pre-sorting phase against the Bazana Sorting manpower logged in the Master file."
);

// 8. Remove Daily report upload box
const uploadBoxStart = content.indexOf('{!(prodDataCount > 0 && productMasterCount > 0) && (');
const uploadBoxEnd = content.indexOf('</div>', content.indexOf('</div>', uploadBoxStart) + 1) + 6; // Two divs down? 
// Let's just regex this one safely
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

fs.writeFileSync(file, content, 'utf8');
console.log("Done fixing bazana correctly");
