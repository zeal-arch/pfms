/**
 * Profile model - represents a user profile in the database
 * This should match the schema of the 'profiles' table in Supabase
 */
class Profile {
    /**
     * Create a new profile instance
     * @param {Object} data - The profile data
     * @param {number} data.id - Auto-incremented ID (handled by DB)
     * @param {string} data.auth_id - UUID from Supabase Auth (required)
     * @param {string} data.first_name - User's first name
     * @param {string} data.last_name - User's last name
     * @param {string} data.phone_number - User's phone number
     * @param {Date} data.created_at - Creation timestamp (handled by DB)
     * @param {Date} data.updated_at - Update timestamp (handled by DB)
     */
    constructor(data = {}) {
        this.id = data.id;
        this.auth_id = data.auth_id;
        this.first_name = data.first_name || '';
        this.last_name = data.last_name || '';
        this.phone_number = data.phone_number || '';
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    /**
     * Get a properly formatted profile object for DB insertion
     * @returns {Object} Formatted profile object
     */
    toDbObject() {
        return {
            auth_id: this.auth_id,
            first_name: this.first_name,
            last_name: this.last_name,
            phone_number: this.phone_number,
            // Let the database handle timestamps if this is a new record
            // For updates, we need to set updated_at
            ...(this.id && { updated_at: new Date() })
        };
    }

    /**
     * Get user's full name
     * @returns {string} Full name
     */
    getFullName() {
        return `${this.first_name || ''} ${this.last_name || ''}`.trim();
    }
}

// Export the model for use in other files
module.exports = Profile;
