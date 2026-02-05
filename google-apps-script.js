/**
 * 100 Days of Workout - Google Apps Script Backend
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Copy this entire code into the script editor
 * 4. Update SPREADSHEET_ID below with your sheet ID
 * 5. Click Run > setupSheets (allow permissions)
 * 6. Click Deploy > New Deployment > Web app
 * 7. Execute as: Me, Who has access: Anyone
 * 8. Copy the Web App URL
 */

// Configuration - UPDATE THIS!
var CONFIG = {
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE', // Get this from the sheet URL
  PARTICIPANTS_SHEET: 'Participants',
  CHECKINS_SHEET: 'Checkins',
  START_DATE: '2026-02-01',  // Challenge starts Feb 1
  END_DATE: '2026-07-31',    // Challenge ends July 31
  TOTAL_DAYS: 100            // Need to complete 100 workouts in this period
};

// Main GET handler
function doGet(e) {
  return handleRequest(e);
}

// Main POST handler
function doPost(e) {
  return handleRequest(e);
}

// Request handler
function handleRequest(e) {
  try {
    var data = {};

    // Parse request data
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || 'getData';
    var result;

    switch (action) {
      case 'register':
        result = handleRegister(data);
        break;
      case 'login':
        result = handleLogin(data.phone);
        break;
      case 'getData':
        result = handleGetData(data.phone);
        break;
      case 'checkin':
        result = handleCheckin(data.phone, data.date, data.status);
        break;
      case 'deleteCheckin':
        result = handleDeleteCheckin(data.phone, data.date);
        break;
      case 'getSummary':
        result = handleGetSummary();
        break;
      case 'getWeeklySummary':
        result = handleGetWeeklySummary();
        break;
      case 'getParticipantCheckins':
        result = handleGetParticipantCheckins(data.phone, data.targetPhone, data.targetId);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle new user registration
function handleRegister(data) {
  if (!data.name || !data.phone) {
    return { success: false, error: 'Name and phone required' };
  }

  var cleanPhone = data.phone.toString().replace(/\D/g, '').slice(-10);
  var participants = getParticipants();

  // Check if already registered
  var existing = participants.filter(function(p) { return p.phone === cleanPhone; });
  if (existing.length > 0) {
    return { success: false, error: 'Phone already registered' };
  }

  // Add to sheet
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.PARTICIPANTS_SHEET);
  var newId = participants.length + 1;
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  sheet.appendRow([
    newId,
    data.name,
    cleanPhone,
    data.goal || '',
    data.commitment || '',
    today
  ]);

  return {
    success: true,
    data: {
      user: {
        id: newId,
        name: data.name,
        phone: cleanPhone,
        goal: data.goal || '',
        commitment: data.commitment || '',
        joinDate: today,
        checkins: {}
      }
    }
  };
}

// Handle login - verify phone and return all data
function handleLogin(phone) {
  if (!phone) {
    return { success: false, error: 'Phone number required' };
  }

  var cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
  var participants = getParticipants();

  var user = null;
  for (var i = 0; i < participants.length; i++) {
    if (participants[i].phone === cleanPhone) {
      user = participants[i];
      break;
    }
  }

  if (!user) {
    return { success: false, error: 'User not found. Please register first.' };
  }

  // Get checkins for all participants
  var allCheckins = getCheckins();

  // Attach checkins and calculate stats for each participant
  for (var j = 0; j < participants.length; j++) {
    var p = participants[j];
    var userCheckins = allCheckins.filter(function(c) { return c.phone === p.phone; });
    p.checkins = {};
    for (var k = 0; k < userCheckins.length; k++) {
      p.checkins[userCheckins[k].date] = userCheckins[k].status;
    }

    // Calculate stats
    var stats = calculateStats(p.checkins);
    p.totalWorkouts = stats.totalWorkouts;
    p.streak = stats.streak;
  }

  // Find updated user with checkins
  for (var m = 0; m < participants.length; m++) {
    if (participants[m].phone === cleanPhone) {
      user = participants[m];
      break;
    }
  }

  // Check if current user is admin
  var isAdmin = user.isAdmin || user.isSuperAdmin || false;

  // Strip sensitive data from other participants
  var safeParticipants = [];
  for (var n = 0; n < participants.length; n++) {
    var sp = participants[n];
    if (sp.phone === cleanPhone) {
      // Current user gets full data
      safeParticipants.push(sp);
    } else if (isAdmin) {
      // Admins get full phone (needed for admin actions) + computed stats, no raw checkins
      safeParticipants.push({
        id: sp.id,
        name: sp.name,
        phone: sp.phone,
        goal: sp.goal,
        commitment: sp.commitment,
        joinDate: sp.joinDate,
        timezone: sp.timezone || '',
        isAdmin: sp.isAdmin || false,
        isSuperAdmin: sp.isSuperAdmin || false,
        totalWorkouts: sp.totalWorkouts,
        streak: sp.streak
      });
    } else {
      // Regular users: NO phone number, use id for lookups instead
      safeParticipants.push({
        id: sp.id,
        name: sp.name,
        phone: '',  // Hidden for non-admin users
        goal: sp.goal,
        commitment: sp.commitment,
        joinDate: sp.joinDate,
        timezone: sp.timezone || '',
        totalWorkouts: sp.totalWorkouts,
        streak: sp.streak
      });
    }
  }

  return {
    success: true,
    data: {
      user: user,
      participants: safeParticipants
    }
  };
}

// Handle getData - refresh data for a user
function handleGetData(phone) {
  return handleLogin(phone);
}

// Handle checkin submission
function handleCheckin(phone, date, status) {
  if (!phone || !date || !status) {
    return { success: false, error: 'Missing required fields' };
  }

  var cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.CHECKINS_SHEET);

  // Check if checkin already exists for this date
  var sheetData = sheet.getDataRange().getValues();
  var existingRow = -1;

  for (var i = 1; i < sheetData.length; i++) {
    var rowPhone = sheetData[i][0].toString().replace(/\D/g, '').slice(-10);
    var rowDate = sheetData[i][1];
    // Format date properly - Google Sheets may convert to Date object
    var rowDateStr;
    if (rowDate instanceof Date) {
      rowDateStr = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else {
      rowDateStr = rowDate.toString();
    }

    if (rowPhone === cleanPhone && rowDateStr === date) {
      existingRow = i + 1; // 1-indexed
      break;
    }
  }

  var timestamp = new Date().toISOString();

  if (existingRow > 0) {
    // Update existing checkin
    sheet.getRange(existingRow, 3).setValue(status);
    sheet.getRange(existingRow, 4).setValue(timestamp);
  } else {
    // Add new checkin
    sheet.appendRow([cleanPhone, date, status, timestamp]);
  }

  return {
    success: true,
    data: { message: 'Checkin saved!' }
  };
}

// Handle delete checkin
function handleDeleteCheckin(phone, date) {
  if (!phone || !date) {
    return { success: false, error: 'Missing required fields' };
  }

  var cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.CHECKINS_SHEET);
  var sheetData = sheet.getDataRange().getValues();

  // Find and delete the checkin row
  for (var i = 1; i < sheetData.length; i++) {
    var rowPhone = sheetData[i][0].toString().replace(/\D/g, '').slice(-10);
    var rowDate = sheetData[i][1];
    var rowDateStr;
    if (rowDate instanceof Date) {
      rowDateStr = Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
    } else {
      rowDateStr = rowDate.toString();
    }

    if (rowPhone === cleanPhone && rowDateStr === date) {
      sheet.deleteRow(i + 1); // 1-indexed
      return {
        success: true,
        data: { message: 'Checkin deleted!' }
      };
    }
  }

  return {
    success: true,
    data: { message: 'No checkin found to delete' }
  };
}

// Handle get summary
function handleGetSummary() {
  var participants = getParticipants();
  var allCheckins = getCheckins();
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  // Calculate stats for each participant
  for (var j = 0; j < participants.length; j++) {
    var p = participants[j];
    var userCheckins = allCheckins.filter(function(c) { return c.phone === p.phone; });
    p.checkins = {};
    for (var k = 0; k < userCheckins.length; k++) {
      p.checkins[userCheckins[k].date] = userCheckins[k].status;
    }

    var stats = calculateStats(p.checkins);
    p.totalWorkouts = stats.totalWorkouts;
    p.streak = stats.streak;
  }

  // Today's stats
  var workedOut = 0;
  var missed = 0;
  var pending = 0;

  for (var i = 0; i < participants.length; i++) {
    var todayCheckin = participants[i].checkins[today];
    if (todayCheckin === 'Y' || todayCheckin === 'R') workedOut++;
    else if (todayCheckin === 'N') missed++;
    else pending++;
  }

  // Sort by total workouts for leaderboard
  participants.sort(function(a, b) {
    return (b.totalWorkouts || 0) - (a.totalWorkouts || 0);
  });

  return {
    success: true,
    data: {
      date: today,
      currentDay: getCurrentDay(),
      todayStats: { workedOut: workedOut, missed: missed, pending: pending },
      leaderboard: participants.slice(0, 10),
      totalParticipants: participants.length
    }
  };
}

// Handle get participant checkins on-demand (for calendar view)
// Accepts either targetPhone or targetId to find participant
function handleGetParticipantCheckins(requestorPhone, targetPhone, targetId) {
  if (!requestorPhone) {
    return { success: false, error: 'Missing required fields' };
  }

  var allCheckins = getCheckins();
  var participants = getParticipants();

  // Find target participant by id or phone
  var target = null;
  if (targetId) {
    for (var i = 0; i < participants.length; i++) {
      if (participants[i].id.toString() === targetId.toString()) {
        target = participants[i];
        break;
      }
    }
  }
  if (!target && targetPhone) {
    var cleanTarget = targetPhone.toString().replace(/\D/g, '').slice(-10);
    for (var j = 0; j < participants.length; j++) {
      if (participants[j].phone === cleanTarget) {
        target = participants[j];
        break;
      }
    }
  }

  if (!target) {
    return { success: false, error: 'Participant not found' };
  }

  // Get checkins for target
  var checkins = {};
  var targetCheckins = allCheckins.filter(function(c) { return c.phone === target.phone; });
  for (var k = 0; k < targetCheckins.length; k++) {
    checkins[targetCheckins[k].date] = targetCheckins[k].status;
  }

  return {
    success: true,
    data: {
      name: target.name,
      checkins: checkins
    }
  };
}

// Handle get weekly summary - safe endpoint, no login needed, no phones exposed
function handleGetWeeklySummary() {
  var participants = getParticipants();
  var allCheckins = getCheckins();
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get Monday of current week
  var dayOfWeek = today.getDay();
  var diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  var weekStart = new Date(today);
  weekStart.setDate(today.getDate() + diff);

  // Calculate stats for each participant
  var summaryList = [];
  for (var j = 0; j < participants.length; j++) {
    var p = participants[j];
    var userCheckins = allCheckins.filter(function(c) { return c.phone === p.phone; });
    var checkins = {};
    for (var k = 0; k < userCheckins.length; k++) {
      checkins[userCheckins[k].date] = userCheckins[k].status;
    }

    var stats = calculateStats(checkins);

    // Calculate weekly workouts (Mon-Sun)
    var weeklyWorkouts = 0;
    for (var d = 0; d < 7; d++) {
      var checkDate = new Date(weekStart);
      checkDate.setDate(weekStart.getDate() + d);
      var dateStr = Utilities.formatDate(checkDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      if (checkins[dateStr] === 'Y') weeklyWorkouts++;
    }

    // Only return name and stats - NO phone, NO checkins
    summaryList.push({
      name: p.name,
      totalWorkouts: stats.totalWorkouts,
      streak: stats.streak,
      weeklyWorkouts: weeklyWorkouts
    });
  }

  return {
    success: true,
    data: {
      currentDay: getCurrentDay(),
      totalParticipants: summaryList.length,
      participants: summaryList
    }
  };
}

// Get all participants from sheet
function getParticipants() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.PARTICIPANTS_SHEET);
  var data = sheet.getDataRange().getValues();

  var participants = [];

  // Skip header row
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] && row[1]) { // Has ID and name
      participants.push({
        id: row[0],
        name: row[1],
        phone: row[2] ? row[2].toString().replace(/\D/g, '').slice(-10) : '',
        goal: row[3] || '',
        commitment: row[4] || '',
        joinDate: row[5] || ''
      });
    }
  }

  return participants;
}

