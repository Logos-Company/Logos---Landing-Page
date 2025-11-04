import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { ContactComponent } from './contact/contact.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { ArticleDetailComponent } from './pages/article-detail/article-detail.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'articles', component: ArticlesComponent },
    { path: 'article/:id', component: ArticleDetailComponent },
    { path: 'category/:slug', component: ArticlesComponent },
    { path: 'contactform', component: ContactComponent },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: 'terms-of-service', component: TermsOfServiceComponent },
];
