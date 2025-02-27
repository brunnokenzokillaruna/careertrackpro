# CareerTrack Pro Architecture

This document provides an overview of the CareerTrack Pro application architecture, explaining the key components, data flow, and design decisions.

## System Overview

CareerTrack Pro is a Next.js application with a Supabase backend, designed to help users track and manage their job applications. The application follows a client-server architecture with a static frontend and a PostgreSQL database accessed through Supabase's API.

## Architecture Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Next.js App    │────▶│  Supabase API   │────▶│  PostgreSQL DB  │
│  (Static Site)  │◀────│  (Backend)      │◀────│  (Data Storage) │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Frontend Architecture

The frontend is built with Next.js and follows a component-based architecture using React. The application is statically generated for optimal performance and SEO.

### Key Frontend Components

- **App Router**: Next.js App Router for page routing
- **Components**: Reusable UI components organized by feature
- **Context Providers**: React Context for state management
- **Utility Functions**: Helper functions for common operations

### Component Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (app)/            # Protected routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── applications/ # Applications page
│   │   └── ...           # Other protected pages
│   └── page.tsx          # Landing/login page
├── components/           # React components
│   ├── applications/     # Application-related components
│   ├── auth/             # Authentication components
│   ├── common/           # Shared components
│   ├── dashboard/        # Dashboard components
│   ├── documents/        # Document generation components
│   ├── interviews/       # Interview components
│   └── profile/          # Profile components
├── context/              # React context providers
├── lib/                  # Utility functions and types
│   ├── supabase/         # Supabase client
│   └── types/            # TypeScript types
└── styles/               # Global styles
```

## Backend Architecture

The backend is powered by Supabase, which provides authentication, database, and storage services.

### Database Schema

The database follows a relational model with the following key tables:

- **users**: User profiles and authentication data
- **job_applications**: Job application records
- **interviews**: Interview scheduling information
- **user_profiles**: Extended user profile data for resume generation
- **ai_keys**: API keys for AI services
- **documents**: Generated documents (resumes, cover letters)

### Security Model

- **Row Level Security (RLS)**: Each table has RLS policies to ensure users can only access their own data
- **Authentication**: Supabase Auth for secure user authentication
- **API Security**: Supabase service roles and anon keys for appropriate access levels

## Data Flow

1. **User Authentication**:

   - User signs up/logs in through the Auth UI
   - Supabase Auth validates credentials and returns a JWT
   - Frontend stores the JWT for subsequent API calls

2. **Data Operations**:

   - Frontend components make API calls to Supabase
   - Supabase RLS policies validate access permissions
   - Data is returned to the frontend for rendering

3. **Document Generation**:
   - User initiates document generation
   - Frontend collects profile and job data
   - AI service generates tailored documents
   - Documents are stored in Supabase

## Deployment Architecture

The application is deployed as a static site on GitHub Pages, with the Supabase backend hosted on Supabase's infrastructure.

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  GitHub Pages   │────▶│  Supabase Cloud │
│  (Static Host)  │◀────│  (Backend)      │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Design Decisions

1. **Static Site Generation**: Chosen for performance, SEO, and simplified hosting
2. **Supabase Backend**: Selected for its comprehensive backend services and PostgreSQL database
3. **Component Organization**: Organized by feature for better maintainability
4. **Row Level Security**: Implemented at the database level for robust security
5. **React Context**: Used for state management instead of Redux for simplicity

## Future Architecture Considerations

- **Serverless Functions**: Adding Next.js API routes for complex operations
- **Caching Layer**: Implementing Redis for improved performance
- **Microservices**: Breaking down the application into microservices for scalability
- **Real-time Updates**: Leveraging Supabase's real-time capabilities for collaborative features
