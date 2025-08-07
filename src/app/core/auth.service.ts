import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithRedirect, signInWithPopup, getRedirectResult, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, Auth, UserCredential, onAuthStateChanged } from 'firebase/auth';
import { environment } from '../../environments/environment';
import { User, UserRole } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private app = initializeApp(environment.firebase);
    private db = getFirestore(this.app);
    private auth: Auth = getAuth(this.app);
    private googleProvider = new GoogleAuthProvider();
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

    constructor(private router: Router) {
        // Check if user is logged in on service initialization
        this.checkStoredUser();

        // Listen for auth state changes (important for redirect flow)
        onAuthStateChanged(this.auth, async (firebaseUser) => {
            if (firebaseUser && !this.currentUserSubject.value) {
                // User signed in via redirect, get user data from Firestore
                await this.handleFirebaseUser(firebaseUser);
            }
        });

        // Check for redirect result on app load
        this.checkRedirectResult();
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

    private async checkRedirectResult(): Promise<void> {
        try {
            const result = await getRedirectResult(this.auth);
            if (result) {
                await this.handleFirebaseUser(result.user);
                this.router.navigate(['/dashboard']);
            }
        } catch (error) {
            console.error('Redirect result error:', error);
        }
    }

    private async handleFirebaseUser(firebaseUser: any): Promise<void> {
        console.log('=== HANDLING FIREBASE USER ===');
        console.log('Firebase user:', firebaseUser);

        // Check if user exists in Firestore (using 'users' collection)
        const userQuery = query(
            collection(this.db, 'users'),
            where('email', '==', firebaseUser.email)
        );
        const snapshot = await getDocs(userQuery);
        console.log('User query result:', snapshot.size, 'documents');

        let userData: User;

        if (snapshot.empty) {
            console.log('Creating new user in Firestore...');
            // Create new user from Google data
            userData = {
                id: firebaseUser.uid,
                firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
                lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                email: firebaseUser.email || '',
                role: 'user' as UserRole,
                isActive: true,
                canSelectPsychologist: false, // Requires admin approval
                createdAt: new Date(),
                loginMethod: 'google'
            };

            // Save to Firestore in 'users' collection
            await setDoc(doc(this.db, 'users', firebaseUser.uid), userData);
            console.log('New user created in Firestore:', userData);
        } else {
            console.log('User found in Firestore, updating...');
            userData = snapshot.docs[0].data() as User;

            // Update login method if needed
            if (userData.loginMethod !== 'google') {
                userData.loginMethod = 'google';
                await setDoc(doc(this.db, 'users', userData.id), userData, { merge: true });
            }
            console.log('User data loaded:', userData);
        }

        this.currentUserSubject.next(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('User set in currentUserSubject and localStorage');
    }

    async login(email: string, password: string, remember: boolean = false): Promise<{ success: boolean; message: string }> {
        try {
            // Temporary admin backdoor for testing
            if (email === 'admin@logos.pl' && password === 'admin123') {
                const adminUser: User = {
                    id: 'admin-test-id',
                    firstName: 'Admin',
                    lastName: 'System',
                    email: 'admin@logos.pl',
                    role: 'admin' as UserRole,
                    isActive: true,
                    createdAt: new Date(),
                    loginMethod: 'email'
                };

                if (remember) {
                    localStorage.setItem('user', JSON.stringify(adminUser));
                }

                this.currentUserSubject.next(adminUser);
                return { success: true, message: 'Zalogowano jako administrator' };
            }

            // Temporary psychologist backdoor for testing
            if (email === 'psycholog@logos.pl' && password === 'psycholog123') {
                const psychologistUser: User = {
                    id: 'psychologist-test-id',
                    firstName: 'Dr Anna',
                    lastName: 'Kowalska',
                    email: 'psycholog@logos.pl',
                    role: 'psychologist' as UserRole,
                    isActive: true,
                    createdAt: new Date(),
                    loginMethod: 'email',
                    // Psychologist-specific fields
                    specializations: ['Terapia poznawczo-behawioralna', 'Zaburzenia lękowe', 'Depresja'],
                    description: 'Doświadczona psycholog kliniczna specjalizująca się w terapii poznawczo-behawioralnej.',
                    bio: 'Dr Anna Kowalska jest doświadczoną psycholog kliniczną z ponad 10-letnim doświadczeniem w pracy z pacjentami cierpiącymi na zaburzenia lękowe i depresję.',
                    experience: 10,
                    education: 'Doktor psychologii klinicznej, Uniwersytet Warszawski',
                    languages: ['Polski', 'Angielski'],
                    rating: 4.8,
                    reviewCount: 127,
                    hourlyRate: 150,
                    pricePerSession: 150,
                    isAvailable: true,
                    workingHours: {
                        monday: [{ start: '09:00', end: '17:00' }],
                        tuesday: [{ start: '09:00', end: '17:00' }],
                        wednesday: [{ start: '09:00', end: '17:00' }],
                        thursday: [{ start: '09:00', end: '17:00' }],
                        friday: [{ start: '09:00', end: '15:00' }],
                        saturday: [],
                        sunday: []
                    },
                    licenseNumber: 'PSY/2024/001234',
                    verificationStatus: 'verified',
                    sessionsThisMonth: 45,
                    completedSessions: 850,
                    totalRevenue: 127500,
                    premiumListing: true,
                    premiumListingExpiry: new Date(2025, 11, 31) // December 31, 2025
                };

                if (remember) {
                    localStorage.setItem('user', JSON.stringify(psychologistUser));
                }

                this.currentUserSubject.next(psychologistUser);
                return { success: true, message: 'Zalogowano jako psycholog' };
            }

            // Temporary moderator backdoor for testing
            if (email === 'moderator@logos.pl' && password === 'moderator123') {
                const moderatorUser: User = {
                    id: 'moderator-test-id',
                    firstName: 'Katarzyna',
                    lastName: 'Nowak',
                    email: 'moderator@logos.pl',
                    role: 'moderator' as UserRole,
                    isActive: true,
                    createdAt: new Date(),
                    loginMethod: 'email',
                    // Moderator-specific fields
                    permissions: ['moderate_reviews', 'block_users', 'approve_psychologists', 'view_reports'],
                    isOnline: true,
                    lastActivity: new Date(),
                    moderatedToday: 15,
                    performanceScore: 94
                };

                if (remember) {
                    localStorage.setItem('user', JSON.stringify(moderatorUser));
                }

                this.currentUserSubject.next(moderatorUser);
                return { success: true, message: 'Zalogowano jako moderator' };
            }

            // Temporary user backdoor for testing
            if (email === 'user@logos.pl' && password === 'user123') {
                const testUser: User = {
                    id: 'user-test-id',
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    email: 'user@logos.pl',
                    role: 'user' as UserRole,
                    isActive: true,
                    createdAt: new Date(),
                    loginMethod: 'email',
                    // User-specific fields
                    assignedPsychologistId: 'psychologist-test-id',
                    assignmentStatus: 'approved',
                    assignmentApprovedAt: new Date(),
                    activePackageId: 'package-standard',
                    packageStatus: 'active',
                    sessionsUsed: 3,
                    totalSessions: 8,
                    profileData: {
                        city: 'Warszawa',
                        preferences: {
                            sessionType: 'online',
                            language: 'pl',
                            gender: 'no-preference',
                            specialization: ['anxiety', 'depression']
                        },
                        goals: 'Chcę nauczyć się radzić sobie ze stresem i poprawić jakość snu.'
                    }
                };

                if (remember) {
                    localStorage.setItem('user', JSON.stringify(testUser));
                }

                this.currentUserSubject.next(testUser);
                return { success: true, message: 'Zalogowano jako użytkownik' };
            }

            // Try Firebase Authentication first
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            const firebaseUser = userCredential.user;

            // Get additional user data from Firestore
            const userQuery = query(
                collection(this.db, 'users'),
                where('email', '==', email)
            );
            const snapshot = await getDocs(userQuery);

            if (!snapshot.empty) {
                const userData = snapshot.docs[0].data() as User;

                if (remember) {
                    localStorage.setItem('user', JSON.stringify(userData));
                }

                this.currentUserSubject.next(userData);
                return { success: true, message: 'Zalogowano pomyślnie' };
            } else {
                // User exists in Firebase Auth but not in Firestore
                return { success: false, message: 'Dane użytkownika nie zostały znalezione.' };
            }
        } catch (error: any) {
            console.error('Login error:', error);

            // Handle specific Firebase Auth errors
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/invalid-email':
                case 'auth/wrong-password':
                    return { success: false, message: 'Nieprawidłowy email lub hasło.' };
                case 'auth/user-disabled':
                    return { success: false, message: 'Konto zostało zablokowane.' };
                case 'auth/too-many-requests':
                    return { success: false, message: 'Zbyt wiele prób logowania. Spróbuj później.' };
                default:
                    return { success: false, message: 'Błąd logowania. Spróbuj później.' };
            }
        }
    }

    async register(userData: {
        firstName: string;
        lastName: string;
        email: string;
        phone?: string;
        password: string;
    }): Promise<{ success: boolean; message: string }> {
        try {
            // Check if email already exists in Firestore
            const emailQuery = query(
                collection(this.db, 'users'),
                where('email', '==', userData.email)
            );
            const emailSnapshot = await getDocs(emailQuery);

            if (!emailSnapshot.empty) {
                return { success: false, message: 'Konto z tym adresem email już istnieje.' };
            }

            // Create Firebase Auth account
            const userCredential = await createUserWithEmailAndPassword(this.auth, userData.email, userData.password);
            const firebaseUser = userCredential.user;

            // Create new user document in Firestore
            const newUser: User = {
                id: firebaseUser.uid,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone,
                role: 'user' as UserRole,
                isActive: true,
                canSelectPsychologist: false, // Requires admin approval
                createdAt: new Date(),
                loginMethod: 'email'
            };

            // Save to Firestore
            await setDoc(doc(this.db, 'users', firebaseUser.uid), newUser);

            return { success: true, message: 'Konto zostało utworzone pomyślnie!' };

        } catch (error: any) {
            console.error('Registration error:', error);

            // Handle specific Firebase Auth errors
            switch (error.code) {
                case 'auth/email-already-in-use':
                    return { success: false, message: 'Konto z tym adresem email już istnieje.' };
                case 'auth/invalid-email':
                    return { success: false, message: 'Nieprawidłowy adres email.' };
                case 'auth/weak-password':
                    return { success: false, message: 'Hasło jest zbyt słabe. Użyj co najmniej 6 znaków.' };
                default:
                    return { success: false, message: 'Wystąpił błąd podczas tworzenia konta. Spróbuj ponownie.' };
            }
        }
    }

    async loginWithGoogle(): Promise<{ success: boolean; message: string }> {
        try {
            this.googleProvider.setCustomParameters({
                prompt: 'select_account'
            });

            // Try popup first, fallback to redirect if it fails
            try {
                const result = await signInWithPopup(this.auth, this.googleProvider);
                const firebaseUser = result.user;
                await this.handleFirebaseUser(firebaseUser);
                return { success: true, message: 'Zalogowano pomyślnie przez Google' };
            } catch (popupError: any) {
                console.log('Popup failed, trying redirect:', popupError);

                // Fallback to redirect if popup fails
                if (popupError.code === 'auth/popup-blocked' ||
                    popupError.code === 'auth/popup-closed-by-user' ||
                    popupError.message?.includes('Cross-Origin-Opener-Policy')) {

                    await signInWithRedirect(this.auth, this.googleProvider);
                    // The result will be handled in checkRedirectResult()
                    return { success: true, message: 'Przekierowywanie do Google...' };
                } else {
                    throw popupError;
                }
            }

        } catch (error: any) {
            console.error('Google login error:', error);

            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    return { success: false, message: 'Logowanie zostało anulowane.' };
                case 'auth/popup-blocked':
                    return { success: false, message: 'Popup został zablokowany. Przekierowywanie...' };
                case 'auth/missing-or-insufficient-permissions':
                    return { success: false, message: 'Brak uprawnień. Sprawdź konfigurację Firebase.' };
                default:
                    return { success: false, message: 'Błąd logowania przez Google. Spróbuj później.' };
            }
        }
    }

    logout(): void {
        this.auth.signOut();
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/']);
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    hasRole(role: UserRole): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    hasAnyRole(roles: UserRole[]): boolean {
        const user = this.getCurrentUser();
        return user ? roles.includes(user.role) : false;
    }

    isAdmin(): boolean {
        return this.hasRole('admin');
    }

    isModerator(): boolean {
        return this.hasRole('moderator');
    }

    isPsychologist(): boolean {
        return this.hasRole('psychologist');
    }

    isUser(): boolean {
        return this.hasRole('user');
    }

    canManageUsers(): boolean {
        return this.hasAnyRole(['admin', 'moderator']);
    }

    canManagePsychologists(): boolean {
        return this.hasAnyRole(['admin', 'moderator']);
    }

    redirectToDashboard(user: User): string {
        switch (user.role) {
            case 'admin':
                return '/admin-dashboard';
            case 'moderator':
                return '/moderator-dashboard';
            case 'psychologist':
                return '/psychologist-dashboard';
            case 'user':
            default:
                return '/dashboard';
        }
    }

    // Admin method to get all users from Firestore
    async getAllUsers(): Promise<User[]> {
        try {
            const usersCollection = collection(this.db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const users: User[] = [];

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                users.push({
                    id: doc.id,
                    firstName: userData['firstName'] || '',
                    lastName: userData['lastName'] || '',
                    email: userData['email'] || '',
                    role: userData['role'] || 'user',
                    isActive: userData['isActive'] !== undefined ? userData['isActive'] : true,
                    createdAt: userData['createdAt'] ? userData['createdAt'].toDate() : new Date(),
                    loginMethod: userData['loginMethod'] || 'email'
                });
            });

            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }
}