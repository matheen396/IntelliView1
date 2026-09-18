# IntelliView Backend Server

Backend server for the IntelliView AI-powered mock interview platform.

## ✅ What's Been Set Up

### 1. Database (PostgreSQL with Prisma ORM)

- **Database**: PostgreSQL running in Docker container
- **ORM**: Prisma 7.2.0 with TypeScript
- **Schema**: Complete database design with all models

### 2. Database Models

- **User** - User accounts with Google OAuth support
- **Resume** - Resume storage and parsing
- **Company** - Company information
- **Interview** - Interview sessions
- **InterviewSession** - Individual Q&A sessions
- **Question** - Question bank
- **ProctoringLog** - Proctoring violation logs
- **InterviewExperience** - User-submitted experiences
- **PastQuestion** - Company-specific PYQs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Docker Desktop running
- npm or yarn

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL database
docker-compose up -d

# 3. Run Prisma migrations
npx prisma migrate dev

# 4. Generate Prisma client
npx prisma generate

# 5. Open Prisma Studio (database GUI)
npx prisma studio
```

### Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/intelliview?schema=public"

# JWT Secrets
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-token-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:8000/api/auth/google/callback"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="intelliview-uploads"

# Frontend URL
FRONTEND_URL="http://localhost:5173"

# Server
NODE_ENV="development"
PORT=8000
```

## 📊 Prisma Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset

# Open Prisma Studio (Database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Check for schema issues
npx prisma validate
```

## 🐳 Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Stop and remove data
docker-compose down -v
```

## 📁 Project Structure

```
server/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Migration history
│   └── prisma.config.ts       # Prisma configuration (v7)
├── src/
│   ├── config/
│   │   └── database.ts        # Prisma client instance
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── docker-compose.yml         # PostgreSQL container
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

## 🔧 Database Schema Overview

### Core Tables

- **User**: Authentication and profile
- **Resume**: File storage and parsed data
- **Interview**: Interview sessions
- **InterviewSession**: Individual questions/answers
- **Question**: Question bank
- **ProctoringLog**: Cheating detection logs

### Community Features

- **Company**: Company profiles
- **PastQuestion**: Community-submitted PYQs
- **InterviewExperience**: User interview experiences

## 🎯 Next Steps

1. **Authentication**

   - Implement Google OAuth routes
   - Add JWT token generation
   - Create auth middleware

2. **File Upload**

   - Set up AWS S3 integration
   - Add resume parsing (PDF extraction)
   - Implement multer-s3 middleware

3. **API Routes**

   - User management endpoints
   - Interview CRUD operations
   - Question generation service

4. **AI Integration**

   - OpenAI API for question generation
   - Resume parsing with GPT
   - Answer evaluation

5. **Proctoring**
   - WebRTC integration
   - Real-time monitoring
   - Violation detection

## 📝 Notes

- Using Prisma 7.x which requires `prisma.config.ts` instead of `datasource.url` in schema
- PostgreSQL runs on port 5432
- Prisma Studio runs on http://localhost:51212
- Database credentials: `postgres:password`

## 🐛 Troubleshooting

### Can't connect to database

```bash
# Check if Docker is running
docker ps

# Restart the container
docker-compose restart

# Check logs
docker-compose logs postgres
```

### Prisma errors

```bash
# Regenerate client
npx prisma generate

# Reset database (loses all data!)
npx prisma migrate reset
```

### Port conflicts

If port 5432 is in use, edit `docker-compose.yml`:

```yaml
ports:
  - "5433:5432" # Use 5433 instead
```

Then update DATABASE_URL in `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5433/intelliview?schema=public"
```

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
