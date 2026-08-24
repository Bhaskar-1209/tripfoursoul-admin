// Currency helpers for TripForSoul admin — dropdown (single USD/INR/EUR) selection mapping.

export const CURRENCIES = ["USD", "INR", "EUR"];

export const CURRENCY_SYMBOLS = { USD: "$", INR: "₹", EUR: "€" };

// Strip currency symbols / separators from a stored string (e.g. "$1,299" -> "1299")
const stripSymbols = (value = "") => String(value).replace(/[^0-9]/g, "");

// Return {currency, value} from a package/destination record.
// It picks the currency field that is set; otherwise falls back to the legacy 'price' string.
export const priceFromRecord = (rec = {}) => {
  if (rec.price_inr && String(rec.price_inr).trim()) return { currency: "INR", value: String(rec.price_inr).trim() };
  if (rec.price_eur && String(rec.price_eur).trim()) return { currency: "EUR", value: String(rec.price_eur).trim() };
  if (rec.price_usd && String(rec.price_usd).trim()) return { currency: "USD", value: String(rec.price_usd).trim() };
  const legacy = String(rec.price || "").trim();
  if (legacy) {
    if (legacy.startsWith("₹")) return { currency: "INR", value: stripSymbols(legacy) };
    if (legacy.startsWith("€")) return { currency: "EUR", value: stripSymbols(legacy) };
    return { currency: "USD", value: stripSymbols(legacy) };
  }
  return { currency: "USD", value: "" };
};

export const formatPriceValue = (currency, value) => {
  const clean = String(value || "").trim();
  if (!clean) return "";
  return `${CURRENCY_SYMBOLS[currency] || ""}${clean}`;
};

// Build the payload fields for a given currency + value (the others are cleared).
export const buildPricePayload = (currency, value) => {
  const clean = String(value || "").trim();
  return {
    price: formatPriceValue(currency, clean),
    price_usd: currency === "USD" ? clean : "",
    price_inr: currency === "INR" ? clean : "",
    price_eur: currency === "EUR" ? clean : "",
  };
};

// Pretty display for admin lists and frontend cards.
export const pricingDisplay = (rec = {}) => {
  const { currency, value } = priceFromRecord(rec);
  return formatPriceValue(currency, value);
};
