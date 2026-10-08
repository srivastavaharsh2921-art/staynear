# StayNear Vercel Deployment

## Vercel settings

- Project root: `staynear`
- Framework preset: `Other`
- Build command: leave empty, or use `npm run vercel-build`
- Output directory: leave empty

## Environment variables

Add these in Vercel Project Settings -> Environment Variables:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `JWT_SECRET`

Do not commit `backend/.env`. Vercel reads the values from its own environment variable settings.

## MongoDB Atlas

In MongoDB Atlas, allow network access for Vercel deployments. For a student project, `0.0.0.0/0` is the easiest option. For production, use the most restrictive option your Vercel plan and MongoDB setup support.

## Local run

```bash
npm install
npm start
```

Open `http://localhost:5000`.
