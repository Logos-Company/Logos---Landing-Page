import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        // Check if we have a stored user first
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user && user.id) {
                    // Update the auth service with stored user
                    this.authService.setCurrentUser(user);
                    return true;
                }
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }

        // If no stored user, check current user from service
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
