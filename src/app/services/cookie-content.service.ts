// src/app/services/cookie-consent.service.ts
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
    private readonly consentKey = 'cookie_consent';

    constructor(private cookie: CookieService) { }

    hasConsented(): boolean {
        return this.cookie.check(this.consentKey);
    }

    giveConsent(): void {
        // ustaw ciasteczko na 1 rok
        const expiry = new Date();
        expiry.setFullYear(expiry.getFullYear() + 1);
        this.cookie.set(this.consentKey, 'true', { expires: expiry, sameSite: 'Lax' });
    }
}
