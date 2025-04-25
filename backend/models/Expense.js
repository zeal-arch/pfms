/**
 * Expense model - represents an expense record in the database
 * This should match the schema of the 'expenses' table in Supabase
 */
class Expense {
    /**
     * Create a new expense instance
     * @param {Object} data - The expense data
     * @param {number} data.id - Auto-incremented ID (handled by DB)
     * @param {number} data.profile_id - ID of the user profile this expense belongs to
     * @param {number} data.category_id - ID of the category this expense belongs to
     * @param {number} data.amount - The expense amount
     * @param {string} data.description - Description of the expense
     * @param {boolean} data.is_recurring - Whether this is a recurring expense
     * @param {string} data.recurrence_interval - Frequency of recurrence (daily, weekly, monthly, yearly)
     * @param {Date} data.date - Date of the expense
     * @param {Date} data.created_at - Creation timestamp (handled by DB)
     * @param {Date} data.updated_at - Update timestamp (handled by DB)
     * @param {Object} data.category - The category object if joined in query
     */
    constructor(data = {}) {
        this.id = data.id;
        this.profile_id = data.profile_id;
        this.category_id = data.category_id;
        this.amount = data.amount || 0;
        this.description = data.description || '';
        this.is_recurring = data.is_recurring || false;
        this.recurrence_interval = data.recurrence_interval || null;
        this.date = data.date ? new Date(data.date) : new Date();
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.category = data.category || null;
    }

    /**
     * Get a properly formatted expense object for DB insertion
     * @returns {Object} Formatted expense object
     */
    toDbObject() {
        return {
            profile_id: this.profile_id,
            category_id: this.category_id,
            amount: this.amount,
            description: this.description,
            is_recurring: this.is_recurring,
            recurrence_interval: this.recurrence_interval,
            date: this.date,
            // Let the database handle timestamps if this is a new record
            // For updates, we need to set updated_at
            ...(this.id && { updated_at: new Date() })
        };
    }

    /**
     * Format the amount as a currency string
     * @param {string} [locale='en-US'] - The locale to use for formatting
     * @param {string} [currency='USD'] - The currency to use for formatting
     * @returns {string} Formatted amount
     */
    getFormattedAmount(locale = 'en-US', currency = 'USD') {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(this.amount);
    }

    /**
     * Format the date
     * @param {string} [format='short'] - The date format ('short', 'medium', 'long')
     * @param {string} [locale='en-US'] - The locale to use for formatting
     * @returns {string} Formatted date
     */
    getFormattedDate(format = 'short', locale = 'en-US') {
        const options = {
            year: 'numeric',
            month: format === 'short' ? 'short' : 'long',
            day: 'numeric'
        };

        if (format === 'long') {
            options.weekday = 'long';
        }

        return this.date.toLocaleDateString(locale, options);
    }

    /**
     * Get the category name
     * @returns {string} Category name or 'Uncategorized'
     */
    getCategoryName() {
        if (this.category && this.category.name) {
            return this.category.name;
        }
        return 'Uncategorized';
    }

    /**
     * Determine if this expense is recent (within the last 7 days)
     * @returns {boolean} True if the expense is recent
     */
    isRecent() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
        return this.date >= sevenDaysAgo;
    }
}

// Export the model for use in other files
module.exports = Expense;
