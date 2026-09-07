# Backend'i başlat
Write-Host "Backend baslatiliyor..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python manage.py runserver"

# Frontend'i başlat
Write-Host "Frontend baslatiliyor..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
