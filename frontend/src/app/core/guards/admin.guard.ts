import { CanActivateFn } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    window.location.href = '/login';
    return false;
  }
  try {
    const user = JSON.parse(userStr);
    if (user.rol === 'admin' && user.validada) {
      return true;
    } else {
      window.location.href = '/';
      return false;
    }
  } catch {
    window.location.href = '/login';
    return false;
  }
};
