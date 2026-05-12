"""
อ่าน Forecast sheet, เติม avg พรุ่งนี้ลง col D ด้วย batch update เดียว

โครงสร้าง Forecast (row 1 = header):
  A=Branch  B=Item_Code  C=Item_Name  D=Forecast_Qty  (E+ = สูตร sheet)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta

import gspread

from src.config import DOW_TH, FORECAST_QTY_COL, Sheet
from src.sales_data import DOWAvgMap, OverallAvgMap, build_avg_maps, get_avg_for_dow

logger = logging.getLogger(__name__)


@dataclass
class ForecastResult:
    rows_updated: int
    tomorrow_dow: int
    tomorrow_name: str


def run_forecast(ss: gspread.Spreadsheet) -> ForecastResult:
    """
    1. คำนวณ avg maps จาก Sales_Data
    2. หา DOW ของวันพรุ่งนี้
    3. เขียน avg ลง Forecast col D (batch update ครั้งเดียว)
    """
    forecast_ws = ss.worksheet(Sheet.FORECAST)
    all_values  = forecast_ws.get_all_values()

    if len(all_values) < 2:
        logger.warning("Forecast sheet ไม่มีข้อมูล (ต้องมีอย่างน้อย 1 data row)")
        tomorrow_dow = _tomorrow_dow()
        return ForecastResult(0, tomorrow_dow, DOW_TH[tomorrow_dow])

    dow_avg, overall_avg = build_avg_maps(ss)
    tomorrow_dow  = _tomorrow_dow()
    tomorrow_name = DOW_TH[tomorrow_dow]

    # data rows = all_values[1:]  (skip header)
    data_rows    = all_values[1:]
    forecast_col = [[
        get_avg_for_dow(dow_avg, overall_avg, str(r[0]).strip(), str(r[1]).strip(), tomorrow_dow)
    ] for r in data_rows]

    # Batch write: col D (FORECAST_QTY_COL=4, 1-based), rows 2..N
    n = len(forecast_col)
    cell_range = f"D2:D{n + 1}"
    forecast_ws.update(cell_range, forecast_col, value_input_option="RAW")

    logger.info(
        f"✅ Forecast อัปเดตสำเร็จ | พรุ่งนี้: {tomorrow_name} | {n} แถว → {cell_range}"
    )
    return ForecastResult(n, tomorrow_dow, tomorrow_name)


def _tomorrow_dow() -> int:
    """Return weekday() of tomorrow: 0=Mon … 6=Sun"""
    return (datetime.now() + timedelta(days=1)).weekday()
