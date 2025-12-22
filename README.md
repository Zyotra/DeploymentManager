# Deployment Manager API

A comprehensive VPS and domain management API built with Elysia.js and Bun runtime. This API enables users to manage their Virtual Private Servers (VPS), domains, and GitHub authentication configurations.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Security](#security)
- [Environment Variables](#environment-variables)

## Overview

The Deployment Manager API provides a secure interface for managing VPS machines, domains, and GitHub authentication. It uses JWT-based authentication, encrypted password storage, and SSH connectivity for remote server management.

## Features

- **VPS Management**: Add, update, delete, and retrieve VPS machines
- **Domain Management**: Add, delete, and retrieve user domains
- **GitHub Authentication**: Configure GitHub credentials on VPS machines
- **Machine Analytics**: View real-time system information (CPU, RAM, disk, OS)
- **Secure Authentication**: JWT token-based access control
- **Password Encryption**: AES encryption for VPS passwords
- **SSH Integration**: Remote command execution via SSH2

## Tech Stack

- **Runtime**: Bun
- **Framework**: Elysia.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (jsonwebtoken)
- **Encryption**: CryptoJS
- **SSH**: ssh2 library
- **CORS**: @elysiajs/cors

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────┐
│   Elysia App    │
│  (index.ts)     │
└──────┬──────────┘
       │
       ├──► CORS Middleware
       │
       ├──► Auth Middleware (checkAuth)
       │    └──► JWT Verification
       │
       └──► Route Handlers
            │
            ├──► Controllers
            │    ├──► Machines
            │    ├──► Domains
            │    └──► GitHub
            │
            ├──► Database (Drizzle ORM)
            │    └──► PostgreSQL
            │
            ├──► SSH Client
            │    └──► Remote VPS Commands
            │
            └──► Crypto Utils
                 └──► Password Encryption/Decryption
```

## Getting Started

### Prerequisites

- Bun runtime installed
- PostgreSQL database
- Node.js (for npm packages)

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables (see Environment Variables section)
cp .env.example .env

# Generate database migrations
bun run generate

# Run migrations
bun run migrate

# Start development server
bun run dev
```

### Build for Production

```bash
bun run build
```

## API Endpoints

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API welcome message |

### Protected Endpoints (Require Authentication)

#### VPS Management

| Method | Path | Description |
|--------|------|-------------|
| POST | `/add-machine` | Add a new VPS machine |
| GET | `/get-machines` | Get all user's VPS machines |
| PUT | `/update-machine/:id` | Update VPS password or expiry date |
| DELETE | `/delete-machine/:id` | Delete a VPS machine |
| GET | `/get-machine-analytics/:id` | Get real-time machine analytics |

#### Domain Management

| Method | Path | Description |
|--------|------|-------------|
| POST | `/add-domain` | Add a new domain |
| GET | `/get-domains` | Get all user's domains |
| DELETE | `/delete-domain/:id` | Delete a domain |

#### GitHub Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/authenticate-github/:id` | Authenticate GitHub on a VPS |
| GET | `/unauthenticate-github/:id` | Remove GitHub authentication |
| GET | `/get-github-auths/:id` | Get GitHub authentication status |

## Database Schema

### Tables

1. **vps_machines**: Stores VPS machine information
   - id, vps_ip, vps_name, vps_password (encrypted)
   - ownerId, ssh_key (encrypted), ram, storage, cpu_cores
   - expiryDate, added_at, updated_at

2. **user_domains**: Stores user domain configurations
   - id, domain_address, vps_ip, ownerId
   - isDeployed, added_at

3. **github_auths**: Stores GitHub authentication records
   - id, vpsId, github_username, added_at

## Security

- **JWT Authentication**: All protected routes require valid access token
- **Password Encryption**: VPS passwords encrypted using AES encryption
- **Owner Verification**: Users can only access their own resources
- **SQL Injection Prevention**: Drizzle ORM with parameterized queries
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Required field validation on all endpoints

## Environment Variables

```env
# Server Configuration
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# JWT
ACCESS_TOKEN_SECRET=your-secret-key-here

# Encryption
ENCRYPTION_KEY=your-encryption-key-here
ENCRYPTION_ALGORITHM=AES
```

## API Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `419` - Expired Token
- `500` - Internal Server Error

## Development

```bash
# Watch mode
bun run dev

# Generate migrations
bun run generate

# Run migrations
bun run migrate
```

## License

Copyright © Zyotra

---

For detailed technical documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)
