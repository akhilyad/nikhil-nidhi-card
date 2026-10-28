/**
 * Wedding RSVP receiver.
 * One row per phone number: a second submission from the same number UPDATES that row.
 * Columns are matched by header name, so the sheet can be re-ordered; missing columns are added automatically.
 */
var SHEET_ID = '1vVuM-HetgB6Bq4Gmn8wY2b_lLl-63RRc-NarfC7Vguw';
var WANTED = ['Time', 'Name', 'Phone', 'Attendance', 'Guests', 'Events', 'Guest names', 'Note', 'Side', 'Updated', 'Submissions'];

function normPhone_(s) {
  var d = String(s || '').replace(/\D/g, '');
  if (d.indexOf('00') === 0) d = d.slice(2);
  if (d.length === 11 && d.charAt(0) === '0') d = '91' + d.slice(1);
  if (d.length === 10) d = '91' + d;
  return d;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function headers_(sheet) {
  var lastCol = sheet.getLastColumn();
  var row = lastCol ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  var map = {};
  for (var i = 0; i < row.length; i++) {
    var h = String(row[i]).trim();
    if (h) map[h.toLowerCase()] = i + 1;
  }
  for (var w = 0; w < WANTED.length; w++) {
    if (!map[WANTED[w].toLowerCase()]) {
      lastCol += 1;
      sheet.getRange(1, lastCol).setValue(WANTED[w]);
      map[WANTED[w].toLowerCase()] = lastCol;
    }
  }
  return map;
}

function findRow_(sheet, phoneCol, key) {
  var last = sheet.getLastRow();
  if (last < 2 || !key) return 0;
  var vals = sheet.getRange(2, phoneCol, last - 1, 1).getDisplayValues();
  for (var i = 0; i < vals.length; i++) {
    if (normPhone_(vals[i][0]) === key) return i + 2;
  }
  return 0;
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'check') {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var h = headers_(sheet);
    return json_({ ok: true, exists: findRow_(sheet, h['phone'], normPhone_(p.phone)) > 0 });
  }
  return json_({ ok: true, service: 'wedding-rsvp' });
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (p.website) return json_({ ok: true, status: 'created' });          // honeypot: bots fill this field
  var key = normPhone_(p.phone);
  if (!String(p.name || '').trim() || key.length < 11 || key.length > 15) {
    return json_({ ok: false, error: 'invalid' });
  }
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);                                                   // two people sending at once never race
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
    var h = headers_(sheet);
    var now = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    var row = findRow_(sheet, h['phone'], key);
    var status = row ? 'updated' : 'created';
    var subs = 1;
    if (row) {
      var prev = sheet.getRange(row, h['submissions']).getValue();
      subs = (parseInt(prev, 10) || 1) + 1;
    } else {
      row = sheet.getLastRow() + 1;
      sheet.getRange(row, h['time']).setValue(now);
    }
    var set = function (name, value) {
      sheet.getRange(row, h[name.toLowerCase()]).setValue(value);
    };
    set('Name', String(p.name).trim().slice(0, 80));
    var phoneCell = sheet.getRange(row, h['phone']);
    phoneCell.setNumberFormat('@');
    phoneCell.setValue('+' + key);
    set('Attendance', p.attendance || '');
    set('Guests', p.guests === undefined ? '' : Number(p.guests));
    set('Events', String(p.events || '').slice(0, 500));
    set('Guest names', String(p.guestNames || '').slice(0, 300));
    set('Note', String(p.note || '').slice(0, 500));
    set('Side', p.side || '');
    set('Updated', now);
    set('Submissions', subs);
    return json_({ ok: true, status: status });
  } finally {
    lock.releaseLock();
  }
}
