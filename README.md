# Application — Event Management System

A full-stack event management application built with React, NestJS, and PostgreSQL.

## 🚀 Live Demo

- **Frontend**: https://carefree-serenity-production.up.railway.app
- **Backend API**: https://application-production-79a2.up.railway.app
- **Swagger Docs**: https://application-production-79a2.up.railway.app/api/docs

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Zustand
- **Backend**: NestJS + TypeScript + TypeORM
- **Database**: PostgreSQL
- **Auth**: JWT (HTTP-only cookies)
- **AI Assistant**: Groq API (llama-3.3-70b-versatile)
- **Containerization**: Docker + docker-compose
- **Deployment**: Railway
- **Component Library**: Storybook

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed
- [Docker Compose](https://docs.docker.com/compose/) installed
- Groq API key (get one free at https://console.groq.com)

## Quick Start (One Command)

```bash
docker-compose up --build
```

Then open:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger docs**: http://localhost:3000/api/docs
- **Storybook**: http://localhost:6006 (run separately, see below)

## Setup Steps

### 1. Clone the repository

```bash
git clone https://github.com/helen-akateva/Application.git
cd Application
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_secret_key
```

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

## Storybook

To run the component library locally:

```bash
cd frontend
npm install
npm run storybook
```

Opens at **http://localhost:6006**

Available stories:

- `Button` — all variants, sizes, states (loading, disabled, with icons)
- `TagChip` — color variants and sizes
- `EventCard` — joined, organizer, full event states
- `EventForm` — create, edit, submitting, error states
- `Navbar` — logged in and logged out states

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
│   │   ├── ai/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── tags/
│   │   ├── users/
│   │   └── common/
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── .storybook/
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Documentation

Swagger UI is available at:

- **Local**: http://localhost:3000/api/docs
- **Production**: https://application-production-79a2.up.railway.app/api/docs

## Database Schema

- **Users** — stores registered users
- **Events** — stores events with organizer reference
- **Participants** — many-to-many join table between Users and Events
- **Tags** — stores event tags with colors
- **EventTags** — many-to-many join table between Events and Tags

## Key Features

- 🔐 **Authentication** — Secure login and registration using JWT and HTTP-only cookies.
- 📅 **Event Management** — Create, edit, and organize events with a clean, responsive UI.
- 🏷️ **Advanced Tagging** — Categorize events with a multi-tag system and custom colors.
- 🤖 **AI Assistant (Read-only)** — Natural language insights about your schedule powered by Groq.
- 📦 **State Management** — Efficient global state handling with Zustand.
- 📚 **Component Library** — Documented and visually tested components in Storybook.
- 🐳 **Docker Support** — Seamless local development environment with Docker Compose.
