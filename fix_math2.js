const fs = require('fs');

const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

dashContent = dashContent.replace(/byMonth\[monthKey\]\.stdWeightedSum \+= row\.kgWorkerStd \* row\.output;/g, 'byMonth[monthKey].expectedManpower += row.output / row.kgWorkerStd;');
dashContent = dashContent.replace(/groups\[key\]\.stdWeightedSum \+= row\.kgWorkerStd \* row\.output;/g, 'groups[key].expectedManpower += row.output / row.kgWorkerStd;');

// For month
dashContent = dashContent.replace(/month: monthKey, weightedManpower: 0, qty: 0, stdWeightedSum: 0, stdWeight: 0/g, 'month: monthKey, weightedManpower: 0, qty: 0, expectedManpower: 0, stdWeight: 0');
dashContent = dashContent.replace(/std: m\.stdWeight > 0 \? Math\.round\(m\.stdWeightedSum \/ m\.stdWeight\) : 0,/g, 'std: m.expectedManpower > 0 ? Math.round(m.stdWeight / m.expectedManpower) : 0,');

// For groups
dashContent = dashContent.replace(/key, weightedManpower: 0, qty: 0, stdWeightedSum: 0, stdWeight: 0/g, 'key, weightedManpower: 0, qty: 0, expectedManpower: 0, stdWeight: 0');
dashContent = dashContent.replace(/std: g\.stdWeight > 0 \? Math\.round\(g\.stdWeightedSum \/ g\.stdWeight\) : 0,/g, 'std: g.expectedManpower > 0 ? Math.round(g.stdWeight / g.expectedManpower) : 0,');

fs.writeFileSync(dashFile, dashContent, 'utf8');
console.log("Fixed mathematical calculation with regex");
