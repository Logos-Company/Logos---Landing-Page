import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const currentUser = this.authService.getCurrentUser();

        if (!currentUser) {
            this.router.navigate(['/login']);
            return false;
        }

        // Check for both 'roles' and 'expectedRole' for backward compatibility
        const requiredRoles = route.data['roles'] as UserRole[];
        const expectedRole = route.data['expectedRole'] as UserRole;

        if ((!requiredRoles || requiredRoles.length === 0) && !expectedRole) {
            return true; // No role restriction
        }

        // Check if user has required role
        if (expectedRole && currentUser.role === expectedRole) {
            return true;
        }

        if (requiredRoles && this.authService.hasAnyRole(requiredRoles)) {
            return true;
        }

        // User doesn't have required role, redirect based on their role
        switch (currentUser.role) {
            case 'admin':
                this.router.navigate(['/admin-dashboard']);
                break;
            case 'moderator':
                this.router.navigate(['/moderator-dashboard']);
                break;
            case 'psychologist':
                this.router.navigate(['/psychologist-dashboard']);
                break;
            case 'user':
                this.router.navigate(['/dashboard']);
                break;
            default:
                this.router.navigate(['/']);
                break;
        }

        return false;
    }
}
