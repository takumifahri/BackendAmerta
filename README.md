# Amerta Backend

Amerta is a premium Node.js backend application built with **Express**, **TypeScript**, and **Prisma**. It features a robust authentication system, profile management, and a modular design architecture.

## 🚀 Features

-   **Stateless Authentication**: OTP-based registration and password reset using JWT and HTTP-only cookies.
-   **Profile Management**: Secure profile updates and password management.
-   **Modular Mailer Service**: A flexible mailer wrapper in `src/mailer/` with dedicated services for different contexts (Auth, Profile, etc.).
-   **Prisma ORM**: Type-safe database queries with PostgreSQL.
-   **Security First**: Implemented using Helmet, CORS settings, Argon2 for password hashing, and HTTP-only cookies.
-   **API Documentation**: Comprehensive Swagger UI integration.
-   **Logging**: Advanced logging with Winston and Morgan.
-   **Static File Handling**: Automatic directory management for secure file uploads.

## 📂 Project Structure

```text
src/
├── config/             # Configuration files (CORS, Swagger, etc.)
├── controller/         # Request handlers (logic for each route)
├── database/           # Database connection and seeding scripts
├── generated/          # Generated Prisma client and types
├── interface/          # TypeScript interfaces and DTOs
├── mailer/             # Modular mailer services (Auth, Profile services)
├── middleware/         # Custom Express middlewares (Auth, Validation, Error Handling)
├── repository/         # Data access layer (Prisma queries)
├── routes/             # API route definitions and Swagger docs
├── service/            # Business logic layer
├── uploads/            # Local storage for uploaded files (git-ignored)
├── utils/              # Utility functions and helpers
├── server.ts           # Entry point for the server
└── app.ts              # Express application configuration
```

## 🛠️ Tech Stack

-   **Runtime**: Node.js (v20+)
-   **Language**: TypeScript
-   **Framework**: Express.js
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Hashing**: Argon2
-   **Auth**: JSON Web Tokens (JWT)
-   **Email**: Nodemailer
-   **Documentation**: Swagger / OpenAPI 3.0

## 🚦 Getting Started

### Prerequisites

-   Node.js and npm installed
-   PostgreSQL database instance

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/takumifahri/BackendAmerta.git
    cd BackendAmerta
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up your environment variables:
    Create a `.env` file in the root directory and add:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/AMERTADB"
    JWT_SECRET="your-jwt-secret"
    OTP_JWT_SECRET="your-otp-secret"
    SMTP_HOST="smtp.gmail.com"
    SMTP_PORT=587
    SMTP_USER="your-email@gmail.com"
    SMTP_PASS="your-app-password"
    MAIL_FROM='"Amerta" <noreply@amerta.com>'
    ```

4.  Set up the database:
    ```bash
    npm run prisma:generate
    npm run prisma:fresh-seed
    ```

### Running the Project

-   **Development Mode**:
    ```bash
    npm run dev
    ```
-   **Production Build**:
    ```bash
    npm run build
    npm start
    ```

## 📚 API Documentation

Once the server is running, you can access the interactive API documentation at:
`http://localhost:3000/api-docs`

## 📜 Available Scripts

-   `npm run dev`: Start the development server with hot-reload (tsx).
-   `npm run build`: Compile TypeScript to JavaScript.
-   `npm run start`: Run the compiled production server.
-   `npm run seed`: Populate the database with initial seed data.
-   `npm run prisma:fresh-seed`: Reset the database and re-run all seeds.
-   `npm run prisma:studio`: Open Prisma Studio to manage your database visually.

---
Built with ❤️ by [takumifahri](https://github.com/takumifahri)
