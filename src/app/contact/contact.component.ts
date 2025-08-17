import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MobileNavComponent } from '../shared/navbar/mobile-nav/mobile-nav.component';
import { LogosImages } from "../json/logos_images";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent, MobileNavComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  logosImages = new LogosImages();
  contactForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: [''],
      message: [''],
      privacyAccepted: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;

      console.log('Form submitted:', this.contactForm.value);

      // Symulacja wysyłania
      setTimeout(() => {
        alert('Wiadomość została wysłana! Skontaktujemy się z Tobą wkrótce.');
        this.contactForm.reset();
        this.isSubmitting = false;
      }, 1500);
    } else {
      this.contactForm.markAllAsTouched();
    }
  }
}
