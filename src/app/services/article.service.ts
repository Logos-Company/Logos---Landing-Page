import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Article {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content?: string;
    featured_image: string | null;
    type: string;
    tags: string;
    is_featured: boolean;
    views_count: number;
    reading_time: string;
    published_at: string;
    published_at_iso: string;
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    author?: {
        id: number;
        name: string;
        photo: string | null;
    };
}

export interface ArticleDetailResponse {
    content: Article;
    related: Article[];
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    created_at: string;
    updated_at: string;
    published_content_items_count: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

export interface TermsOfService {
    id: number;
    title: string;
    content: string;
    version: string;
    effective_date: string;
    created_at: string;
    updated_at: string;
}

export interface PrivacyPolicy {
    id: number;
    title: string;
    content: string;
    version: string;
    effective_date: string;
    created_at: string;
    updated_at: string;
}

@Injectable({
    providedIn: 'root'
})
export class ArticleService {
    private apiUrl = 'https://phplaravel-1545128-5974899.cloudwaysapps.com/api/v1';

    constructor(private http: HttpClient) { }

    // Wszystkie artykuły z filtrowaniem i paginacją
    getAllArticles(params?: any): Observable<Article[]> {
        return this.http.get<ApiResponse<Article[]>>(`${this.apiUrl}/content/list`, { params })
            .pipe(map(response => response.data));
    }

    // Kategorie
    getCategories(): Observable<Category[]> {
        return this.http.get<ApiResponse<Category[]>>(`${this.apiUrl}/content/categories`)
            .pipe(map(response => response.data));
    }

    // Artykuły z konkretnej kategorii
    getArticlesByCategory(categorySlug: string, params?: any): Observable<Article[]> {
        return this.http.get<ApiResponse<Article[]>>(`${this.apiUrl}/content/category/${categorySlug}`, { params })
            .pipe(map(response => response.data));
    }

    // Szczegóły artykułu
    getArticle(id: number): Observable<{ article: Article; related: Article[] }> {
        return this.http.get<ApiResponse<ArticleDetailResponse>>(`${this.apiUrl}/content/article/${id}`)
            .pipe(map(response => ({
                article: response.data.content,
                related: response.data.related
            })));
    }

    // Regulamin
    getTermsOfService(): Observable<TermsOfService> {
        return this.http.get<ApiResponse<TermsOfService>>(`${this.apiUrl}/terms-of-service`)
            .pipe(map(response => response.data));
    }

    // Polityka prywatności
    getPrivacyPolicy(): Observable<PrivacyPolicy> {
        return this.http.get<ApiResponse<PrivacyPolicy>>(`${this.apiUrl}/privacy-policy`)
            .pipe(map(response => response.data));
    }
}