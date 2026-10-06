import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { formatDateTime } from '../../../utils/date';

export const StockHistoryModal = ({ isOpen, onClose, logs = [] }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Inventory Audit History"
      subtitle="Complete ledger of stock adjustments, deliveries, and sales"
      maxWidth="max-w-2xl"
    >
      {logs.length === 0 ? (
        <EmptyState
          icon="history"
          title="No inventory history yet"
          description="Stock adjustments and sale transactions will be recorded here."
        />
      ) : (
        <div className="overflow-x-auto max-h-[60vh] border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider z-10">
              <tr>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Product & SKU</th>
                <th className="py-3 px-3.5">Type</th>
                <th className="py-3 px-3.5 text-center">Change</th>
                <th className="py-3 px-3.5 text-center">Stock After</th>
                <th className="py-3 px-3.5">Reason & User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {logs.map((log) => {
                const isPositive = log.quantityChange > 0;
                return (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3.5 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-bold text-slate-800 truncate max-w-[150px]">
                        {log.productName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400">{log.sku}</div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <Badge
                        variant={
                          log.type === 'Restock'
                            ? 'success'
                            : log.type === 'Sale'
                            ? 'primary'
                            : 'warning'
                        }
                        size="xs"
                      >
                        {log.type}
                      </Badge>
                    </td>
                    <td
                      className={`py-2.5 px-3.5 text-center font-extrabold ${
                        isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {isPositive ? `+${log.quantityChange}` : log.quantityChange}
                    </td>
                    <td className="py-2.5 px-3.5 text-center font-semibold text-slate-800">
                      {log.newStock}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="text-slate-700 font-medium truncate max-w-[180px]">
                        {log.reason}
                      </div>
                      <div className="text-[10px] text-slate-400">by {log.adjustedBy}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
};