// Get all checkins from sheet
function getCheckins() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.CHECKINS_SHEET);
  var data = sheet.getDataRange().getValues();

  var checkins = [];

  // Skip header row
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] && row[1]) {
      // Format date properly - Google Sheets may convert to Date object
      var dateVal = row[1];
      var dateStr;
      if (dateVal instanceof Date) {
        dateStr = Utilities.formatDate(dateVal, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      } else {
        dateStr = dateVal.toString();
      }

      checkins.push({
        phone: row[0].toString().replace(/\D/g, '').slice(-10),
        date: dateStr,
        status: row[2],
        timestamp: row[3]
      });
    }
  }

  return checkins;
}

// Calculate user stats from checkins
function calculateStats(checkins) {
  var totalWorkouts = 0;
  var streak = 0;

  // Count total Y's
  var values = Object.keys(checkins).map(function(key) { return checkins[key]; });
  for (var i = 0; i < values.length; i++) {
    if (values[i] === 'Y') totalWorkouts++;
  }

  // Calculate current streak (only Y counts, R doesn't break it)
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var j = 0; j < 365; j++) {
    var checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - j);
    var dateStr = Utilities.formatDate(checkDate, Session.getScriptTimeZone(), 'yyyy-MM-dd');

    if (checkins[dateStr] === 'Y') {
      // Only actual workouts count towards streak
      streak++;
    } else if (checkins[dateStr] === 'R') {
      // Rest days don't count towards streak, but don't break it either
      continue;
    } else if (checkins[dateStr] === 'N') {
      // Skipped day breaks the streak
      break;
    } else if (j > 0) {
      // No checkin for a past day breaks the streak
      break;
    }
    // If today has no checkin, continue checking yesterday
  }

  return { totalWorkouts: totalWorkouts, streak: streak };
}

