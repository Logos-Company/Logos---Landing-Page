import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieConsentService } from './services/cookie-content.service';
import { Router, NavigationEnd } from '@angular/router';
import { AnalyticsService } from './services/analytics.service';
import { CookieBannerComponent } from './shared/cookie-banner/cookie-banner.component'; // <-- tu
import { CommonModule } from '@angular/common'; // <-- dodaj CommonModule
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CookieBannerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'loogos';
  constructor(public cookieConsent: CookieConsentService, router: Router, analytics: AnalyticsService) {
    router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        analytics.pageView(evt.urlAfterRedirects);
      }
    });
  }

}
