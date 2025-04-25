const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://kyathezublanpnjwansc.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';

const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
const db = {
    /**
     * Get user profile by auth ID
     * @param {string} authId - The user's auth ID from Supabase Auth
     * @returns {Promise<Object|null>} User profile or null if not found
     */
    async getProfileByAuthId(authId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_id', authId)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
            return null;
        }

        return data;
    },

    /**
     * Create a new user profile
     * @param {Object} profileData - Profile data to insert
     * @returns {Promise<Object|null>} Created profile or null if error
     */
    async createProfile(profileData) {
        const { data, error } = await supabase
            .from('profiles')
            .insert([profileData])
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            return null;
        }

        return data;
    },

    /**
     * Update an existing user profile
     * @param {number} profileId - The profile ID to update
     * @param {Object} profileData - Updated profile data
     * @returns {Promise<Object|null>} Updated profile or null if error
     */
    async updateProfile(profileId, profileData) {
        const { data, error } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', profileId)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return null;
        }

        return data;
    },

    /**
     * Get all categories
     * @param {string} [type] - Optional filter by category type ('income' or 'expense')
     * @returns {Promise<Array|null>} List of categories or null if error
     */
    async getCategories(type) {
        let query = supabase.from('categories').select('*');

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error } = await query.order('name');

        if (error) {
            console.error('Error fetching categories:', error);
            return null;
        }

        return data;
    },

    /**
     * Get incomes for a user
     * @param {number} profileId - User's profile ID
     * @param {Object} [options] - Query options
     * @param {string} [options.startDate] - Start date for filtering
     * @param {string} [options.endDate] - End date for filtering
     * @param {number} [options.limit] - Max number of records to return
     * @returns {Promise<Array|null>} List of income records or null if error
     */
    async getIncomes(profileId, options = {}) {
        let query = supabase
            .from('incomes')
            .select(`
        *,
        categories (id, name, icon, color)
      `)
            .eq('profile_id', profileId);

        if (options.startDate) {
            query = query.gte('date', options.startDate);
        }

        if (options.endDate) {
            query = query.lte('date', options.endDate);
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) {
            console.error('Error fetching incomes:', error);
            return null;
        }

        return data;
    },

    /**
     * Create a new income record
     * @param {Object} incomeData - Income data to insert
     * @returns {Promise<Object|null>} Created income record or null if error
     */
    async createIncome(incomeData) {
        const { data, error } = await supabase
            .from('incomes')
            .insert([incomeData])
            .select()
            .single();

        if (error) {
            console.error('Error creating income:', error);
            return null;
        }

        return data;
    },

    /**
     * Update an income record
     * @param {number} incomeId - Income ID to update
     * @param {Object} incomeData - Updated income data
     * @returns {Promise<Object|null>} Updated income record or null if error
     */
    async updateIncome(incomeId, incomeData) {
        const { data, error } = await supabase
            .from('incomes')
            .update(incomeData)
            .eq('id', incomeId)
            .select()
            .single();

        if (error) {
            console.error('Error updating income:', error);
            return null;
        }

        return data;
    },

    /**
     * Delete an income record
     * @param {number} incomeId - Income ID to delete
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async deleteIncome(incomeId) {
        const { error } = await supabase
            .from('incomes')
            .delete()
            .eq('id', incomeId);

        if (error) {
            console.error('Error deleting income:', error);
            return false;
        }

        return true;
    },

    /**
     * Get expenses for a user
     * @param {number} profileId - User's profile ID
     * @param {Object} [options] - Query options
     * @param {string} [options.startDate] - Start date for filtering
     * @param {string} [options.endDate] - End date for filtering
     * @param {number} [options.limit] - Max number of records to return
     * @returns {Promise<Array|null>} List of expense records or null if error
     */
    async getExpenses(profileId, options = {}) {
        let query = supabase
            .from('expenses')
            .select(`
        *,
        categories (id, name, icon, color)
      `)
            .eq('profile_id', profileId);

        if (options.startDate) {
            query = query.gte('date', options.startDate);
        }

        if (options.endDate) {
            query = query.lte('date', options.endDate);
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) {
            console.error('Error fetching expenses:', error);
            return null;
        }

        return data;
    },

    /**
     * Create a new expense record
     * @param {Object} expenseData - Expense data to insert
     * @returns {Promise<Object|null>} Created expense record or null if error
     */
    async createExpense(expenseData) {
        const { data, error } = await supabase
            .from('expenses')
            .insert([expenseData])
            .select()
            .single();

        if (error) {
            console.error('Error creating expense:', error);
            return null;
        }

        return data;
    },

    /**
     * Update an expense record
     * @param {number} expenseId - Expense ID to update
     * @param {Object} expenseData - Updated expense data
     * @returns {Promise<Object|null>} Updated expense record or null if error
     */
    async updateExpense(expenseId, expenseData) {
        const { data, error } = await supabase
            .from('expenses')
            .update(expenseData)
            .eq('id', expenseId)
            .select()
            .single();

        if (error) {
            console.error('Error updating expense:', error);
            return null;
        }

        return data;
    },

    /**
     * Delete an expense record
     * @param {number} expenseId - Expense ID to delete
     * @returns {Promise<boolean>} True if successful, false otherwise
     */
    async deleteExpense(expenseId) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', expenseId);

        if (error) {
            console.error('Error deleting expense:', error);
            return false;
        }

        return true;
    },

    /**
     * Get budgets for a user
     * @param {number} profileId - User's profile ID
     * @returns {Promise<Array|null>} List of budgets or null if error
     */
    async getBudgets(profileId) {
        const { data, error } = await supabase
            .from('budgets')
            .select(`
        *,
        budget_categories (
          id,
          allocated_amount,
          categories (id, name, icon, color)
        )
      `)
            .eq('profile_id', profileId)
            .order('end_date', { ascending: false });

        if (error) {
            console.error('Error fetching budgets:', error);
            return null;
        }

        return data;
    },

    /**
     * Create a new budget
     * @param {Object} budgetData - Budget data to insert
     * @param {Array} categoryAllocations - Category allocations for the budget
     * @returns {Promise<Object|null>} Created budget or null if error
     */
    async createBudget(budgetData, categoryAllocations = []) {
        // Start a transaction
        const { data: budget, error: budgetError } = await supabase
            .from('budgets')
            .insert([budgetData])
            .select()
            .single();

        if (budgetError) {
            console.error('Error creating budget:', budgetError);
            return null;
        }

        // Insert category allocations if any
        if (categoryAllocations.length > 0) {
            const allocationsWithBudgetId = categoryAllocations.map(allocation => ({
                ...allocation,
                budget_id: budget.id
            }));

            const { error: allocationsError } = await supabase
                .from('budget_categories')
                .insert(allocationsWithBudgetId);

            if (allocationsError) {
                console.error('Error creating budget category allocations:', allocationsError);
                // Consider rolling back the budget creation here in a real transaction
                return budget;
            }
        }

        return budget;
    },

    /**
     * Get savings goals for a user
     * @param {number} profileId - User's profile ID
     * @returns {Promise<Array|null>} List of savings goals or null if error
     */
    async getSavingsGoals(profileId) {
        const { data, error } = await supabase
            .from('savings_goals')
            .select('*')
            .eq('profile_id', profileId)
            .order('target_date', { ascending: true });

        if (error) {
            console.error('Error fetching savings goals:', error);
            return null;
        }

        return data;
    },

    /**
     * Create a new savings goal
     * @param {Object} goalData - Savings goal data to insert
     * @returns {Promise<Object|null>} Created savings goal or null if error
     */
    async createSavingsGoal(goalData) {
        const { data, error } = await supabase
            .from('savings_goals')
            .insert([goalData])
            .select()
            .single();

        if (error) {
            console.error('Error creating savings goal:', error);
            return null;
        }

        return data;
    },

    /**
     * Add a contribution to a savings goal
     * @param {Object} contributionData - Contribution data to insert
     * @returns {Promise<Object|null>} Created contribution or null if error
     */
    async addSavingsContribution(contributionData) {
        const { data, error } = await supabase
            .from('savings_contributions')
            .insert([contributionData])
            .select()
            .single();

        if (error) {
            console.error('Error adding savings contribution:', error);
            return null;
        }

        return data;
    },

    /**
     * Get bills for a user
     * @param {number} profileId - User's profile ID
     * @param {boolean} [unpaidOnly=false] - If true, return only unpaid bills
     * @returns {Promise<Array|null>} List of bills or null if error
     */
    async getBills(profileId, unpaidOnly = false) {
        let query = supabase
            .from('bills')
            .select(`
        *,
        categories (id, name, icon, color)
      `)
            .eq('profile_id', profileId);

        if (unpaidOnly) {
            query = query.eq('is_paid', false);
        }

        const { data, error } = await query.order('due_date', { ascending: true });

        if (error) {
            console.error('Error fetching bills:', error);
            return null;
        }

        return data;
    },

    /**
     * Create a new bill
     * @param {Object} billData - Bill data to insert
     * @returns {Promise<Object|null>} Created bill or null if error
     */
    async createBill(billData) {
        const { data, error } = await supabase
            .from('bills')
            .insert([billData])
            .select()
            .single();

        if (error) {
            console.error('Error creating bill:', error);
            return null;
        }

        return data;
    },

    /**
     * Update a bill's payment status
     * @param {number} billId - Bill ID to update
     * @param {boolean} isPaid - New payment status
     * @returns {Promise<Object|null>} Updated bill or null if error
     */
    async updateBillPaymentStatus(billId, isPaid) {
        const { data, error } = await supabase
            .from('bills')
            .update({ is_paid: isPaid, updated_at: new Date() })
            .eq('id', billId)
            .select()
            .single();

        if (error) {
            console.error('Error updating bill payment status:', error);
            return null;
        }

        return data;
    },

    /**
     * Get tax information for a user
     * @param {number} profileId - User's profile ID
     * @param {string} [taxYear] - Optional tax year to filter (e.g., "2023-2024")
     * @returns {Promise<Object|Array|null>} Tax information or null if error
     */
    async getTaxInformation(profileId, taxYear) {
        let query = supabase
            .from('tax_information')
            .select(`
        *,
        tax_deductions (*)
      `)
            .eq('profile_id', profileId);

        if (taxYear) {
            query = query.eq('tax_year', taxYear).single();
        } else {
            query = query.order('tax_year', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching tax information:', error);
            return null;
        }

        return data;
    },

    /**
     * Create or update tax information for a user
     * @param {Object} taxData - Tax information data
     * @returns {Promise<Object|null>} Created/updated tax information or null if error
     */
    async saveTaxInformation(taxData) {
        // Check if tax info for this profile and year already exists
        const { data: existingData } = await supabase
            .from('tax_information')
            .select('id')
            .eq('profile_id', taxData.profile_id)
            .eq('tax_year', taxData.tax_year)
            .single();

        let result;

        if (existingData) {
            // Update existing record
            const { data, error } = await supabase
                .from('tax_information')
                .update({
                    gross_income: taxData.gross_income,
                    updated_at: new Date()
                })
                .eq('id', existingData.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating tax information:', error);
                return null;
            }

            result = data;
        } else {
            // Create new record
            const { data, error } = await supabase
                .from('tax_information')
                .insert([{
                    profile_id: taxData.profile_id,
                    tax_year: taxData.tax_year,
                    gross_income: taxData.gross_income
                }])
                .select()
                .single();

            if (error) {
                console.error('Error creating tax information:', error);
                return null;
            }

            result = data;
        }

        return result;
    },

    /**
     * Add a tax deduction
     * @param {Object} deductionData - Tax deduction data
     * @returns {Promise<Object|null>} Created deduction or null if error
     */
    async addTaxDeduction(deductionData) {
        const { data, error } = await supabase
            .from('tax_deductions')
            .insert([deductionData])
            .select()
            .single();

        if (error) {
            console.error('Error adding tax deduction:', error);
            return null;
        }

        return data;
    }
};

module.exports = {
    supabase,
    db
}; 