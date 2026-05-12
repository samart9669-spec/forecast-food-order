#!/usr/bin/env python3
"""
รันครั้งเดียว: อ่านยอดขาย → คำนวณ avg by DOW → เขียน Forecast col D

ใช้งาน:
  python main.py
"""

import logging
import os
import sys
from datetime import datetime

from src.config import LOG_LEVEL, SPREADSHEET_ID
from src.forecast_writer import run_forecast
from src.sheets_client import open_spreadsheet

# ─── Logging ─────────────────────────────────────────────────────────────────

os.makedirs("logs", exist_ok=True)

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f"logs/forecast_{datetime.now():%Y%m}.log", encoding="utf-8"),
    ],
)

logger = logging.getLogger("main")

# ─── Entry point ─────────────────────────────────────────────────────────────

def update_forecast() -> None:
    logger.info("─── เริ่ม update_forecast ───")
    try:
        ss     = open_spreadsheet(SPREADSHEET_ID)
        result = run_forecast(ss)
        logger.info(
            f"สำเร็จ | วันพรุ่งนี้: {result.tomorrow_name} | อัปเดต {result.rows_updated} แถว"
        )
    except Exception:
        logger.exception("update_forecast ล้มเหลว")
        raise
    finally:
        logger.info("─── จบ update_forecast ───")


if __name__ == "__main__":
    update_forecast()
