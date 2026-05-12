/**
 * อ่านข้อมูลยอดขาย 45 วันล่าสุดจาก Sales_Data sheet
 * แล้วคำนวณ avg จาน/วัน แยกตาม Branch × Item_Code × วันในสัปดาห์
 *
 * โครงสร้าง Sales_Data (row 1 = header):
 *   A=Date  B=Branch  C=Item_Code  D=Qty
 *
 * @returns {Object} avgMap  key = "BRANCH|ITEM_CODE|DOW"  value = avg qty (number)
 */
function buildDOWAverages(ss) {
  const sheet = ss.getSheetByName(SHEET.SALES_DATA);
  if (!sheet) throw new Error(`ไม่พบ sheet "${SHEET.SALES_DATA}"`);

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return {};

  const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - CONFIG.SALES_HISTORY_DAYS);

  // accumulator:  key → { sum, count }
  const acc = {};

  data.forEach(row => {
    const rawDate = row[SALES_COL.DATE];
    const branch   = String(row[SALES_COL.BRANCH]).trim();
    const itemCode = String(row[SALES_COL.ITEM_CODE]).trim();
    const qty      = Number(row[SALES_COL.QTY]);

    if (!rawDate || !branch || !itemCode || isNaN(qty) || qty < 0) return;

    const saleDate = rawDate instanceof Date ? rawDate : new Date(rawDate);
    if (isNaN(saleDate.getTime()) || saleDate < cutoff) return;

    const dow = saleDate.getDay(); // 0=Sun … 6=Sat
    const key = `${branch}|${itemCode}|${dow}`;

    if (!acc[key]) acc[key] = { sum: 0, count: 0 };
    acc[key].sum   += qty;
    acc[key].count += 1;
  });

  // แปลงเป็น avg  (ปัดทศนิยม 2 ตำแหน่ง)
  const avgMap = {};
  Object.entries(acc).forEach(([key, { sum, count }]) => {
    avgMap[key] = Math.round((sum / count) * 100) / 100;
  });

  return avgMap;
}

/**
 * Fallback: avg รวมทุกวันในสัปดาห์สำหรับ Branch × Item_Code คู่นั้น
 * ใช้เมื่อ avgMap ไม่มีข้อมูล DOW เฉพาะ
 */
function buildOverallAverages(avgMap) {
  const overall = {};

  Object.entries(avgMap).forEach(([key, avg]) => {
    const [branch, itemCode] = key.split('|');
    const baseKey = `${branch}|${itemCode}`;
    if (!overall[baseKey]) overall[baseKey] = { sum: 0, count: 0 };
    overall[baseKey].sum   += avg;
    overall[baseKey].count += 1;
  });

  const overallAvg = {};
  Object.entries(overall).forEach(([key, { sum, count }]) => {
    overallAvg[key] = Math.round((sum / count) * 100) / 100;
  });

  return overallAvg;
}

/**
 * หา avg ที่ถูกต้องสำหรับ Branch+ItemCode ในวัน dow
 * ถ้าไม่มีข้อมูล DOW นั้น → ใช้ overall avg
 * ถ้าไม่มีเลย → คืน 0
 */
function getAvgForDOW(avgMap, overallAvg, branch, itemCode, dow) {
  const dowKey     = `${branch}|${itemCode}|${dow}`;
  const overallKey = `${branch}|${itemCode}`;

  if (avgMap[dowKey] !== undefined) return avgMap[dowKey];
  if (overallAvg[overallKey] !== undefined) return overallAvg[overallKey];
  return 0;
}
