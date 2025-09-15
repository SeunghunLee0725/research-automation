import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Excel file
const workbook = XLSX.readFile(path.join(__dirname, '../JCR2023(2024년 발행)상위 2-20_상위저널리스트_공지_최종.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

// Create journal database
const journalDB = {};

data.forEach(row => {
  // Extract journal name, impact factor, and percentile
  // Adjust column names based on actual Excel structure
  const journalName = row['Journal name'] || row['저널명'] || row['Journal'] || '';
  const impactFactor = row['Journal Impact Factor'] || row['Impact Factor'] || row['IF'] || row['2023 JIF'] || 0;
  const percentile = row['JIF Percentile'] || row['Percentile'] || row['%'] || 0;
  const category = row['Category'] || row['분야'] || row['Field'] || '';
  const rank = row['Rank'] || row['순위'] || '';
  
  if (journalName) {
    // Clean and normalize journal name
    const normalizedName = journalName.trim().toUpperCase();
    
    journalDB[normalizedName] = {
      originalName: journalName.trim(),
      impactFactor: parseFloat(impactFactor) || 0,
      percentile: parseFloat(percentile) || 0,
      category: category,
      rank: rank,
      year: 2023
    };
    
    // Also store with lowercase for better matching
    const lowerName = journalName.trim().toLowerCase();
    journalDB[lowerName] = journalDB[normalizedName];
  }
});

// Save to JSON file
const outputPath = path.join(__dirname, '../src/data/journalImpactFactors.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(journalDB, null, 2));

console.log(`Journal database created with ${Object.keys(journalDB).length / 2} journals`);
console.log('Sample entries:');
console.log(Object.entries(journalDB).slice(0, 3).map(([k, v]) => ({ name: k, ...v })));