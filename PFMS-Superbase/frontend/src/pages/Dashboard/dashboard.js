// Make supabase globally available
if (typeof window !== 'undefined') {
    if (typeof window.supabase === 'undefined' && typeof supabase !== 'undefined') {
        window.supabase = supabase;
        console.log('Supabase made globally available');
    }
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

        // User is authenticated, load their profile info if available
        const user = session.user;
        console.log('Authenticated user:', user);

        // Optional: Load user profile data
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('auth_id', user.id)
            .single();

        if (profile && !profileError) {
            console.log('User profile:', profile);
            // You could use this data to personalize the dashboard
            // For example, display user name in the sidebar
            const userNameElements = document.querySelectorAll('.user-name');
            if (userNameElements.length > 0) {
                userNameElements.forEach(element => {
                    element.textContent = profile.full_name || user.email;
                });
            }
        }
    } catch (error) {
        console.error('Dashboard authentication error:', error);
        alert('Authentication error. Please login again.');
        window.location.href = '../auth/login.html';
    }

    // Setup logout button functionality
    setupLogoutButton();
});

// Logout Functionality
function setupLogoutButton() {
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async function () {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    // Get Supabase client
                    const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
                    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';
                    const supabaseLib = window.supabase || supabase;
                    const supabaseClient = supabaseLib.createClient(supabaseUrl, supabaseKey);

                    // Sign out from Supabase auth
                    await supabaseClient.auth.signOut();

                    // Clear all auth-related localStorage items
                    localStorage.removeItem('supabase.auth.token');
                    localStorage.removeItem('supabase.auth.expires_at');
                    localStorage.removeItem('supabase.auth.refresh_token');

                    // Clear session storage too
                    sessionStorage.clear();

                    // Show feedback to the user
                    alert('You have been successfully logged out.');

                    // Force redirect with no caching to login page
                    window.location.href = '../auth/login.html?logout=' + new Date().getTime();
                } catch (error) {
                    console.error('Logout error:', error);
                    alert('Error during logout. Please try again.');
                }
            }
        });
    }
}

