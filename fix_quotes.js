const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/haven't changed\.'/g, "haven\\'t changed.'");

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed quotes");
