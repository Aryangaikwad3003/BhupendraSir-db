const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const out = [];
let skip = false;
let foundReturnNull = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('if (!dataLoaded) return null;')) {
    out.push(line);
    foundReturnNull = true;
    continue;
  }

  // If we just saw our return null, skip the Loading dashboard return block
  if (foundReturnNull) {
    if (line.includes('return (') && lines[i+1] && lines[i+1].includes('Loading dashboard')) {
      skip = true;
    }
    if (skip && line.trim() === '}') {
      skip = false;
      foundReturnNull = false; // done skipping
      continue;
    }
    if (skip) continue;
  }

  out.push(line);
}

fs.writeFileSync(file, out.join('\n'), 'utf8');
console.log("Fixed return block");
