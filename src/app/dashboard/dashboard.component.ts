import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AppointmentService } from '../core/appointment.service';
import { PsychologistService } from '../core/psychologist.service';
import { PackageService } from '../core/package.service';
import { UserService } from '../core/user.service';
import { DataSeederService } from '../core/data-seeder.service';
import { User, UserStats, Review, PsychologistChangeRequest } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { Psychologist, PsychologistNote } from '../models/psychologist.model';
import { Package } from '../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Dashboard Użytkownika</h1>
          <div class="header-actions">
            <button class="demo-btn" (click)="refreshData()" [disabled]="isLoading" title="Odśwież dane">
              🔄
            </button>
            <button class="demo-btn" (click)="resetDemoData()" [disabled]="isLoading" title="Resetuj dane demo">
              ⚠️
            </button>
            <button class="demo-btn" (click)="switchToTestPsychologist()" [disabled]="isLoading" title="Test: Przełącz na psychologa">
              👨‍⚕️
            </button>
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
          [class.active]="activeTab === 'psychologists'"
          (click)="setActiveTab('psychologists')"
        >
          Psychologowie
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'my-psychologist'"
          (click)="setActiveTab('my-psychologist')"
        >
          Twój psycholog
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'profile'"
          (click)="setActiveTab('profile')"
        >
          Profil
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'notes'"
          (click)="setActiveTab('notes')"
        >
          Notatki
        </button>
        <button 
          class="nav-tab" 
          [class.active]="activeTab === 'reviews'"
          (click)="setActiveTab('reviews')"
        >
          Opinie
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
            
            <!-- Permission Status -->
            <div class="permission-status" *ngIf="!currentUser?.canSelectPsychologist">
              <div class="status-card warning">
                <h4>Oczekuje na aktywację konta</h4>
                <p>⏳ Twoje konto zostało utworzone, ale wymaga aktywacji przez administratora, aby móc wybierać psychologów.</p>
                <p>Skontaktuj się z nami w celu aktywacji: <strong>kontakt&#64;logos.pl</strong></p>
              </div>
            </div>
            
            <!-- Assignment Status -->
            <div class="assignment-status" *ngIf="currentUser?.assignedPsychologistId">
              <div class="status-card" [ngClass]="currentUser?.assignmentStatus">
                <h4>Status przypisania do psychologa</h4>
                <p *ngIf="currentUser?.assignmentStatus === 'pending'">
                  🟡 Oczekuje na zatwierdzenie przez administratora
                </p>
                <p *ngIf="currentUser?.assignmentStatus === 'approved'">
                  ✅ Przypisanie zatwierdzone - możesz umówić się na wizytę
                </p>
                <p *ngIf="currentUser?.assignmentStatus === 'rejected'">
                  ❌ Przypisanie odrzucone - wybierz innego psychologa
                </p>
              </div>
            </div>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <h3>{{ userStats.upcomingAppointments }}</h3>
                <p>Nadchodzące wizyty</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-content">
                <h3>{{ userStats.completedSessions }}</h3>
                <p>Zakończone sesje</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">�</div>
              <div class="stat-content">
                <h3>{{ assignedPsychologist?.firstName || 'Brak' }}</h3>
                <p>Przypisany psycholog</p>
              </div>
            </div>
          </div>

          <!-- Assigned Psychologist Info -->
          <div class="psychologist-card" *ngIf="assignedPsychologist && currentUser?.assignmentStatus === 'approved'">
            <h3>Twój psycholog</h3>
            <div class="psychologist-info">
              <div class="psychologist-avatar">
                <img [src]="assignedPsychologist.profileImage || '/assets/default-avatar.png'" 
                     [alt]="assignedPsychologist.firstName">
              </div>
              <div class="psychologist-details">
                <h4>{{ assignedPsychologist.firstName }} {{ assignedPsychologist.lastName }}</h4>
                <p class="specializations">{{ assignedPsychologist.specializations?.join(', ') }}</p>
                <p class="rating">⭐ {{ assignedPsychologist.rating }}/5 ({{ assignedPsychologist.reviewCount }} opinii)</p>
                <div class="psychologist-actions">
                  <button class="btn btn-primary" (click)="setActiveTab('calendar')">
                    Umów wizytę
                  </button>
                  <button class="btn btn-secondary" (click)="showChangePsychologist = true">
                    Zmień psychologa
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Appointments -->
          <div class="recent-appointments" *ngIf="recentAppointments.length > 0">
            <h3>Ostatnie wizyty</h3>
            <div class="appointments-list">
              @for (appointment of recentAppointments; track appointment.id) {
                <div class="appointment-card"
                     [class]="appointment.status">
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
                  @if (appointment.status === 'completed') {
                    <div class="appointment-actions">
                      <button class="btn btn-sm btn-secondary" (click)="rateSession(appointment)">
                        Oceń sesję
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
          <!-- Quick Actions -->
          <div class="quick-actions">
            <h3>Szybkie akcje</h3>
            <div class="actions-grid">
              <button class="action-btn" (click)="setActiveTab('calendar')" 
                      [disabled]="currentUser?.assignmentStatus !== 'approved'">
                <div class="action-icon">📅</div>
                <span>Umów wizytę</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('psychologists')">
                <div class="action-icon">🔍</div>
                <span>Znajdź psychologa</span>
              </button>
              <button class="action-btn" (click)="setActiveTab('notes')">
                <div class="action-icon">📝</div>
                <span>Moje notatki</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Psychologists Tab -->
        <section class="psychologists-section" *ngIf="activeTab === 'psychologists'">
          <div class="section-header">
            <h3>Znajdź psychologa</h3>
            <p class="section-description">Przeglądaj i wybierz odpowiedniego psychologa dla siebie</p>
          </div>

          <div class="search-filters enhanced">
            <input 
              type="text" 
              placeholder="Szukaj psychologa po imieniu, nazwisku lub specjalizacji..." 
              [(ngModel)]="searchTerm"
          
              class="search-input"
            >
            <select [(ngModel)]="selectedSpecialization" (change)="filterPsychologists()" class="filter-select">
              <option value="">Wszystkie specjalizacje</option>
              <option value="Zaburzenia lękowe">Zaburzenia lękowe</option>
              <option value="Depresja">Depresja</option>
              <option value="Problemy w związkach">Problemy w związkach</option>
              <option value="Trauma">Trauma</option>
              <option value="Uzależnienia">Uzależnienia</option>
              <option value="Terapia rodzinna">Terapia rodzinna</option>
              <option value="Psychologia dziecięca">Psychologia dziecięca</option>
            </select>
            <select [(ngModel)]="priceFilter" (change)="filterPsychologists()" class="filter-select">
              <option value="">Wszystkie ceny</option>
              <option value="0-100">Do 100 zł</option>
              <option value="100-150">100-150 zł</option>
              <option value="150-200">150-200 zł</option>
              <option value="200+">200+ zł</option>
            </select>
            <select [(ngModel)]="ratingFilter" (change)="filterPsychologists()" class="filter-select">
              <option value="">Wszystkie oceny</option>
              <option value="4.5+">4.5+ ⭐</option>
              <option value="4.0+">4.0+ ⭐</option>
              <option value="3.5+">3.5+ ⭐</option>
            </select>
          </div>

          <div class="results-info" *ngIf="filteredPsychologists.length > 0">
            <p>Znaleziono {{ filteredPsychologists.length }} psychologów</p>
          </div>

          <div class="psychologists-grid" *ngIf="filteredPsychologists.length > 0; else noPsychologists">
            @for (psychologist of filteredPsychologists; track psychologist.id) {
              <div class="psychologist-card"
                   [class.premium]="psychologist.premiumListing">
                <div class="psychologist-header">
                  <div class="avatar">
                    {{ psychologist.firstName[0] }}{{ psychologist.lastName[0] }}
                  </div>
                  <div class="psychologist-info">
                    <h4>{{ psychologist.firstName }} {{ psychologist.lastName }}</h4>
                    @if (psychologist.premiumListing) {
                      <span class="premium-badge">⭐ Premium</span>
                    }
                    <div class="rating-info">
                      <span class="rating">⭐ {{ psychologist.rating || 4.5 }}</span>
                      <span class="reviews">({{ psychologist.reviewCount || 0 }} opinii)</span>
                    </div>
                  </div>
                </div>
                
                <div class="psychologist-specializations">
                  @for (spec of psychologist.specializations?.slice(0, 3); track spec) {
                    <span class="specialization-tag">
                      {{ spec }}
                    </span>
                  }
                </div>
                
                <div class="psychologist-details">
                  <p class="description">{{ psychologist.description || 'Doświadczony psycholog z wieloletną praktyką.' }}</p>
                  <div class="details-row">
                    <span class="experience">{{ psychologist.experience || 5 }} lat doświadczenia</span>
                    <span class="price">{{ psychologist.hourlyRate || 120 }} zł/sesja</span>
                  </div>
                  <div class="availability" [class.available]="psychologist.isAvailable !== false">
                    {{ psychologist.isAvailable !== false ? '🟢 Dostępny' : '🔴 Niedostępny' }}
                  </div>
                </div>
                
                <div class="psychologist-actions">
                  <button 
                    class="btn btn-primary select-btn" 
                    (click)="selectPsychologist(psychologist)"
                    [disabled]="currentUser?.assignedPsychologistId === psychologist.id || 
                               psychologist.isAvailable === false || 
                               !currentUser?.canSelectPsychologist"
                    [title]="!currentUser?.canSelectPsychologist ? 'Brak uprawnień - skontaktuj się z administratorem' : ''"
                  >
                    {{ currentUser?.assignedPsychologistId === psychologist.id ? 'Aktualny psycholog' : 
                       !currentUser?.canSelectPsychologist ? 'Brak uprawnień' :
                       'Wybierz psychologa' }}
                  </button>
                </div>
              </div>
            }
          </div>

          <ng-template #noPsychologists>
            <div class="empty-state">
              <h4>Nie znaleziono psychologów</h4>
              <p>Spróbuj zmienić kryteria wyszukiwania</p>
            </div>
          </ng-template>
        </section>

        <!-- My Psychologist Tab -->
        <section class="my-psychologist-section" *ngIf="activeTab === 'my-psychologist'">
          <div class="section-header">
            <h3>Twój psycholog</h3>
            <p class="section-description">Informacje o przypisanym psychologu</p>
          </div>

          <!-- When has assigned psychologist -->
          <div class="psychologist-details-card" *ngIf="assignedPsychologist && currentUser?.assignmentStatus === 'approved'; else noAssignedPsychologist">
            <div class="psychologist-profile">
              <div class="profile-header">
                <div class="profile-avatar">
                  {{ assignedPsychologist.firstName[0] }}{{ assignedPsychologist.lastName[0] }}
                </div>
                <div class="profile-info">
                  <h2>{{ assignedPsychologist.firstName }} {{ assignedPsychologist.lastName }}</h2>
                  <div class="credentials">
                    <span class="license">Lic. nr {{ assignedPsychologist.licenseNumber || 'PSY-' + assignedPsychologist.id.substring(0,6) }}</span>
                    <span class="experience">{{ assignedPsychologist.experience || 5 }} lat doświadczenia</span>
                  </div>
                  <div class="rating-section">
                    <span class="rating">⭐ {{ assignedPsychologist.rating || 4.8 }}</span>
                    <span class="reviews">({{ assignedPsychologist.reviewCount || 0 }} opinii)</span>
                  </div>
                </div>
              </div>

              <div class="profile-content">
                <div class="profile-row">
                  <div class="profile-column">
                    <h4>Specjalizacje</h4>
                    <div class="specializations-list">
                      @for (spec of assignedPsychologist.specializations; track spec) {
                        <span class="spec-tag">
                          {{ spec }}
                        </span>
                      }
                    </div>

                    <h4>Opis</h4>
                    <p class="description">{{ assignedPsychologist.bio || assignedPsychologist.description || 'Doświadczony psycholog z wieloletną praktyką w pomocy pacjentom.' }}</p>

                    <h4>Wykształcenie</h4>
                    <p class="education">{{ assignedPsychologist.education || 'Magister Psychologii, specjalizacja psychologia kliniczna' }}</p>
                  </div>

                  <div class="profile-column">
                    <h4>Dostępność</h4>
                    <div class="availability-status" [class.available]="assignedPsychologist.isAvailable !== false">
                      {{ assignedPsychologist.isAvailable !== false ? '🟢 Dostępny' : '🔴 Niedostępny' }}
                    </div>

                    <h4>Statystyki</h4>
                    <div class="stats-list">
                      <div class="stat-item">
                        <span class="stat-label">Ukończone sesje:</span>
                        <span class="stat-value">{{ assignedPsychologist.completedSessions || 0 }}</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Cena za sesję:</span>
                        <span class="stat-value">{{ assignedPsychologist.hourlyRate || 120 }} zł</span>
                      </div>
                      <div class="stat-item">
                        <span class="stat-label">Języki:</span>
                        <span class="stat-value">{{ assignedPsychologist.languages?.join(', ') || 'Polski, Angielski' }}</span>
                      </div>
                    </div>

                    <h4>Kontakt</h4>
                    <div class="contact-actions">
                      <button class="btn btn-primary" (click)="setActiveTab('calendar')">
                        📅 Umów wizytę
                      </button>
                      <button class="btn btn-secondary" (click)="setActiveTab('notes')">
                        📝 Zobacz notatki
                      </button>
                      <button class="btn btn-secondary" (click)="openAddReviewModal()">
                        ⭐ Dodaj opinię
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Change psychologist option -->
              <div class="change-psychologist-section">
                <h4>Chcesz zmienić psychologa?</h4>
                <p>Jeśli obecny psycholog nie odpowiada Twoim potrzebom, możesz złożyć wniosek o zmianę.</p>
                <button class="btn btn-secondary" (click)="openChangePsychologistModal()">
                  🔄 Zmień psychologa
                </button>
              </div>
            </div>
          </div>

          <!-- When no assigned psychologist -->
          <ng-template #noAssignedPsychologist>
            <div class="empty-state">
              <div class="empty-icon">👨‍⚕️</div>
              <h4>Nie masz przypisanego psychologa</h4>
              <p *ngIf="!currentUser?.assignedPsychologistId">Wybierz psychologa z listy dostępnych specjalistów</p>
              <p *ngIf="currentUser?.assignedPsychologistId && currentUser?.assignmentStatus === 'pending'">
                Oczekuje na zatwierdzenie przypisania przez administratora
              </p>
              <p *ngIf="currentUser?.assignedPsychologistId && currentUser?.assignmentStatus === 'rejected'">
                Przypisanie zostało odrzucone. Wybierz innego psychologa.
              </p>
              <button class="btn btn-primary" (click)="setActiveTab('psychologists')">
                Znajdź psychologa
              </button>
            </div>
          </ng-template>
        </section>

        <!-- Profile Tab -->
        <section class="profile-section" *ngIf="activeTab === 'profile'">
          <div class="profile-form">
            <h3>Edytuj profil</h3>
            
            <form (ngSubmit)="updateProfile()" #profileForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Imię:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.firstName" 
                    name="firstName" 
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Nazwisko:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.lastName" 
                    name="lastName" 
                    required
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Email:</label>
                  <input 
                    type="email" 
                    [(ngModel)]="profileData.email" 
                    name="email" 
                    required
                    readonly
                  >
                </div>
                <div class="form-group">
                  <label>Telefon:</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="profileData.phone" 
                    name="phone"
                  >
                </div>
              </div>

              <div class="form-group">
                <label>Adres:</label>
                <input 
                  type="text" 
                  [(ngModel)]="profileData.address" 
                  name="address"
                  placeholder="Ulica i numer"
                >
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Miasto:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.city" 
                    name="city"
                  >
                </div>
                <div class="form-group">
                  <label>Kod pocztowy:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.postalCode" 
                    name="postalCode"
                    pattern="[0-9]{2}-[0-9]{3}"
                  >
                </div>
              </div>

              <div class="form-group">
                <label>Preferencje sesji:</label>
                <select [(ngModel)]="profileData.sessionType" name="sessionType">
                  <option value="online">Online</option>
                  <option value="in-person">Stacjonarnie</option>
                  <option value="both">Bez preferencji</option>
                </select>
              </div>

              <div class="form-group">
                <label>Cele terapii:</label>
                <textarea 
                  [(ngModel)]="profileData.goals" 
                  name="goals"
                  rows="4"
                  placeholder="Opisz swoje cele terapeutyczne..."
                ></textarea>
              </div>

              <h4 class="section-subtitle">Kontakt awaryjny</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Imię i nazwisko kontaktu awaryjnego:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="profileData.emergencyContactName" 
                    name="emergencyContactName"
                    placeholder="Jan Kowalski"
                  >
                </div>
                <div class="form-group">
                  <label>Telefon kontaktu awaryjnego:</label>
                  <input 
                    type="tel" 
                    [(ngModel)]="profileData.emergencyContactPhone" 
                    name="emergencyContactPhone"
                    placeholder="+48 123 456 789"
                  >
                </div>
              </div>

              <div class="form-group">
                <label>Relacja:</label>
                <select [(ngModel)]="profileData.emergencyContactRelation" name="emergencyContactRelation">
                  <option value="">Wybierz relację</option>
                  <option value="parent">Rodzic</option>
                  <option value="spouse">Małżonek/Partner</option>
                  <option value="sibling">Rodzeństwo</option>
                  <option value="friend">Przyjaciel</option>
                  <option value="other">Inne</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary" [disabled]="!profileForm.valid">
                Zapisz zmiany
              </button>
            </form>
          </div>
        </section>

        <!-- Notes Tab -->
        <section class="notes-section" *ngIf="activeTab === 'notes'">
          <div class="section-header">
            <h3>Notatki z sesji</h3>
            <p class="section-description">Notatki pozostawione przez Twojego psychologa</p>
          </div>

          <div class="notes-list" *ngIf="userNotes.length > 0; else noNotes">
            @for (note of userNotes; track note.id) {
              <div class="note-card">
                <div class="note-header">
                  <h4>{{ note.title }}</h4>
                  <span class="note-date">{{ note.createdAt | date:'short' }}</span>
                </div>
                <div class="note-content">
                  <p>{{ note.content }}</p>
                </div>
                @if (note.tags) {
                  <div class="note-footer">
                    <div class="note-tags">
                      @for (tag of note.tags; track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
          
          <ng-template #noNotes>
            <div class="empty-state">
              <p>Nie masz jeszcze żadnych notatek z sesji.</p>
              <p>Notatki będą widoczne po odbyciu sesji z psychologiem.</p>
            </div>
          </ng-template>
        </section>

        <!-- Reviews Tab -->
        <section class="reviews-section" *ngIf="activeTab === 'reviews'">
          <div class="section-header">
            <h3>Moje opinie</h3>
            <button class="btn btn-primary" (click)="showAddReview = true" 
                    *ngIf="assignedPsychologist && userStats.completedSessions > 0">
              Dodaj opinię
            </button>
          </div>

          <div class="reviews-list" *ngIf="userReviews.length > 0; else noReviews">
            @for (review of userReviews; track review.id) {
              <div class="review-card">
                <div class="review-header">
                  <div class="rating">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span [class.filled]="star <= review.rating">⭐</span>
                    }
                    <span class="rating-value">{{ review.rating }}/5</span>
                  </div>
                  <span class="review-date">{{ review.createdAt | date:'short' }}</span>
                </div>
                <div class="review-content">
                  <p>{{ review.comment }}</p>
                </div>
                <div class="review-footer">
                  <span class="review-status" [class]="review.status">
                    {{ getReviewStatusText(review.status) }}
                  </span>
                </div>
              </div>
            }
          </div>
          
          <ng-template #noReviews>
            <div class="empty-state">
              <p>Nie wystawiłeś jeszcze żadnych opinii.</p>
              <p *ngIf="userStats.completedSessions === 0">Odbędź pierwszą sesję, aby móc wystawić opinię.</p>
            </div>
          </ng-template>
        </section>

        <!-- Calendar Tab -->
        <section class="calendar-section" *ngIf="activeTab === 'calendar'">
          <div class="calendar-header" *ngIf="currentUser?.assignmentStatus !== 'approved'">
            <div class="warning-message">
              <p>⚠️ Aby umówić wizytę, musisz najpierw wybrać psychologa i otrzymać zatwierdzenie od administratora.</p>
              <button class="btn btn-primary" (click)="setActiveTab('psychologists')">
                Wybierz psychologa
              </button>
            </div>
          </div>
          
          <!-- Calendar will be implemented later -->
          <div class="placeholder">
            <p>Kalendarz będzie dostępny wkrótce</p>
          </div>
        </section>

        <!-- Search Tab (Legacy) -->
        <section class="search-section" *ngIf="activeTab === 'search'">
          <!-- Psychologist search will be implemented later -->
          <div class="placeholder">
            <p>Wyszukiwanie psychologów będzie dostępne wkrótce</p>
          </div>
        </section>

        <!-- Packages Tab -->
        <section class="packages-section" *ngIf="activeTab === 'packages'">
          <!-- Package management will be implemented later -->
          <div class="placeholder">
            <p>Zarządzanie pakietami będzie dostępne wkrótce</p>
          </div>
        </section>
      </main>

      <!-- Change Psychologist Modal -->
      <div class="modal" *ngIf="showChangePsychologist" (click)="closeChangePsychologistModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Zmiana psychologa</h3>
            <button class="close-btn" (click)="closeChangePsychologistModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="submitPsychologistChange()" #changeForm="ngForm">
              <div class="form-group">
                <label>Wybierz nowego psychologa:</label>
                <select [(ngModel)]="changeRequest.newPsychologistId" name="newPsychologistId" required>
                  <option value="">Wybierz psychologa</option>
                  @for (psychologist of allPsychologists; track psychologist.id) {
                    <option [value]="psychologist.id"
                            [disabled]="psychologist.id === currentUser?.assignedPsychologistId">
                      {{ psychologist.firstName }} {{ psychologist.lastName }} - {{ psychologist.specializations?.join(', ') }}
                    </option>
                  }
                </select>
              </div>
              
              <div class="form-group">
                <label>Powód zmiany:</label>
                <textarea 
                  [(ngModel)]="changeRequest.reason" 
                  name="reason" 
                  required
                  rows="4"
                  placeholder="Opisz powód, dla którego chcesz zmienić psychologa..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label>Priorytet:</label>
                <select [(ngModel)]="changeRequest.urgency" name="urgency" required>
                  <option value="low">Niski</option>
                  <option value="medium">Średni</option>
                  <option value="high">Wysoki</option>
                </select>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeChangePsychologistModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="!changeForm.valid">
                  Wyślij prośbę
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Add Review Modal -->
      <div class="modal" *ngIf="showAddReview" (click)="closeAddReviewModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Oceń sesję</h3>
            <button class="close-btn" (click)="closeAddReviewModal()">×</button>
          </div>
          
          <div class="modal-body">
            <form (ngSubmit)="submitReview()" #reviewForm="ngForm">
              <div class="form-group">
                <label>Ocena:</label>
                <div class="star-rating">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span class="star"
                          [class.filled]="star <= newReview.rating"
                          (click)="setRating(star)">⭐</span>
                  }
                </div>
              </div>
              
              <div class="form-group">
                <label>Komentarz:</label>
                <textarea 
                  [(ngModel)]="newReview.comment" 
                  name="comment" 
                  rows="4"
                  placeholder="Opisz swoją opinię o sesji..."
                ></textarea>
              </div>
              
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="newReview.wouldRecommend" 
                    name="wouldRecommend"
                  >
                  Polecałbyś tego psychologa?
                </label>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    [(ngModel)]="newReview.isAnonymous" 
                    name="isAnonymous"
                  >
                  Publikuj anonimowo
                </label>
              </div>
              
              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="closeAddReviewModal()">
                  Anuluj
                </button>
                <button type="submit" class="btn btn-primary" [disabled]="newReview.rating === 0">
                  Wyślij opinię
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Change Psychologist Modal -->
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'overview';
  isLoading = false;

  // Data
  userStats: UserStats = {
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    upcomingAppointments: 0,
    sessionsThisMonth: 0
  };
  assignedPsychologist: User | null = null;
  currentPackage: Package | null = null;
  recentAppointments: Appointment[] = [];
  userNotes: PsychologistNote[] = [];
  userReviews: Review[] = [];

  // Psychologists
  allPsychologists: User[] = [];
  filteredPsychologists: User[] = [];
  searchTerm = '';
  selectedSpecialization = '';
  priceFilter = '';
  ratingFilter = '';

  // Profile
  profileData: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    sessionType: 'both',
    goals: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: ''
  };

  // Modals
  showChangePsychologist = false;
  showAddReview = false;

  // Forms
  changeRequest = {
    newPsychologistId: '',
    reason: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  };

  newReview = {
    rating: 0,
    comment: '',
    wouldRecommend: false,
    isAnonymous: false
  };

  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private psychologistService: PsychologistService,
    private packageService: PackageService,
    private userService: UserService,
    private dataSeederService: DataSeederService,
    private router: Router
  ) { }

  async ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user in dashboard:', this.currentUser);

    if (!this.currentUser) {
      console.log('No user logged in, redirecting to login...');
      this.router.navigate(['/login']);
      return;
    }

    console.log('User role:', this.currentUser.role);

    // Redirect if user has specific role
    if (this.currentUser.role !== 'user') {
      console.log('User has role:', this.currentUser.role, '- checking for dashboard redirect...');

      // If user doesn't have any role, treat as regular user
      if (!this.currentUser.role) {
        console.log('User has no role, treating as regular user');
        this.currentUser.role = 'user'; // Set default role
      } else {
        console.log('Redirecting to role-specific dashboard...');
        const dashboardRoute = this.authService.redirectToDashboard(this.currentUser);
        this.router.navigate([dashboardRoute]);
        return;
      }
    }

    console.log('User is regular user, continuing with dashboard initialization...');

    // Initialize demo data (psychologists only)
    console.log('Calling initializeDemoData()...');
    await this.initializeDemoData();

    console.log('Calling loadDashboardData()...');
    this.loadDashboardData();
  }

  // Initialize demo data (psychologists only)
  async initializeDemoData() {
    try {
      console.log('=== INITIALIZING DEMO PSYCHOLOGISTS ===');
      console.log('Calling dataSeederService.seedPsychologistsOnly()...');

      // Only seed psychologists - users will be created via registration
      await this.dataSeederService.seedPsychologistsOnly();
      console.log('Demo psychologists initialized successfully');

      // Test if we can read psychologists immediately after seeding
      console.log('Testing immediate read after seeding...');
      const testPsychs = await this.userService.getAllPsychologists();
      console.log('Psychologists found after seeding:', testPsychs.length);

    } catch (error) {
      console.error('Demo psychologists initialization failed:', error);
    }
  }

  async loadDashboardData() {
    this.isLoading = true;
    try {
      console.log('=== LOADING DASHBOARD DATA ===');
      console.log('Current user:', this.currentUser);

      if (this.currentUser) {
        console.log('Loading user stats...');
        // Load user stats
        this.userStats = await this.userService.getUserStats(this.currentUser.id);
        console.log('User stats loaded:', this.userStats);

        console.log('Loading user appointments...');
        // Load user's appointments
        const appointments = await this.appointmentService.getUserAppointments(this.currentUser.id);
        console.log('Appointments loaded:', appointments.length);

        this.recentAppointments = appointments
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        // Load assigned psychologist if exists
        if (this.currentUser.assignedPsychologistId) {
          console.log('Loading assigned psychologist:', this.currentUser.assignedPsychologistId);
          try {
            const psychologist = await this.psychologistService.getPsychologist(
              this.currentUser.assignedPsychologistId
            );
            if (psychologist) {
              this.assignedPsychologist = {
                ...psychologist,
                role: 'psychologist' as any,
                isActive: true,
                createdAt: new Date()
              };
              console.log('Assigned psychologist loaded:', this.assignedPsychologist);
            }
          } catch (error) {
            console.error('Error loading psychologist:', error);
          }
        }

        // Load current package
        if (this.currentUser.activePackageId) {
          console.log('Loading active package:', this.currentUser.activePackageId);
          try {
            this.currentPackage = await this.packageService.getPackage(
              this.currentUser.activePackageId
            );
            console.log('Package loaded:', this.currentPackage);
          } catch (error) {
            console.error('Error loading package:', error);
          }
        }

        // Load user notes
        console.log('Loading user notes...');
        try {
          this.userNotes = await this.userService.getUserNotes(this.currentUser.id);
          console.log('Notes loaded:', this.userNotes.length);
        } catch (error) {
          console.error('Error loading notes:', error);
          this.userNotes = [];
        }

        // Load user reviews
        console.log('Loading user reviews...');
        try {
          this.userReviews = await this.userService.getUserReviews(this.currentUser.id);
          console.log('Reviews loaded:', this.userReviews.length);
        } catch (error) {
          console.error('Error loading reviews:', error);
          this.userReviews = [];
        }

        // Load all psychologists for selection
        console.log('=== LOADING ALL PSYCHOLOGISTS ===');
        try {
          console.log('Calling userService.getAllPsychologists()...');
          this.allPsychologists = await this.userService.getAllPsychologists();
          console.log('getAllPsychologists() returned:', this.allPsychologists);

          this.filteredPsychologists = [...this.allPsychologists];
          console.log('ALL PSYCHOLOGISTS LOADED:', this.allPsychologists.length);

          // Print each psychologist
          this.allPsychologists.forEach((psych, index) => {
            console.log(`Psychologist ${index + 1}:`, {
              id: psych.id,
              firstName: psych.firstName,
              lastName: psych.lastName,
              role: psych.role,
              isActive: psych.isActive,
              specializations: psych.specializations
            });
          });

        } catch (error) {
          console.error('ERROR LOADING PSYCHOLOGISTS:', error);
          this.allPsychologists = [];
          this.filteredPsychologists = [];
        }

        // Load profile data
        this.profileData = {
          firstName: this.currentUser.firstName,
          lastName: this.currentUser.lastName,
          email: this.currentUser.email,
          phone: this.currentUser.phone || '',
          address: this.currentUser.profileData?.address || '',
          city: this.currentUser.profileData?.city || '',
          postalCode: this.currentUser.profileData?.postalCode || '',
          sessionType: this.currentUser.profileData?.preferences?.sessionType || 'both',
          goals: this.currentUser.profileData?.goals || '',
          emergencyContactName: this.currentUser.profileData?.emergencyContact?.name || '',
          emergencyContactPhone: this.currentUser.profileData?.emergencyContact?.phone || '',
          emergencyContactRelation: this.currentUser.profileData?.emergencyContact?.relationship || ''
        };
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      this.isLoading = false;
      console.log('=== DASHBOARD DATA LOADING COMPLETE ===');
      console.log('Final psychologists count:', this.allPsychologists.length);
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

  getReviewStatusText(status?: string): string {
    switch (status) {
      case 'pending': return 'Oczekuje na moderację';
      case 'approved': return 'Zatwierdzona';
      case 'rejected': return 'Odrzucona';
      default: return 'Nieznany';
    }
  }

  // ===== PSYCHOLOGIST SEARCH & SELECTION =====

  searchPsychologists(): void {
    this.filterPsychologists();
  }

  filterPsychologists(): void {
    let filtered = [...this.allPsychologists];

    if (this.searchTerm) {
      filtered = filtered.filter(p =>
        p.firstName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.specializations?.some(spec =>
          spec.toLowerCase().includes(this.searchTerm.toLowerCase())
        ) ||
        p.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedSpecialization) {
      filtered = filtered.filter(p =>
        p.specializations?.includes(this.selectedSpecialization)
      );
    }

    // Price filter
    if (this.priceFilter) {
      filtered = filtered.filter(p => {
        const price = p.pricePerSession || p.hourlyRate || 0;
        switch (this.priceFilter) {
          case '0-100':
            return price <= 100;
          case '100-150':
            return price > 100 && price <= 150;
          case '150-200':
            return price > 150 && price <= 200;
          case '200+':
            return price > 200;
          default:
            return true;
        }
      });
    }

    // Rating filter
    if (this.ratingFilter) {
      filtered = filtered.filter(p => {
        const rating = p.rating || 0;
        switch (this.ratingFilter) {
          case '4.5+':
            return rating >= 4.5;
          case '4.0+':
            return rating >= 4.0;
          case '3.5+':
            return rating >= 3.5;
          default:
            return true;
        }
      });
    }

    this.filteredPsychologists = filtered;
  }

  async selectPsychologist(psychologist: User): Promise<void> {
    if (!this.currentUser) {
      console.error('No current user found');
      alert('Błąd: Brak danych użytkownika');
      return;
    }

    if (!this.currentUser.canSelectPsychologist) {
      alert('Nie masz uprawnień do wyboru psychologa. Skontaktuj się z administratorem w celu aktywacji konta.');
      return;
    }

    if (!psychologist || !psychologist.id) {
      console.error('Invalid psychologist data:', psychologist);
      alert('Błąd: Nieprawidłowe dane psychologa');
      return;
    }

    try {
      this.isLoading = true;
      console.log(`Selecting psychologist ${psychologist.firstName} ${psychologist.lastName} for user ${this.currentUser.id}`);

      await this.userService.requestPsychologistAssignment(
        this.currentUser.id,
        psychologist.id,
        `Użytkownik wybrał psychologa: ${psychologist.firstName} ${psychologist.lastName}`
      );

      // Update current user data
      this.currentUser.assignedPsychologistId = psychologist.id;
      this.currentUser.assignmentStatus = 'pending';
      this.assignedPsychologist = psychologist;

      // Show success message
      alert('Prośba o przypisanie do psychologa została wysłana. Oczekuj na zatwierdzenie przez administratora.');

      // Refresh data to show updated status
      await this.loadDashboardData();

    } catch (error) {
      console.error('Error selecting psychologist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
      alert(`Wystąpił błąd podczas wybierania psychologa: ${errorMessage}`);
    } finally {
      this.isLoading = false;
    }
  }

  viewPsychologistProfile(psychologist: User): void {
    // TODO: Navigate to psychologist profile page or show modal
    console.log('View psychologist profile:', psychologist);
  }

  // ===== PROFILE MANAGEMENT =====

  async updateProfile(): Promise<void> {
    if (!this.currentUser) return;

    try {
      this.isLoading = true;

      // Update basic info
      await this.userService.updateUserBasicInfo(this.currentUser.id, {
        firstName: this.profileData.firstName,
        lastName: this.profileData.lastName,
        phone: this.profileData.phone
      });

      // Update profile data
      await this.userService.updateUserProfile(this.currentUser.id, {
        address: this.profileData.address,
        city: this.profileData.city,
        postalCode: this.profileData.postalCode,
        goals: this.profileData.goals,
        preferences: {
          sessionType: this.profileData.sessionType,
          language: 'pl',
          gender: 'no-preference',
          specialization: []
        }
      });

      // Update local user data
      this.currentUser.firstName = this.profileData.firstName;
      this.currentUser.lastName = this.profileData.lastName;
      this.currentUser.phone = this.profileData.phone;

      alert('Profil został zaktualizowany pomyślnie');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Wystąpił błąd podczas aktualizacji profilu');
    } finally {
      this.isLoading = false;
    }
  }

  // ===== PSYCHOLOGIST CHANGE =====

  closeChangePsychologistModal(): void {
    this.showChangePsychologist = false;
    this.changeRequest = {
      newPsychologistId: '',
      reason: '',
      urgency: 'medium'
    };
  }

  async submitPsychologistChange(): Promise<void> {
    if (!this.currentUser) return;

    try {
      this.isLoading = true;

      await this.userService.changePsychologist(
        this.currentUser.id,
        this.changeRequest.newPsychologistId,
        this.changeRequest.reason,
        this.changeRequest.urgency
      );

      this.closeChangePsychologistModal();
      alert('Prośba o zmianę psychologa została wysłana. Otrzymasz powiadomienie o decyzji administratora.');

    } catch (error) {
      console.error('Error submitting psychologist change:', error);
      alert('Wystąpił błąd podczas wysyłania prośby o zmianę psychologa');
    } finally {
      this.isLoading = false;
    }
  }

  // ===== REVIEWS =====

  openAddReviewModal(): void {
    this.showAddReview = true;
  }

  openChangePsychologistModal(): void {
    this.showChangePsychologist = true;
  }

  closeAddReviewModal(): void {
    this.showAddReview = false;
    this.newReview = {
      rating: 0,
      comment: '',
      wouldRecommend: false,
      isAnonymous: false
    };
  }

  setRating(rating: number): void {
    this.newReview.rating = rating;
  }

  async submitReview(): Promise<void> {
    if (!this.currentUser || !this.assignedPsychologist) return;

    try {
      this.isLoading = true;

      await this.userService.addReview({
        userId: this.currentUser.id,
        psychologistId: this.assignedPsychologist.id,
        rating: this.newReview.rating,
        comment: this.newReview.comment,
        isAnonymous: this.newReview.isAnonymous,
        createdAt: new Date(),
        sessionCount: this.userStats.completedSessions,
        wouldRecommend: this.newReview.wouldRecommend
      });

      this.closeAddReviewModal();
      alert('Opinia została wysłana i oczekuje na moderację');

      // Refresh reviews
      this.userReviews = await this.userService.getUserReviews(this.currentUser.id);

    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Wystąpił błąd podczas wysyłania opinii');
    } finally {
      this.isLoading = false;
    }
  }

  rateSession(appointment: Appointment): void {
    // Set appointment context for review
    this.showAddReview = true;
    // Could add appointment-specific data to review
  }

  // ===== DEMO DATA MANAGEMENT =====

  async resetDemoData(): Promise<void> {
    if (!confirm('Czy na pewno chcesz zresetować wszystkie dane demo? Ta operacja nie może być cofnięta.')) {
      return;
    }

    try {
      this.isLoading = true;
      console.log('Resetting demo data...');

      // Clear all existing data
      await this.dataSeederService.clearAllData();

      // Recreate fresh demo data
      await this.dataSeederService.seedAllData();

      // Reload dashboard data
      await this.loadDashboardData();

      alert('Dane demo zostały zresetowane!');
      console.log('Demo data reset successfully');

    } catch (error) {
      console.error('Error resetting demo data:', error);
      alert('Wystąpił błąd podczas resetowania danych demo');
    } finally {
      this.isLoading = false;
    }
  }

  async refreshData(): Promise<void> {
    try {
      this.isLoading = true;
      await this.loadDashboardData();
      console.log('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Wystąpił błąd podczas odświeżania danych');
    } finally {
      this.isLoading = false;
    }
  }

  // ===== TEST FUNCTIONS =====

  async switchToTestPsychologist(): Promise<void> {
    if (!confirm('FUNKCJA TESTOWA: Czy na pewno chcesz przełączyć się na rolę psychologa? To zmieni Twoje konto.')) {
      return;
    }

    if (!this.currentUser) {
      alert('Błąd: Brak danych użytkownika');
      return;
    }

    try {
      this.isLoading = true;
      console.log('Switching user to psychologist role...');

      // Update user role and psychologist data in Firebase
      const psychologistUpdate = {
        role: 'psychologist' as any,
        specializations: ['Zaburzenia lękowe', 'Depresja', 'Terapia poznawczo-behawioralna'],
        description: 'Doświadczony psycholog specjalizujący się w terapii poznawczo-behawioralnej.',
        experience: 5,
        education: 'Magister Psychologii, specjalizacja psychologia kliniczna',
        languages: ['Polski', 'Angielski'],
        hourlyRate: 150,
        isAvailable: true,
        rating: 4.8,
        reviewCount: 0,
        completedSessions: 0,
        workingHours: {
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '15:00' }],
          saturday: [],
          sunday: []
        }
      };

      await this.userService.updateUserBasicInfo(this.currentUser.id, psychologistUpdate);

      // Update local user data
      this.currentUser.role = 'psychologist';
      localStorage.setItem('user', JSON.stringify(this.currentUser));

      alert('Rola została zmieniona na psychologa! Za chwilę zostaniesz przekierowany.');

      // Redirect to psychologist dashboard
      setTimeout(() => {
        this.router.navigate(['/psychologist-dashboard']);
      }, 2000);

    } catch (error) {
      console.error('Error switching to psychologist role:', error);
      alert('Wystąpił błąd podczas zmiany roli');
    } finally {
      this.isLoading = false;
    }
  }
}
