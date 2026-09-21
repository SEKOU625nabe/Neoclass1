#!/usr/bin/env node

/**
 * ✅ NETLIFY DEPLOYMENT VALIDATOR
 * 
 * Script: Vérifie que tout est prêt pour déployer sur Netlify
 * 
 * Usage:
 * $ node validate-netlify.js
 * 
 * OU sur Windows PowerShell:
 * $ node validate-netlify.js
 * 
 */

const fs = require('fs');
const path = require('path');

// Couleurs pour terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, text) {
  console.log(`${color}${text}${colors.reset}`);
}

function success(text) {
  log(colors.green, `✅ ${text}`);
}

function error(text) {
  log(colors.red, `❌ ${text}`);
}

function warning(text) {
  log(colors.yellow, `⚠️  ${text}`);
}

function info(text) {
  log(colors.cyan, `ℹ️  ${text}`);
}

function title(text) {
  log(colors.blue, `\n${'='.repeat(50)}`);
  log(colors.blue, `  ${text}`);
  log(colors.blue, `${'='.repeat(50)}\n`);
}

// ===================================================
// VALIDATIONS
// ===================================================

let checksPass = 0;
let checksFail = 0;
let checksWarn = 0;

function check(name, condition, errorMsg = '') {
  if (condition) {
    success(name);
    checksPass++;
  } else {
    error(`${name} ${errorMsg ? `- ${errorMsg}` : ''}`);
    checksFail++;
  }
}

function checkWarn(name, condition, warnMsg = '') {
  if (condition) {
    warning(name + (warnMsg ? ` - ${warnMsg}` : ''));
    checksWarn++;
  } else {
    success(name);
    checksPass++;
  }
}

// ===================================================
// HEADER
// ===================================================

title('🚀 NETLIFY DEPLOYMENT VALIDATOR');

// ===================================================
// 1. FICHIERS REQUIS
// ===================================================

title('1️⃣  FICHIERS REQUIS');

const requiredFiles = [
  'Neoclass3.html',
  'pricing-display.html',
  '.env.example',
  'netlify.toml',
  'config-handler.js',
  '.gitignore',
  'package.json'
];

const projectDir = process.cwd();

requiredFiles.forEach(file => {
  const filePath = path.join(projectDir, file);
  check(
    `Fichier: ${file}`,
    fs.existsSync(filePath),
    'Manquant!'
  );
});

// ===================================================
// 2. DOSSIERS REQUIS
// ===================================================

title('2️⃣  DOSSIERS REQUIS');

const requiredDirs = [
  'netlify/functions'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(projectDir, dir);
  check(
    `Dossier: ${dir}`,
    fs.existsSync(dirPath),
    'Manquant!'
  );
});

// ===================================================
// 3. NETLIFY FUNCTIONS
// ===================================================

title('3️⃣  NETLIFY FUNCTIONS');

const functionPath = path.join(projectDir, 'netlify/functions/mistral-api.js');
if (fs.existsSync(functionPath)) {
  success('Fichier: netlify/functions/mistral-api.js');
  checksPass++;
  
  const content = fs.readFileSync(functionPath, 'utf-8');
  
  check(
    'Contains: exports.handler',
    content.includes('exports.handler'),
    'Function handler manquant!'
  );
  
  check(
    'Contains: fetch to Mistral API',
    content.includes('api.mistral.ai'),
    'Appel API manquant!'
  );
  
  check(
    'Contains: process.env.VITE_MISTRAL_API_KEY',
    content.includes('process.env.VITE_MISTRAL_API_KEY'),
    'Référence env manquante!'
  );
} else {
  error('Fichier: netlify/functions/mistral-api.js - Manquant!');
  checksFail++;
}

// ===================================================
// 4. NETLIFY CONFIGURATION
// ===================================================

title('4️⃣  NETLIFY CONFIGURATION');

const netlifyTomlPath = path.join(projectDir, 'netlify.toml');
if (fs.existsSync(netlifyTomlPath)) {
  success('Fichier: netlify.toml');
  checksPass++;
  
  const content = fs.readFileSync(netlifyTomlPath, 'utf-8');
  
  check(
    'Contains: [build] section',
    content.includes('[build]'),
    'Section [build] manquante!'
  );
  
  check(
    'Contains: [[redirects]] for SPA',
    content.includes('[[redirects]]'),
    'Redirects manquants!'
  );
  
  check(
    'Contains: [[headers]] for security',
    content.includes('[[headers]]'),
    'Headers de sécurité manquants!'
  );
  
  check(
    'Contains: functions configuration',
    content.includes('functions ='),
    'Config functions manquante!'
  );
} else {
  error('Fichier: netlify.toml - Manquant!');
  checksFail++;
}

// ===================================================
// 5. CONFIG HANDLER
// ===================================================

title('5️⃣  CONFIG HANDLER');

const configPath = path.join(projectDir, 'config-handler.js');
if (fs.existsSync(configPath)) {
  success('Fichier: config-handler.js');
  checksPass++;
  
  const content = fs.readFileSync(configPath, 'utf-8');
  
  check(
    'Contains: CONFIG object',
    content.includes('const CONFIG ='),
    'Object CONFIG manquant!'
  );
  
  check(
    'Contains: Firebase config',
    content.includes('firebase:'),
    'Config Firebase manquante!'
  );
  
  check(
    'Contains: Mistral config',
    content.includes('mistral:'),
    'Config Mistral manquante!'
  );
  
  check(
    'Contains: proxyUrl',
    content.includes('proxyUrl:'),
    'Proxy URL manquante!'
  );
} else {
  error('Fichier: config-handler.js - Manquant!');
  checksFail++;
}

