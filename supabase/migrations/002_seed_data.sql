-- Seed data for testing
-- This script creates a test user and sample data

-- Note: You need to create the user manually in Supabase Auth first
-- Email: test@example.com
-- Password: test123456
-- Then run this script to create the profile and sample data

-- First, get the user_id from auth.users (you'll need to replace this with actual user_id)
-- For now, we'll create a function that uses the first user or creates sample data

-- Create a test profile if it doesn't exist
-- Note: Replace 'USER_ID_HERE' with the actual user_id from auth.users
DO $$
DECLARE
  test_user_id UUID;
  test_profile_id UUID;
  test_herd_id UUID;
BEGIN
  -- Get the first user from auth.users (or create one manually)
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No user found in auth.users. Please create a user first in Supabase Auth.';
    RETURN;
  END IF;

  -- Create or get profile
  INSERT INTO profiles (user_id, role, farm_name)
  VALUES (test_user_id, 'owner', 'テスト農場')
  ON CONFLICT (user_id) DO UPDATE SET farm_name = 'テスト農場'
  RETURNING id INTO test_profile_id;

  -- Create a herd
  INSERT INTO herds (farm_id, name, animal_type)
  VALUES (test_profile_id, '乳牛群1', 'dairy')
  ON CONFLICT DO NOTHING
  RETURNING id INTO test_herd_id;

  -- If herd already exists, get its ID
  IF test_herd_id IS NULL THEN
    SELECT id INTO test_herd_id FROM herds WHERE farm_id = test_profile_id LIMIT 1;
  END IF;

  -- Create sample revenue data (current month)
  INSERT INTO revenue (farm_id, revenue_type, amount, transaction_date, customer_name, description)
  VALUES
    (test_profile_id, 'milk', 500000, CURRENT_DATE - INTERVAL '5 days', '乳業会社A', '牛乳販売'),
    (test_profile_id, 'milk', 480000, CURRENT_DATE - INTERVAL '10 days', '乳業会社A', '牛乳販売'),
    (test_profile_id, 'calf', 150000, CURRENT_DATE - INTERVAL '15 days', '畜産農家B', '子牛販売'),
    (test_profile_id, 'milk', 520000, CURRENT_DATE - INTERVAL '20 days', '乳業会社A', '牛乳販売'),
    (test_profile_id, 'other', 50000, CURRENT_DATE - INTERVAL '25 days', NULL, 'その他収益')
  ON CONFLICT DO NOTHING;

  -- Create sample expense data (current month)
  INSERT INTO expenses (farm_id, category, amount, transaction_date, vendor_name, description)
  VALUES
    (test_profile_id, 'feed_roughage', 200000, CURRENT_DATE - INTERVAL '3 days', '飼料会社C', '粗飼料購入'),
    (test_profile_id, 'feed_concentrate', 150000, CURRENT_DATE - INTERVAL '7 days', '飼料会社C', '濃厚飼料購入'),
    (test_profile_id, 'veterinary', 50000, CURRENT_DATE - INTERVAL '12 days', '動物病院D', '診療費'),
    (test_profile_id, 'labor', 300000, CURRENT_DATE - INTERVAL '1 day', NULL, '人件費'),
    (test_profile_id, 'fuel', 80000, CURRENT_DATE - INTERVAL '8 days', 'ガソリンスタンドE', '燃料費'),
    (test_profile_id, 'utilities', 60000, CURRENT_DATE - INTERVAL '15 days', '電力会社F', '光熱費')
  ON CONFLICT DO NOTHING;

  -- Create sample subsidy data
  INSERT INTO subsidies (farm_id, name, expected_amount, actual_amount, application_deadline, payment_date, status)
  VALUES
    (test_profile_id, '酪農経営安定対策事業', 1000000, NULL, CURRENT_DATE + INTERVAL '30 days', NULL, 'applied'),
    (test_profile_id, '畜産環境整備事業', 500000, 500000, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '5 days', 'paid'),
    (test_profile_id, '飼料価格高騰対策事業', 300000, NULL, CURRENT_DATE + INTERVAL '60 days', NULL, 'approved')
  ON CONFLICT DO NOTHING;

  -- Create sample herd data
  IF test_herd_id IS NOT NULL THEN
    INSERT INTO herds (farm_id, name, animal_type)
    VALUES
      (test_profile_id, '肉牛群1', 'beef'),
      (test_profile_id, '乳牛群2', 'dairy')
    ON CONFLICT DO NOTHING;
  END IF;

  RAISE NOTICE 'Seed data created successfully for user_id: %', test_user_id;
END $$;