// Get current day of challenge (day in the challenge period, 1-181)
function getCurrentDay() {
  var start = new Date(CONFIG.START_DATE);
  var end = new Date(CONFIG.END_DATE);
  var today = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  var totalPeriodDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1; // 181 days
  var diffTime = today - start;
  var diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(1, Math.min(diffDays, totalPeriodDays));
}


// ============================================
// SETUP FUNCTION - RUN THIS FIRST!
// ============================================

/**
 * Run this function to set up the sheets with correct headers
 * Go to Run > setupSheets in the Apps Script editor
 */
function setupSheets() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  // Create or get Participants sheet
  var participantsSheet = ss.getSheetByName(CONFIG.PARTICIPANTS_SHEET);
  if (!participantsSheet) {
    participantsSheet = ss.insertSheet(CONFIG.PARTICIPANTS_SHEET);
  }

  // Set headers for Participants
  participantsSheet.getRange('A1:F1').setValues([
    ['id', 'name', 'phone', 'goal', 'commitment', 'join_date']
  ]);
  participantsSheet.getRange('A1:F1').setFontWeight('bold');

  // Create or get Checkins sheet
  var checkinsSheet = ss.getSheetByName(CONFIG.CHECKINS_SHEET);
  if (!checkinsSheet) {
    checkinsSheet = ss.insertSheet(CONFIG.CHECKINS_SHEET);
  }

  // Set headers for Checkins
  checkinsSheet.getRange('A1:D1').setValues([
    ['phone', 'date', 'status', 'timestamp']
  ]);
  checkinsSheet.getRange('A1:D1').setFontWeight('bold');

  Logger.log('Sheets setup complete!');
}

/**
 * Test the API locally
 */
function testApi() {
  Logger.log('Testing API...');

  // Test summary
  var summaryResult = handleGetSummary();
  Logger.log('Summary result: ' + JSON.stringify(summaryResult));
}
