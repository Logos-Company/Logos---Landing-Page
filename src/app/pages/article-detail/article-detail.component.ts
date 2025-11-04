import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ArticleService, Article } from '../../services/article.service';
import { TranslationService } from '../../services/translation.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MobileNavComponent } from '../../shared/navbar/mobile-nav/mobile-nav.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
    selector: 'app-article-detail',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NavbarComponent,
        FooterComponent,
        MobileNavComponent,
        LoadingSpinnerComponent
    ],
    templateUrl: './article-detail.component.html',
    styleUrl: './article-detail.component.scss'
})
export class ArticleDetailComponent implements OnInit {
    article: Article | null = null;
    relatedArticles: Article[] = [];
    isLoading = false;
    error: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private articleService: ArticleService,
        public translationService: TranslationService,
        private meta: Meta,
        private titleService: Title
    ) { }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            const articleId = +params['id'];
            if (articleId) {
                this.loadArticle(articleId);
            }
        });
    }

    loadArticle(id: number): void {
        this.isLoading = true;
        this.error = null;

        this.articleService.getArticle(id).subscribe({
            next: (response) => {
                this.article = response.article;
                this.relatedArticles = response.related;
                this.isLoading = false;
                this.updateMetaTags();
            },
            error: (error) => {
                this.error = 'Nie udało się załadować artykułu';
                this.isLoading = false;
                console.error('Error loading article:', error);
            }
        });
    }

    updateMetaTags(): void {
        if (this.article) {
            this.titleService.setTitle(`${this.article.title} - Loogos`);
            this.meta.updateTag({ name: 'description', content: this.article.excerpt });
            this.meta.updateTag({ property: 'og:title', content: this.article.title });
            this.meta.updateTag({ property: 'og:description', content: this.article.excerpt });
            if (this.article.featured_image) {
                this.meta.updateTag({ property: 'og:image', content: this.article.featured_image });
            }
            this.meta.updateTag({ property: 'og:type', content: 'article' });
        }
    }

    formatDate(dateString: string): string {
        // Używamy published_at_iso dla poprawnego parsowania
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                // Jeśli ISO nie działa, użyj published_at
                return dateString;
            }
            return date.toLocaleDateString('pl-PL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    goToCategory(categorySlug: string): void {
        this.router.navigate(['/category', categorySlug]);
    }

    goBackToArticles(): void {
        this.router.navigate(['/articles']);
    }

    shareArticle(): void {
        if (navigator.share && this.article) {
            navigator.share({
                title: this.article.title,
                text: this.article.excerpt,
                url: window.location.href
            });
        } else {
            // Fallback - copy URL to clipboard
            navigator.clipboard.writeText(window.location.href);
            // You could show a toast notification here
        }
    }
}