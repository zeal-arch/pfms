// Font Awesome fallback
document.addEventListener('DOMContentLoaded', function () {
    if (typeof FontAwesome === 'undefined') {
        // Load fallback script
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '../../../../assets/js/fontawesome-fallback.js';
        document.head.appendChild(fallbackScript);
        console.warn('Font Awesome CDN failed, using fallback');
    }
});

// Tailwind fallback
document.addEventListener('DOMContentLoaded', function () {
    // Check if Tailwind loaded
    const isTailwindLoaded = Array.from(document.styleSheets)
        .some(sheet => sheet.href && sheet.href.includes('tailwindcss'));

    if (!isTailwindLoaded) {
        // Load fallback CSS
        const fallbackLink = document.createElement('link');
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = '../../styles/tailwind-fallback.css';
        document.head.appendChild(fallbackLink);
        console.warn('Tailwind CDN failed, using fallback');
    }
});

// Chart.js fallback
window.addEventListener('load', function () {
    if (typeof Chart === 'undefined') {
        // Load fallback Chart.js
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '../../scripts/chart-fallback.js';
        document.head.appendChild(fallbackScript);
        console.warn('Chart.js CDN failed, using fallback');
    } else {
        // Fix chart sizing in Chrome
        fixChartSizingInChrome();
    }
});

// Function to fix chart sizing in Chrome
function fixChartSizingInChrome() {
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

    if (isChrome) {
        // Make sure charts are properly sized in Chrome
        const resizeCharts = () => {
            if (window.expenseBreakdownChart) {
                window.expenseBreakdownChart.resize();
            }
            if (window.dailySpendingChart) {
                window.dailySpendingChart.resize();
            }
            if (window.monthlyProgressChart) {
                window.monthlyProgressChart.resize();
            }
        };

        // Resize charts after a short delay to ensure proper rendering
        setTimeout(resizeCharts, 300);

        // Also resize on window resize
        window.addEventListener('resize', function () {
            setTimeout(resizeCharts, 100);
        });
    }
}

// Boxicons fallback
window.addEventListener('load', function () {
    if (!customElements.get('box-icon')) {
        // Load fallback
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '../../scripts/boxicons-fallback.js';
        document.head.appendChild(fallbackScript);
        console.warn('Boxicons CDN failed, using fallback');
    }
});

// Supabase fallback
window.addEventListener('load', function () {
    if (typeof supabase === 'undefined') {
        // Load fallback
        const fallbackScript = document.createElement('script');
        fallbackScript.src = '../../scripts/supabase-fallback.js';
        document.head.appendChild(fallbackScript);
        console.warn('Supabase CDN failed, using fallback');

        // Show error message to user
        setTimeout(function () {
            if (typeof supabase === 'undefined') {
                alert('Failed to load authentication service. Some features may not work properly.');
            }
        }, 3000);
    }
});

// Make supabase globally available
document.addEventListener('DOMContentLoaded', function () {
    if (typeof window.supabase === 'undefined' && typeof supabase !== 'undefined') {
        window.supabase = supabase;
        console.log('Supabase made globally available');
    }
});

// Function to format currency
function formatCurrency(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    });
}

