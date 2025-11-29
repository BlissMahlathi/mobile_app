# Budget Buddy - Supabase Setup Guide

## Prerequisites
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project in the Supabase dashboard

## Setup Steps

### 1. Database Setup
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL in the editor
5. This will create all necessary tables, indexes, RLS policies, and triggers

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`
2. Go to **Project Settings** → **API** in Supabase dashboard
3. Copy your `Project URL` and paste it as `EXPO_PUBLIC_SUPABASE_URL`
4. Copy your `anon/public` key and paste it as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 3. Install Dependencies
```bash
npm install
```

### 4. Authentication Setup
The app uses Supabase Auth with email/password authentication. No additional setup required - it's enabled by default.

## Database Schema Overview

### Tables
- **users**: User profiles (extends Supabase auth.users)
- **wallet_cards**: Digital wallet cards (loyalty, student IDs, etc.)
- **budget_categories**: Spending categories
- **transactions**: Income and expense records
- **grocery_lists**: Shopping lists
- **grocery_items**: Items within grocery lists
- **notifications**: User notifications

### Security
- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Policies are automatically enforced by Supabase

### Automatic Features
- Default budget categories are created for new users automatically
- Timestamps are auto-managed with triggers
- UUIDs are auto-generated for all records

## Running the App

```bash
# Start the Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Supabase Features Used
- **Authentication**: Email/password auth with session management
- **Database**: PostgreSQL with RLS for data security
- **Real-time** (optional): Subscribe to data changes
- **Storage** (future): For card images and receipts

## Next Steps
1. Enable email confirmations (optional): **Authentication** → **Settings** → Email templates
2. Set up custom domains (optional)
3. Configure email rate limits and user management settings
4. Add storage bucket for images (if needed)
