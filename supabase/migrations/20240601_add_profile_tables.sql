-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    education TEXT,
    experience TEXT,
    skills TEXT,
    courses TEXT,
    languages TEXT,
    projects TEXT,
    certifications TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage own profiles" ON public.user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Create ai_keys table
CREATE TABLE IF NOT EXISTS public.ai_keys (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_keys ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage own AI keys" ON public.ai_keys
    FOR ALL USING (auth.uid() = user_id);

-- Create trigger for updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create documents table to store generated documents
CREATE TABLE IF NOT EXISTS public.documents (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    application_id INTEGER REFERENCES public.job_applications(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('resume', 'cover_letter')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can manage own documents" ON public.documents
    FOR ALL USING (auth.uid() = user_id); 