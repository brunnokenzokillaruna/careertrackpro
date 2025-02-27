# Deployment Guide for CareerTrack Pro

This guide provides step-by-step instructions for deploying CareerTrack Pro to GitHub Pages and setting up the Supabase backend.

## Prerequisites

- GitHub account
- Supabase account
- Node.js 18+ and npm installed locally
- Git installed locally

## Setting Up Supabase

### 1. Create a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com)
2. Create a new project with a name of your choice
3. Note down your project URL and API keys (found in Project Settings > API)

### 2. Set Up the Database Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Run the initialization script:
   ```sql
   -- Copy the contents of supabase/init.sql here
   ```
3. Alternatively, use the migration script:
   ```bash
   # Set up your .env.local file first
   npm run migrate
   ```

### 3. Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure Site URL to match your deployment URL
3. Configure any additional authentication providers if needed

## Deploying to GitHub Pages

### 1. Fork or Clone the Repository

```bash
git clone https://github.com/yourusername/careertrack-pro.git
cd careertrack-pro
```

### 2. Configure Environment Variables

1. Create a `.env.local` file based on `.env.local.example`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. For GitHub Actions, add these as repository secrets:
   - Go to your GitHub repository > Settings > Secrets and variables > Actions
   - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as secrets

### 3. Configure Base Path (if needed)

If you're deploying to a subdirectory (e.g., `username.github.io/careertrack-pro`), update `next.config.js`:

```javascript
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === "production" ? "/careertrack-pro" : "",
  assetPrefix: process.env.NODE_ENV === "production" ? "/careertrack-pro/" : "",
  trailingSlash: true,
};
```

### 4. Manual Deployment

1. Build the project:

   ```bash
   npm ci
   npm run build
   ```

2. The static files will be in the `out` directory
3. Deploy these files to your hosting provider of choice

### 5. Automated Deployment with GitHub Actions

1. The repository includes a GitHub Actions workflow in `.github/workflows/deploy.yml`
2. Push your changes to the `main` branch to trigger the deployment:

   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. Enable GitHub Pages in your repository settings:

   - Go to Settings > Pages
   - Set the source to "GitHub Actions"

4. The workflow will build and deploy your site automatically

## Post-Deployment Steps

### 1. Update Supabase Configuration

1. Go to your Supabase project settings
2. Update the Site URL to match your deployed URL
3. Add your domain to the CORS allowed origins

### 2. Test the Deployment

1. Visit your deployed site
2. Test user registration and login
3. Verify that all features are working correctly

### 3. Set Up Custom Domain (Optional)

1. Purchase a domain name from a domain registrar
2. Configure DNS settings to point to GitHub Pages:

   - Create an A record pointing to GitHub Pages IP addresses
   - Create a CNAME record for the www subdomain

3. Add your custom domain in GitHub repository settings:

   - Go to Settings > Pages > Custom domain
   - Enter your domain name and save

4. Update your Supabase configuration with the new domain

## Troubleshooting

### Authentication Issues

- Ensure Site URL in Supabase matches your deployed URL
- Check CORS configuration in Supabase
- Verify that environment variables are correctly set

### Database Connection Issues

- Confirm that your Supabase project is active
- Verify that your API keys are correct
- Check network connectivity to Supabase

### Static Export Issues

- Ensure all pages are compatible with static export
- Remove any server-side only code
- Use client-side data fetching where needed

## Maintenance and Updates

### Updating the Application

1. Pull the latest changes:

   ```bash
   git pull origin main
   ```

2. Install dependencies:

   ```bash
   npm ci
   ```

3. Build and deploy:
   ```bash
   npm run build
   # Deploy manually or push to GitHub
   ```

### Database Migrations

When updating the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Run the migration:
   ```bash
   npm run migrate
   ```

## Security Considerations

- Regularly rotate your Supabase API keys
- Enable two-factor authentication for your GitHub and Supabase accounts
- Regularly update dependencies to patch security vulnerabilities
- Monitor your application for unusual activity
