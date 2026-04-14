# Vichakra Server

Express + MongoDB API for the Admin Panel and Client Portal.

## Setup

1. Copy `.env.example` to `.env` and fill in values:
   ```
   cp .env.example .env
   ```

2. Required environment variables:
   | Variable | Description |
   |---|---|
   | `PORT` | Server port (default: 5000) |
   | `CLIENT_URL` | React dev URL (default: http://localhost:5173) |
   | `MONGO_URI` | MongoDB connection string |
   | `JWT_SECRET` | Access token secret (min 32 chars, random) |
   | `JWT_REFRESH_SECRET` | Refresh token secret (different from JWT_SECRET) |
   | `JWT_EXPIRES_IN` | Access token TTL (default: 15m) |
   | `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (default: 7d) |
   | `NODE_ENV` | `development` or `production` |

3. Install dependencies:
   ```
   npm install
   ```

4. Start dev server:
   ```
   npm run dev
   ```

## First-time Admin Setup

No public registration exists. Create the first admin directly in MongoDB:

```js
// In mongosh
use vichakra

db.users.insertOne({
  name: "Rohith",
  email: "admin@vichakratechnologies.com",
  password: "<bcrypt hash of your password>",  // hash via: bcrypt.hashSync('yourpassword', 12)
  role: "admin",
  isActive: true,
  isFirstLogin: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or run the seed script:
```
node scripts/seedAdmin.js
```

## API Base URL

All routes are prefixed with `/api`:
- `POST /api/auth/login`
- `GET /api/admin/stats`
- `GET /api/portal/projects`
- (see PORTAL_PLAN.md for full route table)
