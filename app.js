// ============================================
// 100 DAYS OF WORKOUT - COMPLETE APP v5.0
// With Goals, Reminders, Admin Controls, Data Safety
// & Supportive Community Features
// ============================================

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    SEASON: 'Season 6',
    STORAGE_KEY: 'workout100_data_v5',
    VERSION: '5.0.0',
    SUPER_ADMIN_CODE_HASH: '31a82b', // Hashed admin code - not stored in plaintext
    MAX_PAST_DAYS: 7,
    AUTO_BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    REMINDER_SNOOZE_HOURS: 4,
    TOP_RANKS_VISIBLE: 5, // Only show ranks for top 5
    // Google Sheets API
    API_URL: 'https://script.google.com/macros/s/AKfycbz7oWHMpsI_jHb7kjsjtCJGclLXlANndjDdYAzeE0PUcbp7yLenJDSfCMWoMiDehe9O/exec',
    USE_CLOUD_SYNC: true // Enable cloud sync with Google Sheets
};

// Challenge settings (can be modified by admin)
let challengeSettings = {
    startDate: '2026-02-01',  // Challenge starts Feb 1
    endDate: '2026-07-31',    // Challenge ends July 31 (181 days window)
    totalDays: 100,           // Need to complete 100 workouts in this period
    seasonName: 'Season 6'
};

// ============================================
// MOTIVATIONAL QUOTES DATABASE
// ============================================
const QUOTES = {
    workout: [
        "The only bad workout is the one that didn't happen.",
        "Your body can stand almost anything. It's your mind you have to convince.",
        "Sore today, strong tomorrow.",
        "Sweat is just fat crying.",
        "The pain you feel today is the strength you feel tomorrow.",
        "Train insane or remain the same.",
        "No excuses, just results.",
        "Your health is an investment, not an expense.",
        "Fitness is not about being better than someone else. It's about being better than you used to be.",
        "The only way to finish is to start.",
        "Don't wish for it, work for it.",
        "Exercise is a celebration of what your body can do, not a punishment for what you ate.",
        "The body achieves what the mind believes.",
        "Push harder than yesterday if you want a different tomorrow.",
        "Strive for progress, not perfection."
    ],
    consistency: [
        "Success is the sum of small efforts repeated day in and day out.",
        "Consistency is what transforms average into excellence.",
        "It's not what we do once in a while that shapes our lives, but what we do consistently.",
        "Small daily improvements are the key to staggering long-term results.",
        "The secret of your success is found in your daily routine.",
        "Champions keep playing until they get it right.",
        "Discipline is the bridge between goals and accomplishment.",
        "Success isn't always about greatness. It's about consistency.",
        "The difference between ordinary and extraordinary is that little extra.",
        "Rome wasn't built in a day, but they were laying bricks every hour.",
        "You don't have to be extreme, just consistent.",
        "Every day is a new opportunity to become a better version of yourself.",
        "Show up every day. Let the magic happen.",
        "Motivation gets you started. Habit keeps you going.",
        "The only way to do great work is to keep showing up."
    ],
    streak: [
        "You're on fire! Keep that streak alive!",
        "Consistency is your superpower!",
        "Every day you show up, you're winning!",
        "That streak is looking mighty fine!",
        "Unstoppable! Your dedication is inspiring!",
        "Day by day, rep by rep, you're crushing it!",
        "Your streak is proof of your commitment!",
        "Keep the chain going! You're a legend!",
        "This is what champions look like!",
        "Your future self is thanking you right now!"
    ],
    celebration: [
        "You crushed it today! Way to show up!",
        "Another day, another victory! You're amazing!",
        "That's what dedication looks like! Proud of you!",
        "Boom! You did it! Keep that energy going!",
        "Champion mindset right there! Well done!",
        "You just proved you're stronger than your excuses!",
        "Incredible! Your commitment is inspiring!",
        "Yes! That's how it's done!",
        "Another brick in the wall of your success!",
        "You showed up when it mattered. That's everything!"
    ],
    encouragement: [
        "Rest days are part of the journey. Come back stronger!",
        "Tomorrow is a new opportunity. You've got this!",
        "One day doesn't define you. Your comeback will!",
        "Take the rest you need, then give it your all!",
        "Recovery is part of progress. See you tomorrow!",
        "Even champions take breaks. You're still in the game!",
        "Today might be off, but tomorrow is yours!",
        "Listen to your body, but don't give up on your goals!",
        "Every setback is a setup for a comeback!",
        "It's okay. What matters is you don't quit!"
    ],
    restDay: [
        "Rest is productive! Your muscles grow during recovery.",
        "Smart training includes rest days. Good choice!",
        "Recovery is when the magic happens. Well done!",
        "Taking care of yourself IS part of the journey.",
        "Rest today, conquer tomorrow!",
        "Your body thanks you for the recovery time."
    ],
    welcomeBack: [
        "Welcome back! Every day is a fresh start. 🌟",
        "You're back! That takes courage. Let's go! 💪",
        "The best time to restart is NOW. Welcome back!",
        "Comeback season starts today! 🔥",
        "You showed up again. That's what matters!",
        "Welcome back, champion! Ready to crush it?"
    ],
    milestone: [
        "🎉 {count} workouts! You're building something amazing!",
        "⭐ {count} workouts logged! Keep that momentum!",
        "🏆 {count} workouts done! You're unstoppable!",
        "💪 {count} workouts! Look how far you've come!",
        "🔥 {count} workouts achieved! The grind pays off!"
    ],
    goalReminder: [
        "Remember why you started: {goal}",
        "Your goal awaits: {goal}. Keep pushing!",
        "Don't forget - you're here for: {goal}",
        "Every workout brings you closer to: {goal}",
        "{goal} - this is YOUR mission. Own it!",
        "You committed to this because: {goal}",
        "Stay focused on your goal: {goal}"
    ],
    weeklyMotivation: [
        "That's only {days} workouts per week! You've got this! 💪",
        "Just {days} days a week to achieve your dreams! Easy! 🔥",
        "{days} workouts weekly? You do harder things before breakfast! 💯",
        "Only {days} days per week stand between you and greatness! ⭐",
        "{days} workouts a week is all it takes. Let's crush it! 🏆"
    ]
};

// ============================================
// APP STATE
// ============================================
let appState = {
    currentUser: null,
    participants: [],
    isFirstTime: true,
    isAdmin: false,
    isSuperAdmin: false,
    currentOnboardingSlide: 1,
    selectedPastDate: null,
    reminderPreferences: {},
    lastAutoBackup: null,
    leaderboardCategory: 'thisWeek' // Default to This Week view
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function $(id) {
    return document.getElementById(id);
}

// Get a unique identifier for a participant (id preferred, phone as fallback)
function getParticipantKey(p) {
    if (p.id) return 'id_' + p.id;
    if (p.phone) return 'ph_' + (p.phone || '').toString().replace(/\D/g, '').slice(-10);
    return 'name_' + p.name;
}

// Check if a participant is the current user
function isCurrentUser(p) {
    if (!appState.currentUser) return false;
    // Match by id first, then by phone
    if (p.id && appState.currentUser.id && p.id.toString() === appState.currentUser.id.toString()) return true;
    const pPhone = (p.phone || '').toString().replace(/\D/g, '').slice(-10);
    const userPhone = (appState.currentUser.phone || '').toString().replace(/\D/g, '').slice(-10);
    return pPhone && userPhone && pPhone === userPhone;
}

function getRandomQuote(category) {
    const quotes = QUOTES[category] || QUOTES.workout;
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function formatDate(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function formatShortDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

function getTodayString() {
    const today = getUserLocalDate();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Get current date in user's timezone
function getUserLocalDate() {
    const timezone = getUserTimezone();
    return getDateInTimezone(timezone);
}

// Get current date in a specific timezone
function getDateInTimezone(timezone) {
    const now = new Date();
    const options = { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' };
    const dateStr = now.toLocaleDateString('en-CA', options); // en-CA gives YYYY-MM-DD format
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

// Get today's date string for a specific participant (using their timezone)
function getTodayForParticipant(participant) {
    const timezone = participant?.timezone || 'Asia/Kolkata';
    const today = getDateInTimezone(timezone);
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Get user's timezone from settings or default to India
function getUserTimezone() {
    if (appState.currentUser && appState.currentUser.timezone) {
        return appState.currentUser.timezone;
    }
    return 'Asia/Kolkata'; // Default to India
}

// Get week start for a specific participant (using their timezone)
function getWeekStartForParticipant(participant) {
    const timezone = participant?.timezone || 'Asia/Kolkata';
    const today = getDateInTimezone(timezone);
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function getDateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getCurrentDay() {
    // Returns the day number in the challenge period (1 to total days in period)
    const start = new Date(challengeSettings.startDate);
    const end = new Date(challengeSettings.endDate);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const totalPeriodDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1; // 181 days
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(diff, totalPeriodDays));
}

function getChallengePeriodDays() {
    // Returns total days in the challenge period (181 days: Feb 1 - July 31)
    const start = new Date(challengeSettings.startDate);
    const end = new Date(challengeSettings.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function getDaysLeft() {
    const end = new Date(challengeSettings.endDate);
    const today = new Date();
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((end - today) / (1000 * 60 * 60 * 24)));
}

function getWorkoutsNeeded(user) {
    // Returns how many more workouts needed to reach 100
    const totalWorkouts = calculateTotalWorkouts(user);
    return Math.max(0, challengeSettings.totalDays - totalWorkouts);
}

function getWeekStart() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(16);
}

// Best streak ever (for personal progress)
// Rest days ('R') don't break streaks, but don't count towards them either
function calculateBestStreak(user) {
    // If no checkins available, use pre-computed value from API
    if (!user.checkins) return user.bestStreak || 0;

    const entries = Object.entries(user.checkins).sort((a, b) => a[0].localeCompare(b[0]));
    let bestStreak = 0;
    let currentStreak = 0;
    let lastYesDate = null; // Track last 'Y' date for streak calculation

    for (const [dateStr, status] of entries) {
        if (status === 'Y') {
            if (lastYesDate) {
                const prevDate = new Date(lastYesDate);
                const currDate = new Date(dateStr);
                const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

                // Check if all days between lastYesDate and current are either 'Y' or 'R'
                let streakBroken = false;
                for (let d = 1; d < daysDiff; d++) {
                    const checkDate = new Date(prevDate);
                    checkDate.setDate(checkDate.getDate() + d);
                    const checkDateStr = checkDate.toISOString().split('T')[0];
                    const checkStatus = user.checkins[checkDateStr];
                    // If any day in between is 'N' or missing, streak is broken
                    if (checkStatus !== 'R' && checkStatus !== 'Y') {
                        streakBroken = true;
                        break;
                    }
                }

                if (!streakBroken && daysDiff >= 1) {
                    currentStreak++;
                } else if (streakBroken) {
                    currentStreak = 1;
                } else {
                    // Same day or invalid
                    currentStreak = 1;
                }
            } else {
                currentStreak = 1;
            }
            bestStreak = Math.max(bestStreak, currentStreak);
            lastYesDate = dateStr;
        } else if (status === 'N') {
            // Only 'N' (explicit skip) breaks the streak
            currentStreak = 0;
            lastYesDate = null;
        }
        // 'R' (rest) does nothing - doesn't break or contribute
    }

    return bestStreak;
}

// Calculate improvement from last week
function calculateWeeklyImprovement(user) {
    if (!user.checkins) return { thisWeek: 0, lastWeek: 0, improvement: 0 };

    const today = new Date();
    const thisWeekStart = getWeekStart();
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    let thisWeekCount = 0;
    let lastWeekCount = 0;

    for (let i = 0; i < 7; i++) {
        // This week
        const thisDate = new Date(thisWeekStart);
        thisDate.setDate(thisDate.getDate() + i);
        if (thisDate <= today) {
            const dateStr = getDateString(thisDate);
            if (user.checkins[dateStr] === 'Y') thisWeekCount++;
        }

        // Last week
        const lastDate = new Date(lastWeekStart);
        lastDate.setDate(lastDate.getDate() + i);
        const lastDateStr = getDateString(lastDate);
        if (user.checkins[lastDateStr] === 'Y') lastWeekCount++;
    }

    return {
        thisWeek: thisWeekCount,
        lastWeek: lastWeekCount,
        improvement: thisWeekCount - lastWeekCount
    };
}

// Check if user is returning after a break
function isReturningAfterBreak(user) {
    if (!user.checkins) return false;

    const today = new Date();
    let daysSinceLastWorkout = 0;
    let foundWorkout = false;

    for (let i = 1; i <= 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);

        if (user.checkins[dateStr] === 'Y') {
            foundWorkout = true;
            daysSinceLastWorkout = i;
            break;
        }
    }

    // If no workout in last 3+ days but has workout history, they're returning
    return foundWorkout && daysSinceLastWorkout >= 3;
}

// Calculate comeback score (workouts in last 7 days after break)
function calculateComebackScore(user) {
    // If no checkins available, use pre-computed value from API
    if (!user.checkins) return user.comebackScore || 0;

    const today = new Date();
    let recentWorkouts = 0;
    let hadBreak = false;

    // Check last 7 days for workouts
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        if (user.checkins[dateStr] === 'Y') recentWorkouts++;
    }

    // Check if they had a break (3+ days without workout) in days 8-21
    let consecutiveMissed = 0;
    for (let i = 7; i < 21; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        if (user.checkins[dateStr] !== 'Y') {
            consecutiveMissed++;
            if (consecutiveMissed >= 3) hadBreak = true;
        } else {
            consecutiveMissed = 0;
        }
    }

    // Comeback score = recent workouts if they had a break
    return hadBreak ? recentWorkouts : 0;
}

// Check for milestone achievements
function checkMilestone(user) {
    const total = calculateTotalWorkouts(user);
    const milestones = [10, 25, 50, 75, 100];

    // Check if user just hit a milestone
    for (const milestone of milestones) {
        if (total === milestone) {
            return milestone;
        }
    }
    return null;
}

// ============================================
// STORAGE FUNCTIONS
// ============================================
function saveData() {
    try {
        const data = {
            version: CONFIG.VERSION,
            currentUser: appState.currentUser,
            participants: appState.participants,
            isFirstTime: appState.isFirstTime,
            isAdmin: appState.isAdmin,
            isSuperAdmin: appState.isSuperAdmin,
            challengeSettings: challengeSettings,
            reminderPreferences: appState.reminderPreferences,
            lastAutoBackup: appState.lastAutoBackup,
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));

        // Check for auto-backup
        checkAutoBackup();
    } catch (e) {
        console.error('Failed to save data:', e);
        showToast('Warning: Could not save data!', 'error');
    }
}

// ============================================
// CLOUD SYNC WITH GOOGLE SHEETS
// ============================================

async function apiCall(action, data = {}) {
    if (!CONFIG.USE_CLOUD_SYNC || !CONFIG.API_URL) {
        return { success: false, error: 'Cloud sync not configured' };
    }

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain', // Required for Google Apps Script
            },
            body: JSON.stringify({ action, ...data })
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API call failed:', error);
        return { success: false, error: error.message };
    }
}

async function cloudRegister(userData) {
    showLoading();
    const result = await apiCall('register', {
        name: userData.name,
        phone: userData.phone,
        goal: userData.goal,
        commitment: userData.commitment
    });
    hideLoading();

    if (result.success) {
        showToast('Registered successfully!', 'success');
    }
    return result;
}

async function cloudLogin(phone) {
    showLoading();
    const result = await apiCall('login', { phone });
    hideLoading();

    if (result.success && result.data) {
        // Update local state with cloud data
        appState.participants = result.data.participants || [];
        appState.currentUser = result.data.user;
        saveData(); // Save to localStorage as backup
    }
    return result;
}

async function cloudCheckin(phone, date, status) {
    // NOTE: We intentionally do NOT re-fetch the full profile from the cloud here.
    // submitCheckin() has already updated local state optimistically. When a user
    // logs several days in quick succession, multiple checkin requests are in
    // flight at once. A full re-fetch (cloudLogin) that returns before the other
    // writes have been persisted would overwrite local state with stale data and
    // wipe out the days the user just tapped. The write below is enough to persist
    // this single day; a manual refresh pulls everything else back down.
    return await apiCall('checkin', { phone, date, status });
}

async function refreshFromCloud() {
    if (!appState.currentUser || !appState.currentUser.phone) {
        return { success: false, error: 'Not logged in' };
    }

    const result = await cloudLogin(appState.currentUser.phone);
    if (result.success) {
        showToast('Data refreshed!', 'success');
        updateDashboard();
    }
    return result;
}

function loadData() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            appState.currentUser = data.currentUser;
            appState.participants = data.participants || [];
            appState.isFirstTime = data.isFirstTime !== false;
            appState.isAdmin = data.isAdmin || false;
            appState.isSuperAdmin = data.isSuperAdmin || false;
            appState.reminderPreferences = data.reminderPreferences || {};
            appState.lastAutoBackup = data.lastAutoBackup;

            // Load challenge settings
            if (data.challengeSettings) {
                challengeSettings = { ...challengeSettings, ...data.challengeSettings };
            }

            return true;
        }

        // Try to migrate from v3
        const oldData = localStorage.getItem('workout100_data_v3');
        if (oldData) {
            const data = JSON.parse(oldData);
            appState.participants = data.participants || [];
            appState.currentUser = data.currentUser;
            appState.isFirstTime = data.isFirstTime !== false;
            appState.isAdmin = data.isAdmin || false;
            appState.isSuperAdmin = data.isAdmin || false;
            showToast('Data migrated from v3!', 'success');
            saveData();
            return true;
        }
    } catch (e) {
        console.error('Failed to load data:', e);
    }
    return false;
}

// Load demo data for testing
// Clean up any demo/test data that might have been saved
function cleanupDemoData() {
    // Remove any demo users that might have been accidentally saved
    const demoPhonePrefixes = ['999990', '9876543210'];
    const hadDemoData = appState.participants.some(p =>
        p.phone && (p.phone.startsWith('999990') || p.phone === '9876543210')
    );

    if (hadDemoData) {
        appState.participants = appState.participants.filter(p =>
            p.phone && !p.phone.startsWith('999990') && p.phone !== '9876543210'
        );
        saveData();
        console.log('Cleaned up demo data');
    }
}

