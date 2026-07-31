# Quizzario - Quiz Builder Platform

Quizzario is a full-stack web application for creating, managing, and playing custom quizzes. Built with Node.js/Express, React/Next.js, TypeScript, PostgreSQL, and Prisma.

---

## Getting Started (Docker Compose - Recommended)

The easiest way to run the application is using Docker Compose, which starts the PostgreSQL database, backend service, and frontend service automatically.

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed.

### Setup and Start

1. **Environment Configuration**
   - Copy `.env.example` in the root directory to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Make sure database configuration and port configuration match your environment.

2. **Start the containers**
   - Build and start the containers in detached mode:
     ```bash
     docker compose up --build -d
     ```

3. **Synchronize Database Schema**
   - Push the Prisma schema directly to the database:
     ```bash
     docker compose exec backend npx prisma db push
     ```

4. **Verify Running Services**
   - **Frontend UI**: `http://localhost:3000`
   - **Backend API**: `http://localhost:4000/api`
   - **PostgreSQL**: `localhost:5432`

---

## Local Development (Without Docker)

If you prefer to run the services locally on your machine, follow these steps.

### 1. Database Setup
- Ensure a PostgreSQL instance is running.
- In the `backend` folder, create a `.env` file referencing your local database:
  ```env
  DATABASE_URL="postgresql://postgres:password@localhost:5432/quiz_db?schema=public"
  ```
- Generate Prisma Client and push tables:
  ```bash
  cd backend
  npm install
  npx prisma db push
  ```

### 2. Run Backend
- Start the Express server in development mode:
  ```bash
  npm run dev
  ```
- The backend will listen on `http://localhost:4000`.

### 3. Run Frontend
- Configure your API environment variable in the `frontend` folder (`.env` or `.env.local`):
  ```env
  NEXT_PUBLIC_API_URL="http://localhost:4000/api"
  ```
- Start the Next.js development server:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- Open `http://localhost:3000` in your browser.

---

## Developer Tooling

Both frontend and backend are configured with ESLint and Prettier for code quality and styling consistency.

- **Lint Backend**: `npm run lint` (inside `backend`) or `docker compose exec backend npm run lint`
- **Lint Frontend**: `npm run lint` (inside `frontend`) or `docker compose exec frontend npm run lint`
- **Format Files**: `npx prettier --write .` (from workspace root)

---

## Creating a Sample Quiz

### Method A: Via Frontend UI (Recommended)
1. Navigate to `http://localhost:3000/create` in your web browser.
2. Enter a **Quiz Title** (e.g., "General Knowledge").
3. Add questions by clicking **+ Add Question** and configuring the properties:
   - **Boolean**: True/False radio buttons.
   - **Short Text Input**: Short text answers (case-insensitive matches).
   - **Multiple Choice**: Choice options with checkbox answers.
4. Click **Save Quiz** to submit.

### Method B: Via API Request (cURL)
You can create a sample quiz by executing a `POST` request to the backend API:

```bash
curl -X POST http://localhost:4000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "General Knowledge",
    "questions": [
      {
        "type": "BOOLEAN",
        "text": "The Earth is flat.",
        "answers": ["false"]
      },
      {
        "type": "INPUT",
        "text": "What is the capital of France?",
        "answers": ["Paris"]
      },
      {
        "type": "CHECKBOX",
        "options": ["JavaScript", "Python", "HTML", "C++"],
        "text": "Which of the following are programming languages?",
        "answers": ["JavaScript", "Python", "C++"]
      }
    ]
  }'
```