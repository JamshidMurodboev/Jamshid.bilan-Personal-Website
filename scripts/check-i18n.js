#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '..', 'messages');
const locales = ['en', 'ru', 'uz'];

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const key of Object.keys(obj)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...flattenKeys(obj[key], full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const data = {};
for (const locale of locales) {
  const file = path.join(messagesDir, `${locale}.json`);
  data[locale] = JSON.parse(fs.readFileSync(file, 'utf8'));
}

const keysets = {};
for (const locale of locales) {
  keysets[locale] = new Set(flattenKeys(data[locale]));
}

let hasError = false;

for (const locale of locales) {
  for (const other of locales) {
    if (locale === other) continue;
    for (const key of keysets[locale]) {
      if (!keysets[other].has(key)) {
        console.error(`MISSING in ${other}: "${key}" (exists in ${locale})`);
        hasError = true;
      }
    }
  }
}

if (hasError) {
  console.error('\nTranslation files are OUT OF SYNC. Fix missing keys above.');
  process.exit(1);
} else {
  console.log(`All ${locales.join(', ')} translation files are in sync. ✓`);
}