function checkAutoBackup() {
    const now = Date.now();
    const lastBackup = appState.lastAutoBackup ? new Date(appState.lastAutoBackup).getTime() : 0;

    if (now - lastBackup > CONFIG.AUTO_BACKUP_INTERVAL) {
        // Time for auto-backup - store in separate key
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                data: {
                    participants: appState.participants,
                    challengeSettings: challengeSettings
                }
            };
            localStorage.setItem('workout100_autobackup', JSON.stringify(backupData));
            appState.lastAutoBackup = new Date().toISOString();
        } catch (e) {
            console.error('Auto-backup failed:', e);
        }
    }
}

function downloadFullBackup() {
    const backup = {
        appName: '100 Days of Workout',
        version: CONFIG.VERSION,
        exportDate: new Date().toISOString(),
        challengeSettings: challengeSettings,
        participants: appState.participants.map(p => ({
            name: p.name,
            phone: p.phone,
            goal: p.goal || '',
            commitment: p.commitment || '',
            joinDate: p.joinDate,
            isAdmin: p.isAdmin,
            isSuperAdmin: p.isSuperAdmin,
            checkins: p.checkins || {}
        }))
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout100_backup_${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('Backup downloaded! 💾', 'success');
}

function restoreFromBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result);

            if (backup.participants && Array.isArray(backup.participants)) {
                if (confirm(`Restore ${backup.participants.length} participants from backup dated ${backup.exportDate}? This will replace current data.`)) {
                    appState.participants = backup.participants;
                    if (backup.challengeSettings) {
                        challengeSettings = { ...challengeSettings, ...backup.challengeSettings };
                    }
                    saveData();
                    showToast('Data restored successfully!', 'success');
                    renderAdminDashboard();
                }
            } else {
                showToast('Invalid backup file', 'error');
            }
        } catch (err) {
            showToast('Failed to parse backup file', 'error');
        }
    };
    reader.readAsText(file);
}

function exportToCSV() {
    const currentDay = getCurrentDay();
    let csv = 'S.No,Name,Phone,Goal,Daily Commitment,Total Workouts,Streak,Completion Rate';

    // Add date headers
    const startDate = new Date(challengeSettings.startDate);
    for (let i = 0; i < currentDay; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        csv += `,${formatShortDate(date)}`;
    }
    csv += '\n';

    // Add participant data
    const sorted = getSortedParticipants('all');
    sorted.forEach((p, index) => {
        const rate = currentDay > 0 ? Math.round((p.totalWorkouts / currentDay) * 100) : 0;
        csv += `${index + 1},"${p.name}","${p.phone}","${p.goal || ''}","${p.commitment || ''}",${p.totalWorkouts},${p.streak},${rate}%`;

        // Add daily check-ins
        for (let i = 0; i < currentDay; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = getDateString(date);
            const checkin = p.checkins ? p.checkins[dateStr] : '';
            csv += `,${checkin || ''}`;
        }
        csv += '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workout100_export_${getTodayString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('CSV exported! 📊', 'success');
}

// ============================================
// UI FUNCTIONS
// ============================================
function showLoading() {
    const el = $('loading');
    if (el) el.classList.add('active');
}

function hideLoading() {
    const el = $('loading');
    if (el) el.classList.remove('active');
}

function showToast(message, type = '') {
    const toast = $('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = $(screenId);
    if (screen) screen.classList.add('active');

    // Show/hide hamburger menu based on screen
    const screensWithNav = ['dashboard-screen', 'leaderboard-screen', 'calendar-screen', 'summary-screen', 'admin-dashboard-screen', 'settings-screen'];
    const showNav = screensWithNav.includes(screenId);

    const hamburger = $('hamburger-btn');
    if (hamburger) {
        hamburger.style.display = showNav ? 'flex' : 'none';
    }

    // Update admin visibility in sidebar
    const adminItem = $('sidebar-admin-item');
    if (adminItem) {
        adminItem.style.display = appState.isAdmin ? 'flex' : 'none';
    }
}

function showTab(tab) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tab) {
            item.classList.add('active');
        }
    });

    // Scroll to top when switching tabs
    window.scrollTo(0, 0);

    switch (tab) {
        case 'home':
            showScreen('dashboard-screen');
            updateDashboard();
            break;
        case 'leaderboard':
            showScreen('leaderboard-screen');
            renderLeaderboard('all');
            break;
        case 'calendar':
            showScreen('calendar-screen');
            renderCalendar();
            break;
        case 'summary':
            showScreen('summary-screen');
            renderSummary();
            break;
        case 'admin':
            showScreen('admin-dashboard-screen');
            renderAdminDashboard();
            break;
        case 'participants':
            showScreen('participants-screen');
            renderParticipantsScreen();
            break;
        case 'halloffame':
            showScreen('halloffame-screen');
            renderHallOfFame();
            break;
    }
}

function showSettings() {
    showScreen('settings-screen');
    if (appState.currentUser) {
        $('settings-name').value = appState.currentUser.name;
        $('settings-phone').value = appState.currentUser.phone;
        $('settings-goal').value = appState.currentUser.goal || '';
        $('settings-commitment').value = appState.currentUser.commitment || '';
        // Load timezone setting
        const timezoneSelect = $('settings-timezone');
        if (timezoneSelect) {
            timezoneSelect.value = appState.currentUser.timezone || 'Asia/Kolkata';
        }
    }
    $('info-participants').textContent = appState.participants.length;

    const adminBadge = $('admin-badge');
    if (adminBadge) {
        adminBadge.style.display = appState.isAdmin ? 'inline-block' : 'none';
    }

    const superAdminBadge = $('super-admin-badge');
    if (superAdminBadge) {
        superAdminBadge.style.display = appState.isSuperAdmin ? 'inline-block' : 'none';
    }

    const endDate = new Date(challengeSettings.endDate);
    $('info-end-date').textContent = formatShortDate(endDate) + ', ' + endDate.getFullYear();
}

function showCelebration(type = 'yes') {
    const overlay = $('celebration-overlay');
    const emoji = $('celebration-emoji');
    const title = $('celebration-title');
    const message = $('celebration-message');

    if (type === 'yes') {
        emoji.textContent = ['🎉', '💪', '🔥', '⭐', '🏆'][Math.floor(Math.random() * 5)];
        title.textContent = ['Awesome!', 'Crushed It!', 'Amazing!', 'Legend!', 'Beast Mode!'][Math.floor(Math.random() * 5)];
        message.textContent = getRandomQuote('celebration');
    } else {
        emoji.textContent = '💪';
        title.textContent = 'Logged!';
        message.textContent = getRandomQuote('encouragement');
    }

    overlay.classList.add('active');
    setTimeout(() => overlay.classList.remove('active'), 2500);
}

// ============================================
// REMINDER SYSTEM
// ============================================
function checkForReminders() {
    if (!appState.currentUser) return;

    const prefs = appState.reminderPreferences[appState.currentUser.phone] || {};

    // Check if reminders are disabled forever
    if (prefs.disabledForever) return;

    // Check if snoozed
    if (prefs.snoozedUntil && new Date(prefs.snoozedUntil) > new Date()) return;

    // Find unlogged days
    const unloggedDays = getUnloggedDays();

    if (unloggedDays.length > 0) {
        showReminderModal(unloggedDays);
    }
}

function getUnloggedDays() {
    const user = appState.currentUser;
    if (!user) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unlogged = [];

    for (let i = 1; i <= CONFIG.MAX_PAST_DAYS; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);

        const startDate = new Date(challengeSettings.startDate);
        if (date < startDate) continue;

        const checkin = user.checkins ? user.checkins[dateStr] : null;
        if (!checkin) {
            unlogged.push({ date, dateStr });
        }
    }

    return unlogged;
}

function showReminderModal(unloggedDays) {
    const modal = $('reminder-modal');
    if (!modal) return;

    const dateText = unloggedDays.length === 1
        ? formatShortDate(unloggedDays[0].date)
        : `${unloggedDays.length} days`;

    $('reminder-date-text').textContent = dateText;
    $('reminder-count').textContent = unloggedDays.length;

    modal.classList.add('active');
}

function handleReminderAction(action) {
    const modal = $('reminder-modal');
    if (modal) modal.classList.remove('active');

    const phone = appState.currentUser?.phone;
    if (!phone) return;

    if (!appState.reminderPreferences[phone]) {
        appState.reminderPreferences[phone] = {};
    }

    switch (action) {
        case 'log':
            // Go to calendar to log
            showTab('calendar');
            break;
        case 'later':
            // Snooze for configured hours
            const snoozeUntil = new Date();
            snoozeUntil.setHours(snoozeUntil.getHours() + CONFIG.REMINDER_SNOOZE_HOURS);
            appState.reminderPreferences[phone].snoozedUntil = snoozeUntil.toISOString();
            showToast(`I'll remind you in ${CONFIG.REMINDER_SNOOZE_HOURS} hours`, '');
            break;
        case 'ignore':
            // Ignore for today
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            appState.reminderPreferences[phone].snoozedUntil = tomorrow.toISOString();
            break;
        case 'never':
            appState.reminderPreferences[phone].disabledForever = true;
            showToast('Reminders disabled. Enable in settings anytime.', '');
            break;
    }

    saveData();
}

function enableReminders() {
    const phone = appState.currentUser?.phone;
    if (!phone) return;

    if (appState.reminderPreferences[phone]) {
        appState.reminderPreferences[phone].disabledForever = false;
        appState.reminderPreferences[phone].snoozedUntil = null;
    }
    saveData();
    showToast('Reminders enabled!', 'success');
}

// ============================================
// GOAL REMINDER
// ============================================
function showGoalReminder() {
    if (!appState.currentUser || !appState.currentUser.goal) return;

    // Show goal reminder occasionally (20% chance on dashboard load)
    if (Math.random() > 0.2) return;

    const goalQuote = getRandomQuote('goalReminder').replace('{goal}', appState.currentUser.goal);

    const reminderEl = $('goal-reminder');
    if (reminderEl) {
        reminderEl.innerHTML = `
            <div class="goal-reminder-content">
                <span class="goal-icon">🎯</span>
                <p>${goalQuote}</p>
                <button onclick="dismissGoalReminder()" class="goal-dismiss">Got it!</button>
            </div>
        `;
        reminderEl.style.display = 'block';
    }
}

function dismissGoalReminder() {
    const reminderEl = $('goal-reminder');
    if (reminderEl) {
        reminderEl.style.display = 'none';
    }
}

// ============================================
// ONBOARDING
// ============================================
function initOnboarding() {
    const nextBtn = $('onboarding-next');
    const skipBtn = $('onboarding-skip');

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (appState.currentOnboardingSlide < 3) {
                appState.currentOnboardingSlide++;
                updateOnboardingSlide();
            } else {
                finishOnboarding();
            }
        });
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', finishOnboarding);
    }
}

function updateOnboardingSlide() {
    const slides = document.querySelectorAll('.onboarding-slide');
    const dots = document.querySelectorAll('.onboarding-dots .dot');
    const nextBtn = $('onboarding-next');

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i + 1 === appState.currentOnboardingSlide);
    });

    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i + 1 === appState.currentOnboardingSlide);
    });

    if (nextBtn) {
        nextBtn.textContent = appState.currentOnboardingSlide === 3 ? "Get Started" : "Next";
    }
}

function finishOnboarding() {
    showScreen('login-screen');
    const quoteEl = document.querySelector('#login-quote p');
    if (quoteEl) quoteEl.textContent = `"${getRandomQuote('workout')}"`;
}

// ============================================
// LOGIN & REGISTRATION
// ============================================
function initLogin() {
    const loginBtn = $('login-btn');
    const phoneInput = $('login-phone');
    const passwordInput = $('login-password');
    const adminLoginLink = $('admin-login-link');

    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    if (adminLoginLink) {
        adminLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('admin-login-screen');
        });
    }
}

async function handleLogin() {
    const phone = $('login-phone').value.trim();
    const password = $('login-password').value;

    if (!phone || phone.length < 10) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        $('login-phone').focus();
        return;
    }

    if (!password) {
        showToast('Please enter your password', 'error');
        $('login-password').focus();
        return;
    }

    showLoading();

    // Try cloud login first
    if (CONFIG.USE_CLOUD_SYNC) {
        const cloudResult = await cloudLogin(phone);

        if (cloudResult.success && cloudResult.data) {
            const user = cloudResult.data.user;
            appState.currentUser = user;
            appState.participants = cloudResult.data.participants || [];
            appState.isAdmin = user.isAdmin || false;
            appState.isSuperAdmin = user.isSuperAdmin || false;
            appState.isFirstTime = false;
            saveData();

            hideLoading();
            showToast('Welcome back, ' + user.name.split(' ')[0] + '!', 'success');
            showTab('home');
            window.scrollTo(0, 0);

            // Check for milestones
            const milestone = checkMilestone(user);
            if (milestone) {
                setTimeout(() => {
                    const msg = getRandomQuote('milestone').replace('{count}', milestone);
                    showToast(msg, 'success');
                }, 2000);
            }
            setTimeout(checkForReminders, 3000);
            return;
        } else if (cloudResult.error && cloudResult.error.includes('not found')) {
            // New user - go to registration
            hideLoading();
            showScreen('register-screen');
            $('register-phone').value = phone;
            $('register-password').value = password;
            showToast('New user! Please complete registration.', '');
            return;
        }
        // If cloud fails, fall back to local
        hideLoading();
        showToast('Could not connect. Try again.', 'error');
        return;
    }

    // Fallback to local login (if cloud sync disabled)
    const user = appState.participants.find(p => p.phone === phone);

    if (!user) {
        hideLoading();
        showScreen('register-screen');
        $('register-phone').value = phone;
        $('register-password').value = password;
        showToast('New user! Please complete registration.', '');
        return;
    }

    if (user.passwordHash !== hashPassword(password)) {
        hideLoading();
        showToast('Incorrect password', 'error');
        return;
    }

    appState.currentUser = user;
    appState.isAdmin = user.isAdmin || false;
    appState.isSuperAdmin = user.isSuperAdmin || false;
    appState.isFirstTime = false;
    saveData();

    hideLoading();
    showToast('Welcome back, ' + user.name.split(' ')[0] + '!', 'success');
    showTab('home');
    window.scrollTo(0, 0);

    const milestone = checkMilestone(user);
    if (milestone) {
        setTimeout(() => {
            const msg = getRandomQuote('milestone').replace('{count}', milestone);
            showToast(msg, 'success');
        }, 2000);
    }
    setTimeout(checkForReminders, 3000);
}

function initRegistration() {
    const registerBtn = $('register-btn');
    const backBtn = $('back-to-login-from-register');

    if (registerBtn) {
        registerBtn.addEventListener('click', handleUserRegistration);
    }

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showScreen('login-screen');
        });
    }

    const phoneInput = $('register-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }
}

async function handleUserRegistration() {
    const name = $('register-name').value.trim();
    const phone = $('register-phone').value.trim();
    const password = $('register-password').value;
    const confirmPassword = $('register-confirm-password').value;
    const goal = $('register-goal').value.trim();
    const commitment = $('register-commitment').value.trim();

    if (!name) {
        showToast('Please enter your name', 'error');
        $('register-name').focus();
        return;
    }

    if (!phone || phone.length < 10) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        $('register-phone').focus();
        return;
    }

    if (!password || password.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        $('register-password').focus();
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        $('register-confirm-password').focus();
        return;
    }

    if (!goal) {
        showToast('Please share your goal for this challenge', 'error');
        $('register-goal').focus();
        return;
    }

    if (!commitment) {
        showToast('Please share your daily commitment', 'error');
        $('register-commitment').focus();
        return;
    }

    showLoading();

    // Register with cloud first
    if (CONFIG.USE_CLOUD_SYNC) {
        const cloudResult = await cloudRegister({
            name: name,
            phone: phone,
            goal: goal,
            commitment: commitment
        });

        if (cloudResult.success && cloudResult.data) {
            // Now login to get all participants
            const loginResult = await cloudLogin(phone);

            if (loginResult.success) {
                appState.currentUser = loginResult.data.user;
                appState.participants = loginResult.data.participants || [];
                appState.isFirstTime = false;
                saveData();

                hideLoading();
                showToast('Welcome to the challenge, ' + name.split(' ')[0] + '! 💪', 'success');
                showTab('home');
                window.scrollTo(0, 0);
                return;
            }
        } else if (cloudResult.error) {
            hideLoading();
            showToast(cloudResult.error, 'error');
            return;
        }
    }

    // Fallback to local registration
    const newUser = {
        id: Date.now(),
        name: name,
        phone: phone,
        passwordHash: hashPassword(password),
        goal: goal,
        commitment: commitment,
        checkins: {},
        joinDate: getTodayString(),
        isAdmin: false,
        isSuperAdmin: false
    };

    appState.participants.push(newUser);
    appState.currentUser = newUser;
    appState.isFirstTime = false;
    saveData();

    hideLoading();
    showToast('Welcome to the challenge, ' + name.split(' ')[0] + '! 💪', 'success');
    showTab('home');
    window.scrollTo(0, 0);
}

function initAdminLogin() {
    const adminLoginBtn = $('admin-login-btn');
    const adminCodeInput = $('admin-code');
    const backToLoginBtn = $('back-to-login');

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', handleAdminLogin);
    }

    if (adminCodeInput) {
        adminCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAdminLogin();
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', () => {
            showScreen('login-screen');
        });
    }
}

