const fs = require('fs');
const enContent = fs.readFileSync('en.ts', 'utf8');
const zhContent = fs.readFileSync('zh.ts', 'utf8');

function extractKeys(content) {
  const keys = new Set();
  const regex = /^\s*"([^"]+)":/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

function extractKeyValue(content) {
  const map = {};
  // Match key-value pairs including multiline values
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const lineMatch = lines[i].match(/^\s*"([^"]+)"\s*:\s*(.*)/);
    if (lineMatch) {
      const key = lineMatch[1];
      let value = lineMatch[2].trim();
      // Handle multiline values (ending with comma or not)
      if (value.endsWith(',')) {
        value = value.slice(0, -1).trim();
      }
      map[key] = value;
    }
  }
  return map;
}

const enMap = extractKeyValue(enContent);
const enKeys = new Set(Object.keys(enMap));
const zhKeys = extractKeys(zhContent);

console.log('en.ts total keys: ' + enKeys.size);
console.log('zh.ts total keys: ' + zhKeys.size);

const missing = [];
for (const key of enKeys) {
  if (!zhKeys.has(key)) {
    missing.push(key);
  }
}

missing.sort();
console.log('\nMissing keys in zh.ts (' + missing.length + '):');
for (const k of missing) {
  console.log('  "' + k + '": ' + enMap[k]);
}
