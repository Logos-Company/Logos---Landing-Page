import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../services/language.service';

@Component({
    selector: 'app-language-switcher',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './language-switcher.component.html',
    styleUrl: './language-switcher.component.scss'
})
export class LanguageSwitcherComponent implements OnInit {
    currentLanguage: Language;
    languages: Language[] = [];
    isDropdownOpen = false;

    constructor(private languageService: LanguageService) {
        this.currentLanguage = this.languageService.getCurrentLanguageData();
        this.languages = this.languageService.getLanguages();
    }

    ngOnInit(): void {
        this.languageService.currentLanguage$.subscribe(langCode => {
            this.currentLanguage = this.languageService.getCurrentLanguageData();
        });
    }

    toggleDropdown(): void {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    selectLanguage(language: Language): void {
        this.languageService.setLanguage(language.code);
        this.isDropdownOpen = false;
    }

    onBlur(): void {
        // Delay to allow click on dropdown items
        setTimeout(() => {
            this.isDropdownOpen = false;
        }, 150);
    }
}