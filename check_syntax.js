const fs = require('fs');
const vm = require('vm');

const content = fs.readFileSync('Neoclass3.html', 'utf8');

// Extract main script content (between first <script> and </script> after line 2918)
const lines = content.split('\n');
let inScript = false;
let scriptContent = [];
let scriptStartLine = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.trim() === '<script>' && i > 2900) {
    inScript = true;
    scriptStartLine = i + 1;
    continue;
  }
  
  if (inScript && line.includes('</script>')) {
    inScript = false;
    break;
  }
  
  if (inScript) {
    scriptContent.push(line);
  }
}

console.log(`Main script: lines ${scriptStartLine + 1} to ${scriptStartLine + scriptContent.length}`);
console.log(`Total script lines: ${scriptContent.length}`);

const jsCode = scriptContent.join('\n');

try {
  new vm.Script(jsCode, { filename: 'main-script.js' });
  console.log('\\n✓ JavaScript syntax is VALID!');
} catch (err) {
  console.log('\\n✗ JavaScript syntax ERROR:');
  console.log(`  Line in script: ${err.lineNumber || 'unknown'}`);
  console.log(`  File line: ${scriptStartLine + (err.lineNumber || 0)}`);
  console.log(`  Message: ${err.message}`);
  
  // Try to find the line
  if (err.lineNumber) {
    const errorLine = scriptContent[err.lineNumber - 1];
    console.log(`\\n  Error context:`);
    for (let i = Math.max(0, err.lineNumber - 3); i < Math.min(scriptContent.length, err.lineNumber + 2); i++) {
      const marker = i === err.lineNumber - 1 ? ' >>> ' : '     ';
      console.log(`${marker}${scriptStartLine + i + 1}: ${scriptContent[i].substring(0, 100)}`);
    }
  }
}
