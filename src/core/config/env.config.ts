import * as dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: process.env.port,
  database: {
    mongo_url: process.env.MONGO_URL,
  },
  server: {
    port: parseInt(process.env.SERVER_PORT || '4000', 10),
    environment: process.env.NODE_ENV || 'development',
  },
  jwt: {
    secret: process.env.SECRET_KEY,
    expiry: process.env.JWT_EXPIRY,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
  },
  mail: {
    host: process.env.MAIL_HOST,
    user: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    port: process.env.MAIL_PORT,
  },
  paystack: {
    url: process.env.PAYSTACK_BASE_URL,
    key: process.env.PAYSTACK_SK_KEY,
  },
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
  },
};
