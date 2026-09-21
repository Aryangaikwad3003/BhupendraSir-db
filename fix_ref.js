const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/dailyInputRef=\{dailyInputRef\}\n\s*/, '');
content = content.replace(/const dailyInputRef = useRef\(null\);\n\s*/, '');

fs.writeFileSync(file, content, 'utf8');
