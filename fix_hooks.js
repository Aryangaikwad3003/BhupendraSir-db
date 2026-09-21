const fs = require('fs');
const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let c = fs.readFileSync(dashFile, 'utf8');

// I need to pull out regularStatsMonthly so it sits OUTSIDE regularStats.
const badCode = `      
  const regularStatsMonthly = useMemo(() => {
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
  }, [filtered, payRates]);
  
  return Object.values(groups).map(g => ({`;

const goodCode = `return Object.values(groups).map(g => ({`;

c = c.replace(badCode, goodCode);

const afterRegularStats = `  }, [filtered, payRates, productMasterByCode, groupBy]);`;
const replacementAfter = `  }, [filtered, payRates, productMasterByCode, groupBy]);

  const regularStatsMonthly = useMemo(() => {
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

c = c.replace(afterRegularStats, replacementAfter);

fs.writeFileSync(dashFile, c, 'utf8');
console.log("Fixed hooks error");
