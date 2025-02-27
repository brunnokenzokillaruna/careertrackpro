# Fixing Row Level Security (RLS) Policies in Supabase

This guide will help you fix the Row Level Security (RLS) policies for the `ai_keys` table in your Supabase project.

## The Issue

When trying to add an API key, you encountered the error:

```
Error adding API key: new row violates row-level security policy for table 'ai_keys'
```

This happens because the current RLS policy is not properly allowing the authenticated user to insert new records.

## How to Fix It

1. Log in to your Supabase dashboard at https://supabase.com/dashboard
2. Select your project
3. Go to the "Table Editor" in the left sidebar
4. Find and select the `ai_keys` table
5. Click on the "Policies" tab
6. Delete the existing policy named "Users can manage own AI keys"
7. Create the following new policies:

### Policy 1: Users can view own AI keys

- Policy name: `Users can view own AI keys`
- Operation: `SELECT`
- Using expression: `auth.uid() = user_id`

### Policy 2: Users can insert own AI keys

- Policy name: `Users can insert own AI keys`
- Operation: `INSERT`
- Check expression: `auth.uid() = user_id`

### Policy 3: Users can update own AI keys

- Policy name: `Users can update own AI keys`
- Operation: `UPDATE`
- Using expression: `auth.uid() = user_id`
- Check expression: `auth.uid() = user_id`

### Policy 4: Users can delete own AI keys

- Policy name: `Users can delete own AI keys`
- Operation: `DELETE`
- Using expression: `auth.uid() = user_id`

## Alternative: Run SQL Script

Alternatively, you can run the following SQL script in the SQL Editor:

```sql
-- Drop existing policy
DROP POLICY IF EXISTS "Users can manage own AI keys" ON public.ai_keys;

-- Create new policy for SELECT
CREATE POLICY "Users can view own AI keys" ON public.ai_keys
    FOR SELECT USING (auth.uid() = user_id);

-- Create new policy for INSERT
CREATE POLICY "Users can insert own AI keys" ON public.ai_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create new policy for UPDATE
CREATE POLICY "Users can update own AI keys" ON public.ai_keys
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create new policy for DELETE
CREATE POLICY "Users can delete own AI keys" ON public.ai_keys
    FOR DELETE USING (auth.uid() = user_id);
```

## Verifying the Fix

After applying these changes, try adding an API key again. The error should be resolved, and you should be able to successfully add API keys to your profile.
