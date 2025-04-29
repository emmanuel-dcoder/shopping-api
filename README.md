# Shopping Cart System API

A robust and scalable shopping cart system API built with NestJS, MongoDB, and Redis. This API allows multiple users to purchase products from a shared inventory while efficiently handling concurrent operations.

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
- Search and filter products

### Cart Management

- Add/remove items from user carts
- Update item quantities
- Calculate total amounts

### Order Processing

- Create orders from user carts
- Update order status
- Prevent overselling through stock reservation
- Cancel orders with automatic stock release

### Performance Optimizations

- Redis caching for frequently accessed data
- Database indexing for faster queries
- Optimistic concurrency control for handling race conditions
- MongoDB transactions for maintaining data consistency

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
   MONGODB_URI=mongodb://localhost/shopping-cart
   REDIS_HOST=localhost
   REDIS_PORT=6379
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

### Seed Data

To seed the database with sample products:

```bash
npm run seed
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
- `PATCH /orders/:id/status` - Update order status
- `GET /orders/stats` - Get order statistics

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

## Assumptions

1. User authentication and authorization are handled by a separate service.
2. Product prices don't change frequently.
3. Each user can have only one active cart.
4. Stock quantities are always non-negative integers.

## Scaling Considerations

1. **Horizontal Scaling**: The stateless API can be deployed across multiple servers.
2. **Database Sharding**: MongoDB collection sharding for large datasets.
3. **Redis Cluster**: For handling high cache loads.
4. **Read Replicas**: MongoDB read replicas for read-heavy workloads.

## Future Improvements

1. Implement user authentication and authorization
2. Add payment processing integration
3. Implement product categories and search functionality
4. Add inventory alerts for low stock
5. Implement webhooks for order status changes
6. Add support for product variants
