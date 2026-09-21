const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// The file was accidentally joined with literal \n instead of newlines.
// We can just replace the literal '\n' characters with actual newlines.
// Be careful to replace '\\n' but not actual newlines if any exist.
content = content.split('\\n').join('\n');
content = content.replace(/haven\\\'t/g, "haven't");

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed newlines");
