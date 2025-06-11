import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Firebase JS SDK (modular)
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MobileNavComponent } from '../shared/navbar/mobile-nav/mobile-nav.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent,
    FooterComponent,
    MobileNavComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  private db = getFirestore(initializeApp(environment.firebase));

  constructor(
    private fb: FormBuilder,
    private router: Router
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

    try {
      const colRef = collection(this.db, 'customers');
      const q = query(colRef,
        where('login', '==', username),
        where('password', '==', password)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        if (remember) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Nieprawidłowy login lub hasło.';
      }
    } catch (err) {
      console.error(err);
      this.errorMessage = 'Błąd logowania. Spróbuj później.';
    }
  }
}
