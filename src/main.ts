import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { CookieConsentService } from './app/services/cookie-content.service';
import posthog from 'posthog-js';

// Import the compiler to ensure JIT compilation works
import '@angular/compiler';

posthog.init(environment.posthogApiKey, {
  api_host: environment.posthogHost, // lub Twój self-hosted URL
  autocapture: true,
  capture_pageview: false // będziemy wysyłać ręcznie
});
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
