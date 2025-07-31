import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PackageService, UserPackage } from '../../core/package.service';
import { AuthService } from '../../core/auth.service';
import { Package, User } from '../../models/user.model';

@Component({
    selector: 'app-package-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="package-container">
      <div class="header">
        <h2>Zarządzanie pakietami</h2>
        <p>Wybierz pakiet sesji z psychologiem</p>
      </div>

      <!-- Current Package Status -->
      <div class="current-package" *ngIf="currentUserPackage">
        <h3>Twój aktualny pakiet</h3>
        <div class="package-status">
          <div class="status-card" [class]="currentUserPackage.status">
            <h4>{{ getPackageName(currentUserPackage.packageId) }}</h4>
            <div class="status-info">
              <div class="status-badge" [class]="currentUserPackage.status">
                {{ getStatusText(currentUserPackage.status) }}
              </div>
              <div class="session-count">
                {{ currentUserPackage.sessionsRemaining }} / {{ currentUserPackage.totalSessions }} sesji pozostało
              </div>
            </div>
            
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="getProgressPercentage()"></div>
            </div>
            
            <div class="package-details">
              <div class="detail-row">
                <span>Data zakupu:</span>
                <span>{{ currentUserPackage.purchaseDate | date:'short' }}</span>
              </div>
              <div class="detail-row">
                <span>Data wygaśnięcia:</span>
                <span>{{ currentUserPackage.expiryDate | date:'short' }}</span>
              </div>
              <div class="detail-row" *ngIf="currentUserPackage.isOnCredit">
                <span>Pozostało do spłaty:</span>
                <span class="credit-amount">{{ currentUserPackage.creditBalance }} zł</span>
              </div>
              <div class="detail-row" *ngIf="currentUserPackage.isOnCredit && currentUserPackage.nextPaymentDate">
                <span>Następna rata:</span>
                <span>{{ currentUserPackage.nextPaymentDate | date:'short' }}</span>
              </div>
            </div>
            
            <div class="payment-section" *ngIf="currentUserPackage.isOnCredit">
              <h5>Płatności ratalne</h5>
              <p>Miesięczna rata: {{ currentUserPackage.monthlyPayment }} zł</p>
              <button class="btn btn-primary" (click)="makePayment()">
                Zapłać ratę ({{ currentUserPackage.monthlyPayment }} zł)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Available Packages -->
      <div class="packages-section">
        <h3>{{ currentUserPackage ? 'Dostępne pakiety' : 'Wybierz pakiet' }}</h3>
        <div class="packages-grid" *ngIf="!isLoading && availablePackages.length > 0">
          <div 
            *ngFor="let package of availablePackages" 
            class="package-card"
            [class.recommended]="package.name.includes('Standard')"
          >
            <div class="package-header">
              <h4>{{ package.name }}</h4>
              <div class="package-price">
                <span class="price">{{ package.price }} zł</span>
                <span class="per-session">{{ (package.price / package.sessionsCount) | number:'1.0-0' }} zł/sesja</span>
              </div>
              <div class="recommended-badge" *ngIf="package.name.includes('Standard')">
                Najczęściej wybierany
              </div>
            </div>
            
            <div class="package-content">
              <p class="package-description">{{ package.description }}</p>
              
              <div class="package-features">
                <h5>Co zawiera:</h5>
                <ul>
                  <li *ngFor="let feature of package.features">{{ feature }}</li>
                </ul>
              </div>
              
              <div class="package-details">
                <div class="detail-item">
                  <strong>Liczba sesji:</strong> {{ package.sessionsCount }}
                </div>
                <div class="detail-item">
                  <strong>Ważność:</strong> {{ package.duration }} dni
                </div>
                <div class="detail-item">
                  <strong>Koszt sesji:</strong> {{ (package.price / package.sessionsCount) | number:'1.0-0' }} zł
                </div>
              </div>
            </div>
            
            <div class="package-actions">
              <button 
                class="btn btn-primary btn-full"
                (click)="selectPaymentMethod(package, 'full')"
                [disabled]="isProcessing"
              >
                Kup za {{ package.price }} zł
              </button>
              <button 
                class="btn btn-secondary btn-full"
                (click)="selectPaymentMethod(package, 'credit')"
                [disabled]="isProcessing"
              >
                Kup na raty ({{ Math.ceil(package.price / 12) }} zł/miesiąc)
              </button>
            </div>
          </div>
        </div>
        
        <div class="loading" *ngIf="isLoading">
          <p>Ładowanie pakietów...</p>
        </div>
        
        <div class="no-packages" *ngIf="!isLoading && availablePackages.length === 0">
          <p>Brak dostępnych pakietów</p>
        </div>
      </div>

      <!-- Payment Confirmation Modal -->
      <div class="modal" *ngIf="showPaymentModal" (click)="closePaymentModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Potwierdzenie zakupu</h3>
            <button class="close-btn" (click)="closePaymentModal()">×</button>
          </div>
          
          <div class="modal-body" *ngIf="selectedPackage">
            <div class="purchase-summary">
              <h4>{{ selectedPackage.name }}</h4>
              <p>{{ selectedPackage.description }}</p>
              
              <div class="payment-details">
                <div class="detail-row">
                  <span>Liczba sesji:</span>
                  <span>{{ selectedPackage.sessionsCount }}</span>
                </div>
                <div class="detail-row">
                  <span>Ważność pakietu:</span>
                  <span>{{ selectedPackage.duration }} dni</span>
                </div>
                <div class="detail-row total">
                  <span>Łączny koszt:</span>
                  <span>{{ selectedPackage.price }} zł</span>
                </div>
                
                <div class="payment-method" [class]="selectedPaymentMethod">
                  <div *ngIf="selectedPaymentMethod === 'full'" class="full-payment">
                    <h5>Płatność jednorazowa</h5>
                    <p>Zapłacisz: <strong>{{ selectedPackage.price }} zł</strong></p>
                    <p>Natychmiastowy dostęp do wszystkich sesji</p>
                  </div>
                  
                  <div *ngIf="selectedPaymentMethod === 'credit'" class="credit-payment">
                    <h5>Płatność ratalna</h5>
                    <p>Miesięczna rata: <strong>{{ Math.ceil(selectedPackage.price / 12) }} zł</strong></p>
                    <p>Łączna kwota: <strong>{{ selectedPackage.price }} zł</strong></p>
                    <p>Natychmiastowy dostęp do wszystkich sesji</p>
                    <small class="credit-info">
                      Pierwsza rata zostanie pobrana dzisiaj, kolejne co 30 dni
                    </small>
                  </div>
                </div>
              </div>
              
              <div class="terms-agreement">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="agreedToTerms">
                  Akceptuję <a href="/terms-of-service" target="_blank">regulamin</a> i 
                  <a href="/privacy-policy" target="_blank">politykę prywatności</a>
                </label>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="closePaymentModal()">
              Anuluj
            </button>
            <button 
              class="btn btn-primary"
              (click)="confirmPurchase()"
              [disabled]="!agreedToTerms || isProcessing"
            >
              {{ isProcessing ? 'Przetwarzanie...' : 'Potwierdź zakup' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styleUrls: ['./package-management.component.scss']
})
export class PackageManagementComponent implements OnInit {
    availablePackages: Package[] = [];
    currentUserPackage: UserPackage | null = null;
    isLoading = false;
    isProcessing = false;

    // Payment modal
    showPaymentModal = false;
    selectedPackage: Package | null = null;
    selectedPaymentMethod: 'full' | 'credit' = 'full';
    agreedToTerms = false;

    currentUser: User | null = null;

    constructor(
        private packageService: PackageService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
        if (this.currentUser) {
            this.loadUserPackage();
            this.loadAvailablePackages();
        }
    }

    async loadUserPackage() {
        if (!this.currentUser) return;

        try {
            this.currentUserPackage = await this.packageService.getUserPackage(this.currentUser.id);
        } catch (error) {
            console.error('Error loading user package:', error);
        }
    }

    async loadAvailablePackages() {
        this.isLoading = true;
        try {
            this.availablePackages = await this.packageService.getDefaultPackages();
        } catch (error) {
            console.error('Error loading packages:', error);
        } finally {
            this.isLoading = false;
        }
    }

    selectPaymentMethod(packageData: Package, method: 'full' | 'credit') {
        this.selectedPackage = packageData;
        this.selectedPaymentMethod = method;
        this.agreedToTerms = false;
        this.showPaymentModal = true;
    }

    closePaymentModal() {
        this.showPaymentModal = false;
        this.selectedPackage = null;
        this.agreedToTerms = false;
    }

    async confirmPurchase() {
        if (!this.selectedPackage || !this.currentUser || !this.agreedToTerms) return;

        this.isProcessing = true;
        try {
            const userPackage = await this.packageService.purchasePackage(
                this.currentUser.id,
                this.selectedPackage.id,
                this.selectedPaymentMethod
            );

            this.currentUserPackage = userPackage;
            this.closePaymentModal();

            const message = this.selectedPaymentMethod === 'credit'
                ? `Pakiet ${this.selectedPackage.name} został zakupiony na raty! Pierwsza rata w wysokości ${Math.ceil(this.selectedPackage.price / 12)} zł została pobrana.`
                : `Pakiet ${this.selectedPackage.name} został zakupiony pomyślnie!`;

            alert(message);
        } catch (error) {
            console.error('Error purchasing package:', error);
            alert('Wystąpił błąd podczas zakupu pakietu. Spróbuj ponownie.');
        } finally {
            this.isProcessing = false;
        }
    }

    async makePayment() {
        if (!this.currentUserPackage || !this.currentUser) return;

        const paymentAmount = this.currentUserPackage.monthlyPayment || 0;

        if (confirm(`Czy chcesz zapłacić ratę w wysokości ${paymentAmount} zł?`)) {
            this.isProcessing = true;
            try {
                const success = await this.packageService.processMonthlyPayment(
                    this.currentUser.id,
                    paymentAmount
                );

                if (success) {
                    await this.loadUserPackage(); // Refresh package data
                    alert(`Rata w wysokości ${paymentAmount} zł została opłacona pomyślnie!`);
                } else {
                    alert('Wystąpił błąd podczas przetwarzania płatności.');
                }
            } catch (error) {
                console.error('Error processing payment:', error);
                alert('Wystąpił błąd podczas przetwarzania płatności.');
            } finally {
                this.isProcessing = false;
            }
        }
    }

    getPackageName(packageId: string): string {
        const pkg = this.availablePackages.find(p => p.id === packageId);
        return pkg?.name || 'Nieznany pakiet';
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'active': return 'Aktywny';
            case 'inactive': return 'Nieaktywny';
            case 'credit': return 'Na raty';
            case 'paid': return 'Opłacony';
            default: return status;
        }
    }

    getProgressPercentage(): number {
        if (!this.currentUserPackage) return 0;
        return (this.currentUserPackage.sessionsUsed / this.currentUserPackage.totalSessions) * 100;
    }

    // Add ngModel import for template
    Math = Math;
}
