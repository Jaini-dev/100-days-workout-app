# 100 Days of Workout - Challenge Tracker

A mobile-first web app to track your 100-day workout challenge with friends!

## Features

- **Daily Check-in**: Log workouts, rest days, or skipped days
- **Personal Progress**: Track your current streak, best streak, and milestone progress
- **Supportive Leaderboard**: Multiple categories (This Week, Comeback, Streaks)
- **Calendar View**: Visual overview of your entire challenge
- **Admin Dashboard**: Manage participants, view stats, import/export data
- **Offline Support**: Works as a PWA (Progressive Web App)

## Quick Start

### Option 1: Local Development
```bash
# Start a simple HTTP server
python -m http.server 8080

# Or with Node.js
npx serve .

# Then open http://localhost:8080
```

### Option 2: Deploy to GitHub Pages
1. Create a new GitHub repository
2. Push this code to the repository
3. Go to Settings > Pages > Select "main" branch
4. Your app will be live at `https://yourusername.github.io/repo-name/`

## Test Accounts

### Demo Mode
Add `?demo=true` to the URL to load demo data with 8 test participants.

Example: `https://yoursite.com/?demo=true`

### Test User Login
- **Phone**: Any 10-digit number (e.g., `9876543210`)
- **Password**: Enter any password to create a new account

### Admin Login
- Click "Admin Login" on the login page
- **Admin Code**: `100days`
- Enter any name, phone, and password

## Test Scenarios

### As a Regular User:
1. Register with phone number and password
2. Set your goal and daily commitment
3. Check in: "Worked Out!", "Rest Day", or "Skipped"
4. View your progress, streaks, and milestones
5. Check the leaderboard (This Week, Comeback, Streaks tabs)
6. View your calendar and log past workouts

### As an Admin:
1. Use Admin Login with code `100days`
2. View all participants and their progress
3. Edit check-ins for any participant
4. Import participants via CSV
5. Export data and create backups
6. Promote users to admin status

## Version
v5.0.0 - Supportive Community Features

## Tech Stack
- Vanilla JavaScript (no frameworks)
- CSS3 with custom properties
- LocalStorage for data persistence
- PWA with Service Worker
