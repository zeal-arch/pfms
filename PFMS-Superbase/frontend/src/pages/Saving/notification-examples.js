// Supabase Edge Function examples for email notifications
// These are sample implementations that can be deployed as Edge Functions

// ============================================================================
// 1. Bill Due Date Notification Function
// ============================================================================
// Filename: bill-notifications.js
// Schedule: Daily at 8:00 AM - "0 8 * * *"

import { createClient } from '@supabase/supabase-js';
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts';

// Deno Deploy provides environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const emailUser = Deno.env.get('EMAIL_USER');
const emailPass = Deno.env.get('EMAIL_PASS');
const emailHost = Deno.env.get('EMAIL_HOST');
const emailPort = Deno.env.get('EMAIL_PORT');

const client = createClient(supabaseUrl, supabaseServiceKey);

// This runs on a schedule to check for upcoming bill due dates
Deno.serve(async (req) => {
    try {
        // Calculate the date 3 days from now
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const formattedDate = threeDaysFromNow.toISOString().split('T')[0];

        // Get all bills due in 3 days
        const { data: bills, error } = await client
            .from('bills')
            .select(`
        id, 
        name, 
        amount, 
        due_date, 
        category_id, 
        profiles(id, auth_id, first_name, last_name, email)
      `)
            .eq('due_date', formattedDate)
            .eq('is_paid', false);

        if (error) throw error;

        // Send email notification for each bill
        for (const bill of bills) {
            // Skip if no profile or email found
            if (!bill.profiles || !bill.profiles.email) continue;

            const userEmail = bill.profiles.email;
            const userName = bill.profiles.first_name || 'User';

            // Connect to SMTP server
            const smtp = new SmtpClient();
            await smtp.connect({
                host: emailHost,
                port: parseInt(emailPort),
                username: emailUser,
                password: emailPass,
                tls: true,
            });

            // Email content
            const emailContent = `
        <h2>Bill Payment Reminder</h2>
        <p>Hello ${userName},</p>
        <p>This is a friendly reminder that the following bill is due in 3 days:</p>
        <div style="padding: 15px; background-color: #f7f7f7; border-radius: 5px; margin: 20px 0;">
          <p><strong>Bill Name:</strong> ${bill.name}</p>
          <p><strong>Amount:</strong> ₹${bill.amount.toFixed(2)}</p>
          <p><strong>Due Date:</strong> ${new Date(bill.due_date).toLocaleDateString('en-IN')}</p>
        </div>
        <p>Please ensure timely payment to avoid any late fees.</p>
        <p>Thank you for using PFMS!</p>
      `;

            // Send email
            await smtp.send({
                from: 'notifications@pfms.com',
                to: userEmail,
                subject: `PFMS: Payment Reminder for ${bill.name}`,
                html: emailContent,
            });

            await smtp.close();

            // Log the notification
            await client
                .from('notification_logs')
                .insert({
                    profile_id: bill.profiles.id,
                    notification_type: 'bill_reminder',
                    related_id: bill.id,
                    sent_at: new Date(),
                    status: 'delivered'
                });
        }

        return new Response(JSON.stringify({ success: true, message: `Processed ${bills.length} bill notifications` }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error sending bill notifications:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// 2. Budget Limit Notification Function
// ============================================================================
// Filename: budget-alert.js
// Schedule: Daily at 6:00 PM - "0 18 * * *"

import { createClient } from '@supabase/supabase-js';
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts';

// Deno Deploy provides environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const emailConfig = {
    host: Deno.env.get('EMAIL_HOST'),
    port: parseInt(Deno.env.get('EMAIL_PORT')),
    username: Deno.env.get('EMAIL_USER'),
    password: Deno.env.get('EMAIL_PASS'),
    tls: true
};

const client = createClient(supabaseUrl, supabaseServiceKey);

// This function checks if any category spending is approaching budget limits
Deno.serve(async (req) => {
    try {
        // Get current month data
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Format dates for SQL query
        const startDate = firstDay.toISOString().split('T')[0];
        const endDate = lastDay.toISOString().split('T')[0];

        // Get all budget categories
        const { data: budgets, error: budgetError } = await client
            .from('budgets')
            .select(`
        id,
        profile_id,
        category_id,
        amount,
        month,
        year,
        profiles(id, auth_id, first_name, last_name, email),
        categories(id, name)
      `)
            .eq('month', now.getMonth() + 1)
            .eq('year', now.getFullYear());

        if (budgetError) throw budgetError;

        // For each budget, calculate current spending
        for (const budget of budgets) {
            // Skip if no profile or email
            if (!budget.profiles || !budget.profiles.email) continue;

            // Get expenses for this category and month
            const { data: expenses, error: expenseError } = await client
                .from('expenses')
                .select('amount')
                .eq('profile_id', budget.profile_id)
                .eq('category_id', budget.category_id)
                .gte('date', startDate)
                .lte('date', endDate);

            if (expenseError) throw expenseError;

            // Calculate total spending
            const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

            // Check if spending is >= 90% of budget
            if (totalSpent >= budget.amount * 0.9) {
                const percentUsed = (totalSpent / budget.amount) * 100;
                const remaining = budget.amount - totalSpent;

                // Connect to SMTP server
                const smtp = new SmtpClient();
                await smtp.connect(emailConfig);

                // Email content
                const emailContent = `
          <h2>Budget Alert</h2>
          <p>Hello ${budget.profiles.first_name || 'User'},</p>
          <p>You've used <strong>${percentUsed.toFixed(1)}%</strong> of your budget for ${budget.categories.name}.</p>
          <div style="padding: 15px; background-color: #f7f7f7; border-radius: 5px; margin: 20px 0;">
            <p><strong>Category:</strong> ${budget.categories.name}</p>
            <p><strong>Budget:</strong> ₹${budget.amount.toFixed(2)}</p>
            <p><strong>Spent:</strong> ₹${totalSpent.toFixed(2)}</p>
            <p><strong>Remaining:</strong> ₹${remaining.toFixed(2)}</p>
          </div>
          <p>Consider adjusting your spending for the rest of the month to stay within budget.</p>
          <p>Thank you for using PFMS!</p>
        `;

                // Send email
                await smtp.send({
                    from: 'notifications@pfms.com',
                    to: budget.profiles.email,
                    subject: `PFMS: Budget Alert for ${budget.categories.name}`,
                    html: emailContent,
                });

                await smtp.close();

                // Log the notification
                await client
                    .from('notification_logs')
                    .insert({
                        profile_id: budget.profile_id,
                        notification_type: 'budget_alert',
                        related_id: budget.id,
                        sent_at: new Date(),
                        status: 'delivered'
                    });
            }
        }

        return new Response(JSON.stringify({ success: true, message: 'Budget alerts processed' }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error processing budget alerts:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// 3. Savings Goal Milestone Notification Function
// ============================================================================
// Filename: savings-milestone.js
// This function runs on a database trigger when savings contributions are added

import { createClient } from '@supabase/supabase-js';
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const emailConfig = {
    host: Deno.env.get('EMAIL_HOST'),
    port: parseInt(Deno.env.get('EMAIL_PORT')),
    username: Deno.env.get('EMAIL_USER'),
    password: Deno.env.get('EMAIL_PASS'),
    tls: true
};

const client = createClient(supabaseUrl, supabaseServiceKey);

// This function is triggered via a database trigger when savings contributions are updated
Deno.serve(async (req) => {
    try {
        const { record, old_record } = await req.json();

        // Get the savings goal data
        const { data: goal, error: goalError } = await client
            .from('savings_goals')
            .select(`
        id,
        profile_id,
        name,
        target_amount,
        current_amount,
        deadline,
        profiles(id, auth_id, first_name, last_name, email)
      `)
            .eq('id', record.savings_goal_id)
            .single();

        if (goalError) throw goalError;

        // Calculate percentage complete
        const percentComplete = (goal.current_amount / goal.target_amount) * 100;

        // Only send emails at 25%, 50%, 75% and 100% milestones
        const milestones = [25, 50, 75, 100];

        // Get nearest milestone
        const currentMilestone = milestones.find(m => percentComplete >= m);
        const prevPercentComplete = (old_record ? old_record.current_amount : 0) / goal.target_amount * 100;
        const prevMilestone = milestones.find(m => prevPercentComplete >= m);

        // Only proceed if we've crossed a new milestone
        if (currentMilestone > prevMilestone ||
            (percentComplete >= 100 && prevPercentComplete < 100)) {

            // Skip if no profile or email
            if (!goal.profiles || !goal.profiles.email) return;

            // Connect to SMTP server
            const smtp = new SmtpClient();
            await smtp.connect(emailConfig);

            // Email content
            const emailContent = `
        <h2>Savings Goal Milestone</h2>
        <p>Hello ${goal.profiles.first_name || 'User'},</p>
        <p>Congratulations! You've reached a milestone for your savings goal: <strong>${goal.name}</strong>.</p>
        <div style="padding: 15px; background-color: #f7f7f7; border-radius: 5px; margin: 20px 0;">
          <p><strong>Goal:</strong> ${goal.name}</p>
          <p><strong>Target Amount:</strong> ₹${goal.target_amount.toFixed(2)}</p>
          <p><strong>Current Amount:</strong> ₹${goal.current_amount.toFixed(2)}</p>
          <p><strong>Progress:</strong> ${percentComplete.toFixed(1)}%</p>
          ${percentComplete >= 100 ? '<p><strong>Status:</strong> 🎉 Goal Completed! 🎉</p>' : ''}
        </div>
        ${percentComplete >= 100
                    ? '<p>Congratulations on achieving your savings goal!</p>'
                    : '<p>Keep up the good work! You\'re making great progress toward your goal.</p>'}
        <p>Thank you for using PFMS!</p>
      `;

            // Send email
            await smtp.send({
                from: 'notifications@pfms.com',
                to: goal.profiles.email,
                subject: percentComplete >= 100
                    ? `PFMS: Congratulations! You've Completed Your Savings Goal`
                    : `PFMS: You've Reached ${currentMilestone}% of Your Savings Goal`,
                html: emailContent,
            });

            await smtp.close();

            // Log the notification
            await client
                .from('notification_logs')
                .insert({
                    profile_id: goal.profile_id,
                    notification_type: 'savings_milestone',
                    related_id: goal.id,
                    sent_at: new Date(),
                    status: 'delivered'
                });
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error processing savings milestone:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// 4. Subscription Renewal Notification Function
// ============================================================================
// Filename: subscription-renewal.js
// Schedule: Daily at 9:00 AM - "0 9 * * *"

import { createClient } from '@supabase/supabase-js';
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const emailConfig = {
    host: Deno.env.get('EMAIL_HOST'),
    port: parseInt(Deno.env.get('EMAIL_PORT')),
    username: Deno.env.get('EMAIL_USER'),
    password: Deno.env.get('EMAIL_PASS'),
    tls: true
};

const client = createClient(supabaseUrl, supabaseServiceKey);

// This function checks for subscriptions that will expire in 7 days
Deno.serve(async (req) => {
    try {
        // Calculate date 7 days from now
        const today = new Date();
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(today.getDate() + 7);

        // Format date for query
        const targetDate = sevenDaysFromNow.toISOString().split('T')[0];

        // Get subscriptions expiring in 7 days
        const { data: subscriptions, error } = await client
            .from('subscriptions')
            .select(`
        id,
        profile_id,
        plan_name,
        expires_at,
        amount,
        auto_renew,
        profiles(id, auth_id, first_name, last_name, email)
      `)
            .eq('auto_renew', false) // Only send reminder for non-auto-renewing subscriptions
            .gte('expires_at', targetDate + ' 00:00:00')
            .lte('expires_at', targetDate + ' 23:59:59');

        if (error) throw error;

        // Send email for each expiring subscription
        for (const subscription of subscriptions) {
            // Skip if no profile or email
            if (!subscription.profiles || !subscription.profiles.email) continue;

            const userEmail = subscription.profiles.email;
            const userName = subscription.profiles.first_name || 'User';

            // Connect to SMTP server
            const smtp = new SmtpClient();
            await smtp.connect(emailConfig);

            // Email content
            const emailContent = `
        <h2>Subscription Renewal Reminder</h2>
        <p>Hello ${userName},</p>
        <p>Your PFMS premium subscription will expire in 7 days.</p>
        <div style="padding: 15px; background-color: #f7f7f7; border-radius: 5px; margin: 20px 0;">
          <p><strong>Plan:</strong> ${subscription.plan_name}</p>
          <p><strong>Expires On:</strong> ${new Date(subscription.expires_at).toLocaleDateString('en-IN')}</p>
          <p><strong>Renewal Amount:</strong> ₹${subscription.amount.toFixed(2)}</p>
        </div>
        <p>To continue enjoying premium features like Savings Goal Management, please renew your subscription before it expires.</p>
        <p><a href="${supabaseUrl}/dashboard" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Renew Now</a></p>
        <p>Thank you for using PFMS!</p>
      `;

            // Send email
            await smtp.send({
                from: 'notifications@pfms.com',
                to: userEmail,
                subject: 'PFMS: Your Premium Subscription is Expiring Soon',
                html: emailContent,
            });

            await smtp.close();

            // Log the notification
            await client
                .from('notification_logs')
                .insert({
                    profile_id: subscription.profile_id,
                    notification_type: 'subscription_renewal',
                    related_id: subscription.id,
                    sent_at: new Date(),
                    status: 'delivered'
                });
        }

        return new Response(JSON.stringify({ success: true, message: `Processed ${subscriptions.length} subscription renewal notifications` }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error sending subscription renewal notifications:', error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

// ============================================================================
// Database Table for Notification Logs
// ============================================================================
/*
-- Create a notification_logs table to track all sent notifications

CREATE TABLE notification_logs (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  profile_id BIGINT REFERENCES profiles(id) NOT NULL,
  notification_type TEXT NOT NULL, -- 'bill_reminder', 'budget_alert', 'savings_milestone', 'subscription_renewal'
  related_id BIGINT, -- ID of the related record (bill_id, budget_id, savings_goal_id, etc.)
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL, -- 'delivered', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add RLS policies
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own notifications
CREATE POLICY "Users can view their own notification logs"
  ON notification_logs
  FOR SELECT
  USING (profile_id IN (
    SELECT id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Allow service role to insert/update/delete notifications
CREATE POLICY "Service role can manage all notification logs"
  ON notification_logs
  USING (auth.role() = 'service_role');
*/

// ============================================================================
// Notification preferences schema for profiles table
// ============================================================================
/*
-- Add notification preferences to profiles table

ALTER TABLE profiles ADD COLUMN notification_preferences JSONB DEFAULT '{"bill_reminder": true, "budget_alert": true, "savings_milestone": true, "subscription_renewal": true}';

-- Example query to respect notification preferences when sending emails:

-- Get users who want bill reminders
SELECT * FROM profiles WHERE 
  notification_preferences->>'bill_reminder' = 'true';

-- Update a specific notification preference
UPDATE profiles 
SET notification_preferences = jsonb_set(notification_preferences, '{budget_alert}', 'false')
WHERE id = 123;
*/ 