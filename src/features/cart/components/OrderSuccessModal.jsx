import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { UrduReceipt } from '../../../components/common/UrduReceipt';

export const OrderSuccessModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Successful (بل تیار ہے)"
      subtitle={`Order #${order.id}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Receipt Container */}
        <div className="bg-slate-50 p-2 sm:p-4 rounded-2xl border border-slate-200 overflow-y-auto max-h-[65vh]">
          <UrduReceipt order={order} />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="primary" size="md" icon="print" onClick={handlePrint}>
            پرنٹ سلپ (Print Slip)
          </Button>
          <Button variant="secondary" size="md" onClick={onClose}>
            Done & New Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
};