function handleAdminLogin() {
    const code = $('admin-code').value.trim();
    const adminName = $('admin-name').value.trim();
    const adminPhone = $('admin-phone').value.trim();
    const adminPassword = $('admin-password').value;

    if (!code) {
        showToast('Please enter the admin code', 'error');
        return;
    }

    if (hashPassword(code) !== CONFIG.SUPER_ADMIN_CODE_HASH) {
        showToast('Invalid admin code', 'error');
        return;
    }

    if (!adminName) {
        showToast('Please enter your name', 'error');
        return;
    }

    if (!adminPhone || adminPhone.length < 10) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }

    if (!adminPassword || adminPassword.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }

    showLoading();

    let adminUser = appState.participants.find(p => p.phone === adminPhone);

    if (adminUser) {
        adminUser.isAdmin = true;
        adminUser.isSuperAdmin = true;
    } else {
        adminUser = {
            id: Date.now(),
            name: adminName,
            phone: adminPhone,
            passwordHash: hashPassword(adminPassword),
            goal: 'Manage the challenge successfully',
            commitment: 'Keep everyone motivated',
            checkins: {},
            joinDate: getTodayString(),
            isAdmin: true,
            isSuperAdmin: true
        };
        appState.participants.push(adminUser);
    }

    appState.currentUser = adminUser;
    appState.isAdmin = true;
    appState.isSuperAdmin = true;
    appState.isFirstTime = false;
    saveData();

    setTimeout(() => {
        hideLoading();
        showToast('Welcome, Super Admin! 👑', 'success');
        showTab('home');
        // Scroll to top after admin login
        window.scrollTo(0, 0);
    }, 500);
}

function logout() {
    appState.currentUser = null;
    appState.isAdmin = false;
    appState.isSuperAdmin = false;
    saveData();
    showScreen('login-screen');
    showToast('Logged out successfully', '');
}

function clearAllLocalData() {
    // Clear everything without confirm (some browsers block confirm dialogs)
    try {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        localStorage.clear();
    } catch(e) {
        console.error('localStorage clear failed:', e);
    }
    appState.currentUser = null;
    appState.participants = [];
    appState.isAdmin = false;
    appState.isSuperAdmin = false;
    showToast('Local data cleared!', 'Reloading...');
    setTimeout(function() {
        window.location.reload();
    }, 500);
}

// ============================================
// DASHBOARD
// ============================================
function updateDashboard() {
    const user = appState.currentUser;
    if (!user) return;

    // Show Century Club celebration to users who already had 100+ workouts
    // before this feature existed (fires once, then centuryClub.unlockedAt is set).
    if (calculateTotalWorkouts(user) >= 100 && !user.centuryClub?.unlockedAt) {
        setTimeout(checkCenturyClubUnlock, 1500);
    }

    const currentDay = getCurrentDay();
    const daysLeft = getDaysLeft();

    // Calculate total workouts early (needed for badge and stats)
    const totalWorkouts = Object.values(user.checkins || {}).filter(v => v === 'Y').length;

    // User name with admin badge
    const nameEl = $('user-name');
    if (nameEl) {
        let nameHtml = user.name.split(' ')[0];
        if (appState.isSuperAdmin) {
            nameHtml += ' <span class="super-admin-badge">👑 SUPER ADMIN</span>';
        } else if (appState.isAdmin) {
            nameHtml += ' <span class="admin-badge">ADMIN</span>';
        }
        nameEl.innerHTML = nameHtml;
    }

    // Current workouts count (top right badge)
    const dayEl = $('current-day');
    if (dayEl) dayEl.textContent = totalWorkouts;

    // Today's date
    const dateEl = $('today-date');
    if (dateEl) dateEl.textContent = formatDate(new Date());

    // Daily motivation quote
    const motivationEl = $('motivation-text');
    if (motivationEl) {
        const quote = getRandomQuote(Math.random() > 0.5 ? 'workout' : 'consistency');
        motivationEl.textContent = `"${quote}"`;
    }

    // Calculate streak
    const streak = calculateStreak(user);
    user.streak = streak;

    const streakEl = $('streak-count');
    if (streakEl) streakEl.textContent = streak;

    const flamesEl = $('streak-flames');
    if (flamesEl) {
        const flames = '🔥'.repeat(Math.min(streak, 10));
        flamesEl.textContent = flames;
    }

    const streakCard = $('streak-card');
    if (streakCard) {
        streakCard.className = 'streak-card';
        if (streak >= 30) streakCard.classList.add('legendary');
        else if (streak >= 14) streakCard.classList.add('fire');
        else if (streak >= 7) streakCard.classList.add('hot');
    }

    const msgEl = $('streak-message');
    if (msgEl) {
        if (streak >= 30) {
            msgEl.textContent = "LEGENDARY! You're unstoppable!";
        } else if (streak >= 14) {
            msgEl.textContent = "Two weeks strong! Keep dominating!";
        } else if (streak >= 7) {
            msgEl.textContent = "One week streak! You're on fire!";
        } else if (streak >= 3) {
            msgEl.textContent = getRandomQuote('streak');
        } else if (streak > 0) {
            msgEl.textContent = "Great start! Keep it going!";
        } else {
            msgEl.textContent = "Start your streak today!";
        }
    }

    // Stats
    const totalEl = $('total-workouts');
    if (totalEl) totalEl.textContent = totalWorkouts;

    const rate = currentDay > 0 ? Math.round((totalWorkouts / currentDay) * 100) : 0;
    const rateEl = $('completion-rate');
    if (rateEl) rateEl.textContent = rate + '%';

    const remainEl = $('days-remaining');
    if (remainEl) remainEl.textContent = daysLeft;

    // Calculate rank with tied rank support (using totalWorkouts)
    const sorted = getSortedParticipants('all');
    const userIndex = sorted.findIndex(p => isCurrentUser(p));

    // Find the rank by counting DISTINCT scores higher than user's score (dense ranking)
    let rank = 1;
    if (userIndex >= 0) {
        const userWorkouts = sorted[userIndex].totalWorkouts || 0;
        const higherScores = new Set();
        for (let i = 0; i < sorted.length; i++) {
            const score = sorted[i].totalWorkouts || 0;
            if (score > userWorkouts) {
                higherScores.add(score);
            }
        }
        rank = higherScores.size + 1;
    }
    const rankCard = $('rank-card');
    const rankEl = $('your-rank');
    const rankLabel = rankCard ? rankCard.querySelector('.stat-label') : null;
    if (rankCard && rankEl && rankLabel) {
        if (rank > 0) {
            // Show tied rank
            rankEl.textContent = '#' + rank;
            rankLabel.textContent = 'Your Rank';
        } else {
            // Fallback - show best streak
            rankEl.textContent = calculateBestStreak(user) || 0;
            rankLabel.textContent = 'Best Streak';
        }
    }

    // Progress bar
    const progress = (currentDay / challengeSettings.totalDays) * 100;
    const fillEl = $('progress-fill');
    if (fillEl) fillEl.style.width = progress + '%';

    const progTextEl = $('progress-text');
    if (progTextEl) progTextEl.textContent = `${totalWorkouts}/${challengeSettings.totalDays} workouts`;

    // Personal progress section (replaces workouts needed)
    renderPersonalProgress(user);

    // Check-in status
    const todayDate = getTodayString();
    const todayCheckin = user.checkins ? user.checkins[todayDate] : null;

    if (todayCheckin) {
        showCheckinDone(todayCheckin);
    } else {
        showCheckinButtons();
    }

    // Render past days logging section
    renderPastDaysSection();

    // Mini leaderboard
    renderMiniLeaderboard();

    // Show goal reminder occasionally
    showGoalReminder();

    saveData();
}

function renderPersonalProgress(user) {
    const container = $('personal-progress-section');
    if (!container) return;

    const currentStreak = calculateStreak(user);
    const bestStreak = calculateBestStreak(user);
    const weeklyStats = calculateWeeklyImprovement(user);
    const totalWorkouts = calculateTotalWorkouts(user);

    let progressHtml = '<div class="personal-progress-card">';
    progressHtml += '<div class="progress-header">📈 Your Progress</div>';
    progressHtml += '<div class="progress-stats">';

    // Current vs Best Streak
    progressHtml += `
        <div class="progress-stat">
            <span class="progress-value">${currentStreak}</span>
            <span class="progress-label">Current Streak</span>
        </div>
        <div class="progress-stat">
            <span class="progress-value">${bestStreak}</span>
            <span class="progress-label">Best Streak</span>
        </div>
    `;

    progressHtml += '</div>';

    // Weekly improvement message
    if (weeklyStats.lastWeek > 0) {
        let improvementMsg = '';
        if (weeklyStats.improvement > 0) {
            improvementMsg = `<div class="progress-improvement positive">⬆️ ${weeklyStats.improvement} more than last week! Keep it up!</div>`;
        } else if (weeklyStats.improvement < 0) {
            improvementMsg = `<div class="progress-improvement">Last week: ${weeklyStats.lastWeek} workouts. You've got ${7 - weeklyStats.thisWeek} days to match it!</div>`;
        } else {
            improvementMsg = `<div class="progress-improvement">Matching last week's pace! Consistency is key! 💪</div>`;
        }
        progressHtml += improvementMsg;
    }

    // Milestone progress
    const nextMilestones = [10, 25, 50, 75, 100].filter(m => m > totalWorkouts);
    if (nextMilestones.length > 0) {
        const nextMilestone = nextMilestones[0];
        const remaining = nextMilestone - totalWorkouts;
        progressHtml += `<div class="progress-milestone">🎯 ${remaining} workouts until your next milestone (${nextMilestone})</div>`;
    }

    progressHtml += '</div>';
    container.innerHTML = progressHtml;
}

function calculateStreak(user) {
    // If no checkins available, use pre-computed value from API
    if (!user.checkins) return user.streak || 0;

    let streak = 0;
    // Use the participant's timezone for calculating their streak
    const timezone = user?.timezone || 'Asia/Kolkata';
    const today = getDateInTimezone(timezone);
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = getDateString(checkDate);
        const checkin = user.checkins[dateStr];

        if (checkin === 'Y') {
            // Only actual workouts count towards streak
            streak++;
        } else if (checkin === 'R') {
            // Rest days don't count towards streak, but don't break it either
            // (skip this day and continue checking)
            continue;
        } else if (checkin === 'N') {
            // Skipped day breaks the streak
            break;
        } else if (i > 0) {
            // No checkin for a past day breaks streak
            break;
        }
    }

    return streak;
}

function calculateTotalWorkouts(user) {
    // If no checkins available, use pre-computed value from API
    if (!user.checkins) return user.totalWorkouts || 0;
    return Object.values(user.checkins).filter(v => v === 'Y').length;
}

function calculateWeeklyWorkouts(user) {
    // If no checkins available, use pre-computed value from API
    if (!user.checkins) return user.weeklyWorkouts || 0;
    // Use the participant's timezone for calculating their weekly workouts
    const weekStart = getWeekStartForParticipant(user);
    let count = 0;

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = getDateString(date);
        if (user.checkins[dateStr] === 'Y') count++;
    }

    return count;
}

function showCheckinButtons() {
    const btns = $('checkin-buttons');
    const done = $('checkin-done');
    if (btns) btns.style.display = 'grid';
    if (done) done.style.display = 'none';
}

function showCheckinDone(status) {
    const btns = $('checkin-buttons');
    const done = $('checkin-done');
    if (btns) btns.style.display = 'none';
    if (done) done.style.display = 'block';

    const iconEl = $('done-icon');
    const msgEl = $('done-message');
    const statusEl = $('done-status');

    if (status === 'Y') {
        if (iconEl) iconEl.textContent = '✅';
        if (statusEl) {
            statusEl.textContent = 'Worked Out!';
            statusEl.className = 'done-status workout';
        }
        if (msgEl) msgEl.textContent = getRandomQuote('celebration').split('!')[0] + '!';
    } else if (status === 'R') {
        // Rest day
        if (iconEl) iconEl.textContent = '🧘';
        if (statusEl) {
            statusEl.textContent = 'Rest Day';
            statusEl.className = 'done-status rest';
        }
        if (msgEl) msgEl.textContent = getRandomQuote('restDay');
    } else {
        if (iconEl) iconEl.textContent = '😴';
        if (statusEl) {
            statusEl.textContent = 'Skipped Today';
            statusEl.className = 'done-status skipped';
        }
        if (msgEl) msgEl.textContent = getRandomQuote('encouragement').split('.')[0] + '.';
    }
}

async function submitCheckin(status, dateStr = null) {
    if (!appState.currentUser) return;

    const targetDate = dateStr || getTodayString();

    // Update local state first
    if (!appState.currentUser.checkins) {
        appState.currentUser.checkins = {};
    }

    appState.currentUser.checkins[targetDate] = status;

    // Update the participant in the list too
    const idx = appState.participants.findIndex(p => p.phone === appState.currentUser.phone);
    if (idx >= 0) {
        // Make sure checkins object exists on participant
        if (!appState.participants[idx].checkins) {
            appState.participants[idx].checkins = {};
        }
        appState.participants[idx].checkins[targetDate] = status;
    }

    saveData();

    // Sync to cloud
    if (CONFIG.USE_CLOUD_SYNC) {
        cloudCheckin(appState.currentUser.phone, targetDate, status).then(result => {
            if (!result.success) {
                console.error('Cloud sync failed:', result.error);
            }
        });
    }

    if (!dateStr) {
        showCelebration(status);
    }

    if (status === 'Y') {
        setTimeout(() => checkCenturyClubUnlock(), 600);
    }

    setTimeout(() => {
        updateDashboard();
        if (status === 'Y') {
            showToast(dateStr ? 'Past workout logged! 💪' : 'Workout logged! Keep crushing it! 💪', 'success');
        } else {
            showToast(dateStr ? 'Day logged.' : 'Logged. Tomorrow is a new day!', '');
        }
    }, dateStr ? 100 : 500);
}

function changeCheckin() {
    showCheckinButtons();
}

async function undoCheckin() {
    if (!appState.currentUser) return;

    const today = getTodayString();
    const todayCheckin = appState.currentUser.checkins[today];

    if (!todayCheckin) {
        showToast('No check-in to undo for today', '');
        return;
    }

    // Confirm with user
    if (!confirm('Are you sure you want to undo today\'s check-in?')) {
        return;
    }

    // Remove from local state
    delete appState.currentUser.checkins[today];

    // Sync with cloud - delete from Google Sheets
    if (CONFIG.USE_CLOUD_SYNC) {
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'deleteCheckin',
                    phone: appState.currentUser.phone,
                    date: today
                })
            });
            const result = await response.json();
            console.log('Delete checkin result:', result);
            if (!result.success) {
                console.error('Failed to delete from cloud:', result.error);
            }
        } catch (error) {
            console.error('Cloud sync failed for undo:', error);
        }
    }

    // Save locally
    saveData();

    // Reset UI to show check-in buttons
    showCheckinButtons();
    updateDashboard();

    showToast('Check-in undone. You can log again!', '');
}

