const fs = require('fs');
const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let c = fs.readFileSync(dashFile, 'utf8');

// The block we want to entirely remove (the nested regularStatsMonthly)
const regexNested = /const regularStatsMonthly = useMemo\(\(\) => \{\s+const byMonth = \{\};\s+for \(const row of filtered\) \{\s+const monthKey = row\.month;\s+if \(!byMonth\[monthKey\]\) byMonth\[monthKey\] = \{ month: monthKey, weightedManpower: 0, qty: 0, exactStd: 0 \};\s+const w = getWeights\(payRates, row\.month\);\s+const ladiesRegular = row\.ladies\.total - row\.ladies\.bazanaSorting;\s+const gentsRegular = row\.gents\.total - row\.gents\.bazanaSorting - row\.gents\.loadingUnloading;\s+const weightedManpower = Math\.max\(0, ladiesRegular\) \* w\.ladies \+ Math\.max\(0, gentsRegular\) \* w\.gents;\s+byMonth\[monthKey\]\.weightedManpower \+= weightedManpower;\s+byMonth\[monthKey\]\.qty \+= row\.output;\s+if \(row\.kgWorkerStd && row\.kgWorkerStd > 0\) \{ byMonth\[monthKey\]\.exactStd = row\.kgWorkerStd; \}\s+\}\s+return Object\.values\(byMonth\)\.map\(m => \(\{\s+name: monthLabel\(m\.month\),\s+actual: m\.weightedManpower > 0 \? Math\.round\(m\.qty \/ m\.weightedManpower\) : 0,\s+std: Math\.round\(m\.exactStd \|\| 0\),\s+qty: m\.qty,\s+\}\)\)\.filter\(m => m\.qty > 0\)\.sort\(\(a, b\) => a\.name\.localeCompare\(b\.name\)\);\s+\}, \[filtered, payRates\]\);/;

c = c.replace(regexNested, '');

// The block we want to UPDATE (the top-level regularStatsMonthly)
const topLevelOld = `  const regularStatsMonthly = useMemo(() => {
    const byMonth = {};
    for (const row of filtered) {
      const monthKey = row.month;
      if (!byMonth[monthKey]) byMonth[monthKey] = { month: monthKey, weightedManpower: 0, qty: 0, exactStd: 0 };
      const w = getWeights(payRates, row.month);
      const ladiesRegular = row.ladies.total - row.ladies.bazanaSorting;
      const gentsRegular = row.gents.total - row.gents.bazanaSorting - row.gents.loadingUnloading;
      const weightedManpower = Math.max(0, ladiesRegular) * w.ladies + Math.max(0, gentsRegular) * w.gents;
      byMonth[monthKey].weightedManpower += weightedManpower;
      byMonth[monthKey].qty += row.output;
      if (row.kgWorkerStd && row.kgWorkerStd > 0) { byMonth[monthKey].exactStd = row.kgWorkerStd; }
    }
    return Object.values(byMonth).map(m => ({
      name: monthLabel(m.month),
      actual: m.weightedManpower > 0 ? Math.round(m.qty / m.weightedManpower) : 0,
      std: Math.round(m.exactStd || 0),
      qty: m.qty,
    })).filter(m => m.qty > 0).sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, payRates]);`;

const topLevelNew = `  const regularStatsMonthly = useMemo(() => {
    let globalExactStd = 0;
    for (const row of filtered) {
      if (row.kgWorkerStd && row.kgWorkerStd > 0) {
        globalExactStd = row.kgWorkerStd; // Take the standard once for the entire filtered view
        break; // Stop looking once we find it, so it stays fixed for all months
      }
    }

    const byMonth = {};
    for (const row of filtered) {
      const monthKey = row.month;
      if (!byMonth[monthKey]) byMonth[monthKey] = { month: monthKey, weightedManpower: 0, qty: 0 };
      const w = getWeights(payRates, row.month);
      const ladiesRegular = row.ladies.total - row.ladies.bazanaSorting;
      const gentsRegular = row.gents.total - row.gents.bazanaSorting - row.gents.loadingUnloading;
      const weightedManpower = Math.max(0, ladiesRegular) * w.ladies + Math.max(0, gentsRegular) * w.gents;
      byMonth[monthKey].weightedManpower += weightedManpower;
      byMonth[monthKey].qty += row.output;
    }
    return Object.values(byMonth).map(m => ({
      name: monthLabel(m.month),
      actual: m.weightedManpower > 0 ? Math.round(m.qty / m.weightedManpower) : 0,
      std: Math.round(globalExactStd), // Perfectly straight line for all months
      qty: m.qty,
    })).filter(m => m.qty > 0).sort((a, b) => a.name.localeCompare(b.name));
  }, [filtered, payRates]);`;

if (c.includes(topLevelOld)) {
    c = c.replace(topLevelOld, topLevelNew);
    fs.writeFileSync(dashFile, c, 'utf8');
    console.log("Fixed regularStatsMonthly to use a global constant STD");
} else {
    console.log("Could not find topLevelOld block to replace!");
}
