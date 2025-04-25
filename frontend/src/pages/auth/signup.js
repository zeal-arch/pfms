// This version doesn't use ES modules and will work with regular script tags
// The Supabase library should be loaded via CDN in the HTML file

// Show alert messages function - defined at the top so it can be used anywhere
function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) return;

    alertDiv.textContent = message;
    alertDiv.className = `p-4 rounded-lg mb-4 ${type === 'success'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'}`;
    alertDiv.classList.remove('hidden');

    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 5000);
}

// Initialize Supabase client - ideally these should be in environment variables
const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';

// Single initialization of Supabase client
let supabaseClient;

// Wait for DOM content to be loaded before initializing Supabase
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Supabase
    try {
        // The CDN script adds "supabase" to the window object
        if (typeof window.supabase === 'undefined') {
            console.error('Supabase is not defined. Make sure the CDN script is loaded correctly.');
            showAlert('Authentication service not available. Please try again later.', 'error');
            return;
        }

        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log('Supabase client initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Supabase client:', error);
        showAlert('Failed to connect to authentication service. Please try again later.', 'error');
    }

    const signupForm = document.getElementById('signupForm');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const submitButton = document.getElementById('submitButton');
    const googleSignIn = document.getElementById('googleSignIn');
    const githubSignIn = document.getElementById('githubSignIn');

    // Add tooltips to explain social login is coming soon
    googleSignIn.addEventListener('mouseenter', () => {
        googleSignIn.setAttribute('title', 'Google sign-in coming soon');
    });

    githubSignIn.addEventListener('mouseenter', () => {
        githubSignIn.setAttribute('title', 'GitHub sign-in coming soon');
    });

    // Show/hide password
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });

    // Password strength indicator
    passwordInput.addEventListener('input', updatePasswordStrength);

    // Form submission handler
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        if (validateForm()) {
            handleSignup(e);
        }
    });

    // Check if user is already logged in and redirect if necessary
    checkAuth();
});

// Form validation
function validateForm() {
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const termsCheckbox = document.getElementById('termsCheckbox');

    // Reset previous errors
    clearErrors();

    let isValid = true;

    if (!fullname) {
        showError('fullname', 'Full name is required');
        isValid = false;
    }

    if (!email) {
        showError('email', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email');
        isValid = false;
    }

    if (!password) {
        showError('password', 'Password is required');
        isValid = false;
    } else if (password.length < 8) {
        showError('password', 'Password must be at least 8 characters');
        isValid = false;
    }

    if (!phone) {
        showError('phone', 'Phone number is required');
        isValid = false;
    }

    if (!termsCheckbox.checked) {
        showAlert('You must agree to the Terms of Service and Privacy Policy', 'error');
        isValid = false;
    }

    return isValid;
}

// Helper functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(fieldId, message) {
    const errorDiv = document.getElementById(`${fieldId}Error`);
    if (errorDiv) {
        errorDiv.textContent = message;
    }
}

function clearErrors() {
    const errorDivs = document.querySelectorAll('[id$="Error"]');
    errorDivs.forEach(div => {
        div.textContent = '';
    });
}

// Password strength functions
function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strength = calculatePasswordStrength(password);

    const strengthColors = ['bg-gray-200', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

    const indicator1 = document.getElementById('strength1');
    const indicator2 = document.getElementById('strength2');
    const indicator3 = document.getElementById('strength3');
    const indicator4 = document.getElementById('strength4');
    const strengthText = document.getElementById('strengthText');

    // Apply appropriate classes based on strength
    [indicator1, indicator2, indicator3, indicator4].forEach((el, i) => {
        el.className = 'flex-1 rounded-full transition-colors duration-200';
        el.classList.add(i < strength ? strengthColors[strength] : 'bg-gray-200');
    });

    strengthText.textContent = strength > 0 ? strengthLabels[strength] : 'Password strength';
}

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

    // Return a score between 0-4, not using the arbitrary division by 1.5
    return Math.min(Math.floor(score / 2), 4); // More reasonable calculation
}

// Signup handler
async function handleSignup(e) {
    if (!supabaseClient) {
        showAlert('Authentication service is not available. Please try again later.', 'error');
        return;
    }

    try {
        const submitButton = document.getElementById('submitButton');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Creating Account...';

        const fullname = document.getElementById('fullname').value;
        const email = document.getElementById('email').value.toLowerCase();
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value.replace(/\s/g, '');

        // Use Supabase authentication for signup
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                // Use relative URL for better portability
                emailRedirectTo: `${window.location.origin}/login.html`,
                data: {
                    full_name: fullname,
                    phone: phone
                }
            }
        });

        if (error) {
            throw new Error(error.message || 'Signup failed');
        }

        // Insert additional user details into profiles table
        if (data?.user) {
            const profileData = {
                id: data.user.id,
                full_name: fullname,
                phone: phone,
                updated_at: new Date()
            };

            const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert([profileData]);

            if (profileError) {
                showAlert('Account created! Profile data could not be saved. Please check your email to confirm your account.', 'success');
            } else {
                showAlert('Account created successfully! Please check your email to confirm your account.', 'success');
            }

            // Redirect to login page after 3 seconds (shorter wait time)
            setTimeout(() => {
                window.location.href = './login.html';
            }, 3000);
        }
    } catch (error) {
        showAlert(error.message || 'Network error. Please try again.', 'error');
    } finally {
        const submitButton = document.getElementById('submitButton');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Create Account';
    }
}

// Check if user is already logged in
async function checkAuth() {
    if (!supabaseClient) return;

    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) return;

        if (session) {
            window.location.href = '../Dashboard/dashboard.html';
        }
    } catch (error) {
        // Silent error - don't bother the user with auth check failures
    }
}
