// Remove the import and use the global Supabase object instead
// import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';

// Initialize Supabase client
let supabaseClient;
try {
    console.log('Home page: Initializing Supabase client');

    // Check if Supabase is available
    if (typeof window.supabase === 'undefined' && typeof supabase === 'undefined') {
        console.error('Supabase library not available on homepage');
        throw new Error('Authentication service not available');
    }

    // Use either window.supabase or global supabase
    const supabaseLib = window.supabase || supabase;
    supabaseClient = supabaseLib.createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
    console.log('Supabase client initialized successfully on homepage');
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
}

// Function to check authentication status
async function checkAuthStatus() {
    if (!supabaseClient) {
        console.error('Cannot check auth: Supabase client not initialized');
        return false;
    }

    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.error('Error checking auth session:', error);
            return false;
        }

        return !!session; // Return true if session exists, false otherwise
    } catch (error) {
        console.error('Exception during auth check:', error);
        return false;
    }
}

// Function to update UI based on auth status
async function updateAuthUI() {
    const authButtonsContainer = document.querySelector('header .flex.space-x-4');
    const isLoggedIn = await checkAuthStatus();

    if (authButtonsContainer) {
        if (isLoggedIn) {
            // User is logged in, hide login/signup buttons
            authButtonsContainer.classList.add('hidden');

            // Add logout button if it doesn't exist
            if (!document.getElementById('logoutButton')) {
                const logoutButton = document.createElement('button');
                logoutButton.id = 'logoutButton';
                logoutButton.className = 'py-1 px-5 me-2 mb-2 text-2xl font-medium text-white bg-transparent rounded-lg bg-gray-100 bg-opacity-10 nav-button border border-white';
                logoutButton.textContent = 'Log out';
                logoutButton.addEventListener('click', handleLogout);
                authButtonsContainer.parentNode.appendChild(logoutButton);
            }
        } else {
            // User is not logged in, show login/signup buttons
            authButtonsContainer.classList.remove('hidden');

            // Remove logout button if it exists
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.remove();
            }
        }
    }
}

// Function to handle logout
async function handleLogout() {
    if (!supabaseClient) {
        console.error('Cannot logout: Supabase client not initialized');
        return;
    }

    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Error during logout:', error);
            return;
        }

        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('sb-session');

        // Update UI
        updateAuthUI();

        // Optionally redirect to home page
        // window.location.href = '/';
    } catch (error) {
        console.error('Exception during logout:', error);
    }
}

// Check auth status when page loads
document.addEventListener('DOMContentLoaded', function () {
    updateAuthUI();
});
