const fs = require('fs');
const file = 'c:/Users/aryan/COLLAGE/Resume/Ashapura/Data Visualization Bhupendra Sir/Dashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldChart = `function RankedBarChart({ data, color, unit = 'kg' }) {
  const height = Math.max(260, data.length * 30 + 40);
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <div style={{ minWidth: 400 }}>
        <ResponsiveContainer width="100%" height={height}>`;

const newChart = `function RankedBarChart({ data, color, unit = 'kg' }) {
  const height = Math.max(260, data.length * 30 + 40);
  return (
    <div style={{ maxHeight: 380, overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
      <div style={{ minWidth: 400 }}>
        <ResponsiveContainer width="100%" height={height}>`;

if (content.includes(oldChart)) {
    content = content.replace(oldChart, newChart);
} else {
    console.log("Could not find old RankedBarChart signature");
}

fs.writeFileSync(file, content, 'utf8');
console.log("Updated RankedBarChart with vertical scroll");
