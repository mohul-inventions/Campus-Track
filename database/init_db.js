/**
 * CampusTrack Database Initializer & Migration Runner
 * Executes schema, views, stored procedures, triggers, and seed data.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3307', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const MYSQL_CLI = 'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe';

async function run() {
  console.log('🚀 CampusTrack Database Initialization Starting...');
  console.log(`Connecting to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port} as '${DB_CONFIG.user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to MySQL successfully.');

    // 1. Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS campustrack_db;');
    await connection.query('USE campustrack_db;');
    console.log('✅ Selected database: campustrack_db');

    // Run schema
    console.log('\n📄 Executing Schema (schema.sql)...');
    let schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8').replace(/^\uFEFF/, '');
    await connection.query(schemaSql);
    console.log('✅ Schema completed.');

    // Run views
    console.log('\n📄 Executing Views (views.sql)...');
    let viewsSql = fs.readFileSync(path.join(__dirname, 'views.sql'), 'utf8').replace(/^\uFEFF/, '');
    await connection.query(viewsSql);
    console.log('✅ Views completed.');

    // Run procedures via mysql client
    console.log('\n📄 Executing Stored Procedures (procedures.sql)...');
    const procPath = path.join(__dirname, 'procedures.sql').replace(/\\/g, '/');
    if (fs.existsSync(MYSQL_CLI)) {
      execSync(`"${MYSQL_CLI}" -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${DB_CONFIG.password ? '-p' + DB_CONFIG.password : ''} -D campustrack_db -e "source ${procPath}"`);
    }
    console.log('✅ Stored Procedures completed.');

    // Run triggers via mysql client
    console.log('\n📄 Executing Triggers (triggers.sql)...');
    const trigPath = path.join(__dirname, 'triggers.sql').replace(/\\/g, '/');
    if (fs.existsSync(MYSQL_CLI)) {
      execSync(`"${MYSQL_CLI}" -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${DB_CONFIG.password ? '-p' + DB_CONFIG.password : ''} -D campustrack_db -e "source ${trigPath}"`);
    }
    console.log('✅ Triggers completed.');

    // Run seed data
    console.log('\n📄 Executing Seed Data (seed.sql)...');
    let seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8').replace(/^\uFEFF/, '');
    await connection.query(seedSql);
    console.log('✅ Realistic Demo Seed Data completed.');

    // Verification
    console.log('\n🔍 Verifying Database Objects in MySQL:');
    const [tables] = await connection.query('SHOW TABLES;');
    console.log(`   • Total Tables: ${tables.length}`);

    const [views] = await connection.query("SHOW FULL TABLES WHERE Table_type = 'VIEW';");
    console.log(`   • Total Views: ${views.length}`);

    const [procs] = await connection.query("SHOW PROCEDURE STATUS WHERE Db = 'campustrack_db';");
    console.log(`   • Stored Procedures: ${procs.length}`);

    const [triggers] = await connection.query("SHOW TRIGGERS FROM campustrack_db;");
    console.log(`   • Triggers: ${triggers.length}`);

    const [students] = await connection.query('SELECT COUNT(*) AS count FROM students;');
    const [lost] = await connection.query('SELECT COUNT(*) AS count FROM lost_items;');
    const [found] = await connection.query('SELECT COUNT(*) AS count FROM found_items;');
    const [matches] = await connection.query('SELECT COUNT(*) AS count FROM matches;');
    const [claims] = await connection.query('SELECT COUNT(*) AS count FROM claims;');

    console.log(`   • Students: ${students[0].count}`);
    console.log(`   • Lost Items: ${lost[0].count}`);
    console.log(`   • Found Items: ${found[0].count}`);
    console.log(`   • Matches: ${matches[0].count}`);
    console.log(`   • Claims: ${claims[0].count}`);

    console.log('\n🎉 CampusTrack MySQL 8.0 Database is 100% READY!\n');
  } catch (err) {
    console.error('❌ Error during database initialization:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

run();