// ============================================
// PAST DAYS LOGGING
// ============================================
function renderPastDaysSection() {
    const container = $('past-days-section');
    if (!container) return;

    const user = appState.currentUser;
    if (!user) return;

    const missedDays = getUnloggedDays();

    if (missedDays.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    // Check if user is relatively new (joined within 7 days)
    const joinDate = user.joinDate ? new Date(user.joinDate) : new Date();
    const today = new Date();
    const daysSinceJoin = Math.floor((today - joinDate) / (1000 * 60 * 60 * 24));
    const isNewUser = daysSinceJoin <= 7;

    let html = '';

    // Show prominent alert for new users with unlogged past days
    if (isNewUser && missedDays.length > 0) {
        html += `
            <div class="new-user-alert">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <strong>Log your past workouts first!</strong>
                    <p>You have ${missedDays.length} day(s) to log before today. Please update these first.</p>
                </div>
            </div>
        `;
    }

    html += `
        <div class="past-days-header">
            <span>📅 Log Past Workouts</span>
            <span class="past-days-hint">Up to ${CONFIG.MAX_PAST_DAYS} days back</span>
        </div>
        <div class="past-days-list">
    `;

    missedDays.forEach(day => {
        const dayName = formatShortDate(day.date);
        html += `
            <div class="past-day-item" data-date="${day.dateStr}">
                <div class="past-day-info">
                    <span class="past-day-date">${dayName}</span>
                    <span class="past-day-status">Not logged</span>
                </div>
                <div class="past-day-actions">
                    <button class="past-btn yes" onclick="logPastDay('${day.dateStr}', 'Y')">💪 Yes</button>
                    <button class="past-btn no" onclick="logPastDay('${day.dateStr}', 'N')">😴 No</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function logPastDay(dateStr, status) {
    submitCheckin(status, dateStr);
}

// ============================================
// LEADERBOARD - Multiple Categories
// ============================================
function getSortedParticipants(category = 'thisWeek') {
    return appState.participants.map(p => ({
        ...p,
        totalWorkouts: calculateTotalWorkouts(p),
        weeklyWorkouts: calculateWeeklyWorkouts(p),
        streak: calculateStreak(p),
        comebackScore: calculateComebackScore(p),
        bestStreak: calculateBestStreak(p)
    })).sort((a, b) => {
        switch (category) {
            case 'thisWeek':
                return b.weeklyWorkouts - a.weeklyWorkouts || b.totalWorkouts - a.totalWorkouts;
            case 'comeback':
                return b.comebackScore - a.comebackScore || b.weeklyWorkouts - a.weeklyWorkouts;
            case 'streaks':
                return b.streak - a.streak || b.bestStreak - a.bestStreak;
            default: // 'all' for admin
                return b.totalWorkouts - a.totalWorkouts || b.streak - a.streak;
        }
    });
}

// Calculate tied rank (same score = same rank, proper dense ranking)
function getTiedRank(sorted, index, category) {
    if (index === 0) return 1;

    const current = sorted[index];
    if (!current) return index + 1;

    // Get the score for the current item
    let currentScore;
    switch (category) {
        case 'thisWeek':
            currentScore = current.weeklyWorkouts || 0;
            break;
        case 'streaks':
            currentScore = current.streak || 0;
            break;
        case 'comeback':
            currentScore = current.comebackScore || 0;
            break;
        default:
            currentScore = current.totalWorkouts || 0;
    }

    // Count how many DISTINCT scores are higher than current score
    let rank = 1;
    const seenScores = new Set();

    for (let i = 0; i < index; i++) {
        const p = sorted[i];
        let score;
        switch (category) {
            case 'thisWeek':
                score = p.weeklyWorkouts || 0;
                break;
            case 'streaks':
                score = p.streak || 0;
                break;
            case 'comeback':
                score = p.comebackScore || 0;
                break;
            default:
                score = p.totalWorkouts || 0;
        }

        if (score > currentScore && !seenScores.has(score)) {
            seenScores.add(score);
            rank++;
        }
    }

    return rank;
}

function getCategoryTitle(category) {
    switch (category) {
        case 'thisWeek': return '🔥 Most Active This Week';
        case 'comeback': return '💪 Best Comebacks';
        case 'streaks': return '⚡ Streak Builders';
        default: return '🏆 Leaderboard';
    }
}

function getCategoryDescription(category) {
    switch (category) {
        case 'thisWeek': return 'Who\'s crushing it this week?';
        case 'comeback': return 'Heroes who bounced back after a break';
        case 'streaks': return 'Building consistency day by day';
        default: return '';
    }
}

function renderLeaderboard(category = 'thisWeek') {
    appState.leaderboardCategory = category;

    // Update filter buttons
    document.querySelectorAll('.lb-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    const sorted = getSortedParticipants(category);
    const currentDay = getCurrentDay();

    // Category header
    const categoryTitle = $('category-title');
    const categoryDesc = $('category-desc');
    if (categoryTitle) categoryTitle.textContent = getCategoryTitle(category);
    if (categoryDesc) categoryDesc.textContent = getCategoryDescription(category);

    // Filter out zero-score entries for comeback
    let displayList = sorted;
    if (category === 'comeback') {
        displayList = sorted.filter(p => p.comebackScore > 0);
        if (displayList.length === 0) {
            const list = $('leaderboard-list');
            if (list) {
                list.innerHTML = `
                    <div class="lb-empty-state">
                        <span class="lb-empty-icon">🌟</span>
                        <p>No comebacks yet!</p>
                        <p class="lb-empty-hint">This celebrates people returning after a break. Keep showing up!</p>
                    </div>
                `;
            }
            const podium = $('podium');
            if (podium) podium.innerHTML = '';
            return;
        }
    }

    // Hide podium - using table format now
    const podium = $('podium');
    if (podium) podium.innerHTML = '';

    // Leaderboard Table Format (initially show 10, expandable)
    const list = $('leaderboard-list');
    if (list) {
        const medals = ['🥇', '🥈', '🥉'];
        const isExpanded = appState.leaderboardExpanded || false;
        const initialCount = 10;
        const visibleParticipants = isExpanded ? displayList : displayList.slice(0, initialCount);
        const hiddenCount = displayList.length - initialCount;

        let html = `
            <table class="lb-table">
                <thead>
                    <tr>
                        <th class="lb-th-rank">#</th>
                        <th class="lb-th-name">Name</th>
                        <th class="lb-th-stat">${category === 'thisWeek' ? 'This Week' : category === 'comeback' ? 'Comeback' : category === 'streaks' ? 'Streak' : 'Total'}</th>
                        <th class="lb-th-stat">Total</th>
                        <th class="lb-th-stat">Rate</th>
                    </tr>
                </thead>
                <tbody>
        `;

        visibleParticipants.forEach((p, i) => {
            const isMe = isCurrentUser(p);
            const rank = getTiedRank(displayList, i, category);
            const rate = currentDay > 0 ? Math.round((p.totalWorkouts / currentDay) * 100) : 0;

            let primaryValue;
            switch (category) {
                case 'thisWeek':
                    primaryValue = p.weeklyWorkouts;
                    break;
                case 'comeback':
                    primaryValue = p.comebackScore;
                    break;
                case 'streaks':
                    primaryValue = p.streak + ' 🔥';
                    break;
                default:
                    primaryValue = p.totalWorkouts;
            }

            const rankDisplay = rank <= 3 ? medals[rank - 1] : rank;

            html += `
                <tr class="${isMe ? 'lb-row-me' : ''}">
                    <td class="lb-td-rank">${rankDisplay}</td>
                    <td class="lb-td-name">${p.name}${isMe ? ' (You)' : ''}</td>
                    <td class="lb-td-stat lb-td-primary">${primaryValue}</td>
                    <td class="lb-td-stat">${p.totalWorkouts}</td>
                    <td class="lb-td-stat">${rate}%</td>
                </tr>
            `;
        });

        html += '</tbody></table>';

        // Show expand/collapse button if more than 10
        if (hiddenCount > 0) {
            if (isExpanded) {
                html += `<div class="lb-more lb-more-clickable" onclick="toggleLeaderboardExpand()">▲ Show less</div>`;
            } else {
                html += `<div class="lb-more lb-more-clickable" onclick="toggleLeaderboardExpand()">+ ${hiddenCount} more participants ▼</div>`;
            }
        }

        list.innerHTML = html || '<p class="empty-message">No participants yet</p>';
    }
}

// Toggle leaderboard expand/collapse
function toggleLeaderboardExpand() {
    appState.leaderboardExpanded = !appState.leaderboardExpanded;
    renderLeaderboard(appState.leaderboardCategory || 'thisWeek');
}

// Toggle All Participants view
let showingAllParticipants = false;

function toggleAllParticipants() {
    showingAllParticipants = !showingAllParticipants;
    const section = $('all-participants-section');
    const btnText = $('view-all-text');
    const btnIcon = $('view-all-icon');

    if (showingAllParticipants) {
        if (section) section.style.display = 'block';
        if (btnText) btnText.textContent = 'Hide All Participants';
        if (btnIcon) btnIcon.textContent = '🙈';
        renderAllParticipants();
    } else {
        if (section) section.style.display = 'none';
        if (btnText) btnText.textContent = 'View All Participants';
        if (btnIcon) btnIcon.textContent = '👥';
    }
}

function renderAllParticipants() {
    const container = $('all-participants-list');
    const countEl = $('all-participants-count');
    if (!container) return;

    const sorted = getSortedParticipants('all');
    const currentDay = getCurrentDay();
    const todayDate = getTodayString();

    if (countEl) countEl.textContent = sorted.length;

    let html = '';
    sorted.forEach((p, index) => {
        const isMe = isCurrentUser(p);
        const rank = getTiedRank(sorted, index, 'all');
        const rate = currentDay > 0 ? Math.round((p.totalWorkouts / currentDay) * 100) : 0;
        const todayStatus = p.checkins ? p.checkins[todayDate] : p.todayStatus;
        const todayIcon = todayStatus === 'Y' ? '✅' : todayStatus === 'R' ? '🧘' : todayStatus === 'N' ? '❌' : '⏳';

        html += `
            <div class="participant-card ${isMe ? 'is-me' : ''}">
                <div class="participant-header">
                    <div class="participant-rank">#${rank}</div>
                    <div class="participant-avatar">${p.name.charAt(0).toUpperCase()}</div>
                    <div class="participant-info">
                        <div class="participant-name">${p.name}${isMe ? ' (You)' : ''}</div>
                        ${p.goal ? `<div class="participant-goal">🎯 ${p.goal}</div>` : ''}
                        ${p.commitment ? `<div class="participant-commit">⏰ ${p.commitment}</div>` : ''}
                    </div>
                    <div class="participant-today">${todayIcon}</div>
                </div>
                <div class="participant-stats">
                    <div class="participant-stat">
                        <span class="stat-value">${p.totalWorkouts}</span>
                        <span class="stat-label">Workouts</span>
                    </div>
                    <div class="participant-stat">
                        <span class="stat-value">${p.streak}</span>
                        <span class="stat-label">Streak</span>
                    </div>
                    <div class="participant-stat">
                        <span class="stat-value">${rate}%</span>
                        <span class="stat-label">Rate</span>
                    </div>
                    <div class="participant-stat">
                        <span class="stat-value">${p.weeklyWorkouts}</span>
                        <span class="stat-label">This Week</span>
                    </div>
                </div>
                <div class="participant-history">
                    <div class="history-label">Last 7 days:</div>
                    <div class="history-grid">
                        ${renderMiniHistory(p)}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html || '<p class="empty-message">No participants yet</p>';
}

function renderMiniLeaderboard() {
    const list = $('mini-leaderboard');
    if (!list) return;

    const sorted = getSortedParticipants('all').slice(0, 3);
    const medals = ['🥇', '🥈', '🥉'];

    let html = '';
    sorted.forEach((p, i) => {
        const isMe = isCurrentUser(p);
        html += `
            <div class="mini-lb-item ${isMe ? 'is-me' : ''}">
                <span class="mini-lb-medal">${medals[i]}</span>
                <span class="mini-lb-name">${p.name.split(' ')[0]}${isMe ? ' (You)' : ''}</span>
                <span class="mini-lb-score">${p.totalWorkouts}</span>
            </div>
        `;
    });

    list.innerHTML = html || '<p class="empty-message">No data yet</p>';
}

// ============================================
// PARTICIPANTS SCREEN
// ============================================
function renderParticipantsScreen() {
    const container = $('participants-list-container');
    const totalEl = $('participants-total');
    const activeEl = $('participants-active');
    if (!container) return;

    const sorted = getSortedParticipants('all');
    const todayDate = getTodayString();

    // Count active today (use todayStatus from API when checkins not available)
    const activeToday = sorted.filter(p => {
        const status = p.checkins ? p.checkins[todayDate] : p.todayStatus;
        return status === 'Y' || status === 'R';
    }).length;

    if (totalEl) totalEl.textContent = sorted.length;
    if (activeEl) activeEl.textContent = activeToday;

    // Store for filtering
    window.allParticipantsData = sorted;

    renderParticipantsList(sorted);
}

function renderParticipantsList(participants) {
    const container = $('participants-list-container');
    if (!container) return;

    const todayDate = getTodayString();

    let html = '';
    participants.forEach((p, index) => {
        const isMe = isCurrentUser(p);
        const sorted = window.allParticipantsData || participants;
        const pKey = getParticipantKey(p);
        const sortedIndex = sorted.findIndex(sp => getParticipantKey(sp) === pKey);
        const rank = getTiedRank(sorted, sortedIndex >= 0 ? sortedIndex : index, 'all');

        const todayStatus = p.checkins ? p.checkins[todayDate] : p.todayStatus;
        const todayIcon = todayStatus === 'Y' ? '✅' : todayStatus === 'R' ? '🧘' : todayStatus === 'N' ? '❌' : '⏳';

        const rankClass = rank === 1 ? 'top-1' : rank === 2 ? 'top-2' : rank === 3 ? 'top-3' : '';

        html += `
            <div class="participant-row ${isMe ? 'is-me' : ''}" onclick="viewParticipantCalendar('${p.id || p.phone}')" style="cursor: pointer;">
                <div class="rank-num ${rankClass}">${rank}</div>
                <div class="participant-info">
                    <div class="participant-name">${p.name}${isMe ? ' (You)' : ''} ${todayIcon}</div>
                    ${p.goal ? `<div class="participant-goal">🎯 ${p.goal}</div>` : ''}
                    ${p.commitment ? `<div class="participant-commit">⏰ ${p.commitment}</div>` : ''}
                    <div class="participant-stats">🔥 ${p.streak} streak · This week: ${p.weeklyWorkouts}</div>
                </div>
                <div class="participant-workouts">${p.totalWorkouts}</div>
            </div>
        `;
    });

    container.innerHTML = html || '<p class="empty-message">No participants found</p>';
}

function filterParticipants() {
    const searchInput = $('participants-search-input');
    const query = (searchInput?.value || '').toLowerCase().trim();
    const all = window.allParticipantsData || [];

    if (!query) {
        renderParticipantsList(all);
        return;
    }

    const filtered = all.filter(p => p.name.toLowerCase().includes(query));
    renderParticipantsList(filtered);
}

async function refreshParticipants() {
    showToast('Refreshing...', '');
    await refreshFromCloud();
    renderParticipantsScreen();
}

// View participant's calendar (read-only)
// identifier can be participant id or phone number
async function viewParticipantCalendar(identifier) {
    const participant = appState.participants.find(p => {
        // Match by id first
        if (p.id && p.id.toString() === identifier.toString()) return true;
        // Fallback to phone match
        const pPhone = (p.phone || '').toString().replace(/\D/g, '').slice(-10);
        const searchPhone = (identifier || '').toString().replace(/\D/g, '').slice(-10);
        return pPhone.length >= 10 && pPhone === searchPhone;
    });

    if (!participant) {
        showToast('Participant not found', 'error');
        return;
    }

    // Update modal title
    const titleEl = $('participant-calendar-title');
    if (titleEl) {
        titleEl.textContent = `📅 ${participant.name}'s Calendar`;
    }

    // Show modal with loading state first
    const calendarEl = $('participant-calendar-content');
    const statsEl = $('participant-calendar-stats');
    if (calendarEl) calendarEl.innerHTML = '<p style="text-align:center;padding:20px;">Loading calendar...</p>';
    if (statsEl) statsEl.innerHTML = '';
    openModal('participant-calendar-modal');

    // Load checkins on-demand if not available (API no longer sends checkins for other users)
    const isMe = isCurrentUser(participant);

    if (!participant.checkins && !isMe && CONFIG.USE_CLOUD_SYNC) {
        try {
            const result = await apiCall('getParticipantCheckins', {
                phone: appState.currentUser.phone,
                targetId: participant.id || '',
                targetPhone: participant.phone || ''
            });
            if (result.success && result.data) {
                participant.checkins = result.data.checkins;
            }
        } catch (e) {
            console.log('Failed to load participant checkins:', e);
        }
    }

    // Calculate stats
    const totalWorkouts = participant.checkins ?
        Object.values(participant.checkins).filter(v => v === 'Y').length : (participant.totalWorkouts || 0);
    const streak = participant.checkins ? calculateStreakForParticipant(participant) : (participant.streak || 0);
    const weeklyWorkouts = participant.checkins ? calculateWeeklyWorkoutsForParticipant(participant) : (participant.weeklyWorkouts || 0);
    const currentDay = getCurrentDay();
    const rate = currentDay > 0 ? Math.round((totalWorkouts / currentDay) * 100) : 0;

    // Render stats
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="modal-stat">
                <span class="modal-stat-value">${totalWorkouts}</span>
                <span class="modal-stat-label">Total Workouts</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${streak} 🔥</span>
                <span class="modal-stat-label">Current Streak</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${weeklyWorkouts}</span>
                <span class="modal-stat-label">This Week</span>
            </div>
            <div class="modal-stat">
                <span class="modal-stat-value">${rate}%</span>
                <span class="modal-stat-label">Completion</span>
            </div>
        `;
    }

    // Render calendar (read-only)
    if (calendarEl) {
        if (participant.checkins) {
            calendarEl.innerHTML = renderParticipantCalendarView(participant);
        } else {
            calendarEl.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">Calendar data not available</p>';
        }
    }
}

// Helper function to calculate streak for any participant (uses their timezone)
function calculateStreakForParticipant(participant) {
    if (!participant.checkins) return participant.streak || 0;

    let streak = 0;
    // Use participant's timezone
    const timezone = participant?.timezone || 'Asia/Kolkata';
    const today = getDateInTimezone(timezone);
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = getDateString(checkDate);
        const checkin = participant.checkins[dateStr];

        if (checkin === 'Y') {
            streak++;
        } else if (checkin === 'R') {
            continue;
        } else if (checkin === 'N') {
            break;
        } else if (i > 0) {
            break;
        }
    }

    return streak;
}

// Helper function to calculate weekly workouts for any participant (uses their timezone)
function calculateWeeklyWorkoutsForParticipant(participant) {
    if (!participant.checkins) return participant.weeklyWorkouts || 0;
    // Use participant's timezone
    const weekStart = getWeekStartForParticipant(participant);
    let count = 0;

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        const dateStr = getDateString(date);
        if (participant.checkins[dateStr] === 'Y') {
            count++;
        }
    }
    return count;
}

// Render read-only calendar view for a participant
function renderParticipantCalendarView(participant) {
    const startDate = new Date(challengeSettings.startDate);
    startDate.setHours(0, 0, 0, 0);
    // Use participant's timezone for "today"
    const timezone = participant?.timezone || 'Asia/Kolkata';
    const today = getDateInTimezone(timezone);
    today.setHours(0, 0, 0, 0);
    const todayStr = getTodayForParticipant(participant);

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const endDate = new Date(challengeSettings.endDate);
    const periodDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Group days by month
    const monthGroups = {};
    for (let i = 0; i < periodDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthGroups[monthKey]) {
            monthGroups[monthKey] = {
                month: date.getMonth(),
                year: date.getFullYear(),
                days: []
            };
        }
        monthGroups[monthKey].days.push({ dayIndex: i, date: new Date(date) });
    }

    let html = '';

    Object.values(monthGroups).forEach(monthData => {
        html += `<div class="calendar-month-header">${months[monthData.month]} ${monthData.year}</div>`;
        html += '<div class="calendar-grid">';

        dayNames.forEach(d => {
            html += `<div class="cal-header">${d}</div>`;
        });

        const firstDayOfMonth = monthData.days[0].date;
        const dayOfWeek = firstDayOfMonth.getDay();
        const firstDayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        for (let i = 0; i < firstDayOffset; i++) {
            html += '<div class="cal-day empty"></div>';
        }

        monthData.days.forEach(dayData => {
            const date = dayData.date;
            const dateStr = getDateString(date);
            const checkin = participant.checkins ? participant.checkins[dateStr] : null;
            const isPast = date < today;
            const isToday = dateStr === todayStr; // Use participant's timezone

            let statusClass = '';
            if (checkin === 'Y') {
                statusClass = 'yes';
            } else if (checkin === 'N') {
                statusClass = 'no';
            } else if (checkin === 'R') {
                statusClass = 'rest';
            } else if (isPast) {
                statusClass = 'not-logged';
            } else if (isToday) {
                statusClass = 'today';
            } else {
                statusClass = 'future';
            }

            html += `
                <div class="cal-day ${statusClass}" title="Day ${dayData.dayIndex + 1}">
                    <span class="cal-date">${date.getDate()}</span>
                </div>
            `;
        });

        html += '</div>';
    });

    // Legend
    html += `
        <div class="calendar-legend">
            <div class="legend-item"><span class="legend-color yes"></span> Workout</div>
            <div class="legend-item"><span class="legend-color rest"></span> Rest</div>
            <div class="legend-item"><span class="legend-color no"></span> Skipped</div>
            <div class="legend-item"><span class="legend-color not-logged"></span> Not Logged</div>
        </div>
    `;

    return html;
}

async function refreshLeaderboard() {
    showToast('Refreshing...', '');
    await refreshFromCloud();
    renderLeaderboard('thisWeek');
}

async function refreshCalendar() {
    showToast('Refreshing...', '');
    await refreshFromCloud();
    renderCalendar();
}

async function refreshSummary() {
    showToast('Refreshing...', '');
    await refreshFromCloud();
    renderSummary();
}

async function refreshDashboard() {
    showToast('Refreshing...', '');
    await refreshFromCloud();
    updateDashboard();
}

// ============================================
// CALENDAR
// ============================================
function renderCalendar() {
    const container = $('calendar-container');
    if (!container || !appState.currentUser) return;

    const user = appState.currentUser;
    // Parse the challenge start as a LOCAL calendar date. Using new Date('YYYY-MM-DD')
    // parses as UTC midnight, which leaves a timezone-offset time component on every
    // generated day. Compared against a local-midnight `today`, the daysDiff math
    // below would floor incorrectly and shift the editable window by a day (and shift
    // the calendar dates entirely in non-IST timezones).
    const [startY, startM, startD] = challengeSettings.startDate.split('-').map(Number);
    const startDate = new Date(startY, startM - 1, startD);
    // Use the user's timezone-aware "today" (local midnight) for consistent math.
    const today = getUserLocalDate();
    today.setHours(0, 0, 0, 0);

    let totalWorkouts = 0;
    let totalMissed = 0;
    let totalPending = 0;

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Week starts Monday

    // Calculate total days in challenge period (181 days from Feb 1 to July 31).
    // Parse as a LOCAL calendar date for the same reason as startDate above.
    const [endY, endM, endD] = challengeSettings.endDate.split('-').map(Number);
    const endDate = new Date(endY, endM - 1, endD);
    const periodDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Group days by month
    const monthGroups = {};
    for (let i = 0; i < periodDays; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!monthGroups[monthKey]) {
            monthGroups[monthKey] = {
                month: date.getMonth(),
                year: date.getFullYear(),
                days: []
            };
        }
        monthGroups[monthKey].days.push({ dayIndex: i, date: new Date(date) });
    }

    let html = '';

    // Render each month
    Object.values(monthGroups).forEach(monthData => {
        // Month header
        html += `<div class="calendar-month-header">${months[monthData.month]} ${monthData.year}</div>`;
        html += '<div class="calendar-grid">';

        // Day headers
        dayNames.forEach(d => {
            html += `<div class="cal-header">${d}</div>`;
        });

        // Calculate first day offset for this month (Monday = 0, Sunday = 6)
        const firstDayOfMonth = monthData.days[0].date;
        const dayOfWeek = firstDayOfMonth.getDay();
        // Convert Sunday=0 to Monday=0 format: Mon=0, Tue=1, ..., Sun=6
        const firstDayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        for (let i = 0; i < firstDayOffset; i++) {
            html += '<div class="cal-day empty"></div>';
        }

        // Render days for this month
        monthData.days.forEach(dayData => {
            const date = dayData.date;
            const i = dayData.dayIndex;
            const dateStr = getDateString(date);
            const checkin = user.checkins ? user.checkins[dateStr] : null;
            const isPast = date < today;
            const isToday = dateStr === getTodayString();
            const isFuture = date > today;

            // Any past day (and today) can be edited; only future days are locked.
            const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
            const canEdit = daysDiff >= 0;

            let statusClass = '';

            if (checkin === 'Y') {
                statusClass = 'yes';
                totalWorkouts++;
            } else if (checkin === 'N') {
                statusClass = 'no';
                totalMissed++;
            } else if (checkin === 'R') {
                statusClass = 'rest';
                // Rest days count as completed
            } else if (isPast) {
                statusClass = 'not-logged';
                totalMissed++;
            } else if (isToday) {
                statusClass = 'today';
                totalPending++;
            } else {
                statusClass = 'future';
                totalPending++;
            }

            // Make days clickable if within edit window (for adding, editing, or deleting)
            const clickable = canEdit ? 'clickable' : '';
            const onClick = clickable ? `onclick="openDayEditor('${dateStr}', '${checkin || ''}')"` : '';

            html += `
                <div class="cal-day ${statusClass} ${clickable}" ${onClick} title="Day ${i + 1} - ${formatShortDate(date)}">
                    <span class="cal-date">${date.getDate()}</span>
                    <span class="cal-day-num">D${i + 1}</span>
                </div>
            `;
        });

        html += '</div>';
    });

    // Legend
    html += `
        <div class="calendar-legend">
            <div class="legend-item"><span class="legend-color yes"></span> Workout</div>
            <div class="legend-item"><span class="legend-color rest"></span> Rest</div>
            <div class="legend-item"><span class="legend-color no"></span> Skipped</div>
            <div class="legend-item"><span class="legend-color not-logged"></span> Not Logged</div>
            <div class="legend-item"><span class="legend-color today"></span> Today</div>
            <div class="legend-item"><span class="legend-color future"></span> Upcoming</div>
        </div>
    `;

    // Stats
    html += `
        <div class="calendar-stats">
            <div class="cal-stat">
                <span class="cal-stat-num yes">${totalWorkouts}</span>
                <span class="cal-stat-label">Workouts</span>
            </div>
            <div class="cal-stat">
                <span class="cal-stat-num no">${totalMissed}</span>
                <span class="cal-stat-label">Missed/No</span>
            </div>
            <div class="cal-stat">
                <span class="cal-stat-num pending">${totalPending}</span>
                <span class="cal-stat-label">Remaining</span>
            </div>
        </div>
    `;

    // Hint for clickable days
    html += `
        <div class="calendar-hint">
            💡 Tap on any past day or today to log, edit, or delete
        </div>
    `;

    container.innerHTML = html;
}

function quickLogFromCalendar(dateStr) {
    openDayEditor(dateStr, '');
}

function openDayEditor(dateStr, currentStatus) {
    // Show day editor modal
    const date = new Date(dateStr);
    const modal = $('quick-log-modal');
    if (modal) {
        $('quick-log-date').textContent = formatShortDate(date);
        $('quick-log-date').dataset.date = dateStr;
        $('quick-log-date').dataset.status = currentStatus;

        // Show/hide delete button based on whether there's a status
        const deleteBtn = $('quick-log-delete');
        if (deleteBtn) {
            deleteBtn.style.display = currentStatus ? 'inline-block' : 'none';
        }

        // Update modal title
        const modalTitle = modal.querySelector('.modal-title');
        if (modalTitle) {
            modalTitle.textContent = currentStatus ? 'Edit Entry' : 'Log Workout';
        }

        // Highlight current status button if there is one
        const buttons = modal.querySelectorAll('.quick-log-btn');
        buttons.forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.status === currentStatus) {
                btn.classList.add('selected');
            }
        });

        modal.classList.add('active');
    }
}

function quickLogSubmit(status) {
    const dateStr = $('quick-log-date').dataset.date;
    closeModal('quick-log-modal');
    submitCheckin(status, dateStr);
    renderCalendar();
}

async function quickLogDelete() {
    const dateStr = $('quick-log-date').dataset.date;
    const currentStatus = $('quick-log-date').dataset.status;

    if (!currentStatus) {
        showToast('No entry to delete', '');
        closeModal('quick-log-modal');
        return;
    }

    if (!confirm('Delete this entry?')) {
        return;
    }

    closeModal('quick-log-modal');

    // Remove from local state
    if (appState.currentUser && appState.currentUser.checkins) {
        delete appState.currentUser.checkins[dateStr];
    }

    // Sync with cloud
    if (CONFIG.USE_CLOUD_SYNC) {
        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    action: 'deleteCheckin',
                    phone: appState.currentUser.phone,
                    date: dateStr
                })
            });
            const result = await response.json();
            console.log('Delete checkin result:', result);
            if (!result.success) {
                console.error('Failed to delete from cloud:', result.error);
            }
        } catch (error) {
            console.error('Cloud sync failed for delete:', error);
        }
    }

    saveData();
    renderCalendar();
    updateDashboard();
    showToast('Entry deleted', '');
}

// ============================================
// SUMMARY / SHARE
// ============================================
function renderSummary() {
    const user = appState.currentUser;
    if (!user) return;

    const currentDay = getCurrentDay();
    const totalWorkouts = calculateTotalWorkouts(user);
    const streak = calculateStreak(user);
    const rate = currentDay > 0 ? Math.round((totalWorkouts / currentDay) * 100) : 0;

    // Update summary stats
    $('summary-name').textContent = user.name;
    $('summary-total').textContent = totalWorkouts;
    $('summary-streak').textContent = streak;
    $('summary-rate').textContent = rate + '%';
    $('summary-day').textContent = currentDay;

    // Weekly breakdown
    const weeklyEl = $('weekly-breakdown');
    if (weeklyEl) {
        const weeks = Math.ceil(currentDay / 7);
        let html = '';

        for (let w = 0; w < weeks; w++) {
            let weekWorkouts = 0;
            for (let d = 0; d < 7; d++) {
                const dayNum = w * 7 + d;
                if (dayNum >= currentDay) break;

                const date = new Date(challengeSettings.startDate);
                date.setDate(date.getDate() + dayNum);
                const dateStr = getDateString(date);
                if (user.checkins && user.checkins[dateStr] === 'Y') {
                    weekWorkouts++;
                }
            }

            html += `
                <div class="week-row">
                    <span class="week-label">Week ${w + 1}</span>
                    <div class="week-bar">
                        <div class="week-fill" style="width: ${(weekWorkouts / 7) * 100}%"></div>
                    </div>
                    <span class="week-count">${weekWorkouts}/7</span>
                </div>
            `;
        }

        weeklyEl.innerHTML = html;
    }
}

function shareProgress() {
    const user = appState.currentUser;
    if (!user) return;

    const totalWorkouts = calculateTotalWorkouts(user);
    const streak = calculateStreak(user);
    const currentDay = getCurrentDay();

    const text = `🏋️ My 100 Days of Workout Progress!\n\n` +
        `📅 Day: ${currentDay}/100\n` +
        `💪 Total Workouts: ${totalWorkouts}\n` +
        `🔥 Current Streak: ${streak} days\n\n` +
        `Join the challenge! #100DaysOfWorkout`;

    if (navigator.share) {
        navigator.share({ text });
    } else {
        navigator.clipboard.writeText(text);
        showToast('Progress copied to clipboard!', 'success');
    }
}

function shareGroupProgress(type = 'today') {
    const sorted = getSortedParticipants('all');
    const todayDate = getTodayString();
    const currentDay = getCurrentDay();
    const today = new Date();

    let text = '';

    if (type === 'today') {
        // Today's daily update
        let checkedIn = 0;
        let skipped = 0;
        let pending = 0;

        sorted.forEach(p => {
            const checkin = p.checkins ? p.checkins[todayDate] : p.todayStatus;
            if (checkin === 'Y' || checkin === 'R') checkedIn++;
            else if (checkin === 'N') skipped++;
            else pending++;
        });

        text = `*💪 100 Days of Workout - Day ${currentDay}/100*\n`;
        text += `📅 ${formatDate(today)}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `✅ *Worked Out:* ${checkedIn}\n`;
        text += `😴 *Skipped:* ${skipped}\n`;
        text += `⏳ *Pending:* ${pending}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Today's warriors with total days (use todayStatus when checkins not available)
        const todayWarriors = sorted.filter(p => {
            const status = p.checkins ? p.checkins[todayDate] : p.todayStatus;
            return status === 'Y' || status === 'R';
        });
        if (todayWarriors.length > 0) {
            text += `*🔥 Today's Warriors:*\n`;
            todayWarriors.forEach(p => {
                text += `• *${p.name}* | Total: ${p.totalWorkouts} days\n`;
            });
        }

        // Show who's pending (use todayStatus when checkins not available)
        const pendingUsers = sorted.filter(p => {
            const status = p.checkins ? p.checkins[todayDate] : p.todayStatus;
            return !status;
        });
        if (pendingUsers.length > 0 && pendingUsers.length <= 5) {
            text += `\n⏳ *Still waiting for:*\n`;
            pendingUsers.forEach(p => {
                text += `• ${p.name}\n`;
            });
        }

        text += `\n#100DaysOfWorkout #Day${currentDay}`;

    } else if (type === 'week') {
        // This week's summary
        const weekStart = getWeekStart();
        let weekWorkouts = {};

        sorted.forEach(p => {
            const count = calculateWeeklyWorkouts(p);
            weekWorkouts[p.name] = count;
        });

        // Sort by weekly workouts
        const sortedByWeek = [...sorted].sort((a, b) => calculateWeeklyWorkouts(b) - calculateWeeklyWorkouts(a));
        const totalWeekWorkouts = Object.values(weekWorkouts).reduce((a, b) => a + b, 0);

        text = `*📊 100 Days of Workout - Weekly Update*\n`;
        text += `📅 Week of ${formatShortDate(weekStart)}\n`;
        text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        text += `💪 *Total Workouts:* ${totalWeekWorkouts}\n`;
        text += `👥 *Participants:* ${sorted.length}\n\n`;

        text += `*🏆 Top Performers This Week:*\n`;
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        sortedByWeek.slice(0, 5).forEach((p, i) => {
            const weekCount = calculateWeeklyWorkouts(p);
            text += `${medals[i]} *${p.name}:* ${weekCount} workout${weekCount !== 1 ? 's' : ''} | Total: ${p.totalWorkouts} days\n`;
        });

        // Show improvement highlights
        const comebackStars = sortedByWeek.filter(p => {
            const weekCount = calculateWeeklyWorkouts(p);
            const overallRate = currentDay > 0 ? p.totalWorkouts / currentDay : 0;
            const weekRate = weekCount / 7;
            return weekRate > overallRate + 0.1; // Improved by at least 10%
        }).slice(0, 3);

        if (comebackStars.length > 0) {
            text += `\n*🌟 Comeback Stars:*\n`;
            comebackStars.forEach(p => {
                text += `• ${p.name} 📈\n`;
            });
        }

        text += `\n#100DaysOfWorkout #WeeklyUpdate`;

    } else if (type === 'leaderboard') {
        // Full leaderboard
        text = `*🏆 100 Days of Workout - Leaderboard*\n`;
        text += `📅 Day ${currentDay}/100\n`;
        text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        const medals = ['🥇', '🥈', '🥉'];
        sorted.slice(0, 10).forEach((p, i) => {
            const rate = currentDay > 0 ? Math.round((p.totalWorkouts / currentDay) * 100) : 0;
            const prefix = i < 3 ? medals[i] : `${i + 1}.`;
            text += `${prefix} *${p.name}*\n`;
            text += `    💪 ${p.totalWorkouts}/${currentDay} days | 🔥 ${p.streak} streak | ${rate}%\n`;
        });

        if (sorted.length > 10) {
            text += `\n_... and ${sorted.length - 10} more participants!_\n`;
        }

        // Add group stats
        const totalGroupWorkouts = sorted.reduce((sum, p) => sum + p.totalWorkouts, 0);
        const groupAvgRate = sorted.length > 0 ? Math.round((totalGroupWorkouts / (sorted.length * currentDay)) * 100) : 0;
        text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        text += `📊 *Group Stats:*\n`;
        text += `Total Workouts: ${totalGroupWorkouts}\n`;
        text += `Average Rate: ${groupAvgRate}%\n`;

        text += `\n#100DaysOfWorkout #Leaderboard`;
    }

    if (navigator.share) {
        navigator.share({ text });
    } else {
        navigator.clipboard.writeText(text);
        showToast('Group progress copied to clipboard!', 'success');
    }
}

// Show date range modal for custom share
function showDateRangeShare() {
    // Set default dates (last week)
    setShareDateRange('lastWeek');
    openModal('date-range-modal');
}

// Set date range based on quick select
function setShareDateRange(preset) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let startDate, endDate;

    switch (preset) {
        case 'lastWeek':
            // Last Monday to Sunday
            const dayOfWeek = today.getDay();
            const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            endDate = new Date(today);
            endDate.setDate(today.getDate() - daysToLastMonday - 1); // Last Sunday
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6); // Last Monday
            break;
        case 'last7':
            endDate = new Date(today);
            endDate.setDate(today.getDate() - 1); // Yesterday
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6); // 7 days ago
            break;
        case 'thisMonth':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today);
            break;
        case 'allTime':
            startDate = new Date(challengeSettings.startDate);
            endDate = new Date(today);
            break;
        default:
            return;
    }

    $('share-start-date').value = getDateString(startDate);
    $('share-end-date').value = getDateString(endDate);
}

