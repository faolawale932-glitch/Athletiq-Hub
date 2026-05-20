# Athletiq Hub - Production-Ready Sports Platform

A full-stack monorepo application for athletes to share their achievements, connect with others, and celebrate wins. Built with modern technologies and ready for production deployment.

## 🎯 Features

- **Results Feed**: Share athletic achievements with community
- **User Authentication**: JWT-based secure authentication
- **Comments & Likes**: Engage with other athletes' results
- **Image Uploads**: Cloudinary integration for media
- **Cross-Platform**: Web, mobile, and API support
- **Real-time Updates**: Live feed and notifications ready
- **Performance Metrics**: Track and showcase athletic stats
- **Scalable Architecture**: Monorepo with Docker & Kubernetes ready

## 🏗️ Architecture

```
Athletiq-Hub/
├── apps/
│   ├── api/              # Express + TypeScript backend
│   ├── web/              # Next.js web application
│   └── mobile/           # Expo React Native app
├── prisma/               # Database schema
├── packages/             # Shared utilities
├── docker-compose.yml    # Local development
├── .github/workflows/    # CI/CD pipelines
└── scripts/              # Setup and deployment
```

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - ORM
- **JWT** - Authentication
- **Cloudinary** - Image storage

### Frontend
- **Next.js 14** - React framework
- **TailwindCSS** - Styling
- **TypeScript** - Type safety

### Mobile
- **Expo** - React Native framework
- **Axios** - HTTP client

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **Prisma** - Migrations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Git

### Setup

```bash
# 1. Clone repository
git clone https://github.com/faolawale932-glitch/Athletiq-Hub.git
cd Athletiq-Hub

# 2. Copy environment file
cp .env.example .env.local

# 3. Install dependencies
npm install

# 4. Start services with Docker
docker-compose up -d

# 5. Run database migrations
npx prisma migrate deploy

# 6. Start development servers
npm run dev
```

## 📋 Available Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:api         # Start API only
npm run dev:web         # Start web only
npm run dev:mobile      # Start mobile dev server

# Database
npm run db:migrate      # Run migrations
npm run db:seed         # Seed test data
npm run db:studio       # Open Prisma Studio

# Testing
npm run test            # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report

# Linting & Type Checking
npm run lint            # Run ESLint
npm run type-check      # TypeScript check
npm run format          # Format with Prettier

# Docker
docker-compose up       # Start all services
docker-compose down     # Stop all services
docker-compose logs -f  # View logs

# Deployment
npm run build           # Build for production
npm run start           # Start production server
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Results
- `GET /api/v1/results` - Get all results
- `POST /api/v1/results` - Create result (auth required)
- `PUT /api/v1/results/:id` - Update result (auth required)
- `DELETE /api/v1/results/:id` - Delete result (auth required)

### Comments
- `POST /api/v1/comments` - Add comment (auth required)
- `GET /api/v1/results/:id/comments` - Get comments for result

### Likes
- `POST /api/v1/likes` - Like result (auth required)
- `DELETE /api/v1/likes/:resultId/:userId` - Unlike result (auth required)

### Health
- `GET /health` - API health check

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test specific service
npm run test --workspace=@athletiq/api
npm run test --workspace=@athletiq/web

# Coverage report
npm run test:coverage
```

## 📱 Mobile App

The mobile app is built with Expo React Native and provides:
- Results feed with real-time updates
- User profiles
- Like & comment functionality
- Image uploads
- Push notifications (ready to implement)

```bash
# Start Expo dev server
npm run dev:mobile

# Build APK
eas build --platform android

# Build IPA
eas build --platform ios
```

## 🔐 Environment Configuration

Create `.env.local` file with:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/athletiq_hub

# API
PORT=3001
JWT_SECRET=your-super-secret-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Cloudinary
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Slack (optional)
SLACK_WEBHOOK_URL=your-webhook-url
```

## 🐳 Docker Deployment

```bash
# Build images
docker build -t athletiq-api ./apps/api
docker build -t athletiq-web ./apps/web

# Run with compose
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web
```

## 🚢 Production Deployment

### Deploy Web (Vercel)
```bash
npm i -g vercel
vercel deploy --prod
```

### Deploy API (Railway/Heroku)
```bash
# Railway
railway up

# Heroku
heroku create
git push heroku main
```

### Deploy Database
- Use Railway, AWS RDS, or DigitalOcean Managed Postgres
- Run migrations: `npx prisma migrate deploy`

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
1. ✅ Runs tests on every push
2. ✅ Type-checks TypeScript
3. ✅ Builds Docker images
4. ✅ Pushes to registry
5. ✅ Deploys to production (main branch)
6. ✅ Notifies Slack on status

## 📈 Monitoring & Logging

- **API Logs**: `docker-compose logs api`
- **Web Logs**: `docker-compose logs web`
- **Database**: Prisma Studio at `http://localhost:5555`
- **Health Check**: `http://localhost:3001/health`

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open pull request

## 📝 Database Schema

### User
- id, email, password, username
- firstName, lastName, profileImage, bio
- createdAt, updatedAt

### Result
- id, userId, title, description, imageUrl
- category, performance, performanceUnit, location
- createdAt, updatedAt

### Comment
- id, resultId, userId, content
- createdAt, updatedAt

### Like
- id, resultId, userId
- createdAt
- Unique constraint: (resultId, userId)

### Event
- id, userId, title, description, imageUrl
- eventDate, location
- createdAt, updatedAt

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Database Schema](./prisma/schema.prisma)
- [Setup Guide](./docs/SETUP.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🐛 Known Issues & Roadmap

### Current Status
- ✅ Core API endpoints
- ✅ Database schema
- ✅ Authentication
- ✅ Docker setup
- ✅ CI/CD pipeline
- 🔄 Real-time WebSocket support (in progress)
- 🔄 Push notifications (in progress)
- 📋 Analytics dashboard
- 📋 Performance improvements

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

- 📧 Email: support@athletiqhub.com
- 🐛 Issues: [GitHub Issues](https://github.com/faolawale932-glitch/Athletiq-Hub/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/faolawale932-glitch/Athletiq-Hub/discussions)

## 🎉 Acknowledgments

Built with ❤️ for the athletic community.

---

**Ready to deploy? Let's go!** 🚀
