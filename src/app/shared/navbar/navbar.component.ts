import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LogosImages } from '../../json/logos_images';
import { LogosTexts } from '../../json/logos_texts';
import { TranslationService } from '../../services/translation.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule, LanguageSwitcherComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  constructor(
    private router: Router,
    public translationService: TranslationService
  ) { }
  goToHome() {
    this.router.navigate(['/']);
  }

  goToContactForm() {
    this.router.navigate(['/contactform']);
  }

  goToExternalLogin() {
    // Przekierowanie na zewnętrzną aplikację - login
    window.open('https://app.loogos.pl/login', '_blank');
  }

  goToExternalRegister() {
    // Przekierowanie na zewnętrzną aplikację - rejestracja
    window.open('https://app.loogos.pl/register', '_blank');
  }

  logosTexts = new LogosTexts();
  logosImages = new LogosImages();
  isScrolled = false;

  ngOnInit(): void {
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  handleScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  // Check if we're on login or register page to always show background
  get shouldHaveBackground(): boolean {
    const url = this.router.url;
    return this.isScrolled || url.includes('/login') || url.includes('/register');
  }
}