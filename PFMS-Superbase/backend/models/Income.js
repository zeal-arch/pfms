/**
 * Income model - represents an income record in the database
 * This should match the schema of the 'incomes' table in Supabase
 */
class Income {
    /**
     * Create a new income instance
     * @param {Object} data - The income data
     * @param {number} data.id - Auto-incremented ID (handled by DB)
     * @param {number} data.profile_id - ID of the user profile this income belongs to
     * @param {number} data.category_id - ID of the category this income belongs to
     * @param {number} data.amount - The income amount
     * @param {string} data.description - Description of the income
     * @param {string} data.source - Source of the income
     * @param {boolean} data.is_recurring - Whether this is a recurring income
     * @param {string} data.recurrence_interval - Frequency of recurrence (daily, weekly, monthly, yearly)
     * @param {Date} data.date - Date of the income
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
        this.source = data.source || '';
        this.is_recurring = data.is_recurring || false;
        this.recurrence_interval = data.recurrence_interval || null;
        this.date = data.date ? new Date(data.date) : new Date();
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.category = data.category || null;
    }

    /**
     * Get a properly formatted income object for DB insertion
     * @returns {Object} Formatted income object
     */
    toDbObject() {
        return {
            profile_id: this.profile_id,
            category_id: this.category_id,
            amount: this.amount,
            description: this.description,
            source: this.source,
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
     * Calculate the annualized amount for this income
     * @returns {number} Annualized amount
     */
    getAnnualizedAmount() {
        if (!this.is_recurring) {
            return this.amount; // One-time income
        }

        switch (this.recurrence_interval) {
            case 'daily':
                return this.amount * 365;
            case 'weekly':
                return this.amount * 52;
            case 'monthly':
                return this.amount * 12;
            case 'yearly':
                return this.amount;
            default:
                return this.amount;
        }
    }

    /**
     * Determine if this income is taxable
     * This is a simplified implementation; in a real system, you might have a separate
     * property to explicitly mark income as taxable/non-taxable
     * @returns {boolean} True if the income is likely taxable
     */
    isTaxable() {
        // Simplified implementation - in reality, this would be more complex
        // and depend on local tax laws and specific income types
        const nonTaxableSources = ['gift', 'loan', 'repayment'];
        const sourceLC = this.source.toLowerCase();

        return !nonTaxableSources.some(src => sourceLC.includes(src));
    }
}

// Export the model for use in other files
module.exports = Income;
