const fs = require('fs');

const dashFile = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let dashContent = fs.readFileSync(dashFile, 'utf8');

const oldTitle = `Regular Production — by \${groupBy === 'product' ? 'Product' : groupBy === 'machine' ? 'Machine' : 'Category / Customer'}`;
const newTitle = `Regular Production — by \${groupBy === 'product' ? 'Product' : groupBy === 'machine' ? 'Machine' : groupBy === 'sku' ? 'SKU' : 'Category / Customer'}`;
dashContent = dashContent.replace(oldTitle, newTitle);

fs.writeFileSync(dashFile, dashContent, 'utf8');
console.log("Updated title");
