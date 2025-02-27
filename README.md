# CareerTrack Pro

A comprehensive job application tracking system built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Authentication**: Secure user registration and login
- **Dashboard**: Overview of key metrics and interactive calendar
- **Job Applications**: Track and manage all your job applications
- **Interview Management**: Schedule and manage interviews
- **Monthly Summary**: View statistics and analytics about your job search
- **Profile Management**: Store resume information and AI API keys
- **Document Generation**: Create tailored resumes and cover letters using AI
- **Settings & Profile**: Manage user settings and preferences
- **Help Center**: Find answers to common questions

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Chakra UI
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
   git clone https://github.com/yourusername/careertrack-pro.git
   cd careertrack-pro
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
careertrack-pro/
├── docs/                  # Documentation files
├── public/                # Static assets
├── scripts/               # Utility scripts
├── src/
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   │   ├── applications/  # Job application components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   ├── dashboard/     # Dashboard components
│   │   ├── documents/     # Document generation components
│   │   ├── interviews/    # Interview management components
│   │   ├── profile/       # User profile components
│   │   └── settings/      # Settings components
│   ├── context/           # React context providers
│   ├── lib/               # Utility functions
│   ├── styles/            # Global styles
│   └── types/             # TypeScript type definitions
├── supabase/
│   └── migrations/        # SQL migration files
└── tailwind.config.js     # Tailwind CSS configuration
```

## Key Features Implementation

### Authentication

The application uses Supabase Authentication for user management. The `AuthContext` provides authentication state and methods throughout the application.

### Job Application Tracking

Users can add, edit, and delete job applications with details like company, position, status, and notes. The application supports filtering and sorting of job listings.

### Interview Management

The interview scheduler allows users to manage upcoming interviews, with calendar integration and notification reminders.

### Document Generation

The AI-powered document generation feature creates tailored resumes and cover letters based on job descriptions and user profiles.

## Deployment

This project is configured for static export and can be deployed to GitHub Pages or any static hosting service:

```
npm run build
```

The static files will be generated in the `out` directory.

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
