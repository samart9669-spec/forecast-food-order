import gspread
from google.oauth2.service_account import Credentials
from src.config import CREDENTIALS_FILE

_SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

_client: gspread.Client | None = None


def get_client() -> gspread.Client:
    """Return a cached gspread client authenticated via service account."""
    global _client
    if _client is None:
        creds = Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=_SCOPES)
        _client = gspread.authorize(creds)
    return _client


def open_spreadsheet(spreadsheet_id: str) -> gspread.Spreadsheet:
    return get_client().open_by_key(spreadsheet_id)
