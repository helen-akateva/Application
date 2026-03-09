# Application — Event Management System

A full-stack event management application built with React, NestJS, and PostgreSQL.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + TypeScript + TypeORM
- **Database**: PostgreSQL
- **Auth**: JWT
- **Containerization**: Docker + docker-compose

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/) installed

## Quick Start (One Command)

```bash
docker-compose up --build
```

Then open:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger docs**: http://localhost:3000/api

## Setup Steps

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Application.git
cd Application
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults work out of the box with Docker).

### 3. Run the application

```bash
docker-compose up --build
```

This will:

- Start PostgreSQL database
- Build and start the NestJS backend (with DB migrations + seed data)
- Build and start the React frontend

### 4. Stop the application

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```

## Default Seed Accounts

After first launch, the database is seeded with sample data:

| Email             | Password    | Role |
| ----------------- | ----------- | ---- |
| user1@example.com | password123 | User |
| user2@example.com | password123 | User |

## Project Structure

```
Application/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── api/       # API calls
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/     # State management
│   │   └── types/
│   └── Dockerfile
├── backend/           # NestJS app
│   ├── src/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── users/
│   │   └── common/
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Documentation

Swagger UI is available at: http://localhost:3000/api

## Database Schema

- **Users** — stores registered users
- **Events** — stores events with organizer reference
- **Participants** — many-to-many join table between Users and Events
