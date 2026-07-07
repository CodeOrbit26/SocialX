# SocialX - Engagement Exchange Marketplace

SocialX is a premium, dark-themed full-stack Next.js web application built with TypeScript, Tailwind CSS, NextAuth, and Prisma. Users earn credits by completing social media engagement campaigns for other creators and spend those credits to publish campaigns of their own.

---

## 🌟 Core Features

- **Credit System**: Atomic balance adjustments ensuring transactions are double-entry safe.
- **Verification Flow**: Workers submit proof URLs, and campaign owners approve or reject submissions from their dashboard.
- **Anti-Abuse Engine**: Reputation scores track worker credibility. Submitting fake proof incurs a 5% reputation drop, warning signals, and admin flag triggers.
- **Admin Console**: Global metrics overview, user directories with balance adjustments, account status controls (suspensions), and report resolution queues.
- **Premium UI**: Crafted using a neon dark aesthetic, glassmorphic layout cards, responsive navigations, and live credit updates.

---

## 🛠️ Technology Stack

- **Frontend & Backend**: Next.js (App Router, API Routes, Turbopack)
- **Database Access**: Prisma ORM
- **Database Engine**: SQLite (default for development), fully compatible with PostgreSQL
- **Security**: NextAuth (Credentials provider with bcrypt password hashing)

---

## 📁 Directory Structure

```text
socialx/
├── prisma/
│   ├── dev.db             # Local database (created after setup)
│   ├── schema.prisma      # Prisma Database Models
│   └── seed.ts            # Local seed configuration (users, admin, tasks)
├── src/
│   ├── app/
│   │   ├── api/           # API routes (Auth, Tasks, Admin, Reports)
│   │   ├── admin/         # Admin console panel
│   │   ├── create-task/   # Campaign designer
│   │   ├── dashboard/     # User metrics, campaigns & verification queue
│   │   ├── login/         # Sign-in portal
│   │   └── marketplace/   # Task directories & proof submission
│   ├── components/        # Reusable UI layouts (Navbar, Providers)
│   └── lib/               # Database singleton, auth configuration
```

---

## 🚀 Getting Started

### 1. Installation
Clone the repository, navigate to the `socialx` directory, and install dependencies:
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your secrets:
```bash
cp .env.example .env
```
Default `.env` settings:
```ini
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="socialx-secret-key-change-in-prod-12345"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Setup Database and Seed Mock Data
Run migrations to build the SQLite database, generate Prisma Client, and seed sample accounts:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Development Server
Start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Credentials for Testing

Use these accounts to test roles and features after running the seed script:

1. **System Admin**
   - Email: `admin@socialx.com`
   - Password: `admin123`
2. **Standard User (Worker/Creator)**
   - Email: `john@socialx.com`
   - Password: `password123`
3. **Standard User (Worker/Creator)**
   - Email: `jane@socialx.com`
   - Password: `password123`

---

## 🐳 Docker Deployment

Build and start the application inside a container containerized environment:

```bash
# Build & start container
docker-compose up --build -d

# Stop container
docker-compose down
```

---

## 📖 API Documentation Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new user account. Seeds 100 free credits. | No |
| `GET` | `/api/tasks` | Fetch active marketplace tasks for user. | Yes |
| `POST` | `/api/tasks` | Create a new campaign. Deducts cost from user. | Yes |
| `POST` | `/api/tasks/complete` | Submit proof for a task. | Yes |
| `POST` | `/api/tasks/manage` | Approve/Reject submitted task proof. | Yes |
| `GET` | `/api/dashboard/stats` | Retrieve user stats, transactions, campaigns. | Yes |
| `POST` | `/api/reports` | Report a worker for fraud. | Yes |
| `GET` | `/api/admin` | Retrieve overall metrics, users list, and reports. | Admin |
| `POST` | `/api/admin` | Suspend user, adjust credit, resolve report. | Admin |
