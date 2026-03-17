import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT, 10) || 3000,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  queue: {
    host: process.env.QUEUE_HOST,
    port: parseInt(process.env.QUEUE_PORT, 10),
    password: process.env.QUEUE_PASSWORD,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.REDIS_TTL, 10),
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60000,
    limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
    loginTtl: parseInt(process.env.THROTTLE_LOGIN_TTL, 10) || 60000,
    loginLimit: parseInt(process.env.THROTTLE_LOGIN_LIMIT, 10) || 5,
    registerTtl: parseInt(process.env.THROTTLE_REGISTER_TTL, 10) || 3600000,
    registerLimit: parseInt(process.env.THROTTLE_REGISTER_LIMIT, 10) || 3,
  },
  fallbackLanguage: process.env.FALLBACK_LANGUAGE,
  corsOrigin: process.env.CORS_ORIGIN,
  apiPrefix: process.env.API_PREFIX,
  apiVersion: process.env.API_VERSION,
}));
