# Contributing to Mock Interview AI

We welcome contributions to make this project better! Here's how you can help.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/mock-interview-ai.git
   cd mock-interview-ai
   ```
3. **Run setup script**: `./setup.sh` (or follow manual setup in README.md)
4. **Create a branch** for your feature: `git checkout -b feature/amazing-feature`

## Development Workflow

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Google Gemini API key

### Setup Development Environment
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
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

## Code Guidelines

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types

### Backend
- Follow RESTful API conventions
- Use proper error handling
- Implement input validation

### Database
- Use Drizzle ORM for database operations
- Define proper relationships
- Use migrations for schema changes

## Pull Request Process

1. **Create a feature branch**: `git checkout -b feature/your-feature`
2. **Make your changes** following the code guidelines
3. **Write tests** if applicable
4. **Update documentation** if needed
5. **Test your changes** locally
6. **Commit with clear messages**:
   ```bash
   git commit -m "feat: add user authentication system"
   ```
7. **Push to your fork**: `git push origin feature/your-feature`
8. **Create a Pull Request** on GitHub

### Pull Request Template
```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added tests
- [ ] Updated documentation

## Screenshots (if applicable)
Add screenshots here
```

## Coding Standards

### JavaScript/TypeScript
- Use ES6+ features
- Follow eslint configuration
- Use async/await for promises
- Proper error handling

### React
- Use functional components
- Implement proper prop validation
- Use hooks appropriately
- Follow component naming conventions

### CSS/Styling
- Use Tailwind CSS classes
- Follow component-based styling
- Use CSS variables for theming

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
- Write unit tests for utilities
- Write integration tests for API endpoints
- Write component tests for React components

## Documentation

### Code Documentation
- Use JSDoc for functions and classes
- Add inline comments for complex logic
- Update README.md for new features

### API Documentation
- Document all API endpoints
- Include request/response examples
- Update OpenAPI spec if available

## Issue Guidelines

### Reporting Bugs
1. Check existing issues first
2. Use the bug report template
3. Include steps to reproduce
4. Provide system information

### Feature Requests
1. Check if feature already exists
2. Use the feature request template
3. Explain the use case
4. Provide mockups if helpful

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation related
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed

## Development Tips

### Common Tasks

**Adding a new page**:
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Update navigation if needed

**Adding API endpoint**:
1. Add route in `server/routes.ts`
2. Update storage interface if needed
3. Add validation schemas

**Database changes**:
1. Update schema in `shared/schema.ts`
2. Run `npm run db:push`
3. Update storage methods

### Debugging
- Use browser dev tools for frontend
- Use console.log for quick debugging
- Use VS Code debugger for detailed debugging

### Performance
- Use React DevTools for performance profiling
- Monitor database query performance
- Test with realistic data sizes

## Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Help newcomers learn
- Give constructive feedback
- Focus on the code, not the person

### Communication
- Use clear, concise language
- Provide context in discussions
- Ask questions when unclear
- Share knowledge and resources

## Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### Creating Releases
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release notes
4. Tag the release
5. Deploy to production

## Getting Help

- **Documentation**: Check README.md and other docs
- **Issues**: Search existing issues or create new one
- **Discussions**: Use GitHub Discussions for questions
- **Discord**: Join our community server (if available)

## Recognition

Contributors will be recognized in:
- Contributors section in README.md
- Release notes
- Social media shoutouts

Thank you for contributing to Mock Interview AI! 🚀