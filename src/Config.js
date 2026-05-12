// ─── Sheet Names ────────────────────────────────────────────────────────────
const SHEET = {
  SALES_DATA:     'Sales_Data',
  FORECAST:       'Forecast',
  RECIPE_MASTER:  'Recipe_Master',
  STOCK:          'Stock',
  PURCHASE_ORDER: 'Purchase_Order',
};

// ─── Sales_Data column indices (0-based, row 1 = header) ────────────────────
// A=Date  B=Branch  C=Item_Code  D=Qty
const SALES_COL = {
  DATE:      0,
  BRANCH:    1,
  ITEM_CODE: 2,
  QTY:       3,
};

// ─── Forecast sheet column indices (0-based) ─────────────────────────────────
// A=Branch  B=Item_Code  C=Item_Name  D=Forecast_Qty  (E+ = sheet formulas)
const FORECAST_COL = {
  BRANCH:       0,
  ITEM_CODE:    1,
  FORECAST_QTY: 3, // col D  ← script writes here
};

// ─── Recipe_Master column indices (0-based) ──────────────────────────────────
// A=Item_Code  B=Ingredient_Code  C=Ingredient_Name  D=Grams_Per_Dish
const RECIPE_COL = {
  ITEM_CODE:        0,
  INGREDIENT_CODE:  1,
  INGREDIENT_NAME:  2,
  GRAMS_PER_DISH:   3,
};

// ─── Stock sheet column indices (0-based) ─────────────────────────────────────
// A=Branch  B=Ingredient_Code  C=Current_Stock_g  D=Safety_Buffer_g
const STOCK_COL = {
  BRANCH:           0,
  INGREDIENT_CODE:  1,
  CURRENT_STOCK_G:  2,
  SAFETY_BUFFER_G:  3,
};

// ─── Behaviour ───────────────────────────────────────────────────────────────
const CONFIG = {
  SALES_HISTORY_DAYS: 45,   // วันย้อนหลังที่ใช้คำนวณ avg
  TRIGGER_HOUR:       2,    // เวลา trigger อัตโนมัติ (02:00 น.)
  MIN_SAMPLE_DAYS:    3,    // ต้องมีข้อมูลอย่างน้อยกี่วันต่อ DOW ก่อน fallback
};

// ─── Day-of-week labels (getDay(): 0=Sun … 6=Sat) ───────────────────────────
const DOW_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
