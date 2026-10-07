import { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { Icon } from '../components/ui/Icon';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../utils/currency';
import { formatDate, formatTime } from '../utils/date';
import { CustomerKhataReceipt } from '../components/khata/CustomerKhataReceipt';

export const KhataPage = () => {
  const { customers = [], saveCustomer, deleteCustomer, recordCustomerPayment, resetCustomers } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'due' | 'cleared'
  const [notice, setNotice] = useState(null);

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedLedgerCustomer, setSelectedLedgerCustomer] = useState(null);
  const [paymentCustomer, setPaymentCustomer] = useState(null);
  const [printedCustomer, setPrintedCustomer] = useState(null);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formInitialBalance, setFormInitialBalance] = useState('');

  // Form states for Receive Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Overall Statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalBalanceDue = customers.reduce(
      (sum, c) => sum + Math.max(0, Number(c.currentBalance) || 0),
      0
    );
    const customersWithDue = customers.filter(
      (c) => Number(c.currentBalance) > 0
    ).length;
    const clearedCustomers = customers.filter(
      (c) => Number(c.currentBalance) <= 0
    ).length;

    return {
      totalCustomers,
      totalBalanceDue,
      customersWithDue,
      clearedCustomers,
    };
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesSearch =
        !q ||
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.address || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      const balance = Number(c.currentBalance) || 0;
      if (filterType === 'due') return balance > 0;
      if (filterType === 'cleared') return balance <= 0;
      return true;
    });
  }, [customers, searchQuery, filterType]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormName('');
    setFormPhone('');
    setFormAddress('');
    setFormNotes('');
    setFormInitialBalance('');
    setIsAddCustomerOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormName(cust.name || '');
    setFormPhone(cust.phone || '');
    setFormAddress(cust.address || '');
    setFormNotes(cust.notes || '');
    setFormInitialBalance(cust.currentBalance?.toString() || '0');
    setIsAddCustomerOpen(true);
  };

  // Save Customer (Add or Edit)
  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('گاہک کا نام درج کرنا لازمی ہے۔');
      return;
    }

    try {
      const initialBal = Number(formInitialBalance) || 0;
      const custData = {
        id: editingCustomer?.id,
        name: formName.trim(),
        phone: formPhone.trim(),
        address: formAddress.trim(),
        notes: formNotes.trim(),
        currentBalance: editingCustomer
          ? Number(editingCustomer.currentBalance) || 0
          : initialBal,
        transactions: editingCustomer
          ? editingCustomer.transactions || []
          : initialBal > 0
          ? [
              {
                id: `tx_init_${Date.now()}`,
                date: new Date().toISOString(),
                type: 'BILL_CREDIT',
                description: 'سابقہ پرانا کھاتہ ادھار (Initial Balance)',
                debit: initialBal,
                credit: 0,
                balanceAfter: initialBal,
              },
            ]
          : [],
      };

      await saveCustomer(custData);
      setIsAddCustomerOpen(false);
      setNotice(`گاہک "${custData.name}" کا کھاتہ کامیابی سے محفوظ ہو گیا!`);
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      console.error(err);
      alert('کسٹمر محفوظ کرتے وقت خرابی پیش آگئی۔');
    }
  };

  // Open Receive Payment Modal
  const handleOpenPaymentModal = (cust) => {
    setPaymentCustomer(cust);
    setPaymentAmount('');
    setPaymentNote('نقد رقم وصولی (کھاتہ جمع)');
    setPaymentMethod('Cash');
  };

  // Submit Receive Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      alert('براہ کرم وصول شدہ رقم درج کریں۔');
      return;
    }

    try {
      await recordCustomerPayment({
        customerId: paymentCustomer.id,
        amount: amt,
        note: paymentNote.trim() || 'نقد رقم وصولی',
        paymentMethod,
      });

      // Update selectedLedgerCustomer view if open
      if (selectedLedgerCustomer?.id === paymentCustomer.id) {
        const updated = customers.find((c) => c.id === paymentCustomer.id);
        if (updated) setSelectedLedgerCustomer(updated);
      }

      setNotice(`Rs. ${amt} وصولی گاہک "${paymentCustomer.name}" کے کھاتے میں جمع ہو گئی!`);
      setTimeout(() => setNotice(null), 4000);
      setPaymentCustomer(null);
    } catch (err) {
      console.error(err);
      alert('ادائیگی محفوظ کرتے وقت خرابی پیش آگئی۔');
    }
  };

  // Print Statement Slip
  const handlePrintCustomerSlip = (cust) => {
    setPrintedCustomer(cust);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Delete Customer
  const handleDeleteCustomer = async (cust) => {
    if (
      window.confirm(
        `کیا آپ واقعی "${cust.name}" کا کھاتہ ڈیلیٹ کرنا چاہتے ہیں؟ اس کا تمام پرانا ریکارڈ ختم ہو جائے گا۔`
      )
    ) {
      await deleteCustomer(cust.id);
      if (selectedLedgerCustomer?.id === cust.id) setSelectedLedgerCustomer(null);
      setNotice(`گاہک "${cust.name}" کا کھاتہ حذف کر دیا گیا۔`);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-sm font-extrabold flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">✓</span>
            <span>{notice}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-black px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-amber-200">
            <Icon name="khata" size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                کسٹمر کھاتہ رجسٹر (Customer Khata Ledger)
              </h1>
              <Badge variant="warning" size="sm">
                ادھار و ریکوری
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              تمام گاہکوں کے بقایا جات، ادھار بل اور نقد وصولیوں کا خودکار کھاتہ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={resetCustomers}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            title="نمونہ کھاتہ دار ری سیٹ کریں"
          >
            ری سیٹ نمونہ ڈیٹا
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Icon name="plus" size={18} />
            <span>+ نیا کھاتہ دار شامل کریں</span>
          </button>
        </div>
      </div>

      {/* STATS KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-2">
            <span>کل کھاتہ دار (Total Customers)</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Icon name="user" size={18} />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {stats.totalCustomers}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            سسٹم میں رجسٹرڈ تمام گاہک
          </div>
        </div>

        {/* Total Outstanding Khata Balance */}
        <div className="bg-gradient-to-br from-rose-50 to-white p-5 rounded-2xl border border-rose-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-rose-700 text-xs font-bold mb-2">
            <span>کل واجب الادا ادھار (Total Credit Due)</span>
            <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <Icon name="warning" size={18} />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 font-mono">
            {formatCurrency(stats.totalBalanceDue)}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            مارکیٹ میں گاہکوں کے ذمہ واجب الادا بقایا
          </div>
        </div>

        {/* Active Due Customers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 text-xs font-bold mb-2">
            <span>بقایا دار گاہک (Active Debtors)</span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Icon name="trend-up" size={18} />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800 font-mono">
            {stats.customersWithDue}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            جن کے ذمہ ابھی رقم باقی ہے
          </div>
        </div>

        {/* Cleared Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold mb-2">
            <span>صاف کھاتے (Cleared Accounts)</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Icon name="check" size={18} />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {stats.clearedCustomers}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            جن کا تمام ادھار بے باک ہو چکا ہے
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon name="search" size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="گاہک کا نام، فون نمبر یا پتہ تلاش کریں..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-600 text-xs sm:text-sm font-bold outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            تمام کھاتے ({customers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('due')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'due'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-slate-100 text-rose-700 hover:bg-rose-50'
            }`}
          >
            واجب الادا بقایا دار ({stats.customersWithDue})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('cleared')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'cleared'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            صاف کھاتے ({stats.clearedCustomers})
          </button>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Icon name="khata" size={32} />
            </div>
            <h3 className="text-base font-black text-slate-800">کوئی کھاتہ دار نہیں ملا</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              تلاش کردہ نام کا کوئی گاہک موجود نہیں ہے، نیا کھاتہ دار شامل کرنے کے لیے اوپر دیے گئے بٹن پر کلک کریں۔
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-800 font-black text-xs sm:text-sm border-b border-slate-200 tracking-wider">
                  <th className="py-4 px-4">گاہک (Customer Name)</th>
                  <th className="py-4 px-4">رابطہ نمبر (Phone)</th>
                  <th className="py-4 px-4">پتہ و تفصیل (Address)</th>
                  <th className="py-4 px-4 text-center">ٹرانزیکشنز</th>
                  <th className="py-4 px-4 text-right">موجودہ بقایا (Balance Due)</th>
                  <th className="py-4 px-4 text-right">ایکشن (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => {
                  const balance = Number(cust.currentBalance) || 0;
                  const hasDue = balance > 0;
                  const txCount = cust.transactions?.length || 0;

                  return (
                    <tr
                      key={cust.id}
                      className="hover:bg-indigo-50/40 transition-colors group"
                    >
                      {/* Name & Initials */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 font-black text-base flex items-center justify-center border border-indigo-100 shrink-0">
                            {cust.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm group-hover:text-indigo-700 transition-colors">
                              {cust.name}
                            </div>
                            {cust.notes && (
                              <div className="text-[11px] text-slate-400 truncate max-w-xs">
                                {cust.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4">
                        {cust.phone ? (
                          <span className="font-mono font-bold text-xs text-slate-700" dir="ltr">
                            {cust.phone}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>

                      {/* Address */}
                      <td className="py-4 px-4 max-w-xs">
                        <span className="text-xs text-slate-600 font-medium">
                          {cust.address || '—'}
                        </span>
                      </td>

                      {/* Transactions Count */}
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">
                          {txCount} اینٹریز
                        </span>
                      </td>

                      {/* Current Khata Balance */}
                      <td className="py-4 px-4 text-right">
                        <div>
                          <span
                            className={`text-base sm:text-lg font-black font-mono ${
                              hasDue ? 'text-rose-700' : 'text-emerald-700'
                            }`}
                          >
                            {formatCurrency(balance)}
                          </span>
                          <span className="block text-[10px] font-bold">
                            {hasDue ? (
                              <span className="text-rose-600">واجب الادا ادھار</span>
                            ) : (
                              <span className="text-emerald-600">صاف کھاتہ ✓</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Receive Payment Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPaymentModal(cust)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95"
                            title="رقم وصول کریں / کھاتہ جمع"
                          >
                            <Icon name="cash" size={14} />
                            <span>وصولی</span>
                          </button>

                          {/* View Ledger Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedLedgerCustomer(cust)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-extrabold transition-all cursor-pointer"
                            title="تفصیلی کھاتہ بہی دیکھیں"
                          >
                            <Icon name="khata" size={14} />
                            <span>کھاتہ</span>
                          </button>

                          {/* Print Slip Button */}
                          <button
                            type="button"
                            onClick={() => handlePrintCustomerSlip(cust)}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="کھاتہ پرچی پرنٹ کریں"
                          >
                            <Icon name="print" size={16} />
                          </button>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cust)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="تبدیل کریں"
                          >
                            <Icon name="edit" size={15} />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomer(cust)}
                            className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="حذف کریں"
                          >
                            <Icon name="delete" size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT CUSTOMER */}
      {/* ---------------------------------------------------- */}
      {isAddCustomerOpen && (
        <Modal
          isOpen={isAddCustomerOpen}
          onClose={() => setIsAddCustomerOpen(false)}
          title={editingCustomer ? 'کھاتہ دار تفصیلات تبدیل کریں' : 'نیا کھاتہ دار گاہک شامل کریں'}
          subtitle="گاہک کی معلومات اور پرانا ادھار درج کریں"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveCustomer} className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                گاہک کا نام (Customer Name) <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="مثلاً: حاجی محمد اکرم یا چوہدری طارق"
                className="w-full text-sm font-bold bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                رابطہ / موبائل نمبر (Phone Number):
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="مثلاً: 0300-1234567"
                className="w-full text-sm font-bold bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600 font-mono"
                dir="ltr"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                پتہ / دکان کا پتہ (Address):
              </label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                placeholder="مثلاً: گلی نمبر 4، رجانہ روڈ کھدروالا"
                className="w-full text-sm font-bold bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>

            {!editingCustomer && (
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  سابقہ پرانا ادھار رقم (Initial Due Balance Rs.):
                </label>
                <input
                  type="number"
                  min="0"
                  value={formInitialBalance}
                  onChange={(e) => setFormInitialBalance(e.target.value)}
                  placeholder="0 (اگر پہلے سے کوئی ادھار ہے تو رقم لکھیں)"
                  className="w-full text-sm font-bold bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  اگر گاہک کا پہلے سے کھاتہ چل رہا ہو تو ابتدائی رقم درج کریں۔
                </span>
              </div>
            )}

            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                اضافی نوٹ (Notes):
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="گاہک کے بارے میں کوئی اہم بات..."
                rows={2}
                className="w-full text-sm font-medium bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                منسوخ (Cancel)
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-sm transition-colors shadow-md cursor-pointer"
              >
                محفوظ کریں (Save) ✓
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: RECEIVE PAYMENT (رقم وصول کریں / کھاتہ جمع) */}
      {/* ---------------------------------------------------- */}
      {paymentCustomer && (
        <Modal
          isOpen={Boolean(paymentCustomer)}
          onClose={() => setPaymentCustomer(null)}
          title={`رقم وصول کریں (کھاتہ جمع) - ${paymentCustomer.name}`}
          subtitle={`موجودہ کل واجب الادا بقایا: Rs. ${Number(paymentCustomer.currentBalance || 0)}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmitPayment} className="space-y-4">
            {/* Balance Overview Box */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-bold">کل واجب الادا رقم:</span>
                <span className="text-2xl font-black font-mono text-rose-400">
                  {formatCurrency(Number(paymentCustomer.currentBalance || 0))}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block font-bold">وصولی کے بعد نیا بقایا:</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {formatCurrency(
                    Math.max(
                      0,
                      Number(paymentCustomer.currentBalance || 0) - (Number(paymentAmount) || 0)
                    )
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                وصول شدہ رقم (Received Amount Rs.) <span className="text-rose-500">*</span>:
              </label>
              <input
                type="number"
                min="1"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="مثلاً: 2000"
                className="w-full text-lg font-black bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-emerald-600 font-mono"
                required
                autoFocus
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentAmount(paymentCustomer.currentBalance?.toString() || '0')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-black cursor-pointer"
              >
                پورا بقایا ادا (Full: Rs. {paymentCustomer.currentBalance})
              </button>
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setPaymentAmount(amt.toString())}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Rs. {amt}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                ادائیگی کا طریقہ (Method):
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-sm font-bold bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600"
              >
                <option value="Cash">Cash (نقد کیش)</option>
                <option value="Online / Bank">Online Bank Transfer (بینک / ایزی پیسہ / جاز کیش)</option>
                <option value="Cheque">Cheque (چیک)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-800 block mb-1">
                تفصیل / نوٹ (Description):
              </label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="مثلاً: نقد رقم وصولی یا بذریعہ چیک"
                className="w-full text-sm font-medium bg-white border-2 border-slate-300 rounded-xl p-3 outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPaymentCustomer(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                منسوخ (Cancel)
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-sm transition-colors shadow-md cursor-pointer"
              >
                وصولی درج کریں ✓
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: DETAILED CUSTOMER LEDGER (کھاتہ بہی تفصیل) */}
      {/* ---------------------------------------------------- */}
      {selectedLedgerCustomer && (
        <Modal
          isOpen={Boolean(selectedLedgerCustomer)}
          onClose={() => setSelectedLedgerCustomer(null)}
          title={`کھاتہ بہی لیجر - ${selectedLedgerCustomer.name}`}
          subtitle={`رابطہ: ${selectedLedgerCustomer.phone || 'کوئی فون نہیں'} | پتہ: ${selectedLedgerCustomer.address || '—'}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-5">
            {/* Top Summary Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div>
                <span className="text-xs text-slate-400 block font-bold">کل واجب الادا موجودہ بقایا:</span>
                <span className="text-3xl font-black font-mono text-amber-400">
                  {formatCurrency(Number(selectedLedgerCustomer.currentBalance || 0))}
                </span>
                <span className="text-xs text-slate-300 block font-urdu mt-0.5">
                  {Number(selectedLedgerCustomer.currentBalance) > 0
                    ? 'یہ رقم دکان کو ادا کرنی باقی ہے'
                    : 'کھاتہ بے باک اور کلیئر ہے ✓'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPaymentModal(selectedLedgerCustomer)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Icon name="cash" size={16} />
                  <span>رقم وصول کریں</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintCustomerSlip(selectedLedgerCustomer)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer active:scale-95"
                >
                  <Icon name="print" size={16} />
                  <span>پرچی پرنٹ کریں</span>
                </button>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-slate-800">
                  تمام کھاتہ اندراجات ({selectedLedgerCustomer.transactions?.length || 0} اینٹریز)
                </span>
                <span className="text-xs font-bold text-slate-500 font-mono">
                  Ledger Transactions
                </span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">تاریخ و وقت</th>
                      <th className="py-2.5 px-3">نوعیت و تفصیل</th>
                      <th className="py-2.5 px-3 text-center">ادھار / بنام (Debit)</th>
                      <th className="py-2.5 px-3 text-center">جمع / وصول (Credit)</th>
                      <th className="py-2.5 px-3 text-right">بقایا بیلنس (Balance)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(!selectedLedgerCustomer.transactions ||
                      selectedLedgerCustomer.transactions.length === 0) ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                          ابھی تک اس گاہک کا کوئی لین دین درج نہیں ہے۔
                        </td>
                      </tr>
                    ) : (
                      selectedLedgerCustomer.transactions.map((tx, idx) => {
                        const isDebit = tx.type === 'BILL_CREDIT';
                        const debit = Number(tx.debit) || (isDebit ? Number(tx.amount || tx.creditAmount || 0) : 0);
                        const credit = Number(tx.credit) || (!isDebit ? Number(tx.amount || tx.paidAmount || 0) : 0);

                        return (
                          <tr key={tx.id || idx} className="hover:bg-slate-50/80 transition-colors">
                            {/* Date */}
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{formatDate(tx.date)}</div>
                              <div className="text-[11px] font-mono text-slate-400">{formatTime(tx.date)}</div>
                            </td>

                            {/* Description */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    isDebit
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {isDebit ? 'بل ادھار' : 'نقد وصولی'}
                                </span>
                                {tx.orderId && (
                                  <span className="font-mono text-xs text-indigo-700 font-bold">
                                    #{tx.orderId}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-600 font-medium mt-1">
                                {tx.description}
                              </div>
                            </td>

                            {/* Debit (Customer owes) */}
                            <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">
                              {debit > 0 ? formatCurrency(debit) : '—'}
                            </td>

                            {/* Credit (Customer paid) */}
                            <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                              {credit > 0 ? formatCurrency(credit) : '—'}
                            </td>

                            {/* Balance After */}
                            <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                              {formatCurrency(Number(tx.balanceAfter || 0))}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLedgerCustomer(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm cursor-pointer"
              >
                بند کریں (Close)
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* HIDDEN THERMAL RECEIPT FOR STATEMENT PRINTING */}
      {/* ---------------------------------------------------- */}
      {printedCustomer && (
        <div className="hidden print:block">
          <CustomerKhataReceipt customer={printedCustomer} />
        </div>
      )}
    </div>
  );
};
