# Super Store POS & Admin Dashboard - Project Memory & Blueprint

> **File:** `memory.md`  
> **Status:** Active Reference & Project Specification  
> **Target Application:** Super Store POS & Admin Dashboard

---

## 1. Project Overview

**Super Store POS & Admin Dashboard** is a high-performance, modular, and responsive Point of Sale (POS) and administrative management application. It unifies fast cash/online checkout workflows for cashier staff with inventory control, product catalog management, order auditing, and real-time dashboard analytics for store administrators.

---

## 2. Technology Stack & Environment

| Layer / Concern | Technology | Notes & Constraints |
| :--- | :--- | :--- |
| **Build Tool & Bundler** | Vite.js (`vite ^8.x`) | Fast HMR, ESM architecture, production rollup builds |
| **UI Framework** | React 19 (`react ^19.x`, `react-dom ^19.x`) | Modern functional components, hooks, clean state |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite ^4.x`) | Native CSS-first config (`@import "tailwindcss";`), utility-first classes |
| **Language** | JavaScript (ESNext / JSX) | Strict linting, modular ESM exports/imports |
| **Routing** | React Router (`react-router-dom`) | Declarative navigation, nested layouts, path-based views |
| **Icon Library** | Installed Project Icon Library | Use existing `@lordicon/react` or project standard; maintain consistent size and visual weight; no random emojis |
| **Charting Library** | Lightweight Charting (e.g., Chart.js / Recharts) | Clean, responsive, performant visualization for sales trends |
| **Responsive Target** | Mobile (<768px), Tablet (768px–1024px), Desktop (>1024px) | Mobile-first layouts, adaptive tables, collapsible sidebars, touch drawers |

---

## 3. Architecture & Directory Blueprint

The project follows a **Feature-Oriented Architecture**. Business logic remains co-located with its respective domain feature, while universal primitives reside in shared directories.

```text
src/
├── assets/                  # Static assets (images, logos, SVGs)
├── components/
│   ├── layout/              # App shell components
│   │   ├── AdminLayout.jsx  # Main container wrapping sidebar, header, content
│   │   ├── Header.jsx       # Header bar with search, quick actions, cart trigger
│   │   ├── Sidebar.jsx      # Navigation links, logo, collapsed/mobile handling
│   │   └── MobileNav.jsx    # Bottom/drawer navigation for small screens
│   └── ui/                  # Reusable, domain-agnostic UI primitives
│       ├── Badge.jsx        # Status tags (In Stock, Low, Out of Stock, Paid, etc.)
│       ├── Button.jsx       # Button with variants (primary, secondary, danger, ghost)
│       ├── Card.jsx         # Surface container with consistent border and shadow
│       ├── ConfirmDialog.jsx# Modal for destructive action confirmation
│       ├── Drawer.jsx       # Right-side or bottom sliding drawer
│       ├── EmptyState.jsx   # Informative empty views with actionable buttons
│       ├── Input.jsx        # Standard form input with labels and error states
│       ├── LoadingState.jsx # Spinners, skeletons, and loading indicators
│       ├── Modal.jsx        # Accessible dialog wrapper
│       ├── Select.jsx       # Dropdown selection component
│       └── Table.jsx        # Standardized responsive table wrapper
├── constants/
│   ├── navigation.js        # Route definitions and sidebar links
│   ├── orderStatus.js       # Status keys, labels, badge variants
│   ├── paymentMethods.js    # Cash, Online payment definitions
│   └── stockStatus.js       # Stock thresholds, indicators, labels
├── data/
│   └── mock/                # Minimal, realistic seed datasets
│       ├── mockProducts.js  # Sample catalog data
│       ├── mockOrders.js    # Seed order records
│       └── mockInventory.js # Initial stock ledger entries
├── features/
│   ├── cart/                # POS cart & checkout feature
│   │   ├── components/      # CartDrawer, CartItem, CartSummary, CheckoutModal
│   │   ├── context/         # CartContext & provider
│   │   └── hooks/           # useCart hook
│   ├── dashboard/           # Analytics & KPI feature
│   │   ├── components/      # StatCard, SalesChart, RecentOrdersTable, LowStockAlerts
│   │   └── hooks/           # useDashboardStats hook
│   ├── inventory/           # Stock management feature
│   │   ├── components/      # InventoryTable, StockAdjustModal, StockHistoryList
│   │   └── hooks/           # useInventory hook
│   ├── orders/              # Orders ledger & receipts
│   │   ├── components/      # OrdersTable, OrderFilter, OrderDetailsDrawer, OrderReceipt
│   │   └── hooks/           # useOrders hook
│   └── products/            # Product catalog management
│       ├── components/      # ProductGrid, ProductTable, ProductCard, ProductFormModal
│       └── hooks/           # useProducts hook
├── hooks/                   # Global utility hooks (useMediaQuery, useLocalStorage, useDebounce)
├── pages/                   # Top-level route views
│   ├── DashboardPage.jsx
│   ├── ProductsPage.jsx
│   ├── InventoryPage.jsx
│   ├── OrdersPage.jsx
│   └── NotFoundPage.jsx
├── routes/
│   └── AppRoutes.jsx        # Centralized router configuration
├── services/                # Decoupled data access / API layer
│   ├── dashboard.service.js
│   ├── inventory.service.js
│   ├── order.service.js
│   ├── product.service.js
│   └── storage.service.js   # Local storage / caching layer
├── utils/                   # Pure calculation & formatting utilities
│   ├── currency.js          # Format price/currency with locale
│   ├── date.js              # Date and timestamp formatters
│   ├── idGenerator.js       # Unique Order ID & SKU generators
│   └── posCalculations.js   # Cart, order, stock, and dashboard math
├── App.jsx                  # App-level providers and router mount
├── index.css                # Tailwind CSS v4 entry point
└── main.jsx                 # React root mount
```

---

## 4. Core Modules & Feature Specifications

### 4.1 Dashboard
* **Purpose:** High-level executive overview of sales velocity, inventory health, and operational KPIs.
* **KPI Metrics:**
  * Total Sales (cumulative revenue)
  * Today's Sales (revenue generated during current calendar date)
  * Total Orders count
  * Average Order Value (AOV = Total Sales / Total Orders)
  * Total Products in catalog
  * Low Stock Products count
  * Out-of-Stock Products count
* **Visual Components:**
  * **Sales Graph:** Responsive line/bar chart displaying daily/weekly revenue trends.
  * **Recent Orders Widget:** Concise table showing latest transactions with click-to-view details.
  * **Top Selling Products:** Ranked list of high-velocity items by quantity sold.
  * **Low Stock Alerts Panel:** Real-time warning cards indicating urgent reorder requirements.
* **Architectural Rule:** Reusable KPI card components. No hardcoded statistics—all values calculated dynamically via `dashboard.service.js` and `posCalculations.js`.

---

### 4.2 Products
* **Purpose:** Complete catalog management and direct POS item selection.
* **Capabilities:**
  * Search by product name, SKU, or category.
  * Filter by category and stock availability status.
  * Sort by price (low/high), name (A-Z), and stock quantity.
  * View detailed product metadata (image, SKU, category, price, stock quantity, status).
  * Add new product with validated inputs (name, price, stock, SKU, category, image URL).
  * Edit existing product details.
  * Delete product with safety confirmation modal.
  * "Add to Cart" action with immediate stock boundary validation.
* **UI Architecture:** Adaptive layout:
  * Desktop: Toggleable views between compact grid (`ProductCard`) and data-rich table (`ProductTable`).
  * Mobile/Tablet: Touch-friendly cards with fast-action buttons.
* **Stock Badging:** Dynamic badge rendering according to stock thresholds:
  * `In Stock` (Green)
  * `Low Stock` (Amber / Warning)
  * `Out of Stock` (Red / Destructive)

---

### 4.3 Cart & POS Checkout
* **Global Access:** Cart trigger with dynamic item counter badge permanently located in the top navigation header.
* **Cart Drawer (Right-side slide-over):**
  * Retains state during navigation across any route.
  * Lists selected items with image, title, unit price, line total.
  * Stepper controls (`+` / `-`) for instant quantity changes.
  * Delete/remove button per line item.
  * Clear cart button.
  * Financial Breakdown:
    * Subtotal
    * Configurable Tax (e.g., standard sales tax %)
    * Configurable Discount
    * Grand Total
* **POS Business Rules & Checkout Flow:**
  1. Items with zero stock cannot be added to cart.
  2. Cart quantity cannot exceed current available stock.
  3. Clicking `Checkout` opens the Payment Modal.
  4. Payment method selection is mandatory:
     * **Cash** (with tender amount and change calculation)
     * **Online Payment** (card/digital terminal confirmation)
  5. Upon confirmation:
     * Generate unique Order ID (e.g., `ORD-YYYYMMDD-XXXX`).
     * Create order record and persist to order storage.
     * Decrement inventory quantities in inventory/product state.
     * Log inventory transaction history (`SALE`).
     * Empty the cart.
     * Present success confirmation dialog with printable receipt view.
     * Automatically refresh dashboard and order statistics.

---

### 4.4 Inventory Management
* **Purpose:** Auditing, tracking, and adjusting warehouse/shelf inventory.
* **Data Fields:** SKU, Product Name, Category, Current Quantity, Low-stock Threshold, Stock Status, Last Adjusted Date.
* **Stock Status Rules:**
  * `In Stock`: Quantity > Low-stock Threshold.
  * `Low Stock`: Quantity <= Low-stock Threshold and Quantity > 0.
  * `Out of Stock`: Quantity === 0.
* **Stock Adjustment Workflow:**
  * Dedicated modal supporting manual stock additions (Restock) or reductions (Damage/Write-off/Audit Correction).
  * Rejection of negative stock quantities.
  * Every adjustment generates an entry in the **Inventory History Log** (timestamp, type, quantity delta, reason, adjusted by).

---

### 4.5 Orders
* **Purpose:** Comprehensive transactional history and audit trail.
* **Order Record Schema:**
  ```javascript
  {
    id: "ORD-20261005-0012",
    createdAt: "2026-10-05T14:32:00Z",
    customer: { name: "Walk-in Customer", contact: "" },
    items: [
      { productId: "p-101", name: "Organic Coffee", price: 12.50, quantity: 2, subtotal: 25.00 }
    ],
    pricing: {
      subtotal: 25.00,
      tax: 2.50,
      discount: 0.00,
      total: 27.50
    },
    payment: {
      method: "Cash", // "Cash" | "Online Payment"
      status: "Paid",
      tendered: 30.00,
      change: 2.50
    },
    status: "Completed" // "Completed" | "Refunded" | "Cancelled"
  }
  ```
* **Capabilities:** Search by Order ID/Customer, filter by status and payment method, sort by date/total, and inspect full details in an `OrderDetailsDrawer` with a receipt print option.

---

## 5. Data Architecture & Business Calculations

To prevent data drift and spaghetti logic, all calculations are pure functions kept in `utils/posCalculations.js`:

* `calculateCartTotals(items, taxRate, discount)`
* `calculateOrderTotal(orderItems)`
* `calculateStockStatus(quantity, threshold)`
* `calculateDashboardStats(orders, products, inventory)`
* `calculateSalesSummary(orders, timeFrame)`

### State Isolation Boundaries:
* **UI State:** Modal visibility, drawer toggles, active filter selections, pagination.
* **Cart State:** Global context (`CartContext`), persistent across navigation.
* **Product & Inventory State:** Synchronized repository tracking catalog items and live stock counts.
* **Order State:** Immutable transactional log created upon completed checkouts.

---

## 6. API Readiness & Service Layer

The UI never communicates with raw storage or hardcoded URLs directly. Every request flows through the service abstraction layer:

```
[UI Component / Hook]
        │
        ▼
