// Initialize Supabase client
const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';
let supabaseClient;

// Global user and profile variables
let currentUser = null;
let userProfile = null;

// Main initialization function
document.addEventListener('DOMContentLoaded', async function () {
    console.log('settings.js: DOMContentLoaded event fired');
    try {
        // Initialize Supabase client
        supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
        console.log('settings.js: Supabase client initialized');

        // Check authentication status
        await checkAuthentication();
        console.log('settings.js: Authentication checked');

        // Initialize all forms and UI interactions
        initializeForms();
        console.log('settings.js: Forms initialized');

        // Setup event listeners
        setupEventListeners();
        console.log('settings.js: Event listeners set up');

        // Setup UI interactions
        setupUIInteractions();
        console.log('settings.js: UI interactions set up');

        // Add a special handler for the Privacy tab
        const privacyTab = document.getElementById('tab-privacy');
        if (privacyTab) {
            console.log('settings.js: Found privacy tab, adding special handler');
            privacyTab.addEventListener('click', function () {
                const privacySection = document.getElementById('section-privacy');
                if (privacySection) {
                    console.log('settings.js: Privacy tab clicked, showing privacy section');
                    // Hide all sections
                    document.querySelectorAll('.settings-section, [id^="section-"]').forEach(section => {
                        section.classList.add('hidden');
                    });
                    // Show privacy section
                    privacySection.classList.remove('hidden');

                    // Update tab styles
                    document.querySelectorAll('[id^="tab-"]').forEach(tab => {
                        tab.classList.remove('border-purple-700', 'text-black');
                        tab.classList.add('border-transparent', 'text-gray-500');
                    });
                    privacyTab.classList.remove('border-transparent', 'text-gray-500');
                    privacyTab.classList.add('border-purple-700', 'text-black');

                    // Make sure the export button is visible and styled
                    const exportBtn = document.getElementById('exportDataBtn');
                    if (exportBtn) {
                        exportBtn.classList.add('font-bold', 'text-lg');
                        exportBtn.style.backgroundColor = '#8a5cf6';
                        exportBtn.style.minWidth = '200px';
                    }
                }
            });
        }

        // Hide loading spinner
        hideLoadingSpinner();
        console.log('settings.js: Initialization complete');
    } catch (error) {
        console.error('Initialization error:', error);
        showAlert('Error initializing application. Please try again.', 'error');
    }
});

// Authentication check
async function checkAuthentication() {
    try {
        // Check if user is authenticated
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error || !session) {
            console.error('Authentication error:', error);
            redirectToLogin();
            return false;
        }

        // User is authenticated, save user data
        currentUser = session.user;
        console.log('Authenticated user:', currentUser);

        // Load user profile data
        await loadUserProfile();

        return true;
    } catch (error) {
        console.error('Authentication check error:', error);
        redirectToLogin();
        return false;
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('auth_id', currentUser.id)
            .single();

        if (profile && !profileError) {
            userProfile = profile;
            console.log('User profile loaded:', userProfile);
            // Update UI with user info
            updateUserInfo();
            return true;
        } else {
            console.error('Error loading profile:', profileError);
            showAlert('Error loading your profile data.', 'error');
            return false;
        }
    } catch (error) {
        console.error('Profile loading error:', error);
        showAlert('Error loading your profile information.', 'error');
        return false;
    }
}

// Update UI with user info
function updateUserInfo() {
    // Update user name and email in the UI
    updateElements('.user-name', userProfile.full_name || currentUser.email);
    updateElements('.user-email', currentUser.email);

    // Update specific form fields
    updateFormField('first_name', userProfile.full_name ? userProfile.full_name.split(' ')[0] : '');
    updateFormField('last_name', userProfile.full_name ? userProfile.full_name.split(' ')[1] || '' : '');
    updateFormField('email', currentUser.email);
    updateFormField('phone', userProfile.phone_number || '');

    // Update readonly fields
    updateFormField('account_status', 'Active');
    updateFormField('join_date', formatDate(new Date(currentUser.created_at)));
    updateFormField('last_login', formatDate(new Date(currentUser.last_sign_in_at || Date.now())));
}

// Initialize all forms and UI components
function initializeForms() {
    // Initialize password strength meter
    initializePasswordStrengthMeter();

    // Setup tooltips and other UI elements
    setupUIElements();
}

