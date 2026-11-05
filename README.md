# IntelliView: The AI-Powered Mock Interview Platform

IntelliView is a full-stack, AI-powered platform designed to help users prepare for technical and behavioral interviews. It provides a realistic, high-pressure interview environment, complete with personalized questions, company-specific practice, and detailed performance analysis.

**Project Status:** Ready for deployment configuration
## Hosting readiness

This project is structured for a split deployment:

- Frontend: Vercel or any static host using `npm run build` from `frontend` and a `dist` output directory.
- Backend: Render/Railway/VM hosting using `server` and `npm run build`, then `npm start`.
- Database: PostgreSQL 16; the server expects `DATABASE_URL` and a running Docker/Postgres instance during local development.
- Authentication: the frontend keeps a dev-only demo mode in `frontend/.env` (`VITE_ENABLE_REAL_AUTH=false`) so it remains safe for local development, but production must set `VITE_ENABLE_REAL_AUTH=true` and the server must receive valid Google OAuth values.

Local host setup:

```powershell
cd server
# start PostgreSQL using Docker Desktop
# docker compose up -d
npx prisma migrate deploy
npm run dev

cd ../frontend
npm run dev
```

Production deployment requires the real service credentials in `server/.env` and a valid `FRONTEND_URL`/`GOOGLE_CALLBACK_URL` before enabling real auth.

### Render deployment

The repository includes [`render.yaml`](./render.yaml). Create a Render Blueprint from the repository, then provide every `sync: false` value in the Render dashboard. Use the generated Render service URL as the backend domain.

### Vercel deployment

Set the Vercel project root directory to `frontend`. The included [`frontend/vercel.json`](./frontend/vercel.json) keeps React Router routes working after refresh. Set `VITE_API_URL` to the deployed backend URL ending in `/api` and set `VITE_ENABLE_REAL_AUTH=true`.

### Production verification

After both services are deployed:

```text
GET https://YOUR_BACKEND_DOMAIN/health
GET https://YOUR_BACKEND_DOMAIN/api
```

Then test Google login, logout, resume upload, and question generation from the deployed frontend. Do not enable production auth until the Google callback URL exactly matches the URL configured in Google Cloud.

---

## 🚀 Core Features

- **Dynamic Question Generation:** The AI (using RAG) generates a unique set of interview questions based on the user's **uploaded resume/CV**, the target **job role**, and the **company** they are applying to.

- **Company-Specific RAG:** The platform is pre-loaded with a vector database of "Previous Year Questions" (PYQs) for major companies. The AI retrieves and incorporates these specific questions into the interview.

- **Realistic Video Interview:** A sleek, timed, and interactive UI that presents questions one by one and records the user's video and audio answers, simulating a real remote interview.

- **Real-time Proctoring & Anti-Cheating:**

  - **Gaze Detection:** Flags when the user is consistently looking away from the screen.
  - **Multi-Face Detection:** Detects if more than one person is in the frame.
  - **Object Detection:** Identifies forbidden objects like a mobile phone.
  - **Real-time Alerts:** Provides a "proctoring report" at the end, highlighting potential violations.

- **Instant Post-Interview Analysis:**
  - **Speech-to-Text:** Transcribes all spoken answers.
  - **AI-Powered Feedback:** The Generative AI analyzes the _content_ of the transcript, providing a score and constructive feedback for each answer.
  - **Detailed Report Card:** A final report gives an overall score, a breakdown by question, and a summary of all proctoring flags.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express 5, TypeScript, Prisma 7, PostgreSQL

  - Handles API logic, Google OAuth/JWT authentication, resume processing, and AI question generation.
  - Uses PostgreSQL through Prisma and Cloudinary for resume storage.

- **Frontend:** React 19, Vite 7, TypeScript, Tailwind CSS 4

  - Manages all UI, state, and user interaction.
  - Captures the interview workflow and communicates with the backend through Axios.

- **Generative AI & ML:**
  - **GenAI (e.g., OpenAI/Gemini):** For question generation and answer evaluation.
  - **Speech-to-Text (e.g., Whisper):** For transcribing audio from video answers.
  - **Computer Vision (e.g., OpenCV, MediaPipe):** For all real-time proctoring tasks.
  - **Vector Database (e.g., Chroma, Pinecone):** For storing and retrieving company-specific PYQs.

---

## 📦 Project Structure

```
IntelliView/
├── frontend/          # React + TypeScript + Vite + TailwindCSS
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/            # Node.js + Express + TypeScript + Prisma
│   ├── src/
│   │   ├── config/        # Database & AWS S3 config
│   │   ├── controllers/   # Route controllers
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helper functions
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── migrations/    # Database migrations
│   ├── docker-compose.yml # PostgreSQL container
│   └── package.json
│
├── plan.md            # Project roadmap
└── README.md          # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Docker Desktop** (for PostgreSQL)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/intelliview.git
cd IntelliView
```

### 2. Server Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (see Environment Variables section below)
cp .env.example .env
# Edit .env with your actual credentials