// Generate and share custom date range progress
function shareCustomDateRange() {
    const startDateStr = $('share-start-date').value;
    const endDateStr = $('share-end-date').value;

    if (!startDateStr || !endDateStr) {
        showToast('Please select both dates', 'error');
        return;
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (startDate > endDate) {
        showToast('Start date must be before end date', 'error');
        return;
    }

    closeModal('date-range-modal');

    // Calculate stats for date range
    const sorted = getSortedParticipants('all');
    const rangeStats = [];

    sorted.forEach(p => {
        let workoutsInRange = 0;
        let daysInRange = 0;

        // Count workouts in the date range
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            daysInRange++;
            const dateStr = getDateString(currentDate);
            const status = p.checkins ? p.checkins[dateStr] : null;
            if (status === 'Y') workoutsInRange++;
            currentDate.setDate(currentDate.getDate() + 1);
        }

        rangeStats.push({
            name: p.name,
            workouts: workoutsInRange,
            days: daysInRange,
            totalWorkouts: p.totalWorkouts,
            streak: p.streak
        });
    });

    // Sort by workouts in range
    rangeStats.sort((a, b) => b.workouts - a.workouts);

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const totalWorkoutsInRange = rangeStats.reduce((sum, p) => sum + p.workouts, 0);

    // Format dates for display
    const formatRange = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let text = `*📊 100 Days of Workout - Progress Report*\n`;
    text += `📅 ${formatRange(startDate)} - ${formatRange(endDate)} (${totalDays} days)\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `💪 *Total Workouts:* ${totalWorkoutsInRange}\n`;
    text += `👥 *Participants:* ${rangeStats.length}\n\n`;

    text += `*🏆 Top Performers:*\n`;
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    rangeStats.slice(0, 5).forEach((p, i) => {
        const rate = totalDays > 0 ? Math.round((p.workouts / totalDays) * 100) : 0;
        text += `${medals[i]} *${p.name}:* ${p.workouts}/${totalDays} days (${rate}%)\n`;
    });

    // Perfect scores (if any)
    const perfectScores = rangeStats.filter(p => p.workouts === totalDays);
    if (perfectScores.length > 0 && perfectScores.length <= 10) {
        text += `\n*🌟 Perfect Score (${totalDays}/${totalDays}):*\n`;
        perfectScores.forEach(p => {
            text += `• ${p.name}\n`;
        });
    }

    // Group average
    const avgWorkouts = rangeStats.length > 0 ? (totalWorkoutsInRange / rangeStats.length).toFixed(1) : 0;
    const avgRate = totalDays > 0 && rangeStats.length > 0 ? Math.round((avgWorkouts / totalDays) * 100) : 0;
    text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📈 *Average:* ${avgWorkouts} workouts (${avgRate}%)\n`;

    text += `\n#100DaysOfWorkout`;

    if (navigator.share) {
        navigator.share({ text });
    } else {
        navigator.clipboard.writeText(text);
        showToast('Custom report copied to clipboard!', 'success');
    }
}

