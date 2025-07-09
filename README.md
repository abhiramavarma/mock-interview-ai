# Mock Interview AI Application

A full-stack conversational AI mock interview platform that helps users practice interviews through AI-powered conversations. Built with React, Node.js, PostgreSQL, and Google Gemini AI.

## Features

- **AI-Powered Interviews**: Intelligent question generation and feedback using Google Gemini 2.5 Flash
- **Dual Input Modes**: Voice recognition with text input fallback
- **Real-time Transcription**: Browser-based speech-to-text with enhanced error handling
- **Session Management**: Complete interview history and progress tracking
- **Feedback System**: Detailed AI feedback with scoring for each response
- **Responsive Design**: Clean, modern interface with Tailwind CSS and shadcn/ui components

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Wouter** for routing
- **TanStack Query** for state management
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **PostgreSQL** with Neon serverless
- **Google Gemini API** for AI functionality

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (we recommend Neon for free hosting)
- Google Gemini API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mock-interview-ai.git
cd mock-interview-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NODE_ENV` | Environment (development/production) | No |

## Getting API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

### Neon Database
1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string to your `.env` file

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Node.js backend
│   ├── services/          # Business logic
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data access layer
├── shared/               # Shared types and schemas
└── components.json       # shadcn/ui configuration
```

## Usage

1. **Start an Interview**: Choose your topic and difficulty level
2. **Answer Questions**: Use voice input or type your responses
3. **Get Feedback**: Receive AI-powered feedback and scoring
4. **Review History**: Access complete interview transcripts and summaries

## Features in Detail

### Speech Recognition
- Browser-native Web Speech API
- Automatic fallback to text input
- Real-time transcription with interim results
- Enhanced error handling and user feedback

### AI Integration
- Google Gemini 2.5 Flash for question generation
- Contextual follow-up questions based on conversation history
- Detailed feedback with scoring (1-10 scale)
- Session summaries with overall performance analysis

### Database Schema
- **Interview Sessions**: Store session metadata, timing, and scores
- **Conversation Turns**: Track individual questions, responses, and feedback
- **Relational Design**: Proper foreign key relationships for data integrity

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes

### Database Migrations

This project uses Drizzle ORM with push-based migrations:

```bash
# Apply schema changes to database
npm run db:push

# Generate migration files (optional)
npm run db:generate
```

## Deployment

### Replit Deployment
1. Import the project to Replit
2. Set environment variables in Replit Secrets
3. Click "Deploy" to create a public deployment

### Manual Deployment
1. Build the project: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Vercel, Netlify, Railway, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/mock-interview-ai/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about your environment and the issue

## Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for AI capabilities
- [Neon](https://neon.tech/) for PostgreSQL hosting
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations

## Roadmap

- [ ] User authentication system
- [ ] Custom interview templates
- [ ] Analytics dashboard
- [ ] Mobile app version
- [ ] Integration with more AI providers
- [ ] Advanced scoring algorithms