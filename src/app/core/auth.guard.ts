import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const user = this.authService.getCurrentUser();

        if (user) {
            return true;
        } else {
            // Check if trying to access admin routes
            if (state.url.startsWith('/admin')) {
                this.router.navigate(['/admin/login']);
            } else {
                this.router.navigate(['/login']);
            }
            return false;
        }
    }
}
