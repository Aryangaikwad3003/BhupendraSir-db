const fs = require('fs');

const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

// For Month-wise
const oldMonthInit = `if (!byMonth[monthKey]) byMonth[monthKey] = { month: monthKey, weightedManpower: 0, qty: 0, expectedManpower: 0, stdWeight: 0 };`;
const newMonthInit = `if (!byMonth[monthKey]) byMonth[monthKey] = { month: monthKey, weightedManpower: 0, qty: 0, exactStd: 0 };`;
dashContent = dashContent.replace(oldMonthInit, newMonthInit);

const oldMonthCalc = `        if (row.kgWorkerStd && row.kgWorkerStd > 0) {
          byMonth[monthKey].expectedManpower += row.output / row.kgWorkerStd;
          byMonth[monthKey].stdWeight += row.output;
        }`;
const newMonthCalc = `        if (row.kgWorkerStd && row.kgWorkerStd > 0) {
          byMonth[monthKey].exactStd = row.kgWorkerStd; // Take directly from file, no formula
        }`;
dashContent = dashContent.replace(oldMonthCalc, newMonthCalc);

const oldMonthStd = `std: m.expectedManpower > 0 ? Math.round(m.stdWeight / m.expectedManpower) : 0,`;
const newMonthStd = `std: Math.round(m.exactStd || 0),`;
dashContent = dashContent.replace(oldMonthStd, newMonthStd);


// For Groups (Efficiency panel)
const oldGroupInit = `if (!groups[key]) groups[key] = { key, weightedManpower: 0, qty: 0, expectedManpower: 0, stdWeight: 0 };`;
const newGroupInit = `if (!groups[key]) groups[key] = { key, weightedManpower: 0, qty: 0, exactStd: 0 };`;
dashContent = dashContent.replace(oldGroupInit, newGroupInit);

const oldGroupCalc = `        if (row.kgWorkerStd && row.kgWorkerStd > 0) {
          groups[key].expectedManpower += row.output / row.kgWorkerStd;
          groups[key].stdWeight += row.output;
        }`;
const newGroupCalc = `        if (row.kgWorkerStd && row.kgWorkerStd > 0) {
          groups[key].exactStd = row.kgWorkerStd; // Take directly from file, no formula
        }`;
dashContent = dashContent.replace(oldGroupCalc, newGroupCalc);

const oldGroupStd = `std: g.expectedManpower > 0 ? Math.round(g.stdWeight / g.expectedManpower) : 0,`;
const newGroupStd = `std: Math.round(g.exactStd || 0),`;
dashContent = dashContent.replace(oldGroupStd, newGroupStd);

fs.writeFileSync(dashFile, dashContent, 'utf8');
console.log("Removed STD math");
