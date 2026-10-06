/**
 * Standard Units of Measurement (UoM) for Super Store POS
 */

export const UNIT_TYPES = {
  WEIGHT: 'weight',
  VOLUME: 'volume',
  COUNT: 'count',
};

export const STANDARD_UNITS = {
  kg: {
    key: 'kg',
    label: 'Kilogram (kg)',
    short: 'kg',
    urdu: 'کلو',
    type: UNIT_TYPES.WEIGHT,
    defaultStep: 0.25,
    min: 0.05,
    presets: [
      { label: '100 g', value: 0.1, urdu: '100 گرام' },
      { label: '250 g (پاؤ)', value: 0.25, urdu: 'پاؤ (250g)' },
      { label: '500 g (آدھا کلو)', value: 0.5, urdu: 'آدھا کلو (500g)' },
      { label: '1 kg', value: 1.0, urdu: '1 کلو' },
      { label: '1.5 kg', value: 1.5, urdu: 'ڈیڑھ کلو' },
      { label: '2 kg', value: 2.0, urdu: '2 کلو' },
      { label: '5 kg', value: 5.0, urdu: '5 کلو' },
    ],
  },
  g: {
    key: 'g',
    label: 'Gram (g)',
    short: 'g',
    urdu: 'گرام',
    type: UNIT_TYPES.WEIGHT,
    defaultStep: 50,
    min: 10,
    presets: [
      { label: '50 g', value: 50, urdu: '50 گرام' },
      { label: '100 g', value: 100, urdu: '100 گرام' },
      { label: '250 g', value: 250, urdu: '250 گرام' },
      { label: '500 g', value: 500, urdu: '500 گرام' },
    ],
  },
  liter: {
    key: 'liter',
    label: 'Liter (L)',
    short: 'L',
    urdu: 'لیٹر',
    type: UNIT_TYPES.VOLUME,
    defaultStep: 0.25,
    min: 0.1,
    presets: [
      { label: '250 ml', value: 0.25, urdu: '250 ملی لیٹر' },
      { label: '500 ml', value: 0.5, urdu: 'آدھا لیٹر' },
      { label: '1 L', value: 1.0, urdu: '1 لیٹر' },
      { label: '2 L', value: 2.0, urdu: '2 لیٹر' },
      { label: '5 L', value: 5.0, urdu: '5 لیٹر' },
    ],
  },
  dozen: {
    key: 'dozen',
    label: 'Dozen (درجن)',
    short: 'dz',
    urdu: 'درجن',
    type: UNIT_TYPES.COUNT,
    defaultStep: 0.5,
    min: 0.5,
    presets: [
      { label: '0.5 Dozen (6 pcs)', value: 0.5, urdu: 'آدھی درجن (6)' },
      { label: '1 Dozen (12 pcs)', value: 1.0, urdu: '1 درجن (12)' },
      { label: '2 Dozen (24 pcs)', value: 2.0, urdu: '2 درجن (24)' },
      { label: '3 Dozen (36 pcs)', value: 3.0, urdu: '3 درجن (36)' },
    ],
  },
  pcs: {
    key: 'pcs',
    label: 'Piece (عدد/دانہ)',
    short: 'pcs',
    urdu: 'عدد',
    type: UNIT_TYPES.COUNT,
    defaultStep: 1,
    min: 1,
    presets: [
      { label: '1 pc', value: 1, urdu: '1 دانہ' },
      { label: '2 pcs', value: 2, urdu: '2 دانے' },
      { label: '3 pcs', value: 3, urdu: '3 دانے' },
      { label: '5 pcs', value: 5, urdu: '5 دانے' },
      { label: '10 pcs', value: 10, urdu: '10 دانے' },
    ],
  },
  pack: {
    key: 'pack',
    label: 'Pack (پیکٹ)',
    short: 'pack',
    urdu: 'پیکٹ',
    type: UNIT_TYPES.COUNT,
    defaultStep: 1,
    min: 1,
    presets: [
      { label: '1 pack', value: 1, urdu: '1 پیک' },
      { label: '2 packs', value: 2, urdu: '2 پیک' },
      { label: '3 packs', value: 3, urdu: '3 پیک' },
      { label: '5 packs', value: 5, urdu: '5 پیک' },
      { label: '10 packs', value: 10, urdu: '10 پیک' },
    ],
  },
  box: {
    key: 'box',
    label: 'Box (ڈبہ)',
    short: 'box',
    urdu: 'ڈبہ',
    type: UNIT_TYPES.COUNT,
    defaultStep: 1,
    min: 1,
    presets: [
      { label: '1 box', value: 1, urdu: '1 ڈبہ' },
      { label: '2 boxes', value: 2, urdu: '2 ڈبے' },
      { label: '5 boxes', value: 5, urdu: '5 ڈبے' },
    ],
  },
};

export const UNIT_OPTIONS = Object.values(STANDARD_UNITS);

/**
 * Check if unit is sold by weight or volume (continuous fractional measurement)
 */
export const isWeightBasedUnit = (unitKey) => {
  const unit = STANDARD_UNITS[unitKey] || STANDARD_UNITS.pcs;
  return unit.type === UNIT_TYPES.WEIGHT || unit.type === UNIT_TYPES.VOLUME;
};

/**
 * Format quantity display with unit
 */
export const formatUnitQuantity = (quantity, unitKey = 'pcs', useUrdu = false) => {
  const qty = Number(quantity) || 0;
  const unit = STANDARD_UNITS[unitKey] || STANDARD_UNITS.pcs;

  if (unitKey === 'kg') {
    // If less than 1 kg and has decimals, e.g. 0.25 kg -> 250 g or 0.25 kg
    if (qty > 0 && qty < 1) {
      const grams = Math.round(qty * 1000);
      return useUrdu ? `${grams} گرام` : `${grams} g`;
    }
    const cleanQty = Number(qty.toFixed(3)).toString();
    return useUrdu ? `${cleanQty} کلو` : `${cleanQty} kg`;
  }

  if (unitKey === 'liter') {
    if (qty > 0 && qty < 1) {
      const ml = Math.round(qty * 1000);
      return useUrdu ? `${ml} ملی لیٹر` : `${ml} ml`;
    }
    const cleanQty = Number(qty.toFixed(2)).toString();
    return useUrdu ? `${cleanQty} لیٹر` : `${cleanQty} L`;
  }

  if (unitKey === 'dozen') {
    const cleanQty = Number(qty.toFixed(1)).toString();
    return useUrdu ? `${cleanQty} درجن` : `${cleanQty} dz`;
  }

  const cleanQty = Number(qty.toFixed(2)).toString();
  return useUrdu ? `${cleanQty} ${unit.urdu}` : `${cleanQty} ${unit.short}`;
};

/**
 * Get unit label for price per unit display (e.g. "/ kg")
 */
export const getUnitRateLabel = (unitKey = 'pcs', useUrdu = false) => {
  const unit = STANDARD_UNITS[unitKey] || STANDARD_UNITS.pcs;
  if (useUrdu) {
    return `فی ${unit.urdu}`;
  }
  return `/${unit.short}`;
};
