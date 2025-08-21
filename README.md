# TailsNotes 📚✨

**AI-Powered Learning Assistant**

Transform your presentations into beautiful notes and interactive quizzes with AI.

![TailsNotes Logo](https://img.shields.io/badge/TailsNotes-AI%20Learning-orange?style=for-the-badge&logo=brain)

## 🌟 Overview

TailsNotes is an intelligent learning companion that transforms your PowerPoint presentations and PDF documents into comprehensive study materials. Using advanced AI technology, it automatically generates structured notes and interactive quizzes to enhance your learning experience.

## ✨ Features

### 🤖 AI-Powered Content Generation
- **Smart Notes Creation**: Convert presentations and PDFs into beautifully formatted, comprehensive study notes
- **Interactive Quizzes**: Generate multiple-choice quizzes with explanations based on your content
- **Dual AI Support**: Powered by OpenAI GPT models with Gemini AI fallback for reliability

### 📁 File Processing
- **Multi-Format Support**: Upload PowerPoint (.pptx, .ppt) and PDF files
- **Bulk Processing**: Handle multiple files simultaneously
- **Smart Extraction**: Intelligent text extraction and content analysis

### 📊 Session Management
- **Learning Sessions**: Organize your study materials into focused sessions
- **Progress Tracking**: Monitor notes and quiz generation progress
- **Session History**: Easy access to previous learning sessions

### 🎨 Modern UI/UX
- **Dark Mode Interface**: Easy on the eyes for extended study sessions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Intuitive Navigation**: Clean, organized interface with sidebar navigation
- **Real-time Updates**: Live progress tracking and status updates

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- PostgreSQL database
- OpenAI API key (recommended)
- Gemini AI API key (optional, for fallback)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tailsnotes.git
   cd tailsnotes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/tailsnotes"
   
   # AI Service Keys
   OPENAI_API_KEY="your-openai-api-key"
   GEMINI_API_KEY="your-gemini-api-key"  # Optional fallback
   GOOGLE_API_KEY="your-gemini-api-key"   # Alternative to GEMINI_API_KEY
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Database Setup**
   ```bash
   # Push database schema
   npm run db:push
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 with TypeScript
- Tailwind CSS for styling
- Wouter for routing
- TanStack Query for state management
- Radix UI components

**Backend**
- Express.js server
- PostgreSQL with Drizzle ORM
- Multer for file uploads
- WebSocket support

**AI Integration**
- OpenAI GPT models (primary)
- Google Gemini AI (fallback)
- Intelligent content processing

### Project Structure
```
TailsNotes/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── pages/          # Application pages
│   └── index.html
├── server/                 # Express backend
│   ├── services/           # AI and file processing services
│   │   ├── fileProcessor.ts
│   │   ├── gemini.ts
│   │   └── openai.ts
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts
└── uploads/                # File upload directory
```

## 🔧 API Endpoints

### Sessions
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:sessionId/files` - Get session files
- `GET /api/sessions/:sessionId/notes` - Get session notes
- `GET /api/sessions/:sessionId/quizzes` - Get session quizzes

### File Processing
- `POST /api/sessions/:sessionId/upload` - Upload files
- `POST /api/sessions/:sessionId/generate-notes` - Generate notes for specific file
- `POST /api/sessions/:sessionId/generate-quiz` - Generate quiz for specific file

### User Management
- `GET /api/user` - Get current user info

## 🎯 Usage

1. **Create a New Session**: Click "New Session" to start a learning session
2. **Upload Files**: Drag and drop or select your PowerPoint/PDF files
3. **Generate Content**: Choose to generate notes, quizzes, or both
4. **Study**: Review the AI-generated content and test your knowledge
5. **Track Progress**: Monitor your learning sessions in the sidebar

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```
This starts both the frontend and backend in development mode with hot reloading.

### Building for Production
```bash
npm run build
```

### Type Checking
```bash
npm run check
```

### Database Management
```bash
# Push schema changes
npm run db:push
```

## 📝 Configuration

### AI Services
The application supports multiple AI providers:
- **OpenAI**: Primary service for content generation
- **Gemini AI**: Fallback service for reliability

Configure your preferred service by setting the appropriate API keys in your `.env` file.

### File Upload Limits
- Maximum file size: 50MB
- Supported formats: PDF, PowerPoint (.ppt, .pptx)
- Maximum files per upload: 10

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
OPENAI_API_KEY="your-openai-api-key"
GEMINI_API_KEY="your-gemini-api-key"
PORT=5000
```

### Deployment Platforms
- **Replit**: Ready for deployment on Replit platform
- **Heroku**: Compatible with Heroku deployment
- **Vercel**: Frontend can be deployed on Vercel with API routes
- **Railway**: Full-stack deployment supported

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by **HedgeTech**
- Powered by OpenAI and Google Gemini AI
- UI components from Radix UI and Tailwind CSS
- Icons from Lucide React

## 📧 Support

For support, feature requests, or bug reports, please open an issue on GitHub or contact the development team.

---

**Happy Learning with TailsNotes! 🚀📚**
