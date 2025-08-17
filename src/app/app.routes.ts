import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ModeratorDashboardComponent } from './moderator-dashboard/moderator-dashboard.component';
import { PsychologistDashboardComponent } from './psychologist-dashboard/psychologist-dashboard.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './terms-of-service/terms-of-service.component';
import { AuthGuard } from './core/auth.guard';
import { RoleGuard } from './core/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: LandingComponent },
    { path: 'contactform', component: ContactComponent },
    { path: 'login', component: LoginComponent },
    { path: 'admin/login', component: LoginComponent, data: { adminLogin: true } },
    { path: 'register', component: RegisterComponent },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'admin' }
    },
    // {
    //     path: 'admin-dashboard',
    //     component: AdminDashboardComponent,
    //     canActivate: [AuthGuard, RoleGuard],
    //     data: { expectedRole: 'admin' }
    // },
    {
        path: 'moderator-dashboard',
        component: ModeratorDashboardComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'moderator' }
    },
    {
        path: 'psychologist-dashboard',
        component: PsychologistDashboardComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { expectedRole: 'psychologist' }
    },
    { path: 'privacy-policy', component: PrivacyPolicyComponent },
    { path: 'terms-of-service', component: TermsOfServiceComponent },
];
