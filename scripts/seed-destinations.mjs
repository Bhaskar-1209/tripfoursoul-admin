// Direct database seeding script for destinations and packages
import pg from 'pg';

// Read the database connection from the environment — never hardcode secrets in source.
// Run with: node --env-file=.env.local scripts/seed-destinations.mjs
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL environment variable. Run with: node --env-file=.env.local scripts/seed-destinations.mjs');
  process.exit(1);
}

const pool = new pg.Pool({
  // Strip sslmode query param to avoid conflicts with the ssl option below
  connectionString: connectionString.includes('?sslmode=') ? connectionString.split('?')[0] : connectionString,
  ssl: { rejectUnauthorized: false },
});

const makeSlug = (value = '') => String(value).trim().toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

async function main() {
  const client = await pool.connect();
  try {
    // Ensure tables exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        image_url TEXT DEFAULT '',
        region VARCHAR(100) DEFAULT '',
        price VARCHAR(50) DEFAULT '',
        duration VARCHAR(100) DEFAULT '',
        highlights TEXT,
        is_trending BOOLEAN DEFAULT false,
        is_spiritual BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        destination_id INT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        days VARCHAR(50) DEFAULT '',
        meals VARCHAR(255) DEFAULT '',
        short_description TEXT,
        long_description TEXT,
        sub_heading VARCHAR(255) DEFAULT '',
        image_url TEXT DEFAULT '',
        inclusives TEXT,
        exclusives TEXT,
        itinerary TEXT,
        additional_info TEXT,
        price VARCHAR(50) DEFAULT '',
        is_trending BOOLEAN DEFAULT false,
        is_spiritual BOOLEAN DEFAULT false,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Destinations data
    const destinations = [
      { name: 'Australia & New Zealand', slug: 'australia-new-zealand', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=700&q=80', region: 'Oceania', price: '$2,299+', description: 'Discover stunning coastlines, vibrant cities, and breathtaking natural wonders across Australia and New Zealand.', sort_order: 1, is_trending: true, is_active: true },
      { name: 'Japan & South Korea', slug: 'japan-south-korea', image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80', region: 'Asia', price: '$1,899+', description: 'Experience the perfect blend of ancient traditions and futuristic cities in Japan and South Korea.', sort_order: 2, is_trending: true, is_active: true },
      { name: 'Southeast Asia', slug: 'southeast-asia', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', region: 'Asia', price: '$899+', description: 'Explore Thailand, Singapore, Bali & Indonesia, Malaysia, Vietnam & Cambodia, and the Philippines — tropical beaches, ancient temples, and vibrant cultures.', sort_order: 3, is_trending: true, is_active: true },
      { name: 'UK & Ireland', slug: 'uk-ireland', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80', region: 'Europe', price: '€1,499+', description: "From London's iconic landmarks to Ireland's dramatic cliffs, discover the rich history and charm of the UK and Ireland.", sort_order: 4, is_trending: true, is_active: true },
      { name: 'Europe', slug: 'europe', image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80', region: 'Europe', price: '€1,299+', description: 'Explore the beautiful cities of Europe including France, Italy, Switzerland, Spain, Portugal, Greece, Germany, Netherlands and more.', sort_order: 5, is_trending: true, is_active: true },
      { name: 'Central & Eastern Europe', slug: 'central-eastern-europe', image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=700&q=80', region: 'Europe', price: '€1,199+', description: 'Discover the fairytale cities of Poland, Czechia, Hungary, Austria, Croatia, Slovenia, and Romania.', sort_order: 6, is_trending: true, is_active: true },
      { name: 'Nordic & Scandinavia', slug: 'nordic-scandinavia', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80', region: 'Europe', price: '€1,899+', description: 'Experience the Northern Lights, stunning fjords, and pristine landscapes of Norway, Iceland, Sweden, Denmark, and Finland.', sort_order: 7, is_trending: true, is_active: true },
      { name: 'India', slug: 'india', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', region: 'Asia', price: '₹49,999+', description: 'Discover the incredible diversity of India — from the Himalayas to the backwaters of Kerala, royal Rajasthan to spiritual Varanasi.', sort_order: 8, is_trending: true, is_active: true },
      { name: 'CIS Destinations', slug: 'cis-destinations', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80', region: 'Asia', price: '$999+', description: 'Explore the hidden gems of Central Asia and the Caucasus region — Azerbaijan, Georgia, Kazakhstan, Uzbekistan, and more.', sort_order: 9, is_trending: true, is_active: true },
      { name: 'South Asia & Indian Ocean', slug: 'south-asia-indian-ocean', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80', region: 'Asia', price: '$1,199+', description: 'Discover the spiritual beauty of Nepal, Bhutan, Sri Lanka, and the tropical paradise of Maldives and Mauritius.', sort_order: 10, is_trending: true, is_active: true }
    ];

    // First, delete old destinations that are not in the new list
    const destinationSlugs = destinations.map(d => d.slug);
    const oldDests = await client.query('SELECT * FROM destinations');
    let deletedCount = 0;
    for (const existing of oldDests.rows) {
      if (!destinationSlugs.includes(existing.slug)) {
        // Delete packages linked to this destination first
        try {
          await client.query('DELETE FROM packages WHERE destination_id = $1', [existing.id]);
        } catch (e) {}
        try {
          await client.query('DELETE FROM destinations WHERE id = $1', [existing.id]);
          deletedCount++;
        } catch (e) {
          console.warn('Could not delete destination:', existing.slug, e.message);
        }
      }
    }
    console.log(`Deleted ${deletedCount} old destinations`);

    // Insert or update destinations
    const destIds = {};
    for (const dest of destinations) {
      const existing = await client.query('SELECT * FROM destinations WHERE slug = $1', [dest.slug]);
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        await client.query(
          `UPDATE destinations SET name = $1, image_url = $2, region = $3, price = $4, description = $5, sort_order = $6, is_trending = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9`,
          [dest.name, dest.image_url, dest.region, dest.price, dest.description, dest.sort_order, dest.is_trending, dest.is_active, row.id]
        );
        destIds[dest.slug] = row.id;
        console.log(`Updated destination: ${dest.name} (id=${row.id})`);
      } else {
        const result = await client.query(
          `INSERT INTO destinations (name, slug, image_url, region, price, description, sort_order, is_trending, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
          [dest.name, dest.slug, dest.image_url, dest.region, dest.price, dest.description, dest.sort_order, dest.is_trending, dest.is_active]
        );
        destIds[dest.slug] = result.rows[0].id;
        console.log(`Created destination: ${dest.name} (id=${result.rows[0].id})`);
      }
    }

    // Packages data
    const packages = [
      { destination_id: destIds['australia-new-zealand'], title: 'Australia & New Zealand Highlights', slug: 'australia-new-zealand-highlights', days: '12 Days / 11 Nights', meals: '', short_description: 'Discover Sydney Harbour, the Great Barrier Reef, Milford Sound, and the geothermal wonders of Rotorua on this epic journey Down Under.', long_description: 'Discover Sydney Harbour, the Great Barrier Reef, Milford Sound, and the geothermal wonders of Rotorua on this epic journey Down Under.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$2,299', sort_order: 1, is_trending: true, is_active: true },
      { destination_id: destIds['japan-south-korea'], title: 'Japan & South Korea Discovery', slug: 'japan-south-korea-discovery', days: '10 Days / 9 Nights', meals: '', short_description: "Experience Tokyo's neon streets, Kyoto's ancient temples, Seoul's vibrant culture, and Busan's coastal beauty in one unforgettable trip.", long_description: "Experience Tokyo's neon streets, Kyoto's ancient temples, Seoul's vibrant culture, and Busan's coastal beauty in one unforgettable trip.", sub_heading: 'Best Seller', image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$1,899', sort_order: 2, is_trending: true, is_active: true },
      { destination_id: destIds['southeast-asia'], title: 'Southeast Asia Explorer', slug: 'southeast-asia-explorer', days: '14 Days / 13 Nights', meals: '', short_description: 'Journey through Thailand, Singapore, Bali, Malaysia, Vietnam & Cambodia — from Bangkok\'s temples to Angkor Wat and tropical island paradises.', long_description: 'Journey through Thailand, Singapore, Bali, Malaysia, Vietnam & Cambodia — from Bangkok\'s temples to Angkor Wat and tropical island paradises.', sub_heading: 'Top Rated', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$1,499', sort_order: 3, is_trending: true, is_active: true },
      { destination_id: destIds['uk-ireland'], title: 'UK & Ireland Heritage Tour', slug: 'uk-ireland-heritage-tour', days: '10 Days / 9 Nights', meals: '', short_description: "From London's iconic landmarks and Edinburgh's castles to Dublin's pubs and the Cliffs of Moher — explore the best of Britain and Ireland.", long_description: "From London's iconic landmarks and Edinburgh's castles to Dublin's pubs and the Cliffs of Moher — explore the best of Britain and Ireland.", sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '€1,499', sort_order: 4, is_trending: true, is_active: true },
      { destination_id: destIds['europe'], title: 'Europe Highlights Getaway', slug: 'europe-highlights-getaway', days: '8 Days / 7 Nights', meals: '', short_description: 'A signature Europe itinerary covering Paris, Rome, Switzerland, Barcelona, and Amsterdam with handpicked stays and guided city experiences.', long_description: 'A signature Europe itinerary covering Paris, Rome, Switzerland, Barcelona, and Amsterdam with handpicked stays and guided city experiences.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '€1,499', sort_order: 5, is_trending: true, is_active: true },
      { destination_id: destIds['central-eastern-europe'], title: 'Central & Eastern Europe Grand Tour', slug: 'central-eastern-europe-grand-tour', days: '12 Days / 11 Nights', meals: '', short_description: 'Discover the fairytale cities of Prague, Budapest, Vienna, Krakow, Zagreb, and more through Central and Eastern Europe.', long_description: 'Discover the fairytale cities of Prague, Budapest, Vienna, Krakow, Zagreb, and more through Central and Eastern Europe.', sub_heading: 'New', image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '€1,199', sort_order: 6, is_trending: true, is_active: true },
      { destination_id: destIds['nordic-scandinavia'], title: 'Nordic & Scandinavia Adventure', slug: 'nordic-scandinavia-adventure', days: '10 Days / 9 Nights', meals: '', short_description: 'Chase the Northern Lights in Iceland, cruise the Norwegian fjords, and explore Copenhagen, Stockholm, and Helsinki.', long_description: 'Chase the Northern Lights in Iceland, cruise the Norwegian fjords, and explore Copenhagen, Stockholm, and Helsinki.', sub_heading: 'Hot Deal', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '€1,899', sort_order: 7, is_trending: true, is_active: true },
      { destination_id: destIds['india'], title: 'Incredible India Explorer', slug: 'incredible-india-explorer', days: '12 Days / 11 Nights', meals: '', short_description: "From the Golden Triangle to the backwaters of Kerala and the spiritual ghats of Varanasi — experience India's incredible diversity.", long_description: "From the Golden Triangle to the backwaters of Kerala and the spiritual ghats of Varanasi — experience India's incredible diversity.", sub_heading: 'Best Seller', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹49,999', sort_order: 8, is_trending: true, is_active: true },
      { destination_id: destIds['cis-destinations'], title: 'CIS Destinations Unveiled', slug: 'cis-destinations-unveiled', days: '9 Days / 8 Nights', meals: '', short_description: "Explore the hidden gems of Central Asia and the Caucasus — Azerbaijan, Georgia, Kazakhstan, and Uzbekistan's Silk Road cities.", long_description: "Explore the hidden gems of Central Asia and the Caucasus — Azerbaijan, Georgia, Kazakhstan, and Uzbekistan's Silk Road cities.", sub_heading: 'Trending', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$999', sort_order: 9, is_trending: true, is_active: true },
      { destination_id: destIds['south-asia-indian-ocean'], title: 'South Asia & Indian Ocean Escape', slug: 'south-asia-indian-ocean-escape', days: '11 Days / 10 Nights', meals: '', short_description: 'Discover the spiritual beauty of Nepal, Bhutan, and Sri Lanka, then relax in the tropical paradise of Maldives and Mauritius.', long_description: 'Discover the spiritual beauty of Nepal, Bhutan, and Sri Lanka, then relax in the tropical paradise of Maldives and Mauritius.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$1,199', sort_order: 10, is_trending: true, is_active: true },
      { destination_id: destIds['india'], title: 'Varanasi & Ganga Aarti', slug: 'varanasi-ganga-aarti', days: '5 Days / 4 Nights', meals: '', short_description: 'A restorative journey through Varanasi with sunrise boat rides, temple visits, guided meditation, and the evening Ganga Aarti.', long_description: 'A restorative journey through Varanasi with sunrise boat rides, temple visits, guided meditation, and the evening Ganga Aarti.', sub_heading: 'Sacred Journey', image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹24,999', sort_order: 11, is_spiritual: true, is_active: true },
      { destination_id: destIds['india'], title: 'Rishikesh Yoga Retreat', slug: 'rishikesh-yoga-retreat', days: '6 Days / 5 Nights', meals: '', short_description: 'Reconnect with yourself beside the Ganges through daily yoga, breathwork, guided meditation, and peaceful Himalayan walks.', long_description: 'Reconnect with yourself beside the Ganges through daily yoga, breathwork, guided meditation, and peaceful Himalayan walks.', sub_heading: 'Wellness Pick', image_url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹29,999', sort_order: 12, is_spiritual: true, is_active: true },
      { destination_id: destIds['south-asia-indian-ocean'], title: 'Bodh Gaya Mindfulness Tour', slug: 'bodh-gaya-mindfulness-tour', days: '4 Days / 3 Nights', meals: '', short_description: 'Follow the Buddhist path in Bodh Gaya with monastery visits, mindful sessions, and time for quiet reflection under the Bodhi tree.', long_description: 'Follow the Buddhist path in Bodh Gaya with monastery visits, mindful sessions, and time for quiet reflection under the Bodhi tree.', sub_heading: 'Mindful Escape', image_url: 'https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹22,999', sort_order: 13, is_spiritual: true, is_active: true },
      { destination_id: destIds['india'], title: 'Kedarnath Pilgrimage', slug: 'kedarnath-pilgrimage', days: '7 Days / 6 Nights', meals: '', short_description: 'Undertake a carefully planned Himalayan pilgrimage to Kedarnath with comfortable stays, local guidance, and meaningful temple time.', long_description: 'Undertake a carefully planned Himalayan pilgrimage to Kedarnath with comfortable stays, local guidance, and meaningful temple time.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹34,999', sort_order: 14, is_spiritual: true, is_active: true }
    ];

    // Insert or update packages
    let pkgCreated = 0, pkgUpdated = 0;
    for (const pkg of packages) {
      const existing = await client.query('SELECT * FROM packages WHERE slug = $1', [pkg.slug]);
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        await client.query(
          `UPDATE packages SET destination_id = $1, title = $2, days = $3, short_description = $4, long_description = $5, sub_heading = $6, image_url = $7, price = $8, sort_order = $9, is_trending = $10, is_spiritual = $11, is_active = $12, updated_at = CURRENT_TIMESTAMP WHERE id = $13`,
          [pkg.destination_id, pkg.title, pkg.days, pkg.short_description, pkg.long_description, pkg.sub_heading, pkg.image_url, pkg.price, pkg.sort_order, pkg.is_trending, pkg.is_spiritual, pkg.is_active, row.id]
        );
        pkgUpdated++;
        console.log(`Updated package: ${pkg.title}`);
      } else {
        await client.query(
          `INSERT INTO packages (destination_id, title, slug, days, meals, short_description, long_description, sub_heading, image_url, inclusives, exclusives, itinerary, additional_info, price, is_trending, is_spiritual, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
          [pkg.destination_id, pkg.title, pkg.slug, pkg.days, pkg.meals, pkg.short_description, pkg.long_description, pkg.sub_heading, pkg.image_url, pkg.inclusives, pkg.exclusives, pkg.itinerary, pkg.additional_info, pkg.price, pkg.is_trending, pkg.is_spiritual, pkg.sort_order, pkg.is_active]
        );
        pkgCreated++;
        console.log(`Created package: ${pkg.title}`);
      }
    }

    console.log(`\n=== SUMMARY ===`);
    console.log(`Destinations: ${Object.keys(destIds).length} processed`);
    console.log(`Packages created: ${pkgCreated}, updated: ${pkgUpdated}`);

    // Verify
    const destCheck = await client.query('SELECT * FROM destinations ORDER BY sort_order');
    console.log('\n=== DESTINATIONS IN DATABASE ===');
    destCheck.rows.forEach(d => console.log(`${d.sort_order}. ${d.name} (${d.slug})`));

    const pkgCheck = await client.query('SELECT * FROM packages ORDER BY sort_order');
    console.log(`\n=== PACKAGES IN DATABASE (${pkgCheck.rows.length}) ===`);
    pkgCheck.rows.forEach(p => console.log(`${p.sort_order}. ${p.title}`));

  } catch (error) {
    console.error('Seed error:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();