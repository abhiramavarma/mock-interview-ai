# Mock Interview AI Application

## Overview

This is a full-stack conversational AI mock interview web application that allows users to conduct realistic interview sessions with an AI interviewer. The application features speech-to-text transcription using browser native capabilities, AI-powered question generation and feedback, and persistent conversation history storage.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React.js with TypeScript for type safety and component-based architecture
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js for RESTful API endpoints
- **Language**: TypeScript for type safety across the entire stack
- **API Design**: RESTful architecture with CORS support for cross-origin requests

### Data Storage
- **Database**: PostgreSQL with Neon serverless database hosting
- **ORM**: Drizzle ORM for type-safe database queries and schema management
- **Schema**: Well-structured relational database with interview sessions and conversation turns tables

## Key Components

### Database Schema
- **Interview Sessions**: Stores session metadata including topic, timing, scores, and summary
- **Conversation Turns**: Stores individual AI questions, user responses, and feedback with turn ordering
- **Relations**: One-to-many relationship between sessions and conversation turns

### Frontend Pages
- **Dashboard**: Main landing page for starting new interviews and viewing quick stats
- **Interview**: Real-time interview interface with speech recognition and conversation display
- **History**: Complete session history with filtering and search capabilities

### Backend Services
- **Storage Layer**: Abstracted database operations with interface-based design for flexibility
- **Gemini Service**: Integration with Google Gemini 2.5 Flash for question generation and feedback analysis
- **Route Handlers**: RESTful endpoints for session management and conversation turns

### Speech Integration
- **Speech-to-Text**: Browser's native Web Speech API with fallback support
- **Dual Input Modes**: Voice recognition with text input as backup option
- **Improved Recognition**: Enhanced error handling and better speech configuration
- **No External Dependencies**: Completely browser-based, no additional costs
- **User-Friendly**: Automatic fallback to text mode if speech not supported

## Data Flow

1. **Session Creation**: User selects interview topic and difficulty, creates new session
2. **AI Question Generation**: Backend generates contextual questions based on topic and conversation history
3. **Speech Recognition**: User speaks response, browser transcribes to text in real-time
4. **Response Processing**: Transcribed text sent to backend for AI analysis and feedback
5. **Feedback Generation**: AI provides constructive feedback and generates follow-up questions
6. **Persistence**: All conversation turns stored in database with proper ordering and metadata
7. **History Access**: Users can review complete conversation transcripts from past sessions

## External Dependencies

### Required Services
- **Neon Database**: PostgreSQL hosting (free tier available)
- **Google Gemini API**: Gemini 2.5 Flash for question generation and feedback (free tier available)

### Key Libraries
- **Frontend**: React, Wouter, TanStack Query, shadcn/ui, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Neon serverless client
- **Shared**: Zod for schema validation, TypeScript for type safety

## Deployment Strategy

### Development
- **Frontend**: Vite dev server with HMR and TypeScript checking
- **Backend**: tsx for TypeScript execution with hot reload
- **Database**: Drizzle Kit for schema migrations and management

### Production
- **Build Process**: Vite builds frontend to static assets, esbuild bundles backend
- **Server**: Node.js serves both API endpoints and static frontend files
- **Database**: Production PostgreSQL connection via environment variables

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **GEMINI_API_KEY**: Google Gemini API access token (required)
- **NODE_ENV**: Environment flag for development/production behavior

### Key Architectural Decisions

1. **Monorepo Structure**: Frontend, backend, and shared types in single repository for easier development
2. **Type Safety**: Full TypeScript coverage with shared schema validation using Zod
3. **Browser Speech API**: Chose native browser capabilities over external services for cost efficiency
4. **Drizzle ORM**: Selected for excellent TypeScript integration and migration management
5. **shadcn/ui**: Provides accessible, customizable components without heavy framework lock-in
6. **Session-based Architecture**: Each interview is a session with ordered conversation turns for easy history reconstruction