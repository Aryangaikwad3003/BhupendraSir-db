const fs = require('fs');
const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

dashContent = dashContent.replace(/if \(row\.kgWorkerStd && row\.kgWorkerStd > 0\) \{\s+groups\[key\]\.expectedManpower \+= row\.output \/ row\.kgWorkerStd;\s+groups\[key\]\.stdWeight \+= row\.output;\s+\}/g, 
  'if (row.kgWorkerStd && row.kgWorkerStd > 0) { groups[key].exactStd = row.kgWorkerStd; }');

fs.writeFileSync(dashFile, dashContent, 'utf8');
console.log("Fixed exactStd assignment");
