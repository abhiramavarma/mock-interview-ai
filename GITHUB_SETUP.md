# GitHub Setup Guide

This guide will help you push your Mock Interview AI project to GitHub and set up proper version control.

## Prerequisites

1. **GitHub Account**: Sign up at [github.com](https://github.com) if you don't have one
2. **Git Installed**: Install Git on your computer
3. **Project Files**: Complete Mock Interview AI project

## Step 1: Initialize Git Repository

If you haven't already initialized Git in your project:

```bash
# Navigate to your project directory
cd mock-interview-ai

# Initialize Git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Complete Mock Interview AI application"
```

## Step 2: Create GitHub Repository

1. **Go to GitHub**: Visit [github.com](https://github.com) and sign in
2. **Create New Repository**:
   - Click the "+" icon in the top right
   - Select "New repository"
   - Name: `mock-interview-ai` (or your preferred name)
   - Description: "A full-stack conversational AI mock interview platform"
   - Keep it Public (or Private if you prefer)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

## Step 3: Connect Local Repository to GitHub

```bash
# Add GitHub repository as remote origin
git remote add origin https://github.com/yourusername/mock-interview-ai.git

# Push to GitHub
git push -u origin main
```

If you get an error about the default branch, try:
```bash
git branch -M main
git push -u origin main
```

## Step 4: Verify Upload

1. **Check GitHub**: Go to your repository page on GitHub
2. **Verify Files**: Ensure all files are uploaded correctly
3. **Check README**: Your README.md should display on the main page

## Step 5: Set Up Repository Settings

### Branch Protection (Optional but Recommended)
1. Go to Settings → Branches
2. Add branch protection rule for `main`
3. Check "Require pull request reviews before merging"

### Secrets for GitHub Actions (Optional)
1. Go to Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`

### Issues and Discussions
1. Go to Settings → Features
2. Enable Issues and Discussions if desired

## Step 6: Configure Git for Future Work

Set up your Git configuration:
```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default editor (optional)
git config --global core.editor "code --wait"
```

## Daily Git Workflow

### Making Changes
```bash
# Create a new branch for your feature
git checkout -b feature/new-feature

# Make your changes...

# Stage changes
git add .

# Commit changes
git commit -m "feat: add new feature description"

# Push to GitHub
git push origin feature/new-feature
```

### Creating Pull Requests
1. Go to your GitHub repository
2. Click "Compare & pull request"
3. Add description and submit
4. Review and merge when ready

### Staying Updated
```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Delete merged feature branch
git branch -d feature/new-feature
```

## Common Git Commands

### Status and Information
```bash
git status              # Check current status
git log --oneline       # View commit history
git branch             # List branches
git remote -v          # Show remote repositories
```

### Branching
```bash
git checkout -b branch-name    # Create and switch to new branch
git checkout main             # Switch to main branch
git merge branch-name         # Merge branch into current branch
git branch -d branch-name     # Delete branch
```

### Undoing Changes
```bash
git checkout -- filename     # Discard changes to file
git reset HEAD filename      # Unstage file
git revert commit-hash       # Revert a commit
```

## Repository Structure

Your GitHub repository should now contain:

```
mock-interview-ai/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── shared/                 # Shared types and schemas
├── README.md              # Project documentation
├── DEPLOYMENT.md          # Deployment guide
├── CONTRIBUTING.md        # Contribution guidelines
├── GITHUB_SETUP.md        # This file
├── LICENSE               # MIT License
├── package.json          # Dependencies and scripts
├── .gitignore           # Git ignore rules
├── .env.example         # Environment variables template
└── setup.sh             # Setup script
```

## Best Practices

### Commit Messages
Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

Examples:
```bash
git commit -m "feat: add voice recognition toggle"
git commit -m "fix: resolve speech recognition timeout issue"
git commit -m "docs: update deployment instructions"
```

### Security
- **Never commit secrets**: Use `.env` files and add them to `.gitignore`
- **Use environment variables**: Store API keys and database URLs securely
- **Regular updates**: Keep dependencies updated

### Collaboration
- **Use branches**: Create feature branches for new work
- **Write clear descriptions**: Include context in pull requests
- **Review code**: Use pull request reviews for quality control

## Troubleshooting

### Common Issues

1. **Authentication Problems**:
   ```bash
   # Use personal access token instead of password
   git remote set-url origin https://username:token@github.com/username/repo.git
   ```

2. **Large Files**:
   ```bash
   # If you have large files, use Git LFS
   git lfs track "*.mp4"
   git add .gitattributes
   ```

3. **Merge Conflicts**:
   ```bash
   # Resolve conflicts manually, then:
   git add .
   git commit -m "resolve merge conflicts"
   ```

### Getting Help

- **Git Documentation**: [git-scm.com](https://git-scm.com/doc)
- **GitHub Help**: [docs.github.com](https://docs.github.com)
- **Interactive Tutorial**: [learngitbranching.js.org](https://learngitbranching.js.org)

## Next Steps

1. **Share Your Repository**: Add the GitHub URL to your README
2. **Set Up CI/CD**: Consider GitHub Actions for automated testing
3. **Add Contributors**: Invite team members to collaborate
4. **Create Releases**: Tag stable versions of your application
5. **Enable Discussions**: Allow community interaction

Your Mock Interview AI project is now ready for collaboration and deployment! 🚀

## Repository URL Template

Your repository will be available at:
`https://github.com/yourusername/mock-interview-ai`

Update the README.md file with your actual GitHub username and repository name.