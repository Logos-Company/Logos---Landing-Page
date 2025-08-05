# Logos - Platforma Psychologiczna 🧠

Nowoczesna platforma do konsultacji psychologicznych online z zaawansowanym systemem zarządzania użytkownikami i dashboardami rolowymi.

## 📋 Spis treści

- [Opis projektu](#opis-projektu)
- [Technologie](#technologie)
- [Architektura systemu](#architektura-systemu)
- [Funkcjonalności](#funkcjonalności)
- [Struktura projektu](#struktura-projektu)
- [Instalacja i uruchomienie](#instalacja-i-uruchomienie)
- [Deployment](#deployment)
- [Konfiguracja](#konfiguracja)

## 🎯 Opis projektu

Logos to kompleksowa platforma do świadczenia usług psychologicznych online. System umożliwia pacjentom łatwe znalezienie i rezerwację sesji z psychologami, a specjalistom - efektywne zarządzanie swoją praktyką. Platforma oferuje różne dashboardy w zależności od roli użytkownika oraz zaawansowany system zarządzania pakietami usług.

## 🚀 Technologie

### Frontend
- **Angular 20** - Główny framework aplikacji
- **TypeScript 5.8** - Język programowania
- **SCSS** - Stylowanie componentów
- **Angular Router** - Routing i nawigacja
- **Angular Animations** - Animacje UI

### Backend & Database
- **Firebase 11.9** - Backend as a Service
  - Firestore - NoSQL database
  - Authentication - System uwierzytelniania
  - Hosting - Deployment aplikacji
- **Google Auth Library** - Logowanie przez Google

### Dodatkowe biblioteki
- **PostHog** - Analytics i tracking użytkowników
- **RxJS** - Programowanie reaktywne
- **ngx-cookie-service** - Zarządzanie cookies

### Narzędzia deweloperskie
- **Angular CLI 20** - Narzędzie do budowania aplikacji
- **Jasmine & Karma** - Testowanie jednostkowe
- **TypeScript Compiler** - Kompilacja kodu

## 🏗️ Architektura systemu

### Model ról użytkowników
System obsługuje 4 rodzaje ról:
- **Admin** - Pełny dostęp do systemu
- **Moderator** - Zarządzanie treścią i użytkownikami
- **Psychologist** - Zarządzanie pacjentami i sesjami
- **User** - Podstawowy użytkownik/pacjent

### Główne moduły
1. **Landing Page** - Strona główna z sekcjami marketingowymi
2. **Authentication** - System logowania i rejestracji
3. **User Dashboard** - Panel pacjenta
4. **Psychologist Dashboard** - Panel psychologa
5. **Admin Panel** - Panel administratora
6. **Moderator Panel** - Panel moderatora

## ✨ Funkcjonalności

### 🎨 Landing Page
- **Hero Section** - Główna sekcja powitalna
- **Statystyki** - Liczby i osiągnięcia platformy
- **Obszary pomocy** - Rodzaje oferowanych usług
- **Oferta** - Prezentacja pakietów usług
- **Testimoniale** - Opinie klientów
- **FAQ** - Najczęściej zadawane pytania
- **Prezentacja specjalistów** - Profil psychologów
- **Call-to-Action** - Sekcje zachęcające do działania

### 👤 System użytkowników
- **Rejestracja/Logowanie** - Klasyczne i przez Google
- **Profile użytkowników** - Zarządzanie danymi osobowymi
- **System ról** - Rozróżnienie uprawnień
- **Zarządzanie pakietami** - Subskrypcje i credity

### 📅 System rezerwacji
- **Kalendarze** - Dostępność psychologów
- **Rezerwacja sesji** - Booking spotkań
- **Zarządzanie terminami** - Edycja i anulowanie
- **Powiadomienia** - Przypomnienia o sesjach

### 🔐 Bezpieczeństwo
- **Guards** - Ochrona tras (AuthGuard, RoleGuard)
- **Firestore Rules** - Zabezpieczenie bazy danych
- **JWT Tokens** - Autoryzacja przez Firebase

### 📊 Analytics
- **PostHog Integration** - Tracking zachowań użytkowników
- **Monitoring wydajności** - Analiza działania aplikacji

## 📁 Struktura projektu

```
src/
├── app/
│   ├── core/                    # Główne serwisy
│   │   ├── auth.service.ts      # Uwierzytelnianie
│   │   ├── appointment.service.ts # Zarządzanie wizytami
│   │   ├── psychologist.service.ts # Zarządzanie psychologami
│   │   ├── auth.guard.ts        # Ochrona tras
│   │   └── role.guard.ts        # Ochrona ról
│   ├── models/                  # Modele danych
│   │   ├── user.model.ts        # Model użytkownika
│   │   ├── appointment.model.ts # Model wizyty
│   │   └── psychologist.model.ts # Model psychologa
│   ├── landing/                 # Strona główna
│   │   └── sections/           # Sekcje landing page
│   ├── shared/                  # Komponenty współdzielone
│   │   ├── navbar/             # Nawigacja
│   │   ├── footer/             # Stopka
│   │   ├── calendar/           # Kalendarz
│   │   └── package-management/ # Zarządzanie pakietami
│   ├── admin/                   # Panel administratora
│   ├── dashboard/               # Dashboard użytkownika
│   ├── contact/                 # Formularz kontaktowy
│   ├── login/                   # Strona logowania
│   └── register/                # Strona rejestracji
├── assets/                      # Zasoby statyczne
│   ├── icons/                  # Ikony
│   ├── reviews/                # Zdjęcia opinii
│   └── specialists/            # Zdjęcia specjalistów
└── environments/               # Konfiguracja środowisk
```

## 🛠️ Instalacja i uruchomienie

### Wymagania
- Node.js (wersja 18+)
- npm lub yarn
- Angular CLI 20+

### Kroki instalacji

1. **Klonowanie repozytorium**
```bash
git clone https://github.com/Logos-Company/Logos---Landing-Page.git
cd Logos---Landing-Page
```

2. **Instalacja zależności**
```bash
npm install
```

3. **Konfiguracja Firebase**
Utwórz plik `src/environments/environment.ts` z konfiguracją Firebase:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... pozostałe klucze
  }
};
```

4. **Uruchomienie serwera deweloperskiego**
```bash
npm start
# lub
ng serve
```

Aplikacja będzie dostępna pod adresem `http://localhost:4200/`

### Dostępne komendy

```bash
# Serwer deweloperski
npm start

# Budowanie projektu
npm run build

# Testy jednostkowe
npm test

# Budowanie w trybie watch
npm run watch
```

## 🚀 Deployment

Projekt jest skonfigurowany do deploymentu na Firebase Hosting:

1. **Instalacja Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Logowanie do Firebase**
```bash
firebase login
```

3. **Budowanie i deployment**
```bash
npm run build
firebase deploy
```

## ⚙️ Konfiguracja

### Firebase Setup
1. Utwórz projekt w Firebase Console
2. Włącz Authentication (Email/Password + Google)
3. Utwórz bazę Firestore
4. Skonfiguruj Hosting
5. Dodaj domenę (opcjonalnie)

### PostHog Analytics
1. Załóż konto w PostHog
2. Dodaj klucze API do `environment.ts`
3. Konfiguruj eventi tracking w komponentach

### Firestore Rules
Zabezpiecz bazę danych używając reguł w `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /customers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📝 Rozwój

### Dodawanie nowych komponentów
```bash
ng generate component nazwa-komponentu
```

### Dodawanie nowych serwisów
```bash
ng generate service core/nazwa-serwisu
```

### Dodawanie nowych modeli
Utwórz pliki w folderze `src/app/models/`

## 🤝 Kontakt

- **Firma**: Logos Company
- **Repozytorium**: [GitHub](https://github.com/Logos-Company/Logos---Landing-Page)
- **Wersja Angular**: 20.0.3
- **Ostatnia aktualizacja**: Sierpień 2025
