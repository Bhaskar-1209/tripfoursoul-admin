import { NextResponse } from 'next/server';
import db from '@/lib/db';

const ensureLeadsTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) DEFAULT '',
    last_name VARCHAR(255) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    phone VARCHAR(100) DEFAULT '',
    destination VARCHAR(255) DEFAULT '',
    package_name VARCHAR(255) DEFAULT '',
    date VARCHAR(100) DEFAULT '',
    travel_start_date DATE,
    travel_end_date DATE,
    travel_style VARCHAR(255) DEFAULT '',
    trip_budget VARCHAR(255) DEFAULT '',
    receive_offers BOOLEAN DEFAULT false,
    travellers VARCHAR(100) DEFAULT '',
    message TEXT DEFAULT '',
    additional_information TEXT DEFAULT '',
    coupon_code VARCHAR(100) DEFAULT '',
    source VARCHAR(100) DEFAULT 'website',
    status VARCHAR(30) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `);

  // Existing deployments may already have the original leads table.
  await db.query(`
    ALTER TABLE leads
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS travel_start_date DATE,
      ADD COLUMN IF NOT EXISTS travel_end_date DATE,
      ADD COLUMN IF NOT EXISTS travel_style VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS trip_budget VARCHAR(255) DEFAULT '',
      ADD COLUMN IF NOT EXISTS receive_offers BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS additional_information TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100) DEFAULT ''
  `);
};

const value = (item) => String(item ?? '').trim();
const booleanValue = (item) => item === true || item === 1 || item === '1' || ['true', 'yes', 'on'].includes(String(item).toLowerCase());
const messageLeadLabels = ['Travel start date', 'Travel end date', 'Travel style', 'Trip budget', 'Receive offers'];
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const messageLeadLabelsPattern = messageLeadLabels.map(escapeRegex).join('|');

const messageField = (message, label) => {
  const pattern = new RegExp(`${escapeRegex(label)}\\s*:\\s*([\\s\\S]*?)(?=\\s*(?:${messageLeadLabelsPattern})\\s*:|$)`, 'i');
  return value(message.match(pattern)?.[1]);
};

const cleanMessage = (message) => messageLeadLabels.reduce(
  (cleaned, label) => cleaned.replace(
    new RegExp(`${escapeRegex(label)}\\s*:\\s*[\\s\\S]*?(?=\\s*(?:${messageLeadLabelsPattern})\\s*:|$)`, 'gi'),
    ''
  ),
  value(message)
).replace(/\s{2,}/g, ' ').trim();

const parsedMessageDetails = (message) => ({
  travel_start_date: messageField(message, 'Travel start date'),
  travel_end_date: messageField(message, 'Travel end date'),
  travel_style: messageField(message, 'Travel style'),
  trip_budget: messageField(message, 'Trip budget'),
  receive_offers: messageField(message, 'Receive offers'),
});

const validDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
const hydrateMessageDetails = (lead) => {
  const parsed = parsedMessageDetails(lead.message);
  return {
    ...lead,
    travel_start_date: lead.travel_start_date || validDate(parsed.travel_start_date),
    travel_end_date: lead.travel_end_date || validDate(parsed.travel_end_date),
    travel_style: lead.travel_style || parsed.travel_style,
    trip_budget: lead.trip_budget || parsed.trip_budget,
    receive_offers: lead.receive_offers ?? booleanValue(parsed.receive_offers),
    message: cleanMessage(lead.message),
  };
};
const hasValidLeadsApiKey = (request) => {
  const expectedKey = process.env.LEADS_API_KEY;
  return Boolean(expectedKey) && request.headers.get('x-leads-api-key') === expectedKey;
};

export async function GET() {
  try {
    await ensureLeadsTable();
    const leads = await db.query('SELECT * FROM leads ORDER BY created_at DESC, id DESC');
    return NextResponse.json({ leads: leads.map(hydrateMessageDetails) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // The middleware applies the same check before this route runs. Keeping it
    // here protects the endpoint if it is invoked outside that proxy layer.
    if (!hasValidLeadsApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await ensureLeadsTable();
    const body = await request.json();
    const rawMessage = value(body.message);
    const parsed = parsedMessageDetails(rawMessage);
    const firstName = value(body.first_name);
    const lastName = value(body.last_name);
    const lead = {
      // Keep the legacy full-name field for existing admin views and integrations.
      name: value(body.name) || [firstName, lastName].filter(Boolean).join(' '),
      first_name: firstName,
      last_name: lastName,
      email: value(body.email),
      phone: value(body.phone),
      destination: value(body.destination),
      package_name: value(body.package_name || body.package),
      date: value(body.date),
      travel_start_date: validDate(value(body.travel_start_date)) || validDate(parsed.travel_start_date),
      travel_end_date: validDate(value(body.travel_end_date)) || validDate(parsed.travel_end_date),
      travel_style: value(body.travel_style) || parsed.travel_style,
      trip_budget: value(body.trip_budget) || parsed.trip_budget,
      receive_offers: Object.prototype.hasOwnProperty.call(body, 'receive_offers') ? booleanValue(body.receive_offers) : booleanValue(parsed.receive_offers),
      travellers: value(body.travellers),
      message: cleanMessage(rawMessage),
      additional_information: value(body.additional_information),
      coupon_code: value(body.coupon_code || body.coupon).toUpperCase(),
      source: value(body.source) || 'website',
      status: 'new',
    };
    if (!lead.name || !lead.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    const saved = await db.insert('leads', lead);
    return NextResponse.json({ success: true, lead: saved }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await ensureLeadsTable();
    const { id, status } = await request.json();
    if (!id || !['new', 'contacted', 'closed'].includes(status)) {
      return NextResponse.json({ error: 'Lead id and valid status are required' }, { status: 400 });
    }
    await db.query('UPDATE leads SET status = $1 WHERE id = $2', [status, Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await ensureLeadsTable();
    const id = Number(new URL(request.url).searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Lead id is required' }, { status: 400 });
    await db.delete('leads', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
