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

| Email              | Password     | Name          |
| ------------------ | ------------ | ------------- |
| oksana@example.com | Password123! | Oksana Melnyk |
| dmytro@example.com | Password456! | Dmytro Koval  |

## Project Structure

```
Application/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── users/
│   │   └── common/
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── types/
│   ├── .env.example
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
