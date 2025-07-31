# 💳 Digital Wallet Backend

This project is a feature-rich RESTful API developed using **TypeScript**, **Express.js**, and **MongoDB** designed to simulate a Digital Wallet Backend System. It includes clear-cut flows for  **Users**, **Agents**, and **Admins**. The APIs are built for money transactions, wallet management, and approval processes.

---

## 🚀 Features

### 👤 Users
- Register & Login (with hashed passwords)
- Deposit money into their wallet
- Withdraw money
- Transfer (send) money to other users
- View own wallet and own transaction history
- Blocked User cannot perform any actions

### 🧑‍💼 Agents
- Register & Login
- Can only **cash-in** and **cash-out** if **approved by admin**
- View own wallet and own transaction history


### 🛡️ Admin
- Automatically Registered, Login
- View and manage all wallets and transactions
- Approve or suspend agents
- Block/unblock any user or agent wallet

### 💰 Wallet Features
- Automatic wallet creation on user registration
- Realtime balance update
- Blocked wallets cannot perform transactions
  

### 📜 Transactions
- All transactions are saved with:
  - `type` (add_money, send_money, cash_in, etc.)
  - `amount`, `from`, `to`
  - Timestamps

### 💡 Extra Features

- 💸 **Agent Commission System**  
  - 1% commission on every cash-out operation  
  - Commission is credited to the agent’s wallet  
  - Agents can view their commission history via  
    `GET /api/v1/transactions/commissions`

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Validation**: Zod
- **Authentication**: JWT, Passport
- **Password Hashing**: bcryptjs
- **Error Handling**: Centralized, Global Error is handled with a custom AppError Function.
- **Authorization**: Role-based (user, agent, admin)

---

## 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access (`user`, `agent`, `admin`)
- Protected routes with role checks, like no one can access the admin's route except user is an admin. This action is the same for agents' and users' routes.

---

## 📁 Project Structure
```
src
├── app
│ ├── config # Environment configs (e.g., database, secrets)
│ ├── error-helpers # Custom error classes & error formatters
│ ├── helpers # Utility functions (e.g., token generator)
│ ├── interfaces # TypeScript interfaces
│ ├── middlewares # Error handler, auth check, RBAC
│ ├── modules # Domain logic (user, wallet, transaction, auth, etc.)
│ ├── routes # Centralized route declarations
│ └── utils # Common utilities (e.g., response sender)
├── app.ts # Express app config and middlewares
├── server.ts # App startup and DB connection
.env # Environment variables
.env.example # Sample env for setup
.gitignore
eslint.config.mjs
package.json
tsconfig.json

```
---

## 🧪 API Endpoints (Sample)

### Auth
- `POST /auth/register` — Register as user/agent/admin
- `POST /auth/login` — Login and receive access token

### Wallet
- `GET /wallets/me` — Get own wallet info
- `PATCH /wallets/deposit` — Deposit money
- `PATCH /wallets/withdraw` — Withdraw money
- `PATCH /wallets/send-money` — Send money to another user

### Agent
- `PATCH /wallets/agent/cash-in` — Cash-in (requires approval)
- `PATCH /wallets/agent/cash-out` — Cash-out (requires approval)
- Agents can view their commission history via  
    `GET /api/v1/transactions/commissions`

### Admin
- `GET /admin/all-wallets` — View all wallets
- `GET /admin/all-transaction` — View all Transactions
- `PATCH /admin/wallets/block/:id` — Block a wallet
- `PATCH /admin/wallets/unblock/:id` — Unblock a wallet
- `PATCH /admin/agents/approve/:id` — Approve agent
- `PATCH /admin/agents/suspend/:id` — Suspend agent

### Transactions
- `GET /transactions/me` — View own transactions

---

## 📦 Setup Instructions

### 1. Clone the Repo

```
bash
git clone https://github.com/your-username/digital-walet-backend.git
cd digital-wallet-backend
```
### 2. Install Dependencies
```
bash
npm install
```

## 3. Configure Environment Variables
### Create a .env file and configure:
```
PORT=5000
MONGODB_URI=your mongo uri
NODE_ENV=development


# JWT

JWT_ACCESS_SECRET=access_secret
JWT_ACCESS_EXPIRES=1d
JWT_REFRESH_SECRET=JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES=30d

# bcrypt

BCRYPT_SALT_ROUND=10



#  Admin

ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=your pass
ADMIN_PHONE=your phone




# Express session
EXPRESS_SESSION_SECRET=express-session


# Frontend Url
FRONTEND_URL=http://localhost:5173
```

## 4. Start the Server

### For Development:

```bash
npm run dev
```
### For Production:

```bash
npm run build
npm run start
```

✅ Assignment Checklist
* User deposit, withdraw, send money ✅

* Agent cash-in and cash-out with approval ✅

* Admin block/unblock wallet ✅

* Admin approve/suspend agents ✅

* Transaction logs maintained ✅

* Role-based route protection ✅

* Wallet created on registration ✅

* Proper error and success handling ✅


📫 Author
Hamza Aryan Sapnil
📍 Bangladesh
🌐 LinkedIn • 💻 Full Stack Developer

📄 License
This project is licensed for educational purposes under MIT.
