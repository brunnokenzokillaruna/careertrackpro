# CareerTrack Pro

A comprehensive job application tracking system built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Authentication**: Secure user registration and login
- **Dashboard**: Overview of key metrics and interactive calendar
- **Job Applications**: Track and manage all your job applications
- **Interview Management**: Schedule and manage interviews
- **Monthly Summary**: View statistics and analytics about your job search
- **Profile Management**: Store resume information and AI API keys
- **LinkedIn Data Import**: Import your profile data directly from LinkedIn data exports
- **Document Generation**: Create tailored resumes and cover letters using AI
- **Settings & Profile**: Manage user settings and preferences
- **Help Center**: Find answers to common questions

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS, Chakra UI
- **Backend**: Supabase (PostgreSQL, Authentication)
- **Libraries**: React Big Calendar, React Hot Toast, Headless UI

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/careertrackpro/careertrackpro.git
   cd careertrackpro
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Copy the `.env.local.example` file to `.env.local` and update with your credentials:

   ```
   cp .env.local.example .env.local
   ```

   Then edit the `.env.local` file with your Supabase credentials and other configuration:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   OPENAI_API_KEY=your_openai_api_key (optional, for document generation)
   ```

4. Run the development server:

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new Supabase project
2. Run the database migrations:

   ```
   npm run migrate
   ```

   This will execute all SQL scripts in the `supabase/migrations` directory to set up the database schema.

## Project Structure

```
careertrackpro/
├── public/                # Static assets
├── scripts/               # Utility scripts
├── src/
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── context/           # React context providers
│   ├── lib/               # Utility functions
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
├── supabase/
│   └── migrations/        # SQL migration files
└── tailwind.config.js     # Tailwind CSS configuration
```

## Key Features

### Authentication

The application uses Supabase Authentication for user management with secure login and registration.

### Job Application Tracking

Track your job applications with details like company, position, status, and notes. Filter and sort your job listings.

### Interview Management

Manage your interviews with an interactive calendar and receive notifications for upcoming interviews.

### Document Generation

Create tailored resumes and cover letters using AI based on job descriptions and your profile.

### LinkedIn Data Import

Import your LinkedIn profile data directly from data exports to quickly set up your profile.

## Database Utilities

The project includes utilities for:

- Listing all tables in the database
- Generating TypeScript interfaces from the database schema
- Creating and installing database functions

Run these commands with:

```bash
npm run list-tables
npm run generate-types
npm run create-db-functions
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Chakra UI](https://chakra-ui.com/)
- [React Big Calendar](https://github.com/jquense/react-big-calendar)
- [Headless UI](https://headlessui.com/)
