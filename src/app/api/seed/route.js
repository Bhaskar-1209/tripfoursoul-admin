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
      { name: 'Europe', slug: 'europe', image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80', region: 'Europe', price: '€1,299+', description: 'Explore the beautiful cities of Europe including Paris, Amsterdam, Barcelona, and more.', sort_order: 1, is_trending: true, is_active: true },
      { name: 'India • Sri Lanka • Nepal', slug: 'india-sri-lanka-nepal', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', region: 'Asia', price: '$799+', description: 'Discover the rich culture and heritage of South Asia with our curated tours.', sort_order: 2, is_trending: true, is_active: true },
      { name: 'Norway & Iceland', slug: 'norway-iceland', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80', region: 'Europe', price: '€1,899+', description: 'Experience the Northern Lights and stunning fjords of Scandinavia.', sort_order: 3, is_trending: true, is_active: true },
      { name: 'CIS Destinations', slug: 'cis-destinations', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80', region: 'Asia', price: '$999+', description: 'Explore the hidden gems of Central Asia and the Caucasus region.', sort_order: 4, is_trending: true, is_active: true },
      { name: 'Vietnam & Cambodia', slug: 'vietnam-cambodia', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', region: 'Asia', price: '$699+', description: 'Discover ancient temples, vibrant cities, and delicious cuisine of Southeast Asia.', sort_order: 5, is_trending: false, is_active: true },
      { name: 'Singapore & Thailand', slug: 'singapore-thailand', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80', region: 'Asia', price: '$899+', description: 'Experience the perfect blend of modern city life and tropical beaches.', sort_order: 6, is_trending: false, is_active: true }
    ];

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

    // Seed Trips/Packages
    const trips = [
      { name: 'Swiss Alps Explorer', description: 'Experience the breathtaking beauty of the Swiss Alps with this 7-day adventure.', image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=700&q=80', price: '€2,499', duration: '7 Days / 6 Nights', days: '7 Days / 6 Nights', location: 'Switzerland', category: 'trending', badge: 'Hot Deal', is_active: true, sort_order: 1 },
      { name: 'Maldives Retreat', description: 'Relax in the beautiful Maldives with crystal clear waters and luxurious overwater bungalows.', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80', price: '$1,899', duration: '5 Days / 4 Nights', days: '5 Days / 4 Nights', location: 'Maldives', category: 'trending', badge: 'Best Seller', is_active: true, sort_order: 2 },
      { name: 'Moroccan Sahara', description: 'Explore the magic of Morocco with visits to Marrakech, Fez, and the Sahara Desert.', image_url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=700&q=80', price: '$1,299', duration: '8 Days / 7 Nights', days: '8 Days / 7 Nights', location: 'Morocco', category: 'trending', badge: 'Trending', is_active: true, sort_order: 3 },
      { name: 'Japan Cherry Blossom', description: 'Witness the beautiful cherry blossoms in Japan during peak bloom season.', image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80', price: '$2,199', duration: '10 Days / 9 Nights', days: '10 Days / 9 Nights', location: 'Japan', category: 'trending', badge: 'Popular', is_active: true, sort_order: 4 },
      { name: 'Bali Wellness Escape', description: 'Rejuvenate your mind and body with yoga, meditation, and spa treatments in Bali.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80', price: '$1,499', duration: '6 Days / 5 Nights', days: '6 Days / 5 Nights', location: 'Indonesia', category: 'trending', badge: 'New', is_active: true, sort_order: 5 },
      { name: 'Greek Island Hopping', description: 'Explore the beautiful Greek islands including Santorini, Mykonos, and Athens.', image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80', price: '€1,799', duration: '9 Days / 8 Nights', days: '9 Days / 8 Nights', location: 'Greece', category: 'trending', badge: 'Popular', is_active: true, sort_order: 6 },
      { name: 'Varanasi & Ganga Aarti', description: 'A restorative journey through Varanasi with sunrise boat rides, temple visits, guided meditation, and the evening Ganga Aarti.', image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=700&q=80', price: '₹24,999', duration: '5 Days / 4 Nights', days: '5 Days / 4 Nights', location: 'Varanasi, India', category: 'spiritual_escape', badge: 'Sacred Journey', is_active: true, sort_order: 1, destination_id: 5 },
      { name: 'Rishikesh Yoga Retreat', description: 'Reconnect with yourself beside the Ganges through daily yoga, breathwork, guided meditation, and peaceful Himalayan walks.', image_url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=700&q=80', price: '₹29,999', duration: '6 Days / 5 Nights', days: '6 Days / 5 Nights', location: 'Rishikesh, India', category: 'spiritual_escape', badge: 'Wellness Pick', is_active: true, sort_order: 2, destination_id: 3 },
      { name: 'Bodh Gaya Mindfulness Tour', description: 'Follow the Buddhist path in Bodh Gaya with monastery visits, mindful sessions, and time for quiet reflection under the Bodhi tree.', image_url: 'https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?w=700&q=80', price: '₹22,999', duration: '4 Days / 3 Nights', days: '4 Days / 3 Nights', location: 'Bodh Gaya, India', category: 'spiritual_escape', badge: 'Mindful Escape', is_active: true, sort_order: 3 },
      { name: 'Kedarnath Pilgrimage', description: 'Undertake a carefully planned Himalayan pilgrimage to Kedarnath with comfortable stays, local guidance, and meaningful temple time.', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=700&q=80', price: '₹34,999', duration: '7 Days / 6 Nights', days: '7 Days / 6 Nights', location: 'Uttarakhand, India', category: 'spiritual_escape', badge: 'Popular', is_active: true, sort_order: 4 },
      { name: 'Europe Highlights Getaway', description: 'A signature Europe itinerary covering Paris, Amsterdam, and Barcelona with handpicked stays and guided city experiences.', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=80', price: '€1,499', duration: '8 Days / 7 Nights', days: '8 Days / 7 Nights', location: 'France, Netherlands & Spain', category: 'popular_destinations', badge: 'Popular', is_active: true, sort_order: 1, destination_id: 1 },
      { name: 'India, Sri Lanka & Nepal Explorer', description: 'Discover the cultural treasures, sacred sites, and warm hospitality of South Asia in one thoughtfully planned journey.', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', price: '₹89,999', duration: '12 Days / 11 Nights', days: '12 Days / 11 Nights', location: 'India, Sri Lanka & Nepal', category: 'popular_destinations', badge: 'Best Seller', is_active: true, sort_order: 2, destination_id: 2 },
      { name: 'Vietnam & Cambodia Discovery', description: 'Travel from Hanoi to Ha Long Bay and the ancient temples of Angkor on a culture-rich Southeast Asian escape.', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', price: '₹74,999', duration: '9 Days / 8 Nights', days: '9 Days / 8 Nights', location: 'Vietnam & Cambodia', category: 'popular_destinations', badge: 'Top Rated', is_active: true, sort_order: 3, destination_id: 5 },
      { name: 'Singapore & Thailand Escape', description: 'Enjoy Singapore\'s city energy and Thailand\'s island charm with family-friendly hotels and seamless transfers.', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80', price: '₹69,999', duration: '7 Days / 6 Nights', days: '7 Days / 6 Nights', location: 'Singapore & Thailand', category: 'popular_destinations', badge: 'Family Favourite', is_active: true, sort_order: 4, destination_id: 6 }
    ];

    results.data.trips = [];
    for (const trip of trips) {
      try {
        const created = await db.insert('trips', trip);
        results.data.trips.push(created);
      } catch (e) {
        const existing = await db.query('SELECT * FROM trips WHERE name = $1', [trip.name]);
        if (existing.length > 0) results.data.trips.push(existing[0]);
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
      button2_text: 'View All Trips',
      button2_link: '/destinations'
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

    // Seed Packages
    const packages = [
      { destination_id: 1, title: 'Europe Highlights Getaway', slug: 'europe-highlights-getaway', days: '8 Days / 7 Nights', meals: '', short_description: 'A signature Europe itinerary covering Paris, Amsterdam, and Barcelona with handpicked stays and guided city experiences.', long_description: 'A signature Europe itinerary covering Paris, Amsterdam, and Barcelona with handpicked stays and guided city experiences.', sub_heading: 'Popular', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=80', inclusives: '', exclusives: '', itinerary: 'Day: 1\nDay 2:', additional_info: '', price: '€1,499', sort_order: 1, is_active: true },
      { destination_id: 2, title: 'India, Sri Lanka & Nepal Explorer', slug: 'india-sri-lanka-nepal-explorer', days: '12 Days / 11 Nights', meals: '', short_description: 'Discover the cultural treasures, sacred sites, and warm hospitality of South Asia in one thoughtfully planned journey.', long_description: 'Discover the cultural treasures, sacred sites, and warm hospitality of South Asia in one thoughtfully planned journey.', sub_heading: 'Best Seller', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', inclusives: '', exclusives: '', itinerary: 'Day: 1\nDay 2:', additional_info: '', price: '₹89,999', sort_order: 2, is_active: true },
      { destination_id: 5, title: 'Vietnam & Cambodia Discovery', slug: 'vietnam-cambodia-discovery', days: '9 Days / 8 Nights', meals: '', short_description: 'Travel from Hanoi to Ha Long Bay and the ancient temples of Angkor on a culture-rich Southeast Asian escape.', long_description: 'Travel from Hanoi to Ha Long Bay and the ancient temples of Angkor on a culture-rich Southeast Asian escape.', sub_heading: 'Top Rated', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹74,999', sort_order: 3, is_active: true },
      { destination_id: 6, title: 'Singapore & Thailand Escape', slug: 'singapore-thailand-escape', days: '7 Days / 6 Nights', meals: '', short_description: 'Enjoy Singapore\'s city energy and Thailand\'s island charm with family-friendly hotels and seamless transfers.', long_description: 'Enjoy Singapore\'s city energy and Thailand\'s island charm with family-friendly hotels and seamless transfers.', sub_heading: 'Family Favourite', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80', inclusives: '', exclusives: '', itinerary: '', additional_info: '', price: '₹69,999', sort_order: 4, is_active: true }
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
