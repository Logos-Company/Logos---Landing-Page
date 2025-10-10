import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Language {
    code: string;
    name: string;
    flag: string;
}

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private currentLanguageSubject = new BehaviorSubject<string>('pl');
    public currentLanguage$ = this.currentLanguageSubject.asObservable();

    private languages: Language[] = [
        { code: 'pl', name: 'Polski', flag: '🇵🇱' },
        { code: 'en', name: 'English', flag: '🇬🇧' }
    ];

    constructor() {
        // Sprawdź zapisany język w localStorage
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage && this.isValidLanguage(savedLanguage)) {
            this.currentLanguageSubject.next(savedLanguage);
        }
    }

    getCurrentLanguage(): string {
        return this.currentLanguageSubject.value;
    }

    getLanguages(): Language[] {
        return this.languages;
    }

    getCurrentLanguageData(): Language {
        const currentLang = this.getCurrentLanguage();
        return this.languages.find(lang => lang.code === currentLang) || this.languages[0];
    }

    setLanguage(languageCode: string): void {
        if (this.isValidLanguage(languageCode)) {
            this.currentLanguageSubject.next(languageCode);
            localStorage.setItem('selectedLanguage', languageCode);

            // Reload strony z nowym językiem
            window.location.reload();
        }
    }

    private isValidLanguage(code: string): boolean {
        return this.languages.some(lang => lang.code === code);
    }
}