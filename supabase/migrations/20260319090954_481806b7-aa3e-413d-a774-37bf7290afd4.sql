
CREATE POLICY "Users can update their own history"
ON public.performance_history
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
