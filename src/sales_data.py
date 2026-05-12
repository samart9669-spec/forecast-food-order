"""
อ่าน Sales_Data sheet, คำนวณ avg จาน/วัน
แยกตาม Branch × Item_Code × วันในสัปดาห์ (DOW)

โครงสร้าง Sales_Data (row 1 = header):
  A=Date  B=Branch  C=Item_Code  D=Qty
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

import pandas as pd
import gspread

from src.config import SALES_HISTORY_DAYS, Sheet

logger = logging.getLogger(__name__)

# AvgMap type aliases (plain dict for clarity)
DOWAvgMap     = dict[tuple[str, str, int], float]   # (branch, item_code, dow) → avg
OverallAvgMap = dict[tuple[str, str], float]         # (branch, item_code) → avg


def build_avg_maps(ss: gspread.Spreadsheet) -> tuple[DOWAvgMap, OverallAvgMap]:
    """
    Return (dow_avg_map, overall_avg_map).

    dow: Python weekday() — 0=จันทร์ … 6=อาทิตย์
    Fallback chain: DOW avg → overall avg → 0
    """
    ws = ss.worksheet(Sheet.SALES_DATA)
    records = ws.get_all_records()

    if not records:
        logger.warning("Sales_Data sheet ว่างเปล่า")
        return {}, {}

    df = pd.DataFrame(records)
    df.columns = [str(c).strip() for c in df.columns]

    df = df.rename(columns={
        "Date": "date", "Branch": "branch",
        "Item_Code": "item_code", "Qty": "qty",
    })

    df["date"] = pd.to_datetime(df["date"], dayfirst=False, errors="coerce")
    df["qty"]  = pd.to_numeric(df["qty"], errors="coerce")
    df = df.dropna(subset=["date", "branch", "item_code", "qty"])
    df = df[df["qty"] >= 0]
    df["branch"]    = df["branch"].astype(str).str.strip()
    df["item_code"] = df["item_code"].astype(str).str.strip()

    cutoff = datetime.now() - timedelta(days=SALES_HISTORY_DAYS)
    df = df[df["date"] >= cutoff]

    if df.empty:
        logger.warning(f"ไม่มีข้อมูลขายใน {SALES_HISTORY_DAYS} วันล่าสุด")
        return {}, {}

    df["dow"] = df["date"].dt.weekday  # 0=Mon … 6=Sun

    # avg per (branch, item_code, dow)
    dow_series = (
        df.groupby(["branch", "item_code", "dow"])["qty"]
        .mean()
        .round(2)
    )
    dow_avg: DOWAvgMap = {k: float(v) for k, v in dow_series.items()}

    # overall avg per (branch, item_code) — fallback
    overall_series = (
        df.groupby(["branch", "item_code"])["qty"]
        .mean()
        .round(2)
    )
    overall_avg: OverallAvgMap = {k: float(v) for k, v in overall_series.items()}

    logger.info(
        f"คำนวณ avg สำเร็จ | {len(dow_avg)} DOW-keys | "
        f"{len(overall_avg)} item-keys | ข้อมูล {len(df):,} แถว"
    )
    return dow_avg, overall_avg


def get_avg_for_dow(
    dow_avg: DOWAvgMap,
    overall_avg: OverallAvgMap,
    branch: str,
    item_code: str,
    dow: int,
) -> float:
    if (branch, item_code, dow) in dow_avg:
        return dow_avg[(branch, item_code, dow)]
    if (branch, item_code) in overall_avg:
        return overall_avg[(branch, item_code)]
    return 0.0
