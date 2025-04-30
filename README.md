# Shopping Cart System API

A robust and scalable shopping cart system API built with NestJS, MongoDB, and Redis. This API allows multiple users to purchase products from a shared inventory while efficiently handling concurrent operations.

### Swagger Documentation

Click here to explore the interactive Swagger UI for detailed endpoint descriptions, request/response schemas, and testing:  
[**Swagger Docs**](https://shopping-api-1-3s4u.onrender.com/docs)

## Tech Stack

- **Node.js**: JavaScript runtime
- **NestJS**: Progressive Node.js framework
- **Mongoose**: MongoDB object modeling for Node.js
- **MongoDB**: NoSQL database
- **Redis**: In-memory data structure store used for caching

## Features

### Product Management

- Create, read, update, and delete products
- Maintain product inventory with stock quantities
- Filter products

### Cart Management

- Add/remove items from user carts
- Update item quantities
- Calculate total amounts

### Order Processing

- Create orders from user carts, pay with paystack link
- Update order status
- Prevent overselling through stock reservation
- Cancel orders with automatic stock release

### Transaction Processing with Paystack Webhook

- Webhook verification of order payment

### Performance Optimizations

- Redis caching for frequently accessed data
- Optimistic concurrency control for handling race conditions
- MongoDB transactions for maintaining data consistency

### NOTE

- Docker is used for redis
- If docker redis version is above 5 remove or comment out password when creating instance

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MongoDB (v4.4 or later)
- Redis (v6 or later)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd shopping-cart-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:

   ```
   MONGO_URL="mongo db url"
   JWT_EXPIRY="jwt expiry day"
   PORT="e.g 4000"
   MAIL_USER= "smtp mail use name"
   MAIL_PASSWORD= "smtp password"
   MAIL_PORT="smtp port"
   MAIL_HOST="e.g smtp.gmail.com"
   PAYSTACK_SK_KEY="paystack payment secret key"
   PAYSTACK_BASE_URL="paystack base url e.g. https://api.paystack.co"
   REDIS_URL="redis url e.g 127.0.0.1 or localhost"
   REDIS_PASSWORD="redis password"
   REDIS_PORT="redis port e.g 6379 for docker redis"
   ```

4. Start MongoDB and Redis:

   ```bash
   # Start MongoDB (using your preferred method)
   # Example for MongoDB Community Edition:
   mongod

   # Start Redis
   redis-server
   ```

5. Run the application:

   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Products

- `GET /products` - Get all products with pagination
- `GET /products/:id` - Get a product by ID
- `POST /products` - Create a new product
- `PATCH /products/:id` - Update a product
- `PATCH /products/:id/stock` - Update product stock
- `DELETE /products/:id` - Delete a product

### Carts

- `GET /carts/:userId` - Get cart by user ID
- `POST /carts` - Add item to cart
- `PATCH /carts` - Update cart item quantity
- `DELETE /carts/:userId/items/:productId` - Remove item from cart
- `DELETE /carts/:userId` - Clear cart

### Orders

- `POST /orders` - Create a new order from cart
- `GET /orders/user/:userId` - Get all orders for a user
- `GET /orders/:id` - Get order by ID

## Technical Design Decisions

### Concurrency Control

To handle concurrent cart operations and prevent race conditions:

1. **Optimistic Locking**: The system uses conditional updates to detect and handle concurrent modifications.
2. **Retry Mechanism**: Failed updates due to concurrency issues are retried automatically.

### Stock Management

To prevent overselling:

1. **Stock Reservation**: When an order is created, stock is immediately reserved.
2. **Transaction Support**: MongoDB transactions ensure atomicity in multi-document operations.
3. **Stock Release**: If an order is canceled, the stock is automatically returned to inventory.

### Caching Strategy

Redis caching is implemented to improve performance:

1. **Product Caching**: Frequently accessed products are cached to reduce database load.
2. **Cart Caching**: User carts are cached for faster access.
3. **Order Caching**: Recent orders and statistics are cached.
4. **Cache Invalidation**: Caches are automatically invalidated when underlying data changes.

## Authenication

1. User authentication and authorization are handled by a separate service.
2. Product prices don't change frequently.
3. Each user can have only one active cart.
4. Stock quantities are always non-negative integers.
