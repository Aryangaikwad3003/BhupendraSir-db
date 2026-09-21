const fs = require('fs');
let c = fs.readFileSync('worker.js', 'utf8');
c = c.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync('worker.js', c);
console.log("Fixed worker.js syntax");
