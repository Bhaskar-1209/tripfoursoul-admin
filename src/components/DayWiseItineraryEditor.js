"use client";

const emptyDay = (number) => ({ day: `Day ${number}`, title: "", description: "" });

const parseItinerary = (value) => {
  if (!value) return [emptyDay(1)];

  try {
    const parsed = JSON.parse(value);
    if (parsed?.version === 1 && Array.isArray(parsed.days)) {
      return parsed.days.length
        ? parsed.days.map((item, index) => ({
          day: item.day || `Day ${index + 1}`,
          title: item.title || "",
          description: item.description || "",
        }))
        : [emptyDay(1)];
    }
  } catch {
    // Packages saved before the structured itinerary editor used rich text.
  }

  return [{ ...emptyDay(1), description: value }];
};

const serializeItinerary = (days) => JSON.stringify({ version: 1, days });

export default function DayWiseItineraryEditor({ value, onChange }) {
  const days = parseItinerary(value);

  const updateDay = (index, field, fieldValue) => {
    const updated = days.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: fieldValue } : item);
    onChange(serializeItinerary(updated));
  };

  const addDay = () => {
    const updated = [...days, emptyDay(days.length + 1)];
    onChange(serializeItinerary(updated));
  };

  const removeDay = (index) => {
    const updated = days.filter((_, itemIndex) => itemIndex !== index);
    onChange(serializeItinerary(updated.length ? updated : [emptyDay(1)]));
  };

  return (
    <div className="space-y-3">
      {days.map((item, index) => (
        <div key={index} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-800">Itinerary day {index + 1}</p>
            <button type="button" onClick={() => removeDay(index)} className="text-xs font-medium text-red-600 hover:text-red-800">
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="admin-label">Day label</label>
              <input value={item.day} onChange={(event) => updateDay(index, "day", event.target.value)} className="admin-input" placeholder="e.g., Day 1" />
            </div>
            <div>
              <label className="admin-label">Title / location</label>
              <input value={item.title} onChange={(event) => updateDay(index, "title", event.target.value)} className="admin-input" placeholder="e.g., Arrival in Paris" />
            </div>
          </div>
          <div className="mt-3">
            <label className="admin-label">Details</label>
            <textarea value={item.description} onChange={(event) => updateDay(index, "description", event.target.value)} className="admin-input min-h-24 resize-y" placeholder="Describe activities, transfers, meals, and stay for this day." />
          </div>
        </div>
      ))}
      <button type="button" onClick={addDay} className="admin-btn-secondary text-sm">+ Add itinerary day</button>
    </div>
  );
}
