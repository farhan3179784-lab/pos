import { storageService } from './storage.service';
import { generateId } from '../utils/idGenerator';

export const customerService = {
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(storageService.getCustomers());
      }, 40);
    });
  },

  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const customers = storageService.getCustomers();
        const found = customers.find((c) => c.id === id);
        if (found) resolve(found);
        else reject(new Error(`Customer ${id} not found`));
      }, 40);
    });
  },

  async save(customerData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customers = storageService.getCustomers();
        let updated;

        if (customerData.id) {
          const index = customers.findIndex((c) => c.id === customerData.id);
          if (index !== -1) {
            updated = {
              ...customers[index],
              ...customerData,
              updatedAt: new Date().toISOString(),
            };
            customers[index] = updated;
          } else {
            updated = {
              ...customerData,
              id: customerData.id,
              currentBalance: Number(customerData.currentBalance) || 0,
              transactions: customerData.transactions || [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            customers.unshift(updated);
          }
        } else {
          updated = {
            ...customerData,
            id: generateId('cust'),
            currentBalance: Number(customerData.currentBalance) || 0,
            transactions: customerData.transactions || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          customers.unshift(updated);
        }

        storageService.setCustomers(customers);
        resolve(updated);
      }, 40);
    });
  },

  async delete(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customers = storageService.getCustomers();
        const filtered = customers.filter((c) => c.id !== id);
        storageService.setCustomers(filtered);
        resolve(true);
      }, 40);
    });
  },

  /**
   * Record credit / udhaar when a bill is partially paid or unpaid
   */
  async recordBillCredit({
    customerId,
    customerName,
    customerPhone,
    customerAddress,
    orderId,
    billTotal,
    paidAmount,
    creditAmount,
  }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customers = storageService.getCustomers();
        let targetCust = null;

        if (customerId) {
          targetCust = customers.find((c) => c.id === customerId);
        }

        // Match by phone or exact name if not found by id
        if (!targetCust && customerPhone) {
          targetCust = customers.find((c) => c.phone && c.phone === customerPhone);
        }
        if (!targetCust && customerName && customerName !== 'Walk-in Customer') {
          targetCust = customers.find(
            (c) => c.name.trim().toLowerCase() === customerName.trim().toLowerCase()
          );
        }

        // If still not found and customer has a proper name, create new customer entry
        if (!targetCust) {
          targetCust = {
            id: customerId || generateId('cust'),
            name: customerName || 'نامعلوم گاہک',
            phone: customerPhone || '',
            address: customerAddress || '',
            notes: 'پی او ایس بلنگ کے دوران خودکار اندراج',
            currentBalance: 0,
            transactions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          customers.unshift(targetCust);
        }

        const prevBalance = Number(targetCust.currentBalance) || 0;
        const due = Math.round(Number(creditAmount) || 0);
        const newBalance = prevBalance + due;

        const newTx = {
          id: generateId('tx'),
          date: new Date().toISOString(),
          type: 'BILL_CREDIT',
          orderId,
          description: `بل خریداری #${orderId} (کل: ${Math.round(billTotal)}، ادا: ${Math.round(paidAmount)})`,
          billTotal: Math.round(billTotal),
          paidAmount: Math.round(paidAmount),
          debit: due, // Customer owes this
          credit: 0,
          balanceAfter: newBalance,
        };

        targetCust.currentBalance = newBalance;
        targetCust.updatedAt = new Date().toISOString();
        targetCust.transactions = [newTx, ...(targetCust.transactions || [])];

        storageService.setCustomers(customers);

        resolve({
          customer: targetCust,
          prevBalance,
          creditAmount: due,
          newBalance,
        });
      }, 40);
    });
  },

  /**
   * Record payment / deposit made by customer to clear or reduce their khata
   */
  async recordPayment({ customerId, amount, note, paymentMethod = 'Cash' }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const customers = storageService.getCustomers();
        const index = customers.findIndex((c) => c.id === customerId);

        if (index === -1) {
          return reject(new Error('Customer not found'));
        }

        const cust = customers[index];
        const numAmt = Math.round(Number(amount) || 0);
        const prevBalance = Number(cust.currentBalance) || 0;
        const newBalance = Math.max(0, prevBalance - numAmt);

        const newTx = {
          id: generateId('tx'),
          date: new Date().toISOString(),
          type: 'CASH_PAYMENT',
          description: note || 'نقد رقم وصولی (کھاتہ جمع)',
          paymentMethod,
          debit: 0,
          credit: numAmt, // Paid by customer
          balanceAfter: newBalance,
        };

        cust.currentBalance = newBalance;
        cust.updatedAt = new Date().toISOString();
        cust.transactions = [newTx, ...(cust.transactions || [])];

        customers[index] = cust;
        storageService.setCustomers(customers);

        resolve({
          customer: cust,
          prevBalance,
          paidAmount: numAmt,
          newBalance,
        });
      }, 40);
    });
  },
};
