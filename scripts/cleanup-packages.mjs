import pg from 'pg';

// Read the database connection from the environment — never hardcode secrets in source.
// Run with: node --env-file=.env.local scripts/cleanup-packages.mjs
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL environment variable. Run with: node --env-file=.env.local scripts/cleanup-packages.mjs');
  process.exit(1);
}

const pool = new pg.Pool({
  // Strip sslmode query param to avoid conflicts with the ssl option below
  connectionString: connectionString.includes('?sslmode=') ? connectionString.split('?')[0] : connectionString,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    // Delete old orphaned packages that don't belong to the 10 new destinations
    const oldSlugs = ['swiss-alps-explorer', 'maldives-retreat', 'moroccan-sahara', 'japan-cherry-blossom', 'bali-wellness-escape', 'greek-island-hopping'];
    const result = await client.query('DELETE FROM packages WHERE slug = ANY($1) RETURNING title', [oldSlugs]);
    console.log('Deleted old packages:');
    result.rows.forEach(r => console.log(' -', r.title));

    // Also clean up trips table for consistency
    try {
      await client.query('DELETE FROM trips');
      console.log('Cleaned trips table');
    } catch (e) { console.log('Trips table already clean or not exists'); }

    // Verify final state
    const dests = await client.query('SELECT id, name, slug FROM destinations ORDER BY sort_order');
    console.log('\n=== FINAL DESTINATIONS ===');
    dests.rows.forEach(d => console.log(d.id + '. ' + d.name + ' (' + d.slug + ')'));

    const pkgs = await client.query('SELECT p.title, d.name as destination FROM packages p LEFT JOIN destinations d ON p.destination_id = d.id ORDER BY p.sort_order');
    console.log('\n=== FINAL PACKAGES ===');
    pkgs.rows.forEach(p => console.log(' - ' + p.title + ' => ' + (p.destination || 'Unassigned')));
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });