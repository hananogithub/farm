-- Add INSERT policy for profiles table
-- This allows users to create their own profile

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

