const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const out = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('if (!dataLoaded) return null;')) {
    out.push(line);
    skip = true;
    continue;
  }

  if (skip) {
    if (line.includes('return (') && lines[i+1] && lines[i+1].includes('TopBar')) {
      skip = false;
      out.push(line);
      continue;
    }
    continue;
  }

  out.push(line);
}

fs.writeFileSync(file, out.join('\n'), 'utf8');
console.log("Fixed return block manually");
