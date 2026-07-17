# API Design

Base URL: `/api/v1`

## Conventions
- RESTful, JSON request/response.
- Pagination: `?page=1&limit=20`.
- Sorting: `?sortBy=price&order=desc`.
- Filtering: `?category=starlink&brand=spacex&minPrice=100&maxPrice=500`.
- Authentication: Bearer token in `Authorization` header.
- All endpoints return `{ success: boolean, data: any, message?: string, meta?: { page, limit, total } }`.
- Errors follow RFC 7807 with `{ success: false, error: { code, message, details } }`.

## Auth Routes
| Method | Endpoint              | Description                | Access      |
|--------|-----------------------|----------------------------|-------------|
| POST   | /auth/register        | Register new user          | Public      |
| POST   | /auth/login           | Login, returns tokens      | Public      |
| POST   | /auth/refresh         | Refresh access token       | Public      |
| POST   | /auth/logout          | Invalidate refresh token   | Auth        |
| POST   | /auth/forgot-password | Send reset email           | Public      |
| POST   | /auth/reset-password  | Reset password with token  | Public      |
| POST   | /auth/verify-email    | Verify email token         | Public      |

## User & Profile
| Method | Endpoint            | Description               | Access          |
|--------|---------------------|---------------------------|-----------------|
| GET    | /users/me           | Get current user profile  | Auth            |
| PATCH  | /users/me           | Update profile            | Auth            |
| PUT    | /users/me/password  | Change password           | Auth            |
| POST   | /users/me/avatar    | Upload avatar             | Auth            |
| GET    | /users/me/addresses | List addresses            | Auth            |
| POST   | /users/me/addresses | Add address               | Auth            |
| PUT    | /users/me/addresses/:id | Update address        | Auth            |
| DELETE | /users/me/addresses/:id | Delete address        | Auth            |
| GET    | /admin/users        | List all users            | Admin           |
| POST   | /admin/users        | Create user               | Admin           |
| GET    | /admin/users/:id    | Get user details          | Admin           |
| PATCH  | /admin/users/:id    | Update user, roles, suspend| Admin           |
| DELETE | /admin/users/:id    | Soft delete / deactivate  | Admin           |

## Products
| Method | Endpoint                | Description                  | Access      |
|--------|-------------------------|------------------------------|-------------|
| GET    | /products               | List products (public)       | Public      |
| GET    | /products/:slug         | Single product               | Public      |
| GET    | /products/:slug/reviews | Product reviews              | Public      |
| GET    | /admin/products         | List (admin)                 | Admin       |
| POST   | /admin/products         | Create product               | Admin       |
| PATCH  | /admin/products/:id     | Update product               | Admin       |
| DELETE | /admin/products/:id     | Delete product               | Admin       |
| POST   | /admin/products/:id/images | Upload images            | Admin       |
| DELETE | /admin/products/images/:id | Delete image              | Admin       |

## Categories & Brands
| Method | Endpoint           | Description       | Access      |
|--------|--------------------|-------------------|-------------|
| GET    | /categories        | List categories   | Public      |
| POST   | /admin/categories  | Create category   | Admin       |
| PATCH  | /admin/categories/:id | Update        | Admin       |
| DELETE | /admin/categories/:id | Delete        | Admin       |
| GET    | /brands            | List brands       | Public      |
| POST   | /admin/brands      | Create brand      | Admin       |
| PATCH  | /admin/brands/:id  | Update brand      | Admin       |
| DELETE | /admin/brands/:id  | Delete brand      | Admin       |

## Inventory
| Method | Endpoint                     | Description               | Access      |
|--------|------------------------------|---------------------------|-------------|
| GET    | /admin/inventory             | List inventory levels     | Admin       |
| GET    | /admin/inventory/:productId  | Single product inventory  | Admin       |
| POST   | /admin/inventory/stock-in    | Stock in                  | Admin       |
| POST   | /admin/inventory/stock-out   | Stock out (adjustment)    | Admin       |
| GET    | /admin/inventory/history     | Inventory history         | Admin       |

## Cart
| Method | Endpoint        | Description          | Access      |
|--------|-----------------|----------------------|-------------|
| GET    | /cart           | Get cart             | Auth        |
| POST   | /cart/items     | Add item to cart     | Auth        |
| PATCH  | /cart/items/:id | Update quantity      | Auth        |
| DELETE | /cart/items/:id | Remove item          | Auth        |

