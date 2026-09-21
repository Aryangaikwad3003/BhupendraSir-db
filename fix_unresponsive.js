const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const buf = await file\.arrayBuffer\(\);\n\s*const wb = XLSX\.read\(buf, \{ type: 'array', cellDates: true \}\);/g,
  `const buf = await file.arrayBuffer();\n      await new Promise(resolve => setTimeout(resolve, 100)); // Yield to event loop to prevent "page unresponsive" and allow spinner to render\n      const wb = XLSX.read(buf, { type: 'array', cellDates: true });`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Done adding yields");