// Function to update UI with tax calculation data
function updateUIWithTaxData(taxData) {
    console.log('Updating UI with tax data:', taxData);

    // Update monthly income
    const monthlyIncomeElement = document.querySelector('.p-4.border.rounded-md.bg-gradient-to-br.from-blue-50 .value-display');
    if (monthlyIncomeElement && taxData.netMonthlyIncome) {
        monthlyIncomeElement.textContent = formatCurrency(taxData.netMonthlyIncome);
        // Update timestamp
        const timestampElement = monthlyIncomeElement.nextElementSibling;
        if (timestampElement && timestampElement.classList.contains('text-xs')) {
            const date = new Date();
            timestampElement.textContent = `Updated on ${date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`;
        }
    }

    // Update expenses if available
    if (taxData.monthlyExpenses) {
        const monthlyExpensesElement = document.querySelector('.p-4.border.rounded-md.bg-gradient-to-br.from-red-50 .value-display');
        if (monthlyExpensesElement) {
            monthlyExpensesElement.textContent = formatCurrency(taxData.monthlyExpenses);

            // Update trend indicator
            const trendElement = monthlyExpensesElement.nextElementSibling;
            if (trendElement && trendElement.classList.contains('trend-down')) {
                trendElement.innerHTML = '<i class="fas fa-arrow-down mr-1"></i> 3% from last month';
            }
        }
    }

    // Calculate and update savings
    if (taxData.netMonthlyIncome && taxData.monthlyExpenses) {
        const monthlySavings = taxData.netMonthlyIncome - taxData.monthlyExpenses;
        const monthlySavingsElement = document.querySelector('.p-4.border.rounded-md.bg-gradient-to-br.from-green-50 .value-display');
        if (monthlySavingsElement) {
            monthlySavingsElement.textContent = formatCurrency(monthlySavings);

            // Update trend indicator
            const trendElement = monthlySavingsElement.nextElementSibling;
            if (trendElement && trendElement.classList.contains('trend-up')) {
                trendElement.innerHTML = '<i class="fas fa-arrow-up mr-1"></i> 5% from last month';
            }
        }

        // Calculate and update saving rate
        const savingRate = (monthlySavings / taxData.netMonthlyIncome) * 100;

        // Find all value-label elements to locate the Financial Health section
        const valueLabels = document.querySelectorAll('.value-label');
        let savingRateElement = null;
        let debtRatioElement = null;
        let emergencyFundElement = null;

        valueLabels.forEach(label => {
            if (label.textContent.includes('Saving Rate')) {
                savingRateElement = label.nextElementSibling;
            }
            else if (label.textContent.includes('Debt-to-Income')) {
                debtRatioElement = label.nextElementSibling;
            }
            else if (label.textContent.includes('Emergency Fund')) {
                emergencyFundElement = label.nextElementSibling;
            }
        });

        // Update Saving Rate
        if (savingRateElement) {
            savingRateElement.textContent = `${savingRate.toFixed(1)}%`;
            // Update saving rate progress bar
            const savingRateProgressBar = savingRateElement.nextElementSibling?.querySelector('.bg-blue-500');
            if (savingRateProgressBar) {
                savingRateProgressBar.style.width = `${Math.min(savingRate, 100)}%`;
            }
        }

        // Update Debt-to-Income Ratio (assumed to be 0 for demo)
        if (debtRatioElement) {
            debtRatioElement.textContent = '0.0%';
            // Update debt ratio progress bar
            const debtRatioProgressBar = debtRatioElement.nextElementSibling?.querySelector('.bg-green-500');
            if (debtRatioProgressBar) {
                debtRatioProgressBar.style.width = '0%';
            }
        }

        // Update Emergency Fund (calculated as savings divided by monthly expenses)
        if (emergencyFundElement && taxData.monthlyExpenses > 0) {
            // Assuming emergency fund is just current monthly savings divided by expenses
            // This is simplified - in reality you'd use a dedicated emergency fund amount
            const emergencyFundMonths = Math.min(monthlySavings / taxData.monthlyExpenses, 6).toFixed(1);
            emergencyFundElement.textContent = `${emergencyFundMonths} months`;
            // Update emergency fund progress bar
            const emergencyFundProgressBar = emergencyFundElement.nextElementSibling?.querySelector('.bg-red-500');
            if (emergencyFundProgressBar) {
                // Emergency fund standard is 3-6 months of expenses
                const percentage = (emergencyFundMonths / 6) * 100;
                emergencyFundProgressBar.style.width = `${Math.min(percentage, 100)}%`;
            }
        }

        // Update expense breakdown chart
        const expenseBreakdownChart = window.expenseBreakdownChart;
        if (expenseBreakdownChart) {
            // Calculate expense breakdown using the budget percentages
            const housingExpense = taxData.monthlyExpenses * 0.75; // 75% of expenses (assumed)
            const utilitiesExpense = taxData.monthlyExpenses * 0.1; // 10% of expenses
            const groceriesExpense = taxData.monthlyExpenses * 0.15; // 15% of expenses

            expenseBreakdownChart.data.datasets[0].data = [
                housingExpense,
                utilitiesExpense,
                groceriesExpense
            ];
            expenseBreakdownChart.update();
        }

        // Update daily spending chart
        const dailySpendingChart = window.dailySpendingChart;
        if (dailySpendingChart) {
            // Generate realistic daily spending pattern
            const dailyAvg = taxData.monthlyExpenses / 30;
            const newDailyData = Array(30).fill(0).map((_, i) => {
                if (i % 7 === 0) {
                    // Higher spending on weekends
                    return dailyAvg * (1.5 + Math.random() * 0.5);
                } else if (i === 9) {
                    // One big expense day (maybe rent)
                    return housingExpense;
                } else {
                    // Normal days
                    return dailyAvg * (0.5 + Math.random() * 0.5);
                }
            });

            dailySpendingChart.data.datasets[0].data = newDailyData;
            dailySpendingChart.update();
        }

        // Update charts if they exist
        if (window.monthlyProgressChart) {
            const datasets = window.monthlyProgressChart.data.datasets;
            if (datasets && datasets.length >= 2) {
                // Get current date for the label
                const currentDate = new Date();
                const monthYear = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear().toString().substr(2)}`;

                // Find the index of the current month or add it
                let monthIndex = window.monthlyProgressChart.data.labels.indexOf(monthYear);
                if (monthIndex === -1) {
                    // Add new month to the chart
                    window.monthlyProgressChart.data.labels.push(monthYear);
                    monthIndex = window.monthlyProgressChart.data.labels.length - 1;
                }

                // Update the datasets with the new values
                datasets[0].data[monthIndex] = taxData.netMonthlyIncome;
                datasets[1].data[monthIndex] = taxData.monthlyExpenses;

                // Update the chart
                window.monthlyProgressChart.update();
            }
        }

        // Automatically set budget based on income
        autoBudget(taxData.netMonthlyIncome);

        // Update bill due dates
        updateBillDueDates();
    }

    // Show success message
    showToast('Tax data imported successfully!', 'success');
}

// Function to update bill due dates to be realistic future dates
function updateBillDueDates() {
    const dueDateCells = document.querySelectorAll('table tbody td:nth-child(3)');
    if (dueDateCells.length > 0) {
        const today = new Date();

        dueDateCells.forEach((cell, index) => {
            // Generate due dates that are in the near future
            const dueDate = new Date(today);
            dueDate.setDate(today.getDate() + (5 + index * 10)); // 5 days and 15 days from now

            const formattedDate = `${dueDate.getDate()} ${dueDate.toLocaleString('default', { month: 'short' })} ${dueDate.getFullYear()}`;
            cell.textContent = formattedDate;
        });
    }
}

// Function to automatically set budget based on income
function autoBudget(income) {
    console.log('Setting budget based on monthly income:', income);

    // Simple 50/30/20 rule - direct percentages
    const budgetCategories = {
        'Housing': 30,       // Main necessity - 30% of income
        'Utilities': 10,     // Basic necessity - 10% of income
        'Groceries': 10,     // Food necessity - 10% of income
        'Wants': 30,         // All discretionary spending - 30% of income
        'Savings': 20        // Savings - 20% of income
    };

    // Total should be 100%

    // Get all budget vs actual rows
    const budgetRows = document.querySelectorAll('#budgetComparison > div');

    budgetRows.forEach(row => {
        const categoryNameElement = row.querySelector('span.text-sm.font-medium');
        if (!categoryNameElement) return;

        const categoryName = categoryNameElement.textContent;

        // Determine budget percentage - map old categories to new system
        let budgetPercentage = 0;

        if (categoryName === 'Housing') {
            budgetPercentage = 30; // 30% of income
        }
        else if (categoryName === 'Utilities') {
            budgetPercentage = 10; // 10% of income
        }
        else if (categoryName === 'Groceries') {
            budgetPercentage = 10; // 10% of income
        }
        else if (categoryName === 'Health') {
            // Include Health in Necessities
            budgetPercentage = 5; // 5% of income
        }
        else if (categoryName === 'Transportation' || categoryName === 'Entertainment' || categoryName === 'Personal') {
            // Group all "wants" together - divide the 30% among these
            if (categoryName === 'Transportation') {
                budgetPercentage = 10; // 10% of income
            }
            else if (categoryName === 'Entertainment') {
                budgetPercentage = 10; // 10% of income
            }
            else if (categoryName === 'Personal') {
                budgetPercentage = 10; // 10% of income
            }
        }

        // Skip if category isn't recognized
        if (budgetPercentage === 0) return;

        // Calculate budget amount based on percentage of total income
        const budgetAmount = Math.round(income * (budgetPercentage / 100));

        // Get current actual expense value
        const valueDisplay = row.querySelector('.flex.justify-between span:last-child');
        if (valueDisplay) {
            const currentText = valueDisplay.textContent;
            let actualValue = 0;

            // Try to extract the actual value
            try {
                actualValue = parseFloat(currentText.split('/')[0].replace(/[^\d.]/g, ''));
                if (isNaN(actualValue)) actualValue = 0;
            } catch (e) {
                console.error('Error parsing actual value:', e);
                actualValue = 0;
            }

            // Update the display with new budget
            valueDisplay.textContent = `₹${actualValue.toLocaleString()}/₹${budgetAmount.toLocaleString()}`;

            // Update progress bar
            const progressBarContainer = row.querySelector('.w-full.bg-gray-200.rounded-full');
            const progressBar = row.querySelector('.bg-red-600, .bg-blue-600');

            if (progressBar && progressBarContainer) {
                // Calculate percentage (capped at 100% for visual purposes)
                const percentage = Math.min((actualValue / budgetAmount) * 100, 100);

                // Update progress bar width
                progressBar.style.width = `${percentage}%`;

                // Update status badge
                const statusBadge = row.querySelector('.badge');
                if (statusBadge) {
                    if (actualValue > budgetAmount) {
                        const overPercentage = Math.round((actualValue / budgetAmount - 1) * 100);
                        statusBadge.className = 'badge badge-danger text-xs';
                        statusBadge.textContent = `Over budget by ${overPercentage}%`;
                        progressBar.className = 'bg-red-600 h-2.5 rounded-full animate-progress';
                    } else {
                        const underPercentage = Math.round((1 - actualValue / budgetAmount) * 100);
                        statusBadge.className = 'badge badge-success text-xs';
                        statusBadge.textContent = `Under budget by ${underPercentage}%`;
                        progressBar.className = 'bg-blue-600 h-2.5 rounded-full animate-progress';
                    }
                }
            }
        }
    });

    console.log('Simplified budget allocation complete');
}

// Authentication check
document.addEventListener('DOMContentLoaded', async function () {
    console.log("Dashboard DOM loaded, checking auth...");

    // Check if Supabase is available
    if (typeof window.supabase === 'undefined' && typeof supabase === 'undefined') {
        console.error('Supabase library not available');
        alert('Authentication service not available. Please refresh the page or try again later.');
        return;
    }

    // Get Supabase client
    const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';

    // Use either window.supabase or global supabase
    const supabaseLib = window.supabase || supabase;
    const supabaseClient = supabaseLib.createClient(supabaseUrl, supabaseKey);

    try {
        // Check if user is authenticated
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error || !session) {
            console.error('Authentication error:', error);
            alert('Please login to access the dashboard');
            window.location.href = '../auth/login.html';
            return;
        }

        // User is authenticated
        const user = session.user;
        console.log('Authenticated user:', user);

        // Get or create profile with name data
        let displayName = "User";

        // Check if user has a profile 
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id, auth_id, first_name, last_name, full_name')
            .eq('auth_id', user.id)
            .single();

        console.log('Profile query result:', { profile, profileError });

        if (profile) {
            // Profile exists
            if (profile.first_name && profile.last_name) {
                displayName = `${profile.first_name} ${profile.last_name}`;
            }
            else if (profile.full_name) {
                displayName = profile.full_name;
            }
            else if (profile.first_name) {
                displayName = profile.first_name;
            }
            else if (profile.last_name) {
                displayName = profile.last_name;
            }
            else {
                // Profile exists but no name - update it with extracted name
                const emailParts = user.email.split('@')[0].split(/[._-]/);
                const autoFirstName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
                let autoLastName = '';

                if (emailParts.length > 1) {
                    autoLastName = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1);
                }

                // Update profile with extracted name
                const { data: updatedProfile, error: updateError } = await supabaseClient
                    .from('profiles')
                    .update({
                        first_name: autoFirstName,
                        last_name: autoLastName,
                        full_name: `${autoFirstName} ${autoLastName}`.trim()
                    })
                    .eq('auth_id', user.id)
                    .select()
                    .single();

                console.log('Profile update result:', { updatedProfile, updateError });

                if (updatedProfile) {
                    displayName = `${autoFirstName} ${autoLastName}`.trim();
                } else {
                    displayName = user.email;
                }
            }
        } else {
            // No profile - create one with name extracted from email
            const emailParts = user.email.split('@')[0].split(/[._-]/);
            const autoFirstName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
            let autoLastName = '';

            if (emailParts.length > 1) {
                autoLastName = emailParts[1].charAt(0).toUpperCase() + emailParts[1].slice(1);
            }

            // Create profile with extracted name
            const { data: newProfile, error: createError } = await supabaseClient
                .from('profiles')
                .insert({
                    auth_id: user.id,
                    first_name: autoFirstName,
                    last_name: autoLastName,
                    full_name: `${autoFirstName} ${autoLastName}`.trim()
                })
                .select()
                .single();

            console.log('New profile creation result:', { newProfile, createError });

            if (newProfile) {
                displayName = `${autoFirstName} ${autoLastName}`.trim();
            } else {
                displayName = user.email;
            }
        }

        console.log('Final display name:', displayName);

        // Update UI with name
        const userNameElements = document.querySelectorAll('.user-name');
        if (userNameElements.length > 0) {
            userNameElements.forEach(element => {
                element.textContent = displayName;
            });
        }

        // Set user email in header
        const emailElement = document.querySelector('.text-blue-600.font-medium');
        if (emailElement && user.email) {
            emailElement.textContent = user.email;
        }

        // Check for tax data in localStorage and apply if present
        const taxData = localStorage.getItem('taxCalculationData');
        if (taxData) {
            try {
                const parsedData = JSON.parse(taxData);
                // Auto-import tax data if available
                updateUIWithTaxData(parsedData);
                console.log('Auto-imported tax data from localStorage');
            } catch (e) {
                console.error('Error parsing stored tax data:', e);
            }
        }

        // Implement logout functionality
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', async function () {
                try {
                    console.log('Logging out...');

                    // Sign out from Supabase
                    const { error } = await supabaseClient.auth.signOut();

                    if (error) {
                        console.error('Error signing out:', error);
                        alert('Error signing out. Please try again.');
                        return;
                    }

                    // Clear any auth-related localStorage items
                    localStorage.removeItem('supabase.auth.token');
                    localStorage.removeItem('sb-kyathezublanpnjwansc-auth-token');

                    // Clear any other app-specific localStorage items
                    const keysToRemove = [];
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && (key.startsWith('supabase') || key.startsWith('sb-') || key.includes('auth'))) {
                            keysToRemove.push(key);
                        }
                    }

                    keysToRemove.forEach(key => {
                        console.log('Removing localStorage item:', key);
                        localStorage.removeItem(key);
                    });

                    console.log('Successfully logged out');

                    // Add a delay before redirecting to ensure everything is cleared
                    setTimeout(() => {
                        // Force reload the page to clear any in-memory state
                        window.location.href = '../auth/login.html?logout=true';
                    }, 400);
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Error during logout. Please try clearing your browser cache manually.');
                }
            });
        }
    } catch (error) {
        console.error('Dashboard authentication error:', error);
        alert('Authentication error. Please login again.');
        window.location.href = '../auth/login.html';
    }
});

// Perfect Scrollbar Initialization
document.addEventListener('DOMContentLoaded', function () {
    // Function to initialize Perfect Scrollbar
    function initPerfectScrollbar() {
        console.log("Initializing Perfect Scrollbar...");

        // First destroy any existing instances
        const psElements = document.querySelectorAll('.ps');
        psElements.forEach(element => {
            const ps = element._ps;
            if (ps) {
                console.log("Destroying existing PS instance");
                ps.destroy();
                delete element._ps;
            }
        });

        // Apply to sidebar
        const sidebar = document.querySelector('aside');
        if (sidebar) {
            console.log("Applying PS to sidebar");
            sidebar.classList.add('ps');
            const sidebarPs = new PerfectScrollbar(sidebar, {
                wheelSpeed: 1,
                wheelPropagation: false,
                minScrollbarLength: 20
            });
            sidebar._ps = sidebarPs;
        }

        // Apply to overflow elements
        document.querySelectorAll('.overflow-x-auto, .overflow-y-auto').forEach(element => {
            if (!element.closest('aside')) { // Skip elements inside sidebar (already handled)
                console.log("Applying PS to:", element);
                element.classList.add('ps');
                const elementPs = new PerfectScrollbar(element, {
                    wheelSpeed: 1,
                    wheelPropagation: false,
                    minScrollbarLength: 20
                });
                element._ps = elementPs;
            }
        });

        // Update all perfect scrollbars after a short delay
        setTimeout(() => {
            document.querySelectorAll('.ps').forEach(element => {
                if (element._ps) {
                    element._ps.update();
                }
            });
        }, 500);
    }

    // Run initialization after a short delay to ensure DOM is fully rendered
    setTimeout(initPerfectScrollbar, 200);

    // Also update on window resize
    window.addEventListener('resize', function () {
        document.querySelectorAll('.ps').forEach(element => {
            if (element._ps) {
                element._ps.update();
            }
        });
    });
});

// Add charts and functionality for Financial Dashboard
document.addEventListener('DOMContentLoaded', function () {
    // Apply animation to progress bars with a delay for each one
    const progressBars = document.querySelectorAll('.animate-progress');
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.animationPlayState = 'running';
        }, 300 + (index * 100));
    });

    // Expense Breakdown Chart (Pie Chart)
    const expenseBreakdownCtx = document.getElementById('expenseBreakdownChart').getContext('2d');
    const expenseBreakdownChart = new Chart(expenseBreakdownCtx, {
        type: 'doughnut',
        data: {
            labels: ['Housing', 'Utilities', 'Groceries'],
            datasets: [{
                label: 'Expenses',
                data: [73, 10, 17],  // Adjusted to roughly match the proportions in the image
                backgroundColor: [
                    '#FF6384', // pink for housing
                    '#36A2EB', // blue for utilities
                    '#FFCE56', // yellow for groceries
                ],
                borderColor: [
                    '#FFFFFF',
                    '#FFFFFF',
                    '#FFFFFF'
                ],
                borderWidth: 1,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '38%',
            layout: {
                padding: {
                    top: 10,
                    right: 120,
                    bottom: 10,
                    left: 10
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    align: 'center',
                    labels: {
                        usePointStyle: false,
                        padding: 20,
                        font: {
                            size: 13
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${percentage}%`;
                        }
                    }
                }
            }
        }
    });
    // Store chart reference globally to access it later
    window.expenseBreakdownChart = expenseBreakdownChart;

    // Monthly Progress Chart (Bar Chart)
    const monthlyProgressCtx = document.getElementById('monthlyProgressChart').getContext('2d');
    const monthlyProgressChart = new Chart(monthlyProgressCtx, {
        type: 'bar',
        data: {
            labels: ['Nov 24', 'Dec 24', 'Jan 25', 'Feb 25', 'Mar 25', 'Apr 25'],
            datasets: [{
                label: 'Income',
                data: [0, 0, 0, 0, 0, 650000],
                backgroundColor: '#93C5FD',
                barPercentage: 0.6,
            },
            {
                label: 'Expenses',
                data: [0, 0, 0, 0, 0, 20500],
                backgroundColor: '#FCA5A5',
                barPercentage: 0.6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                delay: function (context) {
                    return context.dataIndex * 100;
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grace: '10%',
                    ticks: {
                        callback: function (value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '₹' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    // Store chart reference globally to access it later
    window.monthlyProgressChart = monthlyProgressChart;

    // Daily Spending Pattern Chart (Line Chart)
    const dailySpendingCtx = document.getElementById('dailySpendingChart').getContext('2d');
    const dailySpendingData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 20000, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    const dailySpendingChart = new Chart(dailySpendingCtx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 30 }, (_, i) => i + 1),
            datasets: [{
                label: 'Daily Spending',
                data: dailySpendingData,
                backgroundColor: 'rgba(45, 212, 191, 0.2)',
                borderColor: 'rgba(45, 212, 191, 1)',
                pointBackgroundColor: 'rgba(45, 212, 191, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(45, 212, 191, 1)',
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grace: '10%',
                    ticks: {
                        callback: function (value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '₹' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
    // Store chart reference globally to access it later
    window.dailySpendingChart = dailySpendingChart;

    // Import Tax Data button functionality
    const importTaxButton = document.querySelector('.btn.btn-primary:has(.fa-file-import)');
    if (importTaxButton) {
        importTaxButton.addEventListener('click', function () {
            // Show the import modal with saved calculations
            showImportCalculationsModal();
        });
    }

    // Connect the suggest budget button with the function
    const suggestBudgetBtn = document.getElementById('suggestBudgetBtn');
    if (suggestBudgetBtn) {
        suggestBudgetBtn.addEventListener('click', function () {
            suggestBudget();
        });
    }

    // Connect the set budget button 
    const setBudgetBtn = document.getElementById('setBudgetBtn');
    if (setBudgetBtn) {
        setBudgetBtn.addEventListener('click', function () {
            alert('Set Budget functionality will be implemented here');
        });
    }

    // Add Bill functionality
    const addBillBtn = document.querySelector('.btn.btn-danger:has(.fa-plus)');
    if (addBillBtn) {
        addBillBtn.addEventListener('click', function () {
            // Create modal
            createAddBillModal();
        });
    }

    // Add Goal functionality
    const addGoalBtn = document.querySelector('.btn.btn-primary:has(.fa-plus)');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', function () {
            // Create modal
            createAddGoalModal();
        });
    }

    // Contribution buttons for savings goals
    const contributeButtons = document.querySelectorAll('.btn.btn-primary');
    contributeButtons.forEach(button => {
        if (button.textContent.trim() === 'Contribute') {
            button.addEventListener('click', function () {
                const goalContainer = this.closest('.p-4.border.rounded-lg');
                const goalName = goalContainer.querySelector('h3.font-medium').textContent;
                createContributeModal(goalName);
            });
        }
    });

    // Function to create Add Bill modal
    function createAddBillModal() {
        // Create modal background
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl';

        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'flex justify-between items-center mb-4';
        modalHeader.innerHTML = `
            <h2 class="text-xl font-bold text-gray-800">Add New Bill</h2>
            <button class="text-gray-600 hover:text-gray-800">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Create form
        const form = document.createElement('form');
        form.className = 'space-y-4';
        form.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Bill Name</label>
                <input type="text" class="w-full p-2 border rounded-md" placeholder="e.g. Internet, Electricity, etc.">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" class="w-full p-2 border rounded-md" placeholder="₹">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" class="w-full p-2 border rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
                <select class="w-full p-2 border rounded-md">
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Yearly</option>
                    <option>One-time</option>
                </select>
            </div>
            <div class="flex justify-end space-x-2 pt-4">
                <button type="button" class="btn btn-secondary">Cancel</button>
                <button type="button" class="btn btn-primary">Add Bill</button>
            </div>
        `;

        // Add elements to modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);

        // Add event listeners
        const closeBtn = modalHeader.querySelector('button');
        closeBtn.addEventListener('click', function () {
            modal.remove();
        });

        const cancelBtn = form.querySelector('.btn-secondary');
        cancelBtn.addEventListener('click', function () {
            modal.remove();
        });

        const addBtn = form.querySelector('.btn-primary');
        addBtn.addEventListener('click', function () {
            // Simulate adding a bill
            const billName = form.querySelector('input[type="text"]').value || 'New Bill';
            const amount = form.querySelector('input[type="number"]').value || '1500';
            const dueDate = form.querySelector('input[type="date"]').value || new Date().toISOString().split('T')[0];

            // Format the date
            const date = new Date(dueDate);
            const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

            // Add to the table
            const billsTable = document.querySelector('table tbody');
            if (billsTable) {
                const newRow = document.createElement('tr');
                newRow.innerHTML = `
                    <td class="px-6 py-5 whitespace-nowrap text-base font-medium text-gray-900">${billName}</td>
                    <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700">₹${parseFloat(amount).toLocaleString()}</td>
                    <td class="px-6 py-5 whitespace-nowrap text-base text-gray-700">${formattedDate}</td>
                    <td class="px-6 py-5 whitespace-nowrap">
                        <span class="badge badge-warning text-sm">Pending</span>
                        <button class="ml-2 btn btn-primary text-sm py-1 px-3">Mark Paid</button>
                    </td>
                `;

                // Add event listener to the new Mark Paid button
                const markPaidBtn = newRow.querySelector('.btn-primary');
                markPaidBtn.addEventListener('click', function () {
                    const statusBadge = this.previousElementSibling;
                    statusBadge.className = 'badge badge-success';
                    statusBadge.textContent = 'Paid';
                    this.style.display = 'none';
                    showToast('Payment marked as paid successfully!', 'success');
                });

                // Add row to table
                billsTable.appendChild(newRow);

                // Show success message and close modal
                showToast('New bill added successfully!', 'success');
                modal.remove();
            }
        });

        // Add modal to body
        document.body.appendChild(modal);
    }

    // Function to create Add Goal modal
    function createAddGoalModal() {
        // Create modal background
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl';

        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'flex justify-between items-center mb-4';
        modalHeader.innerHTML = `
            <h2 class="text-xl font-bold text-gray-800">Add New Savings Goal</h2>
            <button class="text-gray-600 hover:text-gray-800">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Create form
        const form = document.createElement('form');
        form.className = 'space-y-4';
        form.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input type="text" class="w-full p-2 border rounded-md" placeholder="e.g. New Car, Home Down Payment, etc.">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
                <input type="number" class="w-full p-2 border rounded-md" placeholder="₹">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input type="date" class="w-full p-2 border rounded-md">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Initial Contribution</label>
                <input type="number" class="w-full p-2 border rounded-md" placeholder="₹">
            </div>
            <div class="flex justify-end space-x-2 pt-4">
                <button type="button" class="btn btn-secondary">Cancel</button>
                <button type="button" class="btn btn-primary">Add Goal</button>
            </div>
        `;

        // Add elements to modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);

        // Add event listeners
        const closeBtn = modalHeader.querySelector('button');
        closeBtn.addEventListener('click', function () {
            modal.remove();
        });

        const cancelBtn = form.querySelector('.btn-secondary');
        cancelBtn.addEventListener('click', function () {
            modal.remove();
        });

        const addBtn = form.querySelector('.btn-primary');
        addBtn.addEventListener('click', function () {
            // Simulate adding a goal
            const goalName = form.querySelector('input[type="text"]').value || 'New Goal';
            const targetAmount = form.querySelector('input[type="number"]').value || '50000';
            const targetDate = form.querySelector('input[type="date"]').value || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const initialAmount = form.querySelectorAll('input[type="number"]')[1].value || '0';

            // Format the date
            const date = new Date(targetDate);
            const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

            // Calculate days left
            const today = new Date();
            const daysLeft = Math.round((date - today) / (24 * 60 * 60 * 1000));

            // Calculate percentage
            const percentage = Math.round((parseFloat(initialAmount) / parseFloat(targetAmount)) * 100);

            // Create new goal element
            const savingsGoalsContainer = document.querySelector('.card.p-6.animate-fadeIn[style*="animation-delay: 0.5s"] .space-y-6');
            if (savingsGoalsContainer) {
                const newGoal = document.createElement('div');
                newGoal.className = 'p-4 border rounded-lg bg-indigo-50';
                newGoal.innerHTML = `
                    <div class="flex justify-between items-center">
                        <h3 class="font-medium">${goalName}</h3>
                        <span class="text-sm text-indigo-600 flex items-center">
                            <i class="fas fa-calendar-day mr-1"></i> ${daysLeft} days left
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 mb-2">Target: ₹${parseFloat(targetAmount).toLocaleString()} by ${formattedDate}</p>
                    <p class="text-sm text-gray-600 mb-2">Current: ₹${parseFloat(initialAmount).toLocaleString()}</p>
                    <div class="w-full bg-white rounded-full h-2.5 mb-1">
                        <div class="bg-indigo-600 h-2.5 rounded-full animate-progress" style="width: ${percentage}%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500 items-center">
                        <span>${percentage}%</span>
                        <button class="btn btn-primary text-xs py-1 px-3">Contribute</button>
                    </div>
                `;

                // Add event listener to the contribute button
                const contributeBtn = newGoal.querySelector('.btn-primary');
                contributeBtn.addEventListener('click', function () {
                    createContributeModal(goalName);
                });

                // Add goal to container
                savingsGoalsContainer.appendChild(newGoal);

                // Show success message and close modal
                showToast('New savings goal added successfully!', 'success');
                modal.remove();
            }
        });

        // Add modal to body
        document.body.appendChild(modal);
    }

    // Function to create Contribute modal
    function createContributeModal(goalName) {
        // Create modal background
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl';

        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'flex justify-between items-center mb-4';
        modalHeader.innerHTML = `
            <h2 class="text-xl font-bold text-gray-800">Contribute to ${goalName}</h2>
            <button class="text-gray-600 hover:text-gray-800">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Create form
        const form = document.createElement('form');
        form.className = 'space-y-4';
        form.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Contribution Amount</label>
                <input type="number" class="w-full p-2 border rounded-md" placeholder="₹">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" class="w-full p-2 border rounded-md" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="flex justify-end space-x-2 pt-4">
                <button type="button" class="btn btn-secondary">Cancel</button>
                <button type="button" class="btn btn-primary">Contribute</button>
            </div>
        `;

        // Add elements to modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);

        // Add event listeners
        const closeBtn = modalHeader.querySelector('button');
        closeBtn.addEventListener('click', function () {
            modal.remove();
        });

        const cancelBtn = form.querySelector('.btn-secondary');
        cancelBtn.addEventListener('click', function () {
            modal.remove();
        });

        const contributeBtn = form.querySelector('.btn-primary');
        contributeBtn.addEventListener('click', function () {
            // Get contribution amount
            const amount = form.querySelector('input[type="number"]').value || '5000';

            // Find the goal in the DOM
            const goals = document.querySelectorAll('.p-4.border.rounded-lg h3.font-medium');
            let goalElement = null;
            goals.forEach(el => {
                if (el.textContent === goalName) {
                    goalElement = el.closest('.p-4.border.rounded-lg');
                }
            });

            if (goalElement) {
                // Get current and target amounts
                const targetText = goalElement.querySelector('p:nth-child(2)').textContent;
                const currentText = goalElement.querySelector('p:nth-child(3)').textContent;

                const targetAmount = parseFloat(targetText.match(/₹([\d,]+)/)[1].replace(/,/g, ''));
                const currentAmount = parseFloat(currentText.match(/₹([\d,]+)/)[1].replace(/,/g, '')) + parseFloat(amount);

                // Update current amount
                goalElement.querySelector('p:nth-child(3)').textContent = `Current: ₹${currentAmount.toLocaleString()}`;

                // Calculate new percentage
                const percentage = Math.min(Math.round((currentAmount / targetAmount) * 100), 100);

                // Update progress bar
                goalElement.querySelector('.bg-indigo-600, .bg-blue-600, .bg-purple-600').style.width = `${percentage}%`;

                // Update percentage text
                goalElement.querySelector('.flex.justify-between span').textContent = `${percentage}%`;

                // If goal is complete, add a completion message
                if (percentage >= 100) {
                    const completeMessage = document.createElement('div');
                    completeMessage.className = 'mt-2 text-sm text-green-600 font-semibold';
                    completeMessage.innerHTML = '<i class="fas fa-check-circle mr-1"></i> Goal achieved!';

                    // Add the message if it doesn't exist yet
                    if (!goalElement.querySelector('.text-green-600')) {
                        goalElement.appendChild(completeMessage);
                    }
                }

                // Show success message and close modal
                showToast(`Successfully contributed ₹${parseFloat(amount).toLocaleString()} to ${goalName}!`, 'success');
                modal.remove();
            }
        });

        // Add modal to body
        document.body.appendChild(modal);
    }

    // Function to show the import calculations modal
    async function showImportCalculationsModal() {
        try {
            // Create loader modal first
            const loaderModal = document.createElement('div');
            loaderModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loaderModal.innerHTML = `
                <div class="bg-white p-5 rounded-lg flex items-center space-x-3">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span>Loading your saved calculations...</span>
                </div>
            `;
            document.body.appendChild(loaderModal);

            // Get Supabase client
            const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';
            const supabaseLib = window.supabase || supabase;
            const supabaseClient = supabaseLib.createClient(supabaseUrl, supabaseKey);

            // Check if user is authenticated
            const { data: { session }, error: authError } = await supabaseClient.auth.getSession();

            if (authError || !session) {
                loaderModal.remove();
                showToast('Please log in to access your saved calculations', 'error');
                return;
            }

            // Get user ID
            const userId = session.user.id;

            // Fetch user's saved calculations
            const { data: calculations, error: fetchError } = await supabaseClient
                .from('tax_calculations')
                .select('id, name, created_at, calculation_data')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // Remove loader
            loaderModal.remove();

            if (fetchError) {
                console.error('Error fetching calculations:', fetchError);
                showToast('Error loading your saved calculations', 'error');
                return;
            }

            // Check if we have any saved calculations
            if (!calculations || calculations.length === 0) {
                // Get data from localStorage as fallback
                const taxData = localStorage.getItem('taxCalculationData');
                if (taxData) {
                    try {
                        const parsedData = JSON.parse(taxData);
                        updateUIWithTaxData(parsedData);
                        showToast('Using most recent calculation from this device', 'info');
                    } catch (e) {
                        console.error('Error parsing stored tax data:', e);
                        showToast('No saved calculations found. Please calculate your taxes first.', 'error');
                    }
                } else {
                    showToast('No saved calculations found. Please calculate your taxes first.', 'error');
                }
                return;
            }

            // Create modal for showing saved calculations
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl w-full';

            // Create modal header
            const modalHeader = document.createElement('div');
            modalHeader.className = 'flex justify-between items-center mb-4';
            modalHeader.innerHTML = `
                <h2 class="text-xl font-bold text-gray-800">Import Tax Calculation</h2>
                <button class="text-gray-600 hover:text-gray-800">
                    <i class="fas fa-times"></i>
                </button>
            `;

            // Create calculation list
            const calcList = document.createElement('div');
            calcList.className = 'max-h-80 overflow-y-auto space-y-2';

            // Add calculations to the list
            calculations.forEach((calc) => {
                const date = new Date(calc.created_at);
                const formattedDate = date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const calcItem = document.createElement('div');
                calcItem.className = 'p-3 border rounded-lg hover:bg-blue-50 cursor-pointer flex justify-between items-center';
                calcItem.innerHTML = `
                    <div>
                        <h3 class="font-medium text-gray-800">${calc.name}</h3>
                        <p class="text-sm text-gray-500">${formattedDate}</p>
                    </div>
                    <button class="import-btn text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-sm">
                        Import
                    </button>
                `;

                // Add click event to import button
                const importBtn = calcItem.querySelector('.import-btn');
                importBtn.addEventListener('click', function () {
                    const calcData = calc.calculation_data;
                    updateUIWithTaxData(calcData);
                    showToast('Tax data imported successfully!', 'success');
                    modal.remove();
                });

                calcList.appendChild(calcItem);
            });

            // Create fallback option for local data
            const localDataOption = document.createElement('div');
            localDataOption.className = 'mt-4 p-3 border border-dashed rounded-lg';
            localDataOption.innerHTML = `
                <p class="text-sm text-gray-700 mb-2">Alternatively, you can use the most recent calculation from this device:</p>
                <button class="w-full text-white bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-sm">
                    Use Local Data
                </button>
            `;

            // Add click event to local data button
            const localDataBtn = localDataOption.querySelector('button');
            localDataBtn.addEventListener('click', function () {
                const taxData = localStorage.getItem('taxCalculationData');
                if (taxData) {
                    try {
                        const parsedData = JSON.parse(taxData);
                        updateUIWithTaxData(parsedData);
                        showToast('Tax data imported from local storage!', 'success');
                        modal.remove();
                    } catch (e) {
                        console.error('Error parsing stored tax data:', e);
                        showToast('Error importing tax data. Please recalculate your taxes.', 'error');
                    }
                } else {
                    showToast('No tax calculation data found locally. Please calculate your taxes first.', 'error');
                }
            });

            // Add elements to modal
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(calcList);
            modalContent.appendChild(localDataOption);
            modal.appendChild(modalContent);

            // Add event listeners for close buttons
            const closeBtn = modalHeader.querySelector('button');
            closeBtn.addEventListener('click', function () {
                modal.remove();
            });

            // Add modal to body
            document.body.appendChild(modal);

        } catch (error) {
            console.error('Error showing import modal:', error);
            showToast('An error occurred. Please try again.', 'error');
        }
    }

    // Function to show toast/notification messages
    function showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container fixed bottom-4 right-4 z-50 flex flex-col space-y-2';
            document.body.appendChild(toastContainer);
        }

        // Create toast element
        const toast = document.createElement('div');
        let bgColor = 'bg-blue-500';
        let icon = 'fa-info-circle';

        // Set color and icon based on type
        if (type === 'success') {
            bgColor = 'bg-green-500';
            icon = 'fa-check-circle';
        } else if (type === 'error') {
            bgColor = 'bg-red-500';
            icon = 'fa-exclamation-circle';
        } else if (type === 'warning') {
            bgColor = 'bg-yellow-500';
            icon = 'fa-exclamation-triangle';
        }

        toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-xs animate-fade-in`;
        toast.innerHTML = `
            <i class="fas ${icon} mr-2"></i>
            <span>${message}</span>
        `;

        // Add to container
        toastContainer.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('animate-fade-out');
            setTimeout(() => {
                toast.remove();
                // Remove container if empty
                if (toastContainer.children.length === 0) {
                    toastContainer.remove();
                }
            }, 300);
        }, 3000);
    }
});

// Add custom scrollbar CSS rules
document.addEventListener('DOMContentLoaded', function () {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
        /* Hide default scrollbars */
        .ps {
            -ms-overflow-style: none !important;  /* IE and Edge */
            scrollbar-width: none !important;  /* Firefox */
        }
        
        .ps::-webkit-scrollbar {
            display: none !important;  /* Chrome, Safari and Opera */
        }
        
        /* Ensure scrollbar is visible only through Perfect Scrollbar UI */
        .ps:hover > .ps__rail-x,
        .ps:hover > .ps__rail-y,
        .ps--focus > .ps__rail-x,
        .ps--focus > .ps__rail-y,
        .ps--scrolling-x > .ps__rail-x,
        .ps--scrolling-y > .ps__rail-y {
            opacity: 0.9 !important;
        }
    `;
    document.head.appendChild(style);
});
