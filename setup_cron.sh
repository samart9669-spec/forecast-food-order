#!/usr/bin/env bash
# ติดตั้ง cron job ให้รัน main.py ทุกวันตาม TRIGGER_HOUR ใน .env
# ใช้งาน:  bash setup_cron.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="$SCRIPT_DIR/.venv/bin/python"
LOG_DIR="$SCRIPT_DIR/logs"
CRON_TAG="forecast-food-order"

# อ่าน TRIGGER_HOUR จาก .env (default = 02:00)
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  TRIGGER_HOUR=$(grep -E '^TRIGGER_HOUR=' "$SCRIPT_DIR/.env" | cut -d= -f2 | tr -d '"' | tr -d "'")
fi
TRIGGER_HOUR="${TRIGGER_HOUR:-02:00}"

HOUR=$(echo "$TRIGGER_HOUR" | cut -d: -f1)
MIN=$(echo  "$TRIGGER_HOUR" | cut -d: -f2)

mkdir -p "$LOG_DIR"

CRON_LINE="$MIN $HOUR * * * cd \"$SCRIPT_DIR\" && \"$PYTHON\" main.py >> \"$LOG_DIR/forecast_cron.log\" 2>&1  # $CRON_TAG"

# ลบ entry เดิม (ถ้ามี) แล้วเพิ่มใหม่
( crontab -l 2>/dev/null | grep -v "$CRON_TAG" ; echo "$CRON_LINE" ) | crontab -

echo "✅ ติดตั้ง cron job สำเร็จ"
echo "   รันทุกวัน เวลา $TRIGGER_HOUR น."
echo "   log → $LOG_DIR/forecast_cron.log"
echo ""
echo "ตรวจสอบ:  crontab -l"
echo "ลบออก:    crontab -l | grep -v '$CRON_TAG' | crontab -"
