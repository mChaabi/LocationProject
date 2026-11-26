import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const adminGuard: CanActivateFn = () =>
  inject(AuthService).isAdmin() || inject(Router).createUrlTree(['/login']);

export const authGuard: CanActivateFn = () =>
  inject(AuthService).currentUser() ? true : inject(Router).createUrlTree(['/login']);