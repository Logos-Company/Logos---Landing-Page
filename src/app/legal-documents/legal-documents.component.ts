import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { MobileNavComponent } from '../shared/navbar/mobile-nav/mobile-nav.component';
import { ArticleService, TermsOfService, PrivacyPolicy } from '../services/article.service';

@Component({
    selector: 'app-legal-documents',
    imports: [
        CommonModule,
        NavbarComponent,
        FooterComponent,
        MobileNavComponent
    ],
    templateUrl: './legal-documents.component.html',
    styleUrl: './legal-documents.component.scss'
})
export class LegalDocumentsComponent implements OnInit, AfterViewInit {
    termsOfService: TermsOfService | null = null;
    privacyPolicy: PrivacyPolicy | null = null;
    isLoadingTerms = true;
    isLoadingPrivacy = true;
    termsError: string | null = null;
    privacyError: string | null = null;

    constructor(
        private articleService: ArticleService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.loadTermsOfService();
        this.loadPrivacyPolicy();
    }

    ngAfterViewInit(): void {
        // Handle fragment navigation
        this.route.fragment.subscribe(fragment => {
            if (fragment) {
                setTimeout(() => {
                    const element = document.getElementById(fragment);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        });
    }

    private loadTermsOfService(): void {
        this.articleService.getTermsOfService().subscribe({
            next: (data) => {
                this.termsOfService = data;
                this.isLoadingTerms = false;
            },
            error: (err) => {
                this.termsError = 'Błąd podczas ładowania regulaminu';
                this.isLoadingTerms = false;
                console.error('Error loading terms of service:', err);
            }
        });
    }

    private loadPrivacyPolicy(): void {
        this.articleService.getPrivacyPolicy().subscribe({
            next: (data) => {
                this.privacyPolicy = data;
                this.isLoadingPrivacy = false;
            },
            error: (err) => {
                this.privacyError = 'Błąd podczas ładowania polityki prywatności';
                this.isLoadingPrivacy = false;
                console.error('Error loading privacy policy:', err);
            }
        });
    }

    get isLoading(): boolean {
        return this.isLoadingTerms || this.isLoadingPrivacy;
    }

    get hasErrors(): boolean {
        return !!(this.termsError || this.privacyError);
    }
}