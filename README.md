# Brainexia - Lead Management & Outreach Automation Platform

A comprehensive AI-powered lead management and outreach automation platform built with Next.js, Express, PostgreSQL, and Prisma.

## 🚀 Features

- **Lead Management**: Complete CRUD operations for client leads
- **Advanced Filtering**: Filter leads by service type, status, email/WhatsApp sent status
- **AI-Powered Messaging**: Generate personalized messages using OpenAI
- **Multi-Channel Outreach**: Send emails and WhatsApp messages
- **Template System**: Create and manage message templates with placeholders
- **Interaction History**: Track all communications with leads
- **Dashboard Analytics**: View lead statistics and conversion metrics

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** (App Router)
- **TypeScript**
- **shadcn/ui** components
- **Tailwind CSS**
- **React Hook Form** + **Zod** validation
- **TanStack Table** (for advanced filtering)

### Backend
- **Node.js** + **Express.js**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL**
- **OpenAI API** (for AI message generation)

## 📋 Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- OpenAI API key (optional, for AI features)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Brainexia
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other configurations

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# Start development server
pnpm dev
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Set up environment variables
# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
pnpm dev
```

The frontend will run on `http://localhost:3000`

## 📝 Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_EXPIRES_IN="1d"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"
BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL=http://localhost:3000
APP_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key (optional)
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🗄️ Database Schema

The application uses the following main models:

- **User**: Authentication and user management
- **Lead**: Client lead information
- **Message**: Email/WhatsApp message logs
- **AiMessage**: AI-generated messages
- **Template**: Message templates with placeholders

## 🎯 Usage

1. **Register/Login**: Create an account or login
2. **Add Leads**: Manually add client leads with their information
3. **Filter Leads**: Use advanced filters to find specific leads
4. **Generate AI Messages**: Use the AI Composer to generate personalized messages
5. **Send Messages**: Send emails or WhatsApp messages to leads
6. **Track Interactions**: View interaction history for each lead
7. **Manage Templates**: Create and manage message templates

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Leads
- `GET /api/leads` - Get all leads (with filters)
- `POST /api/leads` - Create new lead
- `GET /api/leads/:id` - Get lead by ID
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead
- `PATCH /api/leads/bulk/status` - Bulk update lead status

### Messages
- `POST /api/messages/send` - Send message to lead
- `POST /api/messages/bulk-send` - Bulk send messages
- `GET /api/messages/history/:leadId` - Get message history

### AI
- `POST /api/ai/generate` - Generate AI message
- `POST /api/ai/bulk-generate` - Bulk generate AI messages
- `PUT /api/ai/:id/final-message` - Update final message
- `POST /api/ai/:id/send` - Send AI message

### Templates
- `GET /api/templates` - Get all templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get template by ID
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/render` - Render template with data

## 🔐 Authentication

Currently using a simple token-based authentication. In production, integrate with Better-Auth for proper session management.

## 🤖 AI Features

The AI message generation uses OpenAI's GPT models. To use this feature:

1. Get an OpenAI API key
2. Add it to `backend/.env` as `OPENAI_API_KEY`
3. The system will automatically use AI for message generation

If no API key is provided, the system falls back to template-based message generation.

## 📦 Project Structure

```
Brainexia/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/
│   │   │   ├── leads/
│   │   │   ├── messages/
│   │   │   ├── ai/
│   │   │   └── templates/
│   │   ├── middlewares/      # Express middlewares
│   │   └── routes.ts        # Route definitions
│   └── prisma/
│       └── schema.prisma     # Database schema
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/           # Auth pages
│   │   ├── (dashboard)/      # Dashboard pages
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   └── leads/            # Lead components
│   └── lib/                  # Utilities and helpers
│
└── README.md
```

## 🚧 Future Enhancements

- [ ] Better-Auth full integration
- [ ] Email sending via SMTP/SendGrid/Resend
- [ ] WhatsApp Business API integration
- [ ] Advanced analytics dashboard
- [ ] Multi-user team access
- [ ] AI learning from successful messages
- [ ] Auto follow-up reminders
- [ ] CRM integrations

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please open an issue in the repository.
