import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AppointmentService } from '../core/appointment.service';
import { PsychologistService } from '../core/psychologist.service';
import { PackageService } from '../core/package.service';
import { User } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { Psychologist } from '../models/psychologist.model';
import { Package } from '../models/user.model';
import { CalendarComponent } from '../shared/calendar/calendar.component';
import { PsychologistSearchComponent } from '../shared/psychologist-search/psychologist-search.component';
import { PackageManagementComponent } from '../shared/package-management/package-management.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CalendarComponent,
    PsychologistSearchComponent,
    PackageManagementComponent
  ],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Dashboard Użytkownika</h1>
          <div class="header-actions">
            <span class="user-role user">UŻYTKOWNIK</span>
            <button class="logout-btn" (click)="logout()">Wyloguj</button>
          </div>
        </div>
      </header>

      <!-- Navigation -->
      <nav class="dashboard-nav">
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'overview'"
          (click)="setActiveTab('overview')"
        >
          Przegląd
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'calendar'"
          (click)="setActiveTab('calendar')"
        >
          Kalendarz
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'search'"
          (click)="setActiveTab('search')"
        >
          Znajdź psychologa
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'packages'"
          (click)="setActiveTab('packages')"
        >
          Pakiety
        </button>
      </nav>

      <!-- Loading -->
      <div class="loading-container" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Ładowanie danych...</p>
      </div>

      <!-- Main Content -->
      <main class="dashboard-content" *ngIf="!isLoading">
        
        <!-- Overview Tab -->
        <section class="overview-section" *ngIf="activeTab === 'overview'">
          <div class="welcome-card">
            <h2>Witaj, {{ currentUser?.firstName }}!</h2>
            <p>Zarządzaj swoimi wizytami i korzystaj z usług psychologicznych.</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <h3>{{ upcomingAppointments }}</h3>
                <p>Nadchodzące wizyty</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <h3>{{ completedSessions }}</h3>
                <p>Zakończone sesje</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <h3>{{ remainingCredits }}</h3>
                <p>Pozostałe kredyty</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🧠</div>
              <div class="stat-content">
                <h3>{{ assignedPsychologist?.firstName || 'Brak' }}</h3>
                <p>Przypisany psycholog</p>
              </div>
            </div>
          </div>

          <!-- Recent Appointments -->
          <div class="recent-appointments" *ngIf="recentAppointments.length > 0">
            <h3>Ostatnie wizyty</h3>
            <div class="appointments-list">
              <div 
                *ngFor="let appointment of recentAppointments" 
                class="appointment-card"
                [class]="appointment.status"
              >
                <div class="appointment-date">
                  {{ appointment.date | date:'short' }}
                </div>
                <div class="appointment-time">
                  {{ appointment.startTime }} - {{ appointment.endTime }}
                </div>
                <div class="appointment-psychologist">
                  {{ appointment.psychologistName }}
                </div>
                <div class="appointment-status">
                  {{ getStatusText(appointment.status) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h3>Szybkie akcje</h3>
            <div class="actions-grid">
              <button class="action-btn" (click)="setActiveTab('calendar')">
                <div class="action-icon">📅</div>
                <span>Umów wizytę</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('search')">
                <div class="action-icon">🔍</div>
                <span>Znajdź psychologa</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('packages')">
                <div class="action-icon">💎</div>
                <span>Kup pakiet</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Calendar Tab -->
        <section class="calendar-section" *ngIf="activeTab === 'calendar'">
          <app-calendar></app-calendar>
        </section>

        <!-- Search Tab -->
        <section class="search-section" *ngIf="activeTab === 'search'">
          <app-psychologist-search></app-psychologist-search>
        </section>

        <!-- Packages Tab -->
        <section class="packages-section" *ngIf="activeTab === 'packages'">
          <app-package-management></app-package-management>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'overview';
  isLoading = false;

  // Data
  upcomingAppointments = 0;
  completedSessions = 0;
  remainingCredits = 0;
  assignedPsychologist: Psychologist | null = null;
  currentPackage: Package | null = null;
  recentAppointments: Appointment[] = [];

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private psychologistService: PsychologistService,
    private packageService: PackageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Redirect if user has specific role
    if (this.currentUser.role !== 'user') {
      const dashboardRoute = this.authService.redirectToDashboard(this.currentUser);
      this.router.navigate([dashboardRoute]);
      return;
    }

    this.loadDashboardData();
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      if (this.currentUser) {
        // Load user's appointments
        const appointments = await this.appointmentService.getUserAppointments(this.currentUser.id);

        // Calculate stats
        const now = new Date();
        this.upcomingAppointments = appointments.filter(apt =>
          new Date(apt.date) > now && apt.status === 'scheduled'
        ).length;

        this.completedSessions = appointments.filter(apt =>
          apt.status === 'completed'
        ).length;

        this.recentAppointments = appointments
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        // Load assigned psychologist if exists
        if (this.currentUser.assignedPsychologistId) {
          this.assignedPsychologist = await this.psychologistService.getPsychologist(
            this.currentUser.assignedPsychologistId
          );
        }

        // Load current package
        if (this.currentUser.activePackageId) {
          this.currentPackage = await this.packageService.getPackage(
            this.currentUser.activePackageId
          );
          this.remainingCredits = this.currentPackage?.remainingCredits || 0;
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logout();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'scheduled': return 'Zaplanowana';
      case 'completed': return 'Zakończona';
      case 'cancelled': return 'Anulowana';
      case 'no-show': return 'Niestawiennictwo';
      default: return status;
    }
  }
}
