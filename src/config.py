import os
from dotenv import load_dotenv

load_dotenv()


def _require(key: str) -> str:
    val = os.getenv(key)
    if not val:
        raise EnvironmentError(f"Missing required env var: {key}")
    return val


SPREADSHEET_ID    = _require("SPREADSHEET_ID")
CREDENTIALS_FILE  = os.getenv("CREDENTIALS_FILE", "credentials.json")
TRIGGER_HOUR      = os.getenv("TRIGGER_HOUR", "02:00")
SALES_HISTORY_DAYS = int(os.getenv("SALES_HISTORY_DAYS", "45"))
LOG_LEVEL         = os.getenv("LOG_LEVEL", "INFO")


class Sheet:
    SALES_DATA     = "Sales_Data"
    FORECAST       = "Forecast"
    RECIPE_MASTER  = "Recipe_Master"
    STOCK          = "Stock"
    PURCHASE_ORDER = "Purchase_Order"


# Forecast sheet: col D = index 3 (0-based) = column 4 (1-based, A1 notation)
FORECAST_QTY_COL = 4  # 1-based for gspread range

# Python weekday(): 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri 5=Sat 6=Sun
DOW_TH = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"]
