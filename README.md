# cardmarket-mvp

Cardmarket data ingestion + API service running on Vercel + PostgreSQL (Prisma).

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start Postgres in Docker:
   ```bash
   npm run db:up
   ```
   Spins up Postgres 16 on `localhost:5432`. Credentials are pre-configured in `.env`.

3. Push the schema:
   ```bash
   npm run db:push
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

Then trigger ingestion at `http://localhost:3000/api/ingest`.

### DB helper scripts

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start Postgres container |
| `npm run db:down` | Stop container (data preserved) |
| `npm run db:reset` | Wipe volume and restart fresh |
| `npm run db:studio` | Open Prisma Studio |

## Production Deploy

Set `DATABASE_URL` in Vercel dashboard, then:
```bash
vercel deploy
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ingest` | Trigger data ingestion (also runs daily via cron) |
| GET | `/api/products/[id]` | Get product + latest price by ID |
| GET | `/api/search?q=...` | Search products by name (max 20) |
| GET | `/api/products/[id]/history` | Last 100 price history entries |
