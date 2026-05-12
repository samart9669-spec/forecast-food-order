// ─── Spreadsheet menu ────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Forecast Tools')
    .addItem('อัปเดต Forecast พรุ่งนี้', 'updateForecast')
    .addSeparator()
    .addItem('ตั้ง Trigger อัตโนมัติ (02:00 น.)', 'setupDailyTrigger')
    .addItem('ลบ Trigger ทั้งหมด', 'deleteAllTriggers')
    .addToUi();
}

// ─── Main entry point (called by trigger & menu) ─────────────────────────────

/**
 * ขั้นตอนทั้งหมด:
 *  1. อ่าน Sales_Data 45 วันล่าสุด
 *  2. คำนวณ avg/วัน แยก Branch × Item_Code × DOW
 *  3. หา DOW ของวันพรุ่งนี้
 *  4. เขียน avg ลง Forecast col D (batch write)
 *
 * สูตร Excel ใน Forecast sheet จะคำนวณต่อเองว่า:
 *   Forecast_Qty × Recipe_Master → กรัมวัตถุดิบ → หักสต็อก → PO
 */
function updateForecast() {
  try {
    const ss     = SpreadsheetApp.getActiveSpreadsheet();
    const result = writeForecast(ss);

    const ui = SpreadsheetApp.getUi();
    ui.alert(
      '✅ อัปเดต Forecast สำเร็จ',
      `วันพรุ่งนี้: ${result.tomorrowName}\nอัปเดต ${result.rowsUpdated} แถว`,
      ui.ButtonSet.OK
    );
  } catch (err) {
    Logger.log(`❌ updateForecast error: ${err.message}\n${err.stack}`);
    SpreadsheetApp.getUi().alert(`❌ เกิดข้อผิดพลาด\n${err.message}`);
  }
}
