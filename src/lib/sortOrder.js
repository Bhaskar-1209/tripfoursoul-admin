import db from '@/lib/db';

export async function getNextSortOrder(table, activeOnly = true) {
  const condition = activeOnly ? ' WHERE is_active = true AND sort_order > 0' : ' WHERE sort_order > 0';
  const rows = await db.query(`SELECT sort_order FROM ${table}${condition}`);
  const used = new Set(rows.map((row) => Number(row.sort_order)).filter((value) => Number.isInteger(value) && value > 0));
  let next = 1;
  while (used.has(next)) next += 1;
  return next;
}
