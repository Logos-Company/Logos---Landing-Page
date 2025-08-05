# Konta testowe do logowania

## Dostępne konta testowe:

### 1. Administrator
- **Email:** `admin@logos.pl`
- **Hasło:** `admin123`
- **Opis:** Pełne uprawnienia administratora
- **Dashboard:** `/admin-dashboard`

### 2. Psycholog
- **Email:** `psycholog@logos.pl` 
- **Hasło:** `psycholog123`
- **Opis:** Dr Anna Kowalska - doświadczona psycholog kliniczna
- **Specjalizacje:** Terapia poznawczo-behawioralna, Zaburzenia lękowe, Depresja
- **Dashboard:** `/psychologist-dashboard`
- **Funkcje:**
  - Kalendarz i zarządzanie wizytami
  - Tworzenie notatek dla pacjentów
  - Statystyki (850 sesji, rating 4.8/5)
  - Premium listing aktywny do 31.12.2025

### 3. Moderator
- **Email:** `moderator@logos.pl`
- **Hasło:** `moderator123`
- **Opis:** Katarzyna Nowak - moderator platformy
- **Dashboard:** `/moderator-dashboard`
- **Uprawnienia:**
  - Moderowanie opinii
  - Blokowanie użytkowników
  - Zatwierdzanie psychologów
  - Przeglądanie raportów

### 4. Zwykły użytkownik
- **Email:** `user@logos.pl`
- **Hasło:** `user123`
- **Opis:** Jan Kowalski - testowy pacjent
- **Dashboard:** `/dashboard`
- **Status:** 
  - Przypisany do psychologa (Dr Anna Kowalska)
  - Pakiet standardowy (3/8 sesji wykorzystane)
  - Zatwierdzony przez administratora

## Jak się zalogować:

1. Przejdź na stronę logowania: `/login`
2. Wpisz odpowiedni email i hasło z powyższej listy
3. Kliknij "Zaloguj się"
4. Zostaniesz automatycznie przekierowany do odpowiedniego dashboardu

## Funkcjonalności do testowania:

### Panel użytkownika:
- ✅ Możliwość wyboru psychologa (wymaga zatwierdzenia przez admina)
- ✅ Przeglądanie listy psychologów
- ✅ Własny kalendarz wizyt
- ✅ Przeglądanie notatek zostawionych przez psychologa
- ✅ Edycja profilu i danych osobowych
- ✅ Wystawianie opinii psychologowi
- ✅ Możliwość zmiany psychologa w trakcie sesji

### Panel psychologa:
- ✅ Kalendarz z wizytami
- ✅ Tworzenie notatek do rozmów
- ✅ Umawianie wizyt w kalendarzu
- ✅ Statystyki (klienci, przychody, etc.)
- ✅ Możliwość usunięcia klienta lub odwołania sesji
- ✅ Edycja profilu
- ✅ Zakup lepszego pozycjonowania na liście (premium listing)

### Panel administratora:
- ✅ Zatwierdzanie przypisań użytkowników do psychologów
- ✅ Zarządzanie wszystkimi użytkownikami
- ✅ Moderowanie opinii
- ✅ Statystyki systemu

## Uwagi:
- Konta testowe działają tylko w trybie development
- Dane są przechowywane lokalnie w localStorage
- Po wylogowaniu dane testowe są usuwane
