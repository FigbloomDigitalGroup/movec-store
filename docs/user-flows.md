# User Flows

## 1. Customer Journey

### Registration & Authentication
1. Customer lands on homepage → clicks "Register".
2. Fills form (first name, last name, email, phone, password).
3. Receives email verification link.
4. Clicks link → account verified, redirected to login.
5. Logs in → receives access + refresh tokens.
6. Optionally completes profile (avatar, addresses).

### Browsing & Shopping
1. Browses products by category or search.
2. Filters by price, brand, features, availability.
3. Views product details, images, reviews, stock status.
4. Adds product to cart (quantity adjusted based on stock).
5. Can add to wishlist for later.
6. Proceeds to cart → reviews items, applies coupon.
7. Clicks "Checkout".

### Checkout Flow
1. **Checkout step 1:** Select/enter shipping address.
2. **Step 2:** Choose payment method (M-Pesa Paybill, M-Pesa Till Number, or Cash on Delivery).
3. **Step 3:** Review order summary (items, shipping, tax, discount, total).
4. **Step 4 (Paybill/Till):** Paybill/Till number and amount shown → customer pays manually from their phone → optionally enters the M-Pesa confirmation code → order placed as "awaiting payment" until admin confirms it against the M-Pesa statement.
5. **Step 4 (Cash on Delivery):** If the order total is under the deposit threshold, order confirms immediately; otherwise the deposit portion must be paid via Paybill/Till first.
7. On success: order created, inventory decreased (reserved released), confirmation email sent, success page shown with order number.

### Post‑Purchase
1. Customer dashboard: view order history, status tracking.
2. Click on order → detailed view (items, payment, shipping tracking, invoice download).
3. Cancel order if status is PENDING (automatic refund if paid).
4. Download invoice as PDF.

### Installation Booking
1. After purchasing a product requiring installation, or independently, customer visits "Installation Services".
2. Selects service, preferred date, address, notes.
3. Submits request → receives confirmation.
4. Admin schedules, assigns technician.
5. Customer sees status updates: Scheduled → Technician en route → In Progress → Completed.
6. Can rate the installation afterwards.

### Support
1. Customer browses FAQs.
2. If not resolved, creates support ticket (subject, description, priority).
3. Admin/staff replies; customer receives email notification.
4. Conversation continues until resolved.

### Reviews & Ratings
1. After receiving product, customer can write a review (rating 1-5, title, body).
2. Review goes to moderation (optional: auto-approve).
3. Once approved, it appears on product page.

## 2. Admin Flow

### Dashboard
- Overview cards: total sales, orders, customers, revenue today/this month.
- Charts: revenue over time, top selling products, low stock alerts.

### User Management
- View all users, filter by role, status.
- Create new admin/staff/technician.
- Suspend/activate users.
- View user order history.

### Product Management
- Add/edit products with all details, images upload to Cloudinary.
- Assign categories, brands, set pricing, stock.
- Manage inventory: stock in/out, view history, set low stock thresholds.

### Order Management
- View all orders, filter by status, date, customer.
- Update order status (Confirm → Process → Ship with tracking).
- Cancel orders, initiate refunds.
- Confirm manual Paybill/Till payments once seen on the M-Pesa statement.

### Payment & Transactions
- View all transactions.
- Reconcile Paybill/Till payments against the M-Pesa statement.
- Handle disputes/chargebacks.

### Installation Management
- Define installation services and pricing.
- View incoming requests, assign technicians, update status.
- Manage technicians (add, availability).

### Support Management
- Manage FAQs (CRUD).
- View tickets, respond, change status, assign to staff.

### Promotions & Coupons
- Create promotions (percentage/fixed, date range).
- Link promotions to specific products or categories.
- Create coupon codes with usage limits.

### Reports
- Sales report: by product, category, time period, export.
- Inventory report: current stock, movements, low stock.
- Customer report: new registrations, top spenders.
- Installation report: completed, pending, revenue.

### Settings
- General site settings (store name, currency, contact info).
- Notification templates customisation (future).

## 3. Installation Workflow (Detailed)

1. **Service Setup:** Admin creates installation services (e.g., "Starlink Standard Install", "CCTV 4‑Camera Setup") with base price and estimated duration.
2. **Customer Request:** Customer selects service, chooses preferred date/time slot, provides installation address, adds notes.
3. **Internal Review:** Staff reviews request, may contact customer for details (via ticket), then approves/rejects.
4. **Scheduling & Assignment:** Admin/Staff assigns a technician to the approved request, sets scheduled date.
5. **Status Tracking:**
   - PENDING (awaiting review)
   - APPROVED (awaiting scheduling)
   - SCHEDULED (date set, technician assigned)
   - IN_PROGRESS (technician on site)
   - COMPLETED
   - CANCELLED
6. **Technician App (future):** A simple view to see assigned jobs, update status, upload completion photos (optional).
7. **Payment:** Can be charged upfront or after completion; admin can modify final price if extra work needed.

## 4. Payment Flow Details

### M‑Pesa Paybill / Till (manual, admin-confirmed)
1. Customer selects Paybill or Till Number at checkout.
2. Backend returns the business/till number (and, for Paybill, an account number equal to the order number) plus the amount due.
3. Customer pays manually from their phone via Lipa na M-Pesa.
4. Customer optionally submits the M-Pesa confirmation code they received, purely to help reconciliation.
5. Order stays PENDING until an admin checks the actual M-Pesa statement and clicks "Confirm Payment Received" on the order, which moves it to CONFIRMED.

There is no processor callback for either channel — nothing here is trusted until an admin confirms it.

## 5. Notification Triggers

- **Order Placed** → Email to customer, SMS (optional)
- **Payment Received** → Email, SMS
- **Order Shipped** → Email with tracking
- **Order Delivered** → Email, review request
- **Installation Scheduled/Updated** → Email, SMS
- **Support Ticket Updated** → Email
- **New User Registration** → Welcome email, email verification
- **Password Reset** → Email with token