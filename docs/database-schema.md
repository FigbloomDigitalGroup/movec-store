markdown
# Database Schema

## Entity‑Relationship Overview

The schema uses **PostgreSQL** with Prisma ORM. Below is a textual ER diagram showing main entities and relationships.
User 1──* Address
User 1──* Order
User 1──* Review
User 1──* Cart
User 1──* WishlistItem
User 1──* Notification
User 1──* InstallationRequest
User ── Role (via UserRole)

Role 1──* UserRole
Permission 1──* RolePermission
Role 1──* RolePermission

Product ── Category
Product ── Brand
Product 1──* ProductImage
Product 1──* Inventory
Product 1──* OrderItem
Product 1──* Review
Product 1──* CartItem
Product 1──* WishlistItem
Product 1──* PromotionProduct

Category 1──* Category (self-referencing for subcategories)
Brand 1──* Product

Order 1──* OrderItem
Order 1──* Payment
Order 1──* Shipping
Order 1──1 Invoice
Order 1──* OrderStatusHistory

Payment 1──* Transaction (M-Pesa/Stripe/PayPal logs)
Coupon 1──* Order

Inventory 1──* InventoryHistory
Warehouse 1──* Inventory

InstallationService 1──* InstallationRequest
Technician 1──* TechnicianAssignment
InstallationRequest 1──1 TechnicianAssignment

SupportTicket 1──* TicketMessage
FAQCategory 1──* FAQ

Promotion 1──* PromotionProduct
AuditLog linked to User action
Session (refresh tokens)

text

## Core Tables & Columns (Prisma models)
*Only key fields listed; complete definitions in Prisma schema.*

### User
- id, email (unique), passwordHash, firstName, lastName, phone, avatarUrl, isEmailVerified, isActive, isSuspended, createdAt, updatedAt

### Role
- id, name (ADMIN, CUSTOMER, TECHNICIAN, STAFF)

### Permission
- id, resource, action (e.g., "product:create")

### Address
- id, userId, type (SHIPPING/BILLING), line1, line2, city, state, postalCode, country, isDefault

### Product
- id, name, slug (unique), description, shortDescription, sku (unique), price, compareAtPrice, costPrice, isActive, isFeatured, brandId, metaTitle, metaDescription

### Category
- id, name, slug (unique), description, imageUrl, parentId (nullable)

### Brand
- id, name, slug (unique), logoUrl

### ProductImage
- id, productId, url, alt, sortOrder, isPrimary

### Inventory
- id, productId, warehouseId, quantity, reservedQuantity, lowStockThreshold

### Warehouse
- id, name, location

### InventoryHistory
- id, inventoryId, change, reason (STOCK_IN, SALE, RETURN, ADJUSTMENT), reference, createdAt

### Cart
- id, userId (unique), createdAt

### CartItem
- id, cartId, productId, quantity

### WishlistItem
- id, userId, productId, createdAt

### Order
- id, orderNumber (unique), userId, status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED), subtotal, shippingCost, taxAmount, discountAmount, total, couponId, shippingAddressId, billingAddressId, notes

### OrderItem
- id, orderId, productId, productNameSnapshot, productSkuSnapshot, priceSnapshot, quantity

### Payment
- id, orderId, method (MPESA, STRIPE, PAYPAL, BANK_TRANSFER), status (PENDING, COMPLETED, FAILED, REFUNDED), amount, currency, transactionReference, paidAt

### Transaction
- id, paymentId, provider, requestPayload, responsePayload, status, createdAt

### Shipping
- id, orderId, trackingNumber, carrier, estimatedDelivery, shippedAt, deliveredAt

### OrderStatusHistory
- id, orderId, status, changedBy, changedAt

### Coupon
- id, code (unique), discountType (PERCENTAGE, FIXED), discountValue, minOrderAmount, maxUsage, usedCount, startsAt, expiresAt, isActive

### Review
- id, userId, productId, rating (1-5), title, body, isApproved, createdAt

### InstallationService
- id, name, description, basePrice, durationMinutes

### InstallationRequest
- id, userId, serviceId, preferredDate, status (PENDING, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED), notes, addressId, finalPrice

### Technician
- id, userId (FK to User with TECHNICIAN role), specialisation, isAvailable

### TechnicianAssignment
- id, requestId, technicianId, assignedAt, completedAt

### SupportTicket
- id, userId, subject, status (OPEN, IN_PROGRESS, RESOLVED, CLOSED), priority (LOW, MEDIUM, HIGH, URGENT), createdAt

### TicketMessage
- id, ticketId, senderId, message, isStaffReply, createdAt

### FAQ
- id, question, answer, categoryId, sortOrder

### Promotion
- id, name, description, discountType, discountValue, startsAt, endsAt, isActive

### AuditLog
- id, userId, action, entityType, entityId, oldValues, newValues, ipAddress, createdAt

### Session
- id, userId, refreshToken, expiresAt, createdAt (for refresh token rotation)

### Notification
- id, userId, type, title, message, isRead, createdAt
Indexing Strategy
User: email unique index

Product: slug unique, categoryId index, brandId index, isActive index, price index

Order: orderNumber unique, userId index, status index

Cart: userId unique

WishlistItem: userId, productId composite

Review: userId, productId composite

InstallationRequest: userId index, status index

SupportTicket: userId index, status index

Session: refreshToken index, userId index

Coupon: code unique index

Inventory: productId, warehouseId composite unique

Relationship Summary
One‑to‑many are default Prisma relations.

Many‑to‑many handled via implicit join tables (e.g., ProductCategory, PromotionProduct, UserRole) or explicit (RolePermission).

All foreign keys have onDelete: Cascade or Restrict as appropriate.

text

---

