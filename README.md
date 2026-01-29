# Pastebin-Lite

A simple, production-ready pastebin application with support for time-based expiration (TTL) and view-limited pastes. Built for automated testing compliance and serverless deployment.

## Features

- **Create pastes** with optional TTL (time-to-live) and view limits
- **Secure viewing** with XSS protection and HTML escaping
- **Atomic view counting** prevents race conditions under concurrent access
- **Automatic database initialization** - no manual migrations needed
- **Test mode support** for deterministic time-based testing

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: React with Vite
- **Database**: PostgreSQL
- **Deployment**: Vercel (serverless friendly)

## Project Structure

```
pastebin-lite/
├── backend/                 # Express API server
│   ├── config/              # Configuration management
│   ├── db/                  # Database connection, schema & initialization
│   ├── middleware/          # Express middleware (JSON responses)
│   ├── routes/              # API route handlers
│   ├── utils/               # Utility functions (time, validation, paste logic)
│   ├── server.js            # Main server entry point
│   └── package.json
├── frontend/
│   └── pastebin/            # React frontend (Vite)
│       ├── src/
│       │   ├── components/  # React components
│       │   └── services/    # API client
│       └── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+ 
- A cloud PostgreSQL database (provide `DATABASE_URL`)
- npm

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend/pastebin
npm install
```

### 2. Configure Environment

```bash
# Backend configuration
cd backend
cp .env.example .env
# Edit .env with your *cloud* PostgreSQL connection string:
# DATABASE_URL=postgresql://user:password@host:5432/database
```

### 3. Start the Application

```bash
# Terminal 1: Start backend (auto-initializes database)
cd backend
npm start

# Terminal 2: Start frontend
cd frontend/pastebin
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

**Note**: The backend automatically creates the required database tables on startup. No manual migration is needed.

## Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `BASE_URL` | Base URL for paste URLs in responses | `http://localhost:3000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:5173` |
| `TEST_MODE` | Enable test time manipulation | `0` |

**Dev/Prod examples**:
- Dev: use [backend/.env.development.example](backend/.env.development.example)
- Prod: use [backend/.env.production.example](backend/.env.production.example)

### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL (absolute or relative). In production, set this to your deployed backend (e.g. `https://your-backend.onrender.com/api`). | `http://localhost:3000/api` |

**Notes**:
- If `VITE_API_URL` is not set in production, the app falls back to same-origin `/api`.
- If `VITE_API_URL` points to a root domain (e.g. `https://example.com`), `/api` is appended automatically.

**Dev/Prod examples**:
- Dev: use [frontend/pastebin/.env.development.example](frontend/pastebin/.env.development.example)
- Prod: use [frontend/pastebin/.env.production.example](frontend/pastebin/.env.production.example)

## API Endpoints

### Health Check
```
GET /api/healthz
Response: { "ok": true }
```

### Create Paste
```
POST /api/pastes
Content-Type: application/json

{
  "content": "Hello, World!",
  "ttl_seconds": 3600,    // optional, expires in 1 hour
  "max_views": 10         // optional, max 10 views
}

Response (201):
{
  "id": "uuid",
  "url": "https://your-domain/p/uuid"
}
```

### Get Paste (JSON API)
```
GET /api/pastes/:id

Response (200):
{
  "content": "Hello, World!",
  "remaining_views": 9,   // or null if unlimited
  "expires_at": "ISO8601" // or null if no TTL
}

Response (404): Paste not found, expired, or view limit reached
```

### View Paste (HTML)
```
GET /p/:id

Response (200): HTML page with paste content
Response (404): HTML error page
```

## Database Schema

### Pastes Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `content` | TEXT | Paste content (required, non-empty) |
| `created_at` | TIMESTAMP | Creation time |
| `expires_at` | TIMESTAMP | Expiration time (nullable) |
| `max_views` | INTEGER | Max view count (nullable, ≥1) |
| `views_used` | INTEGER | Current view count (default: 0, ≥0) |

### Paste Types Supported

1. **Unlimited**: No expiration, no view limit (`expires_at=NULL`, `max_views=NULL`)
2. **TTL-only**: Expires after set time (`expires_at` set, `max_views=NULL`)
3. **Views-only**: Expires after N views (`expires_at=NULL`, `max_views` set)
4. **Both**: Whichever triggers first

### Data Integrity

- `views_used` can never be negative (CHECK constraint)
- `views_used` can never exceed `max_views` (CHECK constraint)
- `content` cannot be empty (CHECK constraint)
- Atomic increment prevents concurrent requests from exceeding limits

## Design Decisions

### Concurrency Safety
View counting uses an atomic `UPDATE...RETURNING` query that combines the availability check and increment in a single operation. This prevents race conditions where concurrent requests could exceed `max_views`.

### Serverless Compatibility
- Lazy database connection initialization
- Connection pooling with appropriate timeouts
- No global mutable state
- Automatic schema initialization on startup

### Test Mode
When `TEST_MODE=1`, the server accepts `x-test-now-ms` header to override system time. This enables deterministic testing of TTL expiration without waiting for real time to pass.

```bash
# Example: Test with specific timestamp
curl -H "x-test-now-ms: 1704067200000" http://localhost:3000/api/pastes/uuid
```

### Security
- HTML content is escaped to prevent XSS attacks
- No secrets committed to repository (`.env` files gitignored)
- All API responses return JSON with proper Content-Type
- Input validation on all endpoints

## Deployment (Vercel)

1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` (your PostgreSQL connection string)
   - `BASE_URL` (your Vercel deployment URL)
   - `NODE_ENV=production`
3. Deploy

The application uses serverless-friendly patterns and will auto-initialize the database on first request.

## Testing

### Manual Testing
```bash
# Create a paste
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello!", "max_views": 3}'

# Fetch paste (increments view count)
curl http://localhost:3000/api/pastes/<id>

# View paste in browser
open http://localhost:3000/p/<id>
```

### Automated Tests
The application is designed for automated test compliance:
- Consistent 404 responses for all unavailable states
- Deterministic time via TEST_MODE
- JSON-only API responses
- No manual intervention required

## License

MIT
