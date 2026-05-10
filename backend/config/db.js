// const oracledb = require('oracledb');
// require('dotenv').config();

// let pool;

// async function initPool() {
//   pool = await oracledb.createPool({
//     user:          process.env.DB_USER,
//     password:      process.env.DB_PASS,
//     connectString: process.env.DB_CONNECT_STRING,
//     poolMin:       0,
//     poolMax:       10,
//     poolIncrement: 1
//   });
//   console.log('✓ Oracle connection pool ready');
// }

// async function query(sql, binds = []) {
//   let conn;
//   try {
//     conn = await pool.getConnection();
//     const result = await conn.execute(sql, binds, {
//       outFormat:  oracledb.OUT_FORMAT_OBJECT,
//       autoCommit: true
//     });
//     return {
//       rows:     result.rows     || [],
//       outBinds: result.outBinds || {}
//     };
//   } catch (err) {
//     throw new Error(String(err.message || err.errorNum || 'Query failed'));
//   } finally {
//     if (conn) {
//       try { await conn.close(); } catch (e) {}
//     }
//   }
// }

// function getPool() { return pool; }

// module.exports = { initPool, query, getPool, oracledb };


const oracledb = require('oracledb');
require('dotenv').config();

// THIS IS THE FIX - tell oracledb to return CLOBs as strings
oracledb.fetchAsString = [oracledb.CLOB];

let pool;

async function initPool() {
  pool = await oracledb.createPool({
    user:          process.env.DB_USER,
    password:      process.env.DB_PASS,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin:       0,
    poolMax:       10,
    poolIncrement: 1
  });
  console.log('✓ Oracle connection pool ready');
}

async function query(sql, binds = []) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(sql, binds, {
      outFormat:  oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      fetchInfo:  { "DESCRIPTION": { type: oracledb.STRING },
                    "REVIEW_COMMENT": { type: oracledb.STRING } }
    });
    return {
      rows:     result.rows     || [],
      outBinds: result.outBinds || {}
    };
  } catch (err) {
    throw new Error(String(err.message || 'Query failed'));
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) {}
    }
  }
}

function getPool() { return pool; }

module.exports = { initPool, query, getPool, oracledb };