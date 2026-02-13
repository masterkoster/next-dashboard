# TailHistory Module

Search aircraft by N-Number and render a 3D timeline of key FAA registration milestones. The API is served by an Azure Function (Python v2) querying your local copy of the FAA Releasable Aircraft Database loaded into Azure SQL.

## Frontend (Next.js)
- Route: `/modules/tailhistory`
- Components: search bar + React Three Fiber timeline.
- Env var: set `NEXT_PUBLIC_TAILHISTORY_FUNCTION_URL` to the deployed Function URL, including the function key if using `function` auth.

Example:
```
NEXT_PUBLIC_TAILHISTORY_FUNCTION_URL="https://<your-app>.azurewebsites.net/api/tailhistory?code=<function-key>"
```

## Azure Function (Python v2, Functions v4, Python 3.11)
- Location: `azure-function/tailhistory/function_app.py`
- Trigger: HTTP (route `tailhistory`, GET) expecting `nNumber` query param.
- Connection string: `SQLAZURECONNSTR_AIRCRAFT_DB` (preferred) or `DATABASE_URL` for local dev.
- Requirements: see `azure-function/tailhistory/requirements.txt`.

Local settings example: `azure-function/tailhistory/local.settings.example.json`

### Notes on schema
The function selects `TOP 1 * FROM AircraftMaster` and maps fields defensively. Ensure your table contains the standard FAA Master columns (e.g., `N_NUMBER`, `AIR_WORTH_DATE`, `LAST_ACTION_DATE`, `STATUS_CODE`, `MFR`, `MODEL`, `SERIAL_NUMBER`, `ENG_MFR`, `ENGINE_MODEL`, `ENG_COUNT`, `NAME`, `TYPE_REGISTRANT`). Adjust the column names or mapping in `function_app.py` if your import uses different casing.

### Weekly ingest (not implemented here)
Implemented: timer-triggered Function downloads the FAA Releasable Aircraft Database ZIP weekly (Sunday 00:00 UTC), extracts `MASTER.txt`, and bulk upserts into `AircraftMaster`.
- Code: `azure-function/tailhistory/function_app.py` (`tailhistory_ingest_timer`).
- Schedule: `0 0 0 * * 0`.
- Dependencies: `azure-function/tailhistory/requirements.txt` (includes `requests`, `pyodbc`).
- Connection string: `SQLAZURECONNSTR_AIRCRAFT_DB` (preferred) or `DATABASE_URL`.
- Upsert strategy: batched `MERGE` with `fast_executemany`; updates owner/registrant and related fields when N_NUMBER exists, inserts otherwise.
