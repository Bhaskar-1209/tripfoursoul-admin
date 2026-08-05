import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';

export async function GET() {
  try {
    const results = {
      success: true,
      message: 'Database seeded successfully!',
      data: {}
    };

    // Seed Destinations
    const destinations = [
      { name: 'Europe', slug: 'europe', image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=700&q=80', region: 'Europe', price: '€1,299+', description: 'Explore the beautiful cities of Europe including Paris, Amsterdam, Barcelona, and more.', sort_order: 1, is_active: 1 },
      { name: 'India • Sri Lanka • Nepal', slug: 'india-sri-lanka-nepal', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', region: 'Asia', price: '$799+', description: 'Discover the rich culture and heritage of South Asia with our curated tours.', sort_order: 2, is_active: 1 },
      { name: 'Norway & Iceland', slug: 'norway-iceland', image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80', region: 'Europe', price: '€1,899+', description: 'Experience the Northern Lights and stunning fjords of Scandinavia.', sort_order: 3, is_active: 1 },
      { name: 'CIS Destinations', slug: 'cis-destinations', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=700&q=80', region: 'Asia', price: '$999+', description: 'Explore the hidden gems of Central Asia and the Caucasus region.', sort_order: 4, is_active: 1 },
      { name: 'Vietnam & Cambodia', slug: 'vietnam-cambodia', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', region: 'Asia', price: '$699+', description: 'Discover ancient temples, vibrant cities, and delicious cuisine of Southeast Asia.', sort_order: 5, is_active: 1 },
      { name: 'Singapore & Thailand', slug: 'singapore-thailand', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80', region: 'Asia', price: '$899+', description: 'Experience the perfect blend of modern city life and tropical beaches.', sort_order: 6, is_active: 1 }
    ];

    results.data.destinations = [];
    for (const dest of destinations) {
      const created = await db.insert('destinations', dest);
      results.data.destinations.push(created);
    }

    // Seed Trips/Packages
    const trips = [
      { name: 'Swiss Alps Explorer', description: 'Experience the breathtaking beauty of the Swiss Alps with this 7-day adventure.', image_url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=700&q=80', price: '€2,499', duration: '7 Days / 6 Nights', location: 'Switzerland', category: 'trending', badge: 'Hot Deal', is_active: 1, sort_order: 1 },
      { name: 'Maldives Retreat', description: 'Relax in the beautiful Maldives with crystal clear waters and luxurious overwater bungalows.', image_url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=700&q=80', price: '$1,899', duration: '5 Days / 4 Nights', location: 'Maldives', category: 'trending', badge: 'Best Seller', is_active: 1, sort_order: 2 },
      { name: 'Moroccan Sahara', description: 'Explore the magic of Morocco with visits to Marrakech, Fez, and the Sahara Desert.', image_url: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=700&q=80', price: '$1,299', duration: '8 Days / 7 Nights', location: 'Morocco', category: 'trending', badge: 'Trending', is_active: 1, sort_order: 3 },
      { name: 'Japan Cherry Blossom', description: 'Witness the beautiful cherry blossoms in Japan during peak bloom season.', image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=700&q=80', price: '$2,199', duration: '10 Days / 9 Nights', location: 'Japan', category: 'trending', badge: 'Popular', is_active: 1, sort_order: 4 },
      { name: 'Bali Wellness Escape', description: 'Rejuvenate your mind and body with yoga, meditation, and spa treatments in Bali.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=700&q=80', price: '$1,499', duration: '6 Days / 5 Nights', location: 'Indonesia', category: 'trending', badge: 'New', is_active: 1, sort_order: 5 },
      { name: 'Greek Island Hopping', description: 'Explore the beautiful Greek islands including Santorini, Mykonos, and Athens.', image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=700&q=80', price: '€1,799', duration: '9 Days / 8 Nights', location: 'Greece', category: 'trending', badge: 'Popular', is_active: 1, sort_order: 6 },
      { name: 'Varanasi & Ganga Aarti', description: 'A restorative journey through Varanasi with sunrise boat rides, temple visits, guided meditation, and the evening Ganga Aarti.', image_url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=700&q=80', price: '₹24,999', duration: '5 Days / 4 Nights', location: 'Varanasi, India', category: 'spiritual_escape', badge: 'Sacred Journey', is_active: 1, sort_order: 1 },
      { name: 'Rishikesh Yoga Retreat', description: 'Reconnect with yourself beside the Ganges through daily yoga, breathwork, guided meditation, and peaceful Himalayan walks.', image_url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=700&q=80', price: '₹29,999', duration: '6 Days / 5 Nights', location: 'Rishikesh, India', category: 'spiritual_escape', badge: 'Wellness Pick', is_active: 1, sort_order: 2 },
      { name: 'Bodh Gaya Mindfulness Tour', description: 'Follow the Buddhist path in Bodh Gaya with monastery visits, mindful sessions, and time for quiet reflection under the Bodhi tree.', image_url: 'https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?w=700&q=80', price: '₹22,999', duration: '4 Days / 3 Nights', location: 'Bodh Gaya, India', category: 'spiritual_escape', badge: 'Mindful Escape', is_active: 1, sort_order: 3 },
      { name: 'Kedarnath Pilgrimage', description: 'Undertake a carefully planned Himalayan pilgrimage to Kedarnath with comfortable stays, local guidance, and meaningful temple time.', image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=700&q=80', price: '₹34,999', duration: '7 Days / 6 Nights', location: 'Uttarakhand, India', category: 'spiritual_escape', badge: 'Popular', is_active: 1, sort_order: 4 },
      { name: 'Europe Highlights Getaway', description: 'A signature Europe itinerary covering Paris, Amsterdam, and Barcelona with handpicked stays and guided city experiences.', image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=700&q=80', price: '€1,499', duration: '8 Days / 7 Nights', location: 'France, Netherlands & Spain', category: 'popular_destinations', badge: 'Popular', is_active: 1, sort_order: 1 },
      { name: 'India, Sri Lanka & Nepal Explorer', description: 'Discover the cultural treasures, sacred sites, and warm hospitality of South Asia in one thoughtfully planned journey.', image_url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=700&q=80', price: '₹89,999', duration: '12 Days / 11 Nights', location: 'India, Sri Lanka & Nepal', category: 'popular_destinations', badge: 'Best Seller', is_active: 1, sort_order: 2 },
      { name: 'Vietnam & Cambodia Discovery', description: 'Travel from Hanoi to Ha Long Bay and the ancient temples of Angkor on a culture-rich Southeast Asian escape.', image_url: 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=700&q=80', price: '₹74,999', duration: '9 Days / 8 Nights', location: 'Vietnam & Cambodia', category: 'popular_destinations', badge: 'Top Rated', is_active: 1, sort_order: 3 },
      { name: 'Singapore & Thailand Escape', description: 'Enjoy Singapore\'s city energy and Thailand\'s island charm with family-friendly hotels and seamless transfers.', image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=700&q=80', price: '₹69,999', duration: '7 Days / 6 Nights', location: 'Singapore & Thailand', category: 'popular_destinations', badge: 'Family Favourite', is_active: 1, sort_order: 4 }
    ];

    results.data.trips = [];
    for (const trip of trips) {
      const created = await db.insert('trips', trip);
      results.data.trips.push(created);
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
      is_active: 1
    };
    results.data.about_us = await db.insert('about_us', aboutUs);

    // Seed Features
    const features = [
      { icon: 'best-price', title: 'Best Price Guarantee', description: 'We ensure you get the most value for your journey with competitive pricing on every package.', sort_order: 1, is_active: 1 },
      { icon: 'easy-booking', title: 'Easy & Quick Booking', description: 'Book your dream trips in minutes with our simple and hassle-free booking system.', sort_order: 2, is_active: 1 },
      { icon: 'support', title: 'Customer Care 24/7', description: 'Our dedicated support team is available around the clock to ensure a seamless travel experience.', sort_order: 3, is_active: 1 }
    ];
    results.data.features = [];
    for (const feature of features) {
      const created = await db.insert('features', feature);
      results.data.features.push(created);
    }

    // Seed Testimonials
    const testimonials = [
      { name: 'Mr. Ritik Singh', image_url: 'https://tripforsoul.com/public/img/gallery/b-4.png', rating: 5, review: 'We booked a 12-day tour of Italy with TripForSoul and had an absolutely remarkable experience.', sort_order: 1, is_active: 1 },
      { name: 'Sohan Sharma', image_url: 'https://tripforsoul.com/public/img/gallery/b-1.png', rating: 5, review: 'We booked Vietnam with TripForSoul. It was so much enchanting.', sort_order: 2, is_active: 1 },
      { name: 'Rakesh Singh', image_url: 'https://tripforsoul.com/public/img/gallery/b-2.png', rating: 5, review: 'Europe package was a dream with TripForSoul. Hotels well-situated and clean.', sort_order: 3, is_active: 1 },
      { name: 'Vishnu Kumar', image_url: 'https://tripforsoul.com/public/img/gallery/b-3.png', rating: 5, review: 'Our UK tour was absolutely unforgettable. Everything was organised flawlessly.', sort_order: 4, is_active: 1 }
    ];
    results.data.testimonials = [];
    for (const testimonial of testimonials) {
      const created = await db.insert('testimonials', testimonial);
      results.data.testimonials.push(created);
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
      { image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80', sort_order: 1, is_active: 1 },
      { image_url: 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80', sort_order: 2, is_active: 1 },
      { image_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80', sort_order: 3, is_active: 1 }
    ];
    results.data.banner_images = [];
    for (const banner of bannerImages) {
      const created = await db.insert('banner_images', banner);
      results.data.banner_images.push(created);
    }

    // Seed Trending Settings
    const trendingSettings = {
      is_enabled: 1,
      heading: 'Trending Now',
      subtitle: 'Most sought-after destinations this season'
    };
    results.data.trending_settings = await db.insert('trending_settings', trendingSettings);

    // Seed Region Pricing
    const regionPricing = [
      { region: 'Asia', starting_price: '$799', currency: 'USD', is_active: 1 },
      { region: 'Europe', starting_price: '$1,499', currency: 'USD', is_active: 1 },
      { region: 'Middle East', starting_price: '$999', currency: 'USD', is_active: 1 },
      { region: 'Africa', starting_price: '$1,299', currency: 'USD', is_active: 1 },
      { region: 'Americas', starting_price: '$1,199', currency: 'USD', is_active: 1 }
    ];
    results.data.region_pricing = [];
    for (const pricing of regionPricing) {
      try {
        const created = await db.insert('region_pricing', pricing);
        results.data.region_pricing.push(created);
      } catch (e) {
        // Skip if already exists
        const existing = await db.query('SELECT * FROM region_pricing WHERE region = ?', [pricing.region]);
        if (existing.length > 0) {
          results.data.region_pricing.push(existing[0]);
        }
      }
    }

    // Seed Homepage Sections
    const homepageSections = [
      { section_key: 'banner', section_name: 'Banner', is_visible: 1, sort_order: 1 },
      { section_key: 'about_us', section_name: 'About Us', is_visible: 1, sort_order: 2 },
      { section_key: 'trending', section_name: 'Trending Now', is_visible: 1, sort_order: 3 },
      { section_key: 'popular_destinations', section_name: 'Popular Destinations', is_visible: 1, sort_order: 4 },
      { section_key: 'spiritual_escape', section_name: 'Spiritual Escape', is_visible: 1, sort_order: 5 },
      { section_key: 'features', section_name: 'Features', is_visible: 1, sort_order: 6 },
      { section_key: 'testimonials', section_name: 'Testimonials', is_visible: 1, sort_order: 7 },
      { section_key: 'gallery', section_name: 'Gallery', is_visible: 1, sort_order: 8 },
      { section_key: 'deals', section_name: 'Deals', is_visible: 1, sort_order: 9 },
      { section_key: 'footer', section_name: 'Footer', is_visible: 1, sort_order: 10 }
    ];
    results.data.homepage_sections = [];
    for (const section of homepageSections) {
      try {
        const created = await db.insert('homepage_sections', section);
        results.data.homepage_sections.push(created);
      } catch (e) {
        // Skip if already exists
        const existing = await db.query('SELECT * FROM homepage_sections WHERE section_key = ?', [section.section_key]);
        if (existing.length > 0) {
          results.data.homepage_sections.push(existing[0]);
        }
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
      is_active: 1
    };
    results.data.deals_settings = await db.insert('deals_settings', dealsSettings);

    // Seed Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = {
      username: 'admin',
      email: 'admin@tripforsoul.com',
      password: hashedPassword
    };
    try {
      results.data.admin = await db.insert('admins', adminUser);
    } catch (e) {
      // Admin might already exist
      const existing = await db.query('SELECT * FROM admins WHERE username = ?', ['admin']);
      if (existing.length > 0) {
        results.data.admin = existing[0];
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
      'admins', 'destinations', 'trips', 'about_us', 'features', 
      'testimonials', 'banner_settings', 'banner_images', 
      'trending_settings', 'region_pricing', 'homepage_sections', 
      'deals_settings', 'packages', 'page_banners', 'team_members', 
      'gallery_images', 'blogs', 'popular_destinations'
    ];

    for (const table of tables) {
      try {
        await db.query(`TRUNCATE TABLE ${table}`);
      } catch (error) {
        console.error(`Error truncating ${table}:`, error);
      }
    }

    return NextResponse.json({ success: true, message: 'Database cleared successfully!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}