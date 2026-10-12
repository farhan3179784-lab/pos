import { storageService } from './storage.service';
import { generateId } from '../utils/idGenerator';

export const customerService = {
  async getAll() {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/customers');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            storageService.setCustomers(json.data);
            return json.data;
          }
        }
      } catch (err) {
        console.warn('API fetch customers failed, falling back to local cache:', err.message);
      }
    }
    return storageService.getCustomers();
  },

  async getById(id) {
    const customers = await this.getAll();
    const found = customers.find((c) => c.id === id);
    if (found) return found;
    throw new Error(`Customer ${id} not found`);
  },

  async save(customerData) {
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

    // Sync with MongoDB API in background
    if (typeof window !== 'undefined') {
      try {
        fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch((e) => console.warn('Customer API sync error:', e));
      } catch (e) {
        // silent
      }
    }

    return updated;
  },

  async delete(id) {
    const customers = storageService.getCustomers();
    const filtered = customers.filter((c) => c.id !== id);
    storageService.setCustomers(filtered);

    if (typeof window !== 'undefined') {
      try {
        fetch(`/api/customers/${id}`, {
          method: 'DELETE',
        }).catch((e) => console.warn('Customer delete API error:', e));
      } catch (e) {
        // silent
      }
    }

    return true;
  },

  /**
   * Automatic entry when POS billing completes with credit / baqaya
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
    const customers = storageService.getCustomers();
    let targetCust = customers.find((c) => c.id === customerId);

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
      debit: due,
      credit: 0,
      balanceAfter: newBalance,
    };

    targetCust.currentBalance = newBalance;
    targetCust.updatedAt = new Date().toISOString();
    targetCust.transactions = [newTx, ...(targetCust.transactions || [])];

    storageService.setCustomers(customers);

    return {
      customer: targetCust,
      prevBalance,
      creditAmount: due,
      newBalance,
    };
  },

  /**
   * Record payment / deposit made by customer to clear or reduce their khata
   */
  async recordPayment({ customerId, amount, note, paymentMethod = 'Cash' }) {
    const customers = storageService.getCustomers();
    const index = customers.findIndex((c) => c.id === customerId);

    if (index === -1) {
      throw new Error('Customer not found');
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
      credit: numAmt,
      balanceAfter: newBalance,
    };

    cust.currentBalance = newBalance;
    cust.updatedAt = new Date().toISOString();
    cust.transactions = [newTx, ...(cust.transactions || [])];

    customers[index] = cust;
    storageService.setCustomers(customers);

    // Sync payment with MongoDB API in background
    if (typeof window !== 'undefined') {
      try {
        fetch(`/api/customers/${customerId}/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: numAmt, note, paymentMethod }),
        }).catch((e) => console.warn('Payment API sync error:', e));
      } catch (e) {
        // silent
      }
    }

    return {
      customer: cust,
      prevBalance,
      paidAmount: numAmt,
      newBalance,
    };
  },
};
