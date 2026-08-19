# Smart Kopargaon - किसान सारथी (Kisan Saarthi)

Smart Agricultural Market Intelligence & AI Price Prediction Platform for Kopargaon and neighboring mandis in Maharashtra.

## Features
- **Daily Mandi Rates**: Real-time prices from Agmarknet API for Kopargaon, Rahata, Shrirampur, Yeola, Sangamner, Nashik & Ahmednagar.
- **AI Price Prediction**: Historical price trends and 7, 14, 30-day forecast models.
- **Net Payout Comparison**: Date-wise mandi comparison deducting exact freight transport costs.
- **Supply vs Demand Trends**: Dual-axis market volume and price analysis.
- **Profitability Calculator**: Land yield & production cost calculator.
- **Real SMS Price Alerts**: Live SIM SMS delivery via Fast2SMS API gateway.
- **Real Database Authentication**: Server-side 10-digit mobile number + password registration & login backed by Supabase / PostgreSQL with JWT `httpOnly` secure cookies.

## Tech Stack
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Vercel Serverless Functions (`api/auth/*`, `api/fast2sms.js`, `api/agmarknet.js`)
- **Database**: Supabase / PostgreSQL / Neon
- **Security & Auth**: `bcryptjs` (salt rounds 10), `jsonwebtoken` (JWT), `httpOnly` secure cookies
- **Icons & Charts**: Lucide-React, Recharts
- **i18n**: react-i18next (Marathi / English)

---

## 🗄️ Database Setup (Supabase / PostgreSQL)

1. Create a free project on [Supabase](https://supabase.com) (or [Neon](https://neon.tech)).
2. In Supabase Dashboard, navigate to **SQL Editor** -> **New query**.
3. Copy and run the SQL migration script from [`supabase/migrations/20260819_create_farmers_table.sql`](file:///supabase/migrations/20260819_create_farmers_table.sql):
   ```sql
   create extension if not exists "pgcrypto";

   create table if not exists farmers (
     id uuid primary key default gen_random_uuid(),
     mobile varchar(10) not null unique,
     password_hash text not null,
     name text not null,
     location text default 'कोपरगाव, अहिल्यानगर',
     land_size text default '5 एकर',
     primary_crop text default 'Onion',
     preferred_mandis text[] default array['Kopargaon', 'Rahata', 'Yeola']::text[],
     created_at timestamptz default now(),
     updated_at timestamptz default now()
   );

   create index if not exists idx_farmers_mobile on farmers (mobile);
   ```
4. Copy your PostgreSQL Connection String (URI) from **Project Settings** -> **Database** -> **Connection string** (URI).

---

## ⚙️ Setting Environment Variables in Vercel

In your **Vercel Project Dashboard** -> **Settings** -> **Environment Variables**, add the following keys:

| Variable Name | Description | Example Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase / Postgres connection URI | `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?sslmode=require` |
| `JWT_SECRET` | Strong random secret key for JWT session cookies | `your_super_secret_jwt_key_32_characters_long` |
| `FAST2SMS_API_KEY` | Fast2SMS authorization key for SMS gateway | *(optional, for real SMS alerts)* |
| `VITE_DATA_GOV_API_KEY` | Data.gov.in Agmarknet API Key | `579b464db66ec23bdd0000013b9ed8ac1ba748f069c4ff76e57ab86f` |

---

## 🚀 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up local .env
cp .env.example .env
# Edit .env and paste your DATABASE_URL and JWT_SECRET

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```
