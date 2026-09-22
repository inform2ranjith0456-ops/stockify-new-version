import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config({ path: path.join(__dirname, '.env') });

function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    if (inLineComment) {
      if (char === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (char === '*' && nextChar === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (char === '-' && nextChar === '-' && !inString) {
      inLineComment = true;
      i++;
      continue;
    }
    if (char === '/' && nextChar === '*' && !inString) {
      inBlockComment = true;
      i++;
      continue;
    }
    if (char === "'") {
      // Check for escaped single quote in SQL ''
      if (inString && nextChar === "'") {
        current += "''";
        i++;
        continue;
      }
      inString = !inString;
      current += char;
      continue;
    }

    if (char === ';' && !inString) {
      const trimmed = current.trim();
      if (trimmed.length > 0) statements.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) statements.push(trimmed);
  return statements;
}

async function initDatabase() {
  console.log('====================================================');
  console.log('         STOCKIFY DATABASE INITIALIZATION');
  console.log('====================================================');

  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');

    console.log('Applying schema definitions...');
    for (const stmt of splitStatements(schemaSql)) {
      await pool.query(stmt);
    }
    console.log('✓ Schema applied successfully.');

    console.log('Applying seed data...');
    for (const stmt of splitStatements(seedSql)) {
      await pool.query(stmt);
    }
    console.log('✓ Seed data populated successfully.');

    const storesCount = await pool.query('SELECT COUNT(*) FROM stores');
    const productsCount = await pool.query('SELECT COUNT(*) FROM products');
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const inventoryCount = await pool.query('SELECT COUNT(*) FROM inventory');
    const adjustmentsCount = await pool.query('SELECT COUNT(*) FROM adjustment_requests');
    const auditLogsCount = await pool.query('SELECT COUNT(*) FROM audit_logs');

    console.log('----------------------------------------------------');
    console.log(`Database state verified:`);
    console.log(`  - Stores: ${storesCount.rows[0].count}`);
    console.log(`  - Products: ${productsCount.rows[0].count}`);
    console.log(`  - Users: ${usersCount.rows[0].count}`);
    console.log(`  - Inventory rows: ${inventoryCount.rows[0].count}`);
    console.log(`  - Adjustment requests: ${adjustmentsCount.rows[0].count}`);
    console.log(`  - Audit logs: ${auditLogsCount.rows[0].count}`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
}

initDatabase();
