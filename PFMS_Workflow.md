# Personal Financial Management System (PFMS) Workflow

## System Overview

The PFMS is a comprehensive financial management application that helps users track income, manage expenses, set budgets, establish savings goals, and calculate taxes. The system is built with Supabase for backend services and offers both free and premium features.

## User Journey

### 1. User Registration & Authentication

- Users register with email/password via Supabase Auth
- Secure JWT authentication maintains session state
- Upon registration, a user profile is automatically created

### 2. Profile Setup

- Users provide basic personal information (first name, last name, phone number)
- No currency preferences are needed as the system works exclusively with Indian Rupees (INR)
- Profile is minimalistic, containing only essential user identification

### 3. Dashboard Overview

- The dashboard primarily displays the Indian Tax Regime 2025-2026 with tax slabs
- Users can calculate income tax based on their salary information
- The dashboard includes actions:
  - "Manage Your Finances" button checks premium status:
    - Premium users are directed to savings.html
    - Non-premium users are directed to payment session
  - "Reset Calculator" button
  - "Save Calculation" button

## Core Workflows

### Tax Management

- **Income Tax Calculation**: Enter salary information to calculate tax liability based on the latest Indian tax regime
- **Tax Deductions**: Log available deductions to reduce taxable income (standard deduction of ₹75,000)
- **Tax Rebate**: Apply tax rebates (up to ₹60,000 for income up to ₹12,00,000)
- **Post-Tax Financial Planning**: Use calculated post-tax income for budget and savings planning

### Income Management

- **Income Entry**: Users log income with amount, date, source, category, and notes
- **Income Categories**: Custom categories help organize different income streams
- **Recurring Income**: Set up automatic recurring income entries (salary, passive income)
- **Income Reports**: View and analyze income patterns over time

### Expense Management

- **Expense Tracking**: Log expenses with amount, date, category, and notes
- **Category-Based Organization**: Assign expenses to categories for better tracking
- **Recurring Expenses**: Configure automatic entries for regular payments
- **Expense Analysis**: View spending patterns and identify areas for reduction

### Bills Management

- **Bill Tracking**: Enter bills with due dates, amounts, and payment status
- **Payment Reminders**: Email notifications are sent for upcoming bill due dates
- **Auto-Pay Integration**: Mark bills for automatic payment
- **Bill History**: Track payment history and maintain payment record

### Budget Planning

- **Budget Creation**: Set monthly budgets by category
- **Budget Monitoring**: Track spending against allocated budget
- **Budget Adjustments**: Modify budgets based on changing needs
- **Budget Reports**: Visualize budget performance over time

## Premium Features

### Savings Management (Premium)

- **Goal Setting**: Create specific savings goals with target amounts and deadlines directly in the savings interface
- **Contribution Tracking**: Log contributions toward each savings goal
- **Progress Visualization**: See progress toward goals with visual indicators
- **Completion Forecasting**: Get estimated completion dates based on contribution rates
- **Smart Recommendations**: Receive suggestions for optimizing savings

### Advanced Analytics (Premium)

- **Deep Financial Insights**: Get detailed analysis of spending patterns
- **Predictive Modeling**: See projections of future financial status
- **Custom Reports**: Generate personalized financial reports
- **Investment Planning**: Tools for investment scenario planning

## Technical Implementation

### Database Structure

- **Profiles**: Basic user information (name, phone)
- **Incomes**: Income transactions linked to user profiles
- **Tax Information**: Tax rates, brackets, and calculation data
- **Tax Deductions**: User tax deductions and credits
- **Expenses**: Expense transactions with category classification
- **Categories**: Custom categories for both income and expenses
- **Bills**: Recurring payment tracking with due dates
- **Budgets**: Budget allocations by category and time period
- **Savings Goals**: Target savings with progress tracking (Premium)
- **Savings Contributions**: Contributions toward savings goals (Premium)
- **Subscriptions**: Premium subscription status and details

### Authentication Flow

1. User submits credentials to Supabase Auth
2. Supabase validates and returns JWT token
3. Token is stored in local storage/session
4. Token is included in subsequent API requests
5. Server validates token before processing requests

### Subscription Management

1. User views available premium plans
2. Selects plan and proceeds to payment
3. Payment processed through secure payment gateway
4. Upon successful payment, subscription status updated
5. Premium features unlocked based on subscription level
6. Subscription status verified before premium feature access

### Notification System

1. Email notifications are sent through Supabase Edge Functions
2. Triggers for notifications include:
   - Bill due dates approaching (3 days before due date)
   - Budget limits exceeded (when spending reaches 90% of budget)
   - Subscription renewal reminders (7 days before renewal)
   - Savings goal milestones (25%, 50%, 75% completion)
3. All emails are personalized with user's name and relevant data
4. Users can configure notification preferences in their profile settings

## Integration Points

- **Supabase Authentication**: Handles user registration and login
- **Supabase Database**: Stores all financial data with row-level security
- **Supabase Edge Functions**: Processes automated tasks including email notifications
- **Payment Gateway**: Processes premium subscription payments
- **Email Service Provider**: Sends transactional emails for notifications
- **Export Functionality**: Allows data export to CSV/PDF formats

## Data Security

- Row-level security ensures users can only access their own data
- All financial information encrypted in transit and at rest
- Regular backups prevent data loss
- JWT token verification prevents unauthorized access
- Password policies enforce strong user credentials

---

This document provides a high-level overview of the PFMS workflow. For detailed technical specifications, please refer to the database schema and API documentation.
