# TailsNotes

## Overview

TailsNotes is a full-stack web application developed by HedgeTech startup that transforms slide presentations (PDF and PowerPoint files) into AI-generated annotative notes and interactive quizzes. The application provides an intelligent document processing pipeline that extracts content from uploaded files and uses OpenAI's GPT models to generate structured learning materials.

## User Preferences

- Preferred communication style: Simple, everyday language
- Design: Minimalistic, dark mode by default
- Color scheme: Orange and yellow gradient colors
- Typography: Poppins and Helvetica Neue fonts
- UI approach: Clean interface without too many displayed elements
- Branding: TailsNotes developed by HedgeTech startup

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive shadcn/ui component system with Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **File Processing**: Multer for handling multipart form uploads with memory storage
- **Development**: Hot reloading with Vite middleware integration
- **API Design**: RESTful endpoints with structured error handling

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Strategy**: In-memory storage implementation with interface for easy database swapping

### File Processing Pipeline
- **Upload Handling**: 50MB file size limit with validation for PDF and PowerPoint formats
- **Content Extraction**: Simulated text extraction from documents (placeholder for production libraries)
- **Storage**: Local file system storage in uploads directory
- **Processing Flow**: Upload → Extract Text → Generate AI Content → Store Results

### AI Integration
- **Provider**: OpenAI GPT-4o for content generation
- **Note Generation**: Structured notes with sections, key points, and summaries
- **Quiz Generation**: Multiple-choice questions with explanations
- **Content Processing**: Intelligent extraction and formatting of educational content

### Session Management
- **Architecture**: Session-based organization of uploaded files and generated content
- **User Context**: Demo user system with extensible authentication foundation
- **Data Organization**: Files, notes, and quizzes are grouped by session for logical organization

### Development and Build
- **Development Server**: Vite dev server with Express backend integration
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **TypeScript**: Strict type checking with path mapping for clean imports
- **Hot Reloading**: Full-stack development with automatic refresh

## External Dependencies

### Database and Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database operations and migrations
- **Multer**: File upload middleware for Express

### AI and Content Processing
- **OpenAI API**: GPT-4o model for generating notes and quizzes from document content
- **File Processing Libraries**: Placeholder implementations for PDF and PowerPoint text extraction

### Frontend Libraries
- **React Ecosystem**: React 18 with TypeScript support
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight routing solution
- **shadcn/ui**: Complete UI component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Modern build tool with fast HMR
- **TypeScript**: Static type checking and enhanced developer experience
- **esbuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations for Replit platform

### Validation and Forms
- **Zod**: Schema validation for API inputs and database operations
- **React Hook Form**: Form state management with validation
- **Drizzle Zod**: Integration between Drizzle ORM and Zod validation

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **clsx**: Conditional className utility
- **nanoid**: Unique ID generation
- **class-variance-authority**: Type-safe variant styling