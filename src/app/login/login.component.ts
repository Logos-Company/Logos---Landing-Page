import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      remember: [false]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { username, password, remember } = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const result = await this.authService.login(username, password, remember);

      if (result.success) {
        this.router.navigate(['/dashboard']);
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
}
