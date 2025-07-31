import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from '../shared/navbar/navbar.component';
import { MobileNavComponent } from '../shared/navbar/mobile-nav/mobile-nav.component';
import { AuthService } from '../core/auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, NavbarComponent, MobileNavComponent, RouterModule],
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
    registerForm: FormGroup;
    errorMessage = '';
    successMessage = '';
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService
    ) {
        this.registerForm = this.fb.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', Validators.required],
            acceptTerms: [false, Validators.requiredTrue]
        }, { validators: this.passwordMatchValidator });
    }

    // Custom validator to check if passwords match
    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');

        if (password && confirmPassword && password.value !== confirmPassword.value) {
            confirmPassword.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        } else {
            if (confirmPassword?.errors?.['passwordMismatch']) {
                delete confirmPassword.errors['passwordMismatch'];
                if (Object.keys(confirmPassword.errors).length === 0) {
                    confirmPassword.setErrors(null);
                }
            }
        }
        return null;
    }

    async onSubmit() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        const formData = this.registerForm.value;
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        try {
            const result = await this.authService.register({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (result.success) {
                this.successMessage = result.message + ' Możesz się teraz zalogować.';

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            } else {
                this.errorMessage = result.message;
            }

        } catch (error) {
            console.error('Registration error:', error);
            this.errorMessage = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
        } finally {
            this.isLoading = false;
        }
    }

    async onGoogleSignup() {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        try {
            const result = await this.authService.loginWithGoogle();

            if (result.success) {
                this.successMessage = result.message + ' Przekierowujemy do panelu...';

                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 2000);
            } else {
                this.errorMessage = result.message;
            }
        } catch (error) {
            console.error('Google signup error:', error);
            this.errorMessage = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
        } finally {
            this.isLoading = false;
        }
    }
}
