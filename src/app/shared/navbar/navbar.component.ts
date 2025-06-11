import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LogosImages } from '../../json/logos_images';
import { LogosTexts } from '../../json/logos_texts';

import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  constructor(private router: Router) { }
  goToHome() {
    this.router.navigate(['/home']);
  }

  goToContactForm() {
    this.router.navigate(['/contactform']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
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
}