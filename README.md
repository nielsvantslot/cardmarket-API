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
   Spins up Postgres 16 on `localhost:5433`. Credentials are pre-configured in `.env`.

3. Push the schema:
   ```bash
   npm run db:push
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

Then trigger ingestion at `http://localhost:3000/api/service/ingest`.

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

## Public API

Swagger UI is available at `/api/docs`.
Raw OpenAPI JSON is available at `/api/openapi`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products (supports `q`, `limit`, `offset`) |
| GET | `/api/products/[id]` | Get product + latest price by ID |
| GET | `/api/products/[id]/history` | Price history for a product (supports `limit`) |

## Internal Service Routes

These routes are intentionally excluded from the public Swagger spec:

| Method | Path | Description |
|--------|------|-------------|
| GET / POST | `/api/service/ingest` | Trigger data ingestion (also runs daily via cron) |
