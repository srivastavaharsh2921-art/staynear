# StayNear Vercel Deployment

## Vercel settings

- Project root: `staynear`
- Framework preset: `Other`
- Build command: leave empty, or use `npm run vercel-build`
- Output directory: leave empty

## Separate frontend and backend projects

If deploying the folders separately:

- Backend project root: `backend`
- Frontend project root: `frontend`
- Redeploy the backend first, then redeploy the frontend

The frontend calls `/api/*` on its own domain. `frontend/vercel.json` proxies those
requests to `https://staynearbackend.vercel.app/api/*`, and `backend/vercel.json`
routes `/api/*` into the Express app.

If your backend Vercel domain is different, update the destination in
`frontend/vercel.json`.

## Environment variables

Add these in Vercel Project Settings -> Environment Variables:

- `MONGO_URI`
- `MONGO_DB_NAME`
- `JWT_SECRET`
- `RESEND_API_KEY` — Resend API key for sending reset messages
- `EMAIL_FROM` — sender address verified in Resend, such as `StayNear <no-reply@example.com>`
- `FRONTEND_BASE_URL` — frontend origin used in reset links; production must be `https://staynear-frontend.vercel.app`

Password reset email setup:

1. Create a Resend account and verify a sending domain/address for StayNear.
2. Create an API key and add the three variables above in the **backend Vercel project's** Settings → Environment Variables. Do not add the Resend key to the frontend project.
3. Set `EMAIL_FROM` to the verified sender and set `FRONTEND_BASE_URL` to `https://staynear-frontend.vercel.app` for Production. For local development, use the origin serving the frontend, typically `http://localhost:5000`.
4. Redeploy the backend after adding or changing these values. Deploy the frontend after adding the new pages.

Reset links expire after 30 minutes and can be used once. Reset endpoints are limited to 5 requests per IP per 15 minutes for email requests and 10 per IP per 15 minutes for password submissions. The limiter uses in-memory storage, so limits are per warm serverless instance and are best-effort across Vercel instances.

Before email configuration, the forgot-password endpoint returns a generic temporary-unavailable response. After configuration, valid-format email requests receive the same success response whether or not an account exists. Provider delivery failures are not reported in that response to preserve account privacy; check backend runtime logs for the generic delivery-failure message and verify delivery using an actual mailbox.

## Deploy and test password reset

1. In the Resend dashboard, verify the sending domain/address and create an API key.
2. In Vercel, open the existing **backend** project and set `RESEND_API_KEY`, `EMAIL_FROM`, and `FRONTEND_BASE_URL` for the Production environment. Set the frontend URL to `https://staynear-frontend.vercel.app` exactly. Add appropriate values to Preview/Development environments if those deployments should send email.
3. Redeploy the backend project with its existing `backend` project root. Confirm its deployment is healthy before continuing.
4. Redeploy the existing **frontend** project with its existing `frontend` project root so `forgot-password.html`, `reset-password.html`, and the login link are published. No API base URL change is needed.
5. Use a non-production test account and mailbox to request a reset. Confirm the email link opens the deployed frontend reset page, choose a strong password, and sign in with the new password.

Test invalid tokens by opening the reset page without a token or with a malformed token; the page should explain that the link is invalid. Test expired tokens in a non-production database by setting a test account's `passwordResetExpiresAt` to a past date after requesting a link, then submit the link; alternatively, wait until a link's 30-minute lifetime ends. Test one-time use by successfully resetting a non-production test account and submitting the same link again; the second attempt should be rejected. Do not alter production user records to simulate expiry or reuse.

Do not commit `backend/.env`. Vercel reads the values from its own environment variable settings.

## MongoDB Atlas

In MongoDB Atlas, allow network access for Vercel deployments. For a student project, `0.0.0.0/0` is the easiest option. For production, use the most restrictive option your Vercel plan and MongoDB setup support.

## Local run

```bash
npm install
npm start
```

Open `http://localhost:5000`.