//calculate tax starts
document.addEventListener('DOMContentLoaded', function () {
    // Debug: Check if elements are found
    console.log('Script loaded');

    // Constants for tax calculation
    const TAX_SLABS = [
        { min: 0, max: 400000, rate: 0 },
        { min: 400001, max: 800000, rate: 0.05 },
        { min: 800001, max: 1200000, rate: 0.10 },
        { min: 1200001, max: 1600000, rate: 0.15 },
        { min: 1600001, max: 2000000, rate: 0.20 },
        { min: 2000001, max: 2400000, rate: 0.25 },
        { min: 2400001, max: Infinity, rate: 0.30 }
    ];

    const SURCHARGE_RATES = [
        { min: 5000000, max: 10000000, rate: 0.10 },
        { min: 10000001, max: 20000000, rate: 0.15 },
        { min: 20000001, max: Infinity, rate: 0.25 }
    ];

    const STANDARD_DEDUCTION = 75000;
    const CESS_RATE = 0.04;
    const MAX_REBATE = 60000;
    const REBATE_INCOME_LIMIT = 1200000;

    // Form elements
    const steps = document.querySelectorAll('.step-content');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const progressBar = document.getElementById('progress-bar');

    // Step navigation buttons
    const step1NextBtn = document.getElementById('step1NextBtn');
    const step2PrevBtn = document.getElementById('step2PrevBtn');
    const step2NextBtn = document.getElementById('step2NextBtn');
    const step3PrevBtn = document.getElementById('step3PrevBtn');
    const step3NextBtn = document.getElementById('step3NextBtn');
    const step4PrevBtn = document.getElementById('step4PrevBtn');
    const resetBtn = document.getElementById('resetBtn');

    let currentStep = 1;

    // Helper function to get input value
    function getInputValue(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.error(`Element with id ${id} not found`);
            return 0;
        }
        const value = element.value.trim();
        return value === '' ? 0 : parseFloat(value);
    }

    // Form validation function
    function validateForm() {
        const validationRules = {
            basicSalary: {
                required: true,
                min: 400001,
                max: 100000000,
                message: 'Basic Salary must be between ₹4,00,001 and 1 Crore'
            },
            hraReceived: {
                required: false,
                min: 0,
                max: (value) => getInputValue('basicSalary') * 0.5,
                message: 'HRA cannot exceed 50% of Basic Salary'
            },
            specialAllowance: {
                required: false,
                min: 0,
                message: 'Special Allowance cannot be negative'
            },
            bonus: {
                min: 0,
                message: 'Bonus cannot be negative'
            },
            lta: {
                min: 0,
                max: 200000,
                message: 'LTA cannot exceed ₹2,00,000'
            },
            savingsInterest: {
                min: 0,
                message: 'Interest amount cannot be negative'
            },
            fdInterest: {
                min: 0,
                message: 'Interest amount cannot be negative'
            },
            rentalIncome: {
                min: 0,
                message: 'Rental income cannot be negative'
            }
        };

        let isValid = true;
        let errorMessages = [];

        // Validate each field
        for (const [id, rules] of Object.entries(validationRules)) {
            const value = getInputValue(id);

            if (rules.required && value === 0) {
                isValid = false;
                errorMessages.push(`${id.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
                continue;
            }

            if (rules.min !== undefined && value < rules.min) {
                isValid = false;
                errorMessages.push(rules.message);
            }

            if (rules.max !== undefined) {
                const maxValue = typeof rules.max === 'function' ? rules.max(value) : rules.max;
                if (value > maxValue) {
                    isValid = false;
                    errorMessages.push(rules.message);
                }
            }
        }

        if (!isValid) {
            alert('Please correct the following errors:\n' + errorMessages.join('\n'));
        }

        return isValid;
    }

    // Form navigation functions
    function updateProgress() {
        const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;

        stepIndicators.forEach((indicator, index) => {
            indicator.classList.remove('step-active', 'step-completed', 'step-pending');
            if (index + 1 === currentStep) {
                indicator.classList.add('step-active');
            } else if (index + 1 < currentStep) {
                indicator.classList.add('step-completed');
            } else {
                indicator.classList.add('step-pending');
            }
        });
    }

    function showStep(step) {
        if (step < 1 || step > steps.length) {
            console.error('Invalid step number:', step);
            return;
        }

        steps.forEach(stepElement => {
            stepElement.classList.add('hidden');
        });

        steps[step - 1].classList.remove('hidden');
        currentStep = step;
        updateProgress();
    }

    // Tax calculation functions
    function calculateTotalIncome() {
        const basicSalary = getInputValue('basicSalary') || 0;
        const hra = getInputValue('hraReceived') || 0;
        const specialAllowance = getInputValue('specialAllowance') || 0;
        const bonus = getInputValue('bonus') || 0;
        const lta = getInputValue('lta') || 0;

        // Calculate exemptions
        const hraExemption = calculateHRAExemption(basicSalary, hra);
        const ltaExemption = Math.min(lta, 60000); // Assuming max LTA exemption of 60k

        // Total exemptions
        const totalExemptions = hraExemption + ltaExemption;

        // Calculate taxable components of salary
        const taxableSalary = basicSalary + hra + specialAllowance + bonus + lta - totalExemptions;

        const savingsInterest = getInputValue('savingsInterest') || 0;
        const fdInterest = getInputValue('fdInterest') || 0;
        const rentalIncome = getInputValue('rentalIncome') || 0;

        const otherIncome = savingsInterest + fdInterest + rentalIncome;

        return {
            salaryIncome: basicSalary + hra + specialAllowance + bonus + lta,
            otherIncome,
            totalIncome: basicSalary + hra + specialAllowance + bonus + lta + otherIncome,
            taxableIncome: taxableSalary + otherIncome,
            totalExemptions: totalExemptions,
            exemptionBreakdown: {
                hra: hraExemption,
                lta: ltaExemption
            }
        };
    }

    // Calculate HRA exemption based on Indian tax rules
    function calculateHRAExemption(basicSalary, hraReceived) {
        if (!hraReceived || hraReceived <= 0) return 0;

        // Get rent paid - adding this input field
        const monthlyRent = getInputValue('rentPaid') || 0;
        const annualRent = monthlyRent * 12; // Convert monthly rent to annual

        // Check if metro city
        const isMetro = document.getElementById('isMetroCity')?.checked || false;

        // Calculate HRA exemption as per rules
        const actualHRA = hraReceived;
        const percentOfBasic = isMetro ? basicSalary * 0.5 : basicSalary * 0.4;
        const rentMinusPercent = Math.max(0, annualRent - (basicSalary * 0.1));

        // HRA exemption is minimum of these three
        const hraExemption = Math.min(actualHRA, percentOfBasic, rentMinusPercent);

        console.log('HRA Exemption Calculation:', {
            actualHRA,
            percentOfBasic,
            rentMinusPercent,
            finalExemption: hraExemption,
            monthlyRent,
            annualRent,
            isMetro
        });

        return hraExemption;
    }

    function calculateTax(income, totalExemptions) {
        // Apply standard deduction - only on salary income
        const taxableIncome = Math.max(0, income - STANDARD_DEDUCTION);
        let tax = 0;

        // Calculate tax based on slabs
        for (const slab of TAX_SLABS) {
            if (taxableIncome > slab.min) {
                const amountInSlab = Math.min(
                    taxableIncome - slab.min,
                    (slab.max === Infinity ? taxableIncome : slab.max) - slab.min
                );
                tax += amountInSlab * slab.rate;
            }
        }

        // Store basic tax before rebate
        const basicTax = tax;

        // Apply rebate under section 87A
        let rebate = 0;
        if (taxableIncome <= REBATE_INCOME_LIMIT) {
            rebate = Math.min(tax, MAX_REBATE);
        }

        const taxAfterRebate = Math.max(0, tax - rebate);

        // Calculate surcharge
        let surcharge = 0;
        for (const rate of SURCHARGE_RATES) {
            if (taxableIncome > rate.min) {
                surcharge = taxAfterRebate * rate.rate;
                break;
            }
        }

        // Calculate cess
        const cess = (taxAfterRebate + surcharge) * CESS_RATE;

        return {
            taxableIncome,
            basicTax,
            rebate,
            taxAfterRebate,
            surcharge,
            cess,
            totalTax: taxAfterRebate + surcharge + cess,
            totalExemptions
        };
    }

    // Update tax display
    function updateTaxDisplay(incomeDetails, taxDetails) {
        // Format numbers as Indian currency
        const formatCurrency = (amount) => {
            if (amount === 0) return '₹0';
            const isNegative = amount < 0;
            const formattedAmount = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
            }).format(Math.abs(amount)).replace('₹', '₹ ');
            return isNegative ? `- ${formattedAmount}` : formattedAmount;
        };

        // Update all displays
        document.getElementById('totalSalaryDisplay').textContent = formatCurrency(incomeDetails.salaryIncome);
        document.getElementById('totalOtherIncomeDisplay').textContent = formatCurrency(incomeDetails.otherIncome);
        document.getElementById('grossIncomeDisplay').textContent = formatCurrency(incomeDetails.totalIncome);
        document.getElementById('standardDeductionDisplay').textContent = `- ${formatCurrency(STANDARD_DEDUCTION)}`;
        document.getElementById('taxableIncomeDisplay').textContent = formatCurrency(taxDetails.taxableIncome);
        document.getElementById('basicTaxDisplay').textContent = formatCurrency(taxDetails.basicTax);
        document.getElementById('rebateDisplay').textContent = `- ${formatCurrency(taxDetails.rebate)}`;
        document.getElementById('surchargeDisplay').textContent = formatCurrency(taxDetails.surcharge);
        document.getElementById('cessDisplay').textContent = formatCurrency(taxDetails.cess);
        document.getElementById('totalTaxDisplay').textContent = formatCurrency(taxDetails.totalTax);

        // Add exemptions display
        if (document.getElementById('exemptionsDisplay')) {
            document.getElementById('exemptionsDisplay').textContent = `- ${formatCurrency(incomeDetails.totalExemptions)}`;
        }

        // Calculate and display monthly values
        const monthlyTax = taxDetails.totalTax / 12;
        const monthlyIncome = incomeDetails.totalIncome / 12;
        const monthlyIncomeAfterTax = monthlyIncome - monthlyTax;

        document.getElementById('monthlyTaxDisplay').textContent = formatCurrency(monthlyTax);
        document.getElementById('monthlyIncomeDisplay').textContent = formatCurrency(monthlyIncome);
        document.getElementById('monthlyIncomeAfterTaxDisplay').textContent = formatCurrency(monthlyIncomeAfterTax);

        // Store calculation data in localStorage for the savings page to access
        const netMonthlyIncome = monthlyIncomeAfterTax;

        // Estimate monthly expenses (for demo purposes - in a real app this would come from user input)
        // This is an example - you can adjust the calculation as needed
        const estimatedMonthlyExpenses = netMonthlyIncome * 0.35; // Assume 35% of net income goes to expenses

        // Store data for transfer to savings page
        const taxCalculationData = {
            grossMonthlyIncome: monthlyIncome,
            monthlyTax: monthlyTax,
            netMonthlyIncome: netMonthlyIncome,
            monthlyExpenses: estimatedMonthlyExpenses,
            calculationDate: new Date().toISOString(),
            incomeDetails: {
                salaryIncome: incomeDetails.salaryIncome,
                otherIncome: incomeDetails.otherIncome,
                totalIncome: incomeDetails.totalIncome,
                totalExemptions: incomeDetails.totalExemptions
            },
            taxBreakdown: {
                incomeTax: taxDetails.taxAfterRebate,
                surcharge: taxDetails.surcharge,
                cess: taxDetails.cess,
                rebate: taxDetails.rebate,
                totalTax: taxDetails.totalTax,
                taxableIncome: taxDetails.taxableIncome
            }
        };

        // Save to localStorage (keep this for backward compatibility)
        localStorage.setItem('taxCalculationData', JSON.stringify(taxCalculationData));
        console.log('Tax calculation data saved to localStorage for savings page', taxCalculationData);
    }

    // Initialize tooltips
    function initializeTooltips() {
        // Check if tippy is defined
        if (typeof tippy === 'undefined') {
            console.error('Tippy.js is not available - tooltips will not work');
            return;
        }

        console.log('Initializing tooltips...');

        const tooltipContent = {
            basicSalary: 'Basic Salary is the fixed amount paid before any additional compensation or deductions',
            hraReceived: 'House Rent Allowance is exempt from tax subject to certain conditions',
            rentPaid: 'Monthly rent paid - used to calculate HRA exemption',
            isMetroCity: 'Whether you live in a metro city (Delhi, Mumbai, Kolkata, Chennai) - affects HRA exemption',
            specialAllowance: 'Special Allowance is fully taxable',
            bonus: 'Performance bonus or any other bonus received during the financial year',
            lta: 'Leave Travel Allowance - Tax exempt for travel within India (conditions apply)',
            savingsInterest: 'Interest earned from savings bank accounts',
            fdInterest: 'Interest earned from fixed deposits',
            rentalIncome: 'Income received from renting out property',
            standardDeduction: 'A flat deduction of ₹75,000 available to all salaried individuals',
            exemptions: 'Tax exemptions on components like HRA and LTA based on eligibility conditions',
            section87A: 'Tax rebate of up to ₹60,000 if taxable income is up to ₹12 lakhs',
            cess: 'Health & Education Cess at 4% on total tax and surcharge',
            surcharge: 'Additional tax for high-income individuals (income > ₹50 lakhs)'
        };

        for (const [id, content] of Object.entries(tooltipContent)) {
            const elements = document.querySelectorAll(`[data-tooltip="${id}"]`);
            if (elements.length > 0) {
                console.log(`Found ${elements.length} elements with tooltip ${id}`);
                elements.forEach(element => {
                    tippy(element, {
                        content,
                        placement: 'right',
                        arrow: true,
                        theme: 'light',
                        maxWidth: 300
                    });
                });
            } else {
                console.warn(`No elements found with data-tooltip="${id}"`);
            }
        }
    }

    // Event Listeners
    step1NextBtn.addEventListener('click', () => showStep(2));

    step2PrevBtn.addEventListener('click', () => showStep(1));
    step2NextBtn.addEventListener('click', () => {
        if (validateForm()) showStep(3);
    });

    step3PrevBtn.addEventListener('click', () => showStep(2));
    step3NextBtn.addEventListener('click', () => {
        showStep(4);
        const incomeDetails = calculateTotalIncome();
        const taxDetails = calculateTax(incomeDetails.taxableIncome, incomeDetails.totalExemptions);
        updateTaxDisplay(incomeDetails, taxDetails);
        updateChart(incomeDetails, taxDetails);
    });

    step4PrevBtn.addEventListener('click', () => showStep(3));

    resetBtn.addEventListener('click', () => {
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.value = '';
        });

        document.getElementById('assessmentYear').selectedIndex = 0;
        document.getElementById('residentialStatus').selectedIndex = 0;

        const elements = [
            'totalSalaryDisplay', 'totalOtherIncomeDisplay', 'grossIncomeDisplay',
            'taxableIncomeDisplay', 'basicTaxDisplay', 'rebateDisplay',
            'surchargeDisplay', 'cessDisplay', 'totalTaxDisplay', 'monthlyTaxDisplay',
            'monthlyIncomeDisplay', 'monthlyIncomeAfterTaxDisplay'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.textContent = '₹0';
        });

        showStep(1);
    });

    // Save Calculation Button
    const saveCalculationBtn = document.getElementById('saveCalculationBtn');
    if (saveCalculationBtn) {
        saveCalculationBtn.addEventListener('click', () => {
            // Get the latest tax calculation data from localStorage
            const taxData = localStorage.getItem('taxCalculationData');
            if (taxData) {
                try {
                    const parsedData = JSON.parse(taxData);
                    showSaveCalculationModal(parsedData);
                } catch (e) {
                    console.error('Error parsing tax data:', e);
                    alert('Error reading tax calculation data. Please recalculate your taxes.');
                }
            } else {
                alert('No tax calculation data found. Please calculate your taxes first.');
            }
        });
    }

    // Initialize the form
    showStep(1);
    initializeTooltips();

    // Initialize chart with empty data
    let taxDistributionChart;
    function initializeChart() {
        const chartElement = document.getElementById('taxDistributionChart');
        if (!chartElement) {
            console.warn('Chart element not found');
            return;
        }

        // Check if Chart is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not available');
            return;
        }

        // Destroy existing chart if it exists
        if (taxDistributionChart) {
            taxDistributionChart.destroy();
        }

        const ctx = chartElement.getContext('2d');
        taxDistributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Tax exemptions', 'Taxable income', 'Deductions'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#A855F7', // purple-500
                        '#3B82F6', // blue-500
                        '#93C5FD', // blue-300
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                const value = tooltipItem.raw;
                                return `₹${value.toLocaleString('en-IN')}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Function to update chart data
    function updateChart(incomeDetails, taxDetails) {
        if (!taxDistributionChart) {
            initializeChart();
            if (!taxDistributionChart) return; // If initialization failed
        }

        const taxableIncome = taxDetails.taxableIncome;
        const deductions = STANDARD_DEDUCTION;

        // Get tax exemptions from income details
        const taxExemptions = incomeDetails.totalExemptions || 0;

        console.log('Chart data:', {
            taxExemptions,
            taxableIncome,
            deductions,
            rawData: incomeDetails
        });

        taxDistributionChart.data.datasets[0].data = [
            taxExemptions,
            taxableIncome,
            deductions
        ];

        taxDistributionChart.update();
    }

    // Function to save tax calculation to database
    async function saveCalculationToDatabase(name, taxCalculationData) {
        try {
            // Get Supabase client
            const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';
            const supabaseLib = window.supabase || supabase;
            const supabaseClient = supabaseLib.createClient(supabaseUrl, supabaseKey);

            // Check if user is authenticated
            const { data: { session }, error } = await supabaseClient.auth.getSession();

            if (error || !session) {
                console.error('Authentication error:', error);
                alert('Please login to save your calculation');
                return false;
            }

            // Get user ID
            const userId = session.user.id;

            // Add user ID to the calculation data
            const calculationData = {
                user_id: userId,
                name: name,
                calculation_data: taxCalculationData,
                created_at: new Date().toISOString()
            };

            // Store in the tax_calculations table
            const { data, error: insertError } = await supabaseClient
                .from('tax_calculations')
                .insert(calculationData);

            if (insertError) {
                console.error('Error saving calculation:', insertError);
                alert('Failed to save calculation. Please try again.');
                return false;
            }

            alert('Calculation saved successfully!');
            return true;
        } catch (error) {
            console.error('Error saving calculation:', error);
            alert('An error occurred while saving the calculation.');
            return false;
        }
    }

    // Function to show save calculation modal
    function showSaveCalculationModal(taxCalculationData) {
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
            <h2 class="text-xl font-bold text-gray-800">Save Tax Calculation</h2>
            <button class="text-gray-600 hover:text-gray-800">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Create form
        const form = document.createElement('form');
        form.className = 'space-y-4';
        form.innerHTML = `
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Calculation Name</label>
                <input type="text" id="calculationName" class="w-full p-2 border rounded-md" 
                    placeholder="e.g. My Tax Calculation 2025" required>
            </div>
            <div class="flex justify-end space-x-2 pt-4">
                <button type="button" class="btn btn-secondary">Cancel</button>
                <button type="button" class="btn btn-primary">Save</button>
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

        const saveBtn = form.querySelector('.btn-primary');
        saveBtn.addEventListener('click', async function () {
            const calculationName = form.querySelector('#calculationName').value.trim();

            if (!calculationName) {
                alert('Please enter a name for this calculation');
                return;
            }

            const success = await saveCalculationToDatabase(calculationName, taxCalculationData);
            if (success) {
                modal.remove();
            }
        });

        // Add modal to body
        document.body.appendChild(modal);
    }
});

//calculate tax ends

// Check subscription status before redirecting to savings
async function checkSubscriptionStatus() {
    try {
        // Get Supabase client
        const supabaseUrl = 'https://kyathezublanpnjwansc.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YXRoZXp1YmxhbnBuandhbnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5NTI0NjEsImV4cCI6MjA1NzUyODQ2MX0.gCdHDGP9RKk5sRABNh29oww2n74j1GUXlNctya11a7w';
        const supabaseLib = window.supabase || supabase;
        const supabaseClient = supabaseLib.createClient(supabaseUrl, supabaseKey);

        // Check if user is authenticated
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error || !session) {
            console.error('Authentication error:', error);
            window.location.href = '../auth/login.html';
            return;
        }

        // Get user ID
        const userId = session.user.id;

        // Check for active subscription in database
        const { data, error: subscriptionError } = await supabaseClient
            .rpc('has_active_subscription', { user_uuid: userId });

        if (!subscriptionError && data === true) {
            // User has an active subscription in the database
            console.log('Active subscription found in database');
            window.location.href = '../Saving/savings.html';
            return;
        }

        // Fallback to localStorage check if database check fails or returns false
        console.log('No active subscription in database, checking localStorage');
        const isPremiumUser = localStorage.getItem('isPremiumUser') === 'true';
        const subscriptionDate = localStorage.getItem('subscriptionDate');

        // If user is a premium subscriber in localStorage, redirect to savings
        if (isPremiumUser && subscriptionDate) {
            // Check if subscription is still valid (less than a year old)
            const subDate = new Date(subscriptionDate);
            const today = new Date();
            const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

            if (today.getTime() - subDate.getTime() < oneYearInMs) {
                // Also store this in database for future checks
                try {
                    const paymentId = localStorage.getItem('paymentId') || 'localStorage_migration_' + Date.now();
                    const paymentData = {
                        user_id: userId,
                        payment_id: paymentId,
                        amount: 599.00,
                        currency: 'INR',
                        status: 'success',
                        payment_method: 'localStorage_migration',
                        subscription_type: 'premium',
                        start_date: subDate.toISOString(),
                        metadata: {
                            note: 'Migrated from localStorage',
                            migration_date: new Date().toISOString()
                        }
                    };

                    await supabaseClient.from('payments').insert(paymentData);
                } catch (migrationError) {
                    console.error('Error migrating localStorage subscription to database:', migrationError);
                }

                window.location.href = '../Saving/saving.html';
                return;
            }
        }

        // If no valid subscription found, redirect to payment page
        window.location.href = '../Settings/payment.html';

    } catch (error) {
        console.error('Error checking subscription status:', error);
        // Fallback to localStorage if database check fails

        const isPremiumUser = localStorage.getItem('isPremiumUser') === 'true';
        const subscriptionDate = localStorage.getItem('subscriptionDate');

        if (isPremiumUser && subscriptionDate) {
            const subDate = new Date(subscriptionDate);
            const today = new Date();
            const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

            if (today.getTime() - subDate.getTime() < oneYearInMs) {
                window.location.href = '../Saving/saving.html';
                return;
            }
        }

        window.location.href = '../Settings/payment.html';
    }
}