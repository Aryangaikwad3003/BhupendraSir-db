const fs = require('fs');
let c = fs.readFileSync('Dashboard.jsx', 'utf8');
let before = c;
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('Dashboard.jsx', c);
console.log("Fixed Dashboard.jsx syntax, changed: " + (before !== c));
