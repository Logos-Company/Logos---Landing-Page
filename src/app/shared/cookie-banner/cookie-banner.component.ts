import { Component } from '@angular/core';
import { CookieConsentService } from '../../services/cookie-content.service';
@Component({
  selector: 'app-cookie-banner',
  imports: [],
  templateUrl: './cookie-banner.component.html',
  styleUrl: './cookie-banner.component.scss'
})
export class CookieBannerComponent {
  constructor(private consent: CookieConsentService) { }

  accept() {
    this.consent.giveConsent();
  }
}