## Wishlist
| Method | Endpoint          | Description          | Access      |
|--------|-------------------|----------------------|-------------|
| GET    | /wishlist         | Get wishlist         | Auth        |
| POST   | /wishlist         | Add to wishlist      | Auth        |
| DELETE | /wishlist/:id     | Remove from wishlist | Auth        |

## Checkout & Orders
| Method | Endpoint              | Description                       | Access      |
|--------|-----------------------|-----------------------------------|-------------|
| POST   | /checkout             | Start checkout (validate stock)   | Auth        |
| POST   | /orders               | Place order (after payment init)  | Auth        |
| GET    | /orders               | Customer's orders                 | Auth        |
| GET    | /orders/:orderNumber  | Order details                     | Auth/Admin  |
| PATCH  | /orders/:orderNumber/cancel | Cancel order (if allowed)   | Auth        |
| GET    | /admin/orders         | All orders                        | Admin       |
| PATCH  | /admin/orders/:id/status | Update status                  | Admin       |

## Payments
| Method | Endpoint                              | Description                        | Access      |
|--------|---------------------------------------|------------------------------------|-------------|
| POST   | /payments/mpesa/initiate              | Initiate M-Pesa STK Push          | Auth        |
| POST   | /payments/mpesa/callback              | M-Pesa result callback             | Public      |
| POST   | /payments/stripe/create-intent        | Create Stripe PaymentIntent        | Auth        |
| POST   | /payments/stripe/webhook              | Stripe webhook                     | Public      |
| POST   | /payments/paypal/create-order         | Create PayPal order                | Auth        |
| POST   | /payments/paypal/capture/:orderId     | Capture PayPal payment             | Auth        |
| POST   | /payments/bank-transfer/confirm       | Manual bank transfer confirmation  | Admin       |
| GET    | /admin/transactions                   | All transactions                   | Admin       |

## Installation
| Method | Endpoint                              | Description                     | Access      |
|--------|---------------------------------------|---------------------------------|-------------|
| GET    | /installation-services                | List services                   | Public      |
| POST   | /installation-requests                | Submit request                  | Auth        |
| GET    | /installation-requests/my             | Customer's requests             | Auth        |
| GET    | /admin/installation-requests          | All requests                    | Admin       |
| PATCH  | /admin/installation-requests/:id      | Update request (assign tech)    | Admin       |
| GET    | /technicians                          | List technicians                | Admin       |
| POST   | /admin/technicians                    | Add technician                  | Admin       |

## Support
| Method | Endpoint               | Description            | Access      |
|--------|------------------------|------------------------|-------------|
| GET    | /faqs                  | List FAQs              | Public      |
| POST   | /admin/faqs            | Create FAQ             | Admin       |
| GET    | /tickets               | My tickets             | Auth        |
| POST   | /tickets               | Create ticket          | Auth        |
| GET    | /tickets/:id           | Ticket detail          | Auth/Admin  |
| POST   | /tickets/:id/messages  | Add message            | Auth/Admin  |
| PATCH  | /admin/tickets/:id     | Update ticket status   | Admin       |

## Reviews
| Method | Endpoint                 | Description          | Access      |
|--------|--------------------------|----------------------|-------------|
| POST   | /products/:slug/reviews  | Submit review        | Auth        |
| GET    | /admin/reviews           | Moderate reviews     | Admin       |
| PATCH  | /admin/reviews/:id       | Approve/reject       | Admin       |

## Notifications
| Method | Endpoint                  | Description           | Access      |
|--------|---------------------------|-----------------------|-------------|
| GET    | /notifications            | My notifications      | Auth        |
| PATCH  | /notifications/:id/read   | Mark as read          | Auth        |
| POST   | /admin/notifications/send | Send custom notif.    | Admin       |

## Reports (Admin)
| Method | Endpoint               | Description                |
|--------|------------------------|----------------------------|
| GET    | /reports/sales         | Sales summary & charts     |
| GET    | /reports/inventory     | Inventory report           |
| GET    | /reports/customers     | Customer analytics         |
| GET    | /reports/installations | Installation stats         |

All report endpoints support query params for date range: `?from=2026-01-01&to=2026-07-16`.

## Status Codes
- 200 OK
- 201 Created
- 400 Bad Request (validation)
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict (e.g., duplicate)
- 422 Unprocessable Entity
- 429 Too Many Requests
- 500 Internal Server Error