// ============================================
// ADMIN DASHBOARD
// ============================================
function renderAdminDashboard() {
    if (!appState.isAdmin) {
        showTab('home');
        return;
    }

    const container = $('admin-participants-list');
    if (!container) return;

    const sorted = getSortedParticipants('all');
    const todayDate = getTodayString();
    const currentDay = getCurrentDay();

    // Stats (use todayStatus when checkins not available)
    let todayYes = 0, todayNo = 0, todayPending = 0;
    sorted.forEach(p => {
        const checkin = p.checkins ? p.checkins[todayDate] : p.todayStatus;
        if (checkin === 'Y') todayYes++;
        else if (checkin === 'N') todayNo++;
        else todayPending++;
    });

    $('admin-total-participants').textContent = sorted.length;
    $('admin-today-yes').textContent = todayYes;
    $('admin-today-no').textContent = todayNo;
    $('admin-today-pending').textContent = todayPending;

    // Challenge settings display
    const settingsEl = $('admin-challenge-settings');
    if (settingsEl) {
        settingsEl.innerHTML = `
            <div class="admin-setting">
                <span>📅 Start:</span>
                <strong>${formatShortDate(new Date(challengeSettings.startDate))}</strong>
            </div>
            <div class="admin-setting">
                <span>🏁 End:</span>
                <strong>${formatShortDate(new Date(challengeSettings.endDate))}</strong>
            </div>
            <div class="admin-setting">
                <span>📊 Days:</span>
                <strong>${challengeSettings.totalDays}</strong>
            </div>
        `;
    }

    // Render participant list
    let html = '';
    sorted.forEach((p, index) => {
        const isAdmin = p.isAdmin;
        const isSuperAdmin = p.isSuperAdmin;
        const rank = getTiedRank(sorted, index, 'all');
        const rate = currentDay > 0 ? Math.round((p.totalWorkouts / currentDay) * 100) : 0;
        const todayStatus = p.checkins ? p.checkins[todayDate] : p.todayStatus;
        const todayIcon = todayStatus === 'Y' ? '✅' : todayStatus === 'N' ? '❌' : '⏳';

        html += `
            <div class="admin-participant-card">
                <div class="admin-participant-header">
                    <div class="admin-participant-rank">#${rank}</div>
                    <div class="admin-participant-info">
                        <div class="admin-participant-name">
                            ${p.name}
                            ${isSuperAdmin ? '<span class="super-admin-tag">👑</span>' : isAdmin ? '<span class="admin-tag">Admin</span>' : ''}
                        </div>
                        <div class="admin-participant-phone">📱 ${p.phone}</div>
                        ${p.goal ? `<div class="admin-participant-goal">🎯 ${p.goal}</div>` : ''}
                        ${p.commitment ? `<div class="admin-participant-commit">⏰ ${p.commitment}</div>` : ''}
                    </div>
                    <div class="admin-participant-today">${todayIcon}</div>
                </div>
                <div class="admin-participant-stats">
                    <div class="admin-stat">
                        <span class="admin-stat-value">${p.totalWorkouts}</span>
                        <span class="admin-stat-label">Workouts</span>
                    </div>
                    <div class="admin-stat">
                        <span class="admin-stat-value">${p.streak}</span>
                        <span class="admin-stat-label">Streak</span>
                    </div>
                    <div class="admin-stat">
                        <span class="admin-stat-value">${rate}%</span>
                        <span class="admin-stat-label">Rate</span>
                    </div>
                </div>
                <div class="admin-participant-history">
                    <div class="history-label">Last 7 days:</div>
                    <div class="history-grid">
                        ${renderMiniHistory(p)}
                    </div>
                </div>
                <div class="admin-participant-actions">
                    <button class="admin-action-btn" onclick="editParticipantCheckin('${p.phone}')">
                        ✏️ Edit
                    </button>
                    <button class="admin-action-btn" onclick="resetParticipantPassword('${p.phone}')">
                        🔑 Reset
                    </button>
                    ${appState.isSuperAdmin && !isSuperAdmin ? `
                        <button class="admin-action-btn ${isAdmin ? 'active' : ''}" onclick="toggleAdminRole('${p.phone}')">
                            ${isAdmin ? '👑 Demote' : '⬆️ Promote'}
                        </button>
                    ` : ''}
                    ${!isAdmin && !isSuperAdmin ? `
                        <button class="admin-action-btn danger" onclick="removeParticipant('${p.phone}')">
                            🗑️ Remove
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html || '<p class="empty-message">No participants yet. Add your first participant!</p>';
}

function renderMiniHistory(participant) {
    const today = new Date();
    const todayStr = getDateString(today);
    let html = '';

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);

        // Use checkins if available, otherwise use todayStatus for today only
        let checkin = null;
        if (participant.checkins) {
            checkin = participant.checkins[dateStr];
        } else if (dateStr === todayStr) {
            // For other participants without checkins, we only have today's status from API
            checkin = participant.todayStatus;
        }

        let statusClass = 'pending';
        let icon = '·';
        if (checkin === 'Y') {
            statusClass = 'yes';
            icon = '✓';
        } else if (checkin === 'N') {
            statusClass = 'no';
            icon = '✗';
        } else if (checkin === 'R') {
            statusClass = 'rest';
            icon = '○';
        }

        const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
        html += `<div class="history-day ${statusClass}" title="${formatShortDate(date)}">
            <span class="history-day-name">${dayName}</span>
            <span class="history-day-icon">${icon}</span>
        </div>`;
    }

    return html;
}

function toggleAdminRole(phone) {
    if (!appState.isSuperAdmin) {
        showToast('Only Super Admin can change roles', 'error');
        return;
    }

    const participant = appState.participants.find(p => p.phone === phone);
    if (!participant) return;

    if (participant.isSuperAdmin) {
        showToast('Cannot demote Super Admin', 'error');
        return;
    }

    participant.isAdmin = !participant.isAdmin;
    saveData();
    renderAdminDashboard();
    showToast(`${participant.name} is now ${participant.isAdmin ? 'an Admin' : 'a regular user'}`, 'success');
}

