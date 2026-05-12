/**
 * ลบ trigger เดิมที่ชื่อ updateForecast ทั้งหมด แล้วสร้าง trigger ใหม่
 * รันทุกวัน เวลา CONFIG.TRIGGER_HOUR น. (ค่า default = 02:00)
 */
function setupDailyTrigger() {
  _deleteTriggersByName('updateForecast');

  ScriptApp.newTrigger('updateForecast')
    .timeBased()
    .everyDays(1)
    .atHour(CONFIG.TRIGGER_HOUR)
    .create();

  const msg = `✅ ตั้ง Trigger สำเร็จ\nรันทุกวัน เวลา ${CONFIG.TRIGGER_HOUR}:00 น.`;
  Logger.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}

/**
 * ลบ trigger ทั้งหมดในโปรเจกต์นี้
 */
function deleteAllTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  const msg = '🗑️ ลบ Trigger ทั้งหมดแล้ว';
  Logger.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}

// ─── Internal ────────────────────────────────────────────────────────────────

function _deleteTriggersByName(funcName) {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === funcName)
    .forEach(t => ScriptApp.deleteTrigger(t));
}
