# StayNear backend

A dependency-free Node.js API for the StayNear frontend.

## Run

```powershell
cd backend
npm install
copy .env.example .env
npm run seed
npm run dev
```

The server listens on `http://localhost:5000` and also serves the frontend from the project root. MongoDB must be running and `MONGODB_URI` must be configured in `.env`.

Run integration tests with `RUN_MONGO_TESTS=true npm test` after MongoDB or the memory-server binary is available. Without that flag, tests are intentionally skipped to avoid downloading MongoDB during normal offline checks.

## API

- `GET /api/health`
- `GET /api/properties?search=&type=&amenities=`
- `GET /api/properties/:id`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/me`
- `PUT /api/me/preferences`
- `GET /api/me/favorites`
- `POST /api/me/favorites/:propertyId`
- `POST /api/owner/listings`

Authenticated routes use `Authorization: Bearer <token>`.

`data.json` is the local development store. For production, replace it with a database and move authentication sessions to a shared store.