# Start PostgreSQL database
docker-compose up -d

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (optional - database GUI)
npx prisma studio
```

#### Server Environment Variables

Create `server/.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/intelliview?schema=public"

# JWT Secrets (Change these in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-refresh-token-secret-change-in-production"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:8000/api/auth/google/callback"

# AWS S3 (Get from AWS Console)
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

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

### 4. Start Development

**Terminal 1 - Server:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

**Access the application:**

- Frontend: http://localhost:5173
- Server API: http://localhost:8000
- Prisma Studio: http://localhost:51212 (if running)

---

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account (for file storage)
- OpenAI API key (for AI features)
- Pinecone account (for vector database)

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` in the server directory:

```bash
cd server
cp .env.example .env
```

Fill in the required values:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/intelliview

# Cloudinary (for file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (for AI features)
OPENAI_API_KEY=sk-your-openai-key

# Pinecone (for vector database)
PINECONE_API_KEY=your-pinecone-key
```

### 3. Database Setup

```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

### 4. Create Pinecone Index

1. Go to [Pinecone Console](https://app.pinecone.io)
2. Create index: `intelliview-company-questions`
3. Dimensions: `1536`
4. Metric: `cosine`

### 5. Seed Company Questions

```bash
cd server
npm run seed:questions
```

### 6. Start Application

```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 📊 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts with Google OAuth
- **Resume** - Uploaded resumes with parsed data
- **Company** - Company profiles
- **Interview** - Interview sessions
- **InterviewSession** - Q&A pairs within interviews
- **Question** - Question bank
- **ProctoringLog** - Proctoring violation logs
- **InterviewExperience** - Community-submitted experiences
- **PastQuestion** - Company-specific previous questions

To view/edit the database visually:

```bash
cd server
npx prisma studio
```

---

## 📚 API Endpoints

### Resume APIs

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| POST   | `/api/resumes/upload` | Upload PDF resume   |
| GET    | `/api/resumes`        | Get user's resumes  |
| GET    | `/api/resumes/:id`    | Get specific resume |
| DELETE | `/api/resumes/:id`    | Delete resume       |

### Interview APIs

| Method | Endpoint                            | Description        |
| ------ | ----------------------------------- | ------------------ |
| POST   | `/api/interview/generate-questions` | Generate questions |
| GET    | `/api/interview/job-roles`          | Get job roles      |
| GET    | `/api/interview/companies`          | Get companies      |

### Example: Generate Questions

```json
POST /api/interview/generate-questions
{
  "resumeId": "uuid",
  "jobRole": "Software Engineer",
  "company": "Google",
  "numberOfQuestions": 10
}
```

---

## 🐳 Docker Commands

```bash
# Start PostgreSQL
cd server
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Stop and remove all data
docker-compose down -v
```

---

## 🔧 Useful Commands

### Server

```bash
cd server

# Development
npm run dev              # Start with hot reload
npm run build           # Build for production
npm start               # Run production build

# Database
npx prisma generate     # Generate Prisma client
npx prisma migrate dev  # Create & apply migration
npx prisma studio       # Open database GUI
npx prisma format       # Format schema file

# Docker
docker-compose up -d    # Start PostgreSQL
docker-compose down     # Stop PostgreSQL
```

### Frontend

```bash
cd frontend

npm run dev             # Start dev server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

---

## 🎯 Current Development Status

### ✅ Completed (Phase 1)

- [x] Project structure setup
- [x] PostgreSQL database with Docker
- [x] Prisma ORM configuration
- [x] Complete database schema design
- [x] Basic Express server setup
- [x] Frontend scaffolding with Vite + React + TypeScript
- [x] TailwindCSS configuration

### 🚧 In Progress (Phase 2)

- [ ] Google OAuth authentication
- [ ] Resume file upload with AWS S3
- [ ] JWT token management
- [ ] User profile management

### 📋 Planned (Phase 3+)

- [ ] AI question generation with OpenAI
- [ ] Resume parsing and skill extraction
- [ ] Interview session management
- [ ] Real-time proctoring with WebRTC
- [ ] Speech-to-text integration
- [ ] Answer evaluation with AI
- [ ] Community features (PYQs, experiences)

---

## 🤝 Contributing

See [CONTRIBUTOR.md](CONTRIBUTOR.md) for contribution guidelines.

---

## 📝 License

This project is licensed under the MIT License.

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if Docker is running
docker ps

# Restart PostgreSQL
cd server
docker-compose restart

# Check logs
docker-compose logs postgres
```

### Port Already in Use

If you get port conflicts:

**Server (Port 8000):**
Edit `server/.env`:

```
PORT=8001
```

**PostgreSQL (Port 5432):**
Edit `server/docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

Then update `DATABASE_URL` in `server/.env`

**Frontend (Port 5173):**

```bash
cd frontend
npm run dev -- --port 5174
```

### Prisma Issues

```bash
cd server

# Regenerate client
npx prisma generate

# Reset database (WARNING: deletes all data!)
npx prisma migrate reset
```

---

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
#   I n t e l l i V i e w 1  
 #   I n t e l l i V i e w 1  
 #   I n t e l l i V i e w 1  
 