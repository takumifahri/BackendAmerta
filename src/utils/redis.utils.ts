import IORedis from 'ioredis';
import logger from './logger.utils.js';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const Redis: any = (IORedis as any).default ?? IORedis;
    
// Main Redis client
export const redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD || undefined,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: null,
});

redis.on('connect', () => {
    logger.info('Redis connected');
});

redis.on('error', (err: Error) => {
    logger.error('Redis error', { error: err.message });
});

redis.on('close', () => {
    logger.info('Redis connection closed');
});

export default redis;