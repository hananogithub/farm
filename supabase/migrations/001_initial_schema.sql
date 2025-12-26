-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('owner', 'staff', 'accountant');
CREATE TYPE animal_type AS ENUM ('dairy', 'beef', 'other');
CREATE TYPE animal_status AS ENUM ('active', 'sold', 'deceased', 'other');
CREATE TYPE revenue_type AS ENUM ('milk', 'carcass', 'calf', 'other', 'subsidy');
CREATE TYPE expense_category AS ENUM (
  'feed_roughage',
  'feed_concentrate',
  'veterinary',
  'labor',
  'fuel',
  'utilities',
  'repairs',
  'machinery',
  'livestock_purchase',
  'losses',
  'other'
);
CREATE TYPE subsidy_status AS ENUM ('applied', 'approved', 'paid', 'rejected');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'owner',
  farm_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Herds table
CREATE TABLE herds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  animal_type animal_type NOT NULL DEFAULT 'dairy',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Animals table
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  herd_id UUID NOT NULL REFERENCES herds(id) ON DELETE CASCADE,
  identification_number TEXT,
  birth_date DATE,
  purchase_date DATE,
  sale_date DATE,
  status animal_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue table
CREATE TABLE revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  revenue_type revenue_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  transaction_date DATE NOT NULL,
  customer_name TEXT,
  herd_id UUID REFERENCES herds(id) ON DELETE SET NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category expense_category NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  transaction_date DATE NOT NULL,
  vendor_name TEXT,
  herd_id UUID REFERENCES herds(id) ON DELETE SET NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subsidies table
CREATE TABLE subsidies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  expected_amount DECIMAL(12, 2) NOT NULL CHECK (expected_amount >= 0),
  actual_amount DECIMAL(12, 2) CHECK (actual_amount >= 0),
  application_deadline DATE,
  payment_date DATE,
  status subsidy_status NOT NULL DEFAULT 'applied',
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_herds_farm_id ON herds(farm_id);
CREATE INDEX idx_animals_herd_id ON animals(herd_id);
CREATE INDEX idx_revenue_farm_id ON revenue(farm_id);
CREATE INDEX idx_revenue_transaction_date ON revenue(transaction_date);
CREATE INDEX idx_revenue_herd_id ON revenue(herd_id);
CREATE INDEX idx_expenses_farm_id ON expenses(farm_id);
CREATE INDEX idx_expenses_transaction_date ON expenses(transaction_date);
CREATE INDEX idx_expenses_herd_id ON expenses(herd_id);
CREATE INDEX idx_subsidies_farm_id ON subsidies(farm_id);
CREATE INDEX idx_subsidies_status ON subsidies(status);
CREATE INDEX idx_subsidies_deadline ON subsidies(application_deadline);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_herds_updated_at BEFORE UPDATE ON herds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON animals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revenue_updated_at BEFORE UPDATE ON revenue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subsidies_updated_at BEFORE UPDATE ON subsidies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for monthly profit
CREATE OR REPLACE VIEW monthly_profit AS
WITH revenue_monthly AS (
  SELECT 
    farm_id,
    EXTRACT(YEAR FROM transaction_date)::INTEGER AS year,
    EXTRACT(MONTH FROM transaction_date)::INTEGER AS month,
    SUM(amount) AS total_revenue
  FROM revenue
  GROUP BY farm_id, year, month
),
expense_monthly AS (
  SELECT 
    farm_id,
    EXTRACT(YEAR FROM transaction_date)::INTEGER AS year,
    EXTRACT(MONTH FROM transaction_date)::INTEGER AS month,
    SUM(amount) AS total_expenses
  FROM expenses
  GROUP BY farm_id, year, month
)
SELECT 
  COALESCE(r.farm_id, e.farm_id) AS farm_id,
  COALESCE(r.year, e.year) AS year,
  COALESCE(r.month, e.month) AS month,
  COALESCE(r.total_revenue, 0) AS total_revenue,
  COALESCE(e.total_expenses, 0) AS total_expenses,
  COALESCE(r.total_revenue, 0) - COALESCE(e.total_expenses, 0) AS profit
FROM revenue_monthly r
FULL OUTER JOIN expense_monthly e 
  ON r.farm_id = e.farm_id 
  AND r.year = e.year 
  AND r.month = e.month;

