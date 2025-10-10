import { Component, VERSION } from "@angular/core";
import {
  animate,
  state,
  style,
  transition,
  trigger
} from "@angular/animations";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { LogosTexts } from "../../../json/logos_texts";
import { LogosImages } from "../../../json/logos_images";
@Component({
  selector: 'app-mobile-nav',
  imports: [CommonModule],
  templateUrl: './mobile-nav.component.html',
  styleUrl: './mobile-nav.component.scss',
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: 1,
        transform: 'scaleY(1)'
      })),
      state('closed', style({
        height: '0',
        opacity: 0,
        display: 'none',
        transform: 'scaleY(0.95)'
      })),
      transition('open <=> closed', animate('200ms ease-in-out'))
    ])
  ]
})
export class MobileNavComponent {
  name = "Angular " + VERSION.major;
  mobileMenuOpen: boolean = false;
  isScrolled = false;
  ngOnInit() {
    window.addEventListener('scroll', this.onScroll, true);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll, true);
  }

  onScroll = (): void => {
    this.isScrolled = window.scrollY > 10;
  };

  constructor(private router: Router) { }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  closeMenuAndNavigate(action: () => void) {
    this.mobileMenuOpen = false;
    action();
  }
  get openCloseTrigger() {
    return this.mobileMenuOpen ? 'open' : 'closed';
  }

  goToHome() {
    this.mobileMenuOpen = false;
    this.router.navigate(['/home']);
  }

  goToContactForm() {
    this.mobileMenuOpen = false;
    this.router.navigate(['/contactform']);
  }

  goToExternalLogin() {
    this.mobileMenuOpen = false;
    // Przekierowanie na zewnętrzną aplikację - login
    window.open('https://app.logos.pl/login', '_blank');
  }

  goToExternalRegister() {
    this.mobileMenuOpen = false;
    // Przekierowanie na zewnętrzną aplikację - rejestracja
    window.open('https://app.logos.pl/register', '_blank');
  }

  logosTexts = new LogosTexts();
  logosImages = new LogosImages();
}
