const fs = require('fs');

const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

// Fix month-wise calculation
const oldMonthCalc = `        if (row.kgWorkerStd && row.kgWorkerStd > 0) {
          byMonth[monthKey].stdWeightedSum += row.kgWorkerStd * row.output;
          byMonth[monthKey].stdWeight += row.output;
        }`;
const newMonthCalc = `        if (row.kgWorkerStd && row.kgWorkerStd > 0) {
          byMonth[monthKey].expectedManpower += row.output / row.kgWorkerStd;
          byMonth[monthKey].stdWeight += row.output;
        }`;
dashContent = dashContent.replace(oldMonthCalc, newMonthCalc);

const oldMonthInit = `if (!byMonth[monthKey]) byMonth[monthKey] = { month: monthKey, weightedManpower: 0, qty: 0, stdWeightedSum: 0, stdWeight: 0 };`;
const newMonthInit = `if (!byMonth[monthKey]) byMonth[monthKey] = { month: monthKey, weightedManpower: 0, qty: 0, expectedManpower: 0, stdWeight: 0 };`;
dashContent = dashContent.replace(oldMonthInit, newMonthInit);

const oldMonthStd = `std: m.stdWeight > 0 ? Math.round(m.stdWeightedSum / m.stdWeight) : 0,`;
const newMonthStd = `std: m.expectedManpower > 0 ? Math.round(m.stdWeight / m.expectedManpower) : 0,`;
dashContent = dashContent.replace(oldMonthStd, newMonthStd);


// Fix groups calculation (Efficiency panel)
const oldGroupCalc = `        if (row.kgWorkerStd && row.kgWorkerStd > 0) {
          groups[key].stdWeightedSum += row.kgWorkerStd * row.output;
          groups[key].stdWeight += row.output;
        }`;
const newGroupCalc = `        if (row.kgWorkerStd && row.kgWorkerStd > 0) {
          groups[key].expectedManpower += row.output / row.kgWorkerStd;
          groups[key].stdWeight += row.output;
        }`;
dashContent = dashContent.replace(oldGroupCalc, newGroupCalc);

const oldGroupInit = `if (!groups[key]) groups[key] = { key, weightedManpower: 0, qty: 0, stdWeightedSum: 0, stdWeight: 0 };`;
const newGroupInit = `if (!groups[key]) groups[key] = { key, weightedManpower: 0, qty: 0, expectedManpower: 0, stdWeight: 0 };`;
dashContent = dashContent.replace(oldGroupInit, newGroupInit);

const oldGroupStd = `std: g.stdWeight > 0 ? Math.round(g.stdWeightedSum / g.stdWeight) : 0,`;
const newGroupStd = `std: g.expectedManpower > 0 ? Math.round(g.stdWeight / g.expectedManpower) : 0,`;
dashContent = dashContent.replace(oldGroupStd, newGroupStd);

fs.writeFileSync(dashFile, dashContent, 'utf8');
console.log("Fixed mathematical calculation for blended STD");
