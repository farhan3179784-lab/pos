/**
 * Normalizes text for forgiving Urdu and English search.
 * Handles Arabic/Urdu keyboard differences (ی/ي, ک/ك, ہ/ه/ھ, ے),
 * strips Arabic diacritics / tashkeel, trims, and converts to lowercase.
 */
export const normalizeSearchText = (text) => {
  if (text === null || text === undefined) return '';
  return String(text)
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // strip diacritics (zer, zabar, pesh, etc.)
    .replace(/[يى]/g, 'ی') // unify Arabic Yeh to Urdu Chhoti Yeh
    .replace(/ك/g, 'ک') // unify Arabic Kaf to Urdu Kaf
    .replace(/ة/g, 'ہ') // unify Teh Marbuta to Urdu Gol Heh
    .replace(/[هھ]/g, 'ہ') // unify Heh variations
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if a product matches a given search query.
 * Matches against name, nameUrdu, sku, barcode, and category safely.
 */
export const matchesProduct = (product, searchQuery) => {
  if (!product || !searchQuery) return false;
  const q = normalizeSearchText(searchQuery);
  if (!q) return false;

  const name = normalizeSearchText(product.name);
  const nameUrdu = normalizeSearchText(product.nameUrdu);
  const sku = normalizeSearchText(product.sku);
  const barcode = normalizeSearchText(product.barcode);
  const category = normalizeSearchText(product.category);

  return (
    name.includes(q) ||
    nameUrdu.includes(q) ||
    sku.includes(q) ||
    barcode.includes(q) ||
    category.includes(q)
  );
};
