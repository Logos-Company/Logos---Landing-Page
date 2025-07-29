import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    login: string;
    isActive: boolean;
    createdAt: Date;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private db = getFirestore(initializeApp(environment.firebase));
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

    constructor(private router: Router) {
        // Check if user is logged in on service initialization
        this.checkStoredUser();
    }

    private checkStoredUser(): void {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                this.currentUserSubject.next(user);
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }
    }

    async login(username: string, password: string, remember: boolean = false): Promise<{ success: boolean; message: string }> {
        try {
            const colRef = collection(this.db, 'customers');
            const q = query(colRef,
                where('login', '==', username),
                where('password', '==', password)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const userData = snapshot.docs[0].data() as User;

                if (remember) {
                    localStorage.setItem('user', JSON.stringify(userData));
                }

                this.currentUserSubject.next(userData);
                return { success: true, message: 'Zalogowano pomyślnie' };
            } else {
                return { success: false, message: 'Nieprawidłowy login lub hasło.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Błąd logowania. Spróbuj później.' };
        }
    }

    async register(userData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        username: string;
        password: string;
    }): Promise<{ success: boolean; message: string }> {
        try {
            // Check if username or email already exists
            const usernameQuery = query(
                collection(this.db, 'customers'),
                where('login', '==', userData.username)
            );
            const emailQuery = query(
                collection(this.db, 'customers'),
                where('email', '==', userData.email)
            );

            const [usernameSnapshot, emailSnapshot] = await Promise.all([
                getDocs(usernameQuery),
                getDocs(emailQuery)
            ]);

            if (!usernameSnapshot.empty) {
                return { success: false, message: 'Login jest już zajęty. Wybierz inny.' };
            }

            if (!emailSnapshot.empty) {
                return { success: false, message: 'Konto z tym adresem email już istnieje.' };
            }

            // Create new user document
            const newUserId = doc(collection(this.db, 'customers')).id;
            const newUser: User = {
                id: newUserId,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone,
                login: userData.username,
                isActive: true,
                createdAt: new Date()
            };

            // Save to Firestore (excluding password in the user object for security)
            await setDoc(doc(this.db, 'customers', newUserId), {
                ...newUser,
                password: userData.password // In production, hash this password!
            });

            return { success: true, message: 'Konto zostało utworzone pomyślnie!' };

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Wystąpił błąd podczas tworzenia konta. Spróbuj ponownie.' };
        }
    }

    logout(): void {
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/home']);
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }
}