// Setup all event listeners
function setupEventListeners() {
    // Profile update form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // Password change form
    const passwordForm = document.getElementById('passwordChangeForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }

    // Data privacy section
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', handleDataExport);
    }

    // Account deletion
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', handleAccountDeletion);
    }

    // Logout functionality
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Mobile logout button
    const mobileLogoutBtn = document.getElementById('mobileLogoutButton');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', handleLogout);
    }

    // Password visibility toggles
    document.querySelectorAll('.password-toggle').forEach(button => {
        button.addEventListener('click', togglePasswordVisibility);
    });
}

// Setup UI interactions that were previously inline
function setupUIInteractions() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function () {
            const menu = document.getElementById('mobileMenu');
            if (menu) menu.classList.toggle('hidden');
        });
    }

    // User dropdown toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function () {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) dropdown.classList.toggle('hidden');
        });
    }

    // Sidebar toggle for mobile
    const sidenavTriggers = document.querySelectorAll('.sidenav-trigger');
    const sidebar = document.querySelector('aside');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar && sidenavTriggers.length > 0) {
        sidenavTriggers.forEach(trigger => {
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                sidebar.classList.toggle('aside-open');
                document.body.classList.toggle('sidebar-open');
            });
        });

        // Close sidebar when clicking the overlay
        if (overlay) {
            overlay.addEventListener('click', function () {
                sidebar.classList.remove('aside-open');
                document.body.classList.remove('sidebar-open');
            });
        }

        // Close sidebar when clicking outside
        document.addEventListener('click', function (e) {
            if (window.innerWidth < 1280 &&
                sidebar.classList.contains('aside-open') &&
                !e.target.closest('aside') &&
                !e.target.closest('.sidenav-trigger')) {
                sidebar.classList.remove('aside-open');
                document.body.classList.remove('sidebar-open');
            }
        });
    }

    // Handle window resize events
    window.addEventListener('resize', function () {
        // Reset sidebar and body class on larger screens
        if (window.innerWidth >= 1280) {
            const sidebar = document.querySelector('aside');
            if (sidebar) {
                // On large screens, sidebar should always be visible
                sidebar.classList.remove('aside-open');
                document.body.classList.remove('sidebar-open');
            }
        }
    });

    // Setup sidebar close button
    const sidenavCloseBtn = document.querySelector('[sidenav-close]');
    if (sidebar && sidenavCloseBtn) {
        sidenavCloseBtn.addEventListener('click', function () {
            sidebar.classList.remove('aside-open');
            document.body.classList.remove('sidebar-open');
        });
    }
}

// Handle profile update form submission
async function handleProfileUpdate(e) {
    e.preventDefault();

    try {
        showLoadingButton(e.target.querySelector('button[type="submit"]'), 'Saving...');

        const formData = new FormData(e.target);
        const profileData = {
            full_name: `${formData.get('first_name')} ${formData.get('last_name')}`.trim(),
            phone_number: formData.get('phone'),
            updated_at: new Date()
        };

        // Update profile in Supabase
        const { error } = await supabaseClient
            .from('profiles')
            .update(profileData)
            .eq('auth_id', currentUser.id);

        if (error) throw new Error(error.message);

        // Reload user profile data
        await loadUserProfile();

        showAlert('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Profile update error:', error);
        showAlert(`Error updating profile: ${error.message}`, 'error');
    } finally {
        resetLoadingButton(e.target.querySelector('button[type="submit"]'), 'Save Changes');
    }
}

// Handle password change form submission
async function handlePasswordChange(e) {
    e.preventDefault();

    try {
        const form = e.target;
        const currentPassword = form.currentPassword.value;
        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;

        // Validation
        if (newPassword !== confirmPassword) {
            showAlert('New passwords do not match.', 'error');
            return;
        }

        const passwordStrength = calculatePasswordStrength(newPassword);
        if (passwordStrength < 3) {
            showAlert('Please use a stronger password.', 'error');
            return;
        }

        showLoadingButton(form.querySelector('button[type="submit"]'), 'Updating...');

        // First verify the current password by attempting to sign in
        const { error: signInError } = await supabaseClient.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword
        });

        if (signInError) {
            throw new Error('Current password is incorrect');
        }

        // Update the password
        const { error } = await supabaseClient.auth.updateUser({
            password: newPassword
        });

        if (error) throw new Error(error.message);

        form.reset();
        showAlert('Password updated successfully!', 'success');
    } catch (error) {
        console.error('Password update error:', error);
        showAlert(`Error updating password: ${error.message}`, 'error');
    } finally {
        resetLoadingButton(e.target.querySelector('button[type="submit"]'), 'Update Password');
    }
}

