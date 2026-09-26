@echo off
echo ========================================================
echo Starting TrustFace AI Backend Service (FastAPI / PyTorch)
echo ========================================================
call .\venv\Scripts\activate
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
