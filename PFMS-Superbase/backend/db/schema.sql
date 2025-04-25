-- PFMS Database Schema for Supabase
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Profiles table - Extends Supabase Auth users
CREATE TABLE IF NOT EXISTS profiles (
    id BIGSERIAL PRIMARY KEY,
    auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Categories for transactions
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Income records
CREATE TABLE IF NOT EXISTS incomes (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE
    SET NULL,
        amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
        description TEXT,
        source VARCHAR(100),
        is_recurring BOOLEAN DEFAULT false,
        recurrence_interval VARCHAR(20) CHECK (
            recurrence_interval IN ('daily', 'weekly', 'monthly', 'yearly')
        ),
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Expense records
CREATE TABLE IF NOT EXISTS expenses (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES categories(id) ON DELETE
    SET NULL,
        amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
        description TEXT,
        is_recurring BOOLEAN DEFAULT false,
        recurrence_interval VARCHAR(20) CHECK (
            recurrence_interval IN ('daily', 'weekly', 'monthly', 'yearly')
        ),
        date TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK (end_date > start_date)
);
-- Budget categories allocation
CREATE TABLE IF NOT EXISTS budget_categories (
    id BIGSERIAL PRIMARY KEY,
    budget_id BIGINT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    allocated_amount DECIMAL(12, 2) NOT NULL CHECK (allocated_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(budget_id, category_id)
);
-- Savings goals
CREATE TABLE IF NOT EXISTS savings_goals (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CHECK (target_date > start_date),
    CHECK (current_amount <= target_amount)
);
-- Savings contributions
CREATE TABLE IF NOT EXISTS savings_contributions (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Bills for tracking recurring expenses
CREATE TABLE IF NOT EXISTS bills (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    due_date DATE NOT NULL,
    recurrence_interval VARCHAR(20) CHECK (
        recurrence_interval IN ('weekly', 'monthly', 'yearly')
    ),
    category_id BIGINT REFERENCES categories(id) ON DELETE
    SET NULL,
        is_paid BOOLEAN DEFAULT false,
        auto_pay BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Tax information for calculations
CREATE TABLE IF NOT EXISTS tax_information (
    id BIGSERIAL PRIMARY KEY,
    profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tax_year VARCHAR(9) NOT NULL,
    -- Format: "2023-2024"
    gross_income DECIMAL(12, 2) NOT NULL DEFAULT 0,
    deductions DECIMAL(12, 2) DEFAULT 0,
    taxable_income DECIMAL(12, 2) GENERATED ALWAYS AS (gross_income - deductions) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(profile_id, tax_year)
);
-- Tax deduction details
CREATE TABLE IF NOT EXISTS tax_deductions (
    id BIGSERIAL PRIMARY KEY,
    tax_info_id BIGINT NOT NULL REFERENCES tax_information(id) ON DELETE CASCADE,
    deduction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
-- Insert some default categories
INSERT INTO categories (name, type, description, icon, color)
VALUES (
        'Salary',
        'income',
        'Regular employment income',
        'cash',
        '#4CAF50'
    ),
    (
        'Investments',
        'income',
        'Interest, dividends, capital gains',
        'graph',
        '#2196F3'
    ),
    (
        'Gifts',
        'income',
        'Gifts received',
        'gift',
        '#9C27B0'
    ),
    (
        'Other Income',
        'income',
        'Miscellaneous income sources',
        'plus',
        '#607D8B'
    ),
    (
        'Housing',
        'expense',
        'Rent, mortgage, repairs',
        'home',
        '#F44336'
    ),
    (
        'Transportation',
        'expense',
        'Car, public transit, fuel',
        'car',
        '#FF9800'
    ),
    (
        'Food',
        'expense',
        'Groceries and dining out',
        'food',
        '#FFEB3B'
    ),
    (
        'Utilities',
        'expense',
        'Electricity, water, internet',
        'bolt',
        '#795548'
    ),
    (
        'Healthcare',
        'expense',
        'Medical expenses and insurance',
        'medical',
        '#E91E63'
    ),
    (
        'Entertainment',
        'expense',
        'Movies, music, hobbies',
        'fun',
        '#9E9E9E'
    ),
    (
        'Education',
        'expense',
        'Tuition, books, courses',
        'school',
        '#3F51B5'
    ),
    (
        'Shopping',
        'expense',
        'Clothing, electronics, household items',
        'shopping',
        '#00BCD4'
    ),
    (
        'Travel',
        'expense',
        'Vacations and trips',
        'plane',
        '#FFC107'
    ),
    (
        'Subscriptions',
        'expense',
        'Streaming services, memberships',
        'subscribe',
        '#8BC34A'
    ),
    (
        'Personal Care',
        'expense',
        'Salon, spa, fitness',
        'person',
        '#CDDC39'
    ),
    (
        'Debt Payments',
        'expense',
        'Credit card, loan payments',
        'credit-card',
        '#FF5722'
    ),
    (
        'Savings',
        'expense',
        'Money set aside for future',
        'savings',
        '#009688'
    ),
    (
        'Insurance',
        'expense',
        'Home, life, vehicle insurance',
        'shield',
        '#673AB7'
    ),
    (
        'Gifts & Donations',
        'expense',
        'Presents for others, charitable contributions',
        'gift',
        '#03A9F4'
    ),
    (
        'Taxes',
        'expense',
        'Income tax, property tax',
        'document',
        '#B71C1C'
    );
-- Create Row Level Security (RLS) policies
-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profile_access ON profiles USING (auth_id = auth.uid());
-- RLS for incomes
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY income_access ON incomes USING (
    profile_id IN (
        SELECT id
        FROM profiles
        WHERE auth_id = auth.uid()
    )
);
-- RLS for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expense_access ON expenses USING (
    profile_id IN (
        SELECT id
        FROM profiles
        WHERE auth_id = auth.uid()
    )
);
-- RLS for budgets
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY budget_access ON budgets USING (
    profile_id IN (
        SELECT id
        FROM profiles
        WHERE auth_id = auth.uid()
    )
);
-- RLS for budget_categories
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY budget_category_access ON budget_categories USING (
    budget_id IN (
        SELECT id
        FROM budgets
        WHERE profile_id IN (
                SELECT id
                FROM profiles
                WHERE auth_id = auth.uid()
            )
    )
);
-- RLS for savings_goals
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY savings_goal_access ON savings_goals USING (
    profile_id IN (
        SELECT id
        FROM profiles
        WHERE auth_id = auth.uid()
    )
);
-- RLS for savings_contributions
ALTER TABLE savings_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY savings_contribution_access ON savings_contributions USING (
    goal_id IN (
        SELECT id
        FROM savings_goals
        WHERE profile_id IN (
                SELECT id
                FROM profiles
                WHERE auth_id = auth.uid()
            )
    )
);
-- RLS for bills
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY bill_access ON bills USING (
    profile_id IN (
        SELECT id
        FROM profiles
        WHERE auth_id = auth.uid()
    )
);
-- RLS for tax_information
ALTER TABLE tax_information ENABLE ROW LEVEL SECURITY;
CREATE POLICY tax_info_access ON tax_information USING (
    profile_id IN (
        SELECT id
        FROM profiles
        WHERE auth_id = auth.uid()
    )
);
-- RLS for tax_deductions
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tax_deduction_access ON tax_deductions USING (
    tax_info_id IN (
        SELECT id
        FROM tax_information
        WHERE profile_id IN (
                SELECT id
                FROM profiles
                WHERE auth_id = auth.uid()
            )
    )
);
-- Allow public access to categories (read-only)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY category_read_access ON categories FOR
SELECT USING (true);
-- Create necessary indexes for performance
CREATE INDEX idx_profiles_auth_id ON profiles(auth_id);
CREATE INDEX idx_incomes_profile_id ON incomes(profile_id);
CREATE INDEX idx_incomes_date ON incomes(date);
CREATE INDEX idx_expenses_profile_id ON expenses(profile_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_budgets_profile_id ON budgets(profile_id);
CREATE INDEX idx_budget_categories_budget_id ON budget_categories(budget_id);
CREATE INDEX idx_savings_goals_profile_id ON savings_goals(profile_id);
CREATE INDEX idx_bills_profile_id ON bills(profile_id);
CREATE INDEX idx_bills_due_date ON bills(due_date);
CREATE INDEX idx_tax_information_profile_id ON tax_information(profile_id);
-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Create update triggers for all tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE
UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incomes_updated_at BEFORE
UPDATE ON incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE
UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE
UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_categories_updated_at BEFORE
UPDATE ON budget_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_goals_updated_at BEFORE
UPDATE ON savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_savings_contributions_updated_at BEFORE
UPDATE ON savings_contributions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE
UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_information_updated_at BEFORE
UPDATE ON tax_information FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_deductions_updated_at BEFORE
UPDATE ON tax_deductions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Function for updating savings_goals current_amount when contributions are added
CREATE OR REPLACE FUNCTION update_savings_goal_amount() RETURNS TRIGGER AS $$ BEGIN IF (TG_OP = 'INSERT') THEN
UPDATE savings_goals
SET current_amount = current_amount + NEW.amount,
    updated_at = now()
WHERE id = NEW.goal_id;
ELSIF (TG_OP = 'UPDATE') THEN
UPDATE savings_goals
SET current_amount = current_amount - OLD.amount + NEW.amount,
    updated_at = now()
WHERE id = NEW.goal_id;
ELSIF (TG_OP = 'DELETE') THEN
UPDATE savings_goals
SET current_amount = current_amount - OLD.amount,
    updated_at = now()
WHERE id = OLD.goal_id;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- Trigger for maintaining savings_goals current_amount
CREATE TRIGGER update_savings_goal_amount
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON savings_contributions FOR EACH ROW EXECUTE FUNCTION update_savings_goal_amount();
-- Function for updating tax_information deductions when entries are changed
CREATE OR REPLACE FUNCTION update_tax_info_deductions() RETURNS TRIGGER AS $$
DECLARE tax_id BIGINT;
BEGIN IF (TG_OP = 'INSERT') THEN tax_id := NEW.tax_info_id;
ELSIF (TG_OP = 'UPDATE') THEN tax_id := NEW.tax_info_id;
ELSIF (TG_OP = 'DELETE') THEN tax_id := OLD.tax_info_id;
END IF;
UPDATE tax_information
SET deductions = (
        SELECT COALESCE(SUM(amount), 0)
        FROM tax_deductions
        WHERE tax_info_id = tax_id
    ),
    updated_at = now()
WHERE id = tax_id;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- Trigger for maintaining tax_information deductions
CREATE TRIGGER update_tax_info_deductions
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON tax_deductions FOR EACH ROW EXECUTE FUNCTION update_tax_info_deductions();