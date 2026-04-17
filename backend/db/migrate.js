#!/usr/bin/env node

/**
 * 數據庫遷移工具
 * 用法:
 *   node db/migrate.js          # 運行所有待機遷移
 *   node db/migrate.js up       # 同上
 *   node db/migrate.js down     # 回滾最後一次遷移
 *   node db/migrate.js status   # 查看遷移狀態
 *   node db/migrate.js reset    # 重置數據庫（謹慎！）
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 遷移表名
const MIGRATIONS_TABLE = 'schema_migrations';

// 初始化資料池
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 確保遷移表存在
 */
async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

/**
 * 獲取所有遷移文件
 */
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname);
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.startsWith('migration_') && f.endsWith('.sql'))
    .sort();
  return files;
}

/**
 * 獲取已執行的遷移
 */
async function getExecutedMigrations() {
  try {
    const result = await pool.query(
      `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY run_at`
    );
    return result.rows.map(r => r.name);
  } catch (e) {
    return [];
  }
}

/**
 * 執行遷移
 */
async function migrate(action = 'up') {
  try {
    await ensureMigrationsTable();
    
    const allMigrations = getMigrationFiles();
    const executedMigrations = await getExecutedMigrations();
    const pendingMigrations = allMigrations.filter(m => !executedMigrations.includes(m));
    
    if (action === 'status') {
      log('\n=== 遷移狀態 ===\n', 'bright');
      log(`已執行 (${executedMigrations.length}):`, 'blue');
      executedMigrations.forEach(m => log(`  ✓ ${m}`, 'green'));
      
      log(`\n待執行 (${pendingMigrations.length}):`, 'yellow');
      pendingMigrations.forEach(m => log(`  ○ ${m}`));
      
      return;
    }
    
    if (action === 'up') {
      if (pendingMigrations.length === 0) {
        log('✓ 無待執行的遷移', 'green');
        return;
      }
      
      log(`\n執行 ${pendingMigrations.length} 項遷移...\n`, 'blue');
      
      for (const migration of pendingMigrations) {
        try {
          const migrationPath = path.join(__dirname, migration);
          const sql = fs.readFileSync(migrationPath, 'utf8');
          
          // 開始事務
          await pool.query('BEGIN');
          
          // 執行遷移
          await pool.query(sql);
          
          // 記錄遷移
          await pool.query(
            `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`,
            [migration]
          );
          
          // 提交事務
          await pool.query('COMMIT');
          
          log(`✓ ${migration}`, 'green');
        } catch (e) {
          await pool.query('ROLLBACK');
          log(`✗ ${migration}: ${e.message}`, 'red');
          throw e;
        }
      }
      
      log('\n✓ 遷移完成！\n', 'green');
      return;
    }
    
    if (action === 'down') {
      if (executedMigrations.length === 0) {
        log('✓ 無已執行的遷移可回滾', 'yellow');
        return;
      }
      
      log('❌ 向下遷移尚未實現。請手動管理回滾。', 'red');
      return;
    }
    
    if (action === 'reset') {
      log('\n⚠️  警告：此操作將刪除所有遷移記錄！', 'red');
      log('請確認您已備份數據庫。\n', 'yellow');
      
      // 需要添加確認機制
      const confirmed = process.argv[3] === '--yes';
      if (!confirmed) {
        log('請使用 --yes 標誌來確認重置。', 'yellow');
        return;
      }
      
      await pool.query(`TRUNCATE TABLE ${MIGRATIONS_TABLE}`);
      log('✓ 遷移歷史已重置', 'green');
      return;
    }
    
  } catch (e) {
    log(`錯誤: ${e.message}`, 'red');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 主程序
const action = process.argv[2] || 'up';
if (!['up', 'down', 'status', 'reset'].includes(action)) {
  log(`未知操作: ${action}`, 'red');
  log('有效操作: up, down, status, reset', 'yellow');
  process.exit(1);
}

migrate(action).catch(e => {
  log(`未處理的錯誤: ${e.message}`, 'red');
  process.exit(1);
});
