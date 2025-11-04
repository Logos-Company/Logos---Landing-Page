import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ArticleService, Article, Category } from '../../services/article.service';
import { TranslationService } from '../../services/translation.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { MobileNavComponent } from '../../shared/navbar/mobile-nav/mobile-nav.component';
import { LoadingSpinnerComponent } from '../../shared/loading-spinner/loading-spinner.component';

@Component({
    selector: 'app-articles',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        NavbarComponent,
        FooterComponent,
        MobileNavComponent,
        LoadingSpinnerComponent
    ],
    templateUrl: './articles.component.html',
    styleUrl: './articles.component.scss'
})
export class ArticlesComponent implements OnInit {
    articles: Article[] = [];
    categories: Category[] = [];
    selectedCategory: string | null = null;
    isLoading = false;
    error: string | null = null;

    constructor(
        private articleService: ArticleService,
        public translationService: TranslationService,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.loadCategories();

        // Check if we're on a category page
        this.route.params.subscribe(params => {
            if (params['slug']) {
                this.selectedCategory = params['slug'];
                this.loadArticlesByCategory(params['slug']);
            } else {
                this.selectedCategory = null;
                this.loadAllArticles();
            }
        });
    }

    loadAllArticles(): void {
        this.isLoading = true;
        this.error = null;

        this.articleService.getAllArticles().subscribe({
            next: (articles) => {
                this.articles = articles;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = 'Błąd podczas ładowania artykułów';
                this.isLoading = false;
                console.error('Error loading articles:', error);
            }
        });
    }

    loadArticlesByCategory(categorySlug: string): void {
        this.isLoading = true;
        this.error = null;

        this.articleService.getArticlesByCategory(categorySlug).subscribe({
            next: (articles) => {
                this.articles = articles;
                this.isLoading = false;
            },
            error: (error) => {
                this.error = 'Błąd podczas ładowania artykułów z kategorii';
                this.isLoading = false;
                console.error('Error loading category articles:', error);
            }
        });
    }

    loadCategories(): void {
        this.articleService.getCategories().subscribe({
            next: (categories) => {
                this.categories = categories;
            },
            error: (error) => {
                console.error('Error loading categories:', error);
            }
        });
    }

    onCategorySelect(categorySlug: string | null): void {
        this.selectedCategory = categorySlug;

        if (categorySlug) {
            this.loadArticlesByCategory(categorySlug);
        } else {
            this.loadAllArticles();
        }
    }

    formatDate(dateString: string): string {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
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

    getExcerpt(content: string, maxLength: number = 150): string {
        if (!content) return '';
        return content.length > maxLength
            ? content.substring(0, maxLength) + '...'
            : content;
    }
}