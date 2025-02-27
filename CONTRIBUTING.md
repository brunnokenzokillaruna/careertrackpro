# Contributing to CareerTrack Pro

Thank you for considering contributing to CareerTrack Pro! This document outlines the process for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Include screenshots if applicable
- Specify your operating system, browser, and relevant software versions

### Suggesting Enhancements

- Check if the enhancement has already been suggested in the Issues section
- Use the feature request template when creating a new issue
- Provide a clear description of the proposed enhancement
- Explain why this enhancement would be useful to most users

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure your changes don't break existing functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

1. Clone your fork of the repository
2. Install dependencies with `npm install`
3. Copy `.env.local.example` to `.env.local` and configure your environment variables
4. Run the development server with `npm run dev`
5. Run database migrations with `npm run migrate`

## Coding Guidelines

### JavaScript/TypeScript

- Follow the ESLint configuration in the project
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add comments for complex logic

### React Components

- Use functional components with hooks
- Keep components small and focused on a single responsibility
- Use TypeScript interfaces for props
- Follow the existing component structure

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure responsive design works on all screen sizes

### Testing

- Write tests for new features
- Ensure all tests pass before submitting a pull request

## Database Migrations

When making changes to the database schema:

1. Create a new migration file in the `supabase/migrations` directory
2. Name the file with a timestamp and descriptive name (e.g., `20240201123456_add_user_preferences.sql`)
3. Test the migration locally
4. Document the changes in your pull request

## Documentation

- Update documentation when adding or changing features
- Keep the README.md up to date
- Document any new environment variables in `.env.local.example`

## Review Process

- All pull requests require at least one review before merging
- Address all review comments before requesting re-review
- Ensure CI checks pass

Thank you for contributing to CareerTrack Pro!
