# 💸 ExpenseTrack
Live Link:- https://expense-tracker-8qgl.vercel.app/

A full-stack personal expense tracking web application built with **Next.js**, **Prisma**, **MySQL**, **JWT**, and **NextAuth (Google OAuth)**. Track spending, filter and paginate transactions, visualize trends, set budgets, export data, and manage a **Free vs Premium** plan — all in one place.

---

## 🌐 Live Demo

- **Frontend/Backend** → Deployed on [Vercel](https://vercel.com)
- **Database** → Deployed on [Railway](https://railway.app)

---

## ✨ Features

### Authentication & account

- 🔐 **Email & password** — Register and login with **bcrypt**-hashed passwords; JWT issued and stored in an **`httpOnly` cookie**
- 🔑 **Google sign-in** — **NextAuth.js** OAuth; new users are created in the database with name and profile image
- 👤 **Dual auth resolution** — APIs accept either the JWT cookie or a valid NextAuth session (`lib/auth.js`)
- 🚀 **Auto-login after register** — Redirect to the dashboard with the session cookie set
- 🚪 **Logout** — Clears JWT and signs out of NextAuth
- ⚙️ **Profile (`/profile`)** — Update display name, change password (with strength feedback), avatar initials, **free-plan usage meters**, theme toggle

### Dashboard & expenses

- 📑 **Tabbed dashboard** — **Expenses**, **Analytics**, and **Budget** in one place
- 📊 **Stats overview** — Totals, counts, and quick insight into spending
- 🧾 **CRUD expenses** — Add (`/add-expense`), edit inline, delete with **confirmation dialog**
- 🔎 **Search & filters** — Filter by **category**, **date range** (from / to), and **note search**
- ⇅ **Sort** — Latest, oldest, highest amount, lowest amount
- 📄 **Pagination** — Paged expense lists (API-driven `page` / `limit`)
- 🔔 **Toasts** — Success and error feedback via **react-hot-toast**

### Categories & budgets

- 🗂️ **Custom categories** — Per-user categories; **unique name per user**; create inline when adding expenses
- 🎯 **Budgets** — Monthly (and yearly) budgets; optional **per-category** budget (`categoryId` on `Budget`); **`GET /api/budget`** compares each budget to **real spending** in that period (and category, if set), with create/delete/update via API

### Charts & analytics (Premium)

- 📈 **Recharts visualizations** — Spending **by category** (pie / donut-style), **by month** (bar), and **daily trend** (area/line), powered by **`/api/expense/analytics`**
- 🔒 **Plan-gated** — Free users are prompted to upgrade; analytics enforced in the API (`lib/planCheck.js`)

### Export (Premium)

- 📥 **CSV export** — Download all expenses as CSV (`lib/exportExpenses.js`)
- 📗 **Excel export** — `.xlsx` export using **SheetJS (`xlsx`)**
- 🔒 **Plan-gated** — Same Premium checks as analytics

### Plans, pricing & limits

- 🆓 **Free plan** — Up to **50 expenses**, **5 categories**, **3 budgets**; **no charts/export** (see `lib/plans.js`)
- 👑 **Premium plan** — **Unlimited** expenses, categories, and budgets; **full analytics & CSV/Excel export**
- 💳 **Pricing page (`/pricing`)** — Compare plans, FAQs; **hosted checkout is marked as coming soon**
- 📊 **Plan usage UI** — **PlanUsageBar** on profile for Free users (expenses / categories / budgets progress)
- ⬆️ **Upgrade prompts** — **UpgradePrompt** when hitting Premium-only actions
- 🛠️ **Admin utility (optional)** — `POST /api/admin/set-plan` with **`ADMIN_SECRET`** to flip `free`/`premium` for testing (secure or remove before production)

### UX & branding

- 🌓 **Dark / light theme** — **ThemeToggle** + **ThemeContext** persisted for the UI
- 🎬 **Landing page** — Animated sections, feature grid, and CTAs (**SpEndora** branding on auth pages; marketing mix with **ExpenseTrack**)
- 📱 **Responsive layout** — Tailwind CSS across dashboard, forms, and marketing pages

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS |
| Database | MySQL (e.g. Railway) |
| ORM | Prisma |
| Auth | JWT (`jsonwebtoken`, httpOnly cookie) + **NextAuth** (Google) |
| Password hashing | bcrypt |
| Charts | Recharts |
| Export | xlsx (Excel) + CSV (custom) |
| Notifications | react-hot-toast |
| Deployment | Vercel + Railway |

---

## 📁 Project Structure

```
app/
├── page.js                       # Landing page
├── login/page.jsx               # Login (email/password + Google)
├── register/page.jsx            # Register (email/password + Google)
├── pricing/page.jsx             # Free vs Premium comparison
├── profile/page.jsx             # Profile & password (protected UI)
├── dashboard/page.jsx           # Tabs: expenses | analytics | budget
├── add-expense/page.jsx         # Add expense (protected)
├── context/ThemeContext.jsx     # Dark/light theme
├── providers.js                 # NextAuth SessionProvider
├── components/
│   ├── ExpenseCharts.jsx        # Recharts analytics
│   ├── ThemeToggle.jsx
│   ├── UpgradePrompt.jsx
│   └── PlanUsageBar.jsx
└── api/
    ├── auth/
    │   ├── [...nextauth]/route.js  # NextAuth (Google)
    │   ├── register/route.js
    │   ├── login/route.js
    │   ├── logout/route.js
    │   ├── me/route.js
    │   └── profile/route.js       # GET/PUT profile & password
    ├── expense/
    │   ├── route.js               # GET (filters + pagination), POST
    │   ├── [id]/route.js          # PUT, DELETE
    │   └── analytics/route.js      # Aggregates for charts (Premium)
    ├── category/route.js
    ├── budget/route.js            # GET, POST
    ├── budget/[id]/route.js       # PUT, DELETE (as implemented)
    └── admin/set-plan/route.js    # Optional: manual plan switch (secret)

lib/
├── prisma.js                 # Prisma singleton
├── auth.js                   # getAuthenticatedUser (JWT or session)
├── plans.js                  # PLANS config (limits & flags)
├── planCheck.js              # Plan limit checks for APIs
└── exportExpenses.js          # CSV & Excel helpers

proxy.js                         # Reference matcher/auth helper (rename & export as `middleware` if you use Next.js middleware)
prisma/schema.prisma
```

---

## 🗄️ Database Schema

```prisma
model User {
  id          Int       @id @default(autoincrement())
  email       String    @unique
  password    String?   // null for OAuth-only users
  name        String?
  image       String?
  plan        String    @default("free")
  planExpiry  DateTime?
  createdAt   DateTime  @default(now())
  expenses    Expense[]
  categories  Category[]
  budgets     Budget[]
}

model Expense {
  id          Int       @id @default(autoincrement())
  amount      Float
  note        String?
  date        DateTime  @default(now())
  userId      Int
  categoryId  Int?
  user        User      @relation(fields: [userId], references: [id])
  category    Category? @relation(fields: [categoryId], references: [id])
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String
  userId   Int
  user     User      @relation(fields: [userId], references: [id])
  budgets  Budget[]
  expenses Expense[]
  @@unique([userId, name])
}

model Budget {
  id          Int       @id @default(autoincrement())
  amount      Float
  month       Int
  year        Int
  userId      Int
  categoryId  Int?
  user        User      @relation(fields: [userId], references: [id])
  category    Category? @relation(fields: [categoryId], references: [id])
  @@unique([userId, year, month, categoryId])
}
```

Indexed fields on `Expense` and `Budget` optimize filtered queries ([see `prisma/schema.prisma`](prisma/schema.prisma)).

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root:

```env
DATABASE_URL="mysql://user:password@host:port/dbname"
JWT_SECRET="your_random_secret_key_here"

# Google OAuth (optional but required for Google sign-in)
NEXTAUTH_SECRET="generate_a_long_random_string"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Optional — manual Premium for testing POST /api/admin/set-plan
# ADMIN_SECRET="your_admin_secret"
```

### 4. Set up the database

```bash
npx prisma migrate dev
# or
npx prisma db push
```

### 5. Generate Prisma client

```bash
npx prisma generate
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Authentication Flow

```
Email register → bcrypt hash saved → JWT created → httpOnly cookie → /dashboard
Email login    → JWT verified → cookie set → /dashboard
Google OAuth   → NextAuth session + user synced in DB → /dashboard
Logout         → JWT cleared + NextAuth signOut → /login
```

Protected **API routes** resolve the actor with `getAuthenticatedUser`: **NextAuth session** first, then **JWT cookie** (`lib/auth.js`). The UI redirects to `/login` when `/api/auth/me` or profile calls return **401**.

---

## 🛡️ Route & API Protection

Public UI: **`/`**, **`/login`**, **`/register`**, **`/pricing`**, and **`/api/auth/*`**.

Protected data access: **`/api/expense`**, **`/api/category`**, **`/api/budget`**, **`/api/expense/analytics`**, and **`/api/auth/profile`** all require authentication. Feature flags (analytics, export, and creation limits) are enforced with **`lib/planCheck.js`** aligned to **`lib/plans.js`**.

The repo includes **`proxy.js`** with a suggested **matcher list** for a future **`middleware.ts`**/`middleware.js`; wire it up if you want edge-level redirects in addition to API checks.

---

## 📡 API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| Various | `/api/auth/[...nextauth]` | NextAuth routes (e.g. **Google OAuth** callbacks) |
| POST | `/api/auth/register` | Register + JWT cookie (**links** existing Google-only account by email when applicable) |
| POST | `/api/auth/login` | Login + JWT cookie |
| GET | `/api/auth/me` | Current user (including **plan**) |
| POST | `/api/auth/logout` | Clear JWT cookie |

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expense` | List expenses (**optional:** `category`, `from`, `to`, `search`, `sort`, `page`, `limit`) |
| POST | `/api/expense` | Add expense (checks **plan** expense limit) |
| PUT | `/api/expense/[id]` | Update an expense |
| DELETE | `/api/expense/[id]` | Delete an expense |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expense/analytics` | Aggregated data for charts (**Premium**) |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/category` | Get all categories |
| POST | `/api/category` | Create category (checks **plan** category limit) |

### Budgets

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/budget` | All budgets with **spend vs budget** computed |
| POST | `/api/budget` | Create budget (**plan** budget limit) |
| PUT | `/api/budget/[id]` | Update budget **amount** |
| DELETE | `/api/budget/[id]` | Remove budget |

### Profile

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/profile` | Profile + counts for usage bars |
| PUT | `/api/auth/profile` | Update **name** and/or change **password** |

### Admin (testing only)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/set-plan` | Set user `plan` (**requires `ADMIN_SECRET` in body**) |

---

## 🌍 Deployment

### Vercel (Frontend)

1. Push your code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables — at minimum **`DATABASE_URL`**, **`JWT_SECRET`**, **`NEXTAUTH_SECRET`**, **`NEXTAUTH_URL`**; for Google sign-in add **`GOOGLE_CLIENT_ID`** and **`GOOGLE_CLIENT_SECRET`**
4. Deploy

### Railway (Database)

1. Create a new MySQL service on [railway.app](https://railway.app)
2. Copy the `DATABASE_URL` connection string
3. Add it to both Railway and Vercel environment variables
4. Vercel build is covered by **`npm run build`** (`prisma generate && next build` in `package.json`).

---

## 🔧 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | ✅ |
| `JWT_SECRET` | Secret for signing JWT cookies (email/password flow) | ✅ |
| `NEXTAUTH_SECRET` | NextAuth encryption secret | ✅ for Google OAuth |
| `NEXTAUTH_URL` | Canonical site URL (e.g. `https://your-app.vercel.app`) | ✅ in production OAuth |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ for Google sign-in |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ for Google sign-in |
| `ADMIN_SECRET` | Shared secret for `POST /api/admin/set-plan` | Optional (dev / manual Premium) |
| `NODE_ENV` | `development` or `production` | Set by host |

---

## 📸 Pages Overview

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Marketing page with scroll animations and feature highlights |
| Register | `/register` | Email/password + Google; password strength meter |
| Login | `/login` | Email/password + Google; theme toggle |
| Pricing | `/pricing` | Free vs Premium comparison and FAQ |
| Dashboard | `/dashboard` | Tabs: filtered/paged expenses, analytics charts (Premium), budgets vs actual spend |
| Add Expense | `/add-expense` | New expense with inline categories |
| Profile | `/profile` | Name & password, plan usage bars, logout |

---

## 🚧 Roadmap / not implemented yet

- 💳 **In-app Premium checkout** (pricing page placeholders today)
- ✉️ **Monthly email reports** and **budget email alerts** (listed on `/pricing`; not wired in codebase)
- Optional: **PDF export**, edge **`middleware`** using `proxy.js` for stricter route gating

---

## 👨‍💻 Author

**Niranjan Doijode**
BTech CSE Student | Aspiring Full Stack Developer

---

## ⭐If you found this useful

Give it a star on GitHub ⭐ and feel free to contribute!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