function editParticipantCheckin(phone) {
    const participant = appState.participants.find(p => p.phone === phone);
    if (!participant) return;

    $('edit-checkin-participant-name').textContent = participant.name;
    appState.editingParticipant = participant;

    const container = $('edit-checkin-dates');
    const today = new Date();
    let html = '';

    for (let i = 0; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);
        const checkin = participant.checkins ? participant.checkins[dateStr] : null;

        let statusClass = 'pending';
        let statusText = 'Not logged';
        if (checkin === 'Y') {
            statusClass = 'yes';
            statusText = 'Workout ✅';
        } else if (checkin === 'N') {
            statusClass = 'no';
            statusText = 'Missed ❌';
        }

        html += `
            <div class="edit-date-row" data-date="${dateStr}">
                <span class="edit-date-label">${formatShortDate(date)}</span>
                <span class="edit-date-status ${statusClass}">${statusText}</span>
                <div class="edit-date-buttons">
                    <button class="edit-btn ${checkin === 'Y' ? 'active' : ''}" onclick="setParticipantCheckin('${phone}', '${dateStr}', 'Y')">💪</button>
                    <button class="edit-btn ${checkin === 'N' ? 'active' : ''}" onclick="setParticipantCheckin('${phone}', '${dateStr}', 'N')">😴</button>
                    <button class="edit-btn clear ${!checkin ? 'active' : ''}" onclick="setParticipantCheckin('${phone}', '${dateStr}', null)">✕</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
    $('edit-checkin-modal').classList.add('active');
}

function setParticipantCheckin(phone, dateStr, status) {
    const participant = appState.participants.find(p => p.phone === phone);
    if (!participant) return;

    if (!participant.checkins) {
        participant.checkins = {};
    }

    if (status === null) {
        delete participant.checkins[dateStr];
    } else {
        participant.checkins[dateStr] = status;
    }

    if (appState.currentUser && appState.currentUser.phone === phone) {
        appState.currentUser = participant;
    }

    saveData();
    editParticipantCheckin(phone);
    showToast('Check-in updated', 'success');
}

function resetParticipantPassword(phone) {
    const participant = appState.participants.find(p => p.phone === phone);
    if (!participant) return;

    const newPassword = prompt(`Enter new password for ${participant.name}:`);
    if (!newPassword || newPassword.length < 4) {
        showToast('Password must be at least 4 characters', 'error');
        return;
    }

    participant.passwordHash = hashPassword(newPassword);
    saveData();
    showToast(`Password reset for ${participant.name}`, 'success');
}

function removeParticipant(phone) {
    const participant = appState.participants.find(p => p.phone === phone);
    if (!participant) return;

    if (!confirm(`Are you sure you want to remove ${participant.name} from the challenge?`)) {
        return;
    }

    appState.participants = appState.participants.filter(p => p.phone !== phone);
    saveData();
    renderAdminDashboard();
    showToast(`${participant.name} removed`, '');
}

// ============================================
// CHALLENGE SETTINGS (Admin)
// ============================================
function showChallengeSettings() {
    if (!appState.isSuperAdmin) {
        showToast('Only Super Admin can modify challenge settings', 'error');
        return;
    }

    $('settings-start-date').value = challengeSettings.startDate;
    $('settings-end-date').value = challengeSettings.endDate;
    $('settings-total-days').value = challengeSettings.totalDays;
    $('settings-season-name').value = challengeSettings.seasonName;

    $('challenge-settings-modal').classList.add('active');
}

function saveChallengeSettings() {
    const startDate = $('settings-start-date').value;
    const endDate = $('settings-end-date').value;
    const totalDays = parseInt($('settings-total-days').value);
    const seasonName = $('settings-season-name').value.trim();

    if (!startDate || !endDate || !totalDays || !seasonName) {
        showToast('Please fill all fields', 'error');
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        showToast('End date must be after start date', 'error');
        return;
    }

    challengeSettings = {
        startDate,
        endDate,
        totalDays,
        seasonName
    };

    saveData();
    closeModal('challenge-settings-modal');
    showToast('Challenge settings updated!', 'success');
    renderAdminDashboard();
}

// ============================================
// IMPORT / EXPORT
// ============================================
function showImport() {
    $('import-data').value = '';
    $('import-modal').classList.add('active');
}

function importParticipants() {
    const data = $('import-data').value.trim();
    const defaultPassword = $('import-default-password').value.trim() || '1234';

    if (!data) {
        showToast('Please paste participant data', 'error');
        return;
    }

    const lines = data.split('\n').filter(l => l.trim());
    let imported = 0;
    let skipped = 0;

    lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            const name = parts[0];
            const phone = parts[1].replace(/[^0-9]/g, '');
            const goal = parts[2] || '';
            const commitment = parts[3] || '';

            if (phone.length >= 10 && !appState.participants.find(p => p.phone === phone)) {
                appState.participants.push({
                    id: Date.now() + imported,
                    name: name,
                    phone: phone,
                    passwordHash: hashPassword(defaultPassword),
                    goal: goal,
                    commitment: commitment,
                    checkins: {},
                    joinDate: getTodayString(),
                    isAdmin: false,
                    isSuperAdmin: false
                });
                imported++;
            } else {
                skipped++;
            }
        }
    });

    saveData();
    closeModal('import-modal');
    showToast(`Imported ${imported} participants${skipped > 0 ? `, ${skipped} skipped` : ''}`, 'success');
    renderAdminDashboard();
}

// ============================================
// SPREADSHEET VIEW (Admin)
// ============================================
function showSpreadsheetView() {
    const modal = $('spreadsheet-modal');
    if (!modal) return;

    const sorted = getSortedParticipants('all');
    const currentDay = getCurrentDay();
    const startDate = new Date(challengeSettings.startDate);

    // Build table
    let html = '<div class="spreadsheet-wrapper"><table class="spreadsheet-table">';

    // Header row
    html += '<thead><tr>';
    html += '<th class="sticky-col">S.No</th>';
    html += '<th class="sticky-col">Name</th>';
    html += '<th>Phone</th>';
    html += '<th>Goal</th>';
    html += '<th>Commitment</th>';
    html += '<th>Total</th>';
    html += '<th>Streak</th>';
    html += '<th>Rate</th>';

    // Date headers
    for (let i = 0; i < Math.min(currentDay, 14); i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        html += `<th class="date-col">${formatShortDate(date).split(' ')[0]}<br>${formatShortDate(date).split(' ')[1]}</th>`;
    }
    if (currentDay > 14) {
        html += '<th>...</th>';
    }
    html += '</tr></thead>';

    // Data rows
    html += '<tbody>';
    sorted.forEach((p, index) => {
        const rate = currentDay > 0 ? Math.round((p.totalWorkouts / currentDay) * 100) : 0;

        html += '<tr>';
        html += `<td class="sticky-col">${index + 1}</td>`;
        html += `<td class="sticky-col name-col">${p.name}${p.isAdmin ? ' 👑' : ''}</td>`;
        html += `<td>${p.phone}</td>`;
        html += `<td class="goal-col">${p.goal || '-'}</td>`;
        html += `<td class="commit-col">${p.commitment || '-'}</td>`;
        html += `<td><strong>${p.totalWorkouts}</strong></td>`;
        html += `<td>${p.streak}</td>`;
        html += `<td>${rate}%</td>`;

        // Daily check-ins
        for (let i = 0; i < Math.min(currentDay, 14); i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = getDateString(date);
            const checkin = p.checkins ? p.checkins[dateStr] : null;

            let cellClass = '';
            let cellContent = '';
            if (checkin === 'Y') {
                cellClass = 'cell-yes';
                cellContent = 'Y';
            } else if (checkin === 'N') {
                cellClass = 'cell-no';
                cellContent = 'N';
            } else {
                cellClass = 'cell-empty';
                cellContent = '-';
            }

            html += `<td class="${cellClass}">${cellContent}</td>`;
        }
        if (currentDay > 14) {
            html += '<td>...</td>';
        }
        html += '</tr>';
    });
    html += '</tbody></table></div>';

    $('spreadsheet-content').innerHTML = html;
    modal.classList.add('active');
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openModal(modalId) {
    const modal = $(modalId);
    if (modal) modal.classList.add('active');
    document.body.classList.add('modal-open');
}

function closeModal(modalId) {
    const modal = $(modalId);
    if (modal) modal.classList.remove('active');
    if (!document.querySelector('.modal.active')) {
        document.body.classList.remove('modal-open');
    }
}

function closeAnyModal() {
    document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
    document.body.classList.remove('modal-open');
}

// ============================================
// SETTINGS
// ============================================
function saveSettings() {
    const name = $('settings-name').value.trim();
    const goal = $('settings-goal').value.trim();
    const commitment = $('settings-commitment').value.trim();
    const timezone = $('settings-timezone') ? $('settings-timezone').value : 'Asia/Kolkata';

    if (!name) {
        showToast('Name cannot be empty', 'error');
        return;
    }

    appState.currentUser.name = name;
    appState.currentUser.goal = goal;
    appState.currentUser.commitment = commitment;
    appState.currentUser.timezone = timezone;

    const idx = appState.participants.findIndex(p => p.phone === appState.currentUser.phone);
    if (idx >= 0) {
        appState.participants[idx].name = name;
        appState.participants[idx].goal = goal;
        appState.participants[idx].commitment = commitment;
        appState.participants[idx].timezone = timezone;
    }

    saveData();
    showToast('Settings saved!', 'success');
    showTab('home');
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    cleanupDemoData(); // Clean up any old demo/test data

    initOnboarding();
    initLogin();
    initRegistration();
    initAdminLogin();

    // Check-in buttons
    const yesBtn = $('btn-yes');
    const noBtn = $('btn-no');
    const restBtn = $('btn-rest');
    if (yesBtn) yesBtn.addEventListener('click', () => submitCheckin('Y'));
    if (noBtn) noBtn.addEventListener('click', () => submitCheckin('N'));
    if (restBtn) restBtn.addEventListener('click', () => submitCheckin('R'));

    // Change check-in button
    const changeBtn = $('change-checkin');
    if (changeBtn) changeBtn.addEventListener('click', changeCheckin);

    // Undo check-in button
    const undoBtn = $('undo-checkin');
    if (undoBtn) undoBtn.addEventListener('click', undoCheckin);

    // Navigation is now handled by onclick in HTML (handleNavClick function)

    // Leaderboard filters (using data-category) - improved for mobile
    document.querySelectorAll('.lb-filter-btn').forEach(btn => {
        const handleFilterClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            renderLeaderboard(btn.dataset.category || 'thisWeek');
        };
        btn.addEventListener('click', handleFilterClick);
        btn.addEventListener('touchend', handleFilterClick, { passive: false });
    });

    // Settings button
    const settingsBtn = $('settings-btn');
    if (settingsBtn) settingsBtn.addEventListener('click', showSettings);

    // Back button from settings
    const backFromSettings = $('back-from-settings');
    if (backFromSettings) {
        backFromSettings.addEventListener('click', () => showTab('home'));
    }

    // Logout button
    const logoutBtn = $('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    // Clear data button
    const clearDataBtn = $('clear-data-btn');
    if (clearDataBtn) clearDataBtn.addEventListener('click', clearAllLocalData);

    // Save settings button
    const saveSettingsBtn = $('save-settings-btn');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

    // Admin back button
    const adminBackBtn = $('admin-back-btn');
    if (adminBackBtn) adminBackBtn.addEventListener('click', () => showTab('home'));

    // Close modals on overlay click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAnyModal();
        });
    });

    // Backup file input
    const restoreInput = $('restore-backup-input');
    if (restoreInput) {
        restoreInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                restoreFromBackup(e.target.files[0]);
            }
        });
    }

    // Determine initial screen
    if (appState.currentUser) {
        appState.isAdmin = appState.currentUser.isAdmin || false;
        appState.isSuperAdmin = appState.currentUser.isSuperAdmin || false;
        showTab('home');

        // Check for reminders after a delay
        setTimeout(checkForReminders, 3000);
    } else if (appState.isFirstTime) {
        showScreen('onboarding-screen');
        updateOnboardingSlide();
    } else {
        showScreen('login-screen');
    }
});

// Global functions for onclick handlers
// Navigation click handler - simple and reliable for mobile
function handleNavClick(event, tabName) {
    event.preventDefault();
    event.stopPropagation();
    showTab(tabName);
    return false;
}

// Sidebar Navigation Functions
function toggleSidebar() {
    const sidebar = $('sidebar');
    const overlay = $('sidebar-overlay');
    const hamburger = $('hamburger-btn');

    if (sidebar && overlay && hamburger) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        hamburger.classList.toggle('open');
    }
}

function closeSidebar() {
    const sidebar = $('sidebar');
    const overlay = $('sidebar-overlay');
    const hamburger = $('hamburger-btn');

    if (sidebar && overlay && hamburger) {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
        hamburger.classList.remove('open');
    }
}

function sidebarNav(event, tabName) {
    event.preventDefault();
    closeSidebar();

    // Update active state in sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        }
    });

    // Handle settings separately
    if (tabName === 'settings') {
        showSettings();
    } else {
        showTab(tabName);
    }
}

// Show/hide hamburger and sidebar based on login state
function updateSidebarVisibility(show) {
    const hamburger = $('hamburger-btn');
    const sidebar = $('sidebar');
    const overlay = $('sidebar-overlay');

    if (hamburger) hamburger.style.display = show ? 'flex' : 'none';
    if (!show) {
        closeSidebar();
    }
}

// Update admin item visibility in sidebar
function updateSidebarAdminVisibility(isAdmin) {
    const adminItem = $('sidebar-admin-item');
    if (adminItem) {
        adminItem.style.display = isAdmin ? 'flex' : 'none';
    }
}

window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.sidebarNav = sidebarNav;
window.handleNavClick = handleNavClick;
window.logPastDay = logPastDay;
window.submitCheckin = submitCheckin;
window.showTab = showTab;
window.showSettings = showSettings;
window.logout = logout;
window.closeModal = closeModal;
window.showImport = showImport;
window.importParticipants = importParticipants;
window.exportToCSV = exportToCSV;
window.downloadFullBackup = downloadFullBackup;
window.editParticipantCheckin = editParticipantCheckin;
window.setParticipantCheckin = setParticipantCheckin;
window.resetParticipantPassword = resetParticipantPassword;
window.removeParticipant = removeParticipant;
window.toggleAdminRole = toggleAdminRole;
window.showChallengeSettings = showChallengeSettings;
window.saveChallengeSettings = saveChallengeSettings;
window.showSpreadsheetView = showSpreadsheetView;
window.quickLogFromCalendar = quickLogFromCalendar;
window.quickLogSubmit = quickLogSubmit;
window.quickLogDelete = quickLogDelete;
window.openDayEditor = openDayEditor;
window.handleReminderAction = handleReminderAction;
window.enableReminders = enableReminders;
window.dismissGoalReminder = dismissGoalReminder;
window.shareProgress = shareProgress;
window.shareGroupProgress = shareGroupProgress;
window.showDateRangeShare = showDateRangeShare;
window.setShareDateRange = setShareDateRange;
window.shareCustomDateRange = shareCustomDateRange;
window.toggleAllParticipants = toggleAllParticipants;
window.filterParticipants = filterParticipants;
window.refreshParticipants = refreshParticipants;
window.refreshLeaderboard = refreshLeaderboard;
window.refreshCalendar = refreshCalendar;
window.refreshSummary = refreshSummary;
window.refreshDashboard = refreshDashboard;
window.renderAdminDashboard = renderAdminDashboard;
// Demo data removed - cloud sync only

// ============================================
// CENTURY CLUB — 100 days celebration
// ============================================

let _confettiFrame = null;
let _confettiParticles = [];

function checkCenturyClubUnlock() {
    const user = appState.currentUser;
    if (!user) return;
    const total = calculateTotalWorkouts(user);
    if (total < 100) return;

    // Only pop once — if they already have the club data, skip
    if (user.centuryClub && user.centuryClub.unlockedAt) return;

    // Mark unlocked
    if (!user.centuryClub) user.centuryClub = {};
    user.centuryClub.unlockedAt = new Date().toISOString();
    user.centuryClub.cardClaimed = false;

    const idx = appState.participants.findIndex(p => p.phone === user.phone);
    if (idx >= 0) appState.participants[idx].centuryClub = user.centuryClub;
    saveData();

    showCenturyClubCelebration();
}

function showCenturyClubCelebration() {
    const user = appState.currentUser;
    if (!user) return;

    const total = calculateTotalWorkouts(user);
    const streak = calculateStreak(user);
    const currentDay = getCurrentDay();
    const rate = currentDay > 0 ? Math.round((total / currentDay) * 100) : 0;

    $('cc-cel-name').textContent = user.name.split(' ')[0];
    $('cc-cel-workouts').textContent = total;
    $('cc-cel-streak').textContent = streak;
    $('cc-cel-rate').textContent = rate + '%';

    const overlay = $('century-club-overlay');
    overlay.classList.add('active');

    startConfetti();
    setTimeout(stopConfetti, 6000);
}

function closeCenturyOverlay() {
    $('century-club-overlay').classList.remove('active');
    stopConfetti();
}

function startConfetti() {
    const canvas = $('confetti-canvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const colors = ['#f97316','#6366f1','#22c55e','#eab308','#ec4899','#06b6d4','#a855f7','#ef4444'];
    _confettiParticles = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 6 + Math.random() * 9,
        h: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        vr: (Math.random() - 0.5) * 0.15,
    }));

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        _confettiParticles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
            p.x += p.vx;
            p.y += p.vy;
            p.rot += p.vr;
            if (p.y > canvas.height) {
                p.y = -20;
                p.x = Math.random() * canvas.width;
            }
        });
        _confettiFrame = requestAnimationFrame(draw);
    }
    draw();
}

function stopConfetti() {
    if (_confettiFrame) {
        cancelAnimationFrame(_confettiFrame);
        _confettiFrame = null;
    }
    const canvas = $('confetti-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
    }
}

// ---- Card Builder ----

const CENTURY_THEMES = {
    cosmic:  { label: 'Cosmic',  grad: 'linear-gradient(135deg,#667eea,#764ba2)', c1:'#667eea', c2:'#764ba2', text: '#ffffff', accent: '#e9d5ff' },
    fire:    { label: 'Fire',    grad: 'linear-gradient(135deg,#f7971e,#ffd200)', c1:'#f7971e', c2:'#ffd200', text: '#1a1a1a', accent: '#7c2d12' },
    ocean:   { label: 'Ocean',   grad: 'linear-gradient(135deg,#2193b0,#6dd5ed)', c1:'#2193b0', c2:'#6dd5ed', text: '#ffffff', accent: '#e0f7fa' },
    jungle:  { label: 'Jungle',  grad: 'linear-gradient(135deg,#11998e,#38ef7d)', c1:'#11998e', c2:'#38ef7d', text: '#ffffff', accent: '#073b35' },
    sunset:  { label: 'Sunset',  grad: 'linear-gradient(135deg,#f953c6,#b91d73)', c1:'#f953c6', c2:'#b91d73', text: '#ffffff', accent: '#fce7f3' },
};

function assignCenturyTitle(user) {
    const checkins = user.checkins || {};
    const vals = Object.values(checkins);
    const total = vals.filter(v => v === 'Y').length;
    const restDays = vals.filter(v => v === 'R').length;
    const missedDays = vals.filter(v => v === 'N').length;
    const streak = calculateStreak(user);
    const currentDay = getCurrentDay();
    const rate = currentDay > 0 ? Math.round((total / currentDay) * 100) : 0;

    if (restDays === 0 && missedDays === 0)    return "Zero Days Off. Literally. 💀";
    if (total >= 130)                           return "Overachiever (Shocker) 🙄";
    if (streak >= 50)                           return "We're a Little Scared of You 😳";
    if (streak >= 30)                           return "The Streak Was Unreal 🚀";
    if (rate >= 92)                             return "Suspiciously Consistent 👀";
    if (missedDays === 0 && restDays === 0)     return "Exactly 100. Not One More. 😌";
    if (restDays === 0)                         return "Rest Days? Never Heard of 'Em 😤";
    if (missedDays >= 40)                       return "The Comeback Arc Was REAL 🔥";
    if (rate < 60)                              return "Chaos Theory Actually Works 🤷";
    if (restDays > 25)                          return "Work-Life Balance Understood 😌";
    if (total >= 110)                           return "Couldn't Stop at 100, Could You 😅";
    return "Showed Up Every Single Time 🫡";
}

let _cardPhotoDataUrl = null;   // dataURL string of chosen photo (persisted)
let _cardPhotoImg = null;       // loaded Image object for canvas drawing
let _proudSaveTimer = null;

function openCardBuilder() {
    closeCenturyOverlay();
    const user = appState.currentUser;
    const existing = user.centuryClub || {};

    _cardPhotoDataUrl = existing.photo || null;
    _cardPhotoImg = null;

    const input = $('cc-proud-input');
    if (input) input.value = existing.proudMoment || '';

    // Set theme selection
    const savedTheme = existing.theme || 'cosmic';
    document.querySelectorAll('.cc-theme-dot').forEach(el => {
        el.classList.toggle('selected', el.dataset.theme === savedTheme);
    });

    // Set template selection
    const savedTpl = existing.template || 'pop';
    document.querySelectorAll('.cc-tpl-pill').forEach(el => {
        el.classList.toggle('selected', el.dataset.tpl === savedTpl);
    });

    openModal('card-builder-modal');

    // Load saved photo (if any) then draw
    if (_cardPhotoDataUrl) {
        loadCardPhoto(_cardPhotoDataUrl, refreshCardPreview);
    } else {
        refreshCardPreview();
    }
    // Redraw once web fonts are ready so text uses Inter
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(refreshCardPreview);
    }
}

function loadCardPhoto(dataUrl, cb) {
    const img = new Image();
    img.onload = () => { _cardPhotoImg = img; if (cb) cb(); };
    img.src = dataUrl;
}

function handleCenturyPhoto(input) {
    const file = input.files[0];
    if (!file) return;
    showToast('Adding your photo…', '');
    const reader = new FileReader();
    reader.onload = e => {
        const raw = new Image();
        raw.onload = () => {
            // Downscale + compress so it fits in localStorage and draws fast.
            // Raw phone photos are several MB; we shrink to ~500px JPEG (~50KB).
            const max = 600;
            const scale = Math.min(1, max / Math.max(raw.width, raw.height));
            const c = document.createElement('canvas');
            c.width = Math.round(raw.width * scale);
            c.height = Math.round(raw.height * scale);
            c.getContext('2d').drawImage(raw, 0, 0, c.width, c.height);
            try {
                _cardPhotoDataUrl = c.toDataURL('image/jpeg', 0.82);
            } catch (err) {
                _cardPhotoDataUrl = e.target.result;
            }
            loadCardPhoto(_cardPhotoDataUrl, () => { refreshCardPreview(); persistCenturyCard(); });
        };
        raw.onerror = () => showToast("Couldn't read that image — try another", 'error');
        raw.src = e.target.result;
    };
    reader.onerror = () => showToast("Couldn't read that file", 'error');
    reader.readAsDataURL(file);
}

function getSelectedTheme() {
    const el = document.querySelector('.cc-theme-dot.selected');
    return (el && el.dataset.theme) ? el.dataset.theme : 'cosmic';
}

function selectCCTheme(dot) {
    document.querySelectorAll('.cc-theme-dot').forEach(d => d.classList.remove('selected'));
    dot.classList.add('selected');
    refreshCardPreview();
    persistCenturyCard();
}

function onProudInput() {
    refreshCardPreview();
    clearTimeout(_proudSaveTimer);
    _proudSaveTimer = setTimeout(persistCenturyCard, 400);
}

// Quietly persist the card choices so the Hall of Fame stays in sync.
// No toast, no navigation — Hall of Fame is automatic.
function persistCenturyCard() {
    const user = appState.currentUser;
    if (!user) return;
    if (!user.centuryClub) user.centuryClub = {};
    if (!user.centuryClub.unlockedAt) user.centuryClub.unlockedAt = new Date().toISOString();

    user.centuryClub.photo = _cardPhotoDataUrl || null;
    user.centuryClub.proudMoment = ($('cc-proud-input') && $('cc-proud-input').value.trim()) || '';
    user.centuryClub.title = assignCenturyTitle(user);
    user.centuryClub.theme = getSelectedTheme();
    user.centuryClub.template = getSelectedTemplate();

    const idx = appState.participants.findIndex(p => p.phone === user.phone);
    if (idx >= 0) appState.participants[idx].centuryClub = user.centuryClub;
    saveData();
}

// ---- Canvas card rendering (this IS what gets shared) ----

function ccRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function ccWrapLines(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxWidth && line) {
            lines.push(line);
            line = w;
        } else {
            line = test;
        }
    }
    if (line) lines.push(line);
    return lines;
}

function ccFitFont(ctx, txt, weight, startPx, minPx, maxW, font) {
    let s = startPx;
    ctx.font = `${weight} ${s}px ${font}`;
    while (ctx.measureText(txt).width > maxW && s > minPx) {
        s -= 2;
        ctx.font = `${weight} ${s}px ${font}`;
    }
    return s;
}

function ccCardData() {
    const user = appState.currentUser;
    const theme = CENTURY_THEMES[getSelectedTheme()] || CENTURY_THEMES.cosmic;
    const total = calculateTotalWorkouts(user);
    const currentDay = getCurrentDay();
    return {
        user: user,
        theme: theme,
        name: user.name,
        title: assignCenturyTitle(user),
        proud: ($('cc-proud-input') && $('cc-proud-input').value.trim()) || 'Showed up. Every. Single. Day.',
        total: total,
        streak: calculateStreak(user),
        rate: currentDay > 0 ? Math.round((total / currentDay) * 100) : 0,
        dark: theme.text === '#1a1a1a',
        font: "'Inter', -apple-system, 'Helvetica Neue', Arial, sans-serif",
        season: challengeSettings.seasonName
    };
}

function getSelectedTemplate() {
    const el = document.querySelector('.cc-tpl-pill.selected');
    return (el && el.dataset.tpl) ? el.dataset.tpl : 'pop';
}

function selectCCTemplate(pill) {
    document.querySelectorAll('.cc-tpl-pill').forEach(p => p.classList.remove('selected'));
    pill.classList.add('selected');
    refreshCardPreview();
    persistCenturyCard();
}

function ccBg(ctx, W, H, c1, c2, diag) {
    const g = diag ? ctx.createLinearGradient(0, 0, W, H) : ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
}

function ccDrawCirclePhoto(ctx, cx, cy, r, ringColor, ringW, dark) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    if (_cardPhotoImg) {
        ctx.save();
        ctx.clip();
        const img = _cardPhotoImg;
        const sc = Math.max((r * 2) / img.width, (r * 2) / img.height);
        const dw = img.width * sc, dh = img.height * sc;
        ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
        ctx.restore();
    } else {
        ctx.fillStyle = dark ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.22)';
        ctx.fill();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '110px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('💪', cx, cy + 6);
    }
    if (ringW) {
        ctx.lineWidth = ringW;
        ctx.strokeStyle = ringColor;
        ctx.stroke();
    }
    ctx.restore();
}

function ccDrawRectPhoto(ctx, x, y, w, h, r) {
    ctx.save();
    ccRoundRect(ctx, x, y, w, h, r);
    ctx.clip();
    if (_cardPhotoImg) {
        const img = _cardPhotoImg;
        const sc = Math.max(w / img.width, h / img.height);
        const dw = img.width * sc, dh = img.height * sc;
        ctx.drawImage(img, x + w / 2 - dw / 2, y + h / 2 - dh / 2, dw, dh);
    } else {
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '130px sans-serif';
        ctx.fillText('💪', x + w / 2, y + h / 2);
    }
    ctx.restore();
}

function refreshCardPreview() {
    const canvas = $('cc-card-canvas');
    if (!canvas) return;
    const user = appState.currentUser;
    if (!user) return;
    const W = 1080, H = 1350;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const d = ccCardData();
    const fn = { pop: ccTplPop, bold: ccTplBold, polaroid: ccTplPolaroid, ticket: ccTplTicket }[getSelectedTemplate()] || ccTplPop;
    fn(ctx, W, H, d);
}

/* ---- Variant 1: Confetti Pop ---- */
function ccTplPop(ctx, W, H, d) {
    const cx = W / 2, font = d.font, text = d.theme.text, dark = d.dark;
    const softText = dark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)';
    const chipBg = dark ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.16)';
    const lightInk = dark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)';
    ccBg(ctx, W, H, d.theme.c1, d.theme.c2, true);

    ctx.save();
    ctx.globalAlpha = 0.10;
    ctx.fillStyle = '#ffffff';
    [[-60,-40,300],[W+60,220,260],[-40,H-120,280],[W+40,H+40,340]].forEach(function(p){ ctx.beginPath(); ctx.arc(p[0],p[1],p[2],0,Math.PI*2); ctx.fill(); });
    ctx.restore();

    const confetti = [[70,120,16,'#ffd200'],[1000,90,20,'#ff5fa2'],[930,250,12,'#5fd0ff'],[150,300,12,'#7CFFB2'],[60,520,10,'#ffffff'],[1025,560,12,'#ffd200'],[90,1180,18,'#5fd0ff'],[1000,1150,16,'#ff5fa2'],[200,1255,13,'#ffd200'],[880,1270,14,'#7CFFB2'],[1015,1265,9,'#ffffff'],[120,1280,9,'#ffffff']];
    ctx.save();
    ctx.globalAlpha = 0.85;
    confetti.forEach(function(p){ ctx.fillStyle=p[3]; ctx.beginPath(); ctx.arc(p[0],p[1],p[2],0,Math.PI*2); ctx.fill(); });
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const bannerTxt = '🏆  CENTURY CLUB';
    ctx.font = '800 40px ' + font;
    const bw = ctx.measureText(bannerTxt).width + 80, bh = 76, by = 70;
    ctx.save();
    ccRoundRect(ctx, cx - bw/2, by, bw, bh, bh/2);
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.22)';
    ctx.fill();
    ctx.fillStyle = lightInk;
    ctx.fillText(bannerTxt, cx, by + bh/2 + 2);
    ctx.restore();

    const cy = 330, r = 135;
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r + 14, 0, Math.PI*2);
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.35)';
    ctx.fill();
    ctx.restore();
    ccDrawCirclePhoto(ctx, cx, cy, r, dark ? 'rgba(0,0,0,0.4)' : '#ffffff', 12, dark);

    const bx = cx + r*0.72, byy = cy + r*0.72;
    ctx.save();
    ctx.beginPath(); ctx.arc(bx, byy, 54, 0, Math.PI*2);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.font = '58px sans-serif'; ctx.fillText('💯', bx, byy + 4);
    ctx.restore();

    ctx.fillStyle = text;
    const nameSize = ccFitFont(ctx, d.name, '900', 78, 48, W - 160, font);
    ctx.font = '900 ' + nameSize + 'px ' + font;
    ctx.fillText(d.name, cx, 580);

    const titleSize = ccFitFont(ctx, d.title, '800', 40, 26, W - 200, font);
    ctx.font = '800 ' + titleSize + 'px ' + font;
    const titleW = ctx.measureText(d.title).width, pillH = 72, pillW = titleW + 72, pillY = 632;
    ctx.save();
    ccRoundRect(ctx, cx - pillW/2, pillY, pillW, pillH, pillH/2);
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.16)' : 'rgba(0,0,0,0.22)';
    ctx.fill();
    ctx.fillStyle = lightInk;
    ctx.font = '800 ' + titleSize + 'px ' + font;
    ctx.fillText(d.title, cx, pillY + pillH/2 + 2);
    ctx.restore();

    ctx.font = 'italic 600 42px ' + font;
    const lines = ccWrapLines(ctx, '“' + d.proud + '”', W - 260).slice(0,3);
    const lineH = 56, boxPadY = 38;
    const boxH = lines.length*lineH + boxPadY*2 - 16, boxW = W - 200, boxY = 770;
    ctx.save();
    ccRoundRect(ctx, cx - boxW/2, boxY, boxW, boxH, 30);
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.16)';
    ctx.fill();
    ctx.fillStyle = text;
    let ty = boxY + boxPadY + lineH/2;
    lines.forEach(function(ln){ ctx.fillText(ln, cx, ty); ty += lineH; });
    ctx.restore();

    const chipY = boxY + boxH + 50, chipH = 184, gap = 26, sideMargin = 60;
    const chipW = (W - sideMargin*2 - gap*2)/3;
    const cols = [{num:String(d.total),lbl:'WORKOUTS',emo:'🏋️'},{num:String(d.streak),lbl:'DAY STREAK',emo:'🔥'},{num:d.rate+'%',lbl:'CONSISTENCY',emo:'🎯'}];
    cols.forEach(function(c,i){
        const x = sideMargin + i*(chipW+gap);
        ctx.save(); ccRoundRect(ctx, x, chipY, chipW, chipH, 26); ctx.fillStyle = chipBg; ctx.fill(); ctx.restore();
        const ccx = x + chipW/2;
        ctx.fillStyle = text; ctx.font = '40px sans-serif'; ctx.fillText(c.emo, ccx, chipY + 46);
        ctx.font = '900 64px ' + font; ctx.fillText(c.num, ccx, chipY + 104);
        ctx.fillStyle = softText; ctx.font = '700 24px ' + font; ctx.fillText(c.lbl, ccx, chipY + 150);
    });

    ctx.fillStyle = softText; ctx.font = '600 28px ' + font;
    ctx.fillText('100 Days of Workout · ' + d.season, cx, H - 60);
}

/* ---- Variant 2: Bold Minimal ---- */
function ccTplBold(ctx, W, H, d) {
    const cx = W/2, font = d.font, text = d.theme.text, dark = d.dark;
    const softText = dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.8)';
    ccBg(ctx, W, H, d.theme.c2, d.theme.c1, false);
    ctx.textAlign='center'; ctx.textBaseline='middle';

    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.5)';
    ccRoundRect(ctx, 46, 46, W-92, H-92, 36);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = softText;
    ctx.font = '800 30px ' + font;
    ctx.fillText('★  THE CENTURY CLUB  ★', cx, 140);

    ccDrawCirclePhoto(ctx, cx, 330, 120, dark?'rgba(0,0,0,0.4)':'#ffffff', 8, dark);

    ctx.fillStyle = text;
    const nameSize = ccFitFont(ctx, d.name, '900', 96, 52, W - 200, font);
    ctx.font = '900 ' + nameSize + 'px ' + font;
    ctx.fillText(d.name, cx, 560);

    const titleSize = ccFitFont(ctx, d.title, '700', 38, 26, W - 220, font);
    ctx.font = '700 ' + titleSize + 'px ' + font;
    ctx.fillStyle = softText;
    ctx.fillText(d.title, cx, 636);

    ctx.strokeStyle = dark?'rgba(0,0,0,0.3)':'rgba(255,255,255,0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(cx-90, 700); ctx.lineTo(cx+90, 700); ctx.stroke();

    ctx.fillStyle = text;
    ctx.font = 'italic 600 44px ' + font;
    const lines = ccWrapLines(ctx, '“'+d.proud+'”', W-260).slice(0,3);
    let ty = 800;
    lines.forEach(function(ln){ ctx.fillText(ln, cx, ty); ty += 58; });

    ctx.fillStyle = text;
    ctx.font = '900 130px ' + font;
    ctx.fillText('100', cx, 1015);
    ctx.font = '800 34px ' + font;
    ctx.fillStyle = softText;
    ctx.fillText('DAYS DONE', cx, 1090);

    const cols=[[String(d.total),'WORKOUTS'],[String(d.streak),'STREAK'],[d.rate+'%','RATE']];
    const colX=[W*0.27,W*0.5,W*0.73], sy=1205;
    ctx.strokeStyle = dark?'rgba(0,0,0,0.25)':'rgba(255,255,255,0.4)';
    ctx.lineWidth=2;
    [W*0.385,W*0.615].forEach(function(x){ ctx.beginPath(); ctx.moveTo(x,sy-30); ctx.lineTo(x,sy+44); ctx.stroke(); });
    cols.forEach(function(c,i){
        ctx.fillStyle=text; ctx.font='900 60px ' + font; ctx.fillText(c[0],colX[i],sy);
        ctx.fillStyle=softText; ctx.font='700 22px ' + font; ctx.fillText(c[1],colX[i],sy+50);
    });
}

/* ---- Variant 3: Polaroid ---- */
function ccTplPolaroid(ctx, W, H, d) {
    const cx = W/2, font = d.font;
    ccBg(ctx, W, H, d.theme.c1, d.theme.c2, true);
    ctx.textAlign='center'; ctx.textBaseline='middle';

    const px=90, py=120, pw=W-180, ph=1080;
    ctx.save();
    ctx.shadowColor='rgba(0,0,0,0.3)'; ctx.shadowBlur=40; ctx.shadowOffsetY=18;
    ccRoundRect(ctx, px, py, pw, ph, 28);
    ctx.fillStyle='#ffffff'; ctx.fill();
    ctx.restore();

    const pad=44;
    const imgH = Math.round((pw - pad*2) * 0.82);
    ccDrawRectPhoto(ctx, px+pad, py+pad, pw-pad*2, imgH, 18);

    ctx.save(); ctx.translate(px+34, py+34); ctx.rotate(-0.25); ctx.font='82px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('💯',0,0); ctx.restore();
    ctx.save(); ctx.translate(px+pw-34, py+38); ctx.rotate(0.22); ctx.font='70px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🎉',0,0); ctx.restore();

    const capTop = py+pad+imgH;
    ctx.fillStyle='#1f2937';
    ctx.font='italic 700 46px ' + font;
    const lines = ccWrapLines(ctx, '“'+d.proud+'”', pw-120).slice(0,2);
    let ty = capTop + 70;
    lines.forEach(function(ln){ ctx.fillText(ln, cx, ty); ty+=58; });

    ctx.fillStyle='#6d28d9';
    const ns = ccFitFont(ctx, d.name, '900', 54, 34, pw-140, font);
    ctx.font='900 ' + ns + 'px ' + font;
    ctx.fillText(d.name, cx, ty+40);
    ctx.fillStyle='#9ca3af';
    ctx.font='700 26px ' + font;
    ctx.fillText('100 DAYS DONE · ' + d.season.toUpperCase(), cx, ty+96);

    const sy = py+ph+62;
    const cols=[[String(d.total),'🏋️'],[String(d.streak),'🔥'],[d.rate+'%','🎯']];
    const colX=[W*0.27,W*0.5,W*0.73];
    cols.forEach(function(c,i){
        ctx.fillStyle=d.theme.text; ctx.font='34px sans-serif'; ctx.fillText(c[1],colX[i],sy);
        ctx.font='900 52px ' + font; ctx.fillText(c[0],colX[i],sy+56);
    });
}

/* ---- Variant 4: Ticket Stub ---- */
function ccTplTicket(ctx, W, H, d) {
    const cx=W/2, font=d.font, text=d.theme.text, dark=d.dark;
    const softText = dark?'rgba(0,0,0,0.55)':'rgba(255,255,255,0.82)';
    ccBg(ctx, W, H, d.theme.c1, d.theme.c2, true);
    ctx.textAlign='center'; ctx.textBaseline='middle';

    const tx=70, tyTop=150, tw=W-140, th=1050;
    ctx.save();
    ccRoundRect(ctx, tx, tyTop, tw, th, 34);
    ctx.fillStyle = dark?'rgba(255,255,255,0.22)':'rgba(255,255,255,0.14)';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = softText;
    ctx.font = '800 30px ' + font;
    ctx.fillText('🎟  ADMIT ONE  ·  CENTURY CLUB', cx, tyTop+70);

    ccDrawCirclePhoto(ctx, cx, tyTop+250, 118, dark?'rgba(0,0,0,0.35)':'#ffffff', 8, dark);

    ctx.fillStyle=text;
    const nameSize=ccFitFont(ctx,d.name,'900',74,46,tw-120,font);
    ctx.font='900 ' + nameSize + 'px ' + font;
    ctx.fillText(d.name, cx, tyTop+450);

    const titleSize=ccFitFont(ctx,d.title,'700',34,24,tw-140,font);
    ctx.font='700 ' + titleSize + 'px ' + font;
    ctx.fillStyle=softText;
    ctx.fillText(d.title, cx, tyTop+518);

    ctx.fillStyle=text;
    ctx.font='italic 600 38px ' + font;
    const lines=ccWrapLines(ctx,'“'+d.proud+'”',tw-140).slice(0,2);
    let ty=tyTop+590;
    lines.forEach(function(ln){ ctx.fillText(ln,cx,ty); ty+=50; });

    const perfY = tyTop+760;
    [tx, tx+tw].forEach(function(nx){
        ctx.save();
        ctx.beginPath(); ctx.arc(nx, perfY, 26, 0, Math.PI*2); ctx.closePath(); ctx.clip();
        ccBg(ctx, W, H, d.theme.c1, d.theme.c2, true);
        ctx.restore();
    });
    ctx.save();
    ctx.strokeStyle = dark?'rgba(0,0,0,0.3)':'rgba(255,255,255,0.6)';
    ctx.lineWidth=4; ctx.setLineDash([16,14]);
    ctx.beginPath(); ctx.moveTo(tx+40, perfY); ctx.lineTo(tx+tw-40, perfY); ctx.stroke();
    ctx.restore();

    const cols=[[String(d.total),'WORKOUTS'],[String(d.streak),'STREAK'],[d.rate+'%','RATE']];
    const colX=[tx+tw*0.22, tx+tw*0.5, tx+tw*0.78], sy=perfY+125;
    ctx.strokeStyle=dark?'rgba(0,0,0,0.2)':'rgba(255,255,255,0.35)'; ctx.lineWidth=2;
    [tx+tw*0.36, tx+tw*0.64].forEach(function(x){ ctx.beginPath(); ctx.moveTo(x,sy-34); ctx.lineTo(x,sy+44); ctx.stroke(); });
    cols.forEach(function(c,i){
        ctx.fillStyle=text; ctx.font='900 58px ' + font; ctx.fillText(c[0],colX[i],sy);
        ctx.fillStyle=softText; ctx.font='700 22px ' + font; ctx.fillText(c[1],colX[i],sy+50);
    });

    ctx.fillStyle=softText; ctx.font='700 25px ' + font;
    ctx.fillText('100 DAYS OF WORKOUT · ' + d.season.toUpperCase(), cx, tyTop+th-44);
}

function ccShareCaption() {
    const user = appState.currentUser;
    const total = calculateTotalWorkouts(user);
    const streak = calculateStreak(user);
    return `💯 I just completed 100 days of workouts!\n🏋️ ${total} workouts · 🔥 ${streak} day streak\n\n#100DaysWorkout #CenturyClub`;
}

