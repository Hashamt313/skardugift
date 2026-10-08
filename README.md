# SkarduGift

Full-stack e-commerce platform for mountain gifts and natural products.

## Quick start

1. Copy `.env.example` to `.env` and add Supabase project keys.
2. Run the migration in `supabase/migrations/001_initial_schema.sql` using the Supabase SQL editor, then optionally run `supabase/seed.sql`.
3. `npm install`
4. `npm run dev`

The customer app runs at `http://localhost:5173`, backend at `http://localhost:5000` and the admin portal at `/admin`. Create an authenticated Supabase user, then grant the user an `admin` role in `user_roles` to use protected administration endpoints.

## Deployment

Deploy `client` to Vercel with `npm run build -w client`; deploy `server` to Render with `npm start -w server`. Add the same environment variables to both services (Vite variables only in the client). Keep `SUPABASE_SECRET_KEY` server-only.
