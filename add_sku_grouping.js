const fs = require('fs');

const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

const oldDropdown = `['category', 'By Category']]} />`;
const newDropdown = `['category', 'By Category'], ['sku', 'By SKU (FG Code)']]} />`;
dashContent = dashContent.replace(oldDropdown, newDropdown);

const oldKeyCalc = `const key = groupBy === 'machine' ? (row.machine || 'Unspecified')
          : groupBy === 'category' ? (pm?.category || 'Unspecified')
          : (pm?.product || row.rmName || 'Unspecified');`;
const newKeyCalc = `const key = groupBy === 'machine' ? (row.machine || 'Unspecified')
          : groupBy === 'category' ? (pm?.category || 'Unspecified')
          : groupBy === 'sku' ? (\`\${pm?.product || row.rmName || 'Unknown'} (\${pm?.sku || row.fgCode || 'Unspecified'})\`)
          : (pm?.product || row.rmName || 'Unspecified');`;
dashContent = dashContent.replace(oldKeyCalc, newKeyCalc);

fs.writeFileSync(dashFile, dashContent, 'utf8');
console.log("Added SKU grouping");
