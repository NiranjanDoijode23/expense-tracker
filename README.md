# 💸 ExpenseTrack
Live Link:- https://expense-tracker-8qgl.vercel.app/

A full-stack personal expense tracking web application built with **Next.js**, **Prisma**, **MySQL**, and **JWT authentication**. Track your spending, organize by categories, set budgets, and manage your finances — all in one place.

---

## 🌐 Live Demo

- **Frontend/Backend** → Deployed on [Vercel](https://vercel.com)
- **Database** → Deployed on [Railway](https://railway.app)

---

## ✨ Features

- 🔐 **Authentication** — Secure register & login with JWT stored in `httpOnly` cookies
- 📊 **Dashboard** — Real-time overview of total spending, monthly expenses, transaction count and categories
- 🧾 **Expense Management** — Add, edit, and delete expenses with amount, note, category and date
- 🗂️ **Custom Categories** — Create your own categories inline while adding an expense
- 🎯 **Budget Tracking** — Budget model ready for monthly budget goals
- 🔒 **Route Protection** — Middleware protects all private routes and API endpoints
- 🚀 **Auto Login** — Users are automatically logged in after registration
- 📱 **Responsive Design** — Clean dark UI built with Tailwind CSS

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | MySQL (via Railway) |
| ORM | Prisma |
| Auth | JSON Web Tokens (JWT) |
| Password Hashing | bcrypt |
| Deployment | Vercel + Railway |

---

## 📁 Project Structure

```
app/
├── page.jsx                  # Landing page
├── login/
│   └── page.jsx              # Login page
├── register/
│   └── page.jsx              # Register page
├── dashboard/
│   └── page.jsx              # Dashboard (protected)
├── add-expense/
│   └── page.jsx              # Add expense page (protected)
└── api/
    ├── auth/
    │   ├── register/route.js  # POST — register + auto login
    │   ├── login/route.js     # POST — login, sets JWT cookie
    │   ├── me/route.js        # GET  — fetch logged in user
    │   └── logout/route.js   # POST — clears JWT cookie
    ├── expense/
    │   ├── route.js           # GET (all expenses) + POST (add expense)
    │   └── [id]/route.js      # DELETE + PUT (edit expense)
    └── category/
        └── route.js           # GET (all categories) + POST (add category)

lib/
└── prisma.js                 # Prisma client singleton

middleware.js                 # JWT route protection
prisma/
└── schema.prisma             # Database schema
```

---

## 🗄️ Database Schema

```prisma
model User {
  id        Int        @id @default(autoincrement())
  email     String     @unique
  password  String
  name      String?
  createdAt DateTime   @default(now())
  expenses  Expense[]
  categories Category[]
  budgets   Budget[]
}

model Expense {
  id         Int       @id @default(autoincrement())
  amount     Float
  note       String?
  date       DateTime  @default(now())
  userId     Int
  categoryId Int?
  user       User      @relation(fields: [userId], references: [id])
  category   Category? @relation(fields: [categoryId], references: [id])
}

model Category {
  id       Int       @id @default(autoincrement())
  name     String
  userId   Int
  user     User      @relation(fields: [userId], references: [id])
  expenses Expense[]
}

model Budget {
  id     Int  @id @default(autoincrement())
  amount Float
  month  Int
  year   Int
  userId Int
  user   User @relation(fields: [userId], references: [id])
}
```

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
Register → JWT created → cookie set → redirected to /dashboard
Login    → JWT verified → cookie set → redirected to /dashboard
Logout   → cookie cleared → redirected to /login

Every protected route:
  Middleware reads cookie → verifies JWT → allows or redirects
```

---

## 🛡️ Middleware Protection

```javascript
// middleware.js
// Public routes (no auth needed):
//   /login, /register, /api/auth/*

// Protected routes:
//   /dashboard, /add-expense, /api/expense/*, /api/category/*
```

---

## 📡 API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user + auto login |
| POST | `/api/auth/login` | Login and set JWT cookie |
| GET | `/api/auth/me` | Get logged in user info |
| POST | `/api/auth/logout` | Clear JWT cookie |

### Expenses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/expense` | Get all expenses of logged in user |
| POST | `/api/expense` | Add a new expense |
| PUT | `/api/expense/[id]` | Update an existing expense |
| DELETE | `/api/expense/[id]` | Delete an expense |

### Categories

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/category` | Get all categories of logged in user |
| POST | `/api/category` | Create a new category |

---

## 🌍 Deployment

### Vercel (Frontend)

1. Push your code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
4. Deploy

### Railway (Database)

1. Create a new MySQL service on [railway.app](https://railway.app)
2. Copy the `DATABASE_URL` connection string
3. Add it to both Railway and Vercel environment variables
4. Set build command:
```bash
npx prisma generate && npm run build
```

---

## 🔧 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | ✅ |
| `NODE_ENV` | `development` or `production` | ✅ |

---

## 📸 Pages Overview

| Page | Route | Description |
|---|---|---|
| Landing | `/` | Marketing page with features and CTA |
| Register | `/register` | Create account with password strength meter |
| Login | `/login` | Sign in to your account |
| Dashboard | `/dashboard` | View all expenses, stats, edit and delete |
| Add Expense | `/add-expense` | Add new expense with inline category creation |

---

## 🚧 Upcoming Features
📈 Expense charts (monthly analytics)
🔍 Search & filters
📄 Pagination
🌙 Dark mode toggle
📤 Export data (CSV/PDF)
👤 Profile settings
📱 Mobile responsiveness improvements

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
