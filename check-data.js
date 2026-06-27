const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({ connectionString: process.env.DIRECT_URL });
  await client.connect();
  try {
    const res = await client.query('SELECT COUNT(*) FROM "Product"');
    console.log('Product count:', res.rows[0].count);
    
    const res2 = await client.query('SELECT * FROM "Product" LIMIT 1');
    console.log('First product:', res2.rows[0]);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