// Convert a dataURL to a Blob synchronously (so navigator.share keeps the
// user-activation — async toBlob breaks the gesture on iOS and share silently fails).
function ccDataURLToBlob(dataUrl) {
    const [head, b64] = dataUrl.split(',');
    const mime = head.match(/:(.*?);/)[1];
    const bin = atob(b64);
    const len = bin.length;
    const arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
}

function shareCenturyCard() {
    const canvas = $('cc-card-canvas');
    if (!canvas) return;
    persistCenturyCard();

    let file;
    try {
        const blob = ccDataURLToBlob(canvas.toDataURL('image/png'));
        file = new File([blob], 'my-century-card.png', { type: 'image/png' });
    } catch (e) {
        showToast('Could not generate image', 'error');
        return;
    }

    // Try native file share (WhatsApp / Insta share sheet) within the gesture
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], text: ccShareCaption() }).catch(() => {});
        return;
    }
    // Fallback: text-only share, else download
    if (navigator.share) {
        navigator.share({ text: ccShareCaption() }).catch(() => {});
        ccDownloadCanvas(canvas);
    } else {
        ccDownloadCanvas(canvas);
        showToast('Image saved! Share it on WhatsApp 📲', 'success');
    }
}

function downloadCenturyCard() {
    const canvas = $('cc-card-canvas');
    if (!canvas) return;
    persistCenturyCard();
    ccDownloadCanvas(canvas);
    showToast('Saved to your photos! 📸', 'success');
}

function ccDownloadCanvas(canvas) {
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'my-century-card.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// ---- Hall of Fame ----

function renderHallOfFame() {
    const container = $('halloffame-container');
    if (!container) return;

    const completers = appState.participants.filter(p =>
        calculateTotalWorkouts(p) >= 100
    ).sort((a, b) => calculateTotalWorkouts(b) - calculateTotalWorkouts(a));

    $('halloffame-count').textContent = completers.length;

    if (completers.length === 0) {
        container.innerHTML = `
            <div class="hof-empty">
                <div class="hof-empty-icon">🏆</div>
                <h3>No one yet — be the first!</h3>
                <p>Complete 100 workouts to join the Century Club and have your card displayed here.</p>
            </div>`;
        return;
    }

    container.innerHTML = completers.map((p, i) => {
        const club = p.centuryClub || {};
        const theme = CENTURY_THEMES[club.theme || 'cosmic'] || CENTURY_THEMES.cosmic;
        const total = calculateTotalWorkouts(p);
        const streak = calculateStreak(p);
        const proudMoment = club.proudMoment || '100 days of showing up!';
        const title = club.title || assignCenturyTitle(p);
        const photoHTML = club.photo
            ? `<img src="${club.photo}" class="hof-card-photo" alt="">`
            : `<div class="hof-card-photo hof-card-photo-placeholder">💪</div>`;
        const completedDate = club.unlockedAt
            ? new Date(club.unlockedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '';
        const rankLabel = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

        return `
            <div class="hof-card" style="background:${theme.grad};color:${theme.text}">
                <div class="hof-card-rank">${rankLabel}</div>
                <div class="hof-card-watermark">💯</div>
                ${photoHTML}
                <div class="hof-card-badge" style="border-color:rgba(255,255,255,0.4);color:${theme.text}">${title}</div>
                <div class="hof-card-name">${p.name}</div>
                <div class="hof-card-proud">"${proudMoment}"</div>
                <div class="hof-card-stats">
                    <span>🏋️ ${total}</span>
                    <span>🔥 ${streak}d</span>
                </div>
                ${completedDate ? `<div class="hof-card-date">${completedDate}</div>` : ''}
            </div>`;
    }).join('');
}
