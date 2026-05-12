#!/usr/bin/env python3
"""
Long-running scheduler: รัน update_forecast ทุกวัน ตามเวลาที่กำหนดใน .env (TRIGGER_HOUR)

ใช้งาน:
  python scheduler.py

หรือรันเป็น background process:
  nohup python scheduler.py &
"""

import logging
import signal
import sys
import time

import schedule

from main import logger, update_forecast
from src.config import TRIGGER_HOUR

# ─── Graceful shutdown ───────────────────────────────────────────────────────

def _handle_signal(sig, frame):
    logger.info(f"รับ signal {sig} — หยุด scheduler")
    sys.exit(0)

signal.signal(signal.SIGTERM, _handle_signal)
signal.signal(signal.SIGINT,  _handle_signal)

# ─── Schedule ────────────────────────────────────────────────────────────────

def _job():
    try:
        update_forecast()
    except Exception:
        logger.exception("scheduled job ล้มเหลว — รอรอบถัดไป")

schedule.every().day.at(TRIGGER_HOUR).do(_job)
logger.info(f"Scheduler เริ่มทำงาน | รันทุกวัน เวลา {TRIGGER_HOUR} น.")

# ─── Loop ────────────────────────────────────────────────────────────────────

while True:
    schedule.run_pending()
    time.sleep(30)
