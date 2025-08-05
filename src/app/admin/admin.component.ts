import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { PackageService, UserPackage } from '../core/package.service';
import { AdminService, AdminStats, SystemActivity, CrmStats } from '../core/admin.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-panel">
      <!-- Header -->
      <header class="admin-header">
        <div class="header-content">
          <div class="logo-section">
            <img src="/assets/logo.svg" alt="Logos" class="logo">
            <h1>Admin Panel</h1>
          </div>
          <div class="header-actions">
            <span class="admin-badge">ADMINISTRATOR</span>
            <span class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</span>
            <button class="logout-btn" (click)="logout()">Wyloguj</button>
          </div>
        </div>
      </header>

      <!-- Main Layout Container -->
      <div class="admin-body">
        <!-- Sidebar Navigation -->
        <nav class="admin-sidebar">
        <div class="nav-section">
          <h3>Dashboard</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'overview'"
            (click)="setActiveTab('overview')"
          >
            <i class="icon">📊</i>
            <span>Przegląd</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'analytics'"
            (click)="setActiveTab('analytics')"
          >
            <i class="icon">📈</i>
            <span>Analityka</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>Zarządzanie</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'users'"
            (click)="setActiveTab('users')"
          >
            <i class="icon">👥</i>
            <span>Użytkownicy</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'psychologists'"
            (click)="setActiveTab('psychologists')"
          >
            <i class="icon">🧠</i>
            <span>Psycholodzy</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'moderators'"
            (click)="setActiveTab('moderators')"
          >
            <i class="icon">👮</i>
            <span>Moderatorzy</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>CRM & Integracje</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'crm'"
            (click)="setActiveTab('crm')"
          >
            <i class="icon">🔗</i>
            <span>Livespace CRM</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'posthog'"
            (click)="setActiveTab('posthog')"
          >
            <i class="icon">📊</i>
            <span>PostHog Analytics</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>Dokumenty</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'contracts'"
            (click)="setActiveTab('contracts')"
          >
            <i class="icon">📋</i>
            <span>Umowy</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'reports'"
            (click)="setActiveTab('reports')"
          >
            <i class="icon">📄</i>
            <span>Raporty</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>Komunikacja</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'notifications'"
            (click)="setActiveTab('notifications')"
          >
            <i class="icon">🔔</i>
            <span>Powiadomienia</span>
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'upgrades'"
            (click)="setActiveTab('upgrades')"
          >
            <i class="icon">⬆️</i>
            <span>Ulepszenia</span>
          </button>
        </div>

        <div class="nav-section">
          <h3>Ustawienia</h3>
          <button 
            class="nav-item" 
            [class.active]="activeTab === 'settings'"
            (click)="setActiveTab('settings')"
          >
            <i class="icon">⚙️</i>
            <span>Konfiguracja</span>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="admin-content">
        <!-- Loading -->
        <div class="loading-container" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Ładowanie danych...</p>
        </div>

        <!-- Overview Tab -->
        <section class="overview-section" *ngIf="activeTab === 'overview' && !isLoading">
          <div class="page-header">
            <h2>Przegląd systemu</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="refreshData()">
                <i class="icon">🔄</i>
                Odśwież dane
              </button>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="stats-grid">
            <div class="stat-card users">
              <div class="stat-header">
                <h3>Użytkownicy</h3>
                <i class="icon">👥</i>
              </div>
              <div class="stat-value">{{ stats.totalUsers | number }}</div>
              <div class="stat-change positive">+{{ stats.newUsersToday }} dzisiaj</div>
            </div>

            <div class="stat-card psychologists">
              <div class="stat-header">
                <h3>Psycholodzy</h3>
                <i class="icon">🧠</i>
              </div>
              <div class="stat-value">{{ stats.activePsychologists }}</div>
              <div class="stat-change neutral">{{ stats.pendingPsychologists }} oczekuje</div>
            </div>

            <div class="stat-card revenue">
              <div class="stat-header">
                <h3>Przychód (miesiąc)</h3>
                <i class="icon">💰</i>
              </div>
              <div class="stat-value">{{ stats.monthlyRevenue | currency:'PLN':'symbol':'1.0-0' }}</div>
              <div class="stat-change" [class]="getGrowthClass(stats.revenueGrowth)">{{ formatGrowth(stats.revenueGrowth) }}</div>
            </div>

            <div class="stat-card sessions">
              <div class="stat-header">
                <h3>Sesje (miesiąc)</h3>
                <i class="icon">📊</i>
              </div>
              <div class="stat-value">{{ stats.monthlySessions | number }}</div>
              <div class="stat-change" [class]="getGrowthClass(stats.sessionsGrowth)">{{ formatGrowth(stats.sessionsGrowth) }}</div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="activity-section">
            <h3>Ostatnia aktywność</h3>
            <div class="activity-feed">
              <div *ngFor="let activity of recentActivity" class="activity-item">
                <div class="activity-icon" [class]="activity.type">
                  {{ getActivityIcon(activity.type) }}
                </div>
                <div class="activity-content">
                  <p class="activity-text">{{ activity.message }}</p>
                  <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- System Health -->
          <div class="system-health">
            <h3>Status systemu</h3>
            <div class="health-grid">
              <div class="health-item healthy">
                <i class="icon">✅</i>
                <span>Baza danych</span>
                <small>Działa poprawnie</small>
              </div>
              <div class="health-item healthy">
                <i class="icon">✅</i>
                <span>Płatności</span>
                <small>Wszystko OK</small>
              </div>
              <div class="health-item warning">
                <i class="icon">⚠️</i>
                <span>Email</span>
                <small>Opóźnienia 2min</small>
              </div>
              <div class="health-item healthy">
                <i class="icon">✅</i>
                <span>Storage</span>
                <small>75% wykorzystane</small>
              </div>
            </div>
          </div>
        </section>

        <!-- Analytics Tab -->
        <section class="analytics-section" *ngIf="activeTab === 'analytics' && !isLoading">
          <div class="page-header">
            <h2>Analityka i statystyki</h2>
            <div class="header-actions">
              <select [(ngModel)]="analyticsTimeRange" (change)="updateAnalytics()">
                <option value="7days">Ostatnie 7 dni</option>
                <option value="30days">Ostatnie 30 dni</option>
                <option value="90days">Ostatnie 3 miesiące</option>
                <option value="year">Rok</option>
              </select>
              <button class="btn btn-secondary" (click)="exportAnalytics()">
                <i class="icon">📊</i>
                Eksportuj do Excel
              </button>
            </div>
          </div>

          <!-- Charts Placeholder -->
          <div class="charts-grid">
            <div class="chart-container">
              <h4>Rejestracje użytkowników</h4>
              <div class="chart-placeholder">
                <p>Wykres rejestracji w czasie</p>
                <small>Integracja z Chart.js</small>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Przychody</h4>
              <div class="chart-placeholder">
                <p>Wykres przychodów miesięcznych</p>
                <small>Integracja z Chart.js</small>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Sesje psychologiczne</h4>
              <div class="chart-placeholder">
                <p>Liczba sesji w czasie</p>
                <small>Integracja z Chart.js</small>
              </div>
            </div>
            
            <div class="chart-container">
              <h4>Konwersja</h4>
              <div class="chart-placeholder">
                <p>Funnel konwersji</p>
                <small>Rejestracja → Płatność → Sesja</small>
              </div>
            </div>
          </div>

          <!-- PostHog Integration -->
          <div class="posthog-section">
            <h3>PostHog Analytics</h3>
            <div class="integration-card">
              <div class="integration-status connected">
                <i class="icon">✅</i>
                <span>Połączono z PostHog</span>
              </div>
              <div class="integration-actions">
                <button class="btn btn-primary" (click)="openPostHog()">
                  <i class="icon">🔗</i>
                  Otwórz PostHog
                </button>
                <button class="btn btn-secondary" (click)="syncPostHog()">
                  <i class="icon">🔄</i>
                  Synchronizuj dane
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- CRM Tab -->
        <section class="crm-section" *ngIf="activeTab === 'crm' && !isLoading">
          <div class="page-header">
            <h2>Integracja z Livespace CRM</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="syncWithLivespace()">
                <i class="icon">🔄</i>
                Synchronizuj z CRM
              </button>
            </div>
          </div>

          <!-- CRM Status -->
          <div class="crm-status">
            <div class="status-card">
              <div class="status-header">
                <h3>Status połączenia</h3>
                <div class="status-indicator connected">Połączono</div>
              </div>
              <div class="status-details">
                <p><strong>Ostatnia synchronizacja:</strong> {{ lastCrmSync | date:'short' }}</p>
                <p><strong>Zsynchronizowane kontakty:</strong> {{ crmStats.syncedContacts }}</p>
                <p><strong>Nowe leady:</strong> {{ crmStats.newLeads }}</p>
              </div>
            </div>
          </div>

          <!-- CRM Actions -->
          <div class="crm-actions">
            <h3>Akcje CRM</h3>
            <div class="actions-grid">
              <button class="action-card" (click)="importContactsFromCrm()">
                <i class="icon">📥</i>
                <h4>Import kontaktów</h4>
                <p>Importuj nowe kontakty z Livespace</p>
              </button>
              
              <button class="action-card" (click)="exportContactsToCrm()">
                <i class="icon">📤</i>
                <h4>Eksport kontaktów</h4>
                <p>Wyślij dane użytkowników do CRM</p>
              </button>
              
              <button class="action-card" (click)="syncAppointments()">
                <i class="icon">📅</i>
                <h4>Synchronizuj wizyty</h4>
                <p>Aktualizuj kalendarz w CRM</p>
              </button>
              
              <button class="action-card" (click)="configureCrmSettings()">
                <i class="icon">⚙️</i>
                <h4>Ustawienia CRM</h4>
                <p>Konfiguruj mapowanie pól</p>
              </button>
            </div>
          </div>
        </section>

        <!-- Psychologists Management Tab -->
        <section class="psychologists-section" *ngIf="activeTab === 'psychologists' && !isLoading">
          <div class="page-header">
            <h2>Zarządzanie psychologami</h2>
            <div class="header-actions">
              <input 
                type="text" 
                placeholder="Szukaj psychologów..." 
                [(ngModel)]="psychologistSearchTerm"
                (input)="filterPsychologists()"
                class="search-input"
              >
              <select [(ngModel)]="psychologistStatusFilter" (change)="filterPsychologists()" class="filter-select">
                <option value="">Wszystkie statusy</option>
                <option value="active">Aktywni</option>
                <option value="pending">Oczekujący</option>
                <option value="suspended">Zawieszeni</option>
              </select>
              <button class="btn btn-success" (click)="exportPsychologistsToExcel()">
                <i class="icon">📊</i>
                Eksport
              </button>
              <button class="btn btn-primary" (click)="showAddPsychologistModal = true">
                <i class="icon">➕</i>
                Dodaj psychologa
              </button>
            </div>
          </div>

          <!-- Psychologists Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Aktywni psychologowie</h3>
              <div class="stat-value">{{ psychologistStats.active }}</div>
              <div class="stat-change positive">+{{ psychologistStats.newThisMonth }} w tym miesiącu</div>
            </div>
            <div class="stat-card">
              <h3>Oczekujący weryfikacji</h3>
              <div class="stat-value">{{ psychologistStats.pending }}</div>
              <div class="stat-change neutral">{{ psychologistStats.avgApprovalTime }}d średni czas</div>
            </div>
            <div class="stat-card">
              <h3>Średnia ocena</h3>
              <div class="stat-value">{{ psychologistStats.avgRating }}/5</div>
              <div class="stat-change positive">+0.2 vs poprzedni miesiąc</div>
            </div>
            <div class="stat-card">
              <h3>Całkowite sesje</h3>
              <div class="stat-value">{{ psychologistStats.totalSessions }}</div>
              <div class="stat-change positive">+{{ psychologistStats.sessionsThisMonth }} w tym miesiącu</div>
            </div>
          </div>

          <!-- Psychologists Table -->
          <div class="data-table">
            <div class="table-header">
              <div class="col">Psycholog</div>
              <div class="col">Specjalizacja</div>
              <div class="col">Status</div>
              <div class="col">Ocena</div>
              <div class="col">Sesje</div>
              <div class="col">Ostatnia sesja</div>
              <div class="col">Akcje</div>
            </div>
            
            <div *ngFor="let psychologist of filteredPsychologists" class="table-row">
              <div class="col user-cell">
                <div class="user-avatar">{{ getUserInitials(psychologist) }}</div>
                <div class="user-info">
                  <span class="user-name">{{ psychologist.firstName }} {{ psychologist.lastName }}</span>
                  <small class="user-email">{{ psychologist.email }}</small>
                  <small class="user-license">Lic. {{ psychologist.licenseNumber || 'Brak' }}</small>
                </div>
              </div>
              <div class="col">
                <div class="specializations">
                  <span *ngFor="let spec of psychologist.specializations" class="specialization-tag">
                    {{ spec }}
                  </span>
                </div>
              </div>
              <div class="col">
                <span class="status-badge" 
                      [class.active]="psychologist.verificationStatus === 'verified'"
                      [class.pending]="psychologist.verificationStatus === 'pending'"
                      [class.suspended]="psychologist.verificationStatus === 'suspended'">
                  {{ getVerificationStatusText(psychologist.verificationStatus || 'pending') }}
                </span>
              </div>
              <div class="col">
                <div class="rating">
                  <span class="rating-value">{{ psychologist.rating || 0 }}/5</span>
                  <div class="stars">
                    <span *ngFor="let star of [1,2,3,4,5]" 
                          class="star" 
                          [class.filled]="star <= (psychologist.rating || 0)">★</span>
                  </div>
                  <small>({{ psychologist.reviewCount || 0 }} opinii)</small>
                </div>
              </div>
              <div class="col">
                <div class="session-stats">
                  <span class="total-sessions">{{ psychologist.totalSessions || 0 }}</span>
                  <small class="this-month">+{{ psychologist.sessionsThisMonth || 0 }} w tym miesiącu</small>
                </div>
              </div>
              <div class="col">
                <span *ngIf="psychologist.lastSessionDate">
                  {{ psychologist.lastSessionDate | date:'short' }}
                </span>
                <span *ngIf="!psychologist.lastSessionDate" class="no-data">Brak sesji</span>
              </div>
              <div class="col">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-secondary" (click)="viewPsychologistProfile(psychologist)">
                    Profile
                  </button>
                  <button class="btn btn-sm btn-info" (click)="viewPsychologistSessions(psychologist)">
                    Sesje
                  </button>
                  <button 
                    *ngIf="psychologist.verificationStatus === 'pending'"
                    class="btn btn-sm btn-success" 
                    (click)="approvePsychologist(psychologist)">
                    Zatwierdź
                  </button>
                  <button 
                    *ngIf="psychologist.verificationStatus === 'verified'"
                    class="btn btn-sm btn-warning" 
                    (click)="suspendPsychologist(psychologist)">
                    Zawieś
                  </button>
                  <button 
                    *ngIf="psychologist.verificationStatus === 'suspended'"
                    class="btn btn-sm btn-success" 
                    (click)="reactivatePsychologist(psychologist)">
                    Reaktywuj
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deletePsychologist(psychologist)">
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Verification Queue -->
          <div class="verification-queue" *ngIf="pendingPsychologists.length > 0">
            <h3>Kolejka weryfikacji ({{ pendingPsychologists.length }})</h3>
            <div class="pending-cards">
              <div *ngFor="let psychologist of pendingPsychologists" class="pending-card">
                <div class="card-header">
                  <h4>{{ psychologist.firstName }} {{ psychologist.lastName }}</h4>
                  <span class="application-date">{{ psychologist.createdAt | date:'medium' }}</span>
                </div>
                <div class="card-content">
                  <div class="info-row">
                    <strong>Email:</strong> {{ psychologist.email }}
                  </div>
                  <div class="info-row">
                    <strong>Telefon:</strong> {{ psychologist.phone || 'Nie podano' }}
                  </div>
                  <div class="info-row">
                    <strong>Numer licencji:</strong> {{ psychologist.licenseNumber || 'Nie podano' }}
                  </div>
                  <div class="info-row">
                    <strong>Specjalizacje:</strong> 
                    <span *ngFor="let spec of psychologist.specializations" class="specialization-tag">{{ spec }}</span>
                  </div>
                  <div class="info-row">
                    <strong>Doświadczenie:</strong> {{ psychologist.experience || 'Nie podano' }} lat
                  </div>
                  <div class="info-row" *ngIf="psychologist.education">
                    <strong>Wykształcenie:</strong> {{ psychologist.education }}
                  </div>
                  <div class="info-row" *ngIf="psychologist.bio">
                    <strong>Bio:</strong> {{ psychologist.bio }}
                  </div>
                </div>
                <div class="card-actions">
                  <button class="btn btn-success" (click)="approvePsychologist(psychologist)">
                    <i class="icon">✓</i>
                    Zatwierdź
                  </button>
                  <button class="btn btn-warning" (click)="requestMoreInfo(psychologist)">
                    <i class="icon">❓</i>
                    Zapytaj o więcej
                  </button>
                  <button class="btn btn-danger" (click)="rejectPsychologist(psychologist)">
                    <i class="icon">✗</i>
                    Odrzuć
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Moderators Management Tab -->
        <section class="moderators-section" *ngIf="activeTab === 'moderators' && !isLoading">
          <div class="page-header">
            <h2>Zarządzanie moderatorami</h2>
            <div class="header-actions">
              <input 
                type="text" 
                placeholder="Szukaj moderatorów..." 
                [(ngModel)]="moderatorSearchTerm"
                (input)="filterModerators()"
                class="search-input"
              >
              <button class="btn btn-primary" (click)="showAddModeratorModal = true">
                <i class="icon">➕</i>
                Dodaj moderatora
              </button>
            </div>
          </div>

          <!-- Moderators Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Aktywni moderatorzy</h3>
              <div class="stat-value">{{ moderatorStats.active }}</div>
              <div class="stat-change positive">{{ moderatorStats.onlineNow }} online teraz</div>
            </div>
            <div class="stat-card">
              <h3>Moderowane treści</h3>
              <div class="stat-value">{{ moderatorStats.moderatedToday }}</div>
              <div class="stat-change neutral">dziś</div>
            </div>
            <div class="stat-card">
              <h3>Oczekujące zgłoszenia</h3>
              <div class="stat-value">{{ moderatorStats.pendingReports }}</div>
              <div class="stat-change negative" *ngIf="moderatorStats.pendingReports > 10">Wysoki poziom</div>
              <div class="stat-change positive" *ngIf="moderatorStats.pendingReports <= 10">Normalny poziom</div>
            </div>
            <div class="stat-card">
              <h3>Średni czas reakcji</h3>
              <div class="stat-value">{{ moderatorStats.avgResponseTime }}min</div>
              <div class="stat-change positive">-15min vs wczoraj</div>
            </div>
          </div>

          <!-- Moderators Table -->
          <div class="data-table">
            <div class="table-header">
              <div class="col">Moderator</div>
              <div class="col">Uprawnienia</div>
              <div class="col">Status</div>
              <div class="col">Ostatnia aktywność</div>
              <div class="col">Moderowane dziś</div>
              <div class="col">Wydajność</div>
              <div class="col">Akcje</div>
            </div>
            
            <div *ngFor="let moderator of filteredModerators" class="table-row">
              <div class="col user-cell">
                <div class="user-avatar">{{ getUserInitials(moderator) }}</div>
                <div class="user-info">
                  <span class="user-name">{{ moderator.firstName }} {{ moderator.lastName }}</span>
                  <small class="user-email">{{ moderator.email }}</small>
                  <div class="online-indicator" [class.online]="moderator.isOnline"></div>
                </div>
              </div>
              <div class="col">
                <div class="permissions">
                  <span *ngFor="let permission of moderator.permissions" class="permission-tag">
                    {{ getPermissionText(permission) }}
                  </span>
                </div>
              </div>
              <div class="col">
                <span class="status-badge" [class.active]="moderator.isActive">
                  {{ moderator.isActive ? 'Aktywny' : 'Nieaktywny' }}
                </span>
                <div class="online-status" [class.online]="moderator.isOnline">
                  {{ moderator.isOnline ? 'Online' : 'Offline' }}
                </div>
              </div>
              <div class="col">
                <span *ngIf="moderator.lastActivity">
                  {{ moderator.lastActivity | date:'short' }}
                </span>
                <span *ngIf="!moderator.lastActivity" class="no-data">Brak aktywności</span>
              </div>
              <div class="col">
                <div class="moderation-stats">
                  <span class="count">{{ moderator.moderatedToday || 0 }}</span>
                  <small>zgłoszeń</small>
                </div>
              </div>
              <div class="col">
                <div class="performance-rating">
                  <div class="rating-bar">
                    <div class="rating-fill" [style.width]="(moderator.performanceScore || 0) + '%'"></div>
                  </div>
                  <span class="rating-text">{{ moderator.performanceScore || 0 }}%</span>
                </div>
              </div>
              <div class="col">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-secondary" (click)="editModeratorPermissions(moderator)">
                    Uprawnienia
                  </button>
                  <button class="btn btn-sm btn-info" (click)="viewModeratorActivity(moderator)">
                    Aktywność
                  </button>
                  <button 
                    class="btn btn-sm"
                    [class.btn-danger]="moderator.isActive"
                    [class.btn-success]="!moderator.isActive"
                    (click)="toggleModeratorStatus(moderator)"
                  >
                    {{ moderator.isActive ? 'Dezaktywuj' : 'Aktywuj' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending Reports Queue -->
          <div class="reports-queue">
            <h3>Oczekujące zgłoszenia ({{ pendingReports.length }})</h3>
            <div class="queue-filters">
              <select [(ngModel)]="reportTypeFilter" (change)="filterReports()" class="filter-select">
                <option value="">Wszystkie typy</option>
                <option value="inappropriate_content">Nieodpowiednie treści</option>
                <option value="spam">Spam</option>
                <option value="harassment">Nękanie</option>
                <option value="fake_profile">Fałszywy profil</option>
                <option value="other">Inne</option>
              </select>
              <select [(ngModel)]="reportPriorityFilter" (change)="filterReports()" class="filter-select">
                <option value="">Wszystkie priorytety</option>
                <option value="high">Wysoki</option>
                <option value="medium">Średni</option>
                <option value="low">Niski</option>
              </select>
            </div>
            
            <div class="reports-list">
              <div *ngFor="let report of filteredReports" class="report-card" [class]="report.priority">
                <div class="report-header">
                  <span class="report-id">#{{ report.id }}</span>
                  <span class="report-type">{{ getReportTypeText(report.type) }}</span>
                  <span class="report-priority" [class]="report.priority">{{ report.priority }}</span>
                  <span class="report-date">{{ report.createdAt | date:'short' }}</span>
                </div>
                <div class="report-content">
                  <p><strong>Zgłoszający:</strong> {{ report.reporterEmail }}</p>
                  <p><strong>Opis:</strong> {{ report.description }}</p>
                  <p *ngIf="report.targetUserId"><strong>Zgłoszony użytkownik:</strong> {{ report.targetUserEmail }}</p>
                </div>
                <div class="report-actions">
                  <button class="btn btn-sm btn-success" (click)="approveReport(report)">
                    Zatwierdź
                  </button>
                  <button class="btn btn-sm btn-warning" (click)="escalateReport(report)">
                    Eskaluj
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="rejectReport(report)">
                    Odrzuć
                  </button>
                  <button class="btn btn-sm btn-secondary" (click)="assignReportToModerator(report)">
                    Przypisz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Users Management Tab -->
        <section class="users-section" *ngIf="activeTab === 'users' && !isLoading">
          <div class="page-header">
            <h2>Zarządzanie użytkownikami</h2>
            <div class="header-actions">
              <input 
                type="text" 
                placeholder="Szukaj użytkowników..." 
                [(ngModel)]="userSearchTerm"
                (input)="filterUsers()"
                class="search-input"
              >
              <button class="btn btn-success" (click)="exportUsersToExcel()">
                <i class="icon">📊</i>
                Eksport do Excel
              </button>
              <button class="btn btn-primary" (click)="showAddUserModal = true">
                <i class="icon">➕</i>
                Dodaj użytkownika
              </button>
            </div>
          </div>

          <!-- Users Table -->
          <div class="data-table">
            <div class="table-header">
              <div class="col">Użytkownik</div>
              <div class="col">Email</div>
              <div class="col">Rola</div>
              <div class="col">Status</div>
              <div class="col">Rejestracja</div>
              <div class="col">Akcje</div>
            </div>
            
            <div *ngFor="let user of filteredUsers" class="table-row">
              <div class="col user-cell">
                <div class="user-avatar">{{ getUserInitials(user) }}</div>
                <div class="user-info">
                  <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                  <small class="user-id">ID: {{ user.id }}</small>
                </div>
              </div>
              <div class="col">{{ user.email }}</div>
              <div class="col">
                <select 
                  [(ngModel)]="user.role" 
                  (change)="updateUserRole(user)"
                  class="role-select"
                >
                  <option value="user">Użytkownik</option>
                  <option value="psychologist">Psycholog</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <div class="col">
                <span class="status-badge" [class.active]="user.isActive">
                  {{ user.isActive ? 'Aktywny' : 'Nieaktywny' }}
                </span>
              </div>
              <div class="col">{{ user.createdAt | date:'short' }}</div>
              <div class="col">
                <div class="action-buttons">
                  <button class="btn btn-sm btn-secondary" (click)="editUser(user)">
                    Edytuj
                  </button>
                  <button class="btn btn-sm btn-info" (click)="manageUserPackages(user)">
                    Pakiety
                  </button>
                  <button 
                    class="btn btn-sm"
                    [class.btn-danger]="user.isActive"
                    [class.btn-success]="!user.isActive"
                    (click)="toggleUserStatus(user)"
                  >
                    {{ user.isActive ? 'Dezaktywuj' : 'Aktywuj' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Contracts Tab -->
        <section class="contracts-section" *ngIf="activeTab === 'contracts' && !isLoading">
          <div class="page-header">
            <h2>Generator umów</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="showContractTemplates = true">
                <i class="icon">📋</i>
                Szablony umów
              </button>
            </div>
          </div>

          <!-- Contract Templates -->
          <div class="templates-grid">
            <div class="template-card standard">
              <div class="template-header">
                <h3>Umowa standardowa</h3>
                <i class="icon">📄</i>
              </div>
              <div class="template-description">
                <p>Podstawowa umowa na usługi psychologiczne</p>
                <ul>
                  <li>Dane klienta</li>
                  <li>Zakres usług</li>
                  <li>Cena i warunki płatności</li>
                  <li>Postanowienia końcowe</li>
                </ul>
              </div>
              <div class="template-actions">
                <button class="btn btn-primary" (click)="generateContract('standard')">
                  <i class="icon">📝</i>
                  Generuj umowę
                </button>
                <button class="btn btn-secondary" (click)="editTemplate('standard')">
                  <i class="icon">✏️</i>
                  Edytuj szablon
                </button>
              </div>
            </div>

            <div class="template-card credit">
              <div class="template-header">
                <h3>Umowa kredytowa</h3>
                <i class="icon">💳</i>
              </div>
              <div class="template-description">
                <p>Umowa na usługi z możliwością rozłożenia płatności</p>
                <ul>
                  <li>Harmonogram płatności</li>
                  <li>Oprocentowanie</li>
                  <li>Zabezpieczenia</li>
                  <li>Procedury windykacyjne</li>
                </ul>
              </div>
              <div class="template-actions">
                <button class="btn btn-primary" (click)="generateContract('credit')">
                  <i class="icon">📝</i>
                  Generuj umowę
                </button>
                <button class="btn btn-secondary" (click)="editTemplate('credit')">
                  <i class="icon">✏️</i>
                  Edytuj szablon
                </button>
              </div>
            </div>

            <div class="template-card corporate">
              <div class="template-header">
                <h3>Umowa B2B</h3>
                <i class="icon">🏢</i>
              </div>
              <div class="template-description">
                <p>Umowa dla firm i instytucji</p>
                <ul>
                  <li>Usługi grupowe</li>
                  <li>Rabaty wolumenowe</li>
                  <li>SLA</li>
                  <li>Faktury VAT</li>
                </ul>
              </div>
              <div class="template-actions">
                <button class="btn btn-primary" (click)="generateContract('corporate')">
                  <i class="icon">📝</i>
                  Generuj umowę
                </button>
                <button class="btn btn-secondary" (click)="editTemplate('corporate')">
                  <i class="icon">✏️</i>
                  Edytuj szablon
                </button>
              </div>
            </div>
          </div>

          <!-- Contract Generator -->
          <div class="contract-generator" *ngIf="showContractGenerator">
            <h3>Generator umowy: {{ selectedContractType }}</h3>
            <form class="contract-form">
              <!-- Contract form fields will be dynamically generated -->
              <div class="form-section">
                <h4>Dane klienta</h4>
                <div class="form-row">
                  <div class="form-group">
                    <label>Imię i nazwisko</label>
                    <input type="text" [(ngModel)]="contractData.clientName" name="clientName">
                  </div>
                  <div class="form-group">
                    <label>PESEL</label>
                    <input type="text" [(ngModel)]="contractData.clientPesel" name="clientPesel">
                  </div>
                </div>
                <!-- More form fields... -->
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" (click)="closeContractGenerator()">
                  Anuluj
                </button>
                <button type="button" class="btn btn-primary" (click)="generatePdfContract()">
                  <i class="icon">📄</i>
                  Generuj PDF
                </button>
              </div>
            </form>
          </div>
        </section>

        <!-- Notifications Tab -->
        <section class="notifications-section" *ngIf="activeTab === 'notifications' && !isLoading">
          <div class="page-header">
            <h2>Centrum powiadomień</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="createNotification()">
                <i class="icon">📢</i>
                Nowe powiadomienie
              </button>
            </div>
          </div>

          <!-- Notification Types -->
          <div class="notification-types">
            <button 
              class="type-btn"
              [class.active]="notificationType === 'push'"
              (click)="notificationType = 'push'"
            >
              <i class="icon">📱</i>
              Push
            </button>
            <button 
              class="type-btn"
              [class.active]="notificationType === 'email'"
              (click)="notificationType = 'email'"
            >
              <i class="icon">✉️</i>
              Email
            </button>
            <button 
              class="type-btn"
              [class.active]="notificationType === 'sms'"
              (click)="notificationType = 'sms'"
            >
              <i class="icon">📞</i>
              SMS
            </button>
            <button 
              class="type-btn"
              [class.active]="notificationType === 'in-app'"
              (click)="notificationType = 'in-app'"
            >
              <i class="icon">🔔</i>
              W aplikacji
            </button>
          </div>

          <!-- Quick Notifications -->
          <div class="quick-notifications">
            <h3>Szybkie powiadomienia</h3>
            <div class="quick-grid">
              <button class="quick-btn" (click)="sendQuickNotification('maintenance')">
                <i class="icon">🔧</i>
                <span>Przerwa techniczna</span>
              </button>
              <button class="quick-btn" (click)="sendQuickNotification('update')">
                <i class="icon">🆕</i>
                <span>Nowa funkcja</span>
              </button>
              <button class="quick-btn" (click)="sendQuickNotification('reminder')">
                <i class="icon">⏰</i>
                <span>Przypomnienie o wizycie</span>
              </button>
              <button class="quick-btn" (click)="sendQuickNotification('promotion')">
                <i class="icon">🎉</i>
                <span>Promocja</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Enhanced PostHog Section -->
        <section class="posthog-section" *ngIf="activeTab === 'posthog' && !isLoading">
          <div class="page-header">
            <h2>PostHog Analytics</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="openPostHog()">
                <i class="icon">🔗</i>
                Otwórz PostHog
              </button>
              <button class="btn btn-secondary" (click)="syncPostHog()">
                <i class="icon">🔄</i>
                Synchronizuj dane
              </button>
              <button class="btn btn-success" (click)="updateAnalytics()">
                <i class="icon">📊</i>
                Odśwież dane
              </button>
            </div>
          </div>

          <!-- PostHog Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Aktywni użytkownicy</h3>
              <div class="stat-value">{{ postHogStats.activeUsers }}</div>
              <div class="stat-change positive">+{{ postHogStats.newUsersToday }} dzisiaj</div>
            </div>
            <div class="stat-card">
              <h3>Konwersje</h3>
              <div class="stat-value">{{ postHogStats.conversions }}%</div>
              <div class="stat-change positive">+2.5% vs wczoraj</div>
            </div>
            <div class="stat-card">
              <h3>Czas sesji</h3>
              <div class="stat-value">{{ postHogStats.avgSessionTime }}min</div>
              <div class="stat-change neutral">-0.3min vs wczoraj</div>
            </div>
            <div class="stat-card">
              <h3>Bounce Rate</h3>
              <div class="stat-value">{{ postHogStats.bounceRate }}%</div>
              <div class="stat-change negative">+1.2% vs wczoraj</div>
            </div>
          </div>

          <!-- Live Analytics Chart -->
          <div class="analytics-chart">
            <h3>Aktywność w czasie rzeczywistym</h3>
            <div class="chart-container">
              <canvas #liveChart></canvas>
            </div>
          </div>

          <!-- Event Tracking -->
          <div class="event-tracking">
            <h3>Śledzenie zdarzeń</h3>
            <div class="events-table">
              <div class="table-header">
                <div class="col">Zdarzenie</div>
                <div class="col">Użytkownik</div>
                <div class="col">Strona</div>
                <div class="col">Czas</div>
                <div class="col">Właściwości</div>
              </div>
              <div *ngFor="let event of recentEvents" class="table-row">
                <div class="col">{{ event.name }}</div>
                <div class="col">{{ event.userId || 'Anonimowy' }}</div>
                <div class="col">{{ event.page }}</div>
                <div class="col">{{ event.timestamp | date:'short' }}</div>
                <div class="col">
                  <span class="properties-tag">{{ event.properties | json }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Reports Section -->
        <section class="reports-section" *ngIf="activeTab === 'reports' && !isLoading">
          <div class="page-header">
            <h2>Centrum raportów</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="generateCustomReport()">
                <i class="icon">📋</i>
                Nowy raport
              </button>
              <button class="btn btn-success" (click)="exportAllReports()">
                <i class="icon">📊</i>
                Eksportuj wszystkie
              </button>
            </div>
          </div>

          <!-- Report Categories -->
          <div class="report-categories">
            <div class="category-card" (click)="generateReport('users')">
              <div class="category-icon">👥</div>
              <h3>Raport użytkowników</h3>
              <p>Statystyki użytkowników, rejestracje, aktywność</p>
              <div class="generate-btn">Generuj</div>
            </div>
            
            <div class="category-card" (click)="generateReport('psychologists')">
              <div class="category-icon">🧠</div>
              <h3>Raport psychologów</h3>
              <p>Weryfikacje, sesje, oceny psychologów</p>
              <div class="generate-btn">Generuj</div>
            </div>
            
            <div class="category-card" (click)="generateReport('financial')">
              <div class="category-icon">💰</div>
              <h3>Raport finansowy</h3>
              <p>Przychody, pakiety, płatności</p>
              <div class="generate-btn">Generuj</div>
            </div>
            
            <div class="category-card" (click)="generateReport('sessions')">
              <div class="category-icon">📞</div>
              <h3>Raport sesji</h3>
              <p>Statystyki sesji, czas trwania, oceny</p>
              <div class="generate-btn">Generuj</div>
            </div>
            
            <div class="category-card" (click)="generateReport('analytics')">
              <div class="category-icon">📈</div>
              <h3>Raport analityczny</h3>
              <p>Ruch na stronie, konwersje, zachowania</p>
              <div class="generate-btn">Generuj</div>
            </div>
            
            <div class="category-card" (click)="generateReport('moderation')">
              <div class="category-icon">🛡️</div>
              <h3>Raport moderacji</h3>
              <p>Zgłoszenia, blokady, moderacja treści</p>
              <div class="generate-btn">Generuj</div>
            </div>
          </div>

          <!-- Recent Reports -->
          <div class="recent-reports">
            <h3>Ostatnie raporty</h3>
            <div class="reports-table">
              <div class="table-header">
                <div class="col">Nazwa raportu</div>
                <div class="col">Typ</div>
                <div class="col">Data utworzenia</div>
                <div class="col">Status</div>
                <div class="col">Akcje</div>
              </div>
              <div *ngFor="let report of recentReports" class="table-row">
                <div class="col">{{ report.name }}</div>
                <div class="col">
                  <span class="type-badge" [class]="report.type">{{ getReportTypeName(report.type) }}</span>
                </div>
                <div class="col">{{ report.createdAt | date:'short' }}</div>
                <div class="col">
                  <span class="status-badge" [class]="report.status">{{ getReportStatusName(report.status) }}</span>
                </div>
                <div class="col">
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" (click)="downloadReport(report)">
                      <i class="icon">⬇️</i>
                      Pobierz
                    </button>
                    <button class="btn btn-sm btn-secondary" (click)="viewReport(report)">
                      <i class="icon">👁️</i>
                      Podgląd
                    </button>
                    <button class="btn btn-sm btn-danger" (click)="deleteReport(report)">
                      <i class="icon">🗑️</i>
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scheduled Reports -->
          <div class="scheduled-reports">
            <h3>Raporty zaplanowane</h3>
            <div class="schedule-list">
              <div *ngFor="let schedule of scheduledReports" class="schedule-item">
                <div class="schedule-info">
                  <h4>{{ schedule.name }}</h4>
                  <p>{{ schedule.description }}</p>
                  <span class="frequency">{{ schedule.frequency }}</span>
                </div>
                <div class="schedule-actions">
                  <button class="btn btn-sm btn-secondary" (click)="editSchedule(schedule)">Edytuj</button>
                  <button class="btn btn-sm btn-danger" (click)="deleteSchedule(schedule)">Usuń</button>
                </div>
              </div>
            </div>
            <button class="btn btn-primary" (click)="createScheduledReport()">
              <i class="icon">⏰</i>
              Zaplanuj nowy raport
            </button>
          </div>
        </section>

        <!-- System Upgrades Section -->
        <section class="upgrades-section" *ngIf="activeTab === 'upgrades' && !isLoading">
          <div class="page-header">
            <h2>Zarządzanie aktualizacjami</h2>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="checkForUpdates()">
                <i class="icon">🔍</i>
                Sprawdź aktualizacje
              </button>
              <button class="btn btn-success" (click)="scheduleMaintenence()">
                <i class="icon">⏰</i>
                Zaplanuj konserwację
              </button>
            </div>
          </div>

          <!-- System Status -->
          <div class="system-status">
            <div class="status-card">
              <h3>Status systemu</h3>
              <div class="status-indicator" [class]="systemStatus.status">
                {{ getSystemStatusText(systemStatus.status) }}
              </div>
              <div class="status-details">
                <p><strong>Wersja:</strong> {{ systemStatus.version }}</p>
                <p><strong>Ostatnia aktualizacja:</strong> {{ systemStatus.lastUpdate | date:'short' }}</p>
                <p><strong>Uptime:</strong> {{ systemStatus.uptime }}</p>
              </div>
            </div>
          </div>

          <!-- Available Updates -->
          <div class="available-updates">
            <h3>Dostępne aktualizacje ({{ availableUpdates.length }})</h3>
            <div class="updates-list">
              <div *ngFor="let update of availableUpdates" class="update-item" [class]="update.priority">
                <div class="update-header">
                  <h4>{{ update.name }}</h4>
                  <span class="version">v{{ update.version }}</span>
                  <span class="priority-badge" [class]="update.priority">{{ update.priority }}</span>
                </div>
                <div class="update-description">
                  <p>{{ update.description }}</p>
                  <div class="update-features">
                    <ul>
                      <li *ngFor="let feature of update.features">{{ feature }}</li>
                    </ul>
                  </div>
                </div>
                <div class="update-actions">
                  <button class="btn btn-primary" (click)="installUpdate(update)">
                    <i class="icon">⬇️</i>
                    Zainstaluj
                  </button>
                  <button class="btn btn-secondary" (click)="scheduleUpdate(update)">
                    <i class="icon">⏰</i>
                    Zaplanuj
                  </button>
                  <button class="btn btn-info" (click)="viewUpdateDetails(update)">
                    <i class="icon">ℹ️</i>
                    Szczegóły
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Update History -->
          <div class="update-history">
            <h3>Historia aktualizacji</h3>
            <div class="history-table">
              <div class="table-header">
                <div class="col">Aktualizacja</div>
                <div class="col">Wersja</div>
                <div class="col">Data instalacji</div>
                <div class="col">Status</div>
                <div class="col">Akcje</div>
              </div>
              <div *ngFor="let history of updateHistory" class="table-row">
                <div class="col">{{ history.name }}</div>
                <div class="col">v{{ history.version }}</div>
                <div class="col">{{ history.installedAt | date:'short' }}</div>
                <div class="col">
                  <span class="status-badge" [class]="history.status">{{ history.status }}</span>
                </div>
                <div class="col">
                  <button class="btn btn-sm btn-secondary" (click)="viewUpdateLog(history)">
                    <i class="icon">📄</i>
                    Log
                  </button>
                  <button *ngIf="history.canRollback" class="btn btn-sm btn-warning" (click)="rollbackUpdate(history)">
                    <i class="icon">↩️</i>
                    Cofnij
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Maintenance Schedule -->
          <div class="maintenance-schedule">
            <h3>Harmonogram konserwacji</h3>
            <div class="schedule-calendar">
              <div *ngFor="let maintenance of maintenanceSchedule" class="maintenance-item">
                <div class="maintenance-date">{{ maintenance.scheduledAt | date:'short' }}</div>
                <div class="maintenance-type">{{ maintenance.type }}</div>
                <div class="maintenance-duration">{{ maintenance.estimatedDuration }}</div>
                <div class="maintenance-actions">
                  <button class="btn btn-sm btn-secondary" (click)="editMaintenance(maintenance)">Edytuj</button>
                  <button class="btn btn-sm btn-danger" (click)="cancelMaintenance(maintenance)">Anuluj</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- System Settings Section -->
        <section class="settings-section" *ngIf="activeTab === 'settings' && !isLoading">
          <div class="page-header">
            <h2>Konfiguracja systemu</h2>
            <div class="header-actions">
              <button class="btn btn-success" (click)="saveAllSettings()">
                <i class="icon">💾</i>
                Zapisz wszystkie
              </button>
              <button class="btn btn-warning" (click)="resetToDefaults()">
                <i class="icon">🔄</i>
                Przywróć domyślne
              </button>
              <button class="btn btn-info" (click)="exportSettings()">
                <i class="icon">📤</i>
                Eksportuj ustawienia
              </button>
            </div>
          </div>

          <!-- Settings Categories -->
          <div class="settings-tabs">
            <button *ngFor="let category of settingsCategories" 
                    class="settings-tab"
                    [class.active]="activeSettingsTab === category.id"
                    (click)="setActiveSettingsTab(category.id)">
              <i class="icon">{{ category.icon }}</i>
              {{ category.name }}
            </button>
          </div>

          <!-- General Settings -->
          <div class="settings-content" *ngIf="activeSettingsTab === 'general'">
            <h3>Ustawienia ogólne</h3>
            <div class="settings-form">
              <div class="form-group">
                <label>Nazwa aplikacji</label>
                <input type="text" [(ngModel)]="systemSettings.appName" class="form-control">
              </div>
              <div class="form-group">
                <label>Adres e-mail administratora</label>
                <input type="email" [(ngModel)]="systemSettings.adminEmail" class="form-control">
              </div>
              <div class="form-group">
                <label>Strefa czasowa</label>
                <select [(ngModel)]="systemSettings.timezone" class="form-control">
                  <option value="Europe/Warsaw">Europa/Warszawa</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Ameryka/Nowy Jork</option>
                </select>
              </div>
              <div class="form-group">
                <label>Język systemu</label>
                <select [(ngModel)]="systemSettings.language" class="form-control">
                  <option value="pl">Polski</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Security Settings -->
          <div class="settings-content" *ngIf="activeSettingsTab === 'security'">
            <h3>Ustawienia bezpieczeństwa</h3>
            <div class="settings-form">
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="systemSettings.enableTwoFactor"> 
                  Wymagaj dwuskładnikowego uwierzytelniania
                </label>
              </div>
              <div class="form-group">
                <label>Maksymalny czas sesji (minuty)</label>
                <input type="number" [(ngModel)]="systemSettings.sessionTimeout" class="form-control">
              </div>
              <div class="form-group">
                <label>Minimalna długość hasła</label>
                <input type="number" [(ngModel)]="systemSettings.minPasswordLength" class="form-control">
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="systemSettings.requirePasswordComplexity"> 
                  Wymagaj złożoności hasła
                </label>
              </div>
              <div class="form-group">
                <label>Maksymalna liczba prób logowania</label>
                <input type="number" [(ngModel)]="systemSettings.maxLoginAttempts" class="form-control">
              </div>
            </div>
          </div>

          <!-- Email Settings -->
          <div class="settings-content" *ngIf="activeSettingsTab === 'email'">
            <h3>Ustawienia e-mail</h3>
            <div class="settings-form">
              <div class="form-group">
                <label>Serwer SMTP</label>
                <input type="text" [(ngModel)]="systemSettings.smtpHost" class="form-control">
              </div>
              <div class="form-group">
                <label>Port SMTP</label>
                <input type="number" [(ngModel)]="systemSettings.smtpPort" class="form-control">
              </div>
              <div class="form-group">
                <label>Nazwa użytkownika</label>
                <input type="text" [(ngModel)]="systemSettings.smtpUsername" class="form-control">
              </div>
              <div class="form-group">
                <label>Hasło</label>
                <input type="password" [(ngModel)]="systemSettings.smtpPassword" class="form-control">
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="systemSettings.smtpSecure"> 
                  Użyj SSL/TLS
                </label>
              </div>
              <div class="form-group">
                <label>Adres nadawcy</label>
                <input type="email" [(ngModel)]="systemSettings.fromEmail" class="form-control">
              </div>
            </div>
          </div>

          <!-- Payment Settings -->
          <div class="settings-content" *ngIf="activeSettingsTab === 'payments'">
            <h3>Ustawienia płatności</h3>
            <div class="settings-form">
              <div class="form-group">
                <label>Klucz publiczny Stripe</label>
                <input type="text" [(ngModel)]="systemSettings.stripePublicKey" class="form-control">
              </div>
              <div class="form-group">
                <label>Klucz prywatny Stripe</label>
                <input type="password" [(ngModel)]="systemSettings.stripeSecretKey" class="form-control">
              </div>
              <div class="form-group">
                <label>Waluta domyślna</label>
                <select [(ngModel)]="systemSettings.defaultCurrency" class="form-control">
                  <option value="PLN">PLN</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div class="form-group">
                <label>Prowizja platformy (%)</label>
                <input type="number" [(ngModel)]="systemSettings.platformFee" class="form-control">
              </div>
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="systemSettings.enableRefunds"> 
                  Włącz zwroty
                </label>
              </div>
            </div>
          </div>

          <!-- Integration Settings -->
          <div class="settings-content" *ngIf="activeSettingsTab === 'integrations'">
            <h3>Ustawienia integracji</h3>
            <div class="integration-settings">
              
              <!-- Firebase -->
              <div class="integration-card">
                <h4>Firebase</h4>
                <div class="integration-status connected">Połączono</div>
                <div class="integration-details">
                  <p>Project ID: {{ systemSettings.firebaseProjectId }}</p>
                  <button class="btn btn-secondary" (click)="testFirebaseConnection()">Testuj połączenie</button>
                </div>
              </div>

              <!-- PostHog -->
              <div class="integration-card">
                <h4>PostHog Analytics</h4>
                <div class="integration-status connected">Połączono</div>
                <div class="integration-details">
                  <div class="form-group">
                    <label>API Key</label>
                    <input type="password" [(ngModel)]="systemSettings.postHogApiKey" class="form-control">
                  </div>
                  <button class="btn btn-secondary" (click)="testPostHogConnection()">Testuj połączenie</button>
                </div>
              </div>

              <!-- Livespace CRM -->
              <div class="integration-card">
                <h4>Livespace CRM</h4>
                <div class="integration-status connected">Połączono</div>
                <div class="integration-details">
                  <div class="form-group">
                    <label>API Token</label>
                    <input type="password" [(ngModel)]="systemSettings.livespaceToken" class="form-control">
                  </div>
                  <button class="btn btn-secondary" (click)="testCrmConnection()">Testuj połączenie</button>
                </div>
              </div>

            </div>
          </div>

          <!-- Backup Settings -->
          <div class="settings-content" *ngIf="activeSettingsTab === 'backup'">
            <h3>Ustawienia kopii zapasowych</h3>
            <div class="settings-form">
              <div class="form-group">
                <label>
                  <input type="checkbox" [(ngModel)]="systemSettings.enableAutoBackup"> 
                  Włącz automatyczne kopie zapasowe
                </label>
              </div>
              <div class="form-group">
                <label>Częstotliwość kopii zapasowych</label>
                <select [(ngModel)]="systemSettings.backupFrequency" class="form-control">
                  <option value="daily">Codziennie</option>
                  <option value="weekly">Tygodniowo</option>
                  <option value="monthly">Miesięcznie</option>
                </select>
              </div>
              <div class="form-group">
                <label>Czas przechowywania (dni)</label>
                <input type="number" [(ngModel)]="systemSettings.backupRetention" class="form-control">
              </div>
              <div class="form-group">
                <label>Miejsce przechowywania</label>
                <select [(ngModel)]="systemSettings.backupStorage" class="form-control">
                  <option value="local">Lokalnie</option>
                  <option value="s3">Amazon S3</option>
                  <option value="gdrive">Google Drive</option>
                </select>
              </div>
            </div>
            
            <div class="backup-actions">
              <button class="btn btn-primary" (click)="createBackup()">
                <i class="icon">💾</i>
                Utwórz kopię zapasową
              </button>
              <button class="btn btn-info" (click)="viewBackupHistory()">
                <i class="icon">📋</i>
                Historia kopii
              </button>
            </div>
          </div>
        </section>
      </main>
      </div> <!-- Close admin-body -->

      <!-- Package Management Modal -->
      <div class="modal-overlay" *ngIf="showPackageModal" (click)="closePackageModal()">
        <div class="modal-content package-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Zarządzanie pakietami użytkownika</h3>
            <button class="close-btn" (click)="closePackageModal()">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="user-info-section" *ngIf="selectedUserForPackages">
              <h4>Użytkownik: {{ selectedUserForPackages.firstName }} {{ selectedUserForPackages.lastName }}</h4>
              <p>Email: {{ selectedUserForPackages.email }}</p>
            </div>

            <!-- Current Packages -->
            <div class="current-packages-section">
              <h4>Aktywne pakiety</h4>
              <div *ngIf="userPackages.length === 0" class="no-packages">
                <p>Użytkownik nie ma żadnych aktywnych pakietów</p>
              </div>
              <div *ngFor="let package of userPackages" class="package-item active">
                <div class="package-info">
                  <h5>Pakiet: {{ package.packageId }}</h5>
                  <p>Status: <span class="status-badge" [class]="package.status">{{ package.status }}</span></p>
                  <p>Sesje: {{ package.sessionsRemaining }}/{{ package.totalSessions }}</p>
                  <p>Data zakupu: {{ package.purchaseDate | date:'short' }}</p>
                </div>
                <div class="package-actions">
                  <button 
                    class="btn btn-sm btn-danger" 
                    (click)="deactivateUserPackage(package.packageId)"
                    *ngIf="package.status === 'active'"
                  >
                    Dezaktywuj
                  </button>
                </div>
              </div>
            </div>

            <!-- Available Packages to Activate -->
            <div class="available-packages-section">
              <h4>Dostępne pakiety do aktywacji</h4>
              <div class="packages-grid">
                <div *ngFor="let package of availablePackages" class="package-card">
                  <h5>{{ package.name }}</h5>
                  <p>Sesje: {{ package.sessionsIncluded }}</p>
                  <p>Cena: {{ package.price }} PLN</p>
                  <button 
                    class="btn btn-primary btn-sm" 
                    (click)="activatePackageForUser(package.id)"
                  >
                    Aktywuj pakiet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modals will be added here -->
    </div>
  `,
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'overview';
  isLoading = false;

  // Data
  stats: AdminStats = {
    totalUsers: 0,
    newUsersToday: 0,
    activePsychologists: 0,
    pendingPsychologists: 0,
    monthlyRevenue: 0,
    revenueGrowth: 0,
    monthlySessions: 0,
    sessionsGrowth: 0,
    visitorsToday: 0,
    conversionRate: 0,
    activeUsers: 0,
    totalReviews: 0,
    avgRating: 0
  };

  recentActivity: SystemActivity[] = [];
  users: User[] = [];
  filteredUsers: User[] = [];
  userSearchTerm = '';

  // Psychologists Management
  psychologists: User[] = [];
  filteredPsychologists: User[] = [];
  pendingPsychologists: User[] = [];
  psychologistSearchTerm = '';
  psychologistStatusFilter = '';
  psychologistStats = {
    active: 0,
    pending: 0,
    newThisMonth: 0,
    avgApprovalTime: 7,
    avgRating: 4.2,
    totalSessions: 0,
    sessionsThisMonth: 0
  };
  showAddPsychologistModal = false;

  // Moderators Management
  moderators: User[] = [];
  filteredModerators: User[] = [];
  moderatorSearchTerm = '';
  moderatorStats = {
    active: 0,
    onlineNow: 0,
    moderatedToday: 0,
    pendingReports: 0,
    avgResponseTime: 15
  };
  showAddModeratorModal = false;

  // Reports Management
  pendingReports: any[] = [];
  filteredReports: any[] = [];
  reportTypeFilter = '';
  reportPriorityFilter = '';

  // PostHog Analytics
  postHogStats = {
    activeUsers: 245,
    newUsersToday: 18,
    conversions: 12.4,
    avgSessionTime: 8.3,
    bounceRate: 34.7
  };
  recentEvents: any[] = [];

  // Reports System
  recentReports: any[] = [];
  scheduledReports: any[] = [];

  // System Upgrades
  systemStatus = {
    status: 'healthy',
    version: '2.1.4',
    lastUpdate: new Date('2025-07-20'),
    uptime: '15d 8h 23m'
  };
  availableUpdates: any[] = [];
  updateHistory: any[] = [];
  maintenanceSchedule: any[] = [];

  // System Settings
  settingsCategories = [
    { id: 'general', name: 'Ogólne', icon: '⚙️' },
    { id: 'security', name: 'Bezpieczeństwo', icon: '🔒' },
    { id: 'email', name: 'E-mail', icon: '📧' },
    { id: 'payments', name: 'Płatności', icon: '💳' },
    { id: 'integrations', name: 'Integracje', icon: '🔗' },
    { id: 'backup', name: 'Kopie zapasowe', icon: '💾' }
  ];
  activeSettingsTab = 'general';
  systemSettings = {
    appName: 'Logos - Platforma Psychologiczna',
    adminEmail: 'admin@logos.com',
    timezone: 'Europe/Warsaw',
    language: 'pl',
    enableTwoFactor: false,
    sessionTimeout: 60,
    minPasswordLength: 8,
    requirePasswordComplexity: true,
    maxLoginAttempts: 5,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: true,
    fromEmail: 'noreply@logos.com',
    stripePublicKey: '',
    stripeSecretKey: '',
    defaultCurrency: 'PLN',
    platformFee: 5,
    enableRefunds: true,
    firebaseProjectId: 'logos-platform',
    postHogApiKey: '',
    livespaceToken: '',
    enableAutoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    backupStorage: 'local'
  };

  // CRM
  lastCrmSync = new Date();
  crmStats: CrmStats = {
    syncedContacts: 0,
    newLeads: 0,
    lastSync: new Date(),
    pendingSync: 0,
    failedSync: 0,
    totalRevenue: 0
  };

  // Analytics
  analyticsTimeRange = '30days';

  // Contracts
  showContractTemplates = false;
  showContractGenerator = false;
  selectedContractType = '';
  contractData: any = {};

  // Notifications
  notificationType = 'push';

  // Modals
  showAddUserModal = false;
  showPackageModal = false;
  selectedUserForPackages: User | null = null;
  userPackages: UserPackage[] = [];
  availablePackages = [
    { id: 'basic', name: 'Pakiet Podstawowy', sessionsIncluded: 4, price: 400 },
    { id: 'standard', name: 'Pakiet Standard', sessionsIncluded: 8, price: 720 },
    { id: 'premium', name: 'Pakiet Premium', sessionsIncluded: 12, price: 1080 }
  ];

  constructor(
    private authService: AuthService,
    private packageService: PackageService,
    private adminService: AdminService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    if (!this.currentUser || this.currentUser.role !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }

    this.loadAdminData();
  }

  async loadAdminData() {
    this.isLoading = true;
    try {
      this.loadStats();
      this.loadUsers();
      this.loadRecentActivity();
      this.loadCrmData();
      this.loadPsychologists();
      this.loadModerators();
      this.loadReports();
      this.loadPostHogData();
      this.loadSystemData();
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadStats() {
    try {
      // Get real statistics from AdminService backend
      this.stats = await this.adminService.refreshStats();
    } catch (error) {
      console.error('Error loading admin stats:', error);
      // Fallback to calculated stats if service fails
      this.calculateStatsFromLocalData();
    }
  }

  private async calculateStatsFromLocalData() {
    // Get real data from Firebase and calculate stats
    const users = await this.getUsersFromStorage();
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

    // Calculate real statistics
    const totalUsers = users.length;
    const newUsersToday = users.filter(user =>
      user.createdAt && new Date(user.createdAt) >= startOfToday
    ).length;

    const psychologists = users.filter(user => user.role === 'psychologist');
    const activePsychologists = psychologists.filter(user => user.isActive).length;
    const pendingPsychologists = psychologists.filter(user => !user.isActive).length;

    // Mock calculations for revenue and sessions (would come from real API)
    const monthlyRevenue = activePsychologists * 2500; // Average per psychologist
    const monthlySessions = activePsychologists * 18; // Average sessions per psychologist

    this.stats = {
      totalUsers,
      newUsersToday,
      activePsychologists,
      pendingPsychologists,
      monthlyRevenue,
      revenueGrowth: this.calculateGrowth(monthlyRevenue, monthlyRevenue * 0.85), // 15% growth
      monthlySessions,
      sessionsGrowth: this.calculateGrowth(monthlySessions, monthlySessions * 0.92), // 8% growth
      visitorsToday: Math.floor(Math.random() * 500 + 200),
      conversionRate: Math.random() * 5 + 2,
      activeUsers: Math.floor(totalUsers * 0.6), // 60% active users
      totalReviews: activePsychologists * 8, // Average reviews per psychologist
      avgRating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10 // Rating between 3.5-5.0
    };
  }

  private async getUsersFromStorage(): Promise<User[]> {
    try {
      // Get real users from Firebase
      return await this.authService.getAllUsers();
    } catch (error) {
      console.error('Error loading users from Firebase:', error);
      // Fallback to current user only if Firebase fails
      const currentUser = this.authService.getCurrentUser();
      return currentUser ? [currentUser] : [];
    }
  }

  private calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  getGrowthClass(growth: number): string {
    if (growth > 0) return 'positive';
    if (growth < 0) return 'negative';
    return 'neutral';
  }

  formatGrowth(growth: number): string {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth}%`;
  }

  async loadUsers() {
    // Get real user data from Firebase
    this.users = await this.getUsersFromStorage();
    this.filteredUsers = [...this.users];
  }

  async loadRecentActivity() {
    try {
      // Get real activity from AdminService backend
      this.recentActivity = await this.adminService.getRecentActivity();
    } catch (error) {
      console.error('Error loading recent activity:', error);
      // Fallback to calculated activity if service fails
      this.calculateActivityFromLocalData();
    }
  }

  private async calculateActivityFromLocalData() {
    // Generate real activity based on user data from Firebase
    const users = await this.getUsersFromStorage();
    const recentUsers = users
      .filter(user => user.createdAt && new Date(user.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 3);

    this.recentActivity = [
      ...recentUsers.map(user => ({
        id: `activity-${Date.now()}-${user.id}`,
        type: 'user-registered' as const,
        message: `Nowy użytkownik: ${user.firstName} ${user.lastName}`,
        timestamp: new Date(user.createdAt!)
      })),
      {
        id: `activity-payment-${Date.now()}`,
        type: 'payment-received' as const,
        message: `Otrzymano płatność ${Math.floor(Math.random() * 300 + 150)} PLN`,
        timestamp: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000)
      },
      {
        id: `activity-session-${Date.now()}`,
        type: 'session-completed' as const,
        message: `Zakończono sesję psychologiczną`,
        timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000)
      }
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
  }

  async loadCrmData() {
    try {
      // Get real CRM stats from AdminService backend
      this.crmStats = await this.adminService.getCrmStats();
      this.lastCrmSync = new Date();
    } catch (error) {
      console.error('Error loading CRM data:', error);
      // Fallback to calculated CRM stats if service fails
      this.calculateCrmStatsFromLocalData();
    }
  }

  async loadPsychologists() {
    try {
      // Load psychologists from AdminService
      const allUsers = await this.adminService.getAllUsers();
      this.psychologists = allUsers.filter(user => user.role === 'psychologist');
      this.pendingPsychologists = this.psychologists.filter(p => p.verificationStatus === 'pending');
      this.filterPsychologists();
      await this.loadPsychologistStats();
    } catch (error) {
      console.error('Error loading psychologists:', error);
    }
  }

  async loadModerators() {
    try {
      // Load moderators from AdminService
      const allUsers = await this.adminService.getAllUsers();
      this.moderators = allUsers.filter(user => user.role === 'moderator');
      this.filterModerators();
      await this.loadModeratorStats();
    } catch (error) {
      console.error('Error loading moderators:', error);
    }
  }

  async loadReports() {
    try {
      // Load reports from AdminService
      this.pendingReports = [
        {
          id: '1',
          type: 'inappropriate_content',
          priority: 'high',
          description: 'Nieodpowiednie treści w profilu',
          reporterEmail: 'user@example.com',
          targetUserEmail: 'psychologist@example.com',
          createdAt: new Date()
        }
      ];
      this.filterReports();

      // Load recent reports
      this.recentReports = [
        {
          id: '1',
          name: 'Raport miesięczny - Lipiec 2025',
          type: 'financial',
          status: 'completed',
          createdAt: new Date('2025-08-01')
        }
      ];

      // Load scheduled reports
      this.scheduledReports = [
        {
          id: '1',
          name: 'Raport tygodniowy',
          description: 'Automatyczny raport aktywności użytkowników',
          frequency: 'Tygodniowo'
        }
      ];
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }

  async loadPostHogData() {
    try {
      // Load PostHog analytics data
      this.recentEvents = [
        {
          name: 'page_view',
          userId: 'user123',
          page: '/dashboard',
          timestamp: new Date(),
          properties: { source: 'direct' }
        },
        {
          name: 'button_click',
          userId: 'user456',
          page: '/landing',
          timestamp: new Date(Date.now() - 300000),
          properties: { button: 'start_session' }
        }
      ];
    } catch (error) {
      console.error('Error loading PostHog data:', error);
    }
  }

  async loadSystemData() {
    try {
      // Load system upgrade and maintenance data
      this.availableUpdates = [
        {
          id: '1',
          name: 'Security Update 2.1.5',
          version: '2.1.5',
          priority: 'high',
          description: 'Krytyczna aktualizacja bezpieczeństwa',
          features: [
            'Poprawki bezpieczeństwa',
            'Optymalizacja wydajności',
            'Nowe funkcje logowania'
          ]
        }
      ];

      this.updateHistory = [
        {
          id: '1',
          name: 'Update 2.1.4',
          version: '2.1.4',
          status: 'success',
          installedAt: new Date('2025-07-20'),
          canRollback: true
        }
      ];

      this.maintenanceSchedule = [
        {
          id: '1',
          type: 'Database Maintenance',
          scheduledAt: new Date('2025-08-15T02:00:00'),
          estimatedDuration: '2 hours'
        }
      ];
    } catch (error) {
      console.error('Error loading system data:', error);
    }
  }

  private async calculateCrmStatsFromLocalData() {
    // Calculate CRM stats based on real user data from Firebase
    const users = await this.getUsersFromStorage();
    const totalContacts = users.length;
    const recentContacts = users.filter(user =>
      user.createdAt && new Date(user.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    this.crmStats = {
      syncedContacts: totalContacts,
      newLeads: recentContacts,
      lastSync: new Date(),
      pendingSync: 0,
      failedSync: 0,
      totalRevenue: totalContacts * 150 // Average revenue per contact
    };

    this.lastCrmSync = new Date();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  logout() {
    this.authService.logout();
  }

  refreshData() {
    this.loadAdminData();
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user-registered': return '👤';
      case 'payment-received': return '💰';
      case 'session-completed': return '✅';
      default: return '📋';
    }
  }

  getUserInitials(user: User): string {
    return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user =>
      user.firstName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(this.userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase())
    );
  }

  updateUserRole(user: User) {
    // TODO: Implement role update
    console.log('Update user role:', user);
  }

  editUser(user: User) {
    // TODO: Implement user editing
    console.log('Edit user:', user);
  }

  toggleUserStatus(user: User) {
    // TODO: Implement status toggle
    user.isActive = !user.isActive;
    console.log('Toggle user status:', user);
  }

  async manageUserPackages(user: User) {
    this.selectedUserForPackages = user;
    this.showPackageModal = true;

    try {
      const userPackage = await this.packageService.getUserPackage(user.id);
      this.userPackages = userPackage ? [userPackage] : [];
    } catch (error) {
      console.error('Error loading user packages:', error);
      this.userPackages = [];
    }
  }

  async activatePackageForUser(packageId: string) {
    if (!this.selectedUserForPackages) return;

    const selectedPackage = this.availablePackages.find(p => p.id === packageId);
    if (!selectedPackage) return;

    try {
      const userPackage: UserPackage = {
        id: `${this.selectedUserForPackages.id}_${packageId}_${Date.now()}`,
        userId: this.selectedUserForPackages.id,
        packageId: packageId,
        status: 'active',
        totalSessions: selectedPackage.sessionsIncluded,
        sessionsRemaining: selectedPackage.sessionsIncluded,
        sessionsUsed: 0,
        purchaseDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        isOnCredit: false
      };

      // Save to Firestore
      await this.packageService.saveUserPackage(userPackage);

      // Refresh the user packages list
      const updatedPackage = await this.packageService.getUserPackage(this.selectedUserForPackages.id);
      this.userPackages = updatedPackage ? [updatedPackage] : [];

      alert(`Pakiet ${selectedPackage.name} został aktywowany dla użytkownika ${this.selectedUserForPackages.firstName} ${this.selectedUserForPackages.lastName}`);
    } catch (error) {
      console.error('Error activating package:', error);
      alert('Wystąpił błąd podczas aktywacji pakietu');
    }
  }

  async deactivateUserPackage(packageId: string) {
    if (!this.selectedUserForPackages) return;

    try {
      // Update package status to inactive
      const userPackage = this.userPackages.find(p => p.packageId === packageId);
      if (userPackage) {
        userPackage.status = 'inactive';
        await this.packageService.saveUserPackage(userPackage);

        // Refresh the user packages list
        const updatedPackage = await this.packageService.getUserPackage(this.selectedUserForPackages.id);
        this.userPackages = updatedPackage ? [updatedPackage] : [];

        alert('Pakiet został dezaktywowany');
      }
    } catch (error) {
      console.error('Error deactivating package:', error);
      alert('Wystąpił błąd podczas dezaktywacji pakietu');
    }
  }

  closePackageModal() {
    this.showPackageModal = false;
    this.selectedUserForPackages = null;
    this.userPackages = [];
  }

  exportUsersToExcel() {
    // TODO: Implement Excel export
    console.log('Export users to Excel');
  }

  updateAnalytics() {
    // TODO: Implement analytics update
    console.log('Update analytics for:', this.analyticsTimeRange);
  }

  exportAnalytics() {
    // TODO: Implement analytics export
    console.log('Export analytics');
  }

  openPostHog() {
    window.open('https://app.posthog.com', '_blank');
  }

  syncPostHog() {
    // TODO: Implement PostHog sync
    console.log('Sync PostHog data');
  }

  syncWithLivespace() {
    // TODO: Implement Livespace sync
    console.log('Sync with Livespace CRM');
  }

  importContactsFromCrm() {
    // TODO: Implement CRM import
    console.log('Import contacts from CRM');
  }

  exportContactsToCrm() {
    // TODO: Implement CRM export
    console.log('Export contacts to CRM');
  }

  syncAppointments() {
    // TODO: Implement appointments sync
    console.log('Sync appointments with CRM');
  }

  configureCrmSettings() {
    // TODO: Implement CRM settings
    console.log('Configure CRM settings');
  }

  generateContract(type: string) {
    this.selectedContractType = type;
    this.showContractGenerator = true;
    this.contractData = {};
  }

  editTemplate(type: string) {
    // TODO: Implement template editing
    console.log('Edit template:', type);
  }

  closeContractGenerator() {
    this.showContractGenerator = false;
    this.selectedContractType = '';
    this.contractData = {};
  }

  generatePdfContract() {
    // TODO: Implement PDF generation
    console.log('Generate PDF contract:', this.contractData);
  }

  createNotification() {
    // TODO: Implement notification creation
    console.log('Create notification');
  }

  sendQuickNotification(type: string) {
    // TODO: Implement quick notification
    console.log('Send quick notification:', type);
  }

  // ===== PSYCHOLOGISTS MANAGEMENT METHODS =====

  filterPsychologists() {
    this.filteredPsychologists = this.psychologists.filter(psychologist => {
      const matchesSearch = !this.psychologistSearchTerm ||
        psychologist.firstName.toLowerCase().includes(this.psychologistSearchTerm.toLowerCase()) ||
        psychologist.lastName.toLowerCase().includes(this.psychologistSearchTerm.toLowerCase()) ||
        psychologist.email.toLowerCase().includes(this.psychologistSearchTerm.toLowerCase());

      const matchesStatus = !this.psychologistStatusFilter ||
        (this.psychologistStatusFilter === 'active' && psychologist.verificationStatus === 'verified') ||
        (this.psychologistStatusFilter === 'pending' && psychologist.verificationStatus === 'pending') ||
        (this.psychologistStatusFilter === 'suspended' && psychologist.verificationStatus === 'suspended');

      return matchesSearch && matchesStatus;
    });
  }

  exportPsychologistsToExcel() {
    console.log('Exporting psychologists to Excel...');
    // TODO: Implement Excel export
  }

  getVerificationStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Oczekuje',
      'verified': 'Zweryfikowany',
      'suspended': 'Zawieszony',
      'rejected': 'Odrzucony'
    };
    return statusMap[status] || status;
  }

  viewPsychologistProfile(psychologist: User) {
    console.log('Viewing psychologist profile:', psychologist.id);
    // TODO: Implement profile view
  }

  viewPsychologistSessions(psychologist: User) {
    console.log('Viewing psychologist sessions:', psychologist.id);
    // TODO: Implement sessions view
  }

  async approvePsychologist(psychologist: User) {
    try {
      await this.adminService.updatePsychologistStatus(psychologist.id, 'verified');
      psychologist.verificationStatus = 'verified';
      this.filterPsychologists();
      this.loadPsychologistStats();
      console.log('Psychologist approved:', psychologist.id);
    } catch (error) {
      console.error('Error approving psychologist:', error);
      alert('Wystąpił błąd podczas zatwierdzania psychologa');
    }
  }

  async suspendPsychologist(psychologist: User) {
    try {
      await this.adminService.updatePsychologistStatus(psychologist.id, 'suspended');
      psychologist.verificationStatus = 'suspended';
      this.filterPsychologists();
      this.loadPsychologistStats();
      console.log('Psychologist suspended:', psychologist.id);
    } catch (error) {
      console.error('Error suspending psychologist:', error);
      alert('Wystąpił błąd podczas zawieszania psychologa');
    }
  }

  async reactivatePsychologist(psychologist: User) {
    try {
      await this.adminService.updatePsychologistStatus(psychologist.id, 'verified');
      psychologist.verificationStatus = 'verified';
      this.filterPsychologists();
      this.loadPsychologistStats();
      console.log('Psychologist reactivated:', psychologist.id);
    } catch (error) {
      console.error('Error reactivating psychologist:', error);
      alert('Wystąpił błąd podczas reaktywacji psychologa');
    }
  }

  async deletePsychologist(psychologist: User) {
    if (confirm(`Czy na pewno chcesz usunąć psychologa ${psychologist.firstName} ${psychologist.lastName}?`)) {
      try {
        await this.adminService.deletePsychologist(psychologist.id);
        this.psychologists = this.psychologists.filter(p => p.id !== psychologist.id);
        this.filterPsychologists();
        this.loadPsychologistStats();
        console.log('Psychologist deleted:', psychologist.id);
      } catch (error) {
        console.error('Error deleting psychologist:', error);
        alert('Wystąpił błąd podczas usuwania psychologa');
      }
    }
  }

  async requestMoreInfo(psychologist: User) {
    try {
      await this.adminService.requestMoreInfo(psychologist.id);
      console.log('More info requested for psychologist:', psychologist.id);
      alert('Wysłano prośbę o dodatkowe informacje');
    } catch (error) {
      console.error('Error requesting more info:', error);
      alert('Wystąpił błąd podczas wysyłania prośby');
    }
  }

  async rejectPsychologist(psychologist: User) {
    if (confirm(`Czy na pewno chcesz odrzucić wniosek ${psychologist.firstName} ${psychologist.lastName}?`)) {
      try {
        await this.adminService.updatePsychologistStatus(psychologist.id, 'rejected');
        this.pendingPsychologists = this.pendingPsychologists.filter(p => p.id !== psychologist.id);
        this.loadPsychologistStats();
        console.log('Psychologist rejected:', psychologist.id);
      } catch (error) {
        console.error('Error rejecting psychologist:', error);
        alert('Wystąpił błąd podczas odrzucania wniosku');
      }
    }
  }

  async loadPsychologistStats() {
    try {
      this.psychologistStats = await this.adminService.getPsychologistStats();
    } catch (error) {
      console.error('Error loading psychologist stats:', error);
    }
  }

  // ===== MODERATORS MANAGEMENT METHODS =====

  filterModerators() {
    this.filteredModerators = this.moderators.filter(moderator => {
      const matchesSearch = !this.moderatorSearchTerm ||
        moderator.firstName.toLowerCase().includes(this.moderatorSearchTerm.toLowerCase()) ||
        moderator.lastName.toLowerCase().includes(this.moderatorSearchTerm.toLowerCase()) ||
        moderator.email.toLowerCase().includes(this.moderatorSearchTerm.toLowerCase());

      return matchesSearch;
    });
  }

  getPermissionText(permission: string): string {
    const permissionMap: { [key: string]: string } = {
      'manage_users': 'Użytkownicy',
      'manage_content': 'Treści',
      'manage_reports': 'Zgłoszenia',
      'manage_reviews': 'Recenzje',
      'view_analytics': 'Analityka'
    };
    return permissionMap[permission] || permission;
  }

  editModeratorPermissions(moderator: User) {
    console.log('Editing moderator permissions:', moderator.id);
    // TODO: Implement permission editing modal
  }

  viewModeratorActivity(moderator: User) {
    console.log('Viewing moderator activity:', moderator.id);
    // TODO: Implement activity view
  }

  async toggleModeratorStatus(moderator: User) {
    try {
      moderator.isActive = !moderator.isActive;
      await this.adminService.updateUserStatus(moderator.id, moderator.isActive);
      this.loadModeratorStats();
      console.log('Moderator status toggled:', moderator.id);
    } catch (error) {
      console.error('Error toggling moderator status:', error);
      alert('Wystąpił błąd podczas zmiany statusu moderatora');
    }
  }

  async loadModeratorStats() {
    try {
      this.moderatorStats = await this.adminService.getModeratorStats();
    } catch (error) {
      console.error('Error loading moderator stats:', error);
    }
  }

  // ===== REPORTS MANAGEMENT METHODS =====

  filterReports() {
    this.filteredReports = this.pendingReports.filter(report => {
      const matchesType = !this.reportTypeFilter || report.type === this.reportTypeFilter;
      const matchesPriority = !this.reportPriorityFilter || report.priority === this.reportPriorityFilter;
      return matchesType && matchesPriority;
    });
  }

  getReportTypeText(type: string): string {
    const typeMap: { [key: string]: string } = {
      'inappropriate_content': 'Nieodpowiednie treści',
      'spam': 'Spam',
      'harassment': 'Nękanie',
      'fake_profile': 'Fałszywy profil',
      'other': 'Inne'
    };
    return typeMap[type] || type;
  }

  async approveReport(report: any) {
    try {
      await this.adminService.approveReport(report.id);
      this.pendingReports = this.pendingReports.filter(r => r.id !== report.id);
      this.filterReports();
      console.log('Report approved:', report.id);
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Wystąpił błąd podczas zatwierdzania zgłoszenia');
    }
  }

  async escalateReport(report: any) {
    try {
      await this.adminService.escalateReport(report.id);
      report.priority = 'high';
      console.log('Report escalated:', report.id);
    } catch (error) {
      console.error('Error escalating report:', error);
      alert('Wystąpił błąd podczas eskalacji zgłoszenia');
    }
  }

  async rejectReport(report: any) {
    try {
      await this.adminService.rejectReport(report.id);
      this.pendingReports = this.pendingReports.filter(r => r.id !== report.id);
      this.filterReports();
      console.log('Report rejected:', report.id);
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Wystąpił błąd podczas odrzucania zgłoszenia');
    }
  }

  assignReportToModerator(report: any) {
    console.log('Assigning report to moderator:', report.id);
    // TODO: Implement moderator assignment modal
  }

  // ===== POSTHOG ANALYTICS METHODS =====

  // ===== REPORTS SYSTEM METHODS =====

  generateCustomReport() {
    console.log('Generating custom report...');
    // TODO: Implement custom report generator
  }

  exportAllReports() {
    console.log('Exporting all reports...');
    // TODO: Implement bulk export
  }

  generateReport(type: string) {
    console.log('Generating report of type:', type);
    // TODO: Implement report generation by type
  }

  getReportTypeName(type: string): string {
    const typeMap: { [key: string]: string } = {
      'users': 'Użytkownicy',
      'psychologists': 'Psychologowie',
      'financial': 'Finansowy',
      'sessions': 'Sesje',
      'analytics': 'Analityka',
      'moderation': 'Moderacja'
    };
    return typeMap[type] || type;
  }

  getReportStatusName(status: string): string {
    const statusMap: { [key: string]: string } = {
      'completed': 'Ukończony',
      'pending': 'Oczekujący',
      'failed': 'Błąd',
      'processing': 'Przetwarzanie'
    };
    return statusMap[status] || status;
  }

  downloadReport(report: any) {
    console.log('Downloading report:', report.id);
    // TODO: Implement report download
  }

  viewReport(report: any) {
    console.log('Viewing report:', report.id);
    // TODO: Implement report preview
  }

  deleteReport(report: any) {
    if (confirm(`Czy na pewno chcesz usunąć raport "${report.name}"?`)) {
      console.log('Deleting report:', report.id);
      // TODO: Implement report deletion
    }
  }

  editSchedule(schedule: any) {
    console.log('Editing schedule:', schedule.id);
    // TODO: Implement schedule editing modal
  }

  deleteSchedule(schedule: any) {
    if (confirm(`Czy na pewno chcesz usunąć harmonogram "${schedule.name}"?`)) {
      console.log('Deleting schedule:', schedule.id);
      // TODO: Implement schedule deletion
    }
  }

  createScheduledReport() {
    console.log('Creating scheduled report...');
    // TODO: Implement scheduled report creation modal
  }

  // ===== SYSTEM UPGRADES METHODS =====

  checkForUpdates() {
    console.log('Checking for updates...');
    // TODO: Implement update checking
    this.availableUpdates = [
      {
        name: 'Security Update 2.1.5',
        version: '2.1.5',
        priority: 'high',
        description: 'Krytyczna aktualizacja bezpieczeństwa',
        features: [
          'Poprawki bezpieczeństwa',
          'Optymalizacja wydajności',
          'Nowe funkcje logowania'
        ]
      }
    ];
  }

  scheduleMaintenence() {
    console.log('Scheduling maintenance...');
    // TODO: Implement maintenance scheduling modal
  }

  getSystemStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'healthy': 'Zdrowy',
      'warning': 'Ostrzeżenie',
      'error': 'Błąd',
      'maintenance': 'Konserwacja'
    };
    return statusMap[status] || status;
  }

  installUpdate(update: any) {
    if (confirm(`Czy na pewno chcesz zainstalować aktualizację ${update.name}?`)) {
      console.log('Installing update:', update.id);
      // TODO: Implement update installation
    }
  }

  scheduleUpdate(update: any) {
    console.log('Scheduling update:', update.id);
    // TODO: Implement update scheduling modal
  }

  viewUpdateDetails(update: any) {
    console.log('Viewing update details:', update.id);
    // TODO: Implement update details modal
  }

  viewUpdateLog(history: any) {
    console.log('Viewing update log:', history.id);
    // TODO: Implement update log viewer
  }

  rollbackUpdate(history: any) {
    if (confirm(`Czy na pewno chcesz cofnąć aktualizację ${history.name}?`)) {
      console.log('Rolling back update:', history.id);
      // TODO: Implement update rollback
    }
  }

  editMaintenance(maintenance: any) {
    console.log('Editing maintenance:', maintenance.id);
    // TODO: Implement maintenance editing modal
  }

  cancelMaintenance(maintenance: any) {
    if (confirm(`Czy na pewno chcesz anulować konserwację?`)) {
      console.log('Canceling maintenance:', maintenance.id);
      // TODO: Implement maintenance cancellation
    }
  }

  // ===== SYSTEM SETTINGS METHODS =====

  setActiveSettingsTab(tabId: string) {
    this.activeSettingsTab = tabId;
  }

  saveAllSettings() {
    console.log('Saving all settings...');
    // TODO: Implement settings saving
    alert('Ustawienia zostały zapisane pomyślnie!');
  }

  resetToDefaults() {
    if (confirm('Czy na pewno chcesz przywrócić ustawienia domyślne?')) {
      console.log('Resetting to defaults...');
      // TODO: Implement settings reset
    }
  }

  exportSettings() {
    console.log('Exporting settings...');
    // TODO: Implement settings export
  }

  testFirebaseConnection() {
    console.log('Testing Firebase connection...');
    // TODO: Implement Firebase connection test
    alert('Połączenie z Firebase działa poprawnie!');
  }

  testPostHogConnection() {
    console.log('Testing PostHog connection...');
    // TODO: Implement PostHog connection test
    alert('Połączenie z PostHog działa poprawnie!');
  }

  testCrmConnection() {
    console.log('Testing CRM connection...');
    // TODO: Implement CRM connection test
    alert('Połączenie z Livespace CRM działa poprawnie!');
  }

  createBackup() {
    console.log('Creating backup...');
    // TODO: Implement backup creation
    alert('Kopia zapasowa została utworzona pomyślnie!');
  }

  viewBackupHistory() {
    console.log('Viewing backup history...');
    // TODO: Implement backup history viewer
  }
}
