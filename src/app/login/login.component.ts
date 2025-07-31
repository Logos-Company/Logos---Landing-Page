import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MobileNavComponent } from '../shared/navbar/mobile-nav/mobile-nav.component';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent,
    MobileNavComponent, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;
  isAdminLogin = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  ngOnInit() {
    // Check if this is admin login
    this.isAdminLogin = this.route.snapshot.data['adminLogin'] === true;
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, remember } = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.login(email, password, remember);

      if (result.success) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          // If this is admin login, check if user has admin role
          if (this.isAdminLogin) {
            if (currentUser.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.errorMessage = 'Brak uprawnień administratora. Tylko administratorzy mogą się tutaj logować.';
              this.authService.logout();
              return;
            }
          } else {
            // Regular login - redirect to appropriate dashboard
            const dashboardRoute = this.authService.redirectToDashboard(currentUser);
            this.router.navigate([dashboardRoute]);
          }
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMessage = result.message;
      }
    } catch (error) {
      console.error('Login error:', error);
      this.errorMessage = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    } finally {
      this.isLoading = false;
    }
  }

  async onGoogleLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.loginWithGoogle();

      if (result.success) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          // If this is admin login, check if user has admin role
          if (this.isAdminLogin) {
            if (currentUser.role === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.errorMessage = 'Brak uprawnień administratora. Tylko administratorzy mogą się tutaj logować.';
              this.authService.logout();
              return;
            }
          } else {
            // Regular login - redirect to appropriate dashboard
            const dashboardRoute = this.authService.redirectToDashboard(currentUser);
            this.router.navigate([dashboardRoute]);
          }
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMessage = result.message;
      }
    } catch (error) {
      console.error('Google login error:', error);
      this.errorMessage = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
    } finally {
      this.isLoading = false;
    }
  }
}