// Handle data export
async function handleDataExport() {
    try {
        const exportBtn = document.getElementById('exportDataBtn');
        showLoadingButton(exportBtn, 'Exporting...');

        // Check if user profile is loaded
        if (!currentUser) {
            // If not authenticated, redirect to login
            throw new Error('You must be logged in to export data');
        }

        // Reload the user profile to ensure it's up to date
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('auth_id', currentUser.id)
            .single();

        if (profileError) {
            throw new Error('Error loading your profile data');
        }

        userProfile = profile;

        // Fetch all user related data
        const { data: expenses, error: expensesError } = await supabaseClient
            .from('expenses')
            .select('*')
            .eq('user_id', userProfile.id);

        const { data: incomes, error: incomesError } = await supabaseClient
            .from('incomes')
            .select('*')
            .eq('user_id', userProfile.id);

        const { data: savingsGoals, error: savingsError } = await supabaseClient
            .from('savings_goals')
            .select('*')
            .eq('user_id', userProfile.id);

        const { data: taxDetails, error: taxError } = await supabaseClient
            .from('tax_details')
            .select('*')
            .eq('user_id', userProfile.id);

        if (expensesError || incomesError || savingsError || taxError) {
            throw new Error('Error fetching user data');
        }

        // Create a data object with all user data
        const userData = {
            profile: userProfile,
            expenses: expenses || [],
            incomes: incomes || [],
            savings_goals: savingsGoals || [],
            tax_details: taxDetails || [],
            exported_at: new Date().toISOString()
        };

        // Convert to JSON and create download link
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `pfms_data_${formatDate(new Date())}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        showAlert('Your data has been exported successfully!', 'success');
    } catch (error) {
        console.error('Data export error:', error);
        showAlert(`Error exporting data: ${error.message}`, 'error');
    } finally {
        resetLoadingButton(document.getElementById('exportDataBtn'), 'Export My Data');
    }
}

// Handle account deletion
async function handleAccountDeletion() {
    try {
        if (!confirm('WARNING: This action cannot be undone. Are you sure you want to delete your account and all associated data?')) {
            return;
        }

        if (!confirm('Please confirm again that you want to delete your account and ALL your data.')) {
            return;
        }

        showLoadingSpinner();

        // Delete all user data from various tables
        const tables = ['expenses', 'incomes', 'savings_goals', 'tax_details', 'profiles'];

        for (const table of tables) {
            const { error } = await supabaseClient
                .from(table)
                .delete()
                .eq('user_id', userProfile.id);

            if (error && !error.message.includes('no rows')) {
                console.error(`Error deleting from ${table}:`, error);
            }
        }

        // Delete the user account using the standard method
        const { error } = await supabaseClient.auth.updateUser({
            data: { deleted: true }
        });

        if (error) throw new Error(error.message);

        // Sign out the user
        await supabaseClient.auth.signOut();

        // Clear local storage and redirect to home
        localStorage.removeItem('user');
        localStorage.removeItem('sb-session');

        showAlert('Your account has been deleted. Redirecting to homepage...', 'info');

        setTimeout(() => {
            window.location.href = '../../public/index.html';
        }, 3000);
    } catch (error) {
        console.error('Account deletion error:', error);
        showAlert(`Error deleting account: ${error.message}. Please contact support.`, 'error');
        hideLoadingSpinner();
    }
}

// Handle logout
async function handleLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();

        if (error) throw new Error(error.message);

        // Clear local storage
        localStorage.removeItem('user');
        localStorage.removeItem('sb-session');

        // Redirect to login page
        window.location.href = '../auth/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        showAlert(`Error signing out: ${error.message}`, 'error');
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const input = this.parentElement.querySelector('input');
    if (input.type === 'password') {
        input.type = 'text';
        this.innerHTML = '<i class="fas fa-eye-slash text-gray-400"></i>';
    } else {
        input.type = 'password';
        this.innerHTML = '<i class="fas fa-eye text-gray-400"></i>';
    }
}

// Initialize password strength meter
function initializePasswordStrengthMeter() {
    const newPasswordInput = document.getElementById('newPassword');
    if (!newPasswordInput) return;

    newPasswordInput.addEventListener('input', function () {
        updatePasswordStrength(this.value);
    });

    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (!confirmPasswordInput) return;

    confirmPasswordInput.addEventListener('input', function () {
        const passwordMatchText = document.getElementById('passwordMatch');
        if (!passwordMatchText) return;

        if (this.value === newPasswordInput.value) {
            passwordMatchText.textContent = 'Passwords match';
            passwordMatchText.className = 'text-xs text-green-500 mt-1';
        } else {
            passwordMatchText.textContent = 'Passwords do not match';
            passwordMatchText.className = 'text-xs text-red-500 mt-1';
        }
    });
}

// Setup UI elements
function setupUIElements() {
    // Any additional UI setup like tooltips can go here
}

// Update password strength
function updatePasswordStrength(password) {
    const strength = calculatePasswordStrength(password);
    const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    const indicator1 = document.getElementById('strength1');
    const indicator2 = document.getElementById('strength2');
    const indicator3 = document.getElementById('strength3');
    const indicator4 = document.getElementById('strength4');
    const strengthText = document.getElementById('strengthText');

    if (!indicator1 || !indicator2 || !indicator3 || !indicator4 || !strengthText) return;

    [indicator1, indicator2, indicator3, indicator4].forEach((el, i) => {
        el.className = 'flex-1 h-2 rounded-full';
        el.classList.add(i < strength ? strengthColors[strength] : 'bg-gray-200');
    });

    strengthText.textContent = strength > 0 ? strengthLabels[strength] : 'Password strength';
}

// Calculate password strength
function calculatePasswordStrength(password) {
    if (!password) return 0;

    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;  // Has uppercase
    if (/[a-z]/.test(password)) score += 1;  // Has lowercase
    if (/[0-9]/.test(password)) score += 1;  // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 1;  // Has special char

    return Math.min(Math.floor(score / 1.5), 4);
}

// Utility functions
function updateElements(selector, value) {
    document.querySelectorAll(selector).forEach(element => {
        element.textContent = value;
    });
}

function updateFormField(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value !== undefined) field.value = value;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showAlert(message, type = 'info') {
    // Create alert element if it doesn't exist
    let alertElement = document.getElementById('alertMessage');

    if (!alertElement) {
        alertElement = document.createElement('div');
        alertElement.id = 'alertMessage';
        alertElement.className = 'fixed top-4 right-4 max-w-md z-50 p-4 rounded-lg border-l-4';
        document.body.appendChild(alertElement);
    }

    // Set alert style based on type
    const bgColor = type === 'success' ? 'bg-green-100 border-green-500' :
        type === 'error' ? 'bg-red-100 border-red-500' :
            type === 'warning' ? 'bg-yellow-100 border-yellow-500' :
                'bg-blue-100 border-blue-500';

    const textColor = type === 'success' ? 'text-green-700' :
        type === 'error' ? 'text-red-700' :
            type === 'warning' ? 'text-yellow-700' :
                'text-blue-700';

    // Update alert content
    alertElement.className = `fixed top-4 right-4 max-w-md z-50 p-4 rounded-lg border-l-4 ${bgColor} ${textColor} shadow-md transform transition-transform duration-300`;
    alertElement.innerHTML = `
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <i class="fas ${type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'} mr-2"></i>
      </div>
      <div>
        ${message}
      </div>
      <button class="ml-auto text-gray-400 hover:text-gray-800" onclick="this.parentElement.parentElement.classList.add('translate-x-full');">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

    // Show the alert
    setTimeout(() => {
        alertElement.classList.remove('translate-x-full');
    }, 100);

    // Hide alert after 5 seconds
    setTimeout(() => {
        alertElement.classList.add('translate-x-full');
    }, 5000);
}

function hideLoadingSpinner() {
    // Hide the initial page loading spinner
    const initialSpinner = document.getElementById('loadingOverlay');
    if (initialSpinner) {
        initialSpinner.style.display = 'none';
    }

    // Also hide any dynamically created spinners
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.remove();
}

function showLoadingButton(button, text) {
    if (!button) return;
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${text}`;
}

function resetLoadingButton(button, text) {
    if (!button) return;
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || text;
}

function redirectToLogin() {
    window.location.href = '../auth/login.html';
}