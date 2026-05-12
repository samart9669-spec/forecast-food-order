/**
 * อ่าน Forecast sheet, คำนวณ avg พรุ่งนี้ต่อ Branch×Item_Code,
 * แล้ว batch-write ลง col D ทีเดียว
 *
 * โครงสร้าง Forecast (row 1 = header):
 *   A=Branch  B=Item_Code  C=Item_Name  D=Forecast_Qty  (E+ = formulas)
 */
function writeForecast(ss) {
  const forecastSheet = ss.getSheetByName(SHEET.FORECAST);
  if (!forecastSheet) throw new Error(`ไม่พบ sheet "${SHEET.FORECAST}"`);

  const lastRow = forecastSheet.getLastRow();
  if (lastRow < 2) {
    Logger.log('Forecast sheet ไม่มีข้อมูล (row < 2)');
    return { rowsUpdated: 0, tomorrowDOW: getTomorrowDOW() };
  }

  // คำนวณ avg maps
  const avgMap     = buildDOWAverages(ss);
  const overallAvg = buildOverallAverages(avgMap);

  const tomorrowDOW  = getTomorrowDOW();
  const tomorrowName = DOW_TH[tomorrowDOW];

  // อ่าน col A (Branch) และ col B (Item_Code) ทั้งหมด
  const dataRange = forecastSheet.getRange(2, 1, lastRow - 1, 2).getValues();

  // สร้าง array [[forecast_qty], [forecast_qty], …] สำหรับ col D
  const forecastValues = dataRange.map(row => {
    const branch   = String(row[FORECAST_COL.BRANCH]).trim();
    const itemCode = String(row[FORECAST_COL.ITEM_CODE]).trim();
    if (!branch || !itemCode) return [0];
    const avg = getAvgForDOW(avgMap, overallAvg, branch, itemCode, tomorrowDOW);
    return [avg];
  });

  // Batch write col D (index 4 = column D)
  forecastSheet
    .getRange(2, FORECAST_COL.FORECAST_QTY + 1, forecastValues.length, 1)
    .setValues(forecastValues);

  Logger.log(
    `✅ writeForecast เสร็จ | พรุ่งนี้: ${tomorrowName} | อัปเดต ${forecastValues.length} แถว`
  );

  return { rowsUpdated: forecastValues.length, tomorrowDOW, tomorrowName };
}

/**
 * คืน day-of-week ของวันพรุ่งนี้ (0=อาทิตย์ … 6=เสาร์)
 */
function getTomorrowDOW() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getDay();
}
