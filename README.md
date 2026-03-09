# Event Management System (PoC)

A simplified Event Management Application developed as a Proof of Concept (PoC). It allows users to register, login, view public events, create their own events, and join/leave existing ones. 

The project includes a Calendar view for user events, responsive design, and completely functional authorization using JWT.

## Setup Requirements
- Docker and Docker Compose installed on your machine.
- Node.js (v18+) and npm installed (if running frontend outside Docker).

## Quick Start (Backend + Database)

The easiest way to start the backend API and the PostgreSQL database is by using `docker-compose`:

```bash
docker-compose up -d --build
```

This command will:
1. Start a PostgreSQL database instance.
2. Build and start the NestJS backend application.
3. Automatically run a seeding script to populate the database with initial dummy users and events.

**Note:** The backend API will be available at `http://localhost:3000`. Swagger API documentation is accessible at `http://localhost:3000/api/docs`.

### Seeded Data
Once the backend container starts, the following accounts are available for testing:
- **Test User 1:** `test@example.com` / `password123`
- **Test User 2:** `user2@example.com` / `password123`

## Starting the Frontend

The frontend is a React application powered by Vite. To run it locally:

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend application will be available at `http://localhost:5173`.

## Environment Variables

Both Backend and Frontend use environment variables for configuration.

**Backend (`backend/.env`):**
A `.env.example` is provided in the `backend` folder. The `docker-compose.yml` provides default environment variables, so a `.env` file is optional for the Docker setup.

**Frontend (`frontend/.env`):**
Ensure your frontend `.env` points to your backend URL.
```env
VITE_API_URL=http://localhost:3000
```

## Technologies Used
- **Frontend:** React, TypeScript, Tailwind CSS, Zustand, Formik + Yup, Axios
- **Backend:** NestJS, TypeORM, PostgreSQL, Swagger, bcrypt, JWT
- **Deployment:** Docker, Docker Compose