-- Create view for profit per animal
CREATE OR REPLACE VIEW profit_per_animal AS
WITH herd_animals AS (
  SELECT 
    h.id AS herd_id,
    h.farm_id,
    COUNT(DISTINCT a.id) AS animal_count
  FROM herds h
  LEFT JOIN animals a ON a.herd_id = h.id AND a.status = 'active'
  GROUP BY h.id, h.farm_id
),
revenue_monthly AS (
  SELECT 
    herd_id,
    EXTRACT(YEAR FROM transaction_date)::INTEGER AS year,
    EXTRACT(MONTH FROM transaction_date)::INTEGER AS month,
    SUM(amount) AS total_revenue
  FROM revenue
  WHERE herd_id IS NOT NULL
  GROUP BY herd_id, year, month
),
expense_monthly AS (
  SELECT 
    herd_id,
    EXTRACT(YEAR FROM transaction_date)::INTEGER AS year,
    EXTRACT(MONTH FROM transaction_date)::INTEGER AS month,
    SUM(amount) AS total_expenses
  FROM expenses
  WHERE herd_id IS NOT NULL
  GROUP BY herd_id, year, month
)
SELECT 
  ha.farm_id,
  ha.herd_id,
  COALESCE(r.year, e.year) AS year,
  COALESCE(r.month, e.month) AS month,
  ha.animal_count,
  COALESCE(r.total_revenue, 0) - COALESCE(e.total_expenses, 0) AS total_profit,
  CASE 
    WHEN ha.animal_count > 0 
    THEN (COALESCE(r.total_revenue, 0) - COALESCE(e.total_expenses, 0)) / ha.animal_count
    ELSE 0
  END AS profit_per_animal
FROM herd_animals ha
LEFT JOIN revenue_monthly r ON r.herd_id = ha.herd_id
LEFT JOIN expense_monthly e ON e.herd_id = ha.herd_id AND COALESCE(r.year, 0) = COALESCE(e.year, 0) AND COALESCE(r.month, 0) = COALESCE(e.month, 0)
WHERE r.herd_id IS NOT NULL OR e.herd_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE herds ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for herds
CREATE POLICY "Users can view herds from their farm"
  ON herds FOR SELECT
  USING (
    farm_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and staff can insert herds"
  ON herds FOR INSERT
  WITH CHECK (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Owners and staff can update herds"
  ON herds FOR UPDATE
  USING (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Owners can delete herds"
  ON herds FOR DELETE
  USING (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- RLS Policies for animals
CREATE POLICY "Users can view animals from their farm"
  ON animals FOR SELECT
  USING (
    herd_id IN (
      SELECT h.id FROM herds h
      JOIN profiles p ON p.id = h.farm_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and staff can insert animals"
  ON animals FOR INSERT
  WITH CHECK (
    herd_id IN (
      SELECT h.id FROM herds h
      JOIN profiles p ON p.id = h.farm_id
      WHERE p.user_id = auth.uid() 
      AND p.role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Owners and staff can update animals"
  ON animals FOR UPDATE
  USING (
    herd_id IN (
      SELECT h.id FROM herds h
      JOIN profiles p ON p.id = h.farm_id
      WHERE p.user_id = auth.uid() 
      AND p.role IN ('owner', 'staff')
    )
  );

-- RLS Policies for revenue
CREATE POLICY "Users can view revenue from their farm"
  ON revenue FOR SELECT
  USING (
    farm_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and staff can insert revenue"
  ON revenue FOR INSERT
  WITH CHECK (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Owners and staff can update revenue"
  ON revenue FOR UPDATE
  USING (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Owners can delete revenue"
  ON revenue FOR DELETE
  USING (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- RLS Policies for expenses
CREATE POLICY "Users can view expenses from their farm"
  ON expenses FOR SELECT
  USING (
    farm_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and staff can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Owners and staff can update expenses"
  ON expenses FOR UPDATE
  USING (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Owners can delete expenses"
  ON expenses FOR DELETE
  USING (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- RLS Policies for subsidies
CREATE POLICY "Users can view subsidies from their farm"
  ON subsidies FOR SELECT
  USING (
    farm_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and staff can insert subsidies"
  ON subsidies FOR INSERT
  WITH CHECK (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'staff')
    )
  );

CREATE POLICY "Owners and staff can update subsidies"
  ON subsidies FOR UPDATE
  USING (
    farm_id IN (
      SELECT id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'staff')
    )
  );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

