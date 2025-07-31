import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    orderBy
} from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Package } from '../models/user.model';
import { Observable, BehaviorSubject } from 'rxjs';

export interface UserPackage {
    id: string;
    userId: string;
    packageId: string;
    purchaseDate: Date;
    expiryDate: Date;
    status: 'active' | 'inactive' | 'credit' | 'paid';
    sessionsUsed: number;
    sessionsRemaining: number;
    totalSessions: number;
    creditBalance?: number;
    monthlyPayment?: number;
    nextPaymentDate?: Date;
    isOnCredit: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class PackageService {
    private app = initializeApp(environment.firebase);
    private db = getFirestore(this.app);

    private packagesSubject = new BehaviorSubject<Package[]>([]);
    public packages$ = this.packagesSubject.asObservable();

    constructor() {
        this.loadPackages();
    }

    private async loadPackages(): Promise<void> {
        try {
            const q = query(
                collection(this.db, 'packages'),
                where('isActive', '==', true),
                orderBy('price', 'asc')
            );
            const snapshot = await getDocs(q);
            const packages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Package[];

            this.packagesSubject.next(packages);
        } catch (error) {
            console.error('Error loading packages:', error);
        }
    }

    async getAllPackages(): Promise<Package[]> {
        try {
            const q = query(
                collection(this.db, 'packages'),
                where('isActive', '==', true),
                orderBy('price', 'asc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Package[];
        } catch (error) {
            console.error('Error fetching packages:', error);
            return [];
        }
    }

    async getPackageById(id: string): Promise<Package | null> {
        try {
            const docRef = doc(this.db, 'packages', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Package;
            }
            return null;
        } catch (error) {
            console.error('Error fetching package:', error);
            return null;
        }
    }

    // Alias for backward compatibility
    async getPackage(id: string): Promise<Package | null> {
        return this.getPackageById(id);
    }

    async createPackage(packageData: Omit<Package, 'id'>): Promise<string> {
        try {
            const docRef = doc(collection(this.db, 'packages'));
            await setDoc(docRef, {
                ...packageData,
                createdAt: new Date(),
                isActive: true
            });
            await this.loadPackages(); // Refresh packages
            return docRef.id;
        } catch (error) {
            console.error('Error creating package:', error);
            throw error;
        }
    }

    async updatePackage(id: string, updates: Partial<Package>): Promise<void> {
        try {
            const docRef = doc(this.db, 'packages', id);
            await updateDoc(docRef, updates);
            await this.loadPackages(); // Refresh packages
        } catch (error) {
            console.error('Error updating package:', error);
            throw error;
        }
    }

    async purchasePackage(
        userId: string,
        packageId: string,
        paymentMethod: 'full' | 'credit'
    ): Promise<UserPackage> {
        try {
            const packageData = await this.getPackageById(packageId);
            if (!packageData) {
                throw new Error('Package not found');
            }

            const userPackage: UserPackage = {
                id: '',
                userId,
                packageId,
                purchaseDate: new Date(),
                expiryDate: new Date(Date.now() + packageData.duration * 24 * 60 * 60 * 1000),
                status: paymentMethod === 'credit' ? 'credit' : 'paid',
                sessionsUsed: 0,
                sessionsRemaining: packageData.sessionsCount,
                totalSessions: packageData.sessionsCount,
                isOnCredit: paymentMethod === 'credit'
            };

            if (paymentMethod === 'credit') {
                userPackage.creditBalance = packageData.price;
                userPackage.monthlyPayment = Math.ceil(packageData.price / 12); // 12 month payment plan
                userPackage.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Next month
            }

            const docRef = doc(collection(this.db, 'user-packages'));
            userPackage.id = docRef.id;
            await setDoc(docRef, userPackage);

            // Update user's package info
            await updateDoc(doc(this.db, 'customers', userId), {
                packageId: packageId,
                packagePurchaseDate: userPackage.purchaseDate,
                packageStatus: userPackage.status,
                creditBalance: userPackage.creditBalance || 0,
                sessionsUsed: 0,
                totalSessions: packageData.sessionsCount
            });

            return userPackage;
        } catch (error) {
            console.error('Error purchasing package:', error);
            throw error;
        }
    }

    async getUserPackage(userId: string): Promise<UserPackage | null> {
        try {
            const q = query(
                collection(this.db, 'user-packages'),
                where('userId', '==', userId),
                where('status', 'in', ['active', 'credit'])
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return {
                    id: doc.id,
                    ...doc.data()
                } as UserPackage;
            }
            return null;
        } catch (error) {
            console.error('Error fetching user package:', error);
            return null;
        }
    }

    async saveUserPackage(userPackage: UserPackage): Promise<void> {
        try {
            const docRef = doc(this.db, 'user-packages', userPackage.id);
            await setDoc(docRef, {
                userId: userPackage.userId,
                packageId: userPackage.packageId,
                status: userPackage.status,
                totalSessions: userPackage.totalSessions,
                sessionsRemaining: userPackage.sessionsRemaining,
                sessionsUsed: userPackage.sessionsUsed,
                purchaseDate: userPackage.purchaseDate,
                expiryDate: userPackage.expiryDate,
                isOnCredit: userPackage.isOnCredit,
                ...(userPackage.creditBalance && { creditBalance: userPackage.creditBalance }),
                ...(userPackage.monthlyPayment && { monthlyPayment: userPackage.monthlyPayment }),
                ...(userPackage.nextPaymentDate && { nextPaymentDate: userPackage.nextPaymentDate })
            });
        } catch (error) {
            console.error('Error saving user package:', error);
            throw error;
        }
    }

    async useSession(userId: string): Promise<boolean> {
        try {
            const userPackage = await this.getUserPackage(userId);
            if (!userPackage) {
                throw new Error('No active package found');
            }

            if (userPackage.sessionsRemaining <= 0) {
                throw new Error('No sessions remaining');
            }

            const updatedSessions = {
                sessionsUsed: userPackage.sessionsUsed + 1,
                sessionsRemaining: userPackage.sessionsRemaining - 1
            };

            // Update user package
            await updateDoc(doc(this.db, 'user-packages', userPackage.id), updatedSessions);

            // Update user document
            await updateDoc(doc(this.db, 'customers', userId), {
                sessionsUsed: updatedSessions.sessionsUsed
            });

            return true;
        } catch (error) {
            console.error('Error using session:', error);
            return false;
        }
    }

    async processMonthlyPayment(userId: string, amount: number): Promise<boolean> {
        try {
            const userPackage = await this.getUserPackage(userId);
            if (!userPackage || !userPackage.isOnCredit) {
                throw new Error('No credit package found');
            }

            const newCreditBalance = (userPackage.creditBalance || 0) - amount;
            const nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            const updates: any = {
                creditBalance: Math.max(0, newCreditBalance),
                nextPaymentDate: nextPaymentDate
            };

            // If credit is fully paid, mark as paid
            if (newCreditBalance <= 0) {
                updates.status = 'paid';
                updates.isOnCredit = false;
                updates.creditBalance = 0;
            }

            await updateDoc(doc(this.db, 'user-packages', userPackage.id), updates);

            // Update user document
            await updateDoc(doc(this.db, 'customers', userId), {
                creditBalance: updates.creditBalance,
                packageStatus: updates.status || userPackage.status
            });

            return true;
        } catch (error) {
            console.error('Error processing monthly payment:', error);
            return false;
        }
    }

    async getDefaultPackages(): Promise<Package[]> {
        // Create 3 default packages if they don't exist
        const defaultPackages = [
            {
                name: 'Pakiet Podstawowy',
                description: 'Idealny na start - 4 sesje z psychologiem',
                sessionsCount: 4,
                price: 400,
                duration: 60, // 2 months
                features: [
                    '4 sesje indywidualne',
                    'Dostęp do kalendarza',
                    'Wiadomości z psychologiem',
                    'Notatki sesji'
                ]
            },
            {
                name: 'Pakiet Standard',
                description: 'Najczęściej wybierany - 8 sesji z psychologiem',
                sessionsCount: 8,
                price: 720,
                duration: 120, // 4 months
                features: [
                    '8 sesji indywidualnych',
                    'Dostęp do kalendarza',
                    'Wiadomości z psychologiem',
                    'Notatki sesji',
                    'Materiały edukacyjne'
                ]
            },
            {
                name: 'Pakiet Premium',
                description: 'Kompletna terapia - 12 sesji z psychologiem',
                sessionsCount: 12,
                price: 1000,
                duration: 180, // 6 months
                features: [
                    '12 sesji indywidualnych',
                    'Dostęp do kalendarza',
                    'Wiadomości z psychologiem',
                    'Notatki sesji',
                    'Materiały edukacyjne',
                    'Priorytetowe wsparcie',
                    'Dodatowe sesje kryzysowe'
                ]
            }
        ];

        try {
            const existingPackages = await this.getAllPackages();

            if (existingPackages.length === 0) {
                // Create default packages
                for (const packageData of defaultPackages) {
                    await this.createPackage({
                        ...packageData,
                        isActive: true,
                        createdAt: new Date()
                    });
                }
                return await this.getAllPackages();
            }

            return existingPackages;
        } catch (error) {
            console.error('Error getting default packages:', error);
            return [];
        }
    }
}