[Feature Service (e.g. product.service.js)]
        │
        ▼
[Storage/API Adapter (Local Storage / Mock Adapter / Axios / Fetch)]
```

* **Transition Path:** When switching to live backend APIs, only the `services/*.service.js` implementations change; no UI component needs rewrites.
* **Network Simulators:** Services include async contracts (`Promise`) simulating real-world latency, error responses, and empty states.

---

## 7. Mock Data Governance

1. **Dedicated Directory:** All mock datasets reside in `src/data/mock/`.
2. **Minimal & Realistic:** Keep seed records small (e.g., 8–12 representative products across 3–4 categories, 5–10 past orders).
3. **No UI Hardcoding:** Components must never contain inline fake mock data arrays.
4. **Empty State Fidelity:** If no data exists or an API call returns empty, display informative, styled `EmptyState` components instead of faking data inside views.

---

## 8. Code Quality & Strict Development Rules

### 8.1 200-Line Maximum File Limit
* **Rule:** No source code file (`.jsx`, `.js`) should exceed **200 lines**.
* **Enforcement Strategy:**
  * Decompose monolithic views into subcomponents (`StatCard`, `OrderRow`, `ProductFilters`).
  * Extract complex state transitions into custom hooks (`useProductFilters`, `useCartSummary`).
  * Extract static column definitions, table configurations, and schemas into constants.
  * Place math and business logic into utility modules.

### 8.2 Component Reusability
* Reusable components in `src/components/ui/` must handle common states: loading, disabled, hover, active, focus-visible.
* No duplication of basic UI elements (buttons, form inputs, modal dialogs, badges).

### 8.3 Tailwind CSS v4 Styling Standards
* Adhere to Tailwind v4 CSS-first engine.
* Maintain clean spacing scale (`p-4`, `p-6`, `gap-4`, `gap-6`).
* Maintain clean slate/neutral color system with purposeful semantic colors:
  * Primary: Deep indigo/slate for POS credibility (`indigo-600`, `slate-900`)
  * Success: Emerald (`emerald-600`) for payments and in-stock badges
  * Warning: Amber (`amber-500`) for low stock
  * Danger: Rose/Red (`rose-600`) for stock out, deletions, refunds
* Avoid gratuitous animations and excessive gradients. Keep UI snappy, crisp, and high-contrast for POS environments.

### 8.4 POS Business Integrity Invariants
1. Product cannot be added to cart if stock is zero.
2. Cart item quantity cannot exceed remaining stock.
3. Quantity cannot be decremented below 1 in the cart (decrementing from 1 triggers remove).
4. No negative inventory quantities allowed under any circumstance.
5. Every checkout requires selecting a valid payment method.
6. Order ID generation must be unique.
7. Orders ledger is immutable; stock corrections must be handled via Inventory Adjustments.
8. Dashboard KPI metrics must be calculated derived state, not separate unlinked numbers.

---

## 9. Verification & Pre-Flight Checklist

Before declaring any feature complete:

- [ ] **Build Validation:** Run `npm run build` with zero errors and no bundle warnings.
- [ ] **Line Count Audit:** Verify that no file in `src/` exceeds 200 lines.
- [ ] **Responsive Verification:** Test layout behavior at 375px (Mobile), 768px (Tablet), and 1280px+ (Desktop).
- [ ] **POS Workflow Loop:**
  - Add items to cart -> verify stock cap enforcement.
  - Open cart drawer -> change quantities -> verify line items & totals.
  - Complete checkout with Cash -> verify change math -> confirm order.
  - Complete checkout with Online -> confirm order.
  - Verify inventory was decremented appropriately.
  - Verify order appears in Orders list with correct items and payment method.
  - Verify Dashboard KPIs and charts reflect the new order.
- [ ] **Empty State Check:** Test products, inventory, and orders with empty lists to ensure clean, actionable empty states appear.
- [ ] **Console Inspection:** Zero unhandled errors, warnings, or missing React key props in browser console.
