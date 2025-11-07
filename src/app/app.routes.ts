import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { ContactComponent } from './contact/contact.component';
import { LegalDocumentsComponent } from './legal-documents/legal-documents.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'articles', component: ArticlesComponent },
    { path: 'article/:id', component: ArticleDetailComponent },
    { path: 'category/:slug', component: ArticlesComponent },
    { path: 'contactform', component: ContactComponent },
    { path: 'legal', component: LegalDocumentsComponent },
    { path: 'privacy-policy', redirectTo: 'legal#privacy-policy', pathMatch: 'full' },
    { path: 'terms-of-service', redirectTo: 'legal#terms-of-service', pathMatch: 'full' },
];
