import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AdminService, AdminStats, SystemActivity, Review, LiveAnalytics } from '../core/admin.service';
import { PsychologistService } from '../core/psychologist.service';
import { User } from '../models/user.model';
import { Psychologist } from '../models/psychologist.model';
import { ContractTemplate } from '../models/contract.model';
import { NotificationTemplate } from '../models/notification.model';
import { SystemUpgrade, SystemConfiguration, BackupInfo } from '../models/system.model';
import { Report } from '../models/report.model';
import { CrmIntegration } from '../models/crm.model';
import { Subscription, interval } from 'rxjs';
import { ChartService } from '../services/chart.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Panel Administratora</h1>
          <div class="header-actions">
            <span class="user-role admin">ADMINISTRATOR</span>
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
          [class.active]="activeTab === 'users'"
          (click)="setActiveTab('users')"
        >
          Użytkownicy
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'psychologists'"
          (click)="setActiveTab('psychologists')"
        >
          Psycholodzy
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'analytics'"
          (click)="setActiveTab('analytics')"
        >
          Analityka
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'reviews'"
          (click)="setActiveTab('reviews')"
        >
          Opinie
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'contracts'"
          (click)="setActiveTab('contracts')"
        >
          Wzory umów
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'notifications'"
          (click)="setActiveTab('notifications')"
        >
          Powiadomienia
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'live-analytics'"
          (click)="setActiveTab('live-analytics')"
        >
          Analityka Live
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'crm'"
          (click)="setActiveTab('crm')"
        >
          CRM
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'posthog'"
          (click)="setActiveTab('posthog')"
        >
          PostHog
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'reports'"
          (click)="setActiveTab('reports')"
        >
          Raporty
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'upgrades'"
          (click)="setActiveTab('upgrades')"
        >
          Ulepszenia
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'settings'"
          (click)="setActiveTab('settings')"
        >
          Ustawienia
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
          <div class="stats-grid">
            <div class="stat-card users">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <h3>{{ totalUsers }}</h3>
                <p>Łączna liczba użytkowników</p>
                <small>+{{ newUsersThisMonth }} w tym miesiącu</small>
              </div>
            </div>
            
            <div class="stat-card psychologists">
              <div class="stat-icon">🧠</div>
              <div class="stat-content">
                <h3>{{ totalPsychologists }}</h3>
                <p>Aktywni psycholodzy</p>
                <small>{{ pendingPsychologists }} oczekuje na weryfikację</small>
              </div>
            </div>
            
            <div class="stat-card revenue">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <h3>{{ totalRevenue | currency:'PLN':'symbol':'1.0-0' }}</h3>
                <p>Łączny przychód</p>
                <small>{{ monthlyRevenue | currency:'PLN':'symbol':'1.0-0' }} w tym miesiącu</small>
              </div>
            </div>
            
            <div class="stat-card sessions">
              <div class="stat-icon">📊</div>
              <div class="stat-content">
                <h3>{{ totalSessions }}</h3>
                <p>Przeprowadzone sesje</p>
                <small>{{ sessionsThisMonth }} w tym miesiącu</small>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="recent-activity">
            <h3>Ostatnia aktywność</h3>
            <div class="activity-list">
              <div *ngFor="let activity of recentActivities" class="activity-item">
                <div class="activity-icon" [class]="activity.type">
                  {{ getActivityIcon(activity.type) }}
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ activity.message }}</p>
                  <small class="activity-time">{{ activity.timestamp | date:'short' }}</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Users Tab -->
        <section class="users-section" *ngIf="activeTab === 'users'">
          <div class="section-header">
            <h3>Zarządzanie użytkownikami</h3>
            <div class="header-actions">
              <input 
                type="text" 
                placeholder="Szukaj użytkowników..." 
                [(ngModel)]="userSearchTerm"
                (input)="filterUsers()"
                class="search-input"
              >
              <select [(ngModel)]="userRoleFilter" (change)="filterUsers()">
                <option value="">Wszystkie role</option>
                <option value="user">Użytkownik</option>
                <option value="psychologist">Psycholog</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div class="users-table">
            <div class="table-header">
              <div class="col">Użytkownik</div>
              <div class="col">Email</div>
              <div class="col">Rola</div>
              <div class="col">Status</div>
              <div class="col">Data rejestracji</div>
              <div class="col">Akcje</div>
            </div>
            
            <div *ngFor="let user of filteredUsers" class="table-row">
              <div class="col">
                <div class="user-info">
                  <div class="user-avatar">{{ getUserInitials(user) }}</div>
                  <div class="user-details">
                    <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
                  </div>
                </div>
              </div>
              <div class="col">{{ user.email }}</div>
              <div class="col">
                <span class="role-badge" [class]="user.role">{{ getRoleText(user.role) }}</span>
              </div>
              <div class="col">
                <span class="status-badge" [class.active]="user.isActive">
                  {{ user.isActive ? 'Aktywny' : 'Nieaktywny' }}
                </span>
              </div>
              <div class="col">{{ user.createdAt | date:'short' }}</div>
              <div class="col">
                <div class="user-actions">
                  <button class="btn btn-sm btn-primary" (click)="editUser(user)">
                    Edytuj
                  </button>
                  <button 
                    class="btn btn-sm" 
                    [class.btn-danger]="user.isActive"
                    [class.btn-secondary]="!user.isActive"
                    (click)="toggleUserStatus(user)"
                  >
                    {{ user.isActive ? 'Dezaktywuj' : 'Aktywuj' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Psychologists Tab -->
        <section class="psychologists-section" *ngIf="activeTab === 'psychologists'">
          <div class="section-header">
            <h3>Zarządzanie psychologami</h3>
            <button class="btn btn-primary" (click)="showAddPsychologistModal = true">
              Dodaj psychologa
            </button>
          </div>

          <div class="psychologists-grid">
            <div *ngFor="let psychologist of psychologists" class="psychologist-card">
              <div class="psychologist-header">
                <div class="psychologist-avatar">
                  <img [src]="psychologist.profileImage || '/assets/default-psychologist.png'" 
                       [alt]="psychologist.firstName + ' ' + psychologist.lastName">
                </div>
                <div class="psychologist-info">
                  <h4>{{ psychologist.firstName }} {{ psychologist.lastName }}</h4>
                  <p class="specializations">{{ psychologist.specializations.join(', ') }}</p>
                  <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span class="rating-value">{{ psychologist.rating }}/5</span>
                    <span class="reviews-count">({{ psychologist.reviewCount }} opinii)</span>
                  </div>
                </div>
              </div>
              
              <div class="psychologist-stats">
                <div class="stat">
                  <span class="label">Sesje:</span>
                  <span class="value">{{ psychologist.completedSessions || psychologist.totalSessions || 0 }}</span>
                </div>
                <div class="stat">
                  <span class="label">Przychód:</span>
                  <span class="value">{{ (psychologist.totalRevenue || 0) | currency:'PLN':'symbol':'1.0-0' }}</span>
                </div>
                <div class="stat">
                  <span class="label">Status:</span>
                  <span class="value" [class.active]="psychologist.isActive">
                    {{ psychologist.isActive ? 'Aktywny' : 'Nieaktywny' }}
                  </span>
                </div>
              </div>
              
              <div class="psychologist-actions">
                <button class="btn btn-sm btn-secondary" (click)="viewPsychologistDetails(psychologist)">
                  Szczegóły
                </button>
                <button class="btn btn-sm btn-primary" (click)="editPsychologist(psychologist)">
                  Edytuj
                </button>
                <button 
                  class="btn btn-sm"
                  [class.btn-danger]="psychologist.isActive"
                  [class.btn-success]="!psychologist.isActive"
                  (click)="togglePsychologistStatus(psychologist)"
                >
                  {{ psychologist.isActive ? 'Dezaktywuj' : 'Aktywuj' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Analytics Tab -->
        <section class="analytics-section" *ngIf="activeTab === 'analytics'">
          <div class="analytics-grid">
            <div class="chart-container">
              <h4>Rejestracje użytkowników</h4>
              <div class="chart-wrapper">
                <canvas #userRegistrationsChart width="400" height="200"></canvas>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Przychody</h4>
              <div class="chart-wrapper">
                <canvas #revenueChart width="400" height="200"></canvas>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Aktywność sesji</h4>
              <div class="chart-wrapper">
                <canvas #sessionsChart width="400" height="200"></canvas>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Najpopularniejsi psycholodzy</h4>
              <div class="chart-wrapper">
                <canvas #psychologistsChart width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </section>

        <!-- Reviews Management Tab -->
        <section class="reviews-section" *ngIf="activeTab === 'reviews'">
          <div class="section-header">
            <h3>Zarządzanie opiniami</h3>
            <div class="header-actions">
              <select [(ngModel)]="reviewStatusFilter" (change)="filterReviews()">
                <option value="">Wszystkie statusy</option>
                <option value="pending">Oczekujące</option>
                <option value="approved">Zatwierdzone</option>
                <option value="rejected">Odrzucone</option>
                <option value="flagged">Oflagowane</option>
              </select>
              <button class="btn btn-secondary" (click)="loadReviews()">
                Odśwież
              </button>
            </div>
          </div>

          <div class="reviews-list">
            <div *ngFor="let review of filteredReviews" class="review-item">
              <div class="review-header">
                <div class="review-rating">
                  <span class="stars">{{ getStarsDisplay(review.rating) }}</span>
                  <span class="rating-value">{{ review.rating }}/5</span>
                </div>
                <div class="review-status">
                  <span class="status-badge" [class]="review.status">{{ getStatusText(review.status) }}</span>
                </div>
                <div class="review-date">
                  {{ review.createdAt | date:'short' }}
                </div>
              </div>
              
              <div class="review-content">
                <div class="review-participants">
                  <p><strong>Pacjent:</strong> 
                    {{ review.isAnonymous ? 'Anonimowy' : (review.userInfo?.firstName + ' ' + review.userInfo?.lastName) }}
                  </p>
                  <p><strong>Psycholog:</strong> 
                    {{ review.psychologistInfo?.firstName + ' ' + review.psychologistInfo?.lastName }}
                  </p>
                </div>
                
                <div class="review-comment">
                  <p>{{ review.comment }}</p>
                </div>
                
                <div class="review-actions" *ngIf="review.status === 'pending'">
                  <button class="btn btn-sm btn-success" (click)="moderateReview(review.id, 'approve')">
                    Zatwierdź
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="moderateReview(review.id, 'reject')">
                    Odrzuć
                  </button>
                  <button class="btn btn-sm btn-warning" (click)="flagReview(review.id)">
                    Oflaguj
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Live Analytics Tab -->
        <section class="live-analytics-section" *ngIf="activeTab === 'live-analytics'">
          <div class="section-header">
            <h3>Analityka w czasie rzeczywistym</h3>
            <div class="last-update">
              Ostatnia aktualizacja: {{ lastAnalyticsUpdate | date:'medium' }}
            </div>
          </div>

          <div class="live-stats-grid" *ngIf="liveAnalytics">
            <div class="live-stat-card">
              <h4>Obecni użytkownicy</h4>
              <div class="stat-value large">{{ liveAnalytics.currentVisitors }}</div>
            </div>
            
            <div class="live-stat-card">
              <h4>Wyświetlenia stron</h4>
              <div class="stat-value">{{ liveAnalytics.pageViews }}</div>
            </div>
            
            <div class="live-stat-card">
              <h4>Unikalni odwiedzający</h4>
              <div class="stat-value">{{ liveAnalytics.uniqueVisitors }}</div>
            </div>
            
            <div class="live-stat-card">
              <h4>Współczynnik odrzuceń</h4>
              <div class="stat-value">{{ liveAnalytics.bounceRate | number:'1.1-1' }}%</div>
            </div>
          </div>

          <div class="analytics-panels">
            <div class="panel">
              <h4>Najpopularniejsze strony</h4>
              <div class="top-pages">
                <div *ngFor="let page of liveAnalytics?.topPages" class="page-item">
                  <span class="page-path">{{ page.page }}</span>
                  <span class="page-views">{{ page.views }}</span>
                </div>
              </div>
            </div>
            
            <div class="panel">
              <h4>Aktywność użytkowników</h4>
              <div class="user-actions">
                <div class="action-item">
                  <span>Kliknięcia:</span>
                  <span>{{ liveAnalytics?.userActions?.clicks || 0 }}</span>
                </div>
                <div class="action-item">
                  <span>Przesłane formularze:</span>
                  <span>{{ liveAnalytics?.userActions?.formSubmissions || 0 }}</span>
                </div>
                <div class="action-item">
                  <span>Kliknięcia przycisków:</span>
                  <span>{{ liveAnalytics?.userActions?.buttonClicks || 0 }}</span>
                </div>
              </div>
            </div>
            
            <div class="panel">
              <h4>Wydarzenia w czasie rzeczywistym</h4>
              <div class="real-time-events">
                <div *ngFor="let event of liveAnalytics?.realTimeEvents" class="event-item">
                  <span class="event-time">{{ event.timestamp | date:'HH:mm:ss' }}</span>
                  <span class="event-type">{{ event.event }}</span>
                  <span class="event-page">{{ event.page }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Notifications Tab -->
        <section class="notifications-section" *ngIf="activeTab === 'notifications'">
          <div class="section-header">
            <h3>Centrum powiadomień</h3>
            <button class="btn btn-primary" (click)="showNotificationModal = true">
              Nowe powiadomienie
            </button>
          </div>

          <div class="notification-stats">
            <div class="stat-item">
              <span class="label">Wysłane dzisiaj:</span>
              <span class="value">{{ notificationStats.sentToday }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Oczekujące:</span>
              <span class="value">{{ notificationStats.pending }}</span>
            </div>
            <div class="stat-item">
              <span class="label">Zaplanowane:</span>
              <span class="value">{{ notificationStats.scheduled }}</span>
            </div>
          </div>

          <div class="notification-templates">
            <h4>Szybkie szablony</h4>
            <div class="template-buttons">
              <button class="btn btn-outline-primary" (click)="useTemplate('welcome')">
                Powitalny
              </button>
              <button class="btn btn-outline-primary" (click)="useTemplate('reminder')">
                Przypomnienie o sesji
              </button>
              <button class="btn btn-outline-primary" (click)="useTemplate('maintenance')">
                Konserwacja systemu
              </button>
              <button class="btn btn-outline-primary" (click)="useTemplate('promotion')">
                Promocja
              </button>
            </div>
          </div>
        </section>

        <!-- Contracts Tab -->
        <section class="contracts-section" *ngIf="activeTab === 'contracts'">
          <div class="section-header">
            <h3>Wzory umów</h3>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="showContractModal = true">
                Nowy szablon
              </button>
              <button class="btn btn-secondary" (click)="exportContracts()">
                Eksportuj wszystkie
              </button>
            </div>
          </div>

          <div class="contracts-grid">
            <div *ngFor="let template of contractTemplates" class="contract-card">
              <div class="contract-header">
                <h4>{{ template.name }}</h4>
                <span class="contract-type">{{ template.type }}</span>
              </div>
              
              <div class="contract-info">
                <p>Pola: {{ template.fields.length }}</p>
                <p class="status" [class.active]="template.isActive">
                  {{ template.isActive ? 'Aktywny' : 'Nieaktywny' }}
                </p>
              </div>
              
              <div class="contract-actions">
                <button class="btn btn-sm btn-primary" (click)="editContract(template)">
                  Edytuj
                </button>
                <button class="btn btn-sm btn-secondary" (click)="generateContract(template)">
                  Generuj PDF
                </button>
                <button 
                  class="btn btn-sm"
                  [class.btn-danger]="template.isActive"
                  [class.btn-success]="!template.isActive"
                  (click)="toggleContractStatus(template)"
                >
                  {{ template.isActive ? 'Dezaktywuj' : 'Aktywuj' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- CRM Tab -->
        <section class="crm-section" *ngIf="activeTab === 'crm'">
          <div class="section-header">
            <h3>Integracja z CRM</h3>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="syncWithLivespace()">
                Synchronizuj z Livespace
              </button>
            </div>
          </div>

          <div class="crm-actions-grid">
            <div class="action-card" (click)="importContactsFromCrm()">
              <div class="action-icon">📥</div>
              <h4>Import kontaktów</h4>
              <p>Importuj kontakty z CRM</p>
            </div>
            
            <div class="action-card" (click)="exportContactsToCrm()">
              <div class="action-icon">📤</div>
              <h4>Eksport kontaktów</h4>
              <p>Wyślij dane do CRM</p>
            </div>
            
            <div class="action-card" (click)="syncAppointments()">
              <div class="action-icon">📅</div>
              <h4>Synchronizuj wizyty</h4>
              <p>Aktualizuj kalendarz</p>
            </div>
            
            <div class="action-card" (click)="configureCrmSettings()">
              <div class="action-icon">⚙️</div>
              <h4>Ustawienia CRM</h4>
              <p>Konfiguruj integrację</p>
            </div>
          </div>
        </section>

        <!-- PostHog Tab -->
        <section class="posthog-section" *ngIf="activeTab === 'posthog'">
          <div class="section-header">
            <h3>PostHog Analytics</h3>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="openPostHog()">
                Otwórz PostHog
              </button>
              <button class="btn btn-secondary" (click)="syncPostHog()">
                Synchronizuj dane
              </button>
            </div>
          </div>

          <div class="posthog-integration">
            <div class="integration-status connected">
              <div class="status-indicator">✅</div>
              <span>Połączono z PostHog</span>
            </div>
            
            <div class="analytics-preview">
              <h4>Podgląd analityki:</h4>
              <div class="analytics-stats">
                <div class="stat-item">
                  <span class="label">Aktywni użytkownicy:</span>
                  <span class="value">{{ liveAnalytics?.currentVisitors || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Wyświetlenia stron:</span>
                  <span class="value">{{ liveAnalytics?.pageViews || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Współczynnik odrzuceń:</span>
                  <span class="value">{{ (liveAnalytics?.bounceRate || 0) | number:'1.1-1' }}%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Reports Tab -->
        <section class="reports-section" *ngIf="activeTab === 'reports'">
          <div class="section-header">
            <h3>Generowanie raportów</h3>
          </div>

          <div class="reports-grid">
            <div class="report-card" (click)="generateUserReport()">
              <div class="report-icon">👥</div>
              <h4>Raport użytkowników</h4>
              <p>Aktywność i statystyki użytkowników</p>
              <button class="btn btn-primary">Generuj raport</button>
            </div>
            
            <div class="report-card" (click)="generateRevenueReport()">
              <div class="report-icon">💰</div>
              <h4>Raport przychodów</h4>
              <p>Analiza finansowa i przychody</p>
              <button class="btn btn-primary">Generuj raport</button>
            </div>
            
            <div class="report-card" (click)="generateSessionsReport()">
              <div class="report-icon">📊</div>
              <h4>Raport sesji</h4>
              <p>Statystyki sesji psychologicznych</p>
              <button class="btn btn-primary">Generuj raport</button>
            </div>
          </div>
        </section>

        <!-- Upgrades Tab -->
        <section class="upgrades-section" *ngIf="activeTab === 'upgrades'">
          <div class="section-header">
            <h3>Ulepszenia systemu</h3>
            <button class="btn btn-secondary" (click)="loadSystemUpgrades()">
              Odśwież listę
            </button>
          </div>

          <div class="upgrades-list">
            <div *ngFor="let upgrade of systemUpgrades" class="upgrade-item">
              <div class="upgrade-info">
                <h4>{{ upgrade.name }}</h4>
                <p>{{ upgrade.description }}</p>
                <div class="upgrade-meta">
                  <span class="version">v{{ upgrade.version }}</span>
                  <span class="type">{{ upgrade.type }}</span>
                  <span class="status" [class]="upgrade.status">{{ upgrade.status }}</span>
                </div>
              </div>
              <div class="upgrade-actions">
                <button 
                  *ngIf="upgrade.status === 'available'"
                  class="btn btn-primary"
                  (click)="installUpgrade(upgrade.id)"
                >
                  Zainstaluj
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Settings Tab -->
        <section class="settings-section" *ngIf="activeTab === 'settings'">
          <div class="section-header">
            <h3>Konfiguracja systemu</h3>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="createBackup()">
                Utwórz backup
              </button>
              <button class="btn btn-secondary" (click)="loadSystemConfiguration()">
                Odśwież konfigurację
              </button>
            </div>
          </div>

          <div class="config-sections">
            <div class="config-category" *ngFor="let category of getConfigCategories()">
              <h4>{{ category }}</h4>
              <div class="config-items">
                <div *ngFor="let config of getConfigsByCategory(category)" class="config-item">
                  <label>{{ config.description }}</label>
                  <input 
                    *ngIf="!config.isSecret"
                    type="text" 
                    [(ngModel)]="config.value"
                    (blur)="updateConfiguration(config)"
                  >
                  <input 
                    *ngIf="config.isSecret"
                    type="password" 
                    value="***"
                    readonly
                  >
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Add Psychologist Modal -->
      <div class="modal" *ngIf="showAddPsychologistModal" (click)="closeAddPsychologistModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Dodaj nowego psychologa</h3>
            <button class="close-btn" (click)="closeAddPsychologistModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="addPsychologist()" #psychologistForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Imię:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newPsychologist.firstName" 
                    name="firstName" 
                    required
                  >
                </div>
                
                <div class="form-group">
                  <label>Nazwisko:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newPsychologist.lastName" 
                    name="lastName" 
                    required
                  >
                </div>
              </div>
              
              <div class="form-group">
                <label>Email:</label>
                <input 
                  type="email" 
                  [(ngModel)]="newPsychologist.email" 
                  name="email" 
                  required
                >
              </div>
              
              <div class="form-group">
                <label>Specjalizacje (oddziel przecinkami):</label>
                <input 
                  type="text" 
                  [(ngModel)]="specializationsText" 
                  name="specializations" 
                  placeholder="Terapia kognitywno-behawioralna, Psychoterapia, Terapia par"
                >
              </div>
              
              <div class="form-group">
                <label>Opis:</label>
                <textarea 
                  [(ngModel)]="newPsychologist.description" 
                  name="description" 
                  rows="4"
                  placeholder="Krótki opis psychologa..."
                ></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Cena za sesję (PLN):</label>
                  <input 
                    type="number" 
                    [(ngModel)]="newPsychologist.pricePerSession" 
                    name="pricePerSession" 
                    min="0"
                    step="10"
                  >
                </div>
                
                <div class="form-group">
                  <label>Doświadczenie (lata):</label>
                  <input 
                    type="number" 
                    [(ngModel)]="newPsychologist.experience" 
                    name="experience" 
                    min="0"
                  >
                </div>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeAddPsychologistModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!psychologistForm.valid">
                  Dodaj psychologa
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Notification Modal -->
      <div class="modal" *ngIf="showNotificationModal" (click)="closeNotificationModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Nowe powiadomienie</h3>
            <button class="close-btn" (click)="closeNotificationModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="sendNotification()" #notificationForm="ngForm">
              <div class="form-group">
                <label>Typ powiadomienia:</label>
                <select [(ngModel)]="newNotification.type" name="type" required>
                  <option value="email">Email</option>
                  <option value="push">Push</option>
                  <option value="sms">SMS</option>
                  <option value="in-app">W aplikacji</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Odbiorcy:</label>
                <select [(ngModel)]="newNotification.recipients" name="recipients" required>
                  <option value="all">Wszyscy użytkownicy</option>
                  <option value="users">Tylko pacjenci</option>
                  <option value="psychologists">Tylko psycholodzy</option>
                  <option value="moderators">Tylko moderatorzy</option>
                  <option value="custom">Niestandardowi</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Tytuł:</label>
                <input 
                  type="text" 
                  [(ngModel)]="newNotification.title" 
                  name="title" 
                  required
                  placeholder="Tytuł powiadomienia"
                >
              </div>
              
              <div class="form-group">
                <label>Treść:</label>
                <textarea 
                  [(ngModel)]="newNotification.message" 
                  name="message" 
                  rows="4"
                  required
                  placeholder="Treść powiadomienia..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    [(ngModel)]="scheduleNotification" 
                    name="schedule"
                  >
                  Zaplanuj na później
                </label>
              </div>
              
              <div class="form-group" *ngIf="scheduleNotification">
                <label>Data i czas wysłania:</label>
                <input 
                  type="datetime-local" 
                  [(ngModel)]="notificationScheduleDate" 
                  name="scheduleDate"
                >
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeNotificationModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!notificationForm.valid">
                  {{ scheduleNotification ? 'Zaplanuj' : 'Wyślij' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Contract Template Modal -->
      <div class="modal" *ngIf="showContractModal" (click)="closeContractModal()">
        <div class="modal-content large-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingContract ? 'Edytuj szablon umowy' : 'Nowy szablon umowy' }}</h3>
            <button class="close-btn" (click)="closeContractModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="saveContractTemplate()" #contractForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Nazwa szablonu:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="newContract.name" 
                    name="name" 
                    required
                    placeholder="Nazwa szablonu"
                  >
                </div>
                
                <div class="form-group">
                  <label>Typ umowy:</label>
                  <select [(ngModel)]="newContract.type" name="type" required>
                    <option value="standard">Standardowa</option>
                    <option value="credit">Pakiet kredytowy</option>
                    <option value="corporate">Korporacyjna</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Treść szablonu:</label>
                <textarea 
                  [(ngModel)]="newContract.template" 
                  name="template" 
                  rows="10"
                  required
                  placeholder="Treść umowy z placeholderami jak {clientName}, {price} itp."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>Pola do wypełnienia:</label>
                <div class="contract-fields">
                  <div *ngFor="let field of newContract.fields; let i = index" class="field-item">
                    <input 
                      type="text" 
                      [(ngModel)]="field.name" 
                      [name]="'fieldName' + i"
                      placeholder="Nazwa pola"
                    >
                    <input 
                      type="text" 
                      [(ngModel)]="field.label" 
                      [name]="'fieldLabel' + i"
                      placeholder="Etykieta"
                    >
                    <select [(ngModel)]="field.type" [name]="'fieldType' + i">
                      <option value="text">Tekst</option>
                      <option value="number">Liczba</option>
                      <option value="date">Data</option>
                      <option value="select">Lista</option>
                    </select>
                    <button type="button" class="btn btn-sm btn-danger" (click)="removeContractField(i)">
                      Usuń
                    </button>
                  </div>
                  <button type="button" class="btn btn-sm btn-secondary" (click)="addContractField()">
                    Dodaj pole
                  </button>
                </div>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeContractModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!contractForm.valid">
                  Zapisz szablon
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  // Chart ViewChild references
  @ViewChild('userRegistrationsChart') userRegistrationsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('sessionsChart') sessionsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('psychologistsChart') psychologistsChart!: ElementRef<HTMLCanvasElement>;

  // Chart instances
  private charts: { [key: string]: any } = {};
  currentUser: User | null = null;
  activeTab = 'overview';
  isLoading = false;
  private subscriptions: Subscription[] = [];

  // Overview stats
  adminStats: AdminStats | null = null;
  totalUsers = 0;
  newUsersThisMonth = 0;
  totalPsychologists = 0;
  pendingPsychologists = 0;
  totalRevenue = 0;
  monthlyRevenue = 0;
  totalSessions = 0;
  sessionsThisMonth = 0;

  // Data
  users: User[] = [];
  filteredUsers: User[] = [];
  psychologists: Psychologist[] = [];
  recentActivities: SystemActivity[] = [];
  reviews: Review[] = [];
  filteredReviews: Review[] = [];
  contractTemplates: any[] = [];
  liveAnalytics: LiveAnalytics | null = null;
  lastAnalyticsUpdate = new Date();

  // Filters
  userSearchTerm = '';
  userRoleFilter = '';
  reviewStatusFilter = '';

  // Notification stats
  notificationStats = {
    sentToday: 25,
    pending: 3,
    scheduled: 8
  };

  // Modal states
  showAddPsychologistModal = false;
  showNotificationModal = false;
  showContractModal = false;
  editingContract = false;

  // New items for modals
  newPsychologist = {
    firstName: '',
    lastName: '',
    email: '',
    description: '',
    pricePerSession: 150,
    experience: 1
  };
  specializationsText = '';

  newNotification = {
    type: 'email' as 'email' | 'push' | 'sms' | 'in-app',
    title: '',
    message: '',
    recipients: 'all' as string[] | 'all'
  };
  scheduleNotification = false;
  notificationScheduleDate = '';

  newContract = {
    name: '',
    type: 'standard' as 'standard' | 'credit' | 'corporate',
    template: '',
    fields: [] as any[],
    isActive: true
  };

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private psychologistService: PsychologistService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.loadDashboardData();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    // Destroy charts
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
  }

  ngAfterViewInit() {
    // Initialize charts after view is ready
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private setupRealTimeUpdates() {
    // Update stats every 30 seconds
    const statsUpdate = interval(30000).subscribe(() => {
      this.adminService.refreshStats();
    });

    // Update live analytics every 10 seconds
    const analyticsUpdate = interval(10000).subscribe(() => {
      if (this.activeTab === 'live-analytics') {
        this.loadLiveAnalytics();
      }
    });

    this.subscriptions.push(statsUpdate, analyticsUpdate);
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      // Load all data using Firebase
      await Promise.all([
        this.loadOverviewStats(),
        this.loadUsers(),
        this.loadPsychologists(),
        this.loadRecentActivities(),
        this.loadReviews(),
        this.loadContractTemplates()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadOverviewStats() {
    try {
      this.adminStats = await this.adminService.getStatsFromFirebase();
      if (this.adminStats) {
        this.totalUsers = this.adminStats.totalUsers;
        this.newUsersThisMonth = this.adminStats.newUsersToday;
        this.totalPsychologists = this.adminStats.activePsychologists;
        this.pendingPsychologists = this.adminStats.pendingPsychologists;
        this.totalRevenue = this.adminStats.monthlyRevenue;
        this.monthlyRevenue = this.adminStats.monthlyRevenue;
        this.totalSessions = this.adminStats.monthlySessions;
        this.sessionsThisMonth = this.adminStats.monthlySessions;
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async loadUsers() {
    try {
      this.users = await this.adminService.getAllUsersFromFirebase();
      this.filteredUsers = [...this.users];
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  async loadPsychologists() {
    try {
      this.psychologists = await this.adminService.getAllPsychologistsWithDetails();
    } catch (error) {
      console.error('Error loading psychologists:', error);
    }
  }

  async loadRecentActivities() {
    try {
      this.recentActivities = await this.adminService.getRecentActivityFromFirebase(20);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  }

  async loadReviews() {
    try {
      this.reviews = await this.adminService.getAllReviewsFromFirebase();
      this.filteredReviews = [...this.reviews];
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  }

  async loadContractTemplates() {
    try {
      this.contractTemplates = await this.adminService.getContractTemplatesFromFirebase();
    } catch (error) {
      console.error('Error loading contract templates:', error);
    }
  }

  async loadLiveAnalytics() {
    try {
      this.liveAnalytics = await this.adminService.getLiveAnalytics();
      this.lastAnalyticsUpdate = new Date();
    } catch (error) {
      console.error('Error loading live analytics:', error);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;

    // Load specific data when switching to certain tabs
    if (tab === 'live-analytics' && !this.liveAnalytics) {
      this.loadLiveAnalytics();
    } else if (tab === 'reviews' && this.reviews.length === 0) {
      this.loadReviews();
    } else if (tab === 'contracts' && this.contractTemplates.length === 0) {
      this.loadContractTemplates();
    }
  }

  // Review Management Methods
  filterReviews() {
    this.filteredReviews = this.reviews.filter(review => {
      const matchesStatus = !this.reviewStatusFilter || review.status === this.reviewStatusFilter;
      return matchesStatus;
    });
  }

  getStarsDisplay(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Oczekująca';
      case 'approved': return 'Zatwierdzona';
      case 'rejected': return 'Odrzucona';
      case 'flagged': return 'Oflagowana';
      default: return status;
    }
  }

  async moderateReview(reviewId: string, action: 'approve' | 'reject') {
    try {
      await this.adminService.moderateReviewInFirebase(reviewId, action, this.currentUser!.id);
      await this.loadReviews(); // Refresh reviews

      await this.adminService.logActivityToFirebase({
        type: 'review-added',
        message: `${action === 'approve' ? 'Zatwierdzono' : 'Odrzucono'} opinię`,
        severity: 'low'
      });
    } catch (error) {
      console.error('Error moderating review:', error);
      alert('Wystąpił błąd podczas moderacji opinii');
    }
  }

  async flagReview(reviewId: string) {
    const reason = prompt('Podaj powód oflagowania opinii:');
    if (reason) {
      try {
        await this.adminService.moderateReviewInFirebase(reviewId, 'flag', this.currentUser!.id, reason);
        await this.loadReviews();

        await this.adminService.logActivityToFirebase({
          type: 'review-added',
          message: `Oflagowano opinię: ${reason}`,
          severity: 'medium'
        });
      } catch (error) {
        console.error('Error flagging review:', error);
        alert('Wystąpił błąd podczas flagowania opinii');
      }
    }
  }

  // Notification Methods
  useTemplate(templateType: string) {
    // Implementation for using notification templates
    console.log('Using template:', templateType);
    this.showNotificationModal = true;
  }

  // Contract Methods
  editContract(template: any) {
    console.log('Edit contract:', template);
    this.showContractModal = true;
  }

  generateContract(template: any) {
    this.adminService.generatePdfContract(template.id, {}).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${template.name}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  toggleContractStatus(template: any) {
    template.isActive = !template.isActive;
    // Save to Firebase
    console.log('Toggle contract status:', template);
  }

  exportContracts() {
    console.log('Export all contracts');
  }

  // Modal Methods
  closeNotificationModal() {
    this.showNotificationModal = false;
    this.newNotification = {
      type: 'email' as 'email' | 'push' | 'sms' | 'in-app',
      title: '',
      message: '',
      recipients: 'all' as string[] | 'all'
    };
    this.scheduleNotification = false;
    this.notificationScheduleDate = '';
  }

  closeContractModal() {
    this.showContractModal = false;
    this.editingContract = false;
    this.newContract = {
      name: '',
      type: 'standard' as 'standard' | 'credit' | 'corporate',
      template: '',
      fields: [] as any[],
      isActive: true
    };
  }

  async sendNotification() {
    try {
      const notificationData = {
        ...this.newNotification,
        scheduled: this.scheduleNotification ? new Date(this.notificationScheduleDate) : undefined
      };

      await this.adminService.sendNotificationToFirebase(notificationData);
      this.closeNotificationModal();
      alert('Powiadomienie zostało wysłane pomyślnie');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Wystąpił błąd podczas wysyłania powiadomienia');
    }
  }

  async saveContractTemplate() {
    try {
      // Add missing content field and ID
      const contractToSave: ContractTemplate = {
        id: '', // Will be generated by Firebase
        name: this.newContract.name,
        type: this.newContract.type,
        content: `Szablon umowy ${this.newContract.type}...`, // Default content
        fields: this.newContract.fields,
        isActive: this.newContract.isActive
      };
      await this.adminService.saveContractTemplate(contractToSave);
      this.closeContractModal();
      this.loadContractTemplates();
      alert('Szablon umowy został zapisany pomyślnie');
    } catch (error) {
      console.error('Error saving contract template:', error);
      alert('Wystąpił błąd podczas zapisywania szablonu');
    }
  }

  addContractField() {
    this.newContract.fields.push({
      name: '',
      label: '',
      type: 'text',
      required: false
    });
  }

  removeContractField(index: number) {
    this.newContract.fields.splice(index, 1);
  }

  logout() {
    this.authService.logout();
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user-registered': return '👤';
      case 'session-completed': return '✅';
      case 'payment-received': return '💰';
      case 'psychologist-verified': return '🧠';
      default: return '📋';
    }
  }

  getUserInitials(user: User): string {
    return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'moderator': return 'Moderator';
      case 'psychologist': return 'Psycholog';
      case 'user': return 'Użytkownik';
      default: return role;
    }
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !this.userSearchTerm ||
        user.firstName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase());

      const matchesRole = !this.userRoleFilter || user.role === this.userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }

  editUser(user: User) {
    // TODO: Implement user editing
    console.log('Edit user:', user);
  }

  async toggleUserStatus(user: User) {
    try {
      // TODO: Implement user status toggle in Firebase
      user.isActive = !user.isActive;
      console.log('User status toggled:', user);
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  }

  viewPsychologistDetails(psychologist: Psychologist) {
    // TODO: Implement psychologist details view
    console.log('View psychologist details:', psychologist);
  }

  editPsychologist(psychologist: Psychologist) {
    // TODO: Implement psychologist editing
    console.log('Edit psychologist:', psychologist);
  }

  async togglePsychologistStatus(psychologist: Psychologist) {
    try {
      await this.psychologistService.updatePsychologist(psychologist.id, {
        isActive: !psychologist.isActive
      });
      psychologist.isActive = !psychologist.isActive;
    } catch (error) {
      console.error('Error toggling psychologist status:', error);
    }
  }

  closeAddPsychologistModal() {
    this.showAddPsychologistModal = false;
    this.newPsychologist = {
      firstName: '',
      lastName: '',
      email: '',
      description: '',
      pricePerSession: 150,
      experience: 1
    };
    this.specializationsText = '';
  }

  async addPsychologist() {
    try {
      const specializations = this.specializationsText
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const psychologistData = {
        ...this.newPsychologist,
        specializations,
        isActive: true,
        rating: 5.0,
        reviewsCount: 0,
        completedSessions: 0,
        totalRevenue: 0,
        profileImage: '',
        workingHours: {
          monday: { start: '09:00', end: '17:00', isAvailable: true },
          tuesday: { start: '09:00', end: '17:00', isAvailable: true },
          wednesday: { start: '09:00', end: '17:00', isAvailable: true },
          thursday: { start: '09:00', end: '17:00', isAvailable: true },
          friday: { start: '09:00', end: '17:00', isAvailable: true },
          saturday: { start: '10:00', end: '14:00', isAvailable: false },
          sunday: { start: '10:00', end: '14:00', isAvailable: false }
        },
        languages: ['Polski'],
        education: [],
        certificates: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.psychologistService.addPsychologist(psychologistData);
      this.closeAddPsychologistModal();
      this.loadPsychologists();
      alert('Psycholog został dodany pomyślnie');
    } catch (error) {
      console.error('Error adding psychologist:', error);
      alert('Wystąpił błąd podczas dodawania psychologa');
    }
  }

  // ==================
  // CHART METHODS
  // ==================

  private initializeCharts() {
    this.createUserRegistrationsChart();
    this.createRevenueChart();
    this.createSessionsChart();
    this.createPsychologistsChart();
  }

  private createUserRegistrationsChart() {
    if (this.userRegistrationsChart) {
      const ctx = this.userRegistrationsChart.nativeElement.getContext('2d');
      if (ctx) {
        const labels = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip'];
        const data = [65, 85, 120, 95, 140, 160, 180];
        this.charts['userRegistrations'] = ChartService.createLineChart(ctx, data, labels);
      }
    }
  }

  private createRevenueChart() {
    if (this.revenueChart) {
      const ctx = this.revenueChart.nativeElement.getContext('2d');
      if (ctx) {
        const labels = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip'];
        const data = [12000, 15000, 18000, 14000, 22000, 25000, 28000];
        this.charts['revenue'] = ChartService.createBarChart(ctx, data, labels);
      }
    }
  }

  private createSessionsChart() {
    if (this.sessionsChart) {
      const ctx = this.sessionsChart.nativeElement.getContext('2d');
      if (ctx) {
        const labels = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip'];
        const data = [120, 150, 180, 140, 200, 220, 250];
        this.charts['sessions'] = ChartService.createLineChart(ctx, data, labels);
      }
    }
  }

  private createPsychologistsChart() {
    if (this.psychologistsChart) {
      const ctx = this.psychologistsChart.nativeElement.getContext('2d');
      if (ctx) {
        const labels = ['Dr. Kowalski', 'Dr. Nowak', 'Dr. Wiśniewski', 'Dr. Wójcik', 'Dr. Kowalczyk'];
        const data = [45, 38, 32, 28, 25];
        this.charts['psychologists'] = ChartService.createDoughnutChart(ctx, data, labels);
      }
    }
  }

  // ==================
  // CRM METHODS
  // ==================

  async syncWithLivespace() {
    try {
      const result = await this.adminService.syncWithCrm('livespace');
      alert(`Synchronizacja zakończona! Zaimportowano: ${result.imported}, Wyeksportowano: ${result.exported}`);
      this.loadDashboardData();
    } catch (error) {
      console.error('Error syncing with CRM:', error);
      alert('Wystąpił błąd podczas synchronizacji z CRM');
    }
  }

  async importContactsFromCrm() {
    try {
      const contacts = await this.adminService.getCrmContacts();
      alert(`Zaimportowano ${contacts.length} kontaktów z CRM`);
      this.loadDashboardData();
    } catch (error) {
      console.error('Error importing contacts:', error);
      alert('Wystąpił błąd podczas importu kontaktów');
    }
  }

  async exportContactsToCrm() {
    try {
      await this.adminService.syncWithCrm('export');
      alert('Kontakty zostały wyeksportowane do CRM');
    } catch (error) {
      console.error('Error exporting contacts:', error);
      alert('Wystąpił błąd podczas eksportu kontaktów');
    }
  }

  async syncAppointments() {
    try {
      await this.adminService.syncWithCrm('appointments');
      alert('Wizyty zostały zsynchronizowane z CRM');
    } catch (error) {
      console.error('Error syncing appointments:', error);
      alert('Wystąpił błąd podczas synchronizacji wizyt');
    }
  }

  configureCrmSettings() {
    // TODO: Open CRM settings modal
    alert('Funkcja konfiguracji CRM będzie wkrótce dostępna');
  }

  // ==================
  // POSTHOG METHODS
  // ==================

  openPostHog() {
    window.open('https://app.posthog.com', '_blank');
  }

  async syncPostHog() {
    try {
      await this.adminService.syncPostHogData();
      this.liveAnalytics = await this.adminService.getPostHogAnalytics();
      alert('Dane PostHog zostały zsynchronizowane');
    } catch (error) {
      console.error('Error syncing PostHog:', error);
      alert('Wystąpił błąd podczas synchronizacji z PostHog');
    }
  }

  // ==================
  // REPORTS METHODS
  // ==================

  async generateUserReport() {
    try {
      const report = await this.adminService.generateReport('user-activity', {
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        filters: {},
        groupBy: 'day'
      });
      alert(`Raport użytkowników został wygenerowany: ${report.name}`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Wystąpił błąd podczas generowania raportu');
    }
  }

  async generateRevenueReport() {
    try {
      const report = await this.adminService.generateReport('revenue', {
        dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        filters: {},
        groupBy: 'month'
      });
      alert(`Raport przychodów został wygenerowany: ${report.name}`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Wystąpił błąd podczas generowania raportu');
    }
  }

  async generateSessionsReport() {
    try {
      const report = await this.adminService.generateReport('sessions', {
        dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dateTo: new Date(),
        filters: {},
        groupBy: 'week'
      });
      alert(`Raport sesji został wygenerowany: ${report.name}`);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Wystąpił błąd podczas generowania raportu');
    }
  }

  // ==================
  // SYSTEM METHODS
  // ==================

  async loadSystemUpgrades() {
    try {
      this.systemUpgrades = await this.adminService.getSystemUpgrades();
    } catch (error) {
      console.error('Error loading system upgrades:', error);
    }
  }

  async installUpgrade(upgradeId: string) {
    try {
      await this.adminService.installUpgrade(upgradeId);
      alert('Aktualizacja została zainstalowana');
      this.loadSystemUpgrades();
    } catch (error) {
      console.error('Error installing upgrade:', error);
      alert('Wystąpił błąd podczas instalacji aktualizacji');
    }
  }

  async loadSystemConfiguration() {
    try {
      this.systemConfiguration = await this.adminService.getSystemConfiguration();
    } catch (error) {
      console.error('Error loading system configuration:', error);
    }
  }

  async updateConfiguration(config: any) {
    try {
      await this.adminService.updateSystemConfiguration(config);
      alert('Konfiguracja została zaktualizowana');
      this.loadSystemConfiguration();
    } catch (error) {
      console.error('Error updating configuration:', error);
      alert('Wystąpił błąd podczas aktualizacji konfiguracji');
    }
  }

  async createBackup() {
    try {
      const backup = await this.adminService.createBackup('Backup ręczny');
      alert(`Backup został utworzony: ${backup.id}`);
    } catch (error) {
      console.error('Error creating backup:', error);
      alert('Wystąpił błąd podczas tworzenia backupu');
    }
  }

  // ==================
  // ADDITIONAL PROPERTIES
  // ==================

  systemUpgrades: SystemUpgrade[] = [];
  systemConfiguration: SystemConfiguration[] = [];
  reports: Report[] = [];
  crmIntegrations: CrmIntegration[] = [];

  // ==================
  // CONFIGURATION METHODS
  // ==================

  getConfigCategories(): string[] {
    const categories = [...new Set(this.systemConfiguration.map(config => config.category))];
    return categories;
  }

  getConfigsByCategory(category: string): SystemConfiguration[] {
    return this.systemConfiguration.filter(config => config.category === category);
  }
}
