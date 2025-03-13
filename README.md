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

## LinkedIn Data Import

CareerTrack Pro allows you to import your professional profile data directly from LinkedIn data exports. This feature makes it easy to populate your profile with accurate information without manual entry.

### How to Export Your LinkedIn Data

1. Log in to your LinkedIn account
2. Click on your profile picture in the top right and select "Settings & Privacy"
3. In the "Data privacy" section, click on "Get a copy of your data"
4. Select "Want something in particular?" and choose "Profile"
5. Request the archive
6. LinkedIn will email you when your data is ready to download (usually within 24 hours)
7. Download the archive and extract it

### How to Import Your LinkedIn Data

1. Go to your Profile page in CareerTrack Pro
2. Click on "Import from LinkedIn"
3. Upload the "Profile.csv" or "Profile.json" file from your LinkedIn data export
4. Review the imported data in the preview
5. Click "Import Data" to add the information to your profile

This method provides more accurate and complete data than the previous PDF-based import.

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

## Database Schema Utilities

This project includes utilities for working with the Supabase database schema. These utilities allow you to:

1. List all tables in the database
2. Generate TypeScript interfaces from the database schema

### Setup

Before using the database utilities, you need to set up your Supabase credentials:

```bash
npm run setup-env
```

This will prompt you to enter your Supabase URL and Anon Key, which will be saved in a `.env.local` file.

### Available Commands

#### List Tables

To list all tables in your Supabase database:

```bash
npm run list-tables
```

This command will display all tables in your Supabase project's public schema.

#### Generate TypeScript Interfaces

To generate TypeScript interfaces from your database schema:

```bash
npm run generate-types
```

This will create a `database.ts` file in the `src/types` directory with TypeScript interfaces for all tables in your database. The interfaces are named after your tables (converted to PascalCase).

### Using Generated Types

Once you've generated the TypeScript interfaces, you can import them in your code:

```typescript
import { Users } from "@/types/database";

// Now you have type-safe access to your database tables
function processUser(user: Users) {
  console.log(user.email);
}

// Use with Supabase queries
const { data, error } = await supabase
  .from("users")
  .select("*")
  .returns<Users[]>();
```

### Customizing the Schema Utilities

If you need to customize how the database schema is processed, you can modify the following files:

- `scripts/db-utils.js`: Contains the core functions for interacting with the database schema
- `scripts/list-tables.js`: Script for listing database tables
- `scripts/generate-types.js`: Script for generating TypeScript interfaces

### Troubleshooting

If you encounter issues with the database utilities:

1. Make sure your Supabase credentials are correct in the `.env.local` file
2. Check that your Supabase project is running and accessible
3. Verify that you have the necessary permissions to access the database schema

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Start

```bash
npm run start
```
