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