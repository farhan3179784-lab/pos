import { formatDate, formatTime } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';

export const CustomerKhataReceipt = ({
  customer,
  storeName = 'فیوژن کریانہ ہول سیل سنٹر',
  storeSubName = 'FUSION KIRYANA STORE',
  storeAddress = 'رجانہ روڈ نزد الائیڈ پیٹرولیم کھدروالا',
  phone1 = '0302-1322203',
  phone2 = '0342-3989203',
  proprietor1 = 'عبدالرزاق',
  softwareCredit = 'Developed by CodesInc • 0307-3493100',
}) => {
  if (!customer) return null;

  const currentBalance = Math.round(Number(customer.currentBalance) || 0);
  const transactions = customer.transactions || [];

  const totalDebits = transactions.reduce(
    (sum, t) => sum + (Number(t.debit) || (t.type === 'BILL_CREDIT' ? Number(t.amount || t.creditAmount || 0) : 0)),
    0
  );
  const totalCredits = transactions.reduce(
    (sum, t) => sum + (Number(t.credit) || (t.type === 'CASH_PAYMENT' ? Number(t.amount || t.paidAmount || 0) : 0)),
    0
  );

  return (
    <div
      id="khata-statement-receipt"
      className="bg-white text-black p-4 max-w-[320px] mx-auto text-xs border border-dashed border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0"
      style={{ fontFamily: "'Noto Nastaliq Urdu', 'Noto Sans Arabic', Tahoma, sans-serif" }}
    >
      {/* Header */}
      <div className="text-center pb-2">
        <h2 className="text-xl font-extrabold tracking-normal leading-tight font-urdu">
          {storeName}
        </h2>
        {storeSubName && (
          <p className="text-[10px] font-sans font-bold tracking-widest text-slate-800 mt-0.5 uppercase">
            {storeSubName}
          </p>
        )}
        <p className="text-[12px] font-urdu font-medium text-slate-800 mt-1">
          {storeAddress}
        </p>
        <p className="text-[11px] font-urdu text-slate-800 mt-0.5">
          رابطہ {proprietor1}: <span className="font-mono font-bold" dir="ltr">{phone1}</span> | <span className="font-mono font-bold" dir="ltr">{phone2}</span>
        </p>
      </div>

      {/* Slip Title */}
      <div className="text-center py-1.5 border-t border-b-2 border-black font-urdu font-black text-sm bg-slate-100">
        گاہک کھاتہ پرچی / اکاؤنٹ سٹیٹمنٹ
      </div>

      {/* Customer Info */}
      <div className="py-2 border-b border-black space-y-1 font-urdu text-[12px]">
        <div className="flex justify-between items-center">
          <span>گاہک کا نام:</span>
          <span className="font-extrabold text-[13px]">{customer.name}</span>
        </div>
        {customer.phone && (
          <div className="flex justify-between items-center">
            <span>موبائل نمبر:</span>
            <span className="font-mono font-bold" dir="ltr">{customer.phone}</span>
          </div>
        )}
        {customer.address && (
          <div className="flex justify-between items-center">
            <span>پتہ:</span>
            <span className="font-medium text-[11px] truncate max-w-[200px]">{customer.address}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-[10px] text-slate-600 font-sans pt-0.5">
          <span>تاریخ و وقت:</span>
          <span className="font-mono">{formatDate(new Date())} {formatTime(new Date())}</span>
        </div>
      </div>

      {/* Current Balance Hero Box */}
      <div className="my-2.5 p-2 border-2 border-black rounded text-center bg-slate-50">
        <div className="font-urdu text-[12px] font-bold text-slate-800">
          کل واجب الادا رقم (موجودہ بقایا کھاتہ)
        </div>
        <div className="font-mono font-black text-2xl text-black mt-0.5">
          {formatCurrency(currentBalance)}
        </div>
        <div className="text-[10px] font-urdu text-slate-600 mt-0.5">
          {currentBalance > 0 ? 'یہ رقم دکان کو ادا کرنی باقی ہے' : 'کھاتہ مکمل بے باک ہے ✓'}
        </div>
      </div>

      {/* Transactions History Table */}
      <div className="mt-2">
        <div className="font-urdu font-bold text-xs pb-1 border-b border-black flex justify-between">
          <span>حالیہ کھاتہ لین دین (آخری اندراجات)</span>
          <span className="font-mono text-[10px]">{transactions.length} ٹرانزیکشنز</span>
        </div>

        <table className="w-full text-center border-collapse mt-1 text-[11px]">
          <thead>
            <tr className="border-b border-dashed border-black font-urdu font-bold text-[10px]">
              <th className="py-1 text-right">تاریخ و تفصیل</th>
              <th className="py-1 text-center w-14">ادھار/بنام</th>
              <th className="py-1 text-center w-14">جمع/وصول</th>
              <th className="py-1 text-right w-14">بقایا</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dotted divide-slate-400">
            {transactions.slice(0, 10).map((tx, idx) => {
              const debit = Number(tx.debit) || (tx.type === 'BILL_CREDIT' ? Number(tx.amount || tx.creditAmount || 0) : 0);
              const credit = Number(tx.credit) || (tx.type === 'CASH_PAYMENT' ? Number(tx.amount || tx.paidAmount || 0) : 0);
              return (
                <tr key={tx.id || idx} className="align-middle">
                  <td className="py-1.5 text-right font-urdu">
                    <div className="font-bold text-[11px] leading-tight text-slate-900">
                      {tx.type === 'BILL_CREDIT' ? 'بل خریداری' : 'نقد وصولی'}
                      {tx.orderId ? ` #${tx.orderId.slice(-4)}` : ''}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">
                      {formatDate(tx.date)}
                    </div>
                  </td>
                  <td className="py-1.5 text-center font-sans font-bold text-slate-900">
                    {debit > 0 ? debit : '-'}
                  </td>
                  <td className="py-1.5 text-center font-sans font-bold text-slate-900">
                    {credit > 0 ? credit : '-'}
                  </td>
                  <td className="py-1.5 text-right font-sans font-extrabold text-black">
                    {Math.round(Number(tx.balanceAfter || 0))}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-b border-black font-bold text-[11px]">
              <td className="py-1 text-right font-urdu">میزان:</td>
              <td className="py-1 text-center font-sans">{totalDebits}</td>
              <td className="py-1 text-center font-sans">{totalCredits}</td>
              <td className="py-1 text-right font-sans font-black">{currentBalance}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Signature Bar */}
      <div className="mt-6 pt-3 border-t border-dotted border-black flex justify-between items-center text-[11px] font-urdu">
        <div>دستخط گاہک: _____________</div>
        <div>دستخط دکاندار: _____________</div>
      </div>

      {/* Credit note */}
      <div className="mt-3 border-t border-b border-dashed border-black py-1 text-center font-sans text-[9px] text-slate-800">
        {softwareCredit}
      </div>
    </div>
  );
};
