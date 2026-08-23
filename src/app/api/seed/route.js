import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { localPathToBase64 } from '@/lib/imageHelper';

// Convert local image paths to base64 data URLs
const processSeedImage = (url) => {
  if (!url) return '';
  if (url.startsWith('data:image')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) {
    const base64 = localPathToBase64(url);
    if (base64) return base64;
  }
  return url;
};

export async function GET() {
  try {
    const results = {
      success: true,
      message: 'Database seeded successfully!',
      data: {}
    };

    // Seed Destinations
    const destinations = [
      { name: 'Australia & New Zealand', slug: 'australia-new-zealand', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=700&q=80', region: 'Oceania', price: '$2,299+', description: 'Discover stunning coastlines, vibrant cities, and breathtaking natural wonders across Australia and New Zealand.', sort_order: 1, is_trending: true, is_active: true },
      { name: 'Japan & South Korea', slug: 'japan-south-korea', image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80', region: 'Asia', price: '$1,899+', description: 'Experience the perfect blend of ancient traditions and futuristic cities in Japan and South Korea.', sort_order: 2, is_trending: true, is_active: true },
      { name: 'Southeast Asia', slug: 'southeast-asia', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', region: 'Asia', price: '$899+', description: 'Explore Thailand, Singapore, Bali & Indonesia, Malaysia, Vietnam & Cambodia, and the Philippines — tropical beaches, ancient temples, and vibrant cultures.', sort_order: 3, is_trending: true, is_active: true },
      { name: 'UK & Ireland', slug: 'uk-ireland', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80', region: 'Europe', price: '€1,499+', description: 'From London\'s iconic landmarks to Ireland\'s dramatic cliffs, discover the rich history and charm of the UK and Ireland.', sort_order: 4, is_trending: true, is_active: true },
      { name: 'Europe', slug: 'europe', image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80', region: 'Europe', price: '€1,299+', description: 'Explore the beautiful cities of Europe including France, Italy, Switzerland, Spain, Portugal, Greece, Germany, Netherlands and more.', sort_order: 5, is_trending: true, is_active: true },
      { name: 'Central & Eastern Europe', slug: 'central-eastern-europe', image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=700&q=80', region: 'Europe', price: '€1,199+', description: 'Discover the fairytale cities of Poland, Czechia, Hungary, Austria, Croatia, Slovenia, and Romania.', sort_order: 6, is_trending: true, is_active: true },
      { name: 'Nordic & Scandinavia', slug: 'nordic-scandinavia', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80', region: 'Europe', price: '€1,899+', description: 'Experience the Northern Lights, stunning fjords, and pristine landscapes of Norway, Iceland, Sweden, Denmark, and Finland.', sort_order: 7, is_trending: true, is_active: true },
      { name: 'India', slug: 'india', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', region: 'Asia', price: '₹49,999+', description: 'Discover the incredible diversity of India — from the Himalayas to the backwaters of Kerala, royal Rajasthan to spiritual Varanasi.', sort_order: 8, is_trending: true, is_active: true },
      { name: 'CIS Destinations', slug: 'cis-destinations', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80', region: 'Asia', price: '$999+', description: 'Explore the hidden gems of Central Asia and the Caucasus region — Azerbaijan, Georgia, Kazakhstan, Uzbekistan, and more.', sort_order: 9, is_trending: true, is_active: true },
      { name: 'South Asia & Indian Ocean', slug: 'south-asia-indian-ocean', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80', region: 'Asia', price: '$1,199+', description: 'Discover the spiritual beauty of Nepal, Bhutan, Sri Lanka, and the tropical paradise of Maldives and Mauritius.', sort_order: 10, is_trending: true, is_active: true }
    ];

    // Remove old destinations that are not in the new list
    const destinationSlugs = destinations.map(d => d.slug);
    try {
      const existingDests = await db.query('SELECT * FROM destinations');
      for (const existing of existingDests) {
        if (!destinationSlugs.includes(existing.slug)) {
          try { await db.delete('destinations', existing.id); } catch (e) {}
          // Also remove any packages linked to old destinations
          try { await db.query('DELETE FROM packages WHERE destination_id = $1', [existing.id]); } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Could not clean old destinations:', e.message);
    }

    results.data.destinations = [];
    for (const dest of destinations) {
      try {
        const created = await db.insert('destinations', dest);
        results.data.destinations.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM destinations WHERE slug = $1', [dest.slug]);
        if (existing.length > 0) results.data.destinations.push(existing[0]);
      }
    }

    // Seed Services
    const services = [
      { title: 'Tailor-Made Itineraries', slug: 'tailor-made-itineraries', description: 'Custom travel plans designed for your pace, tastes, and priorities.', icon: 'best-price', sort_order: 1, is_active: true },
      { title: 'Luxury Hotel Selection', slug: 'luxury-hotel-selection', description: 'Handpicked stays in premium hotels, resorts, and boutique retreats.', icon: 'support', sort_order: 2, is_active: true },
      { title: '24/7 Travel Support', slug: '24-7-travel-support', description: 'Dedicated travel assistance and concierge support throughout your journey.', icon: 'easy-booking', sort_order: 3, is_active: true }
    ];

    results.data.services = [];
    for (const service of services) {
      try {
        const created = await db.insert('services', service);
        results.data.services.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM services WHERE slug = $1', [service.slug]);
        if (existing.length > 0) results.data.services.push(existing[0]);
      }
    }

    // Seed Packages (all trips are now packages)
    const packages = [
      { destination_id: 1, title: 'Australia & New Zealand Highlights', slug: 'australia-new-zealand-highlights', days: '12 Days / 11 Nights', meals: '', short_description: 'Discover Sydney Harbour, the Great Barrier Reef, Milford Sound, and the geothermal wonders of Rotorua on this epic journey Down Under.', long_description: 'Discover Sydney Harbour, the Great Barrier Reef, Milford Sound, and the geothermal wonders of Rotorua on this epic journey Down Under.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$2,299', sort_order: 1, is_trending: true, is_active: true },
      { destination_id: 2, title: 'Japan & South Korea Discovery', slug: 'japan-south-korea-discovery', days: '10 Days / 9 Nights', meals: '', short_description: 'Experience Tokyo\'s neon streets, Kyoto\'s ancient temples, Seoul\'s vibrant culture, and Busan\'s coastal beauty in one unforgettable trip.', long_description: 'Experience Tokyo\'s neon streets, Kyoto\'s ancient temples, Seoul\'s vibrant culture, and Busan\'s coastal beauty in one unforgettable trip.', sub_heading: 'Best Seller', image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$1,899', sort_order: 2, is_trending: true, is_active: true },
      { destination_id: 3, title: 'Southeast Asia Explorer', slug: 'southeast-asia-explorer', days: '14 Days / 13 Nights', meals: '', short_description: 'Journey through Thailand, Singapore, Bali, Malaysia, Vietnam & Cambodia — from Bangkok\'s temples to Angkor Wat and tropical island paradises.', long_description: 'Journey through Thailand, Singapore, Bali, Malaysia, Vietnam & Cambodia — from Bangkok\'s temples to Angkor Wat and tropical island paradises.', sub_heading: 'Top Rated', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$1,499', sort_order: 3, is_trending: true, is_active: true },
      { destination_id: 4, title: 'UK & Ireland Heritage Tour', slug: 'uk-ireland-heritage-tour', days: '10 Days / 9 Nights', meals: '', short_description: 'From London\'s iconic landmarks and Edinburgh\'s castles to Dublin\'s pubs and the Cliffs of Moher — explore the best of Britain and Ireland.', long_description: 'From London\'s iconic landmarks and Edinburgh\'s castles to Dublin\'s pubs and the Cliffs of Moher — explore the best of Britain and Ireland.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '€1,499', sort_order: 4, is_trending: true, is_active: true },
      { destination_id: 5, title: 'Europe Highlights Getaway', slug: 'europe-highlights-getaway', days: '8 Days / 7 Nights', meals: '', short_description: 'A signature Europe itinerary covering Paris, Rome, Switzerland, Barcelona, and Amsterdam with handpicked stays and guided city experiences.', long_description: 'A signature Europe itinerary covering Paris, Rome, Switzerland, Barcelona, and Amsterdam with handpicked stays and guided city experiences.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=80', inclusives: '', exclusives: '', itinerary: 'Day: 1\nDay 2:', additional_info: '', price: '€1,499', sort_order: 5, is_trending: true, is_active: true },
      { destination_id: 6, title: 'Central & Eastern Europe Grand Tour', slug: 'central-eastern-europe-grand-tour', days: '12 Days / 11 Nights', meals: '', short_description: 'Discover the fairytale cities of Prague, Budapest, Vienna, Krakow, Zagreb, and more through Central and Eastern Europe.', long_description: 'Discover the fairytale cities of Prague, Budapest, Vienna, Krakow, Zagreb, and more through Central and Eastern Europe.', sub_heading: 'New', image_url: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '€1,199', sort_order: 6, is_trending: true, is_active: true },
      { destination_id: 7, title: 'Nordic & Scandinavia Adventure', slug: 'nordic-scandinavia-adventure', days: '10 Days / 9 Nights', meals: '', short_description: 'Chase the Northern Lights in Iceland, cruise the Norwegian fjords, and explore Copenhagen, Stockholm, and Helsinki.', long_description: 'Chase the Northern Lights in Iceland, cruise the Norwegian fjords, and explore Copenhagen, Stockholm, and Helsinki.', sub_heading: 'Hot Deal', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '€1,899', sort_order: 7, is_trending: true, is_active: true },
      { destination_id: 8, title: 'Incredible India Explorer', slug: 'incredible-india-explorer', days: '12 Days / 11 Nights', meals: '', short_description: 'From the Golden Triangle to the backwaters of Kerala and the spiritual ghats of Varanasi — experience India\'s incredible diversity.', long_description: 'From the Golden Triangle to the backwaters of Kerala and the spiritual ghats of Varanasi — experience India\'s incredible diversity.', sub_heading: 'Best Seller', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', inclusives: '', exclusives: '', itinerary: 'Day: 1\nDay 2:', additional_info: '', price: '₹49,999', sort_order: 8, is_trending: true, is_active: true },
      { destination_id: 9, title: 'CIS Destinations Unveiled', slug: 'cis-destinations-unveiled', days: '9 Days / 8 Nights', meals: '', short_description: 'Explore the hidden gems of Central Asia and the Caucasus — Azerbaijan, Georgia, Kazakhstan, and Uzbekistan\'s Silk Road cities.', long_description: 'Explore the hidden gems of Central Asia and the Caucasus — Azerbaijan, Georgia, Kazakhstan, and Uzbekistan\'s Silk Road cities.', sub_heading: 'Trending', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$999', sort_order: 9, is_trending: true, is_active: true },
      { destination_id: 10, title: 'South Asia & Indian Ocean Escape', slug: 'south-asia-indian-ocean-escape', days: '11 Days / 10 Nights', meals: '', short_description: 'Discover the spiritual beauty of Nepal, Bhutan, and Sri Lanka, then relax in the tropical paradise of Maldives and Mauritius.', long_description: 'Discover the spiritual beauty of Nepal, Bhutan, and Sri Lanka, then relax in the tropical paradise of Maldives and Mauritius.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '$1,199', sort_order: 10, is_trending: true, is_active: true },
      { destination_id: 8, title: 'Varanasi & Ganga Aarti', slug: 'varanasi-ganga-aarti', days: '5 Days / 4 Nights', meals: '', short_description: 'A restorative journey through Varanasi with sunrise boat rides, temple visits, guided meditation, and the evening Ganga Aarti.', long_description: 'A restorative journey through Varanasi with sunrise boat rides, temple visits, guided meditation, and the evening Ganga Aarti.', sub_heading: 'Sacred Journey', image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹24,999', sort_order: 11, is_spiritual: true, is_active: true },
      { destination_id: 8, title: 'Rishikesh Yoga Retreat', slug: 'rishikesh-yoga-retreat', days: '6 Days / 5 Nights', meals: '', short_description: 'Reconnect with yourself beside the Ganges through daily yoga, breathwork, guided meditation, and peaceful Himalayan walks.', long_description: 'Reconnect with yourself beside the Ganges through daily yoga, breathwork, guided meditation, and peaceful Himalayan walks.', sub_heading: 'Wellness Pick', image_url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹29,999', sort_order: 12, is_spiritual: true, is_active: true },
      { destination_id: 10, title: 'Bodh Gaya Mindfulness Tour', slug: 'bodh-gaya-mindfulness-tour', days: '4 Days / 3 Nights', meals: '', short_description: 'Follow the Buddhist path in Bodh Gaya with monastery visits, mindful sessions, and time for quiet reflection under the Bodhi tree.', long_description: 'Follow the Buddhist path in Bodh Gaya with monastery visits, mindful sessions, and time for quiet reflection under the Bodhi tree.', sub_heading: 'Mindful Escape', image_url: 'https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹22,999', sort_order: 13, is_spiritual: true, is_active: true },
      { destination_id: 8, title: 'Kedarnath Pilgrimage', slug: 'kedarnath-pilgrimage', days: '7 Days / 6 Nights', meals: '', short_description: 'Undertake a carefully planned Himalayan pilgrimage to Kedarnath with comfortable stays, local guidance, and meaningful temple time.', long_description: 'Undertake a carefully planned Himalayan pilgrimage to Kedarnath with comfortable stays, local guidance, and meaningful temple time.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹34,999', sort_order: 14, is_spiritual: true, is_active: true }
    ];

    results.data.packages = [];
    for (const pkg of packages) {
      try {
        const created = await db.insert('packages', pkg);
        results.data.packages.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM packages WHERE slug = $1', [pkg.slug]);
        if (existing.length > 0) results.data.packages.push(existing[0]);
      }
    }

    // Seed About Us
    const aboutUs = {
      heading: 'Travel that Touches the Soul',
      subheading: 'Curated Travel. Authentic Moments. Lasting Impact.',
      description: 'At Trip For Soul, we craft meaningful land journeys that are soulful, sustainable, and deeply personal.',
      features: '["Handpicked destinations", "Local guides", "Sustainable tourism", "24/7 support"]',
      cta_text: 'Begin Your Journey',
      cta_link: '/enquire-now',
      image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
      premium_heading: 'Premium Travel for the Curious Soul',
      premium_description: 'At Trip For Soul, we design immersive, high-end journeys for travelers who want more than just a trip. Every detail is carefully curated — from first-class comfort to authentic experiences — so you can explore the world with ease, depth, and style.',
      premium_button_text: 'Explore Our Destinations',
      premium_button_link: '/destination',
      experience_heading: 'Curated Travel Moments',
      experience_description_title: 'Luxury isn\'t just about where you stay — it\'s how you experience the world.',
      experience_description: 'At Trip For Soul, we don\'t just book trips — we craft unforgettable journeys. From hot-air balloon rides over ancient landscapes to boutique stays along dramatic coastlines, we create travel experiences as bold, beautiful, and unique as you are.',
      experience_subheading: 'What We Do Best',
      experience_list: '["Tailor-made escapes", "Private tours and once-in-a-lifetime adventures", "Exotic honeymoons, wellness retreats & family getaways", "Luxury stays and VIP concierge services", "On-call travel support, wherever you are in the world"]',
      experience_image: processSeedImage('/uploads/1784971410110-home-hero-removebg-preview.jpg'),
      why_heading: 'Service Beyond Expectations',
      why_description: 'Because you deserve more than just a vacation — you deserve a journey crafted entirely around you.',
      why_image: '',
      promise_heading: 'Our Commitment to You',
      promise_subheading: 'At Trip For Soul, our promise is simple:',
      promise_description: 'To deliver extraordinary journeys, flawlessly executed.',
      promise_list: '["Tailor-made escapes", "Private tours and once-in-a-lifetime adventures", "Exotic honeymoons, wellness retreats & family getaways", "Luxury stays and VIP concierge services", "On-call travel support, wherever you are in the world"]',
      promise_image: '',
      difference_heading: 'What Makes Us Different',
      difference_description: 'We don\'t just plan trips — we design journeys with intention, care, and imagination.',
      difference_subheading: 'What Sets Us Apart',
      difference_list: '["Tailor-Made Itineraries : No one-size-fits-all tours", "Insider Access & Authentic Encounters", "Premium Service, Start to Finish", "Experts Who Travel Like You Do"]',
      difference_image: '',
      cta_heading: 'Start Planning Your Journey',
      cta_description: 'Let us bring your next great story to life.',
      cta_button_text: 'Enquire Now',
      cta_button_link: '/enquire-now',
      is_active: true
    };
    results.data.about_us = await db.insert('about_us', aboutUs);

    // Seed Features
    const features = [
      { icon: 'best-price', title: 'Best Price Guarantee', description: 'We ensure you get the most value for your journey with competitive pricing on every package.', sort_order: 1, is_active: true },
      { icon: 'easy-booking', title: 'Easy & Quick Booking', description: 'Book your dream trips in minutes with our simple and hassle-free booking system.', sort_order: 2, is_active: true },
      { icon: 'support', title: 'Customer Care 24/7', description: 'Our dedicated support team is available around the clock to ensure a seamless travel experience.', sort_order: 3, is_active: true }
    ];
    results.data.features = [];
    for (const feature of features) {
      try {
        const created = await db.insert('features', feature);
        results.data.features.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM features WHERE title = $1', [feature.title]);
        if (existing.length > 0) results.data.features.push(existing[0]);
      }
    }

    // Seed Testimonials
    const testimonials = [
      { name: 'Mr. Ritik Singh', image_url: 'https://tripforsoul.com/public/img/gallery/b-4.png', rating: 5, review: 'We booked a 12-day tour of Italy with TripForSoul and had an absolutely remarkable experience.', sort_order: 1, is_active: true },
      { name: 'Sohan Sharma', image_url: 'https://tripforsoul.com/public/img/gallery/b-1.png', rating: 5, review: 'We booked Vietnam with TripForSoul. It was so much enchanting.', sort_order: 2, is_active: true },
      { name: 'Rakesh Singh', image_url: 'https://tripforsoul.com/public/img/gallery/b-2.png', rating: 5, review: 'Europe package was a dream with TripForSoul. Hotels well-situated and clean.', sort_order: 3, is_active: true },
      { name: 'Vishnu Kumar', image_url: 'https://tripforsoul.com/public/img/gallery/b-3.png', rating: 5, review: 'Our UK tour was absolutely unforgettable. Everything was organised flawlessly.', sort_order: 4, is_active: true },
      { name: 'Bhaskar Bansal', image_url: processSeedImage('/uploads/1785047991317-desti.png'), rating: 4, review: 'Best travel agency', sort_order: 0, is_active: true }
    ];
    results.data.testimonials = [];
    for (const testimonial of testimonials) {
      try {
        const created = await db.insert('testimonials', testimonial);
        results.data.testimonials.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM testimonials WHERE name = $1', [testimonial.name]);
        if (existing.length > 0) results.data.testimonials.push(existing[0]);
      }
    }

    // Seed Banner Settings
    const bannerSettings = {
      heading: 'Journeys Crafted for the Soul',
      subtitle: 'Not just another trip. We design meaningful land journeys that connect you with culture, people, and places beyond the tourist trail.',
      button1_text: 'Find Now',
      button2_text: 'View All Packages',
      button2_link: '/packages'
    };
    results.data.banner_settings = await db.insert('banner_settings', bannerSettings);

    // Seed Banner Images
    const bannerImages = [
      { image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80', sort_order: 1, is_active: true },
      { image_url: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80', sort_order: 2, is_active: true },
      { image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80', sort_order: 3, is_active: true }
    ];
    results.data.banner_images = [];
    for (const banner of bannerImages) {
      try {
        const created = await db.insert('banner_images', banner);
        results.data.banner_images.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM banner_images WHERE image_url = $1', [banner.image_url]);
        if (existing.length > 0) results.data.banner_images.push(existing[0]);
      }
    }

    // Seed Trending Settings
    const trendingSettings = {
      is_enabled: true,
      heading: 'Trending Now',
      subtitle: 'Most sought-after destinations this season'
    };
    results.data.trending_settings = await db.insert('trending_settings', trendingSettings);

    // Seed Trending Items
    const trendingItems = [
      { name: 'Swiss Alps Explorer', image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=700&q=80', region: 'Switzerland', price: '€2,499', badge: 'Hot Deal', sort_order: 1, is_active: true },
      { name: 'Maldives Retreat', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80', region: 'Maldives', price: '$1,899', badge: 'Best Seller', sort_order: 2, is_active: true },
      { name: 'Moroccan Sahara', image_url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=700&q=80', region: 'Morocco', price: '$1,299', badge: 'Trending', sort_order: 3, is_active: true },
      { name: 'Japan Cherry Blossom', image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80', region: 'Japan', price: '$2,199', badge: 'Popular', sort_order: 4, is_active: true },
      { name: 'Bali Wellness Escape', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80', region: 'Indonesia', price: '$1,499', badge: 'New', sort_order: 5, is_active: true },
      { name: 'Greek Island Hopping', image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80', region: 'Greece', price: '€1,799', badge: 'Popular', sort_order: 6, is_active: true }
    ];
    results.data.trending_items = [];
    for (const item of trendingItems) {
      try {
        const created = await db.insert('trending_items', item);
        results.data.trending_items.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM trending_items WHERE name = $1', [item.name]);
        if (existing.length > 0) results.data.trending_items.push(existing[0]);
      }
    }

    // Seed Region Pricing
    const regionPricing = [
      { region: 'Asia', starting_price: '$799', currency: 'USD', usd_price: '799', is_active: true },
      { region: 'Europe', starting_price: '$1,499', currency: 'USD', usd_price: '1499', is_active: true },
      { region: 'Middle East', starting_price: '$999', currency: 'USD', usd_price: '999', is_active: true },
      { region: 'Africa', starting_price: '$1,299', currency: 'USD', usd_price: '1299', is_active: true },
      { region: 'Americas', starting_price: '$1,199', currency: 'USD', usd_price: '1199', is_active: true }
    ];
    results.data.region_pricing = [];
    for (const pricing of regionPricing) {
      try {
        const created = await db.insert('region_pricing', pricing);
        results.data.region_pricing.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM region_pricing WHERE region = $1', [pricing.region]);
        if (existing.length > 0) results.data.region_pricing.push(existing[0]);
      }
    }

    // Seed Homepage Sections
    const homepageSections = [
      { section_key: 'banner', section_name: 'Banner', is_visible: true, sort_order: 1 },
      { section_key: 'about_us', section_name: 'About Us', is_visible: true, sort_order: 2 },
      { section_key: 'trending', section_name: 'Trending Now', is_visible: true, sort_order: 3 },
      { section_key: 'popular_destinations', section_name: 'Popular Destinations', is_visible: true, sort_order: 4 },
      { section_key: 'spiritual_escape', section_name: 'Spiritual Escape', is_visible: true, sort_order: 5 },
      { section_key: 'features', section_name: 'Features', is_visible: true, sort_order: 6 },
      { section_key: 'testimonials', section_name: 'Testimonials', is_visible: true, sort_order: 7 },
      { section_key: 'gallery', section_name: 'Gallery', is_visible: true, sort_order: 8 },
      { section_key: 'deals', section_name: 'Deals', is_visible: true, sort_order: 9 },
      { section_key: 'footer', section_name: 'Footer', is_visible: true, sort_order: 10 }
    ];
    results.data.homepage_sections = [];
    for (const section of homepageSections) {
      try {
        const created = await db.insert('homepage_sections', section);
        results.data.homepage_sections.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM homepage_sections WHERE section_key = $1', [section.section_key]);
        if (existing.length > 0) results.data.homepage_sections.push(existing[0]);
      }
    }

    // Seed Deals Settings
    const dealsSettings = {
      tagline: 'Travel offers',
      heading: 'Make more of every journey.',
      description: 'Discover current seasonal offers and speak with our team to find the journey that suits your plans.',
      button_text: 'Ask about offers',
      button_link: '/contact?subject=Offer%20enquiry',
      card_tagline: 'Planning made personal',
      card_heading: 'Get a tailored recommendation, clear inclusions, and expert support before you book.',
      card_description: 'Offer availability and final pricing are confirmed by the travel team.',
      is_active: true
    };
    results.data.deals_settings = await db.insert('deals_settings', dealsSettings);

    // Seed Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      username: 'admin',
      email: 'admin@tripforsoul.com',
      password: hashedPassword,
      role: 'admin',
      permissions: null,
      is_active: true
    };
    try {
      results.data.admin = await db.insert('admins', adminUser);
    } catch (e) {
      const existing = await db.query('SELECT * FROM admins WHERE username = $1', ['admin']);
      if (existing.length > 0) {
        results.data.admin = existing[0];
      }
    }

    // Seed Staff User (Bhaskar)
    const staffPassword = await bcrypt.hash('bhaskar123', 10);
    const staffUser = {
      username: 'Bhaskar',
      email: 'bhskrbnsl@gmail.com',
      password: staffPassword,
      role: 'staff',
      permissions: ['dashboard', 'banner', 'trending'],
      is_active: true
    };
    try {
      results.data.staff = await db.insert('admins', staffUser);
    } catch (e) {
      const existing = await db.query('SELECT * FROM admins WHERE username = $1', ['Bhaskar']);
      if (existing.length > 0) {
        results.data.staff = existing[0];
      }
    }

    // Seed Popular Destinations
    const popularDestinations = [
      { name: 'Swiss Alps Explorer', image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=700&q=80', region: 'Switzerland', price: '€2,499', sort_order: 1, is_active: true },
      { name: 'Maldives Retreat', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80', region: 'Maldives', price: '$1,899', sort_order: 2, is_active: true },
      { name: 'Moroccan Sahara', image_url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=700&q=80', region: 'Morocco', price: '$1,299', sort_order: 3, is_active: true },
      { name: 'Japan Cherry Blossom', image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80', region: 'Japan', price: '$2,199', sort_order: 4, is_active: true },
      { name: 'Bali Wellness Escape', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80', region: 'Indonesia', price: '$1,499', sort_order: 5, is_active: true },
      { name: 'Greek Island Hopping', image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80', region: 'Greece', price: '€1,799', sort_order: 6, is_active: true }
    ];
    results.data.popular_destinations = [];
    for (const dest of popularDestinations) {
      try {
        const created = await db.insert('popular_destinations', dest);
        results.data.popular_destinations.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM popular_destinations WHERE name = $1', [dest.name]);
        if (existing.length > 0) results.data.popular_destinations.push(existing[0]);
      }
    }

    // Seed Gallery Images
    const galleryImages = [
      { image_url: processSeedImage('/uploads/gallery-1.jpg'), title: 'Mountain Landscape', sort_order: 1, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-2.jpg'), title: 'Nature Valley', sort_order: 2, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-3.jpg'), title: 'Forest Path', sort_order: 3, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-4.jpg'), title: 'Ancient Ruins', sort_order: 4, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-5.jpg'), title: 'Europe Trip', sort_order: 5, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-6.jpg'), title: 'Tropical Beach', sort_order: 6, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-7.jpg'), title: 'Waterfall', sort_order: 7, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-8.jpg'), title: 'Sunset View', sort_order: 8, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-9.jpg'), title: 'Mountain Peak', sort_order: 9, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-10.jpg'), title: 'Lake Reflection', sort_order: 10, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-11.jpg'), title: 'Countryside', sort_order: 11, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-12.jpg'), title: 'Forest Trail', sort_order: 12, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-13.jpg'), title: 'Desert Dunes', sort_order: 13, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-14.jpg'), title: 'Ocean Waves', sort_order: 14, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-15.jpg'), title: 'City Lights', sort_order: 15, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-16.jpg'), title: 'Snow Mountains', sort_order: 16, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-17.jpg'), title: 'Green Hills', sort_order: 17, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-18.jpg'), title: 'Tropical Paradise', sort_order: 18, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-19.jpg'), title: 'Scenic View', sort_order: 19, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-20.jpg'), title: 'Meadow', sort_order: 20, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-21.jpg'), title: 'Adventure', sort_order: 21, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-22.jpg'), title: 'Beautiful Sunset', sort_order: 22, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-23.jpg'), title: 'Coastal View', sort_order: 23, is_active: true },
      { image_url: processSeedImage('/uploads/gallery-24.jpg'), title: 'Nature Wonder', sort_order: 24, is_active: true }
    ];
    results.data.gallery_images = [];
    for (const img of galleryImages) {
      try {
        const created = await db.insert('gallery_images', img);
        results.data.gallery_images.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM gallery_images WHERE image_url = $1', [img.image_url]);
        if (existing.length > 0) results.data.gallery_images.push(existing[0]);
      }
    }

    // Seed Page Banners
    const pageBanners = [
      { page_key: 'destinations', title: '', subtitle: '', background_image: processSeedImage('/uploads/1784632224545-desti.png'), is_active: true },
      { page_key: 'gallery', title: '', subtitle: '', background_image: processSeedImage('/uploads/1785053576780-barcelona.jpg'), is_active: true }
    ];
    results.data.page_banners = [];
    for (const banner of pageBanners) {
      try {
        const created = await db.insert('page_banners', banner);
        results.data.page_banners.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM page_banners WHERE page_key = $1', [banner.page_key]);
        if (existing.length > 0) results.data.page_banners.push(existing[0]);
      }
    }

    // Seed Blog Posts
    const blogs = [
      {
        title: 'Lorem Ipsum Blog',
        slug: 'lorem-ipsum-blog',
        excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nWhy Lorem Ipsum?\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.',
        cover_image: processSeedImage('/uploads/1785677030410-desti.png'),
        gallery_images: [],
        author: '',
        tags: [],
        meta_title: 'Lorem Ipsum Blog',
        meta_description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        is_active: true,
        created_at: '2026-08-02T13:24:08.159Z',
        updated_at: '2026-08-02T13:24:08.159Z'
      }
    ];
    results.data.blogs = [];
    for (const blog of blogs) {
      try {
        const created = await db.insert('blogs', blog);
        results.data.blogs.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM blogs WHERE slug = $1', [blog.slug]);
        if (existing.length > 0) results.data.blogs.push(existing[0]);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Clear all tables
    const tables = [
      'admins', 'destinations', 'services', 'trips', 'about_us', 'features',
      'testimonials', 'banner_settings', 'banner_images',
      'trending_settings', 'trending_items', 'region_pricing', 'homepage_sections',
      'deals_settings', 'packages', 'page_banners', 'team_members',
      'gallery_images', 'blogs', 'popular_destinations'
    ];

    for (const table of tables) {
      try {
        await db.query(`TRUNCATE TABLE ${table} CASCADE`);
      } catch (error) {
        console.error(`Error truncating ${table}:`, error);
      }
    }

    return NextResponse.json({ success: true, message: 'Database cleared successfully!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
