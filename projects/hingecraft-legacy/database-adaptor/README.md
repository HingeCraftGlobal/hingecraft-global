# HingeCraft Database Adaptor API

Express.js API that connects Wix to PostgreSQL database. Runs in Docker for offline/serverless operation.

## Features

- ✅ RESTful API for donations
- ✅ PostgreSQL database integration
- ✅ Authentication via secret key
- ✅ Docker-ready
- ✅ Health check endpoint
- ✅ Error handling
- ✅ Auto-updating timestamps

## Quick Start

### With Docker (Recommended)

```bash
# From project root
docker-compose up -d db-adaptor
```

### Manual Setup

```bash
cd database-adaptor
npm install
cp .env.example .env
# Edit .env with your database credentials
npm start
```

## Environment Variables

```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=hingecraft_db
DB_USER=hingecraft_user
DB_PASSWORD=your_password
PORT=3000
SECRET_KEY=your_secret_key
```

## API Endpoints

All endpoints (except `/health`) require authentication:
- Header: `Authorization: Bearer {SECRET_KEY}`
- OR Header: `X-API-Key: {SECRET_KEY}`

### Health Check
```
GET /health
```

### Get Latest Donation
```
GET /donations/latest
```

### Create Donation
```
POST /donations
Body: {
  "amount": 50.00,
  "currency": "USD",
  "is_other_amount": true,
  "source": "payment_page",
  "payment_status": "completed"
}
```

### Get All Donations
```
GET /donations?limit=100&offset=0
```

### Get Donation by ID
```
GET /donations/:id
```

### Update Donation
```
PATCH /donations/:id
Body: {
  "payment_status": "completed"
}
```

## Development

```bash
npm run dev  # Uses nodemon for auto-reload
```

## Testing

```bash
npm test
```

## Production

The API is designed to run in Docker. See `DOCKER_SETUP.md` for deployment options.





