import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtener token del almacenamiento local
  let token = localStorage.getItem('token');

  // En desarrollo, si no hay token y la URL incluye payments, usamos un token de prueba
  if (!token && !environment.production && req.url.includes('/payments/')) {
    console.log('⚠️ No hay token disponible para una ruta protegida en desarrollo, usando token simulado');
    token = 'dev_token_simulado_' + Date.now();
  }

  if (token) {
    console.log(`🔑 Añadiendo token de autenticación a: ${req.url}`);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  } else {
    console.log(`⚠️ Solicitud sin token: ${req.url}`);
  }

  return next(req);
};
