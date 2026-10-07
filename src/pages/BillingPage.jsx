import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { formatCurrency } from '../utils/currency';
import { isWeightBasedUnit } from '../constants/units';
import { UrduReceipt } from '../components/common/UrduReceipt';
import { BarcodeScannerModal } from '../features/barcode/BarcodeScannerModal';
import { playScanSuccessBeep, playScanErrorBeep } from '../utils/soundEffects';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { generateOrderId } from '../utils/idGenerator';

export const BillingPage = () => {
  const navigate = useNavigate();
  const { products, isLoading, createOrder, saveProduct } = useStore();

  // State for current bill
  const [billItems, setBillItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cashTendered, setCashTendered] = useState('');
  const [overallDiscount, setOverallDiscount] = useState('');
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);
  const [printedOrder, setPrintedOrder] = useState(null);
  const [billNotice, setBillNotice] = useState(null);

  // Quick register modal for newly scanned physical barcodes
  const [unregisteredBarcode, setUnregisteredBarcode] = useState(null);
  const [quickName, setQuickName] = useState('');
  const [quickPrice, setQuickPrice] = useState('');
  const [quickUnit, setQuickUnit] = useState('pcs');

  const searchInputRef = useRef(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter matching products for live search dropdown in billing
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          (p.nameUrdu && p.nameUrdu.includes(q)) ||
          (p.barcode && p.barcode.toLowerCase() === q) ||
          (p.sku && p.sku.toLowerCase() === q)
        );
      })
      .slice(0, 8);
  }, [products, searchQuery]);

  // Add product to bill helper
  const handleAddProductToBill = useCallback((product) => {
    if (!product) return;
    playScanSuccessBeep();

    setBillItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === product.id);
      if (existingIdx > -1) {
        // Increment quantity
        const updated = [...prev];
        const curr = updated[existingIdx];
        const step = isWeightBasedUnit(curr.unit) ? 0.5 : 1;
        const newQty = Math.round((curr.quantity + step) * 1000) / 1000;
        const lineTotal = Math.max(0, Math.round(newQty * curr.price - (curr.discount || 0)));

        updated[existingIdx] = {
          ...curr,
          quantity: newQty,
          total: lineTotal,
        };
        return updated;
      } else {
        // Add new line
        const initialQty = 1;
        const initialDiscount = 0;
        const initialTotal = Math.round(initialQty * Number(product.price));

        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            nameUrdu: product.nameUrdu || product.name,
            sku: product.sku,
            barcode: product.barcode,
            unit: product.unit || 'pcs',
            price: Number(product.price) || 0,
            quantity: initialQty,
            discount: initialDiscount,
            total: initialTotal,
            stock: Number(product.stock) || 0,
          },
        ];
      }
    });

    setBillNotice(`"${product.nameUrdu || product.name}" بل میں شامل ہو گیا!`);
    setTimeout(() => setBillNotice(null), 3000);
    setSearchQuery('');
    searchInputRef.current?.focus();
  }, []);

  // Global hardware scanner listener: automatically adds scanned item to bill
  useBarcodeScanner({
    products,
    onScan: (product) => {
      handleAddProductToBill(product);
    },
    onUnknown: (code) => {
      playScanSuccessBeep(); // Beep acknowledging the physical scan!
      setUnregisteredBarcode(code);
      setQuickName('');
      setQuickPrice('');
    },
    enabled: true,
  });

  // Listen to open-pos-scanner event and Ctrl+B shortcut from top layout
  useEffect(() => {
    const handleOpenScannerEvent = () => {
      setIsCameraScannerOpen(true);
    };
    const handleShortcut = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCameraScannerOpen((prev) => !prev);
      }
    };
    window.addEventListener('open-pos-scanner', handleOpenScannerEvent);
    window.addEventListener('keydown', handleShortcut);
    return () => {
      window.removeEventListener('open-pos-scanner', handleOpenScannerEvent);
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  // Handle manual search submit or Enter key
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    // 1. Try exact barcode/SKU match first
    const exactMatch = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === query.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === query.toLowerCase())
    );

    if (exactMatch) {
      handleAddProductToBill(exactMatch);
      return;
    }

    // 2. Pick first matching result if available
    if (searchResults.length > 0) {
      handleAddProductToBill(searchResults[0]);
    } else {
      // If it looks like a barcode number (digits), prompt quick register!
      if (/^\d{4,}$/.test(query)) {
        playScanSuccessBeep();
        setUnregisteredBarcode(query);
        setQuickName('');
        setQuickPrice('');
      } else {
        playScanErrorBeep();
      }
    }
  };

  // Quick save unregistered scanned product
  const handleSaveUnregistered = async (e) => {
    e.preventDefault();
    if (!unregisteredBarcode || !quickName.trim() || !quickPrice) return;

    const newProd = {
      id: `prod_${Date.now()}`,
      name: quickName.trim(),
      nameUrdu: quickName.trim(),
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: unregisteredBarcode,
      category: 'General Items',
      unit: quickUnit,
      price: Number(quickPrice),
      stock: 100,
      threshold: 10,
      image: '',
      description: `Scanned item (${unregisteredBarcode})`,
    };

    await saveProduct(newProd);
    handleAddProductToBill(newProd);
    setUnregisteredBarcode(null);
    setQuickName('');
    setQuickPrice('');
  };

  // Update item quantity in bill
  const handleUpdateQuantity = (itemId, newQty) => {
    const qty = Math.max(0.01, Math.round(Number(newQty) * 1000) / 1000);
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const discount = item.discount || 0;
          const total = Math.max(0, Math.round(qty * item.price - discount));
          return { ...item, quantity: qty, total };
        }
        return item;
      })
    );
  };

  // Update item discount in bill
  const handleUpdateItemDiscount = (itemId, newDiscount) => {
    const discount = Math.max(0, Number(newDiscount) || 0);
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const total = Math.max(0, Math.round(item.quantity * item.price - discount));
          return { ...item, discount, total };
        }
        return item;
      })
    );
  };

  // Remove single line item from bill
  const handleRemoveItem = (itemId) => {
    setBillItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Reset entire bill
  const handleResetBill = () => {
    setBillItems([]);
    setSearchQuery('');
    setCashTendered('');
    setOverallDiscount('');
    setBillNotice(null);
    searchInputRef.current?.focus();
  };

  // Calculations
  const subtotal = useMemo(() => {
    return billItems.reduce((sum, item) => sum + Math.round(item.quantity * item.price), 0);
  }, [billItems]);

  const itemsTotalDiscount = useMemo(() => {
    return billItems.reduce((sum, item) => sum + (Number(item.discount) || 0), 0);
  }, [billItems]);

  const billExtraDiscount = Number(overallDiscount) || 0;
  const totalDiscount = itemsTotalDiscount + billExtraDiscount;
  const netPayable = Math.max(0, subtotal - totalDiscount);

  const tenderedAmount = Number(cashTendered) || 0;
  const changeDue = tenderedAmount >= netPayable ? tenderedAmount - netPayable : 0;

  // Print Slip
  const handlePrintSlip = async () => {
    if (billItems.length === 0) {
      alert('براہ کرم پرنٹ کرنے سے پہلے بل میں آئٹمز شامل کریں۔');
      return;
    }

    try {
      const orderData = {
        id: generateOrderId(),
        createdAt: new Date().toISOString(),
        customer: { name: 'Walk-in Customer (کاؤنٹر گاہک)', type: 'Walk-in' },
        items: billItems.map((item) => ({
          productId: item.id,
          id: item.id,
          name: item.name,
          nameUrdu: item.nameUrdu,
          sku: item.sku,
          unit: item.unit,
          price: item.price,
          quantity: item.quantity,
          discount: item.discount,
          subtotal: item.total,
        })),
        pricing: {
          subtotal,
          discount: totalDiscount,
          tax: 0,
          grandTotal: netPayable,
          total: netPayable,
        },
        payment: {
          method: 'Cash',
          status: 'Paid',
          tendered: tenderedAmount > 0 ? tenderedAmount : netPayable,
          change: changeDue,
        },
      };

      // Save order to store
      await createOrder(orderData);

      // Set print state and invoke window.print
      setPrintedOrder(orderData);
      setBillNotice(`بل نمبر ${orderData.id} محفوظ اور پرنٹ ہو گیا۔`);

      // Trigger browser print
      setTimeout(() => {
        window.print();
      }, 100);
    } catch (err) {
      console.error('Error during bill print:', err);
      alert('بل محفوظ کرتے وقت خرابی پیش آگئی۔');
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner Notice */}
      {billNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-sm font-extrabold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">✓</span>
            <span>{billNotice}</span>
          </div>
          <button
            onClick={() => setBillNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-black text-sm px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MAIN BILLING MODULE CARD */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Module Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shadow-xs">
              <Icon name="billing" size={24} />
            </span>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                POS Billing Counter (بل کاؤنٹر)
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                بار کوڈ اسکین کریں یا پروڈکٹ تلاش کر کے فوری کسٹمر سلپ بنائیں
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 font-extrabold text-xs sm:text-sm text-slate-700">
              کل آئٹمز: {billItems.length}
            </span>
            <button
              type="button"
              onClick={() => navigate('/sales')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
              title="پچھلے تمام بل اور فروخت کی تفصیلات دیکھیں"
            >
              <Icon name="history" size={16} />
              <span>سیلز ہسٹری</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span>پروڈکٹس مینیجر</span>
              <span className="text-slate-400">→</span>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* SEARCH & BARCODE INPUT BAR */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Icon name="search" size={22} />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 پروڈکٹ کا نام، اردو نام یا بار کوڈ لکھیں (یا اسکینر گن سے اسکین کریں)..."
                  className="w-full pl-12 pr-28 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none text-base sm:text-lg font-bold text-slate-900 placeholder:text-slate-400 bg-slate-50/60 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-16 pr-2 flex items-center text-slate-400 hover:text-slate-700 text-xs sm:text-sm font-black"
                  >
                    صاف
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute inset-y-1.5 right-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-black transition-colors cursor-pointer shadow-xs"
                >
                  شامل کریں
                </button>
              </div>

              {/* Camera Scanner Button */}
              <button
                type="button"
                onClick={() => setIsCameraScannerOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 sm:px-5 py-3.5 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 cursor-pointer shadow-md active:scale-95"
                title="بار کوڈ کیمرہ اسکینر کھولیں"
              >
                <Icon name="barcode" size={20} />
                <span className="hidden sm:inline">کیمرہ اسکینر</span>
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute z-30 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleAddProductToBill(product)}
                    className="w-full text-left p-3.5 hover:bg-indigo-50/80 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 group-hover:bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                        <Icon name="barcode" size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-900 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-0.5">
                          {product.nameUrdu && (
                            <span className="font-urdu font-bold text-slate-700">
                              {product.nameUrdu}
                            </span>
                          )}
                          <span>•</span>
                          <span className="font-mono text-slate-400">
                            {product.barcode || product.sku}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm sm:text-base font-black text-slate-950">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold">
                        اسٹاک: {product.stock} {product.unit}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CURRENT BILL ITEMS TABLE */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-800 font-black text-xs sm:text-sm border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3.5 px-3 w-12 text-center">#</th>
                    <th className="py-3.5 px-4">سامان / تفصیلات (Product)</th>
                    <th className="py-3.5 px-3">بار کوڈ / یونٹ</th>
                    <th className="py-3.5 px-3 text-right">ریٹ (Price)</th>
                    <th className="py-3.5 px-3 text-center w-40">تعداد / وزن (Qty)</th>
                    <th className="py-3.5 px-3 text-center w-32">رعایت (Disc. Rs)</th>
                    <th className="py-3.5 px-3 text-right">کل رقم (Total)</th>
                    <th className="py-3.5 px-3 text-center w-14">مٹائیں</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {billItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                            <Icon name="cart" size={32} />
                          </div>
                          <p className="text-base sm:text-lg font-black text-slate-700">
                            بل ابھی خالی ہے
                          </p>
                          <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                            بار کوڈ اسکینر سے پروڈکٹ اسکین کریں یا اوپر سرچ بار میں نام یا بار کوڈ لکھیں۔
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    billItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors">
                        {/* Index */}
                        <td className="py-3.5 px-3 text-center text-slate-400 font-mono font-black text-sm">
                          {index + 1}
                        </td>

                        {/* Name & Urdu */}
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-sm sm:text-base">
                            {item.name}
                          </div>
                          {item.nameUrdu && (
                            <div className="text-xs sm:text-sm font-urdu font-bold text-slate-600 mt-0.5">
                              {item.nameUrdu}
                            </div>
                          )}
                        </td>

                        {/* Barcode & Unit */}
                        <td className="py-3.5 px-3 font-mono">
                          <div className="text-slate-800 font-extrabold text-xs sm:text-sm">
                            {item.unit}
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {item.barcode || item.sku}
                          </div>
                        </td>

                        {/* Rate */}
                        <td className="py-3.5 px-3 text-right font-black text-slate-900 text-sm sm:text-base">
                          {formatCurrency(item.price)}
                        </td>

                        {/* Quantity with +/- and large input */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center border-2 border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => {
                                const step = isWeightBasedUnit(item.unit) ? 0.5 : 1;
                                handleUpdateQuantity(item.id, Math.max(0.1, item.quantity - step));
                              }}
                              className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 font-black text-base transition-colors cursor-pointer"
                              title="Decrease"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step={isWeightBasedUnit(item.unit) ? '0.1' : '1'}
                              min="0.01"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.id, e.target.value)}
                              className="w-16 text-center py-1.5 text-sm sm:text-base font-black text-slate-950 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const step = isWeightBasedUnit(item.unit) ? 0.5 : 1;
                                handleUpdateQuantity(item.id, item.quantity + step);
                              }}
                              className="px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 font-black text-base transition-colors cursor-pointer"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center">
                            <span className="text-slate-400 text-xs font-bold mr-1">Rs.</span>
                            <input
                              type="number"
                              min="0"
                              value={item.discount || ''}
                              placeholder="0"
                              onChange={(e) => handleUpdateItemDiscount(item.id, e.target.value)}
                              className="w-20 py-1.5 px-2 text-center text-sm font-black text-slate-900 border-2 border-slate-300 rounded-xl outline-none focus:border-indigo-600"
                            />
                          </div>
                        </td>

                        {/* Line Total */}
                        <td className="py-3.5 px-3 text-right font-black text-indigo-700 text-base sm:text-lg">
                          {formatCurrency(item.total)}
                        </td>

                        {/* Remove */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="بل سے نکالیں"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOTALS & ACTIONS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
            {/* Left: Extra Bill Discount & Cash Tendered */}
            <div className="lg:col-span-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/90 space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
                ادائیگی کی تفصیلات (Cash & Payment)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Overall Discount */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">
                    اضافی بل رعایت (Extra Bill Discount Rs.)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={overallDiscount}
                      onChange={(e) => setOverallDiscount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2.5 bg-white rounded-xl border-2 border-slate-300 text-sm font-black text-slate-900 outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                {/* Cash Tendered */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 block mb-1">
                    وصول شدہ کیش (Cash Received)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold text-sm">
                      Rs.
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder={netPayable.toString()}
                      className="w-full pl-10 pr-3 py-2.5 bg-white rounded-xl border-2 border-slate-300 text-sm font-black text-slate-900 outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div>
                <span className="text-xs text-slate-500 font-bold block mb-1.5">
                  فوری رقم بٹن (Quick Cash):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCashTendered(netPayable.toString())}
                    className="px-3 py-1.5 text-xs font-black bg-white hover:bg-slate-200 border-2 border-slate-300 rounded-xl text-slate-800 cursor-pointer"
                  >
                    برابر (Exact: Rs. {netPayable})
                  </button>
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(amt.toString())}
                      className="px-3 py-1.5 text-xs font-black bg-white hover:bg-slate-200 border-2 border-slate-300 rounded-xl text-slate-800 cursor-pointer"
                    >
                      Rs. {amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Net Payable Summary & Main Action Buttons */}
            <div className="lg:col-span-6 bg-slate-950 text-white p-6 rounded-2xl shadow-xl space-y-4">
              <div className="space-y-2.5 border-b border-slate-800 pb-4 text-sm sm:text-base">
                <div className="flex justify-between text-slate-400">
                  <span>کل رقم (Subtotal):</span>
                  <span className="font-mono font-black text-white text-base">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>کل رعایت (Total Discount):</span>
                    <span className="font-mono text-base">-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>وصول شدہ رقم (Received):</span>
                  <span className="font-mono text-white text-base">
                    {tenderedAmount > 0 ? formatCurrency(tenderedAmount) : '—'}
                  </span>
                </div>
                {tenderedAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-black">
                    <span>بقایا رقم (Change Due):</span>
                    <span className="font-mono text-lg">{formatCurrency(changeDue)}</span>
                  </div>
                )}
              </div>

              {/* Big Net Payable Amount */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-slate-400 block uppercase">
                    صافی قابل ادائیگی
                  </span>
                  <span className="text-base sm:text-lg font-bold font-urdu text-indigo-300">
                    Net Payable
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-400 font-mono tracking-tight">
                  {formatCurrency(netPayable)}
                </div>
              </div>

              {/* PRIMARY ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-3.5 pt-2">
                {/* RESET BUTTON */}
                <button
                  type="button"
                  onClick={handleResetBill}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-800 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
                >
                  <Icon name="delete" size={18} />
                  <span>ری سیٹ (New Bill)</span>
                </button>

                {/* PRINT SLIP BUTTON */}
                <button
                  type="button"
                  onClick={handlePrintSlip}
                  className="w-full py-3.5 px-4 rounded-xl font-black text-sm sm:text-base bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-lg shadow-emerald-950/50"
                >
                  <Icon name="printer" size={20} />
                  <span>پرنٹ سلپ (Print Slip)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK MODAL: Newly Scanned Barcode Registration */}
      {unregisteredBarcode && (
        <Modal
          isOpen={Boolean(unregisteredBarcode)}
          onClose={() => setUnregisteredBarcode(null)}
          title="نیا پروڈکٹ اسکین ہوا (New Barcode Scanned)"
          subtitle="یہ بار کوڈ سسٹم میں نہیں ہے۔ نام اور قیمت درج کر کے فوری بل میں شامل کریں۔"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveUnregistered} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-indigo-700 font-bold block">اسکین شدہ بار کوڈ:</span>
                <span className="text-base font-mono font-black text-indigo-950">{unregisteredBarcode}</span>
              </div>
              <Badge variant="info" size="sm">NEW ITEM</Badge>
            </div>

            <div>
              <label className="text-xs sm:text-sm font-black text-slate-800 block mb-1">
                پروڈکٹ کا نام (Product Name):
              </label>
              <input
                type="text"
                placeholder="مثلاً: Olpers Milk یا لائف بوائے صابن"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="w-full text-sm font-bold bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600 text-slate-900"
                required
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs sm:text-sm font-black text-slate-800 block mb-1">
                  قیمت (Price Rs.):
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="مثلاً: 250"
                  value={quickPrice}
                  onChange={(e) => setQuickPrice(e.target.value)}
                  className="w-full text-sm font-bold bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-black text-slate-800 block mb-1">
                  یونٹ (Unit):
                </label>
                <select
                  value={quickUnit}
                  onChange={(e) => setQuickUnit(e.target.value)}
                  className="w-full text-sm font-bold bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600 text-slate-900"
                >
                  <option value="pcs">Pcs (عدد)</option>
                  <option value="pack">Pack (پیکٹ)</option>
                  <option value="kg">Kg (کلوگرام)</option>
                  <option value="liter">Liter (لیٹر)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUnregisteredBarcode(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                منسوخ (Cancel)
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm transition-colors shadow-md cursor-pointer"
              >
                محفوظ اور بل میں شامل کریں ✓
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Barcode Camera Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        products={products}
        onProductScanned={(product) => {
          handleAddProductToBill(product);
        }}
        onQuickSaveProduct={async (newProdData) => {
          await saveProduct(newProdData);
          handleAddProductToBill(newProdData);
        }}
      />

      {/* Thermal Urdu Receipt for printing (80mm Nastaliq) */}
      {printedOrder && (
        <div className="hidden print:block">
          <UrduReceipt order={printedOrder} />
        </div>
      )}
    </div>
  );
};
