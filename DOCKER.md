# Docker Setup untuk Amerta Backend

## Persyaratan
- Docker Desktop (atau Docker Engine)
- Docker Compose

## Quick Start

### 1. Setup Environment Variables
Copy `.env.example` ke `.env` dan sesuaikan nilai-nilainya:
```bash
cp .env.example .env
```

### 2. Build dan Jalankan dengan Docker Compose
```bash
# Build images dan jalankan semua services
docker-compose up --build

# Jalankan di background
docker-compose up -d --build
```

### 3. Jalankan Prisma Migrations
Di terminal baru, jalankan:
```bash
# Jalankan migration
docker-compose exec app npm run prisma:migrate

# Atau seed database (jika ada seed file)
docker-compose exec app npm run seed
```

## Perintah Berguna

### View Logs
```bash
# Lihat logs aplikasi
docker-compose logs -f app

# Lihat logs semua services
docker-compose logs -f

# Lihat logs PostgreSQL
docker-compose logs -f postgres
```

### Akses Database
```bash
# Akses PostgreSQL
docker-compose exec postgres psql -U user -d amerta

# Buka Prisma Studio
docker-compose exec app npm run prisma:studio
```

### Stop Services
```bash
# Stop semua services
docker-compose down

# Stop dan hapus volumes
docker-compose down -v
```

### Rebuild Services
```bash
# Rebuild app image tanpa cache
docker-compose build --no-cache app

# Rebuild semua images
docker-compose build --no-cache
```

## Build Manual (Tanpa Docker Compose)

### 1. Build Docker Image
```bash
docker build -t amerta-backend:latest .
```

### 2. Jalankan Container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:password@postgres:5432/amerta" \
  -e REDIS_URL="redis://redis:6379" \
  -e JWT_SECRET="your_secret" \
  --name amerta-app \
  amerta-backend:latest
```

## Penjelasan Dockerfile

### Multi-Stage Build
Dockerfile menggunakan 2 stages untuk optimasi:

1. **Builder Stage**: Build TypeScript ke JavaScript
   - Install dependencies
   - Generate Prisma Client
   - Compile TypeScript

2. **Production Stage**: Runtime image yang lebih kecil
   - Copy hanya production dependencies
   - Copy compiled code dan Prisma Client
   - Run sebagai non-root user

### Keuntungan
- ✅ Ukuran image lebih kecil (~400MB vs ~600MB)
- ✅ Lebih aman (non-root user)
- ✅ Lebih cepat loading
- ✅ Proper signal handling dengan dumb-init

## Struktur docker-compose.yml

Services yang tersedia:

1. **app**: Express TypeScript backend
   - Port: 3000
   - Depends on: postgres, redis

2. **postgres**: PostgreSQL 16
   - Port: 5432
   - Volume: `postgres_data`

3. **redis**: Redis
   - Port: 6379
   - Volume: `redis_data`

## Troubleshooting

### Container gagal start
```bash
# Lihat error logs
docker-compose logs app

# Rebuild container
docker-compose down
docker-compose up --build
```

### Koneksi database gagal
```bash
# Pastikan postgres sudah ready
docker-compose exec postgres pg_isready

# Check network connectivity
docker-compose exec app ping postgres
```

### Port sudah digunakan
Edit `docker-compose.yml` dan ubah port mapping:
```yaml
ports:
  - "3001:3000"  # Ubah port host
```

### Prisma Client tidak sync
```bash
# Regenerate Prisma Client
docker-compose exec app npm run prisma:generate
```

## Production Deployment

### Environment Variables untuk Production
```bash
NODE_ENV=production
DATABASE_URL=your_production_db_url
REDIS_URL=your_production_redis_url
JWT_SECRET=strong_secret_key
JWT_REFRESH_SECRET=strong_refresh_secret_key
```

### Deploy dengan Docker
```bash
# Build production image
docker build -t amerta-backend:1.0.0 .

# Push ke registry
docker tag amerta-backend:1.0.0 your-registry/amerta-backend:1.0.0
docker push your-registry/amerta-backend:1.0.0
```

## Notes
- Image base: Node.js 20 Alpine (lightweight)
- User: `nodejs` (non-root untuk security)
- Health check: Enabled untuk semua services
- Restart policy: `unless-stopped`