// ===================================================
// 6. GITIGNORE
// ===================================================

title('6️⃣  GITIGNORE');

const gitignorePath = path.join(projectDir, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  success('Fichier: .gitignore');
  checksPass++;
  
  const content = fs.readFileSync(gitignorePath, 'utf-8');
  
  check(
    '.env dans .gitignore',
    content.includes('.env'),
    '.env n\'est PAS ignoré! RISQUE DE SÉCURITÉ!'
  );
  
  checkWarn(
    'node_modules dans .gitignore',
    !content.includes('node_modules'),
    'Trouvé (recommandé d\'ignorer)'
  );
} else {
  error('Fichier: .gitignore - Manquant!');
  checksFail++;
}

// ===================================================
// 7. ENV EXAMPLE
// ===================================================

title('7️⃣  ENV EXAMPLE');

const envExamplePath = path.join(projectDir, '.env.example');
if (fs.existsSync(envExamplePath)) {
  success('Fichier: .env.example');
  checksPass++;
  
  const content = fs.readFileSync(envExamplePath, 'utf-8');
  
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_MISTRAL_API_KEY',
    'VITE_MISTRAL_AGENT_ID',
    'VITE_APP_ENV'
  ];
  
  requiredEnvVars.forEach(envVar => {
    check(
      `Contient: ${envVar}`,
      content.includes(envVar),
      'Variable manquante!'
    );
  });
} else {
  error('Fichier: .env.example - Manquant!');
  checksFail++;
}

// ===================================================
// 8. GIT REPOSITORY
// ===================================================

title('8️⃣  GIT REPOSITORY');

const gitDir = path.join(projectDir, '.git');
if (fs.existsSync(gitDir)) {
  success('Git repository initialisé');
  checksPass++;
  
  // Vérifier remote
  try {
    const configPath = path.join(gitDir, 'config');
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      check(
        'Git remote configuré',
        content.includes('[remote'),
        'Pas de remote trouvé!'
      );
    }
  } catch (e) {
    warning('Impossible de vérifier git config');
  }
} else {
  error('Git repository non initialisé', 'Exécutez: git init');
  checksFail++;
}

// ===================================================
// 9. NEOCLASS3.HTML
// ===================================================

title('9️⃣  NEOCLASS3.HTML');

const neoclassPath = path.join(projectDir, 'Neoclass3.html');
if (fs.existsSync(neoclassPath)) {
  success('Fichier: Neoclass3.html');
  checksPass++;
  
  const content = fs.readFileSync(neoclassPath, 'utf-8');
  
  check(
    'Contient: Firebase SDK',
    content.includes('firebase'),
    'Firebase SDK manquant!'
  );
  
  check(
    'Contient: renderAdminPricingManagement',
    content.includes('renderAdminPricingManagement'),
    'Fonction pricing management manquante!'
  );
  
  check(
    'Contient: admin-pricing-management route',
    content.includes('admin-pricing-management'),
    'Route pricing manquante!'
  );
  
  checkWarn(
    'Ne contient PAS de clé API en dur',
    !content.includes('hFRgf0WjvZ6Aj'),
    'Attention: API key peut être exposée!'
  );
} else {
  error('Fichier: Neoclass3.html - Manquant!');
  checksFail++;
}

// ===================================================
// 10. RESPONSIVE DESIGN
// ===================================================

title('🔟 RESPONSIVE DESIGN');

if (fs.existsSync(neoclassPath)) {
  const content = fs.readFileSync(neoclassPath, 'utf-8');
  
  check(
    'Contient: @media queries',
    content.includes('@media'),
    'Breakpoints responsive manquants!'
  );
  
  check(
    'Contient: viewport meta tag',
    content.includes('viewport'),
    'Meta viewport manquante!'
  );
}

// ===================================================
// RÉSUMÉ FINAL
// ===================================================

console.log('\n');
title('📊 RÉSUMÉ');

log(colors.green, `✅ PASS:  ${checksPass}`);
if (checksWarn > 0) log(colors.yellow, `⚠️  WARN:  ${checksWarn}`);
if (checksFail > 0) log(colors.red, `❌ FAIL:  ${checksFail}`);

const totalChecks = checksPass + checksWarn + checksFail;
const passPercentage = Math.round((checksPass / totalChecks) * 100);

console.log(`\nScore: ${passPercentage}% (${checksPass}/${totalChecks})`);

// ===================================================
// RECOMMANDATIONS
// ===================================================

title('📋 RECOMMANDATIONS');

if (checksFail === 0) {
  success('Tous les fichiers sont présents!');
  console.log('\nProchaines étapes:');
  info('1. Configurer variables d\'env dans Netlify UI');
  info('2. Connecter repository GitHub');
  info('3. Déclencher deploy');
  info('4. Tester sur https://neoclass.netlify.app');
} else {
  error(`${checksFail} fichier(s) manquant(s)`);
  console.log('\nActions requises:');
  error('- Créer les fichiers manquants');
  error('- Consulter FICHIERS_NETLIFY_DEPLOYMENT.md');
  error('- Relancer ce script après corrections');
}

// ===================================================
// FINAL STATUS
// ===================================================

console.log('\n');
if (checksFail === 0) {
  log(colors.green, '🎉 PRÊT À DÉPLOYER!');
} else {
  log(colors.red, '❌ CORRECTIONS NÉCESSAIRES');
}

// Exit code
process.exit(checksFail > 0 ? 1 : 0);
