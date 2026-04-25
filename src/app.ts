import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import Cors_Settings from './config/cors.js';
import { swaggerSpec } from './config/swagger.config.js';
import logger, { morganStream } from './utils/logger.utils.js';
// import { registerRoutes } from './routes/routes.js';
import { registerRoutes } from './routes/routes.js';
import { initializeFileHandler, UPLOAD_CONFIG } from './utils/fileHandler.utils.js';
import { toWIB } from './utils/timezone.utils.js';  // ✅ Tambah import untuk konversi zona waktu

const app: Application = express();

// ✅ Initialize file handler on app startup
initializeFileHandler();

// ✅ Serve static files from uploads directory, but access via /storage
// app.use('/storage', express.static(path.join(process.cwd(), UPLOAD_CONFIG.BASE_DIR)));

app.use('/storage/uploads', express.static(path.join(process.cwd(), UPLOAD_CONFIG.BASE_DIR)));

// Security middleware
app.use(helmet());

// CORS - Allow credentials for cookies
app.use(cors({
  ...Cors_Settings,
  credentials: true,
}));

// Cookie parser
app.use(cookieParser());

// HTTP request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// ✅ TAMBAH MIDDLEWARE GLOBAL UNTUK KONVERSI ZONA WAKTU (UTC ke WIB) DI SEMUA RESPONSE
// app.use((req: Request, res: Response, next: NextFunction) => {
//   const originalJson = res.json;
//   res.json = function (body: any) {
//     // Helper rekursif untuk konversi Date di object/array
//     const convertDates = (obj: any): any => {
//       if (obj === null || obj === undefined) return obj;
//       if (obj instanceof Date) return toWIB(obj);
//       if (Array.isArray(obj)) return obj.map(convertDates);
//       if (typeof obj === 'object') {
//         const converted: any = {};
//         for (const key in obj) {
//           if (obj.hasOwnProperty(key)) {
//             converted[key] = convertDates(obj[key]);
//           }
//         }
//         return converted;
//       }
//       return obj;
//     };

//     // Konversi body response
//     const convertedBody = convertDates(body);
//     return originalJson.call(this, convertedBody);
//   };
//   next();
// });

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'JR Konveksi API Docs',
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  logger.debug('Health check endpoint accessed');
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Register all API routes
registerRoutes(app, '/api');

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    ip: req.ip,
  });

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

export default app;