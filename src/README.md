<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Music Booking API

# Overview

The Music Booking API is a RESTful API designed to manage artist profiles, event listings, and booking transactions for a music event platform. Built with scalability, security, and usability in mind, it allows users to create accounts, browse events, and book tickets while artists can manage their profiles and events. The API is deployed on Render and includes comprehensive documentation via Swagger and Postman.

## Features

1. **Artist Management**:

   - Create and retrieve artist profiles.
   - Artists can log in to manage their events.

2. **Event Management**:

   - Create and list events tied to specific artists.
   - Retrieve event details for booking.

3. **Booking System**:

   - Users can book tickets for events.
   - Tracks booking status (pending, confirmed, cancelled).

4. **User Management**:

   - Non-artist users can register and log in to book events.
   - Distinct from artists for clear role separation.

5. **Authentication**:
   - JWT-based authentication for secure access to protected endpoints.
   - Supports both artist and user logins.

## Technology Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgresSQL with typeORM
- **Cache**: Redis
- **Third Party API**: Paystack, paystack webhook, Exchange rate API
- **Authentication**: JWT (JSON Web Tokens) via `@nestjs/jwt` and `passport-jwt`
- **Validation**: `class-validator` and `class-transformer`
- **API Documentation**: Swagger (`@nestjs/swagger`)
- **Deployment**: Render
- **Version Control**: GitHub

---

## Base URL

The API is hosted at:  
**`https://musicbookingapi.onrender.com`**

## API Documentation

### Swagger Documentation

Explore the interactive Swagger UI for detailed endpoint descriptions, request/response schemas, and testing:  
[**Swagger Docs**](https://musicbookingapi.onrender.com/docs)

## GitHub Repository

The source code is available at:  
[**GitHub Repo**](https://github.com/codewithemmy/fx-trading-api)

---

## Compile and run the project

```bash
#install dependencies
$ npm install

# development
$ npm run start:dev

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Environment Variables

- `MONGO_URL`: MongoDB connection string.
- `PORT`: Server port (default: 5000).
- `TOKEN_EXPIRE_IN`: JWT expiry.
- `SECRET_KEY`: JWT secret key.
- `MAIL_PASSWORD`: mail password.
- `MAIL_USER`: SMTP gmail email or username.
- `MAIL_PORT`: SMTP gmail mail port, usually "465".
- `MAIL_HOST`: SMTP gmail mail host, usually "smtp.gmail.com".

## Endpoints

Below is a summary of the key endpoints. Refer to the Swagger or Postman documentation for full details.

| **Endpoint**                | **Method** | **Description**                                   | **Protected** |
| --------------------------- | ---------- | ------------------------------------------------- | ------------- |
| `api/v1/auth/login`         | POST       | Authenticate a user or artist                     | No            |
| `api/v1/users`              | POST       | Create a new user                                 | No            |
| `api/v1/users`              | GET        | Get all users                                     | Yes (JWT)     |
| `api/v1/users/:id`          | GET        | Get a user by ID                                  | Yes (JWT)     |
| `api/v1/users/profile/me`   | GET        | Get logged-in user profile                        | Yes (JWT)     |
| `api/v1/users/profile/me`   | PATCH      | Update logged-in user profile (excluding email)   | Yes (JWT)     |
| `api/v1/artists`            | POST       | Create a new artist                               | No            |
| `api/v1/artists`            | GET        | Get all artists                                   | No            |
| `api/v1/artists/:id`        | GET        | Get an artist by ID                               | No            |
| `api/v1/artists/profile/me` | GET        | Get logged-in artist profile                      | Yes (JWT)     |
| `api/v1/artists/profile/me` | PATCH      | Update logged-in artist profile (excluding email) | Yes (JWT)     |
| `api/v1/events`             | POST       | Create a new event                                | Yes (JWT)     |
| `api/v1/events`             | GET        | Get all events                                    | No            |
| `api/v1/events/:id`         | GET        | Get an event by ID                                | No            |
| `api/v1/events/:id`         | PATCH      | Update an event                                   | No            |
| `api/v1/events/:id`         | DELETE     | Delete an event                                   | No            |
| `api/v1/bookings`           | POST       | Create a new booking                              | Yes (JWT)     |
| `api/v1/bookings`           | GET        | Get all bookings                                  | Yes (JWT)     |
| `api/v1/bookings/:id`       | GET        | Get a booking by ID                               | Yes (JWT)     |
| `api/v1/bookings/:id`       | PATCH      | Update a booking                                  | Yes (JWT)     |
| `api/v1/bookings/:id`       | DELETE     | Cancel a booking                                  | Yes (JWT)     |

- **Protected Endpoints**: Require a Bearer token in the `Authorization` header, obtained from `/auth/login`.

---

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
