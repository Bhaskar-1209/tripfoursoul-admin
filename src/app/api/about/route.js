import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET - Fetch about us data
export async function GET() {
  try {
    const data = await db.query('SELECT * FROM about_us LIMIT 1');
    if (data.length > 0) {
      return NextResponse.json(data[0]);
    }
    return NextResponse.json({ 
      heading: 'Travel that Touches the Soul',
      subheading: 'Curated Travel. Authentic Moments. Lasting Impact.',
      description: 'At Trip For Soul, we craft meaningful land journeys that are soulful, sustainable, and deeply personal.',
      premium_heading: 'Premium Travel for the Curious Soul',
      premium_description: 'At Trip For Soul, we design immersive, high-end journeys for travelers who want more than just a trip. Every detail is carefully curated — from first-class comfort to authentic experiences — so you can explore the world with ease, depth, and style. Discover the difference of traveling well — with every moment thoughtfully tailored to you.',
      premium_button_text: 'Explore Our Destinations',
      premium_button_link: '/destination',
      experience_heading: 'Curated Travel Moments',
      experience_description_title: "Luxury isn't just about where you stay — it's how you experience the world.",
      experience_description: "At Trip For Soul, we don't just book trips — we craft unforgettable journeys. From hot-air balloon rides over ancient landscapes to boutique stays along dramatic coastlines, we create travel experiences as bold, beautiful, and unique as you are. We're a boutique agency with a taste for the extraordinary — blending luxury, adventure, and personalized service to create moments that go far beyond the itinerary.",
      experience_subheading: 'What We Do Best',
      experience_list: JSON.stringify(["Tailor-made escapes", "Private tours and once-in-a-lifetime adventures", "Exotic honeymoons, wellness retreats & family getaways", "Luxury stays and VIP concierge services", "On-call travel support, wherever you are in the world"]),
      experience_image: '',
      why_heading: 'Service Beyond Expectations',
      why_description: 'Because you deserve more than just a vacation — you deserve a journey crafted entirely around you. From the moment your adventure begins, every detail is thoughtfully managed. Our expert Travel Directors and professional Drivers ensure a smooth, inspiring journey — adding insight, comfort, and a personal touch every step of the way. Along your path, you\'ll connect with local Experts and Specialists who bring each destination to life through hidden gems, rich stories, and cultural moments that go far beyond the guidebook. Enjoy seamless service. This isn\'t just a tour. It\'s tailored travel at its finest — elevated, effortless, and unforgettable.',
      why_image: '',
      promise_heading: 'Our Commitment to You',
      promise_subheading: 'At Trip For Soul, our promise is simple:',
      promise_description: 'To deliver extraordinary journeys, flawlessly executed. We are committed to creating personalized travel experiences that go beyond expectations — where every destination is handpicked, every moment is designed with care, and every journey is meaningful. From your first inquiry to your final farewell, we ensure:',
      promise_list: JSON.stringify(["Tailor-made escapes", "Private tours and once-in-a-lifetime adventures", "Exotic honeymoons, wellness retreats & family getaways", "Luxury stays and VIP concierge services", "On-call travel support, wherever you are in the world"]),
      promise_image: '',
      difference_heading: 'What Makes Us Different',
      difference_description: "We don't just plan trips — we design journeys with intention, care, and imagination. At Trip For Soul, we believe luxury lies in the details, and that travel becomes extraordinary when expert planning meets personal passion.",
      difference_subheading: 'What Sets Us Apart',
      difference_list: JSON.stringify([
        "Tailor-Made Itineraries : No one-size-fits-all tours — just journeys created around your pace, style, and preferences.",
        "Insider Access & Authentic Encounters : Go beyond the guidebook with exclusive experiences, local connections, and behind-the-scenes moments.",
        "Premium Service, Start to Finish : From VIP transfers to attentive concierge support, we take care of everything — so you don't have to.",
        "Experts Who Travel Like You Do : Our planners are passionate explorers who understand what discerning travelers expect — because they expect it too."
      ]),
      difference_image: '',
      cta_heading: 'Start Planning Your Journey',
      cta_description: 'Let us bring your next great story to life.',
      cta_button_text: 'Enquire Now',
      cta_button_link: '/enquire-now'
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update about us
export async function PUT(request) {
  try {
    const body = await request.json();
    const data = await db.query('SELECT * FROM about_us LIMIT 1');
    if (data.length > 0) {
      await db.update('about_us', data[0].id, body);
    }
    return NextResponse.json({ success: true, message: 'About Us updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
