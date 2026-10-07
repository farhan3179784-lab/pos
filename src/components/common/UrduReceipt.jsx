import { formatDate, formatTime } from '../../utils/date';
import { formatUnitQuantity } from '../../constants/units';

export const UrduReceipt = ({
  order,
  storeName = 'فیوژن کریانہ ہول سیل سنٹر',
  storeSubName = 'FUSION KIRYANA STORE',
  storeAddress = 'رجانہ روڈ نزد الائیڈ پیٹرولیم کھدروالا',
  phone1 = '0302-1322203',
  phone2 = '0342-3989203',
  proprietor1 = 'عبدالرزاق',
  proprietor2 = 'محمد علی',
  footerNote = 'Thank you For Visiting ! شکریہ تشریف آوری کا',
  softwareCredit = 'Developed by CodesInc • 0307-3493100',
}) => {
  if (!order) return null;

  const netTotal = Math.round(Number(order.pricing?.grandTotal || order.pricing?.total || 0));
  const received = Math.round(Number(order.payment?.tendered || netTotal));
  const change = Math.max(0, received - netTotal);

  return (
    <div
      id="thermal-receipt"
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
        <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-800">
          <p className="font-urdu">
            پروپرائیٹر {proprietor1}: <span className="font-mono font-bold" dir="ltr">{phone1}</span>
          </p>
          <p className="font-urdu">
            {proprietor2}: <span className="font-mono font-bold" dir="ltr">{phone2}</span>
          </p>
        </div>
      </div>

      {/* Bill Number & Date Bar */}
      <div className="flex justify-between items-center text-[12px] font-semibold font-mono py-1.5 border-b border-black">
        <span>بل نمبر : {order.id}</span>
        <span>
          {formatDate(order.createdAt)} {formatTime(order.createdAt)}
        </span>
      </div>

      {/* Items Table */}
      <table className="w-full text-center border-collapse mt-1 text-[12px]">
        <thead>
          <tr className="border-b border-dashed border-black font-urdu font-bold">
            <th className="py-1 px-0.5 text-center w-6">نمبر</th>
            <th className="py-1 px-1 text-right">تفصیل</th>
            <th className="py-1 px-0.5 text-center w-14">وزن/تعداد</th>
            <th className="py-1 px-0.5 text-center w-10">ریٹ</th>
            <th className="py-1 px-0.5 text-right w-12">رقم</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dotted divide-slate-400">
          {order.items?.map((item, idx) => (
            <tr key={idx} className="align-middle">
              <td className="py-1.5 px-0.5 font-sans font-semibold text-center text-[11px]">
                {idx + 1}
              </td>
              <td className="py-1.5 px-1 text-right font-urdu font-bold text-[13px] leading-snug">
                {item.nameUrdu || item.name}
              </td>
              <td className="py-1.5 px-0.5 font-sans font-bold text-center text-[11px] whitespace-nowrap">
                {formatUnitQuantity(item.quantity, item.unit || 'pcs', true)}
              </td>
              <td className="py-1.5 px-0.5 font-sans font-semibold text-center text-[11px]">
                {Math.round(Number(item.price))}
              </td>
              <td className="py-1.5 px-0.5 font-sans font-bold text-right">
                {Math.round(Number(item.subtotal || item.price * item.quantity))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-b border-dashed border-black font-bold text-[11px]">
            <td colSpan="2" className="py-1 text-right font-urdu pr-1">
              کل آئٹمز ({order.items?.length || 0})
            </td>
            <td className="py-1 text-center font-sans font-bold" colSpan="2">
              --
            </td>
            <td className="py-1 text-right font-sans text-xs">{netTotal}</td>
          </tr>
        </tfoot>
      </table>

      {/* Net Total & Received Summary */}
      <div className="mt-3 pt-1 border-t-2 border-b-2 border-black space-y-1.5 pb-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm font-sans font-bold">Net Total</span>
          <span className="text-xl font-sans font-extrabold">{netTotal}</span>
        </div>
        <div className="flex justify-between items-baseline text-xs font-sans font-bold">
          <span>Received</span>
          <span>{received}</span>
        </div>
        {change > 0 && (
          <div className="flex justify-between items-baseline text-xs font-sans font-bold text-slate-800">
            <span>Change</span>
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Thank you note */}
      <div className="text-center py-2.5 font-sans text-xs font-semibold">
        {footerNote}
      </div>

      {/* Software credit */}
      <div className="border-t border-b border-dashed border-black py-1.5 text-center font-sans text-[10px] font-semibold text-slate-800 tracking-wide">
        {softwareCredit}
      </div>
    </div>
  );
};
