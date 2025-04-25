import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w'; // This should be in an environment variable

// Check if the Supabase client can be created
let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
    console.log('Supabase client initialized successfully');
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Show an error message to the user
    document.addEventListener('DOMContentLoaded', function () {
        const alertDiv = document.getElementById('alertMessage');
        if (alertDiv) {
            alertDiv.textContent = 'Failed to connect to authentication service. Please try again later.';
            alertDiv.className = 'p-4 rounded-lg mb-4 bg-red-100 text-red-700';
            alertDiv.classList.remove('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const submitButton = document.getElementById('submitButton');

    if (!loginForm) {
        console.error('Login form not found in the DOM');
        return;
    }

    async function handleLogin(e) {
        e.preventDefault();

        try {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Signing in...';

            const email = document.getElementById('email').value.toLowerCase();
            const password = document.getElementById('password').value;

            console.log('Attempting login with:', email);

            // Check if Supabase is initialized
            if (!supabase) {
                throw new Error('Authentication service is not available');
            }

            // Test connection to Supabase before login
            try {
                const { error: healthError } = await supabase.auth.getSession();
                if (healthError) {
                    console.error('Supabase health check failed:', healthError);
                    throw new Error('Unable to connect to authentication service');
                }
            } catch (healthCheckError) {
                console.error('Health check failed:', healthCheckError);
                throw new Error('Network connection to authentication service failed');
            }

            // Use Supabase authentication
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Supabase signIn error:', error);
                throw new Error(error.message || 'Login failed');
            }

            showAlert('Login successful! Redirecting...', 'success');

            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));

            // Store session in localStorage
            localStorage.setItem('sb-session', JSON.stringify(data.session));

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = '../Dashboard/dashboard.html';
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            showAlert(error.message || 'Network error. Please try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Sign In';
        }
    }

    // Form submission handler
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            try {
                handleLogin(e);
            } catch (err) {
                console.error('Error in form submission:', err);
                showAlert('An unexpected error occurred. Please try again.', 'error');
            }
        });
    } else {
        console.error('Could not attach event listener to login form');
    }

    // Show/Hide password
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Toggle visibility icons
            const showPasswordIcon = document.getElementById('showPassword');
            const hidePasswordIcon = document.getElementById('hidePassword');

            if (showPasswordIcon && hidePasswordIcon) {
                showPasswordIcon.classList.toggle('hidden');
                hidePasswordIcon.classList.toggle('hidden');
            }
        });
    }
});

function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alertMessage');
    if (!alertDiv) {
        console.error('Alert message element not found');
        return;
    }

    alertDiv.textContent = message;
    alertDiv.className = `p-4 rounded-lg mb-4 ${type === 'success'
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'
        }`;
    alertDiv.classList.remove('hidden');

    setTimeout(() => {
        alertDiv.classList.add('hidden');
    }, 3000);
}

// Add this function to check if user is already logged in
async function checkAuth() {
    if (!supabase) {
        console.error('Cannot check auth: Supabase client not initialized');
        return;
    }

    try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Error checking auth session:', error);
            return;
        }

        if (session) {
            window.location.href = '../Dashboard/dashboard.html';
        }
    } catch (error) {
        console.error('Exception during auth check:', error);
    }
}

// Check auth status when page loads
window.addEventListener('DOMContentLoaded', function () {
    // Wait a moment to ensure DOM is fully loaded before checking auth
    setTimeout(checkAuth, 500);
}); 