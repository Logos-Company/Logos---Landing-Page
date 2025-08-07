# Instrukcja ustawiania roli psychologa

## ✨ NAJŁATWIEJSZY SPOSÓB - Funkcja testowa w panelu użytkownika

1. **Zaloguj się na swoje konto użytkownika**
2. **Przejdź do panelu użytkownika** (`/dashboard`)
3. **W prawym górnym rogu znajdziesz przycisk 👨‍⚕️**
4. **Kliknij przycisk i potwierdź** 
5. **System automatycznie:**
   - Zmieni Twoją rolę na psychologa
   - Doda dane psychologa (specjalizacje, godziny pracy, etc.)
   - Przekieruje Cię do panelu psychologa

**To jest funkcja testowa - użyj jej do szybkiej zmiany roli podczas testowania!**

---

## Inne sposoby ustawienia roli psychologa

### Opcja 1: Bezpośrednia zmiana w Firebase Console

1. **Przejdź do Firebase Console:**
   - Otwórz [Firebase Console](https://console.firebase.google.com)
   - Wybierz swój projekt Logos

2. **Znajdź swoją kolekcję użytkowników:**
   - Przejdź do sekcji "Firestore Database"
   - Znajdź kolekcję `users`
   - Znajdź dokument ze swoim kontem (wyszukaj po emailu)

3. **Zmień rolę:**
   - Otwórz dokument swojego użytkownika
   - Znajdź pole `role`
   - Zmień wartość z `"user"` na `"psychologist"`
   - Zapisz zmiany

4. **Dodaj dane psychologa (opcjonalne):**
   ```javascript
   {
     role: "psychologist",
     specializations: ["Zaburzenia lękowe", "Depresja", "CBT"],
     description: "Doświadczony psycholog specjalizujący się w terapii poznawczo-behawioralnej",
     experience: 5,
     education: "Magister Psychologii, specjalizacja psychologia kliniczna",
     languages: ["Polski", "Angielski"],
     hourlyRate: 150,
     isAvailable: true,
     workingHours: {
       monday: [{start: "09:00", end: "17:00"}],
       tuesday: [{start: "09:00", end: "17:00"}],
       wednesday: [{start: "09:00", end: "17:00"}],
       thursday: [{start: "09:00", end: "17:00"}],
       friday: [{start: "09:00", end: "15:00"}]
     }
   }
   ```

### Opcja 2: Funkcja testowa w konsoli przeglądarki

Jeśli chcesz szybko przełączać role podczas testów, możesz dodać funkcję testową.

1. **Zaloguj się na swoje konto**
2. **Otwórz konsolę przeglądarki** (F12 -> Console)
3. **Uruchom funkcję testową** (jeśli zostanie dodana)

### Opcja 3: Panel administratora (gdy będzie dostępny)

Gdy panel administratora będzie gotowy, administrator będzie mógł:
- Zmieniać role użytkowników
- Zatwierdzać wnioski o zostanie psychologiem
- Zarządzać uprawnieniami

## Dostępne role w systemie

- `"user"` - Zwykły użytkownik (domyślna rola)
- `"psychologist"` - Psycholog
- `"moderator"` - Moderator
- `"admin"` - Administrator

## Po zmianie roli na psychologa

1. **Wyloguj się i zaloguj ponownie**
2. **System automatycznie przekieruje Cię do panelu psychologa**
3. **Adres panelu:** `/psychologist-dashboard`

## Funkcje dostępne dla psychologa

### Panel główny:
- ✅ **Przegląd** - Statystyki i dzisiejsze wizyty
- ✅ **Wizyty** - Zarządzanie wszystkimi wizytami
- ✅ **Pacjenci** - Lista przypisanych pacjentów
- ✅ **Notatki** - Notatki z sesji
- ✅ **Kalendarz** - Widok kalendarzowy wizyt
- ✅ **Statystyki** - Szczegółowe statystyki

### Zarządzanie pacjentami:
- ✅ Przeglądanie listy przypisanych pacjentów
- ✅ Dodawanie notatek z sesji
- ✅ Usuwanie pacjentów z listy
- ✅ Przeglądanie historii sesji

### Zarządzanie wizytami:
- ✅ Tworzenie nowych wizyt
- ✅ Anulowanie wizyt
- ✅ Rozpoczynanie/kończenie sesji
- ✅ Dodawanie notatek do wizyt

### Połączenia z Firebase:
- ✅ Wszystkie funkcje są podłączone do Firebase
- ✅ Dane w czasie rzeczywistym
- ✅ Automatyczne zapisywanie
- ✅ Powiadomienia i logi

## Rozwiązywanie problemów

### Problem: Nie widzę panelu psychologa
**Rozwiązanie:**
1. Sprawdź czy rola została prawidłowo ustawiona
2. Wyloguj się i zaloguj ponownie
3. Sprawdź konsolę przeglądarki pod kątem błędów

### Problem: Brak danych w panelu
**Rozwiązanie:**
1. Sprawdź połączenie z internetem
2. Sprawdź konsolę przeglądarki pod kątem błędów Firebase
3. Upewnij się, że Firebase jest prawidłowo skonfigurowane

### Problem: Nie mogę dodać notatki
**Rozwiązanie:**
1. Sprawdź czy masz przypisanych pacjentów
2. Sprawdź uprawnienia w Firebase Rules
3. Sprawdź czy wszystkie wymagane pola są wypełnione

## Kontakt

Jeśli masz problemy z ustawieniem roli psychologa, skontaktuj się z administratorem systemu.
