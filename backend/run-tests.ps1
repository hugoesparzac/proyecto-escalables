# Script para ejecutar las pruebas de validación de correo y eliminación de administradores

Write-Host "🧪 Ejecutando pruebas de validación de correo electrónico..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

try {
    node test-email-validation.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prueba de validación de correo completada correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Prueba de validación de correo falló con código de salida $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al ejecutar la prueba de validación de correo: $_" -ForegroundColor Red
}

Write-Host "`n"
Write-Host "🧪 Ejecutando pruebas de eliminación de administradores..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

try {
    node test-admin-delete.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prueba de eliminación de administradores completada correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Prueba de eliminación de administradores falló con código de salida $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al ejecutar la prueba de eliminación de administradores: $_" -ForegroundColor Red
}

Write-Host "`n"
Write-Host "🧪 Ejecutando pruebas de registro de usuario..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

try {
    node test-register.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prueba de registro de usuario completada correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Prueba de registro de usuario falló con código de salida $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al ejecutar la prueba de registro de usuario: $_" -ForegroundColor Red
}

Write-Host "`n"
Write-Host "🧪 Ejecutando prueba de registro e inicio de sesión..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

try {
    node test-register-login.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Prueba de registro e inicio de sesión completada correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Prueba de registro e inicio de sesión falló con código de salida $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al ejecutar la prueba de registro e inicio de sesión: $_" -ForegroundColor Red
}

Write-Host "`n"
Write-Host "🔄 Pruebas finalizadas" -ForegroundColor Cyan
