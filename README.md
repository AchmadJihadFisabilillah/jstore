# JStore - Production Ready Premium Account Store

Website penjualan akun premium (Netflix, Canva, ChatGPT+, Spotify, dll) dengan arsitektur modular:
- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- NextAuth Credentials + role USER/ADMIN
- Midtrans Snap + webhook real

## Setup cepat

1. Salin env:

```bash
cp .env.example .env
```

2. Isi variabel penting:
- `DATABASE_URL`
- `AUTH_SECRET`
- `MIDTRANS_SERVER_KEY`
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`

3. Migrasi + seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

4. Jalankan dev:

```bash
npm run dev
```

## Akun default admin

- Email: `admin@jstore.id`
- Password: `Admin123!`

## Flow pembayaran Midtrans

1. User pilih paket di detail produk
2. Checkout membuat order `PENDING`
3. Server membuat transaksi Midtrans Snap
4. User diarahkan ke Midtrans
5. Midtrans memanggil webhook `/api/midtrans/webhook`
6. Status order otomatis diupdate `PAID` atau `EXPIRED`

## Endpoint utama

- `POST /api/auth/register`
- `GET /api/products`
- `POST /api/orders`
- `POST /api/midtrans/webhook`
- `GET/POST /api/admin/products` (ADMIN)
- `GET /api/admin/orders` (ADMIN)
