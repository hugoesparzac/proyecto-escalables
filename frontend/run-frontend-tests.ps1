# Script para ejecutar las pruebas de frontend
# Abre las páginas de prueba en el navegador predeterminado

Write-Host "🧪 Iniciando pruebas de frontend..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Asegurarse de que las rutas son absolutas
$testDir = "c:\Users\hugo\Documents\ShareX\Screenshots\cafeteria-app\frontend"
$emailValidationPath = Join-Path $testDir "test-email-validation.html"
$adminDeletePath = Join-Path $testDir "test-admin-delete.html"

# Verificar que los archivos existen
if (-not (Test-Path $emailValidationPath)) {
    Write-Host "❌ No se encontró el archivo de prueba de validación de correo: $emailValidationPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $adminDeletePath)) {
    Write-Host "❌ No se encontró el archivo de prueba de eliminación de administradores: $adminDeletePath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Archivos de prueba encontrados" -ForegroundColor Green

# Abrir las páginas en el navegador predeterminado
Write-Host "🔄 Abriendo página de prueba de validación de correo..." -ForegroundColor Cyan
Start-Process $emailValidationPath

Write-Host "🔄 Abriendo página de prueba de eliminación de administradores..." -ForegroundColor Cyan
Start-Process $adminDeletePath

Write-Host "`n"
Write-Host "✅ Pruebas de frontend iniciadas. Verifica los resultados en tu navegador." -ForegroundColor Green
Write-Host "   - Para la validación de correo, observa el proceso completo desde la creación hasta la validación."
Write-Host "   - Para la eliminación de administradores, inicia sesión y prueba eliminar un administrador."
